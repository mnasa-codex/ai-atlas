import { setDocumentLanguage } from "../lib/rtl.js";
export function initLangSwitch() { document.querySelectorAll("[data-lang]").forEach((el) => el.addEventListener("click", () => setDocumentLanguage(el.dataset.lang))); }
