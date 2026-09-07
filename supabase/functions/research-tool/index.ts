import { createClient } from "npm:@supabase/supabase-js@2.57.0";
import { researchTool, ResearchError } from "../_shared/research.ts";

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") || "";
  const allowed = (Deno.env.get("ALLOWED_ORIGINS") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    Vary: "Origin",
    ...(allowed.includes(origin)
      ? { "Access-Control-Allow-Origin": origin }
      : {}),
    "Access-Control-Allow-Headers":
      "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers });
  if (!origin || !allowed.includes(origin))
    return json({ error: "هذا الموقع غير مخوّل باستخدام خدمة البحث." }, 403);
  if (req.method === "OPTIONS")
    return new Response(null, { status: 204, headers });
  if (req.method !== "POST")
    return json({ error: "طريقة الطلب غير مدعومة." }, 405);
  const authorization = req.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer "))
    return json({ error: "سجّل الدخول أولاً." }, 401);
  try {
    const client = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: { headers: { Authorization: authorization } },
        auth: { persistSession: false, autoRefreshToken: false },
      },
    );
    const { data: user, error: authError } = await client.auth.getUser(
      authorization.slice(7),
    );
    if (authError || !user.user)
      return json({ error: "انتهت جلسة الدخول." }, 401);
    const member = await client
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.user.id)
      .maybeSingle();
    if (member.error || !member.data)
      return json({ error: "هذه العملية متاحة للمسؤولين فقط." }, 403);
    const reader = req.body?.getReader();
    if (!reader) return json({ error: "اسم الأداة مطلوب." }, 400);
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > 2048) {
        await reader.cancel();
        return json({ error: "الطلب أطول من المسموح." }, 413);
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    let body;
    try {
      body = JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      return json({ error: "صيغة الطلب غير صالحة." }, 400);
    }
    if (
      typeof body?.name !== "string" ||
      body.name.trim().length < 2 ||
      body.name.length > 160
    )
      return json({ error: "اكتب اسم أداة من 2 إلى 160 حرفاً." }, 400);
    const key = Deno.env.get("GEMINI_API_KEY"),
      model = Deno.env.get("GEMINI_MODEL");
    if (!key || !model)
      return json(
        {
          error:
            "لم يُفعّل اتصال Gemini بعد. أضف مفتاح الخدمة والنموذج في إعدادات الخادم.",
        },
        503,
      );
    const quota = await client.rpc("consume_atlas_research_quota");
    if (quota.error)
      return json(
        { error: "تعذّر التحقق من حصة البحث. تحقق من إعداد قاعدة البيانات." },
        503,
      );
    if (quota.data !== true)
      return json(
        { error: "بلغت حد 10 عمليات بحث في الساعة. حاول لاحقاً." },
        429,
      );
    return json(await researchTool(body.name.trim(), key, model));
  } catch (error) {
    if (error instanceof ResearchError)
      return json({ error: error.message }, error.status);
    return json({ error: "تعذّر إكمال البحث. لم يتم نشر أي تغييرات." }, 502);
  }
});
