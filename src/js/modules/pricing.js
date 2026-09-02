import { $$ } from "../lib/dom.js";
export function initPricing() { $$("[data-billing]").forEach((button) => button.addEventListener("click", () => { $$("[data-billing]").forEach((b) => b.classList.remove("active")); button.classList.add("active"); })); }
