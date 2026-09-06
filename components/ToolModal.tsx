'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Check, ChevronDown, Sparkles, X } from 'lucide-react';
import type { Tool } from '@/lib/tools';
import { demoSettings } from '@/lib/tools';

export default function ToolModal({tool,onClose}:{tool:Tool|null;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const node=dialog.current;if(!node)return;const previous=document.activeElement as HTMLElement|null;node.showModal();const overflow=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{node.close();document.body.style.overflow=overflow;previous?.focus()};},[]);
 const hasAnnual = useMemo(()=>tool?.plans.some(p=>p.annual!=null) ?? false,[tool]);
 const [billing,setBilling] = useState<'monthly'|'annual'>('monthly');
 const defaultPlan = useMemo(()=>{
   if(!tool) return null;
   return tool.plans.find(p=>p.popular)?.name ?? tool.plans.find(p=>p.monthly)?.name ?? tool.plans[0]?.name ?? null;
 },[tool]);
 const [openPlan,setOpenPlan] = useState<string|null>(defaultPlan);

 if(!tool) return null;

 const waText = openPlan
   ? `مرحبا، بدي استفسر عن خطة ${openPlan} بأداة ${tool.name} عبر منصة أطلس`
   : `مرحبا، بدي استفسر عن ${tool.name} عبر منصة أطلس`;
 const whatsapp = `https://wa.me/${demoSettings.whatsappNumber}?text=${encodeURIComponent(waText)}`;

 return <dialog ref={dialog} className="modal-backdrop" aria-labelledby="tool-title" onCancel={e=>{e.preventDefault();onClose()}} onClick={e=>{if(e.target===e.currentTarget)onClose()}}><div className="modal-panel">


    <div className="flex items-start justify-between">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-2xl overflow-hidden grid place-items-center bg-purple/10 gold-border text-xl font-bold shrink-0">
          {tool.logoUrl ? <img src={tool.logoUrl} alt={tool.name} className="h-full w-full object-contain p-2" /> : tool.logo}
        </div>
        <div><div className="text-xs text-gold mb-1">{tool.vendor}</div><h3 id="tool-title" className="text-3xl font-extrabold">{tool.name}</h3></div>
      </div>
      <button aria-label="إغلاق التفاصيل" onClick={onClose} className="p-2 text-muted hover:text-ink"><X/></button>
    </div>

    <p className="mt-6 text-muted leading-8">{tool.description}</p>

    <div className="mt-8 rounded-3xl border border-white/7 bg-black/20 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h4 className="font-bold">الخطط والأسعار</h4>
        <div className="flex items-center gap-3">
          {hasAnnual && <div className="inline-flex rounded-xl border border-white/10 p-1 text-xs">
            <button onClick={()=>setBilling('monthly')} className={`px-3 py-1.5 rounded-lg transition ${billing==='monthly'?'bg-gold text-[#090A0F] font-bold':'text-muted'}`}>شهري</button>
            <button onClick={()=>setBilling('annual')} className={`px-3 py-1.5 rounded-lg transition ${billing==='annual'?'bg-gold text-[#090A0F] font-bold':'text-muted'}`}>سنوي</button>
          </div>}
          <span className="text-xs text-muted hidden sm:block">اضغط أي خطة لتفاصيلها</span>
        </div>
      </div>

      <div className="space-y-3">
        {tool.plans.map(p=>{
          const isOpen = openPlan===p.name;
          const price = p.custom ? 'مخصص' : p.monthly==null ? 'غير معلن' : p.monthly===0 ? 'مجاني' : billing==='annual' && p.annual!=null ? `$${p.annual}` : `$${p.monthly}`;
          const showsAnnualNote = billing==='annual' && p.annual!=null && p.monthly!=null;
          return <div key={p.name} className={`rounded-2xl border transition ${isOpen?'border-gold/35 bg-gold/[.03]':'border-white/7'}`}>
            <button aria-expanded={isOpen} onClick={()=>setOpenPlan(isOpen?null:p.name)} className="w-full flex items-center justify-between gap-4 p-4 text-right">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-bold shrink-0">{p.name}</span>
                {p.popular && <span className="inline-flex items-center gap-1 text-xs text-gold bg-gold/10 border border-gold/25 rounded-full px-2 py-0.5 shrink-0"><Sparkles size={10}/> خطة بارزة</span>}
                <span className="text-xs text-muted truncate hidden sm:block">— {p.bestFor}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="font-mono text-gold text-lg leading-none">{price}{p.monthly?' / شهر':''}</div>
                  {billing==='annual' && p.annual==null && !!p.monthly && <div className="text-xs text-muted mt-1">سعر شهري؛ السنوي غير مدرج</div>}{showsAnnualNote && <div className="text-xs text-muted mt-1">بدل ${p.monthly} — يُدفع سنويًا</div>}
                </div>
                <ChevronDown size={18} className={`text-muted transition-transform ${isOpen?'rotate-180':''}`} />
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden">
                <div className="px-4 pb-4 pt-1">
                  <p className="text-xs text-muted sm:hidden mb-3">{p.bestFor}</p>
                  {p.included && p.included.length>0 && <div className="mb-4">
                    <div className="text-xs text-muted mb-2">يتضمن الاشتراك أيضًا</div>
                    <div className="flex flex-wrap gap-2">{p.included.map(i=><span key={i} className="text-xs rounded-full border border-purple/25 bg-purple/10 text-purple px-3 py-1">{i}</span>)}</div>
                  </div>}
                  <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2">{p.features.map(f=><div key={f} className="flex items-start gap-2 text-sm text-muted"><Check size={14} className="text-gold mt-1 shrink-0"/><span>{f}</span></div>)}</div>
                  {p.limits && <div className="mt-4 text-xs text-muted bg-white/[.03] rounded-xl p-3">{p.limits}</div>}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                    <span>حالة المراجعة: {p.verified}</span>
                    <a href={p.source} target="_blank" rel="noreferrer" className="text-cyan hover:underline">مصدر السعر الرسمي</a>
                  </div>
                </div>
              </motion.div>}
            </AnimatePresence>
          </div>;
        })}
      </div>
    </div>

    <div className="mt-8 flex flex-col sm:flex-row gap-3">
      <a href={whatsapp} target="_blank" rel="noreferrer" className="flex-1 rounded-2xl bg-gold text-[#090A0F] font-extrabold py-3.5 text-center hover:brightness-110 transition">{openPlan?`استفسر عن ${openPlan}`:'استفسر عبر واتساب'}</a>
      <a href={tool.website} target="_blank" rel="noreferrer" className="rounded-2xl border border-white/10 px-5 py-3.5 text-center text-sm hover:bg-white/5 transition">الموقع الرسمي <ArrowUpRight className="inline" size={15}/></a>
    </div>
   </div>
 </dialog>
}
