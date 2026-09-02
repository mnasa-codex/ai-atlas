import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

function loadEnv() {
  if (fs.existsSync(".env")) {
    const envFile = fs.readFileSync(".env", "utf-8");
    for (const line of envFile.split("\n")) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) process.env[match[1]] = (match[2] || "").trim();
    }
  }
}
loadEnv();

const PORT = 5174;
const HOST = "127.0.0.1";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function generateToolWithGemini(toolName) {
  if (!GEMINI_API_KEY) throw new Error("مفتاح GEMINI_API_KEY غير موجود بملف .env!");

  const prompt = `أنت محلل برمجيات خبير. أنتج JSON مطابق للمخطط التالي عن الأداة: "${toolName}".
قواعد إلزامية:
1. أخرج JSON صالح فقط بدون نصوص تمهيدية.
2. الأسعار: اضبط دائماً pricing.plans[].price.amount = null واضبط contact_for_price = true لأن الأسعار يدخلها الأدمن يدوياً.
3. كل الحقول النصية ثنائية اللغة: { "ar": "...", "en": "..." }.`;

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.2 }
    })
  });

  if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);
  const result = await response.json();
  return JSON.parse(result.candidates?.[0]?.content?.parts?.[0]?.text);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${HOST}:${PORT}`);

  if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(fs.readFileSync("admin/index.html", "utf-8"));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/generate") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      const { toolName } = JSON.parse(body);
      res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" });

      const send = (step) => res.write(`data: ${JSON.stringify({ step })}\n\n`);

      try {
        send("1. الاتصال بـ Gemini API واستخراج البيانات...");
        const data = await generateToolWithGemini(toolName);
        send("2. حفظ المحتوى وقفل حقول الأسعار...");
        fs.writeFileSync(`content/${data.slug}.json`, JSON.stringify(data, null, 2), "utf-8");
        send("3. إعادة بناء الصفحات وتحديث الفهارس...");
        execSync("node scripts/build-pages.mjs");
        send("Complete");
        res.end();
      } catch (err) {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
      }
    });
    return;
  }
  res.writeHead(404);
  res.end();
});

server.listen(PORT, HOST, () => console.log(`🚀 لوحة الأدمن تعمل على: http://${HOST}:${PORT}`));