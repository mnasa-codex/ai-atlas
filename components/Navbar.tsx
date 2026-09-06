'use client';
import Link from 'next/link';
import { Compass, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar(){
  const [open,setOpen]=useState(false);
  const links=[['الرئيسية','/'],['الأدوات','/tools'],['الأسعار','/pricing'],['تواصل','/contact']];
  return <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#05060A]/65 backdrop-blur-xl">
    <div className="mx-auto max-w-7xl px-5 md:px-8 h-20 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-3 font-extrabold tracking-wide">
        <span className="relative grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-gold/30 to-purple/20 gold-border shadow-gold-glow"><Compass size={21}/><span className="absolute h-2 w-2 rounded-full bg-gold blur-[1px]"/></span>
        <span className="text-xl">أطلس</span><span className="hidden sm:block text-xs font-medium text-muted">AI DIRECTORY</span>
      </Link>
      <nav className="hidden md:flex items-center gap-2">{links.map(([label,href])=><Link key={href} href={href} className="px-4 py-2 rounded-full text-sm text-muted hover:text-ink hover:bg-white/5 transition">{label}</Link>)}</nav>
      <button onClick={()=>setOpen(v=>!v)} className="md:hidden p-2 text-muted" aria-label="القائمة">{open?<X/>:<Menu/>}</button>
    </div>
    {open&&<nav className="md:hidden border-t border-white/5 bg-[#080912]/95 p-4">{links.map(([label,href])=><Link onClick={()=>setOpen(false)} key={href} href={href} className="block py-3 text-muted hover:text-ink">{label}</Link>)}</nav>}
  </header>
}
