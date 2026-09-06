'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Check, X } from 'lucide-react';
import type { Tool } from '@/lib/tools';
import { demoSettings } from '@/lib/tools';

export default function ToolModal({tool,onClose}:{tool:Tool|null;onClose:()=>void}){
 if(!tool) return null;
 const whatsapp=`https://wa.me/${demoSettings.whatsappNumber}?text=${encodeURIComponent(`مرحبا، بدي استفسر عن ${tool.name} عبر منصة أطلس`)}`;
 return <AnimatePresence>{tool&&<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[60] bg-black/70 p-4 md:p-8 grid place-items-center" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
   <motion.div initial={{opacity:0,y:24,scale:.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:24,scale:.98}} className="w-full max-w-3xl max-h-[88vh] overflow-auto glass rounded-[32px] p-6 md:p-8 shadow-purple-glow">
    <div className="flex items-start justify-between"><div className="flex items-center gap-4"><div className="h-16 w-16 rounded-2xl grid place-items-center bg-purple/10 gold-border text-xl font-bold">{tool.logo}</div><div><div className="text-xs text-gold mb-1">{tool.vendor}</div><h3 className="text-3xl font-extrabold">{tool.name}</h3></div></div><button onClick={onClose} className="p-2 text-muted hover:text-ink"><X/></button></div>
    <p className="mt-6 text-muted leading-8">{tool.description}</p>
    <div className="mt-8 rounded-3xl border border-white/7 bg-black/20 p-5"><div className="flex items-center justify-between mb-4"><h4 className="font-bold">الأسعار</h4><span className="text-xs text-muted">بيانات نموذجية — تحقّق من المصدر</span></div><div className="grid md:grid-cols-2 gap-4">{tool.plans.map(p=><div key={p.name} className="rounded-2xl border border-white/7 p-4"><div className="flex items-end justify-between gap-4"><div className="font-bold">{p.name}</div><div className="font-mono text-gold text-xl">{p.custom?'مخصص':`$${p.monthly}`}{p.monthly?' / شهر':''}</div></div><div className="mt-4 space-y-2">{p.features.map(f=><div key={f} className="flex items-center gap-2 text-sm text-muted"><Check size={14} className="text-gold"/>{f}</div>)}</div><div className="mt-4 text-[11px] text-muted">آخر تحقق: {p.verified}</div></div>)}</div></div>
    <div className="mt-8 flex flex-col sm:flex-row gap-3"><a href={whatsapp} target="_blank" rel="noreferrer" className="flex-1 rounded-2xl bg-gold text-[#090A0F] font-extrabold py-3.5 text-center hover:brightness-110 transition">فعّلها لي عبر واتساب</a><a href={tool.website} target="_blank" rel="noreferrer" className="rounded-2xl border border-white/10 px-5 py-3.5 text-center text-sm hover:bg-white/5 transition">الموقع الرسمي <ArrowUpRight className="inline" size={15}/></a></div>
   </motion.div>
 </motion.div>}</AnimatePresence>
}
