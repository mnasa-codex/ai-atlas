'use client';
import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { categories, seedTools, type Category, type Tool } from '@/lib/tools';
import ToolCard from './ToolCard';
import ToolModal from './ToolModal';

export default function ToolsExplorer({compact=false}:{compact?:boolean}){
 const [q,setQ]=useState(''); const [cat,setCat]=useState<'all'|Category>('all'); const [selected,setSelected]=useState<Tool|null>(null);
 const tools=useMemo(()=>seedTools.filter(t=>(cat==='all'||t.category===cat)&&`${t.name} ${t.vendor} ${t.hook}`.toLowerCase().includes(q.toLowerCase())).slice(0,compact?6:99),[q,cat,compact]);
 return <>
  {!compact&&<div className="mb-8 glass rounded-3xl p-4"><div className="flex flex-col lg:flex-row gap-3"><div className="relative flex-1"><Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted" size={19}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="ابحث عن أداة، شركة أو استخدام..." className="w-full rounded-2xl border border-white/8 bg-black/20 py-3.5 pr-11 pl-4 outline-none focus:border-gold/40"/></div><div className="flex gap-2 overflow-auto pb-1">{categories.map(c=><button key={c.id} onClick={()=>setCat(c.id)} className={`whitespace-nowrap rounded-2xl px-4 py-3 text-sm transition ${cat===c.id?'bg-gold text-[#090A0F] font-bold':'bg-white/5 text-muted hover:text-ink'}`}>{c.icon} {c.label}</button>)}</div></div></div>}
  <div className="flex items-center justify-between mb-5"><div className="text-sm text-muted">{tools.length} أدوات ظاهرة</div>{!compact&&<div className="text-xs text-muted inline-flex items-center gap-2"><SlidersHorizontal size={14}/> فلترة فورية</div>}</div>
  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">{tools.map(t=><ToolCard key={t.id} tool={t} onOpen={setSelected}/>)}</div>
  {!tools.length&&<div className="glass rounded-3xl p-10 text-center text-muted">ما لقيت أداة بهذا الاسم.</div>}
  <ToolModal tool={selected} onClose={()=>setSelected(null)}/>
 </>
}
