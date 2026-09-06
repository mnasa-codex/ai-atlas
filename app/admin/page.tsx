'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Loader2, LogIn, LogOut, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AdminEditor from '@/components/AdminEditor';

const errorMessage = (message: string) => {
  if (/invalid login credentials/i.test(message)) return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
  if (/email not confirmed/i.test(message)) return 'يجب تأكيد البريد الإلكتروني أولًا من رسالة Supabase.';
  return message;
};

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      if (!supabase) {
        if (mounted) {
          setError('إعدادات Supabase غير متوفرة في نسخة النشر الحالية.');
          setLoading(false);
        }
        return;
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (!mounted) return;

      if (sessionError) {
        setError(sessionError.message);
        setLoading(false);
        return;
      }

      const user = sessionData.session?.user;
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      await verifyAdmin(user.id, user.email ?? '', mounted);
    };

    const { data: listener } = supabase?.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted || !session?.user) return;
      await verifyAdmin(session.user.id, session.user.email ?? '', mounted);
    }) ?? { data: { subscription: null } };

    checkSession();

    return () => {
      mounted = false;
      listener.subscription?.unsubscribe();
    };
  }, []);

  async function verifyAdmin(userId: string, userEmail: string, mounted = true) {
    if (!supabase) return;
    setChecking(true);
    setError('');

    const { data, error: adminError } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!mounted) return;

    setChecking(false);
    setLoading(false);

    if (adminError) {
      setIsAdmin(false);
      setError('تعذر التحقق من صلاحيات الأدمن. تأكد من أن الحساب مضاف إلى admin_users.');
      return;
    }

    if (!data) {
      setIsAdmin(false);
      setCurrentEmail(userEmail);
      setError('هذا الحساب مسجّل دخول، لكنه غير مخوّل كأدمن.');
      return;
    }

    setCurrentEmail(userEmail);
    setIsAdmin(true);
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;

    setChecking(true);
    setError('');

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setChecking(false);
      setError(errorMessage(signInError.message));
      return;
    }

    if (!data.user) {
      setChecking(false);
      setError('تم تسجيل الدخول بدون حساب مستخدم صالح.');
      return;
    }

    await verifyAdmin(data.user.id, data.user.email ?? email.trim());
  }

  async function handleLogout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setIsAdmin(false);
    setCurrentEmail('');
    setEmail('');
    setPassword('');
    setError('');
  }

  if (loading || checking) {
    return (
      <main className="min-h-screen grid place-items-center px-5">
        <div className="glass rounded-3xl px-8 py-7 text-center">
          <Loader2 className="mx-auto animate-spin" size={28} />
          <p className="mt-3 text-sm text-muted">جارٍ التحقق من صلاحيات الأدمن…</p>
        </div>
      </main>
    );
  }

  if (!supabase) {
    return (
      <main className="min-h-screen grid place-items-center px-5">
        <div className="glass max-w-md rounded-3xl p-7 text-center">
          <h1 className="text-2xl font-extrabold">إعداد Supabase غير مكتمل</h1>
          <p className="mt-3 text-sm text-muted">نسخة GitHub Pages الحالية لا تحتوي على متغيرات Supabase المطلوبة لتسجيل الدخول.</p>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen grid place-items-center px-5 pt-24 pb-16">
        <section className="glass w-full max-w-md rounded-3xl p-7 md:p-8">
          <div className="h-14 w-14 rounded-2xl bg-gold/10 grid place-items-center text-gold">
            <ShieldCheck size={26} />
          </div>
          <h1 className="mt-5 text-3xl font-extrabold">دخول لوحة إدارة أطلس</h1>
          <p className="mt-2 text-sm text-muted">سجّل الدخول بالحساب المرتبط بصلاحية الأدمن.</p>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-xs text-muted">البريد الإلكتروني</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 p-3.5 outline-none focus:border-gold/40"
                placeholder="admin@example.com"
              />
            </label>

            <label className="block">
              <span className="text-xs text-muted">كلمة المرور</span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 p-3.5 outline-none focus:border-gold/40"
                placeholder="••••••••"
              />
            </label>

            <button
              type="submit"
              disabled={checking}
              className="w-full rounded-2xl bg-gold px-5 py-3.5 font-bold text-[#090A0F] disabled:opacity-60"
            >
              {checking ? <Loader2 className="mx-auto animate-spin" size={19} /> : <><LogIn size={18} className="inline ml-2" /> تسجيل الدخول</>}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <>
      <div className="fixed left-5 top-5 z-50 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-xs backdrop-blur-xl">
        <ShieldCheck size={15} className="text-gold" />
        <span className="text-muted">{currentEmail}</span>
        <button onClick={handleLogout} className="mr-1 rounded-xl p-1.5 hover:bg-white/10" aria-label="تسجيل الخروج">
          <LogOut size={14} />
        </button>
      </div>
      <AdminEditor />
    </>
  );
}
