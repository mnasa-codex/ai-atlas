const fs = require("node:fs");
const assert = require("node:assert/strict");
const catalog = require("../data/catalog.json");
const base = process.env.NEXT_PUBLIC_BASE_PATH || "/ai-atlas";
for (const route of [
  "index.html",
  "tools/index.html",
  "pricing/index.html",
  "contact/index.html",
  "admin/index.html",
  "tool/index.html",
  ...catalog.map((t) => `tools/${t.id}/index.html`),
]) {
  const html = fs.readFileSync("out/" + route, "utf8");
  assert.ok(html.includes('dir="rtl"'), route);
  assert.ok(html.includes(base + "/_next/"), route);
  for (const [, src] of html.matchAll(
    /(?:src|href)="([^"?]+\/_next\/[^"?]+)(?:\?[^"\s]*)?"/g,
  )) {
    assert.ok(
      fs.existsSync("out" + decodeURIComponent(src.replace(base, ""))),
      src,
    );
  }
  assert.ok(!html.includes("GEMINI_API_KEY"), route);
  console.log("PASS static route and assets:", route);
}
assert.ok(fs.existsSync("out/404.html"));
assert.ok(fs.existsSync("out/.nojekyll"));
assert.ok(fs.statSync("out/textures/earth-day.jpg").size > 100000);
assert.ok(!fs.existsSync("out/api"));
console.log("PASS export, admin sign-in shell, Earth texture, no API secrets");
