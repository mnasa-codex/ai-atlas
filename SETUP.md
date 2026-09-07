# حالة التفعيل

طُبق ترحيل أطلس على مشروع `manasa` (`mwsrxmzyifomtbegcqqs`) ونُشرت خدمة `research-tool` بنجاح. حساب المسؤول الموجود محفوظ. أضف فقط `GEMINI_API_KEY` في [أسرار الخدمة](https://supabase.com/dashboard/project/mwsrxmzyifomtbegcqqs/functions/secrets). النموذج وأصل الموقع مضبوطتان افتراضياً في الخدمة المنشورة، ويمكن تغييرهما اختيارياً بالمتغيرات أدناه. يتطلب اختبار البحث الحقيقي مفتاحاً صالحاً.

# تفعيل Supabase وGemini

## 1. قاعدة البيانات

في مشروع Supabase الخاص بأطلس، طبّق `supabase/migrations/202609070001_atlas_catalog.sql` كترحيل واحد. الترحيل إضافي؛ لا يعدّل جداول الأدوات القديمة. لا تعِد تنفيذه بعد نجاحه.

أنشئ حساب المسؤول عبر Supabase Auth إذا لم يوجد، ثم أضف معرّف الحساب الصحيح إلى `public.admin_users` من جلسة SQL موثوقة. لا تضع صلاحية إضافة المسؤولين في المتصفح. إذا كانت العضوية موجودة فلا يلزم إنشاؤها مجدداً.

الجداول الجديدة: `atlas_catalog`، `atlas_catalog_history`، `atlas_research_usage`. لا يلزم نسخ بيانات أولية: أول نشر من الاستوديو ينشئ الكتالوج. جميع الكتابات عبر RPC محمي بصلاحية المسؤول. جدول التاريخ يحتفظ بالنسخ السابقة ويمكن استعادتها عبر نشر نسخة سابقة مع رقم المراجعة الحالي؛ لا تكتب مباشرة فوق الجدول.

## 2. الواجهة

أضف إلى GitHub Actions secrets، أو `.env.local` للتطوير:

- `NEXT_PUBLIC_SUPABASE_URL`: رابط مشروع أطلس.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: المفتاح العام فقط، وليس `service_role`.
- `NEXT_PUBLIC_BASE_PATH=/ai-atlas` مضبوط في سير النشر.

هذه الإعدادات عامة وتتضمّنها حزمة المتصفح. Gemini لا يستخدمها كمفتاح سري.

## 3. أسرار Edge Function

من Supabase Dashboard → Edge Functions → Secrets، أضف:

- `GEMINI_API_KEY`: مفتاح Gemini API. لا ترسله في المحادثة ولا تضعه في المستودع.
- `GEMINI_MODEL`: معرّف نموذج متاح لحسابك يدعم `generateContent` وGoogle Search وJSON schema. مثال موثق عند التنفيذ: `gemini-3.7-flash`؛ تحقق من توفره في حسابك. النموذج الافتراضي المضبوط هو `gemini-3.7-flash`، وهذا المتغير اختياري لتغييره.
- `ALLOWED_ORIGINS` (اختياري؛ الافتراضي `https://mnasa-codex.github.io`): أصول الواجهة مفصولة بفواصل، دون مسار أو شرطة نهائية. مثال الإنتاج: `https://mnasa-codex.github.io`. أضف `http://localhost:3000` للتطوير عند الحاجة.

`SUPABASE_URL` و`SUPABASE_ANON_KEY` يوفرهما Supabase داخل Edge Functions.

## 4. نشر الخدمة

من مجلد المشروع باستخدام Supabase CLI المرتبط بالمشروع الصحيح:

```bash
supabase functions deploy research-tool
```

إعداد `verify_jwt=false` في `supabase/config.toml` يتجاوز التحقق القديم في البوابة فقط. الخدمة نفسها تتحقق من جلسة المستخدم عبر `auth.getUser` ومن عضويته في `admin_users` قبل الاتصال بـGemini. لا تنشر نسخة تحذف هذين الشرطين.

الخدمة تسمح بـ10 عمليات بحث لكل مسؤول في نافذة ساعة. كل عملية تستخدم طلبين إلى Gemini (البحث ثم التنظيم)، وقد تترتب رسوم وفق حساب Google. لا يوجد إعادة طلب تلقائية. الأخطاء لا تنشر محتوى ولا تكشف رد المزود الخام.

## 5. فحص التفعيل

- زائر غير مسجل لا يستطيع استدعاء الخدمة أو نشر الكتالوج.
- مستخدم عادي لا يستطيع منح نفسه صلاحية مسؤول.
- مسؤول يبحث عن أداة معروفة: تظهر مسودة عربية ومصادر حقيقية، ولا تتغير المكتبة قبل النشر.
- بعد المراجعة والنشر، افتح المكتبة في جلسة جديدة وتحقق من ظهور الأداة.
- افتح محررين على نفس المراجعة: بعد نشر أحدهما، يجب رفض نشر الآخر بتعارض مراجعة.
- مفتاح Gemini لا يظهر في طلبات المتصفح أو مخرجات `out`.

المراجع: [Google Search grounding](https://ai.google.dev/gemini-api/docs/google-search)، [generateContent](https://ai.google.dev/api/generate-content)، [Structured output](https://ai.google.dev/gemini-api/docs/structured-output)، [Supabase Edge authentication](https://supabase.com/docs/guides/functions/auth).
