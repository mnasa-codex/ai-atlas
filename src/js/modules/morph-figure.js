import { reduced } from '../lib/dom.js';

const TAU = Math.PI * 2;
const arc = (cx, cy, rx, ry, seg = 40) => Array.from({ length: seg }, (_, i) => {
  const a = (i / seg) * TAU;
  return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
});

const GLOBE = [
  arc(.5, .5, .34, .34),
  arc(.5, .5, .34, .115, 32),
  arc(.5, .38, .305, .09, 30),
  arc(.5, .62, .305, .09, 30),
  arc(.5, .5, .115, .34, 30),
  arc(.5, .5, .235, .34, 30)
];

const WALKER = [
  arc(.5, .18, .072, .072, 24),
  [[.5,.25],[.5,.40],[.5,.55]],
  [[.5,.34],[.40,.44],[.35,.55]],
  [[.5,.34],[.61,.42],[.66,.51]],
  [[.5,.55],[.43,.70],[.40,.85]],
  [[.5,.55],[.58,.68],[.63,.82]],
  [[.37,.86],[.44,.86]],
  [[.61,.83],[.68,.83]]
];

function flatten(shape) {
  const out = [];
  shape.forEach((path, group) => path.forEach(([x, y]) => out.push({ x, y, group })));
  return out;
}

function resample(shape, n) {
  const segs = [];
  let total = 0;
  shape.forEach((path, group) => {
    for (let i = 0; i < path.length - 1; i += 1) {
      const [x1,y1] = path[i], [x2,y2] = path[i + 1];
      const len = Math.hypot(x2-x1, y2-y1);
      if (len) { segs.push({x1,y1,x2,y2,len,group}); total += len; }
    }
    if (path.length > 2) {
      const [x1,y1] = path[path.length - 1], [x2,y2] = path[0];
      const len = Math.hypot(x2-x1, y2-y1);
      if (len && group === 0) { segs.push({x1,y1,x2,y2,len,group}); total += len; }
    }
  });
  return Array.from({ length: n }, (_, i) => {
    const target = (i / n) * total;
    let walked = 0;
    for (const s of segs) {
      if (walked + s.len >= target) {
        const f = (target - walked) / s.len;
        return { x:s.x1+(s.x2-s.x1)*f, y:s.y1+(s.y2-s.y1)*f, group:s.group };
      }
      walked += s.len;
    }
    return { x:.5, y:.5, group:0 };
  });
}

const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;

export function initMorphFigure(canvas) {
  if (!canvas) return { destroy() {} };
  const ctx = canvas.getContext('2d');
  if (!ctx) return { destroy() {} };

  const count = innerWidth < 700 ? 190 : 320;
  const A = resample(GLOBE, count);
  const B = resample(WALKER, count);
  const color = getComputedStyle(canvas).color.trim() || '#6d5cff';
  const cycle = 9600;
  let w=1, h=1, dpr=1, raf=0, start=performance.now(), visible=true;

  const resize = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    const r = canvas.getBoundingClientRect();
    w=Math.max(1,r.width); h=Math.max(1,r.height);
    canvas.width=Math.round(w*dpr); canvas.height=Math.round(h*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  };
  const morph = p => p < .16 ? 0 : p < .36 ? ease((p-.16)/.20) : p < .68 ? 1 : p < .88 ? 1-ease((p-.68)/.20) : 0;
  const paint = time => {
    const p=((time-start)%cycle)/cycle, m=morph(p), walking=m>.92;
    const gait=walking ? Math.sin(time/190) : 0;
    ctx.clearRect(0,0,w,h);
    ctx.strokeStyle=color; ctx.fillStyle=color; ctx.lineWidth=1; ctx.globalAlpha=.2;
    ctx.beginPath();
    for(let i=1;i<count;i+=1){
      const local=Math.max(0,Math.min(1,(m-(i/count)*.22)/.78));
      let x=A[i].x+(B[i].x-A[i].x)*local;
      let y=A[i].y+(B[i].y-A[i].y)*local;
      if(walking){
        if(B[i].group===2||B[i].group===5||B[i].group===7)x+=gait*.025*local;
        if(B[i].group===3||B[i].group===4||B[i].group===6)x-=gait*.025*local;
      }
      const px=x*w, py=y*h;
      if(i>1)ctx.lineTo(px,py); else ctx.moveTo(px,py);
    }
    ctx.stroke();
    ctx.globalAlpha=.9;
    for(let i=0;i<count;i+=1){
      const local=Math.max(0,Math.min(1,(m-(i/count)*.22)/.78));
      let x=A[i].x+(B[i].x-A[i].x)*local;
      let y=A[i].y+(B[i].y-A[i].y)*local;
      if(walking){
        if(B[i].group===2||B[i].group===5||B[i].group===7)x+=gait*.025*local;
        if(B[i].group===3||B[i].group===4||B[i].group===6)x-=gait*.025*local;
        y+=Math.sin(time/95)*.003*local;
      }
      ctx.beginPath(); ctx.arc(x*w,y*h,1.45,0,TAU); ctx.fill();
    }
    ctx.globalAlpha=1;
  };

  resize();
  const ro=new ResizeObserver(resize); ro.observe(canvas);
  if(reduced()){ paint(start); return { destroy(){ro.disconnect();} }; }
  const io=new IntersectionObserver(([e])=>{visible=e.isIntersecting;}); io.observe(canvas);
  const loop=t=>{raf=requestAnimationFrame(loop); if(visible)paint(t);};
  raf=requestAnimationFrame(loop);
  return { destroy(){cancelAnimationFrame(raf);ro.disconnect();io.disconnect();} };
}
