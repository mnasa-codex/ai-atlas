"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Loader2, LogIn, LogOut, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import AdminEditor from "@/components/AdminEditor";

export default function AdminPage() {
  const [loading, setLoading] = useState(!!supabase);
  const [isAdmin, setAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const generation = useRef(0);
  const currentUserId = useRef<string | null>(null);
  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    const check = async () => {
      const ticket = ++generation.current;
      setAdmin(false);
      setLoading(true);
      try {
        const { data, error: issue } = await client.auth.getUser();
        if (ticket !== generation.current) return;
        if (issue || !data.user) {
          currentUserId.current = null;
          setCurrentEmail("");
          return;
        }
        currentUserId.current = data.user.id;
        setCurrentEmail(data.user.email || "");
        const member = await client
          .from("admin_users")
          .select("user_id")
          .eq("user_id", data.user.id)
          .maybeSingle();
        if (ticket !== generation.current) return;
        setAdmin(!!member.data && !member.error);
        setError(member.data ? "" : "هذا الحساب لا يملك صلاحية إدارة الدليل.");
      } catch {
        if (ticket === generation.current)
          setError("تعذّر التحقق من الدخول. أعد المحاولة.");
      } finally {
        if (ticket === generation.current) setLoading(false);
      }
    };
    // Keep awaited Supabase calls outside its synchronous auth callback.
    let timer: ReturnType<typeof setTimeout>;
    const { data } = client.auth.onAuthStateChange((event, session) => {
      if (
        event === "TOKEN_REFRESHED" ||
        (event === "SIGNED_IN" && session?.user.id === currentUserId.current)
      )
        return;
      if (event === "SIGNED_OUT") currentUserId.current = null;
      ++generation.current;
      setAdmin(false);
      setLoading(true);
      clearTimeout(timer);
      timer = setTimeout(check, 0);
    });
    void check();
    return () => {
      ++generation.current;
      clearTimeout(timer);
      data.subscription.unsubscribe();
    };
  }, []);
  async function login(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setError("");
    setLoading(true);
    try {
      const { error: issue } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      setPassword("");
      if (issue) {
        setError(
          "تعذّر تسجيل الدخول. تحقق من البريد وكلمة المرور وتأكيد الحساب.",
        );
        setLoading(false);
      }
    } catch {
      setError("تعذّر الاتصال. أعد المحاولة.");
      setLoading(false);
    }
  }
  async function logout() {
    currentUserId.current = null;
    ++generation.current;
    setAdmin(false);
    setCurrentEmail("");
    const result = await supabase?.auth.signOut();
    if (result?.error) setError("تعذّر إنهاء الجلسة. أعد المحاولة.");
  }
  if (!supabase)
    return (
      <div className="workspace">
        <section className="glass rounded-3xl p-8">
          <ShieldCheck className="text-purple" />
          <h1 className="text-3xl font-bold mt-4">إدارة أطلس</h1>
          <p className="text-muted mt-4">
            لم يتم تفعيل اتصال الإدارة بعد. يلزم إعداد Supabase لتسجيل الدخول
            وحفظ الأدوات وتشغيل البحث الذكي.
          </p>
        </section>
      </div>
    );
  if (loading)
    return (
      <div className="workspace" role="status">
        <Loader2 className="animate-spin" />
        <p>جارٍ التحقق من حسابك…</p>
      </div>
    );
  if (isAdmin)
    return (
      <>
        <div className="admin-session">
          <ShieldCheck size={17} />
          <span>{currentEmail}</span>
          <button onClick={logout} className="flex items-center gap-2">
            <LogOut size={16} /> خروج
          </button>
        </div>
        <AdminEditor />
      </>
    );
  return (
    <div className="workspace">
      <section className="glass rounded-3xl p-8 max-w-lg mx-auto mt-8">
        <ShieldCheck size={32} className="text-purple" />
        <div className="eyebrow mt-6">ATLAS STUDIO</div>
        <h1 className="text-3xl font-bold mt-2">مساحتك لصناعة الاكتشاف</h1>
        <p className="text-muted mt-3">
          سجّل الدخول لإضافة الأدوات وتحديث الدليل.
        </p>
        {error && (
          <p role="alert" className="catalog-notice mt-5">
            {error}
          </p>
        )}
        <form onSubmit={login} className="space-y-5 mt-7">
          <label className="block">
            البريد الإلكتروني
            <input
              className="block w-full mt-2 p-3 rounded-xl bg-black/20 border border-white/10"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block">
            كلمة المرور
            <input
              className="block w-full mt-2 p-3 rounded-xl bg-black/20 border border-white/10"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button className="primary-button w-full" type="submit">
            <LogIn size={18} /> دخول إلى الاستوديو
          </button>
        </form>
        {currentEmail && (
          <button onClick={logout} className="mt-5 text-purple">
            الخروج من الحساب الحالي
          </button>
        )}
      </section>
    </div>
  );
}
