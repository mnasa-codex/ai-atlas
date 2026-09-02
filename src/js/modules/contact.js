import { $ } from "../lib/dom.js";
export function initContact() { $("[data-contact]")?.addEventListener("click", () => document.body.classList.toggle("contact-open")); }
