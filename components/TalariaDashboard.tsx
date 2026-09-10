'use client';
import {useEffect,useMemo,useState} from 'react';
import {Activity,AlertTriangle,BarChart3,Bitcoin,ChevronRight,Crosshair,ShieldCheck,Target,TrendingDown,TrendingUp} from 'lucide-react';
import {analyze,DEFAULT_CONFIG,generateDemoCandles,positionSize,Analysis,Candle} from '@/lib/talaria-engine';
import {fetchOkxCandles,OKX_SYMBOLS,subscribeOkxCandles} from '@/lib/okx-market';

const fmt=(n:number,d=2)=>new Intl.NumberFormat('en-US',{maximumFractionDigits:d}).format(n);
function MiniChart({candles,base,up}:{candles:Candle[];base:number;up:boolean}){const c=candles.length?candles.slice(-56):generateDemoCandles(up?71:19,56,base);const min=Math.min(...c.map(x=>x.low)),max=Math.max(...c.map(x=>x.high));const pts=c.map((x,i)=>`${(i/(c.length-1))*100},${100-((x.close-min)/(max-min||1))*88-6}`).join(' ');return <svg viewBox="0 0 100 100" className="chart"><polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.35" vectorEffect="non-scaling-stroke"/></svg>}
function SignalCard({a}:{a:Analysis}){return <div className="panel signal-card"><div className="signal-head"><div><span className={a.side==='LONG'?'pill green':'pill red'}>{a.side||'WAIT'}</span><b>{a.symbol}</b><small>{a.timeframe}</small></div><div className="grade">{a.grade||'NO-TRADE'}</div></div><div className="price-grid"><div><small>Entry</small><strong>{fmt(a.entry)}</strong></div><div><small>SL</small><strong>{fmt(a.sl)}</strong></div><div><small>TP</small><strong>{fmt(a.tp)}</strong></div><div><small>RRR</small><strong>{a.rrr.toFixed(2)}R</strong></div></div><div className="chips">{a.components.slice(0,6).map(x=><span key={x}>{x}</span>)}</div><div className={a.status==='SIGNAL'?'decision ready':'decision'}>{a.status==='SIGNAL'?<><ShieldCheck size={17}/> {a.strategy} · {a.score}/100 · {a.reason}</>:<><AlertTriangle size={17}/> NO TRADE · {a.reason}</>}</div></div>}

function useOkxMarket(instId:string,timeframe='5m'){
 const [candles,setCandles]=useState<Candle[]>([]); const [status,setStatus]=useState('loading');
 useEffect(()=>{let alive=true; let stop:undefined|(()=>void);
  fetchOkxCandles(instId,timeframe,300).then(xs=>{if(!alive)return;setCandles(xs.map(x=>({...x})));setStatus('rest');}).catch(()=>{if(alive)setStatus('error');});
  stop=subscribeOkxCandles(instId,timeframe,c=>{if(!alive)return;setCandles(prev=>{const next=[...prev];const i=next.findIndex(x=>x.time===c.time);if(i>=0)next[i]=c;else next.push(c);return next.slice(-500);});setStatus('live');});
  return ()=>{alive=false;stop?.();};
 },[instId,timeframe]);
 return {candles,status};
}

export default function TalariaDashboard(){
 const [balance,setBalance]=useState(10000); const [risk,setRisk]=useState(.5); const [tab,setTab]=useState<'dashboard'|'strategies'|'risk'>('dashboard');
 const btcM=useOkxMarket(OKX_SYMBOLS.BTCUSD.instId,'5m'); const xauM=useOkxMarket(OKX_SYMBOLS.XAUUSD.instId,'5m');
 const btcCandles=btcM.candles.length?btcM.candles:generateDemoCandles(41,160,65000); const xauCandles=xauM.candles.length?xauM.candles:generateDemoCandles(83,160,2350);
 const btc=useMemo(()=>analyze('BTCUSD',btcCandles,'5m',{...DEFAULT_CONFIG,riskPct:risk}),[btcCandles,risk]);
 const xau=useMemo(()=>analyze('XAUUSD',xauCandles,'5m',{...DEFAULT_CONFIG,riskPct:risk}),[xauCandles,risk]);
 const btcSize=positionSize(balance,risk,btc.entry||65000,btc.sl||64000,.001); const xauSize=positionSize(balance,risk,xau.entry||2350,xau.sl||2320,1);
 return <main className="talaria-shell">
  <header className="topbar"><div className="brand"><div className="brand-mark">T</div><div><strong>TALARIA</strong><small>Institutional Trading Engine</small></div></div><div className="live"><span className="dot"/> OKX {btcM.status==='live'&&xauM.status==='live'?'LIVE':'MARKET DATA'} <span>UTC</span></div></header>
  <section className="hero"><div><div className="eyebrow">OKX · SMC · ICT · HERMES · MULTI-TIMEFRAME</div><h1>BTC & GOLD <em>decision engine.</em></h1><p>Live OKX candles → market structure → liquidity → strategy dispatcher → OTE/RRR → risk gate → signal.</p></div><div className="hero-stat"><span>ACCOUNT</span><b>${fmt(balance)}</b><small>Risk / trade {risk.toFixed(2)}%</small></div></section>
  <nav className="tabs">{(['dashboard','strategies','risk'] as const).map(t=><button key={t} className={tab===t?'active':''} onClick={()=>setTab(t)}>{t}</button>)}</nav>
  {tab==='dashboard'&&<>
   <section className="market-grid"><div className="panel market-card"><div className="market-title"><div><Bitcoin size={19}/><b>BTC-USDT</b><small>Bitcoin / USDT · OKX</small></div><span className="live-label">{btcM.status.toUpperCase()}</span></div><MiniChart candles={btcCandles} base={65000} up={btc.bias==='BULLISH'}/><div className="market-foot"><strong>{fmt(btc.entry)}</strong><span className={btc.bias==='BULLISH'?'bull':'bear'}>{btc.bias==='BULLISH'?<TrendingUp size={15}/>:<TrendingDown size={15}/>} {btc.bias}</span></div></div><div className="panel market-card"><div className="market-title"><div><BarChart3 size={19}/><b>XAU-USDT</b><small>Gold / USDT · OKX</small></div><span className="live-label">{xauM.status.toUpperCase()}</span></div><MiniChart candles={xauCandles} base={2350} up={xau.bias==='BULLISH'}/><div className="market-foot"><strong>{fmt(xau.entry,2)}</strong><span className={xau.bias==='BULLISH'?'bull':'bear'}>{xau.bias==='BULLISH'?<TrendingUp size={15}/>:<TrendingDown size={15}/>} {xau.bias}</span></div></div></section>
   <section className="section-head"><div><span className="eyebrow">SIGNAL BOARD</span><h2>Qualified setups</h2></div><span className="gate"><Crosshair size={16}/> NO-TRADE gate enforced</span></section><div className="signals"><SignalCard a={btc}/><SignalCard a={xau}/></div>
  </>}
  {tab==='strategies'&&<section className="panel strategy-panel"><div className="section-head"><div><span className="eyebrow">HERMES DISPATCHER</span><h2>Strategy families</h2></div></div><div className="strategy-grid">{['PCR','SIREN','SNAKE','SAC','WICK','MDS','OSOK'].map((s,i)=><div className="strategy" key={s}><span>0{i+1}</span><b>{s}</b><p>{['Power of Three / liquidity reversal','Liquidity + OTE confirmation','Early candle liquidity pull','Order-flow / block continuation','Wick & imbalance model','Million Dollar swing model','One Shot One Kill / knockout'][i]}</p><ChevronRight size={17}/></div>)}</div></section>}
  {tab==='risk'&&<section className="risk-layout"><div className="panel risk-panel"><span className="eyebrow">RISK ENGINE</span><h2>Hard guardrails</h2><label>Account balance<input type="number" value={balance} onChange={e=>setBalance(Number(e.target.value))}/></label><label>Risk per trade <b>{risk.toFixed(2)}%</b><input type="range" min="0.1" max="2" step="0.1" value={risk} onChange={e=>setRisk(Number(e.target.value))}/></label><div className="guard-grid"><div><small>Daily loss limit</small><b>2.0%</b></div><div><small>Max trades</small><b>3</b></div><div><small>Loss circuit</small><b>3</b></div><div><small>Min RRR</small><b>2.5R</b></div></div></div><div className="panel sizing"><span className="eyebrow">POSITION SIZING</span><h2>Current engine output</h2><div className="size-row"><span>BTC-USDT</span><b>{btcSize.toFixed(4)} units*</b></div><div className="size-row"><span>XAU-USDT</span><b>{xauSize.toFixed(4)} contracts*</b></div><p>*Final broker sizing must validate contract size, point value and currency conversion before live dispatch.</p></div></section>}
  <footer><span>TALARIA ENGINE v1 · OKX market feed</span><span>AI is advisory / audit only · execution remains rule-gated</span></footer>
 </main>
}
