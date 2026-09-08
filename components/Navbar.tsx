"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Compass, LayoutGrid, Layers3, MessageCircle, ArrowUpLeft, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const publicLinks = [
  { name: "نظرة عامة", href: "/", icon: Compass },
  { name: "مكتبة الأدوات", href: "/tools", icon: LayoutGrid },
  { name: "مقارنة الخطط", href: "/pricing", icon: Layers3 },
  { name: "تواصل معنا", href: "/contact", icon: MessageCircle },
];

export default function Navbar() {
  const rawPath = usePathname();
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const path = (base && rawPath.startsWith(base) ? rawPath.slice(base.length) : rawPath).replace(/\/$/, "") || "/";
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("atlas-sidebar-collapsed") === "1");
    } catch {}
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      const next = !value;
      try {
        localStorage.setItem("atlas-sidebar-collapsed", next ? "1" : "0");
      } catch {}
      return next;
    });
  };

  return (
    <>
      <header className="mobile-header">
        <Link href="/" className="brand">
          أطلس <span>ATLAS</span>
        </Link>
        <button aria-label="القائمة" aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </header>
      {open && <button aria-label="إغلاق القائمة" className="nav-scrim" onClick={() => setOpen(false)} />}

      <aside id="main-navigation" className={`sidebar ${open ? "is-open" : ""} ${collapsed ? "is-collapsed" : ""}`}>
        <div className="sidebar-head">
          <Link href="/" className="brand" onClick={() => setOpen(false)} aria-label="أطلس">
            <span className="brand-symbol"><Compass size={27} /></span>
            <div className="sidebar-brand-copy">أطلس<small>ATLAS INTELLIGENCE</small></div>
          </Link>
          <button type="button" className="sidebar-collapse" onClick={toggleCollapsed} aria-label={collapsed ? "توسيع القائمة الجانبية" : "طي القائمة الجانبية"} title={collapsed ? "توسيع القائمة" : "طي القائمة"}>
            <ChevronRight size={17} className={collapsed ? "rotate-180" : ""} />
          </button>
        </div>

        <div className="sidebar-caption">مساحة الاكتشاف</div>
        <nav aria-label="التنقل الرئيسي">
          {publicLinks.map(({ name, href, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={path === href ? "page" : undefined} className={`nav-item ${path === href ? "active" : ""}`} title={collapsed ? name : undefined}>
              <Icon size={19} />
              <span>{name}</span>
              {path === href && <span className="nav-marker" />}
            </Link>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <MessageCircle size={22} />
            <h3>اختيارك القادم أوضح</h3>
            <p>مساعدة مباشرة لاختيار الأداة المناسبة لعملك.</p>
            <Link href="/contact" onClick={() => setOpen(false)}>تحدث معنا <ArrowUpLeft size={17} /></Link>
          </div>
          <div className="sidebar-foot"><span>عربي / AR</span><span>دليل أطلس</span></div>
        </div>
      </aside>
    </>
  );
}
