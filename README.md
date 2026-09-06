# أطلس — Atlas AI Directory

منصة عربية احترافية لدليل أدوات الذكاء الاصطناعي، مبنية على Next.js + React + Tailwind + Framer Motion، مع أساس جاهز للربط بـ Supabase.

## تشغيل محلي
```bash
npm install
npm run dev
```
ثم افتح `http://localhost:3000`.

## الصفحات
- `/` الرئيسية
- `/tools` مستكشف الأدوات
- `/pricing` مقارنة الأسعار
- `/contact` التواصل
- `/admin` لوحة إدارة معاينة محلية

## Supabase للإنتاج
1. أنشئ مشروع Supabase.
2. نفّذ `supabase/schema.sql`.
3. أنشئ مستخدم Admin في Auth ثم أضف UUID الخاص به إلى `admin_users`.
4. انسخ `.env.example` إلى `.env.local` وأضف المفاتيح.

> الأسعار الموجودة في النسخة الحالية بيانات نموذجية كما نصّت وثيقة المشروع، ويجب مراجعة المصادر الرسمية لحظة الإطلاق وتحديث حقل آخر تحقق.
