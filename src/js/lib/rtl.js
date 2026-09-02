export function setDocumentLanguage(lang) {
  const isArabic = lang === "ar";
  document.documentElement.lang = lang;
  document.documentElement.dir = isArabic ? "rtl" : "ltr";
  localStorage.setItem("ai-atlas-lang", lang);
}
