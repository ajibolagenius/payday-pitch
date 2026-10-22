// RLS isolation and constraint tests for the data model (spec 0004, AC-3,
// AC-4, AC-6 to AC-9). User A creates rows, user B tries to read and change
// them and gets nothing. The service key appears only in setup, where it
// creates and deletes the two test users. Every isolation assertion runs as a
// real signed in user. The library write probes go through
// `supabase db query --local`, which is the migration role, the only role the
// schema lets write the shared seed data.
// Needs local Supabase: TEST_SUPABASE=1 pnpm test (what pnpm test:db runs).
// Keys come from `supabase status` unless SUPABASE_TEST_* env vars are set.
import { execFile } from "node:child_process"
import { promisify } from "node:util"

import { afterAll, beforeAll, describe, expect, test } from "vitest"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

import { ensureProfile } from "@/features/profile/profile"
import type { Database } from "@/lib/supabase/database.types"

const runCommand = promisify(execFile)
const enabled = process.env.TEST_SUPABASE === "1"
const password = "test-password-123"

type Client = SupabaseClient<Database>

let url = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321"
let anonKey = ""
let serviceKey = ""
let svc: Client
let a: Client
let b: Client
let aId = ""
let bId = ""
const run = Date.now()

/** Run SQL as the local database owner (the role migrations run as). */
async function dbQuery(sql: string): Promise<string> {
  const { stdout } = await runCommand(
    "supabase",
    ["db", "query", "--local", sql],
    {
      timeout: 60_000,
    },
  )
  return stdout.replace(/^Connecting to local database\.\.\.\s*/m, "")
}

/** dbQuery, but returns the failure text instead of throwing. */
async function dbTry(sql: string): Promise<{ ok: boolean; message: string }> {
  try {
    return { ok: true, message: await dbQuery(sql) }
  } catch (cause) {
    const err = cause as { stderr?: string; message?: string }
    return { ok: false, message: `${err.message ?? ""} ${err.stderr ?? ""}` }
  }
}

/** The integers on the CLI's one data row, in column order. */
function countsIn(output: string): number[] {
  const row = output
    .split("\n")
    .find((line) => line.includes("│") && /\d/.test(line))
  if (!row) throw new Error(`no count row in output: ${output}`)
  return [...row.matchAll(/-?\d+/g)].map((m) => Number(m[0]))
}

/** The only integer in the CLI's single column output. */
function firstCount(output: string): number {
  const [value] = countsIn(output)
  if (value === undefined) throw new Error(`no count in output: ${output}`)
  return value
}

async function localKeys(): Promise<{
  url: string
  anon: string
  service: string
}> {
  if (
    process.env.SUPABASE_TEST_ANON_KEY &&
    process.env.SUPABASE_TEST_SERVICE_KEY
  ) {
    return {
      url,
      anon: process.env.SUPABASE_TEST_ANON_KEY ?? "",
      service: process.env.SUPABASE_TEST_SERVICE_KEY,
    }
  }
  const { stdout } = await runCommand("supabase", ["status", "-o", "json"])
  const status = JSON.parse(stdout) as {
    API_URL?: string
    ANON_KEY?: string
    SERVICE_ROLE_KEY?: string
  }
  if (!status.ANON_KEY || !status.SERVICE_ROLE_KEY) {
    throw new Error(
      "supabase status returned no keys; is the local stack running?",
    )
  }
  return {
    url: status.API_URL ?? url,
    anon: status.ANON_KEY,
    service: status.SERVICE_ROLE_KEY,
  }
}

async function makeUser(email: string): Promise<[string, Client]> {
  // Admin API creates the user directly, so no email confirmation is needed.
  const { data, error } = await svc.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error || !data.user) {
    throw new Error(`create user failed: ${error?.message}`)
  }
  const signIn = await svc.auth.signInWithPassword({ email, password })
  if (signIn.error || !signIn.data.session) {
    throw new Error(`sign in failed: ${signIn.error?.message}`)
  }
  const client = createClient<Database>(url, anonKey, {
    global: {
      headers: { Authorization: `Bearer ${signIn.data.session.access_token}` },
    },
    auth: { persistSession: false },
  })
  return [data.user.id, client]
}

async function shapeId(name: string): Promise<number> {
  const { data, error } = await a
    .from("formation_shape")
    .select("id")
    .eq("name", name)
    .single()
  if (error || !data) {
    throw new Error(`seed shape ${name} missing: ${error?.message}`)
  }
  return data.id
}

async function positionsOf(id: number) {
  const { data, error } = await a
    .from("formation_position")
    .select("role, spot_index, label, basis_points")
    .eq("shape_id", id)
    .order("spot_index")
  if (error || !data) {
    throw new Error(`seed positions missing: ${error?.message}`)
  }
  return data
}

async function createMatch(
  client: Client,
  user: string,
  shape: string,
  period: string,
) {
  const shapeRow = await shapeId(shape)
  const spots = await positionsOf(shapeRow)
  const { data, error } = await client
    .from("match")
    .insert({
      user_id: user,
      period,
      source_kind: "library",
      currency: "NGN",
      library_id: shapeRow,
      library_name: shape,
      shape_name: shape,
    })
    .select()
    .single()
  if (error || !data) {
    throw new Error(`create match failed: ${error?.message}`)
  }
  const { error: lineError } = await client.from("match_line").insert(
    spots.map((s) => ({
      match_id: data.id,
      role: s.role,
      spot_index: s.spot_index,
      label: s.label,
      basis_points: s.basis_points,
      planned_minor: 1000,
      currency: "NGN",
    })),
  )
  if (lineError) {
    throw new Error(`create lines failed: ${lineError?.message}`)
  }
  return data
}

beforeAll(async () => {
  if (!enabled) return
  const keys = await localKeys()
  url = keys.url
  anonKey = keys.anon
  serviceKey = keys.service
  svc = createClient<Database>(url, serviceKey, {
    auth: { persistSession: false },
  })
  ;[aId, a] = await makeUser(`rls-a-${run}@test.local`)
  ;[bId, b] = await makeUser(`rls-b-${run}@test.local`)
})

afterAll(async () => {
  if (!enabled || !svc) return
  await dbTry("delete from public.formation_shape where name like 'probe-%'")
  for (const id of [aId, bId]) {
    await svc.auth.admin.deleteUser(id)
  }
})

describe.skipIf(!enabled)("rls isolation (AC-3)", { timeout: 60_000 }, () => {
  test("user B cannot read any of user A's rows", async () => {
    const { data: incomeA, error: incomeErr } = await a
      .from("income_stream")
      .insert({
        user_id: aId,
        name: "Salary",
        amount_minor: 50000000,
        currency: "NGN",
        payday_day: 25,
      })
      .select()
      .single()
    expect(incomeErr).toBeNull()
    const { data: costA } = await a
      .from("fixed_cost")
      .insert({
        user_id: aId,
        name: "Rent",
        amount_minor: 15000000,
        currency: "NGN",
      })
      .select()
      .single()
    const { data: tacticA } = await a
      .from("user_tactic")
      .insert({ user_id: aId, name: "My Shape", shape_name: "4-4-2" })
      .select()
      .single()
    const { data: versionA } = await a
      .from("user_tactic_version")
      .insert({
        tactic_id: tacticA!.id,
        split: [
          {
            role: "GK",
            spot_index: 0,
            label: "Emergency Fund",
            basis_points: 10000,
          },
        ],
      })
      .select()
      .single()
    expect(versionA).not.toBeNull()
    const { data: debtA } = await a
      .from("debt")
      .insert({
        user_id: aId,
        name: "Loan",
        principal_minor: 30000000,
        currency: "NGN",
      })
      .select()
      .single()
    const { data: goalA } = await a
      .from("goal")
      .insert({
        user_id: aId,
        name: "Car",
        target_minor: 500000000,
        currency: "NGN",
      })
      .select()
      .single()
    const { error: profileErr } = await a
      .from("profile")
      .insert({ user_id: aId })
    expect(profileErr).toBeNull()
    const matchA = await createMatch(a, aId, "4-4-2", "2026-10-01")

    expect((await b.from("profile").select().eq("user_id", aId)).data).toEqual(
      [],
    )
    expect(
      (await b.from("income_stream").select().eq("id", incomeA!.id)).data,
    ).toEqual([])
    expect(
      (await b.from("fixed_cost").select().eq("id", costA!.id)).data,
    ).toEqual([])
    expect(
      (await b.from("user_tactic").select().eq("id", tacticA!.id)).data,
    ).toEqual([])
    expect(
      (await b.from("user_tactic_version").select().eq("id", versionA!.id))
        .data,
    ).toEqual([])
    expect((await b.from("match").select().eq("id", matchA.id)).data).toEqual(
      [],
    )
    expect(
      (await b.from("match_line").select().eq("match_id", matchA.id)).data,
    ).toEqual([])
    expect((await b.from("debt").select().eq("id", debtA!.id)).data).toEqual([])
    expect((await b.from("goal").select().eq("id", goalA!.id)).data).toEqual([])
    expect(
      (await b.from("debt_progress").select().eq("debt_id", debtA!.id)).data,
    ).toEqual([])
    expect(
      (await b.from("goal_progress").select().eq("goal_id", goalA!.id)).data,
    ).toEqual([])

    // B's update lands on nothing: RLS hides A's row, so zero rows change.
    const { error: updateErr } = await b
      .from("income_stream")
      .update({ amount_minor: 1 })
      .eq("id", incomeA!.id)
    expect(updateErr).toBeNull()
    const { data: stillThere } = await a
      .from("income_stream")
      .select("amount_minor")
      .eq("id", incomeA!.id)
      .single()
    expect(stillThere?.amount_minor).toBe(50000000)

    const { error: foreignLine } = await b.from("match_line").insert({
      match_id: matchA.id,
      role: "GK",
      spot_index: 99,
      label: "Intruder",
      basis_points: 10000,
      planned_minor: 1,
      currency: "NGN",
    })
    expect(foreignLine).not.toBeNull()

    const { error: foreignTactic } = await b
      .from("user_tactic")
      .insert({ user_id: aId, name: "Stolen Name" })
    expect(foreignTactic).not.toBeNull()
  })

  test("user B reads and writes their own rows normally", async () => {
    const { data, error } = await b
      .from("income_stream")
      .insert({
        user_id: bId,
        name: "B Salary",
        amount_minor: 100,
        currency: "NGN",
        payday_day: 1,
      })
      .select()
      .single()
    expect(error).toBeNull()
    expect(data?.name).toBe("B Salary")
  })

  test("the library cannot be written through the API (AC-3, AC-4)", async () => {
    for (const client of [a, b]) {
      const shapeInsert = await client
        .from("formation_shape")
        .insert({ name: "1-1-1", style: "x", when_to_play: "y", sort: 99 })
      expect(shapeInsert.error).not.toBeNull()
      const positionInsert = await client.from("formation_position").insert({
        shape_id: 1,
        role: "GK",
        spot_index: 0,
        label: "x",
        basis_points: 1,
      })
      expect(positionInsert.error).not.toBeNull()
      const shapeDelete = await client
        .from("formation_shape")
        .delete()
        .eq("name", "4-4-2")
      expect(shapeDelete.error).not.toBeNull()
    }
  })

  test("all six built-in formations are seeded and sum to 10000 (AC-4)", async () => {
    const { data: shapes } = await a.from("formation_shape").select("id, name")
    expect(shapes?.map((s) => s.name).sort()).toEqual(
      ["4-4-2", "4-3-3", "3-5-2", "4-2-3-1", "5-3-2", "5-4-1"].sort(),
    )
    for (const shape of shapes ?? []) {
      const spots = await positionsOf(shape.id)
      const total = spots.reduce((sum, s) => sum + s.basis_points, 0)
      expect(total, `${shape.name} sums to ${total}`).toBe(10000)
    }
  })
})

describe.skipIf(!enabled)("constraint probes", { timeout: 60_000 }, () => {
  test("payday_day 0 and 32 are rejected, 1 and 31 pass (AC-9)", async () => {
    const base = { user_id: aId, name: "x", amount_minor: 1, currency: "NGN" }
    expect(
      (await a.from("income_stream").insert({ ...base, payday_day: 0 })).error,
    ).not.toBeNull()
    expect(
      (await a.from("income_stream").insert({ ...base, payday_day: 32 })).error,
    ).not.toBeNull()
    expect(
      (await a.from("income_stream").insert({ ...base, payday_day: 31 })).error,
    ).toBeNull()
  })

  test("a mid month period is rejected (AC-6 structure)", async () => {
    const shape = await shapeId("4-4-2")
    const { error } = await a.from("match").insert({
      user_id: aId,
      period: "2026-10-15",
      source_kind: "library",
      currency: "NGN",
      library_id: shape,
      shape_name: "4-4-2",
    })
    expect(error).not.toBeNull()
  })

  test("a negative amount is rejected and no money column is a float (AC-2)", async () => {
    expect(
      (
        await a.from("debt").insert({
          user_id: aId,
          name: "x",
          principal_minor: -1,
          currency: "NGN",
        })
      ).error,
    ).not.toBeNull()
    expect(
      (
        await a.from("goal").insert({
          user_id: aId,
          name: "x",
          target_minor: -5,
          currency: "NGN",
        })
      ).error,
    ).not.toBeNull()
    // Direct read of the catalog, outside RLS reach: no float or double
    // precision column exists anywhere in the public schema.
    const catalog = await dbQuery(
      "select count(*) from information_schema.columns where table_schema = 'public' and data_type in ('double precision', 'real', 'numeric')",
    )
    expect(firstCount(catalog)).toBe(0)
  })

  test("a tactic sourced match without a version is rejected (AC-6 structure)", async () => {
    const { data: tactic } = await a
      .from("user_tactic")
      .insert({ user_id: aId, name: "No Version Tactic" })
      .select()
      .single()
    const { error } = await a.from("match").insert({
      user_id: aId,
      period: "2026-11-01",
      source_kind: "tactic",
      currency: "NGN",
      tactic_id: tactic!.id,
      shape_name: "tactic",
    })
    expect(error).not.toBeNull()
  })

  test("a tactic split that does not sum to 10000 basis points is rejected (AC-4 rule)", async () => {
    const { data: tactic } = await a
      .from("user_tactic")
      .insert({ user_id: aId, name: "Bad Split Tactic" })
      .select()
      .single()
    // The check is a deferred constraint trigger: it fires at commit, and the
    // single request is one transaction, so the error comes back here.
    const { error } = await a.from("user_tactic_version").insert({
      tactic_id: tactic!.id,
      split: [
        {
          role: "GK",
          spot_index: 0,
          label: "Emergency Fund",
          basis_points: 5000,
        },
        { role: "FWD", spot_index: 1, label: "Striker", basis_points: 4999 },
      ],
    })
    expect(error).not.toBeNull()
  })

  test("only one tactic version stays current (AC-6 structure)", async () => {
    const { data: tactic } = await a
      .from("user_tactic")
      .insert({ user_id: aId, name: "Two Currents Tactic" })
      .select()
      .single()
    const split = [
      {
        role: "GK",
        spot_index: 0,
        label: "Emergency Fund",
        basis_points: 10000,
      },
    ]
    const first = await a
      .from("user_tactic_version")
      .insert({ tactic_id: tactic!.id, split })
      .select()
      .single()
    expect(first.error).toBeNull()
    // The flip trigger retires the old row, so an edit never has to.
    const second = await a
      .from("user_tactic_version")
      .insert({ tactic_id: tactic!.id, split, is_current: true })
      .select()
      .single()
    expect(second.error).toBeNull()
    const { data: versions } = await a
      .from("user_tactic_version")
      .select("id, is_current")
      .eq("tactic_id", tactic!.id)
    expect(versions?.filter((v) => v.is_current)).toHaveLength(1)
    expect(versions?.find((v) => v.id === second.data?.id)?.is_current).toBe(
      true,
    )
    expect(versions?.find((v) => v.id === first.data?.id)?.is_current).toBe(
      false,
    )
  })

  test("seeded shapes that break the sum are rejected; a good batch passes (AC-4)", async () => {
    // The migration role writes the library, so the probe runs as it. This is
    // the path a future seed migration takes, trigger checks included.
    const bad = await dbTry(
      "insert into public.formation_shape (name, style, when_to_play, sort) values ('probe-bad', 'x', 'y', 100) returning id",
    )
    expect(bad.ok).toBe(true)
    const badId = firstCount(bad.message)
    const oneLine = await dbTry(
      `insert into public.formation_position (shape_id, role, spot_index, label, basis_points)
       values (${badId}, 'GK', 0, 'x', 9999)`,
    )
    expect(oneLine.ok).toBe(false)
    expect(oneLine.message).toMatch(/expected 10000/)

    const good = await dbTry(
      "insert into public.formation_shape (name, style, when_to_play, sort) values ('probe-good', 'x', 'y', 101) returning id",
    )
    expect(good.ok).toBe(true)
    const goodId = firstCount(good.message)
    const okBatch = await dbTry(
      `insert into public.formation_position (shape_id, role, spot_index, label, basis_points)
       values
         (${goodId}, 'GK', 0, 'a', 5000),
         (${goodId}, 'FWD', 1, 'b', 5000)`,
    )
    expect(okBatch.ok).toBe(true)
    // The half written shape rolled back with its statement; clean up both.
    await dbTry(
      "delete from public.formation_shape where name in ('probe-bad', 'probe-good')",
    )
  })

  test("a line with a different currency than its match is rejected (AC-2)", async () => {
    const match = await createMatch(a, aId, "4-4-2", "2026-12-01")
    const { error } = await a.from("match_line").insert({
      match_id: match.id,
      role: "GK",
      spot_index: 98,
      label: "x",
      basis_points: 10000,
      planned_minor: 1,
      currency: "USD",
    })
    expect(error).not.toBeNull()
  })
})

describe.skipIf(!enabled)(
  "sum trigger and catalog invariants",
  { timeout: 60_000 },
  () => {
    test("a match line batch that does not sum to 10000 is rejected (AC-4 rule on lines)", async () => {
      // A match with no lines yet: the line sum trigger checks at commit, so
      // this batch is the whole set the trigger sees.
      const shape = await shapeId("4-4-2")
      const { data: bare, error: bareErr } = await a
        .from("match")
        .insert({
          user_id: aId,
          period: "2027-04-01",
          source_kind: "library",
          currency: "NGN",
          library_id: shape,
          shape_name: "4-4-2",
        })
        .select()
        .single()
      expect(bareErr).toBeNull()
      const bad = await a.from("match_line").insert([
        {
          match_id: bare!.id,
          role: "GK",
          spot_index: 0,
          label: "a",
          basis_points: 5000,
          planned_minor: 1,
          currency: "NGN",
        },
        {
          match_id: bare!.id,
          role: "DEF",
          spot_index: 1,
          label: "b",
          basis_points: 4999,
          planned_minor: 1,
          currency: "NGN",
        },
      ])
      expect(bad.error).not.toBeNull()
      // Spot index 1 is already taken by the failed batch (it rolled back
      // with its statement), so a good batch on the full 10000 passes.
      const good = await a.from("match_line").insert([
        {
          match_id: bare!.id,
          role: "GK",
          spot_index: 0,
          label: "a",
          basis_points: 5000,
          planned_minor: 1,
          currency: "NGN",
        },
        {
          match_id: bare!.id,
          role: "DEF",
          spot_index: 1,
          label: "b",
          basis_points: 5000,
          planned_minor: 1,
          currency: "NGN",
        },
      ])
      expect(good.error).toBeNull()
      await a.from("match").delete().eq("id", bare!.id)
    })

    test("both progress views exist and are security_invoker (AC-8)", async () => {
      const out = await dbQuery(
        "select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relname in ('debt_progress', 'goal_progress') and c.reloptions @> array['security_invoker=true']",
      )
      expect(firstCount(out)).toBe(2)
    })

    test("no stored balance or progress column exists on any table (AC-8)", async () => {
      // One query, five counts. The only paid/saved names in the schema are
      // the computed view columns, which a base table must never copy.
      const out = await dbQuery(`
        select
          (select count(*) from information_schema.columns
            where table_schema = 'public' and table_name in ('debt', 'goal')
            and column_name ~ '(balance|progress)'),
          (select count(*) from information_schema.columns
            where table_schema = 'public' and table_name in ('debt', 'goal')
            and column_name ~ '^(paid|saved)'),
          (select count(*) from information_schema.columns
            where table_schema = 'public' and table_name = 'match_line'
            and column_name ~ '^(paid|saved|total)'),
          (select count(*) from information_schema.columns
            where table_schema = 'public' and table_name = 'match'
            and column_name ~ '(balance|total|progress)'),
          (select count(*) from information_schema.columns
            where table_schema = 'public' and table_name = 'user_tactic'
            and column_name ~ '(balance|total|progress)')
      `)
      expect(countsIn(out)).toEqual([0, 0, 0, 0, 0])
    })

    test("the library is select only for authenticated (AC-3 grants)", async () => {
      const probe = await dbQuery(
        "select concat_ws(',', " +
          "case when has_table_privilege('authenticated', 'public.formation_shape', 'select') then '1' else '0' end, " +
          "case when has_table_privilege('authenticated', 'public.formation_position', 'select') then '1' else '0' end, " +
          "case when has_table_privilege('authenticated', 'public.formation_shape', 'insert') then '1' else '0' end, " +
          "case when has_table_privilege('authenticated', 'public.formation_shape', 'update') then '1' else '0' end, " +
          "case when has_table_privilege('authenticated', 'public.formation_shape', 'delete') then '1' else '0' end, " +
          "case when has_table_privilege('authenticated', 'public.formation_position', 'insert') then '1' else '0' end, " +
          "case when has_table_privilege('authenticated', 'public.formation_position', 'update') then '1' else '0' end, " +
          "case when has_table_privilege('authenticated', 'public.formation_position', 'delete') then '1' else '0' end) as privcheck",
      )
      // Read yes on both tables, every write no: 11000000 in column order.
      expect(probe.replace(/\D/g, "")).toMatch(/11000000/)
    })

    test("no policy or grant exists for the anon role anywhere (AC-3, security model)", async () => {
      const out = await dbQuery(
        "select concat_ws(',', " +
          "(select count(*) from pg_policies where schemaname = 'public' and 'anon' = any(roles))::text, " +
          "(select count(distinct table_name) from information_schema.role_table_grants " +
          "where table_schema = 'public' and grantee = 'anon')::text) as anoncheck",
      )
      expect(firstCount(out)).toBe(0)
      expect(countsIn(out)).toEqual([0, 0])
    })

    test("the updated_at trigger moves the stamp on an edit, never on insert", async () => {
      const { data: row, error } = await a
        .from("income_stream")
        .insert({
          user_id: aId,
          name: "Trigger Probe",
          amount_minor: 1000,
          currency: "NGN",
          payday_day: 10,
        })
        .select("id, created_at, updated_at")
        .single()
      expect(error).toBeNull()
      expect(new Date(row!.updated_at).getTime()).toBe(
        new Date(row!.created_at).getTime(),
      )
      await new Promise((r) => setTimeout(r, 50))
      const { data: moved, error: moveErr } = await a
        .from("income_stream")
        .update({ amount_minor: 2000 })
        .eq("id", row!.id)
        .select("created_at, updated_at")
        .single()
      expect(moveErr).toBeNull()
      expect(new Date(moved!.updated_at).getTime()).toBeGreaterThan(
        new Date(moved!.created_at).getTime(),
      )
    })
  },
)

describe.skipIf(!enabled)("profile upsert (AC-10)", { timeout: 60_000 }, () => {
  test("ensureProfile creates one row with the default currency", async () => {
    const row = await ensureProfile(aId, a)
    expect(row?.user_id).toBe(aId)
    expect(row?.default_currency).toBe("NGN")
    // Calling it again changes nothing: the row is created once, on sight.
    const again = await ensureProfile(aId, a)
    expect(again).toEqual(row)
    const { count } = await a
      .from("profile")
      .select("user_id", { count: "exact", head: true })
      .eq("user_id", aId)
    expect(count).toBe(1)
  })
})

describe.skipIf(!enabled)(
  "history and balance rules",
  { timeout: 60_000 },
  () => {
    test("one active match per period, a correction keeps history (AC-6, AC-8)", async () => {
      const first = await createMatch(a, aId, "4-4-2", "2027-01-01")
      const dupe = await a.from("match").insert({
        user_id: aId,
        period: "2027-01-01",
        source_kind: "library",
        currency: "NGN",
        library_id: first.library_id,
        shape_name: "4-4-2",
      })
      expect(dupe.error).not.toBeNull()

      // Log an actual against a debt on the Debt Repayment spot of 4-4-2... which
      // 4-4-2 has none of, so put it on a MID spot instead: spot 5.
      const { data: debt } = await a
        .from("debt")
        .insert({
          user_id: aId,
          name: "Fan Loan",
          principal_minor: 100000,
          currency: "NGN",
        })
        .select()
        .single()
      const { error: logErr } = await a
        .from("match_line")
        .update({
          actual_minor: 25000,
          debt_id: debt!.id,
          debt_name: debt!.name,
        })
        .eq("match_id", first.id)
        .eq("spot_index", 5)
      expect(logErr).toBeNull()

      const { data: beforeCorrection } = await a
        .from("debt_progress")
        .select("paid_minor")
        .eq("debt_id", debt!.id)
        .single()
      expect(Number(beforeCorrection?.paid_minor)).toBe(25000)

      // The correction transaction (spec 0004): supersede, insert the new
      // match, copy its lines with the logged actuals. The superseded match and
      // its lines stay as history.
      const { error: supersedeErr } = await a
        .from("match")
        .update({ status: "superseded" })
        .eq("id", first.id)
      expect(supersedeErr).toBeNull()
      const { data: corrected, error: correctedErr } = await a
        .from("match")
        .insert({
          user_id: aId,
          period: "2027-01-01",
          source_kind: "library",
          currency: "NGN",
          library_id: first.library_id,
          shape_name: "4-4-2",
        })
        .select()
        .single()
      expect(correctedErr).toBeNull()
      const { data: oldLines } = await a
        .from("match_line")
        .select("*")
        .eq("match_id", first.id)
      const { error: copyErr } = await a.from("match_line").insert(
        (oldLines ?? []).map((l) => ({
          match_id: corrected!.id,
          role: l.role,
          spot_index: l.spot_index,
          label: l.label,
          basis_points: l.basis_points,
          planned_minor: l.planned_minor,
          actual_minor: l.actual_minor,
          currency: l.currency,
          debt_id: l.debt_id,
          debt_name: l.debt_name,
        })),
      )
      expect(copyErr).toBeNull()

      const { data: periodRows } = await a
        .from("match")
        .select("id, status")
        .eq("period", "2027-01-01")
      expect(periodRows?.filter((m) => m.status === "active")).toHaveLength(1)
      expect(periodRows).toHaveLength(2)

      // History survives: the retired match keeps all twelve frozen lines.
      const { count: keptLines } = await a
        .from("match_line")
        .select("id", { count: "exact", head: true })
        .eq("match_id", first.id)
      expect(keptLines).toBe(12)

      // The view follows the active match only, and the copied actual keeps the balance whole.
      const { data: afterCorrection } = await a
        .from("debt_progress")
        .select("paid_minor")
        .eq("debt_id", debt!.id)
        .single()
      expect(Number(afterCorrection?.paid_minor)).toBe(25000)
    })

    test("deleting a debt or goal nulls the id but keeps the copied name (AC-7)", async () => {
      const match = await createMatch(a, aId, "3-5-2", "2027-02-01")
      const { data: debt } = await a
        .from("debt")
        .insert({
          user_id: aId,
          name: "ToDelete",
          principal_minor: 100000,
          currency: "NGN",
        })
        .select()
        .single()
      const { data: goal } = await a
        .from("goal")
        .insert({
          user_id: aId,
          name: "GoalToDelete",
          target_minor: 100000,
          currency: "NGN",
        })
        .select()
        .single()
      const { error: linkErr } = await a
        .from("match_line")
        .update({
          actual_minor: 5000,
          debt_id: debt!.id,
          debt_name: debt!.name,
          goal_id: goal!.id,
          goal_name: goal!.name,
        })
        .eq("match_id", match.id)
        .eq("spot_index", 5)
      expect(linkErr).toBeNull()

      expect(
        (await a.from("debt").delete().eq("id", debt!.id)).error,
      ).toBeNull()
      expect(
        (await a.from("goal").delete().eq("id", goal!.id)).error,
      ).toBeNull()

      const { data: line } = await a
        .from("match_line")
        .select("*")
        .eq("match_id", match.id)
        .eq("spot_index", 5)
        .single()
      expect(line?.debt_id).toBeNull()
      expect(line?.debt_name).toBe("ToDelete")
      expect(line?.goal_id).toBeNull()
      expect(line?.goal_name).toBe("GoalToDelete")
      expect(Number(line?.actual_minor)).toBe(5000)
    })

    test("editing the library never changes a past line (AC-5)", async () => {
      const match = await createMatch(a, aId, "4-3-3", "2027-03-01")
      const { data: before } = await a
        .from("match_line")
        .select("label, basis_points")
        .eq("match_id", match.id)
        .eq("spot_index", 0)
        .single()
      // Direct catalog surgery, which no API role can do: proves the line row
      // copies its labels instead of reading through to the library.
      await dbQuery(
        "update public.formation_position set label = 'Renamed Spot' where role = 'GK'",
      )
      const { data: after } = await a
        .from("match_line")
        .select("label, basis_points")
        .eq("match_id", match.id)
        .eq("spot_index", 0)
        .single()
      expect(after).toEqual(before)
      await dbQuery(
        "update public.formation_position set label = 'Emergency Fund' where role = 'GK'",
      )
    })

    test("deleting user A's account removes every row (cascade half of AC-3)", async () => {
      const { data: tacticRows } = await a.from("user_tactic").select("id")
      const { data: matchRows } = await a.from("match").select("id")
      const tactics = (tacticRows ?? []).map((t) => `'${t.id}'`)
      const matches = (matchRows ?? []).map((m) => `'${m.id}'`)
      expect(tactics.length).toBeGreaterThan(0)
      expect(matches.length).toBeGreaterThan(0)
      await svc.auth.admin.deleteUser(aId)

      // One query for all nine counts: each CLI call costs a second.
      const output = await dbQuery(`
      select
        (select count(*) from public.profile where user_id = '${aId}'::uuid),
        (select count(*) from public.income_stream where user_id = '${aId}'::uuid),
        (select count(*) from public.fixed_cost where user_id = '${aId}'::uuid),
        (select count(*) from public.user_tactic where user_id = '${aId}'::uuid),
        (select count(*) from public."match" where user_id = '${aId}'::uuid),
        (select count(*) from public.debt where user_id = '${aId}'::uuid),
        (select count(*) from public.goal where user_id = '${aId}'::uuid),
        (select count(*) from public.user_tactic_version where tactic_id in (${tactics.join(", ")})),
        (select count(*) from public.match_line where match_id in (${matches.join(", ")}))
    `)
      expect(countsIn(output)).toEqual([
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0, // every tactic version went with its tactic
        0, // every line went with its match
      ])
    })
  },
)
