export type Side='LONG'|'SHORT';
export type Strategy='PCR'|'SIREN'|'SNAKE'|'SAC'|'WICK'|'MDS'|'OSOK';
export type Grade='A+'|'A'|'B'|'C';
export interface Candle{time:number;open:number;high:number;low:number;close:number;volume:number}
export interface EngineConfig{riskPct:number;dailyLossLimitPct:number;maxDailyTrades:number;maxConsecutiveLosses:number;minRRR:number;preferredRRR:number;killzoneStart:number;killzoneEnd:number}
export interface Analysis{symbol:string;timeframe:string;side:Side|null;bias:'BULLISH'|'BEARISH'|'NEUTRAL';bos:boolean;mss:boolean;sweep:boolean;fvg:boolean;orderBlock:boolean;ote:boolean;liquidity:string;dol:string;grade:Grade|null;rrr:number;entry:number;sl:number;tp:number;strategy:Strategy|null;status:'SIGNAL'|'NO_TRADE';reason:string;score:number;components:string[]}
export const DEFAULT_CONFIG:EngineConfig={riskPct:.5,dailyLossLimitPct:2,maxDailyTrades:3,maxConsecutiveLosses:3,minRRR:2.5,preferredRRR:3,killzoneStart:7,killzoneEnd:16};
const med=(a:number[])=>{const s=[...a].sort((x,y)=>x-y);return s[Math.floor(s.length/2)]??0};
const between=(x:number,a:number,b:number)=>x>=Math.min(a,b)&&x<=Math.max(a,b);
export function analyze(symbol:string,c:Candle[],timeframe='5m',cfg=DEFAULT_CONFIG):Analysis{
 if(c.length<30)return {symbol,timeframe,side:null,bias:'NEUTRAL',bos:false,mss:false,sweep:false,fvg:false,orderBlock:false,ote:false,liquidity:'UNKNOWN',dol:'UNKNOWN',grade:null,rrr:0,entry:0,sl:0,tp:0,strategy:null,status:'NO_TRADE',reason:'INSUFFICIENT_DATA',score:0,components:[]};
 const last=c[c.length-1],prev=c[c.length-2];
 const hi20=Math.max(...c.slice(-20).map(x=>x.high)),lo20=Math.min(...c.slice(-20).map(x=>x.low));
 const hi8=Math.max(...c.slice(-8,-1).map(x=>x.high)),lo8=Math.min(...c.slice(-8,-1).map(x=>x.low));
 const hi10=Math.max(...c.slice(-10,-2).map(x=>x.high)),lo10=Math.min(...c.slice(-10,-2).map(x=>x.low));
 const bullBos=last.close>hi10,bearBos=last.close<lo10;
 const bullMss=prev.close<lo10&&last.close>prev.high,bearMss=prev.close>hi10&&last.close<prev.low;
 const ssl=last.low<lo8&&last.close>last.low+(last.high-last.low)*.55;
 const bsl=last.high>hi8&&last.close<last.high-(last.high-last.low)*.55;
 const bullFvg=c[c.length-3].high<last.low,bearFvg=c[c.length-3].low>last.high;
 const body=(x:Candle)=>Math.abs(x.close-x.open),rng=(x:Candle)=>Math.max(x.high-x.low,1e-9);
 const displacement=body(last)/rng(last)>.62&&body(last)>med(c.slice(-12,-1).map(body))*1.25;
 const bullish=last.close>med(c.slice(-8).map(x=>x.close));
 const ob=bullish?prev.close<prev.open&&last.close>prev.high:prev.close>prev.open&&last.close<prev.low;
 const side:Side|null=(bullBos||bullMss||ssl)?'LONG':(bearBos||bearMss||bsl)?'SHORT':null;
 const bias=side==='LONG'?'BULLISH':side==='SHORT'?'BEARISH':'NEUTRAL';
 const rh=Math.max(...c.slice(-40).map(x=>x.high)),rl=Math.min(...c.slice(-40).map(x=>x.low));
 const ote=side==='LONG'?between(last.close,rl+(rh-rl)*.62,rl+(rh-rl)*.79):side==='SHORT'?between(last.close,rh-(rh-rl)*.79,rh-(rh-rl)*.62):false;
 const entry=last.close,pad=(rh-rl)*.035;
 const sl=side==='LONG'?Math.min(last.low,lo20)-pad:side==='SHORT'?Math.max(last.high,hi20)+pad:entry;
 const tp=side==='LONG'?Math.max(hi20,entry+(entry-sl)*cfg.preferredRRR):side==='SHORT'?Math.min(lo20,entry-(sl-entry)*cfg.preferredRRR):entry;
 const risk=Math.abs(entry-sl),rrr=risk?Math.abs(tp-entry)/risk:0;
 const sweep=ssl||bsl; const fvg=bullFvg||bearFvg; const bos=bullBos||bearBos,mss=bullMss||bearMss;
 const strategy:Strategy|null=side?(sweep&&displacement?'PCR':fvg?'WICK':ote?'SIREN':ob?'SAC':timeframe==='5m'?'SNAKE':'MDS'):null;
 const components:string[]=[];if(bos)components.push('BOS');if(mss)components.push('MSS/CHoCH');if(sweep)components.push('LIQUIDITY SWEEP');if(fvg)components.push('FVG');if(ob)components.push('ORDER BLOCK');if(ote)components.push('OTE 62–79%');if(displacement)components.push('DISPLACEMENT');components.push('DOL');
 let score=(bos?18:0)+(mss?16:0)+(sweep?18:0)+(fvg?12:0)+(ob?10:0)+(ote?10:0)+(displacement?8:0)+(rrr>=3?8:rrr>=2.5?5:0);
 const h=new Date().getUTCHours();let status:'SIGNAL'|'NO_TRADE'='SIGNAL',reason='VALID_SETUP';
 if(!side){status='NO_TRADE';reason='NO_DIRECTIONAL_STRUCTURE'}else if(h<cfg.killzoneStart||h>cfg.killzoneEnd){status='NO_TRADE';reason='OUT_OF_KILLZONE'}else if(rrr<cfg.minRRR){status='NO_TRADE';reason=`RRR_BELOW_${cfg.minRRR}`}else if(!(sweep||mss||displacement)){status='NO_TRADE';reason='NO_CONFIRMATION'}else if(!ote&&!ob&&!fvg){status='NO_TRADE';reason='NO_VALID_POI'}
 const grade:Grade|null=status==='SIGNAL'?(score>=82?'A+':score>=70?'A':score>=58?'B':'C'):null;
 return {symbol,timeframe,side,bias,bos,mss,sweep,fvg,orderBlock:ob,ote,liquidity:side==='LONG'?(ssl?'SSL_SWEEP':'SSL→ERL'):(bsl?'BSL_SWEEP':'BSL→ERL'),dol:(side==='LONG'?hi20:lo20).toFixed(4),grade,rrr,entry,sl,tp,strategy,status,reason,score,components};
}
export function positionSize(balance:number,riskPct:number,entry:number,sl:number,contractValue=1){const cash=balance*riskPct/100;const d=Math.abs(entry-sl);return d>0?cash/(d*contractValue):0}
export function generateDemoCandles(seed:number,count:number,base:number):Candle[]{let x=seed>>>0,p=base;const out:Candle[]=[];const rnd=()=>{x=(1664525*x+1013904223)>>>0;return x/4294967296};for(let i=0;i<count;i++){const o=p,drift=(rnd()-.47)*base*.004,vol=base*.003*(.65+rnd()),close=Math.max(1,o+drift),high=Math.max(o,close)+vol*rnd(),low=Math.min(o,close)-vol*rnd();p=close;out.push({time:Date.now()-(count-i)*300000,open:o,high,low,close,volume:500+rnd()*1200})}return out}
