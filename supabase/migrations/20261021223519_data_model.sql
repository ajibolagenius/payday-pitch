-- Payday Pitch data model (spec 0004): eleven tables, money as bigint minor
-- units with a char(3) currency, history as frozen rows, balances as views,
-- RLS on everything a user owns. One migration, applied to fresh local Supabase.

create schema if not exists private;

-- ================================================================ helpers

create function private.set_updated_at() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- A tactic edit inserts a new version as current; the previous one yields.
create function private.clear_old_tactic_version() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.is_current then
    update public.user_tactic_version
    set is_current = false
    where tactic_id = new.tactic_id
      and id is distinct from new.id
      and is_current;
  end if;
  return new;
end;
$$;

-- A formation shape's positions sum to exactly 10000 basis points.
-- Statement level with transition tables: a batch INSERT finishes, then the
-- check sees the whole batch at once. A per row check would see a partial
-- sum, and a deferred constraint trigger fires here before its batch is
-- complete. Deleting any spot with basis points above zero breaks the sum,
-- so the sum alone catches a missing spot.
-- One function per event: a trigger only gets the transition tables its
-- event has (new for insert, old for delete), and the SQL is parsed at
-- creation time.
create function private.check_shape_bps_new() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.assert_shape_bps_for(array(select distinct shape_id from transition_table_new));
  return null;
end;
$$;

create function private.check_shape_bps_old() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.assert_shape_bps_for(array(select distinct shape_id from transition_table_old));
  return null;
end;
$$;

create function private.check_shape_bps_both() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.assert_shape_bps_for(
    array(select distinct shape_id from transition_table_new
      union select distinct shape_id from transition_table_old));
  return null;
end;
$$;

create function private.assert_shape_bps_for(p_shape_ids bigint[]) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_shape bigint;
  v_total bigint;
begin
  foreach v_shape in array p_shape_ids loop
    -- A shape that no longer exists has nothing to protect: the cascade path,
    -- when deleting a shape removes its positions.
    if not exists (select 1 from public.formation_shape where id = v_shape) then
      continue;
    end if;
    select coalesce(sum(basis_points), 0) into v_total
    from public.formation_position
    where shape_id = v_shape;
    if v_total <> 10000 then
      raise exception 'shape % has positions summing to % basis points, expected 10000',
        v_shape, v_total using errcode = 'check_violation';
    end if;
  end loop;
end;
$$;

-- A match's lines sum to exactly 10000 basis points, checked after the
-- statement that writes the batch, when every line is visible.
create function private.check_match_line_bps_new() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.assert_match_line_bps_for(array(select distinct match_id from transition_table_new));
  return null;
end;
$$;

create function private.check_match_line_bps_old() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.assert_match_line_bps_for(array(select distinct match_id from transition_table_old));
  return null;
end;
$$;

create function private.check_match_line_bps_both() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.assert_match_line_bps_for(
    array(select distinct match_id from transition_table_new
      union select distinct match_id from transition_table_old));
  return null;
end;
$$;

create function private.assert_match_line_bps_for(p_match_ids bigint[]) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_match bigint;
  v_total bigint;
begin
  foreach v_match in array p_match_ids loop
    -- A match that no longer exists has nothing to protect: this is the
    -- cascade path, when deleting a match or an account removes its lines.
    if not exists (select 1 from public.match where id = v_match) then
      continue;
    end if;
    select coalesce(sum(basis_points), 0) into v_total
    from public.match_line
    where match_id = v_match;
    if v_total <> 10000 then
      raise exception 'match % lines sum to % basis points, expected 10000',
        v_match, v_total using errcode = 'check_violation';
    end if;
  end loop;
end;
$$;

-- A tactic version split sums to exactly 10000 basis points. Statement level
-- with transition tables; each row's split is complete on its own.
create function private.check_tactic_split_bps() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_bad record;
begin
  for v_bad in
    select item.id, coalesce(sum((split_item ->> 'basis_points')::int), 0) as total
    from (select id, jsonb_array_elements(split) as split_item from transition_table_new) item
    group by item.id
  loop
    if v_bad.total <> 10000 then
      raise exception 'tactic version % split sums to % basis points, expected 10000',
        v_bad.id, v_bad.total using errcode = 'check_violation';
    end if;
  end loop;
  return null;
end;
$$;

-- A line copies its match's currency, so one match is always one currency.
-- A check constraint cannot read the parent row, so this guard lives here.
-- Immediate per row: each new row carries its own currency, and the parent
-- match is written in an earlier statement of the same request.
create function private.check_match_line_currency() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_currency char(3);
begin
  select currency into v_currency from public.match where id = new.match_id;
  if v_currency is null or new.currency <> v_currency then
    raise exception 'line currency % does not match match currency %',
      new.currency, v_currency using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

revoke execute on function
  private.set_updated_at(),
  private.clear_old_tactic_version(),
  private.check_shape_bps_new(),
  private.check_shape_bps_old(),
  private.check_shape_bps_both(),
  private.assert_shape_bps_for(bigint[]),
  private.check_match_line_bps_new(),
  private.check_match_line_bps_old(),
  private.check_match_line_bps_both(),
  private.assert_match_line_bps_for(bigint[]),
  private.check_tactic_split_bps(),
  private.check_match_line_currency()
from public, anon, authenticated;

-- ================================================================ tables

create table public.profile (
  user_id uuid primary key references auth.users (id) on delete cascade,
  default_currency char(3) not null default 'NGN'
    check (default_currency ~ '^[A-Z]{3}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.income_stream (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  amount_minor bigint not null check (amount_minor > 0),
  currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  payday_day int not null check (payday_day between 1 and 31),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index income_stream_user_id_idx on public.income_stream (user_id);

create table public.fixed_cost (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  amount_minor bigint not null check (amount_minor > 0),
  currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index fixed_cost_user_id_idx on public.fixed_cost (user_id);

-- Library: shared seed data. Migration writes only, select for signed in users.
create table public.formation_shape (
  id bigint generated always as identity primary key,
  name text not null unique,
  style text not null,
  when_to_play text not null,
  sort int not null,
  deprecated boolean not null default false
);

create table public.formation_position (
  id bigint generated always as identity primary key,
  shape_id bigint not null references public.formation_shape (id) on delete cascade,
  role text not null check (role in ('GK', 'DEF', 'MID', 'FWD', 'BENCH')),
  spot_index int not null check (spot_index >= 0),
  label text not null,
  basis_points int not null check (basis_points between 0 and 10000),
  unique (shape_id, spot_index)
);
create index formation_position_shape_id_idx on public.formation_position (shape_id);

create table public.user_tactic (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  shape_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);
create index user_tactic_user_id_idx on public.user_tactic (user_id);

create table public.user_tactic_version (
  id bigint generated always as identity primary key,
  tactic_id bigint not null references public.user_tactic (id) on delete cascade,
  split jsonb not null check (jsonb_typeof(split) = 'array'),
  is_current boolean not null default true,
  created_at timestamptz not null default now()
);
create index user_tactic_version_tactic_id_idx on public.user_tactic_version (tactic_id);
create unique index user_tactic_version_one_current_idx
  on public.user_tactic_version (tactic_id)
  where is_current;

create table public.match (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  period date not null check (extract(day from period) = 1),
  status text not null default 'active' check (status in ('active', 'superseded')),
  source_kind text not null check (source_kind in ('library', 'tactic')),
  currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  library_id bigint references public.formation_shape (id) on delete set null,
  library_name text,
  tactic_id bigint references public.user_tactic (id) on delete restrict,
  tactic_version_id bigint references public.user_tactic_version (id) on delete cascade,
  shape_name text not null,
  created_at timestamptz not null default now(),
  check (
    (source_kind = 'library'
      and library_id is not null
      and tactic_id is null
      and tactic_version_id is null)
    or
    (source_kind = 'tactic'
      and tactic_id is not null
      and tactic_version_id is not null
      and library_id is null)
  )
);
create index match_user_id_idx on public.match (user_id);
create index match_library_id_idx on public.match (library_id);
create index match_tactic_id_idx on public.match (tactic_id);
create index match_tactic_version_id_idx on public.match (tactic_version_id);
create unique index match_one_active_per_period_idx
  on public.match (user_id, period)
  where status = 'active';

create table public.debt (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  principal_minor bigint not null check (principal_minor > 0),
  currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  target_date date,
  cleared_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index debt_user_id_idx on public.debt (user_id);

create table public.goal (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  target_minor bigint not null check (target_minor > 0),
  currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index goal_user_id_idx on public.goal (user_id);

-- Lines belong to a match and may point at a debt or a goal, so this table
-- is created after its three parents.
create table public.match_line (
  id bigint generated always as identity primary key,
  match_id bigint not null references public.match (id) on delete cascade,
  role text not null check (role in ('GK', 'DEF', 'MID', 'FWD', 'BENCH')),
  spot_index int not null check (spot_index >= 0),
  label text not null,
  basis_points int not null check (basis_points between 0 and 10000),
  planned_minor bigint not null check (planned_minor >= 0),
  actual_minor bigint check (actual_minor >= 0),
  currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  debt_id bigint references public.debt (id) on delete set null,
  debt_name text,
  goal_id bigint references public.goal (id) on delete set null,
  goal_name text,
  unique (match_id, spot_index)
);
create index match_line_match_id_idx on public.match_line (match_id);
create index match_line_debt_id_idx on public.match_line (debt_id);
create index match_line_goal_id_idx on public.match_line (goal_id);

-- ================================================================ triggers

create trigger income_stream_set_updated_at
  before update on public.income_stream
  for each row execute function private.set_updated_at();
create trigger fixed_cost_set_updated_at
  before update on public.fixed_cost
  for each row execute function private.set_updated_at();
create trigger user_tactic_set_updated_at
  before update on public.user_tactic
  for each row execute function private.set_updated_at();
create trigger profile_set_updated_at
  before update on public.profile
  for each row execute function private.set_updated_at();
create trigger debt_set_updated_at
  before update on public.debt
  for each row execute function private.set_updated_at();
create trigger goal_set_updated_at
  before update on public.goal
  for each row execute function private.set_updated_at();

create trigger user_tactic_version_current
  before insert on public.user_tactic_version
  for each row execute function private.clear_old_tactic_version();

-- One trigger per event: Postgres allows transition tables only on single
-- event triggers.
create trigger formation_position_bps_insert
  after insert on public.formation_position
  referencing new table as transition_table_new
  for each statement execute function private.check_shape_bps_new();
create trigger formation_position_bps_update
  after update on public.formation_position
  referencing new table as transition_table_new old table as transition_table_old
  for each statement execute function private.check_shape_bps_both();
create trigger formation_position_bps_delete
  after delete on public.formation_position
  referencing old table as transition_table_old
  for each statement execute function private.check_shape_bps_old();

create trigger match_line_bps_insert
  after insert on public.match_line
  referencing new table as transition_table_new
  for each statement execute function private.check_match_line_bps_new();
create trigger match_line_bps_update
  after update on public.match_line
  referencing new table as transition_table_new old table as transition_table_old
  for each statement execute function private.check_match_line_bps_both();
create trigger match_line_bps_delete
  after delete on public.match_line
  referencing old table as transition_table_old
  for each statement execute function private.check_match_line_bps_old();

create trigger match_line_currency_ok
  after insert or update of match_id, currency on public.match_line
  for each row execute function private.check_match_line_currency();

create trigger user_tactic_version_bps_insert
  after insert on public.user_tactic_version
  referencing new table as transition_table_new
  for each statement execute function private.check_tactic_split_bps();
-- No update trigger: split is write once (an edit inserts a new version row,
-- never updates split), per the spec's interface contract.

-- ================================================================ views

-- Balances are never stored. Progress is summed from active match lines.
create view public.debt_progress
with (security_invoker = true)
as
select ml.debt_id as debt_id, coalesce(sum(ml.actual_minor), 0)::bigint as paid_minor
from public.match_line ml
join public.match m on m.id = ml.match_id
where m.status = 'active' and ml.debt_id is not null
group by ml.debt_id;

create view public.goal_progress
with (security_invoker = true)
as
select ml.goal_id as goal_id, coalesce(sum(ml.actual_minor), 0)::bigint as saved_minor
from public.match_line ml
join public.match m on m.id = ml.match_id
where m.status = 'active' and ml.goal_id is not null
group by ml.goal_id;

-- ================================================================ rls

alter table public.profile enable row level security;
alter table public.income_stream enable row level security;
alter table public.fixed_cost enable row level security;
alter table public.user_tactic enable row level security;
alter table public.user_tactic_version enable row level security;
alter table public.match enable row level security;
alter table public.match_line enable row level security;
alter table public.debt enable row level security;
alter table public.goal enable row level security;
alter table public.formation_shape enable row level security;
alter table public.formation_position enable row level security;

-- Owned rows: the uid is wrapped in a subselect so it is evaluated once.
create policy profile_owner on public.profile
  to authenticated
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

create policy income_stream_owner on public.income_stream
  for all
  to authenticated
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

create policy fixed_cost_owner on public.fixed_cost
  for all
  to authenticated
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

create policy user_tactic_owner on public.user_tactic
  for all
  to authenticated
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

-- A version is reached through its tactic head, so ownership is a subquery.
create policy user_tactic_version_owner on public.user_tactic_version
  for all
  to authenticated
  using (
    exists (
      select 1 from public.user_tactic t
      where t.id = user_tactic_version.tactic_id
        and t.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.user_tactic t
      where t.id = user_tactic_version.tactic_id
        and t.user_id = (select auth.uid())
    )
  );

create policy match_owner on public.match
  for all
  to authenticated
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

-- A line has no user id: ownership comes from its parent match.
create policy match_line_owner on public.match_line
  for all
  to authenticated
  using (
    exists (
      select 1 from public.match m
      where m.id = match_line.match_id
        and m.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.match m
      where m.id = match_line.match_id
        and m.user_id = (select auth.uid())
    )
  );

create policy debt_owner on public.debt
  for all
  to authenticated
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

create policy goal_owner on public.goal
  for all
  to authenticated
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

-- Library: read only to signed in users, and only where the shape is live.
create policy formation_shape_read on public.formation_shape
  for select
  to authenticated
  using (not deprecated);

create policy formation_position_read on public.formation_position
  for select
  to authenticated
  using (true);

-- ================================================================ grants

-- Supabase grants the public roles by default on new tables, so take that back
-- before handing authenticated exactly what it needs.
revoke all on public.profile from anon, authenticated, public;
revoke all on public.income_stream from anon, authenticated, public;
revoke all on public.fixed_cost from anon, authenticated, public;
revoke all on public.user_tactic from anon, authenticated, public;
revoke all on public.user_tactic_version from anon, authenticated, public;
revoke all on public.match from anon, authenticated, public;
revoke all on public.match_line from anon, authenticated, public;
revoke all on public.debt from anon, authenticated, public;
revoke all on public.goal from anon, authenticated, public;
revoke all on public.formation_shape from anon, authenticated, public;
revoke all on public.formation_position from anon, authenticated, public;
revoke all on public.debt_progress from anon, authenticated, public;
revoke all on public.goal_progress from anon, authenticated, public;

-- The same default grants land on each table's identity sequence, so take
-- those back too. service_role keeps its defaults for local admin use.
revoke all on sequence
  public.income_stream_id_seq,
  public.fixed_cost_id_seq,
  public.user_tactic_id_seq,
  public.user_tactic_version_id_seq,
  public.match_id_seq,
  public.match_line_id_seq,
  public.debt_id_seq,
  public.goal_id_seq,
  public.formation_shape_id_seq,
  public.formation_position_id_seq
from anon, authenticated, public;

grant select, insert, update, delete on
  public.profile,
  public.income_stream,
  public.fixed_cost,
  public.user_tactic,
  public.user_tactic_version,
  public.match,
  public.match_line,
  public.debt,
  public.goal
to authenticated;

grant usage, select on sequence
  public.income_stream_id_seq,
  public.fixed_cost_id_seq,
  public.user_tactic_id_seq,
  public.user_tactic_version_id_seq,
  public.match_id_seq,
  public.match_line_id_seq,
  public.debt_id_seq,
  public.goal_id_seq
to authenticated;

grant select on
  public.formation_shape,
  public.formation_position,
  public.debt_progress,
  public.goal_progress
to authenticated;

-- ================================================================ seed
-- Last on purpose: the sum checks run at the end of each statement, so the
-- positions must land after the tables, triggers, and grants all exist.
-- One INSERT carries all 72 rows, so the transition table sees the complete
-- batch and every shape passes the sum check.

insert into public.formation_shape (name, style, when_to_play, sort) values
  ('4-4-2', 'Balanced classic', 'Your default shape when life is steady.', 1),
  ('4-3-3', 'Attacking', 'When your costs are covered and you want to build wealth faster.', 2),
  ('3-5-2', 'Midfield heavy', 'When upskilling and short term goals are the season''s priority.', 3),
  ('4-2-3-1', 'Steady builder', 'When you want quiet growth: debt and goals on the double pivot, one striker investing.', 4),
  ('5-3-2', 'Defensive', 'When your fixed costs are high and the month needs to bend around them.', 5),
  ('5-4-1', 'Park the Bus', 'When a debt must fall: everything shields the defense and the midfield clears it.', 6);

-- Mirrors src/domain/formations.ts; formations.test.ts pins every row to 10000.
insert into public.formation_position (shape_id, role, spot_index, label, basis_points)
select s.id, p.role, p.spot_index, p.label, p.basis_points
from (values
  ('4-4-2'::text, 'GK'::text, 0::int, 'Emergency Fund'::text, 1000::int),
  ('4-4-2', 'DEF', 1, 'Right Back', 1000),
  ('4-4-2', 'DEF', 2, 'Centre Back', 1000),
  ('4-4-2', 'DEF', 3, 'Centre Back', 1000),
  ('4-4-2', 'DEF', 4, 'Left Back', 1000),
  ('4-4-2', 'MID', 5, 'Right Mid', 750),
  ('4-4-2', 'MID', 6, 'Central Mid', 750),
  ('4-4-2', 'MID', 7, 'Central Mid', 750),
  ('4-4-2', 'MID', 8, 'Left Mid', 750),
  ('4-4-2', 'FWD', 9, 'Striker', 750),
  ('4-4-2', 'FWD', 10, 'Second Striker', 750),
  ('4-4-2', 'BENCH', 11, 'Guilt-Free Sub', 500),
  ('4-3-3', 'GK', 0, 'Emergency Fund', 500),
  ('4-3-3', 'DEF', 1, 'Right Back', 1000),
  ('4-3-3', 'DEF', 2, 'Centre Back', 1000),
  ('4-3-3', 'DEF', 3, 'Centre Back', 1000),
  ('4-3-3', 'DEF', 4, 'Left Back', 1000),
  ('4-3-3', 'MID', 5, 'Defensive Mid', 667),
  ('4-3-3', 'MID', 6, 'Central Mid', 666),
  ('4-3-3', 'MID', 7, 'Attacking Mid', 667),
  ('4-3-3', 'FWD', 8, 'Right Wing', 1000),
  ('4-3-3', 'FWD', 9, 'Striker', 1000),
  ('4-3-3', 'FWD', 10, 'Left Wing', 1000),
  ('4-3-3', 'BENCH', 11, 'Guilt-Free Sub', 500),
  ('3-5-2', 'GK', 0, 'Emergency Fund', 500),
  ('3-5-2', 'DEF', 1, 'Centre Back', 1000),
  ('3-5-2', 'DEF', 2, 'Centre Back', 1000),
  ('3-5-2', 'DEF', 3, 'Centre Back', 1000),
  ('3-5-2', 'MID', 4, 'Right Wing-Back', 700),
  ('3-5-2', 'MID', 5, 'Debt Repayment', 700),
  ('3-5-2', 'MID', 6, 'Upskilling', 1200),
  ('3-5-2', 'MID', 7, 'Short-Term Goals', 700),
  ('3-5-2', 'MID', 8, 'Left Wing-Back', 700),
  ('3-5-2', 'FWD', 9, 'Striker', 1000),
  ('3-5-2', 'FWD', 10, 'Second Striker', 1000),
  ('3-5-2', 'BENCH', 11, 'Guilt-Free Sub', 500),
  ('4-2-3-1', 'GK', 0, 'Emergency Fund', 1000),
  ('4-2-3-1', 'DEF', 1, 'Right Back', 1000),
  ('4-2-3-1', 'DEF', 2, 'Centre Back', 1000),
  ('4-2-3-1', 'DEF', 3, 'Centre Back', 1000),
  ('4-2-3-1', 'DEF', 4, 'Left Back', 1000),
  ('4-2-3-1', 'MID', 5, 'Debt Repayment', 1000),
  ('4-2-3-1', 'MID', 6, 'Upskilling', 1000),
  ('4-2-3-1', 'MID', 7, 'Right Attacking Mid', 334),
  ('4-2-3-1', 'MID', 8, 'Attacking Mid', 333),
  ('4-2-3-1', 'MID', 9, 'Left Attacking Mid', 333),
  ('4-2-3-1', 'FWD', 10, 'Striker', 1500),
  ('4-2-3-1', 'BENCH', 11, 'Guilt-Free Sub', 500),
  ('5-3-2', 'GK', 0, 'Emergency Fund', 500),
  ('5-3-2', 'DEF', 1, 'Right Wing-Back', 1000),
  ('5-3-2', 'DEF', 2, 'Centre Back', 1000),
  ('5-3-2', 'DEF', 3, 'Centre Back', 1000),
  ('5-3-2', 'DEF', 4, 'Centre Back', 1000),
  ('5-3-2', 'DEF', 5, 'Left Wing-Back', 1000),
  ('5-3-2', 'MID', 6, 'Debt Repayment', 834),
  ('5-3-2', 'MID', 7, 'Upskilling', 833),
  ('5-3-2', 'MID', 8, 'Short-Term Goals', 833),
  ('5-3-2', 'FWD', 9, 'Striker', 750),
  ('5-3-2', 'FWD', 10, 'Second Striker', 750),
  ('5-3-2', 'BENCH', 11, 'Guilt-Free Sub', 500),
  ('5-4-1', 'GK', 0, 'Emergency Fund', 200),
  ('5-4-1', 'DEF', 1, 'Right Wing-Back', 1040),
  ('5-4-1', 'DEF', 2, 'Centre Back', 1040),
  ('5-4-1', 'DEF', 3, 'Centre Back', 1040),
  ('5-4-1', 'DEF', 4, 'Centre Back', 1040),
  ('5-4-1', 'DEF', 5, 'Left Wing-Back', 1040),
  ('5-4-1', 'MID', 6, 'Debt Repayment', 2500),
  ('5-4-1', 'MID', 7, 'Upskilling', 500),
  ('5-4-1', 'MID', 8, 'Short-Term Goals', 500),
  ('5-4-1', 'MID', 9, 'Spare Mid', 500),
  ('5-4-1', 'FWD', 10, 'Target Man', 400),
  ('5-4-1', 'BENCH', 11, 'Guilt-Free Sub', 200)
) as p (shape_name, role, spot_index, label, basis_points)
join public.formation_shape s on s.name = p.shape_name;
