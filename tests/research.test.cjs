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

const draft = {
  found: true,
  report: "ملخص آلي يحتاج مراجعة.",
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

const completion = (value = draft) =>
  new Response(
    JSON.stringify({
      choices: [{ message: { content: JSON.stringify(value) } }],
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );

const modelList = (...ids) =>
  new Response(JSON.stringify({ data: ids.map((id) => ({ id })) }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

test("creates a review-only draft without inventing unknown prices", async () => {
  const calls = [];
  const mock = async (url, opts = {}) => {
    calls.push({ url, opts });
    return url.endsWith("/models") ? modelList("glm-test") : completion();
  };

  const result = await researchTool(
    "Test AI",
    "test-secret",
    "https://kiosapi.com/v1/",
    "glm-test",
    mock,
  );

  assert.equal(result.tool.plans[0].monthly, undefined);
  assert.equal(result.tool.featured, false);
  assert.match(result.tool.plans[0].verified, /تحتاج مراجعة بشرية/);
  assert.equal(result.provider, "kiosapi");
  assert.equal(result.modelUsed, "glm-test");
  assert.equal(result.verificationMode, "model_knowledge_only");
  assert.equal(calls.length, 2);
  assert.equal(calls[1].url, "https://kiosapi.com/v1/chat/completions");
  assert.equal(JSON.parse(calls[1].opts.body).model, "glm-test");
  assert.equal(calls.some((call) => call.url.includes("test-secret")), false);
  assert.equal(JSON.stringify(result).includes("test-secret"), false);
});

test("an uncertain model answer never becomes a draft", async () => {
  await assert.rejects(
    () =>
      researchTool(
        "Unknown",
        "key",
        "https://kiosapi.com/v1/",
        "glm-test",
        async (url) =>
          url.endsWith("/models")
            ? modelList("glm-test")
            : completion({
                found: false,
                report: "لا يمكن تحديد الأداة من الاسم وحده.",
                tool: null,
              }),
      ),
    /لا يمكن تحديد الأداة/,
  );
});

test("malformed or unsafe generated data is rejected", async () => {
  for (const change of [
    (value) => (value.tool.website = "javascript:alert(1)"),
    (value) => (value.tool.plans[0].monthly = -1),
    (value) => (value.found = false),
  ]) {
    const bad = structuredClone(draft);
    change(bad);
    await assert.rejects(() =>
      researchTool(
        "Test",
        "key",
        "https://kiosapi.com/v1/",
        "glm-test",
        async (url) =>
          url.endsWith("/models") ? modelList("glm-test") : completion(bad),
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
        "https://kiosapi.com/v1/",
        "glm-test",
        async (url) =>
          url.endsWith("/models")
            ? new Response("unavailable", { status: 503 })
            : new Response("sensitive provider error", { status: 429 }),
      ),
    (error) =>
      error.status === 429 &&
      !error.message.includes("secret") &&
      !error.message.includes("sensitive provider error"),
  );
});

test("uses a listed GLM fallback after a temporary model failure", async () => {
  const models = [];
  const result = await researchTool(
    "Test",
    "secret",
    "https://kiosapi.com/v1/",
    "glm-primary",
    async (url, opts = {}) => {
      if (url.endsWith("/models"))
        return modelList("glm-primary", "glm-5.3-flash-backup");
      const model = JSON.parse(opts.body).model;
      models.push(model);
      return model === "glm-primary"
        ? new Response("temporarily unavailable", { status: 503 })
        : completion();
    },
  );

  assert.deepEqual(models, ["glm-primary", "glm-5.3-flash-backup"]);
  assert.equal(result.modelUsed, "glm-5.3-flash-backup");
  assert.equal(result.fallbackUsed, true);
});


test("free GLM mode never falls back to a paid model", async () => {
  const attempted = [];
  await assert.rejects(
    () =>
      researchTool(
        "Test",
        "secret",
        "https://kiosapi.com/v1/",
        "glm-5.3-flash",
        async (url, opts = {}) => {
          if (url.endsWith("/models"))
            return modelList("glm-5.3-flash", "glm-5.3", "glm-5.2");
          attempted.push(JSON.parse(opts.body).model);
          return new Response(
            "No available channel for model glm-5.3-flash under group default (request id: private-id)",
            { status: 503 },
          );
        },
      ),
    (error) =>
      error.status === 503 &&
      error.message.includes("Free") &&
      error.message.includes("default") &&
      !error.message.includes("private-id"),
  );
  assert.deepEqual(attempted, ["glm-5.3-flash"]);
});

test("temporary provider failures do not expose upstream diagnostics", async () => {
  await assert.rejects(
    () =>
      researchTool(
        "Test",
        "secret",
        "https://kiosapi.com/v1/",
        "glm-5.3-flash",
        async (url) =>
          url.endsWith("/models")
            ? modelList("glm-5.3-flash")
            : new Response("internal route and request id: hidden-123", {
                status: 503,
              }),
      ),
    (error) =>
      error.status === 503 &&
      /غير متاح مؤقتاً/.test(error.message) &&
      !error.message.includes("hidden-123"),
  );
});


test("free GLM timeout accommodates the provider's slower response time", () => {
  const source = fs.readFileSync(
    path.resolve("supabase/functions/_shared/research.ts"),
    "utf8",
  );
  assert.match(source, /AbortSignal\.timeout\(95000\)/);
  assert.doesNotMatch(source, /AbortSignal\.timeout\(30000\)/);
  assert.match(source, /max_tokens: 2600/);
  assert.match(source, /at most 6 plans/);
});
