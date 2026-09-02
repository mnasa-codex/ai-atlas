import fs from "node:fs";
const required = ["package.json", "site.config.json", "i18n/ar.json", "i18n/en.json", "content/midjourney.json", "scripts/build-pages.mjs"];
for (const file of required) { if (!fs.existsSync(file)) throw new Error("Missing required file: " + file); }
for (const file of ["site.config.json", "i18n/ar.json", "i18n/en.json", "content/midjourney.json"]) JSON.parse(fs.readFileSync(file, "utf8"));
if (fs.existsSync(".env")) throw new Error("Do not commit .env; use environment variables locally.");
console.log("Validation passed.");
