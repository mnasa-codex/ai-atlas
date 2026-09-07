const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const vm = require("node:vm");
const path = require("node:path");
function load(file) {
  const context = {
    exports: {},
    URL,
    AbortSignal,
    fetch,
    require: (id) =>
      id.startsWith(".")
        ? load(path.resolve(path.dirname(file), id))
        : require(id),
  };
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    context,
  );
  return context.exports;
}
const { researchTool } = load(
  path.resolve("supabase/functions/_shared/research.ts"),
);
const candidate = (text, grounded = false) => ({
  candidates: [
    {
      finishReason: "STOP",
      content: { parts: [{ text }] },
      ...(grounded
        ? {
            groundingMetadata: {
              groundingChunks: [
                {
                  web: {
                    title: "Official source",
                    uri: "https://example.com/pricing",
                  },
                },
              ],
            },
          }
        : {}),
    },
  ],
});
const draft = {
  found: true,
  tool: {
    id: "test-ai",
    name: "Test AI",
    vendor: "Test",
    category: "chat",
    logo: "T",
    hook: "وصف",
    description: "تفاصيل",
    website: "https://example.com",
    plans: [
      {
        name: "Paid",
        bestFor: "العمل",
        features: ["بحث"],
        source: "https://example.com/pricing",
      },
    ],
  },
};
test("research requires grounding and does not invent unknown prices or claim human verification", async () => {
  const calls = [];
  const mock = async (url, opts) => {
    calls.push({ url, body: JSON.parse(opts.body), headers: opts.headers });
    return new Response(
      JSON.stringify(
        calls.length === 1
          ? candidate("Official research report", true)
          : candidate(JSON.stringify(draft)),
      ),
      { status: 200 },
    );
  };
  const result = await researchTool(
    "Test AI",
    "test-secret",
    "gemini-test",
    mock,
  );
  assert.equal(result.tool.plans[0].monthly, undefined);
  assert.equal(result.tool.featured, false);
  assert.match(result.tool.plans[0].verified, /يحتاج مراجعة بشرية/);
  assert.equal(calls.length, 2);
  assert.ok(calls[0].body.tools[0].google_search);
  assert.equal(calls[0].url.includes("test-secret"), false);
  assert.equal(JSON.stringify(result).includes("test-secret"), false);
});
test("ungrounded answer never becomes a draft", async () => {
  let calls = 0;
  await assert.rejects(
    () =>
      researchTool("Test", "key", "gemini-test", async () => {
        calls++;
        return new Response(JSON.stringify(candidate("No sources")));
      }),
    /مصادر/,
  );
  assert.equal(calls, 1);
});
test("malformed or unsafe generated data is rejected", async () => {
  for (const change of [
    (t) => (t.tool.website = "javascript:alert(1)"),
    (t) => (t.tool.plans[0].monthly = -1),
    (t) => (t.found = false),
  ]) {
    const bad = structuredClone(draft);
    change(bad);
    let calls = 0;
    await assert.rejects(() =>
      researchTool(
        "Test",
        "key",
        "gemini-test",
        async () =>
          new Response(
            JSON.stringify(
              ++calls === 1
                ? candidate("Report", true)
                : candidate(JSON.stringify(bad)),
            ),
          ),
      ),
    );
  }
});
test("upstream rate limit is reported without leaking provider response or key", async () => {
  await assert.rejects(
    () =>
      researchTool(
        "Test",
        "secret",
        "gemini-test",
        async () => new Response("sensitive provider error", { status: 429 }),
      ),
    (e) => e.status === 429 && !e.message.includes("secret"),
  );
});
