'use client';
import { motion } from 'framer-motion';
import { ExternalLink, Sparkles } from 'lucide-react';
import type { Tool } from '@/lib/tools';

export default function ToolCard({tool,onOpen}:{tool:Tool;onOpen:(t:Tool)=>void}){
 return <motion.button onClick={()=>onOpen(tool)} whileHover={{y:-5}} whileTap={{scale:.985}} className="text-right w-full glass rounded-3xl p-5 transition hover:border-gold/30 hover:shadow-gold-glow group">
   <div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3"><div className="h-12 w-12 rounded-2xl overflow-hidden grid place-items-center bg-gradient-to-br from-purple/20 to-gold/10 gold-border font-bold text-sm shrink-0">{tool.logoUrl?<img src={tool.logoUrl} alt={tool.name} className="h-full w-full object-contain p-1.5"/>:tool.logo}</div><div><div className="font-bold text-lg">{tool.name}</div><div className="text-xs text-muted">{tool.vendor}</div></div></div>{tool.featured&&<span className="text-gold"><Sparkles size={17}/></span>}</div>
   <div className="mt-5 min-h-[56px] text-sm leading-7 text-muted group-hover:text-ink transition">{tool.hook}</div>
   <div className="mt-5 pt-4 border-t border-white/7 flex items-center justify-between text-xs"><span className="text-muted">عرض التفاصيل</span><span className="inline-flex items-center gap-1 text-gold">افتح البطاقة <ExternalLink size={13}/></span></div>
 </motion.button>
}
