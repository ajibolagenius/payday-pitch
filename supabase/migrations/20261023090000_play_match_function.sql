-- play_match (spec 0007): the one atomic write of the first match loop.
-- Resolves the caller from auth.uid(), re-reads their current incomes and
-- costs, re-checks every invariant the domain computed (it never recomputes),
-- supersedes the period's active match while copying entered actuals onto
-- matching slot keys, then inserts the match and ALL twelve lines in one
-- statement, because the line sum checks are statement level batch triggers.
-- Returns { code, match_id, period, shortfall_minor }; expected refusals are
-- result codes, not exceptions, and the one exception is a concurrent second
-- play, which raises the raw 23505 the action maps to conflict. security
-- definer is deliberate: the body
-- needs the table owner's reach across four tables in one transaction, and
-- every statement filters by the resolved uid. Spec 0004's revoke-from-
-- authenticated rule was trigger scoped; an API facing function is the
-- recorded exception (spec 0007 Decision).

create function public.play_match(p_shape_id bigint, p_lines jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_shape public.formation_shape%rowtype;
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
  v_period date;
  v_old_id bigint;
  v_lines jsonb;
  v_match_id bigint;
begin
  if v_uid is null then
    return '{"code": "session_expired"}'::jsonb;
  end if;

  select * into v_shape
  from public.formation_shape
  where id = p_shape_id;
  if not found then
    return '{"code": "shape_not_found"}'::jsonb;
  end if;
  if v_shape.deprecated then
    return '{"code": "shape_deprecated"}'::jsonb;
  end if;

  -- The shape of the payload, before any cast: a hand written call is answered
  -- with a code, never with a database error.
  if coalesce(jsonb_typeof(p_lines), 'null') <> 'array' then
    return '{"code": "validation", "message": "A match needs one line for each of the twelve spots."}'::jsonb;
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
  if v_line_count <> 12 or v_spot_count <> 12 then
    return '{"code": "validation", "message": "A match needs one line for each of the twelve spots."}'::jsonb;
  end if;
  if v_negative > 0 then
    return '{"code": "validation", "message": "Planned amounts cannot be negative."}'::jsonb;
  end if;
  if v_wrong_line_currency > 0 then
    return '{"code": "mixed_currency"}'::jsonb;
  end if;

  -- Invariant re-checks against the freshly re-read truth (never a recompute
  -- of the split): sums, the defense total, and shape agreement.
  select coalesce(sum(basis_points), 0) into v_def_bps
  from public.formation_position
  where shape_id = p_shape_id and role = 'DEF';
  if v_bps_sum <> 10000
    or v_planned_sum <> v_income
    or v_def_planned <> v_costs
    or exists (
      select 1
      from jsonb_to_recordset(p_lines)
        as line(role text, spot_index int, basis_points int, label text)
      where not exists (
        select 1 from public.formation_position fp
        where fp.shape_id = p_shape_id
          and fp.spot_index = line.spot_index
          and fp.role = line.role
          and fp.basis_points = line.basis_points
          and fp.label = line.label
      )
    )
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

  -- Correction: retire the period's active match, carrying each entered
  -- actual to the new line with the same slot key (role plus position within
  -- the role, ordered by spot index). Spots with no predecessor start empty.
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
          coalesce(to_jsonb(o.actual_minor), 'null'::jsonb)
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

  insert into public.match (
    user_id, period, status, source_kind, currency,
    library_id, library_name, shape_name
  ) values (
    v_uid, v_period, 'active', 'library', v_currency,
    v_shape.id, v_shape.name, v_shape.name
  )
  returning id into v_match_id;

  -- One statement for all twelve lines: the batch sum triggers see the
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

alter function public.play_match(bigint, jsonb) owner to postgres;
revoke execute on function public.play_match(bigint, jsonb)
  from public, anon, authenticated;
grant execute on function public.play_match(bigint, jsonb) to authenticated;

comment on function public.play_match(bigint, jsonb) is
  'Atomic play of one month (spec 0007). Re-checks domain invariants against '
  'current data, supersedes the active match with an actuals carry-forward, '
  'writes the match and its twelve lines in one statement. Expected refusals '
  'return codes; security definer, every statement filters by auth.uid().';
