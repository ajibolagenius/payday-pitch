-- Tactics board (spec 0008). Three additive changes on the schema spec 0004
-- already shipped: a soft delete column so a played match keeps its tactic
-- reference, one view for emergency fund progress, and play_match recreated
-- with a tactic branch. The recreate is a drop plus create because a new
-- argument changes the signature, so the owner, definer, search_path and
-- grants the original carried are restated in this file line for line.

-- 1. Soft delete. Head rows are never removed, so match.tactic_id (RESTRICT)
-- and the source pairing check keep holding. Every read of the tactic list
-- filters `deleted_at is null`, the cap count included. The shipped
-- unique (user_id, name) is a plain table constraint, so a deleted tactic
-- keeps its name reserved; the board copy says so.
alter table public.user_tactic add column deleted_at timestamptz;

comment on column public.user_tactic.deleted_at is
  'Soft delete (spec 0008 AC-10). Null means live. Versions stay so a match '
  'played from this tactic keeps rendering its own pinned plan.';

-- 2. Emergency fund progress: what the goalkeeper spots have actually taken in
-- across the active matches, one row per user. Spec 0004's definition, not a
-- new one. The denominator is deliberately absent: the domain reads the last
-- active match's frozen DEF planned total, so history never chases today's
-- rent. Built exactly like the shipped debt_progress and goal_progress views.
create view public.gk_fund_progress with (security_invoker = true) as
select
  m.user_id as user_id,
  coalesce(sum(ml.actual_minor), 0)::bigint as gk_saved_minor
from public.match_line ml
join public.match m on m.id = ml.match_id
where m.status = 'active' and ml.role = 'GK'
group by m.user_id;

revoke all on public.gk_fund_progress from anon, authenticated, public;
grant select on public.gk_fund_progress to authenticated;

comment on view public.gk_fund_progress is
  'Goalkeeper actuals per user over active matches (spec 0008 AC-6). '
  'Security invoker, so row level security decides who sees which row.';

-- 3. play_match, recreated. The library branch is unchanged apart from a spot
-- count that now comes from the data instead of the hardcoded twelve. A second
-- argument, p_tactic_version_id, routes the write to the tactic branch: the
-- version is resolved through its own head, checked against auth.uid(),
-- against deleted_at, and against is_current, and the split comes from the
-- pinned JSONB instead of formation_position. Exactly one source argument is
-- set, never both and never neither. All three arguments default to null, so a
-- generated client can leave out the source it is not using, and a missing
-- payload is answered with a code rather than a database error.
drop function public.play_match(bigint, jsonb);

create function public.play_match(
  p_shape_id bigint default null,
  p_lines jsonb default null,
  p_tactic_version_id bigint default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_shape public.formation_shape%rowtype;
  v_tactic public.user_tactic%rowtype;
  v_version public.user_tactic_version%rowtype;
  v_currency char(3);
  v_income bigint;
  v_costs bigint;
  v_bad_income int;
  v_bad_costs int;
  v_def_bps bigint;
  v_share bigint;
  v_bps_sum bigint;
  v_line_count int;
  v_spot_count int;
  v_planned_sum bigint;
  v_def_planned bigint;
  v_negative int;
  v_wrong_line_currency int;
  v_expected_spots int;
  v_tampered int := 0;
  v_split jsonb;
  v_period date;
  v_old_id bigint;
  v_lines jsonb;
  v_match_id bigint;
  v_from_tactic boolean := (p_tactic_version_id is not null);
begin
  if v_uid is null then
    return '{"code": "session_expired"}'::jsonb;
  end if;

  -- One source per call. A client that sends both, or neither, is answered
  -- with a code rather than left to resolve against a null id.
  if (p_shape_id is null) = (p_tactic_version_id is null) then
    return '{"code": "validation", "message": "Play one shape or one tactic."}'::jsonb;
  end if;

  if not v_from_tactic then
    select * into v_shape
    from public.formation_shape
    where id = p_shape_id;
    if not found then
      return '{"code": "shape_not_found"}'::jsonb;
    end if;
    if v_shape.deprecated then
      return '{"code": "shape_deprecated"}'::jsonb;
    end if;
    -- The spot count and the defense zone, from the shape's own rows.
    select count(*),
      coalesce(sum(basis_points) filter (where role = 'DEF'), 0)
    into v_expected_spots, v_def_bps
    from public.formation_position
    where shape_id = p_shape_id;
  else
    select * into v_version
    from public.user_tactic_version
    where id = p_tactic_version_id;
    if not found then
      return '{"code": "not_found"}'::jsonb;
    end if;
    select * into v_tactic
    from public.user_tactic
    where id = v_version.tactic_id;
    -- Ownership and life first, and never a hint about someone else's row: a
    -- version id you do not own, or one whose tactic is deleted, is not_found.
    if v_tactic is null or v_tactic.user_id <> v_uid then
      return '{"code": "not_found"}'::jsonb;
    end if;
    if v_tactic.deleted_at is not null then
      return '{"code": "not_found"}'::jsonb;
    end if;
    -- The tactic changed under the open board: a second save moved is_current
    -- before this call resolved. Their own tactic, so naming the reason is not
    -- a leak, and it tells them to reload rather than to look for a missing one.
    if not v_version.is_current then
      return jsonb_build_object(
        'code', 'tactic_stale',
        'message', 'This tactic changed while you were editing. Reload the board.'
      );
    end if;
    select count(*),
      coalesce(sum((s.obj ->> 'basis_points')::int)
        filter (where s.obj ->> 'role' = 'DEF'), 0)
    into v_expected_spots, v_def_bps
    from jsonb_array_elements(v_version.split) as s(obj);
    v_split := v_version.split;
  end if;

  -- The shape of the payload, before any cast: a hand written call is answered
  -- with a code, never with a database error.
  if coalesce(jsonb_typeof(p_lines), 'null') <> 'array' then
    return jsonb_build_object(
      'code', 'validation',
      'message', 'A match needs one line for each of ' ||
        case when v_expected_spots = 12 then 'the twelve'
             else v_expected_spots::text end || ' spots.'
    );
  end if;

  -- One match, one currency, taken from the stored preference (spec 0004).
  v_currency := coalesce(
    (select default_currency from public.profile where user_id = v_uid),
    'NGN'::char(3)
  );

  select coalesce(sum(amount_minor), 0),
    count(*) filter (where currency is distinct from v_currency)
  into v_income, v_bad_income
  from public.income_stream
  where user_id = v_uid;
  if v_income = 0 then
    return '{"code": "no_income"}'::jsonb;
  end if;

  select coalesce(sum(amount_minor), 0),
    count(*) filter (where currency is distinct from v_currency)
  into v_costs, v_bad_costs
  from public.fixed_cost
  where user_id = v_uid;
  if v_bad_income > 0 or v_bad_costs > 0 then
    return '{"code": "mixed_currency"}'::jsonb;
  end if;

  select count(*), count(distinct spot_index),
    coalesce(sum(basis_points), 0),
    coalesce(sum(planned_minor), 0),
    coalesce(sum(planned_minor) filter (where role = 'DEF'), 0),
    count(*) filter (where planned_minor < 0),
    count(*) filter (where currency::char(3) is distinct from v_currency)
  into v_line_count, v_spot_count, v_bps_sum, v_planned_sum, v_def_planned,
    v_negative, v_wrong_line_currency
  from jsonb_to_recordset(p_lines)
    as line(role text, spot_index int, label text, basis_points int,
            planned_minor bigint, actual_minor bigint, currency text);
  if v_line_count <> v_expected_spots or v_spot_count <> v_expected_spots then
    return jsonb_build_object(
      'code', 'validation',
      'message', 'A match needs one line for each of ' ||
        case when v_expected_spots = 12 then 'the twelve'
             else v_expected_spots::text end || ' spots.'
    );
  end if;
  if v_negative > 0 then
    return '{"code": "validation", "message": "Planned amounts cannot be negative."}'::jsonb;
  end if;
  if v_wrong_line_currency > 0 then
    return '{"code": "mixed_currency"}'::jsonb;
  end if;

  -- The tamper check, one branch per source: the library compares against
  -- formation_position as shipped, the tactic compares against the pinned
  -- version's split. A payload cannot write a snapshot its source never had.
  if v_from_tactic then
    select count(*) into v_tampered
    from jsonb_to_recordset(p_lines)
      as line(role text, spot_index int, basis_points int, label text)
    where not exists (
      select 1
      from jsonb_array_elements(v_split) as s(obj)
      where s.obj ->> 'role' = line.role
        and (s.obj ->> 'spot_index')::int = line.spot_index
        and (s.obj ->> 'basis_points')::int = line.basis_points
        and s.obj ->> 'label' = line.label
    );
  else
    select count(*) into v_tampered
    from jsonb_to_recordset(p_lines)
      as line(role text, spot_index int, basis_points int, label text)
    where not exists (
      select 1 from public.formation_position fp
      where fp.shape_id = p_shape_id
        and fp.spot_index = line.spot_index
        and fp.role = line.role
        and fp.basis_points = line.basis_points
        and fp.label = line.label
    );
  end if;

  -- Invariant re-checks against the freshly re-read truth (never a recompute
  -- of the split): the sums, the defense total, and source agreement.
  if v_bps_sum <> 10000
    or v_planned_sum <> v_income
    or v_def_planned <> v_costs
    or v_tampered > 0
  then
    return '{"code": "validation", "message": "Your numbers changed. Reload the pitch and play again."}'::jsonb;
  end if;

  -- The defense floor: the zone's share of income, integer math.
  v_share := v_income * v_def_bps / 10000;
  if v_costs > v_share then
    return jsonb_build_object(
      'code', 'unable_to_cover',
      'shortfall_minor', v_costs - v_share
    );
  end if;

  v_period := date_trunc('month', timezone('Africa/Lagos', now()))::date;

  -- Correction: retire the period's active match. For each new line the
  -- actual is, in order: what this call entered, else what the old line at
  -- the same slot key (role plus position within the role, ordered by spot
  -- index) recorded, else empty for review.
  v_lines := p_lines;
  select id into v_old_id
  from public.match
  where user_id = v_uid and period = v_period and status = 'active';
  if v_old_id is not null then
    v_lines := (
      with old_lines as (
        select ml.role,
          row_number() over (
            partition by ml.role order by ml.spot_index
          ) as slot_key,
          ml.actual_minor
        from public.match_line ml
        where ml.match_id = v_old_id
      ),
      new_lines as (
        select l.obj,
          row_number() over (
            partition by l.obj ->> 'role'
            order by (l.obj ->> 'spot_index')::int
          ) as slot_key
        from jsonb_array_elements(v_lines) as l(obj)
      )
      select jsonb_agg(
        jsonb_set(
          n.obj, '{actual_minor}',
          coalesce(
            nullif(n.obj -> 'actual_minor', 'null'::jsonb),
            coalesce(to_jsonb(o.actual_minor), 'null'::jsonb)
          )
        )
        order by (n.obj ->> 'spot_index')::int
      )
      from new_lines n
      left join old_lines o
        on o.role = n.obj ->> 'role' and o.slot_key = n.slot_key
    );

    update public.match
    set status = 'superseded'
    where id = v_old_id;
  end if;

  -- The source pair the match table's check constraint demands: library fills
  -- the shape columns, tactic fills the version columns, never both. A tactic
  -- keeps its base shape name so the pitch can render it.
  if v_from_tactic then
    insert into public.match (
      user_id, period, status, source_kind, currency,
      tactic_id, tactic_version_id, shape_name
    ) values (
      v_uid, v_period, 'active', 'tactic', v_currency,
      v_tactic.id, v_version.id, coalesce(v_tactic.shape_name, v_tactic.name)
    )
    returning id into v_match_id;
  else
    insert into public.match (
      user_id, period, status, source_kind, currency,
      library_id, library_name, shape_name
    ) values (
      v_uid, v_period, 'active', 'library', v_currency,
      v_shape.id, v_shape.name, v_shape.name
    )
    returning id into v_match_id;
  end if;

  -- One statement for all lines: the batch sum triggers see the
  -- complete set only this way. A concurrent second play raises 23505 on the
  -- one active match index and aborts this whole call, so no match can ever
  -- commit without its lines. The action maps 23505 to the conflict code.
  insert into public.match_line (
    match_id, role, spot_index, label, basis_points,
    planned_minor, actual_minor, currency
  )
  select v_match_id, line.role, line.spot_index, line.label,
    line.basis_points, line.planned_minor, line.actual_minor, line.currency
  from jsonb_to_recordset(v_lines)
    as line(role text, spot_index int, label text, basis_points int,
            planned_minor bigint, actual_minor bigint, currency text);

  return jsonb_build_object(
    'code', 'ok',
    'match_id', v_match_id,
    'period', to_char(v_period, 'YYYY-MM-DD')
  );
end;
$$;

alter function public.play_match(bigint, jsonb, bigint) owner to postgres;
revoke execute on function public.play_match(bigint, jsonb, bigint)
  from public, anon, authenticated;
grant execute on function public.play_match(bigint, jsonb, bigint) to authenticated;

comment on function public.play_match(bigint, jsonb, bigint) is
  'Atomic play of one month (spec 0007, tactic branch added by spec 0008). '
  'Exactly one source: a library shape id or a tactic version id. Re-checks '
  'domain invariants against current data, supersedes the active match: '
  'entered actuals win, the rest carry forward to their slot key. Spot count '
  'comes from the source, not a hardcoded twelve. Writes the match and its '
  'lines in one statement. Expected refusals return codes; security definer, '
  'every statement filters by auth.uid().';
