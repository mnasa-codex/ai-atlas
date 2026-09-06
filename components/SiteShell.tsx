'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Experience from './Experience';
import SiteAtmosphere from './SiteAtmosphere';

function Structure({ children }: { children: ReactNode }) {
  return <>
    <a href="#main-content" className="skip-link">انتقل إلى المحتوى</a>
    <Navbar />
    <main id="main-content" className="main-content">{children}</main>
  </>;
}

export default function SiteShell({ children }: { children: ReactNode }) {
  const rawPath = usePathname() || '/';
  const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const path = base && (rawPath === base || rawPath.startsWith(`${base}/`))
    ? rawPath.slice(base.length) || '/' : rawPath;
  // Keep the author's editor outside both the theme and effect lifecycle.
  if (path === '/admin' || path.startsWith('/admin/')) return <Structure>{children}</Structure>;
  return <Experience><SiteAtmosphere /><Structure>{children}</Structure></Experience>;
}
