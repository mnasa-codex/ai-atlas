const { PGlite } = require("@electric-sql/pglite");
const fs = require("fs");
const assert = require("assert/strict");
(async () => {
  const db = new PGlite();
  await db.exec(
    `create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon;`,
  );
  await db.exec(
    fs.readFileSync(
      "supabase/migrations/202609070001_atlas_catalog.sql",
      "utf8",
    ),
  );
  const admin = "11111111-1111-1111-1111-111111111111";
  const nonadmin = "22222222-2222-2222-2222-222222222222";
  await db.query("insert into auth.users(id) values($1),($2)", [
    admin,
    nonadmin,
  ]);
  await db.query("insert into public.admin_users(user_id) values($1)", [admin]);
  const catalog = JSON.parse(fs.readFileSync("data/catalog.json"));
  await db.exec("set role authenticated");
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
    nonadmin,
  ]);
  await assert.rejects(
    () =>
      db.query("select publish_atlas_catalog($1::jsonb,0)", [
        JSON.stringify(catalog),
      ]),
    /ADMIN_REQUIRED/,
  );
  await assert.rejects(
    () => db.query("select consume_atlas_research_quota()"),
    /ADMIN_REQUIRED/,
  );
  await assert.rejects(
    () => db.query("insert into admin_users(user_id) values($1)", [nonadmin]),
    /permission denied/,
  );
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
    admin,
  ]);
  assert.equal(
    (
      await db.query("select publish_atlas_catalog($1::jsonb,0) as rev", [
        JSON.stringify(catalog),
      ])
    ).rows[0].rev,
    1,
  );
  await assert.rejects(
    () =>
      db.query("select publish_atlas_catalog($1::jsonb,0)", [
        JSON.stringify(catalog),
      ]),
    /CATALOG_CONFLICT/,
  );
  const bad = structuredClone(catalog);
  bad[0].plans[0].monthly = -1;
  await assert.rejects(
    () =>
      db.query("select publish_atlas_catalog($1::jsonb,1)", [
        JSON.stringify(bad),
      ]),
    /INVALID_PRICE/,
  );
  bad[0].plans[0].monthly = 0;
  bad[0].plans[0].features = [null];
  await assert.rejects(
    () =>
      db.query("select publish_atlas_catalog($1::jsonb,1)", [
        JSON.stringify(bad),
      ]),
    /INVALID_FEATURES/,
  );
  assert.equal(
    (
      await db.query("select publish_atlas_catalog($1::jsonb,1) as rev", [
        JSON.stringify(catalog),
      ])
    ).rows[0].rev,
    2,
  );
  assert.equal(
    (await db.query("select count(*)::int as n from atlas_catalog_history"))
      .rows[0].n,
    1,
  );
  for (let i = 0; i < 10; i++)
    assert.equal(
      (await db.query("select consume_atlas_research_quota() as ok")).rows[0]
        .ok,
      true,
    );
  assert.equal(
    (await db.query("select consume_atlas_research_quota() as ok")).rows[0].ok,
    false,
  );
  await db.exec("reset role; set role anon");
  assert.equal(
    (await db.query("select revision from atlas_catalog")).rows[0].revision,
    2,
  );
  await assert.rejects(
    () =>
      db.query("select publish_atlas_catalog($1::jsonb,2)", [
        JSON.stringify(catalog),
      ]),
    /permission denied/,
  );
  await assert.rejects(
    () => db.query("select * from atlas_catalog_history"),
    /permission denied/,
  );
  console.log(
    "PASS PostgreSQL migration, RLS, non-admin rejection, catalog publishing, revision conflict, malformed data, history, 10/hour quota, anonymous read-only access",
  );
  await db.close();
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
