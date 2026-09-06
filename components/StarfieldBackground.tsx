'use client';
import { useEffect, useRef } from 'react';

export default function StarfieldBackground() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let w=0,h=0,raf=0;
    let stars:{x:number;y:number;r:number;s:number;a:number}[]=[];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const resize=()=>{
      const dpr=Math.min(window.devicePixelRatio||1,1.5);
      w=window.innerWidth; h=window.innerHeight;
      canvas.width=Math.floor(w*dpr); canvas.height=Math.floor(h*dpr);
      canvas.style.width=w+'px'; canvas.style.height=h+'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
      const n=Math.min(180,Math.floor((w*h)/6500));
      stars=Array.from({length:n},()=>({x:Math.random()*w,y:Math.random()*h,r:.3+Math.random()*1.15,s:.02+Math.random()*.12,a:.25+Math.random()*.65}));
    };
    const draw=()=>{
      ctx.clearRect(0,0,w,h); ctx.fillStyle='#05060A'; ctx.fillRect(0,0,w,h);
      const g=ctx.createRadialGradient(w*.68,h*.16,0,w*.68,h*.16,Math.max(w,h)*.7);
      g.addColorStop(0,'rgba(123,97,255,.13)'); g.addColorStop(.45,'rgba(123,97,255,.035)'); g.addColorStop(1,'rgba(5,6,10,0)');
      ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
      ctx.fillStyle='#F5F5F7';
      for(const s of stars){ ctx.globalAlpha=s.a; ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill(); if(!reduce){ s.y+=s.s; if(s.y>h+2)s.y=-2; }}
      ctx.globalAlpha=1;
      if(!reduce) raf=requestAnimationFrame(draw);
    };
    resize(); draw(); window.addEventListener('resize',resize);
    return()=>{window.removeEventListener('resize',resize); cancelAnimationFrame(raf)};
  },[]);
  return <canvas ref={ref} className="fixed inset-0 -z-20 pointer-events-none" aria-hidden="true"/>;
}
