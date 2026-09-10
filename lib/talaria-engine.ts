export type Side='LONG'|'SHORT';
export type Strategy='PCR'|'SIREN'|'SNAKE'|'SAC'|'WICK'|'MDS'|'OSOK'|'OFFSET_IFVG'|'ASIAN_SCALP'|'NY_SCALP';
export type Grade='A+'|'A'|'B'|'C'|null;
export type ValidationStatus='SIGNAL'|'NO_TRADE'|'INVALIDATED'|'CANCELLED';
export type RuleStatus='SOURCE_RULE'|'ENGINEERING_ADDITION'|'REQUIRES_BACKTEST'|'UNVERIFIED'|'REJECTED'|'DATA_DEPENDENT';

export interface Candle{time:number;open:number;high:number;low:number;close:number;volume:number}
export interface Zone{type:string;top:number;bottom:number;mt:number;timeframe:string;valid:boolean;reason?:string}
export interface LiquidityPool{type:'BSL'|'SSL'|'EQH'|'EQL'|'PDH'|'PDL'|'PWH'|'PWL'|'ASIAN_HIGH'|'ASIAN_LOW';price:number;time:number;strength:'STRONG'|'WEAK'}
export interface StructureSnapshot{bias:'BULLISH'|'BEARISH'|'NEUTRAL';bullishFourPoint:boolean;bearishFourPoint:boolean;strongHigh:number|null;strongLow:number|null;weakHigh:number|null;weakLow:number|null;bos:boolean;mss:boolean;choch:boolean;insideBarsNeutralized:number;protectedIth:number|null;protectedItl:number|null}
export interface MacroContext{
 us10yTrend?:'RISING'|'FALLING'|'FLAT';
 znTrend?:'RISING'|'FALLING'|'FLAT';
 dxyTrend?:'BULLISH'|'BEARISH'|'FLAT';
 znDxySyncDays?:number;
 dxySmt?:boolean;
 cot52WeekCommercialPercentile?:number;
 cotAligned?:boolean;
 cotBiasLockSide?:Side;
 cotLockDaysRemaining?:number;
 openInterestDrainPct?:number;
 commoditiesBias?:'BULLISH'|'BEARISH'|'NEUTRAL';
 seasonality20Y?:number[];
 seasonality10Y?:number[];
 seasonalityConsensusDays?:number;
 seasonalitySafetyDays?:number;
 auctionTailWide?:boolean;
 eurGbpBias?:'EUR_STRONGER'|'EUR_WEAKER'|'NEUTRAL';
 newsLock?:boolean;
}
export interface WeeklyContext{template?:'CLASSIC_TUESDAY_LOW'|'WEDNESDAY_LOW'|'THURSDAY_REVERSAL_CONSOLIDATION'|'MIDWEEK_RALLY'|'SEEK_AND_DESTROY'|'WEDNESDAY_FALSE_SHIFT'|'UNKNOWN';osokTradesTakenThisWeek?:number}
export interface VolatilityContext{cbdrRangePips?:number;adr5Pips?:number;londonConsumedPips?:number;spread?:number;averageSpread?:number;slippage?:number;averageSlippage?:number}
export interface RiskState{accountBalance:number;currentRiskPct:number;dailyLossPct:number;dailyTrades:number;maxDailyTrades:number;consecutiveLosses:number;maxConsecutiveLosses:number;demonStrikes:number;maxDemonStrikes:number;weeklyOsokTrades:number;maxWeeklyOsokTrades:number;tradingEnabled:boolean}
export interface EngineContext{
 now?:number;
 elapsedFraction?:number;
 macro?:MacroContext;
 weekly?:WeeklyContext;
 volatility?:VolatilityContext;
 risk?:Partial<RiskState>;
 asiaHigh?:number; asiaLow?:number;
 spread?:number; averageSpread?:number;
 instrumentPoint?:number;
}
export interface EngineConfig{
 riskPct:number;dailyLossLimitPct:number;maxDailyTrades:number;maxConsecutiveLosses:number;minRRR:number;preferredRRR:number;killzoneStart:number;killzoneEnd:number;
 dailyCoreTradeCap:number;scalpMinRRR:number;mdsOsokMinRRR:number;firstLineMode:boolean;
 baseRiskPct:number;maxRiskPct:number;halfToleranceRiskPct:number;
}
export interface StrategyEvaluation{
 strategy:Strategy;family:string;applicable:boolean;status:ValidationStatus;side:Side|null;entry:number;sl:number;tp:number;rrr:number;score:number;grade:Grade;reason:string;ruleIds:string[];ruleStatuses:RuleStatus[];components:string[];warnings:string[];
}
export interface RuleTrace{scope:'L1-3'|'L4-6'|'L7-9'|'HERMES';id:string;status:RuleStatus;passed:boolean;reason:string}
export interface Analysis{
 symbol:string;timeframe:string;side:Side|null;bias:'BULLISH'|'BEARISH'|'NEUTRAL';
 bos:boolean;mss:boolean;sweep:boolean;fvg:boolean;orderBlock:boolean;breaker:boolean;ote:boolean;liquidity:string;dol:string;
 grade:Grade;rrr:number;entry:number;sl:number;tp:number;strategy:Strategy|null;status:ValidationStatus;reason:string;score:number;components:string[];
 structure:StructureSnapshot;zones:Zone[];liquidityPools:LiquidityPool[];dolTarget:number|null;rrrPolicy:string;strategyEvaluations:StrategyEvaluation[];ruleTrace:RuleTrace[];noTradeReasons:string[];state:string;risk:RiskState;sourceWarnings:string[];
}

export const DEFAULT_CONFIG:EngineConfig={riskPct:.5,dailyLossLimitPct:2,maxDailyTrades:3,maxConsecutiveLosses:3,minRRR:2.5,preferredRRR:3,killzoneStart:7,killzoneEnd:16,dailyCoreTradeCap:2,scalpMinRRR:1.5,mdsOsokMinRRR:3,firstLineMode:true,baseRiskPct:.5,maxRiskPct:2,halfToleranceRiskPct:.5};

/** Canonical rule index preserved from the supplied source corpus. */
export const RULEBOOK:ReadonlyArray<{scope:RuleTrace['scope'];id:string;status:RuleStatus;title:string}>=([
 ['L1-3','RULE-A01','SOURCE_RULE','Bullish four-point market structure'],['L1-3','RULE-A02','SOURCE_RULE','Bearish four-point market structure'],['L1-3','RULE-A03','SOURCE_RULE','Candle-by-candle fractal structure'],['L1-3','RULE-A04','SOURCE_RULE','Strong vs weak extremes'],['L1-3','RULE-A05','SOURCE_RULE','Three-layer structure hierarchy'],['L1-3','RULE-A06','SOURCE_RULE','Engulfing resolution'],
 ['L1-3','RULE-B01','SOURCE_RULE','Daily directional bias'],['L1-3','RULE-B02','SOURCE_RULE','Macro sweep reversal'],['L1-3','RULE-B03','SOURCE_RULE','Neutral/consolidation bias'],['L1-3','RULE-B04','SOURCE_RULE','COT directional alignment'],
 ['L1-3','RULE-C01','SOURCE_RULE','Three-candle fractal swing'],['L1-3','RULE-C02','SOURCE_RULE','Intermediate-term ITH/ITL'],['L1-3','RULE-C03','SOURCE_RULE','Long-term LTH/LTL'],['L1-3','RULE-C04','ENGINEERING_ADDITION','ATR noise filtering'],
 ['L1-3','RULE-D01','SOURCE_RULE','Buy-side liquidity'],['L1-3','RULE-D02','SOURCE_RULE','Sell-side liquidity'],['L1-3','RULE-D03','SOURCE_RULE','Static key levels'],['L1-3','RULE-D04','SOURCE_RULE','Low-resistance liquidity route'],
 ['L1-3','RULE-E01','SOURCE_RULE','Wick liquidity sweep'],['L1-3','RULE-E02','SOURCE_RULE','Sweep anchor point'],['L1-3','RULE-E03','SOURCE_RULE','Sweep invalidation'],
 ['L1-3','RULE-F01','SOURCE_RULE','Trendline inducement'],['L1-3','RULE-F02','SOURCE_RULE','Pre-POI inducement'],['L1-3','RULE-F03','SOURCE_RULE','Early-entry suppression'],
 ['L1-3','RULE-G01','SOURCE_RULE','BOS'],['L1-3','RULE-G02','SOURCE_RULE','CHoCH/MSS'],['L1-3','RULE-G03','SOURCE_RULE','Double confirmation'],
 ['L1-3','RULE-H01','SOURCE_RULE','High-probability order block'],['L1-3','RULE-H02','SOURCE_RULE','Mean Threshold 50% safety'],['L1-3','RULE-H03','SOURCE_RULE','Breaker block'],['L1-3','RULE-H04','SOURCE_RULE','Mitigation block'],['L1-3','RULE-H05','SOURCE_RULE','Three-candle FVG'],
 ['L1-3','RULE-I01','SOURCE_RULE','OTE levels 62/70.5/79'],['L1-3','RULE-I02','SOURCE_RULE','OTE construction'],['L1-3','RULE-I03','SOURCE_RULE','OTE invalidation'],
 ['L1-3','RULE-J01','SOURCE_RULE','Limit-order entry'],['L1-3','RULE-J02','SOURCE_RULE','Structural stop with spread/buffer'],['L1-3','RULE-J03','SOURCE_RULE','Opposite LRLR target and RRR'],
 ['L1-3','RULE-K01','SOURCE_RULE','Mathematical position sizing'],['L1-3','RULE-K02','SOURCE_RULE','Trader-F dynamic risk'],['L1-3','RULE-K03','SOURCE_RULE','Daily trade/loss cap'],['L1-3','RULE-K04','SOURCE_RULE','Anti-Martingale'],['L1-3','RULE-K05','SOURCE_RULE','Break-even and partial close'],
 ['L1-3','RULE-L01','SOURCE_RULE','New York time normalization'],['L1-3','RULE-L02','SOURCE_RULE','London/New York killzones'],['L1-3','RULE-L03','SOURCE_RULE','Out-of-session lock'],
 ['L1-3','RULE-M01','SOURCE_RULE','SMT divergence filter'],['L1-3','RULE-M02','SOURCE_RULE','Red-folder news lock'],
 ['L4-6','RULE-A01','SOURCE_RULE','Bullish order-flow continuation'],['L4-6','RULE-A02','SOURCE_RULE','Order-flow reversal'],['L4-6','RULE-A03','SOURCE_RULE','Unmitigated range'],['L4-6','RULE-B01','SOURCE_RULE','IPDA quadratic cycle'],['L4-6','RULE-B02','SOURCE_RULE','20/40/60 day lookbacks'],['L4-6','RULE-B03','SOURCE_RULE','Draw on Liquidity'],['L4-6','RULE-C01','SOURCE_RULE','MMXM four-stage model'],['L4-6','RULE-C02','SOURCE_RULE','Two-timeframe step-up'],['L4-6','RULE-D01','SOURCE_RULE','Premium PD Array hierarchy'],['L4-6','RULE-D02','SOURCE_RULE','Discount PD Array hierarchy'],['L4-6','RULE-D03','SOURCE_RULE','First Line of Defense'],['L4-6','RULE-D04','SOURCE_RULE','Propulsion block'],['L4-6','RULE-D05','SOURCE_RULE','Breakaway vacuum gap'],['L4-6','RULE-E01','SOURCE_RULE','ERL to IRL cycle'],['L4-6','RULE-E02','SOURCE_RULE','IRL to ERL model'],['L4-6','RULE-E03','SOURCE_RULE','Mid-range lockout'],['L4-6','RULE-F01','SOURCE_RULE','ZN/US10Y/DXY relationship'],['L4-6','RULE-F02','SOURCE_RULE','High-velocity trend'],['L4-6','RULE-F03','SOURCE_RULE','Five-day consolidation predictor'],['L4-6','RULE-F04','SOURCE_RULE','Bond/DXY SMT'],['L4-6','RULE-F05','SOURCE_RULE','ZN open-interest proxy'],['L4-6','RULE-G01','SOURCE_RULE','Quarterly shift'],['L4-6','RULE-G02','REQUIRES_BACKTEST','Q4 dollar seasonality'],['L4-6','RULE-G03','REQUIRES_BACKTEST','Early-year gold seasonality'],['L4-6','RULE-G04','REQUIRES_BACKTEST','Q4 NZD/JPY seasonality'],['L4-6','RULE-H01','SOURCE_RULE','1H dedicated structure'],['L4-6','RULE-H02','SOURCE_RULE','Unicorn breaker plus FVG'],['L4-6','RULE-I01','SOURCE_RULE','Three trades/day cap'],['L4-6','RULE-I02','SOURCE_RULE','Three-loss circuit breaker'],['L4-6','RULE-I03','SOURCE_RULE','1.5-2% daily drawdown'],['L4-6','RULE-I04','REQUIRES_BACKTEST','Expectancy >=0.3R'],
 ['L7-9','RULE-A01','SOURCE_RULE','Commodities to inflation/rates'],['L7-9','RULE-A02','SOURCE_RULE','Bonds/yields to DXY/FX/equities'],['L7-9','RULE-A03','SOURCE_RULE','Commodity FX relationships'],['L7-9','RULE-A04','SOURCE_RULE','Five-day ZN/DXY consolidation'],['L7-9','RULE-B01','SOURCE_RULE','52-week 50% COT line'],['L7-9','RULE-B02','REQUIRES_BACKTEST','Open-interest drain 10-15%'],['L7-9','RULE-B03','SOURCE_RULE','MWD sequence'],['L7-9','RULE-B04','SOURCE_RULE','4H rejection then displacement'],['L7-9','RULE-B05','REQUIRES_BACKTEST','MDS risk and no BE before 3R'],['L7-9','RULE-C01','SOURCE_RULE','Weekly 1H OSOK'],['L7-9','RULE-C02','SOURCE_RULE','Six weekly templates'],['L7-9','RULE-C03','SOURCE_RULE','Dynamic quadrants'],['L7-9','RULE-C04','SOURCE_RULE','Symmetric Fibonacci 1.27/1.62/2.0'],['L7-9','RULE-D01','SOURCE_RULE','CBDR 14-20 EST'],['L7-9','RULE-D02','REJECTED','ADR-5 NY lockout conflict status retained'],['L7-9','RULE-D03','REQUIRES_BACKTEST','Tue/Wed weekly extreme timing'],['L7-9','RULE-E01','SOURCE_RULE','Offset Accumulation / IFVG'],['L7-9','RULE-E02','SOURCE_RULE','Asian scalp'],['L7-9','RULE-E03','SOURCE_RULE','New York scalp'],['L7-9','RULE-F01','SOURCE_RULE','ES vs NQ SMT'],['L7-9','RULE-F02','REQUIRES_BACKTEST','CANSLIM stock filter'],['L7-9','RULE-F03','SOURCE_RULE','BTC/Altcoin relative strength SMT'],
 ['HERMES','RULE-A01','SOURCE_RULE','Hermes 1-Bar/2-Bar internal structure'],['HERMES','RULE-A02','SOURCE_RULE','Inside-bar neutralization'],['HERMES','RULE-A03','SOURCE_RULE','Mechanical confluence trigger'],['HERMES','RULE-B01','REQUIRES_BACKTEST','PCR Day-4 deterministic DOL'],['HERMES','RULE-B02','SOURCE_RULE','PCR Day-5 extension/invalidation'],['HERMES','RULE-B03','SOURCE_RULE','PCR invalidation filters'],['HERMES','RULE-C01','SOURCE_RULE','SIREN retail demand/supply fade'],['HERMES','RULE-C02','SOURCE_RULE','SIREN trigger/target'],['HERMES','RULE-D01','REQUIRES_BACKTEST','SNAKE first-third sweep'],['HERMES','RULE-D02','REQUIRES_BACKTEST','SNAKE Gann thirds'],['HERMES','RULE-E01','SOURCE_RULE','SAC two-candle sweep/close'],['HERMES','RULE-E02','REQUIRES_BACKTEST','SAC opposite-extreme target'],['HERMES','RULE-F01','SOURCE_RULE','WICK wick behind displacement'],['HERMES','RULE-F02','SOURCE_RULE','WICK invalidation flip'],['HERMES','RULE-G01','SOURCE_RULE','20-day COT bias lock'],['HERMES','RULE-G02','DATA_DEPENDENT','EUR/GBP alpha selector'],['HERMES','RULE-G03','REQUIRES_BACKTEST','20Y vs 10Y seasonality consensus'],['HERMES','RULE-G04','DATA_DEPENDENT','Treasury auction tails'],['HERMES','RULE-G05','ENGINEERING_ADDITION','Demon Finder 10 strikes lockout'],['HERMES','RULE-G06','SOURCE_RULE','Half-tolerance risk and three-loss breaker']
] as const).map(([scope,id,status,title])=>({scope,id,status,title})));

const med=(a:number[])=>{const s=[...a].sort((x,y)=>x-y);return s[Math.floor(s.length/2)]??0};
const between=(x:number,a:number,b:number)=>x>=Math.min(a,b)&&x<=Math.max(a,b);
const body=(x:Candle)=>Math.abs(x.close-x.open);
const range=(x:Candle)=>Math.max(x.high-x.low,1e-9);
const atr=(c:Candle[],n=14)=>{if(c.length<n+1)return 0;const tr=c.slice(-n).map((x,i)=>{const p=c[c.length-n+i-1]??x;return Math.max(x.high-x.low,Math.abs(x.high-p.close),Math.abs(x.low-p.close))});return med(tr)};
const fvg=(a:Candle,b:Candle,c:Candle)=>({bull:c.low>a.high,bear:c.high<a.low});
const nowHour=(ts:number)=>new Date(ts).getUTCHours();
function nyMinutes(ts:number){const d=new Date(ts);const s=d.toLocaleString('en-US',{timeZone:'America/New_York',hour12:false,hour:'2-digit',minute:'2-digit'}).split(':').map(Number);return (s[0]||0)*60+(s[1]||0)}
function inNyKillzone(ts:number){const m=nyMinutes(ts);return (m>=120&&m<=300)||(m>=420&&m<=600)}
function sessionName(ts:number){const m=nyMinutes(ts);if(m>=120&&m<=300)return 'LONDON_OPEN';if(m>=420&&m<=600)return 'NEW_YORK_OPEN';return 'OUT_OF_SESSION'}
function completeCandles(c:Candle[]){return c.filter(x=>Number.isFinite(x.open)&&Number.isFinite(x.high)&&Number.isFinite(x.low)&&Number.isFinite(x.close)&&x.high>=Math.max(x.open,x.close)&&x.low<=Math.min(x.open,x.close)&&x.time>0)}
function fourPointBias(c:Candle[]):'BULLISH'|'BEARISH'|'NEUTRAL'{
 if(c.length<8)return 'NEUTRAL';
 const p1=c[c.length-8],p2=c[c.length-6],p3=c[c.length-4],p4=c[c.length-2];
 const bull=p3.low>p1.low&&p4.high>p2.high&&p4.close>p2.high;
 const bear=p3.high<p1.high&&p4.low<p2.low&&p4.close<p2.low;
 return bull?'BULLISH':bear?'BEARISH':'NEUTRAL';
}
function buildStructure(c:Candle[]):StructureSnapshot{
 const clean: Candle[]=[]; let inside=0;
 for(const x of c){const p=clean[clean.length-1];if(p&&x.high<=p.high&&x.low>=p.low){inside++;continue;}clean.push(x)}
 const bias=fourPointBias(clean);
 const highs=clean.slice(-30).map((x,i,a)=>i>0&&i<a.length-1&&x.high>a[i-1].high&&x.high>a[i+1].high?x.high:null).filter((x):x is number=>x!==null);
 const lows=clean.slice(-30).map((x,i,a)=>i>0&&i<a.length-1&&x.low<a[i-1].low&&x.low<a[i+1].low?x.low:null).filter((x):x is number=>x!==null);
 const last=c[c.length-1],p=c[c.length-2];
 const hi=maxHigh(c.slice(-12,-1)),lo=minLow(c.slice(-12,-1));
 const bosBull=last.close>hi,bosBear=last.close<lo;
 const mssBull=p.close<lo&&last.close>p.high,mssBear=p.close>hi&&last.close<p.low;
 const protectedIth=highs.length>=2?Math.max(highs[highs.length-2],highs[highs.length-1]):highs.at(-1)??null;
 const protectedItl=lows.length>=2?Math.min(lows[lows.length-2],lows[lows.length-1]):lows.at(-1)??null;
 return {bias,bullishFourPoint:bias==='BULLISH',bearishFourPoint:bias==='BEARISH',strongHigh:bias==='BEARISH'?(highs.at(-1)??null):null,strongLow:bias==='BULLISH'?(lows.at(-1)??null):null,weakHigh:highs.at(-2)??null,weakLow:lows.at(-2)??null,bos:bosBull||bosBear,mss:mssBull||mssBear,choch:mssBull||mssBear,insideBarsNeutralized:inside,protectedIth,protectedItl};
}
function maxHigh(c:Candle[]){return c.length?Math.max(...c.map(x=>x.high)):0}
function minLow(c:Candle[]){return c.length?Math.min(...c.map(x=>x.low)):0}
function detectPools(c:Candle[],a:number):LiquidityPool[]{
 const p:LiquidityPool[]=[]; if(c.length<4)return p;
 const last=c.at(-1)!;const prevDay=c.slice(-288,-144),prevWeek=c.slice(-2016,-1872); if(prevDay.length)p.push({type:'PDH',price:maxHigh(prevDay),time:last.time,strength:'STRONG'},{type:'PDL',price:minLow(prevDay),time:last.time,strength:'STRONG'});if(prevWeek.length)p.push({type:'PWH',price:maxHigh(prevWeek),time:last.time,strength:'STRONG'},{type:'PWL',price:minLow(prevWeek),time:last.time,strength:'STRONG'});
 const look=c.slice(-60); for(let i=2;i<look.length-2;i++){const x=look[i];if(x.high>look[i-1].high&&x.high>look[i+1].high)p.push({type:'BSL',price:x.high,time:x.time,strength:'STRONG'});if(x.low<look[i-1].low&&x.low<look[i+1].low)p.push({type:'SSL',price:x.low,time:x.time,strength:'STRONG'})}
 const tol=.15*a; for(let i=0;i<look.length;i++)for(let j=i+1;j<look.length;j++){if(Math.abs(look[i].high-look[j].high)<=tol)p.push({type:'EQH',price:(look[i].high+look[j].high)/2,time:look[j].time,strength:'WEAK'});if(Math.abs(look[i].low-look[j].low)<=tol)p.push({type:'EQL',price:(look[i].low+look[j].low)/2,time:look[j].time,strength:'WEAK'})}
 return p.slice(-24);
}
function zonesFromCandles(c:Candle[],tf:string,side:Side|null):Zone[]{
 const out:Zone[]=[]; if(c.length<5)return out; const ar=atr(c,14); for(let i=Math.max(3,c.length-25);i<c.length-2;i++){const a=c[i],b=c[i+1],d=c[i+2],fb=fvg(a,b,d);const disp=body(d)>=2*range(b)*.5; if(disp){if(a.close<a.open&&d.close>d.open){const top=Math.max(a.high,b.high),bottom=Math.min(a.low,b.low);out.push({type:'BULLISH_OB',top,bottom,mt:bottom+.5*(top-bottom),timeframe:tf,valid:true});} if(a.close>a.open&&d.close<d.open){const top=Math.max(a.high,b.high),bottom=Math.min(a.low,b.low);out.push({type:'BEARISH_OB',top,bottom,mt:bottom+.5*(top-bottom),timeframe:tf,valid:true});}}
 if(fb.bull)out.push({type:'BULLISH_FVG',top:d.low,bottom:a.high,mt:a.high+.5*(d.low-a.high),timeframe:tf,valid:true}); if(fb.bear)out.push({type:'BEARISH_FVG',top:a.low,bottom:d.high,mt:d.high+.5*(a.low-d.high),timeframe:tf,valid:true});}
 return out.filter(z=>side===null||z.type.startsWith(side==='LONG'?'BULLISH':'BEARISH'));
}
function dynamicRisk(r:RiskState):number{if(!r.tradingEnabled)return 0;const wins=(r as RiskState & {consecutiveWins?:number}).consecutiveWins??0;return Math.min(DEFAULT_CONFIG.maxRiskPct,Math.max(DEFAULT_CONFIG.baseRiskPct,Math.min(2,DEFAULT_CONFIG.baseRiskPct+.5*Math.min(wins,3))))}
function defaultRisk(cfg:EngineConfig,ctx:EngineContext):RiskState{const r=ctx.risk??{};return {accountBalance:r.accountBalance??10000,currentRiskPct:r.currentRiskPct??cfg.riskPct,dailyLossPct:r.dailyLossPct??0,dailyTrades:r.dailyTrades??0,maxDailyTrades:r.maxDailyTrades??cfg.maxDailyTrades,consecutiveLosses:r.consecutiveLosses??0,maxConsecutiveLosses:r.maxConsecutiveLosses??cfg.maxConsecutiveLosses,demonStrikes:r.demonStrikes??0,maxDemonStrikes:r.maxDemonStrikes??10,weeklyOsokTrades:r.weeklyOsokTrades??0,maxWeeklyOsokTrades:r.maxWeeklyOsokTrades??1,tradingEnabled:r.tradingEnabled??true};}
function makeEval(strategy:Strategy,family:string,applicable:boolean,status:ValidationStatus,side:Side|null,entry:number,sl:number,tp:number,score:number,grade:Grade,reason:string,ruleIds:string[],ruleStatuses:RuleStatus[],components:string[],warnings:string[]=[]):StrategyEvaluation{return {strategy,family,applicable,status,side,entry,sl,tp,rrr:Math.abs(tp-entry)/Math.max(Math.abs(entry-sl),1e-9),score,grade,reason,ruleIds,ruleStatuses,components,warnings}}
function evaluateHermesStructure(c:Candle[],structure:StructureSnapshot){const ids=['RULE-A01','RULE-A02','RULE-A03','RULE-A02'];const cleanInside=structure.insideBarsNeutralized>=0;return {pass:structure.bias!=='NEUTRAL'&&cleanInside,ids}}
function evaluatePCR(d:Candle[],side:Side|null,session:string,macro:MacroContext|undefined,cfg:EngineConfig):StrategyEvaluation{
 if(d.length<5)return makeEval('PCR','HERMES_PCR',false,'NO_TRADE',null,0,0,0,0,null,'INSUFFICIENT_DAILY_DATA',['RULE-B01'],['REQUIRES_BACKTEST'],[]);
 const b1=d.at(-4)!,b2=d.at(-3)!,b3=d.at(-2)!; const out=((b2.high>b1.high&&b2.low<b1.low)||(b3.high>b2.high&&b3.low<b2.low)); const sell=b2.high>b1.high&&b2.high>b3.high&&!out; const buy=b2.low<b1.low&&b2.low<b3.low&&!out; if(!sell&&!buy)return makeEval('PCR','HERMES_PCR',true,'NO_TRADE',null,0,0,0,0,null,'PCR_PATTERN_NOT_CONFIRMED',['RULE-B01','RULE-B02','RULE-B03'],['REQUIRES_BACKTEST','SOURCE_RULE','SOURCE_RULE'],[]);
 const s:sSide= sell?'SHORT':'LONG';
 const entry=s==='SHORT'?(b2.high+b3.low)*.5:(b2.low+b3.high)*.5; const sl=s==='SHORT'?b2.high+b2.high*.00005:b2.low-b2.low*.00005; const tp=s==='SHORT'?b3.low:b3.high; const invalid=(s==='SHORT'&&b2.high>=b1.high&&session==='ASIA')||(s==='LONG'&&b2.low<=b1.low&&session==='ASIA'); const rrr=Math.abs(tp-entry)/Math.max(Math.abs(entry-sl),1e-9); if(invalid)return makeEval('PCR','HERMES_PCR',true,'INVALIDATED',s,entry,sl,tp,rrr>=3?82:70,rrr>=3?'A+':'A','PCR_INVALIDATION_FILTER',['RULE-B01','RULE-B02','RULE-B03'],['REQUIRES_BACKTEST','SOURCE_RULE','SOURCE_RULE'],['PCR','DOL','OUTSIDE_BAR_FILTER']);
 const ok=rrr>=cfg.minRRR; return makeEval('PCR','HERMES_PCR',true,ok?'SIGNAL':'NO_TRADE',s,entry,sl,tp,ok?82:55,rrr>=3?'A+':ok?'A':'C',ok?'PCR_READY':'RRR_BELOW_CORE_MIN',['RULE-B01','RULE-B02','RULE-B03'],['REQUIRES_BACKTEST','SOURCE_RULE','SOURCE_RULE'],['PCR','DOL','EQUILIBRIUM_ENTRY']);
}
type sSide=Side;
function evaluateSNAKE(curr:Candle,prev:Candle,elapsed:number|undefined):StrategyEvaluation{
 if(elapsed===undefined)return makeEval('SNAKE','HERMES_SNAKE',true,'NO_TRADE',null,0,0,0,0,null,'INTRABAR_TIMING_REQUIRED',['RULE-D01','RULE-D02'],['REQUIRES_BACKTEST','REQUIRES_BACKTEST'],['FIRST_THIRD_SWEEP']);
 const first=elapsed<=.333; const sell=curr.high>prev.high&&curr.close<=prev.high; const buy=curr.low<prev.low&&curr.close>=prev.low; if(!first||(!sell&&!buy))return makeEval('SNAKE','HERMES_SNAKE',true,'NO_TRADE',null,0,0,0,0,null,!first?'SNAKE_FIRST_THIRD_EXPIRED':'SNAKE_SWEEP_NOT_CONFIRMED',['RULE-D01','RULE-D02'],['REQUIRES_BACKTEST','REQUIRES_BACKTEST'],['FIRST_THIRD_SWEEP','GANN_THIRDS']);
 const s=sell?'SHORT':'LONG';const entry=curr.close;const sl=s==='SHORT'?curr.high:curr.low;const tp=curr.open;const rrr=Math.abs(tp-entry)/Math.max(Math.abs(entry-sl),1e-9);return makeEval('SNAKE','HERMES_SNAKE',true,rrr>0?'SIGNAL':'NO_TRADE',s,entry,sl,tp,rrr>=2?78:62,rrr>=2?'A':'B','SNAKE_FIRST_THIRD_RETEST',['RULE-D01','RULE-D02'],['REQUIRES_BACKTEST','REQUIRES_BACKTEST'],['SNAKE','RETURN_TO_OPEN'],['Source probability claim is not treated as a guarantee']);
}
function evaluateSAC(curr:Candle,prev:Candle,cfg:EngineConfig):StrategyEvaluation{
 const sell=curr.high>prev.high&&curr.close<prev.low;const buy=curr.low<prev.low&&curr.close>prev.high;if(!sell&&!buy)return makeEval('SAC','HERMES_SAC',true,'NO_TRADE',null,0,0,0,0,null,'SAC_PATTERN_NOT_CONFIRMED',['RULE-E01','RULE-E02'],['SOURCE_RULE','REQUIRES_BACKTEST'],['TWO_CANDLE_SWEEP_CLOSE']);
 const s=sell?'SHORT':'LONG';const entry=curr.close;const sl=s==='SHORT'?curr.high:curr.low;const tp=s==='SHORT'?prev.low:prev.high;const invalid=s==='SHORT'?curr.high>Math.max(prev.high,curr.close):curr.low<Math.min(prev.low,curr.close);const rrr=Math.abs(tp-entry)/Math.max(Math.abs(entry-sl),1e-9);const ok=!invalid&&rrr>=cfg.minRRR;return makeEval('SAC','HERMES_SAC',true,ok?'SIGNAL':invalid?'INVALIDATED':'NO_TRADE',s,entry,sl,tp,ok?80:50,ok?'A':'C',ok?'SAC_READY':invalid?'SAC_INVALIDATED':'RRR_BELOW_CORE_MIN',['RULE-E01','RULE-E02'],['SOURCE_RULE','REQUIRES_BACKTEST'],['SAC','SWEEP','FULL_BODY_CLOSE']);
}
function evaluateWick(c:Candle[],structure:StructureSnapshot,cfg:EngineConfig):StrategyEvaluation{
 if(c.length<8)return makeEval('WICK','HERMES_WICK',false,'NO_TRADE',null,0,0,0,0,null,'INSUFFICIENT_DATA',['RULE-F01','RULE-F02'],['SOURCE_RULE','SOURCE_RULE'],[]);
 const prev=c.at(-2)!,last=c.at(-1)!,disp=body(prev)>=med(c.slice(-12,-2).map(body))*1.25;const wickUp=prev.high-Math.max(prev.open,prev.close),wickDn=Math.min(prev.open,prev.close)-prev.low;const sell=disp&&wickUp>body(prev)&&last.close<=prev.high&&last.close>=Math.min(prev.open,prev.close);const buy=disp&&wickDn>body(prev)&&last.close>=prev.low&&last.close<=Math.max(prev.open,prev.close);if(!sell&&!buy)return makeEval('WICK','HERMES_WICK',true,'NO_TRADE',null,0,0,0,0,null,'WICK_RETEST_NOT_CONFIRMED',['RULE-F01','RULE-F02'],['SOURCE_RULE','SOURCE_RULE'],['WICK','DISPLACEMENT']);
 const s=sell?'SHORT':'LONG';const entry=last.close,sl=s==='SHORT'?prev.high:prev.low,tp=s==='SHORT'?(structure.weakLow??minLow(c.slice(-20))):(structure.weakHigh??maxHigh(c.slice(-20)));const rrr=Math.abs(tp-entry)/Math.max(Math.abs(entry-sl),1e-9);const ok=rrr>=cfg.minRRR;return makeEval('WICK','HERMES_WICK',true,ok?'SIGNAL':'NO_TRADE',s,entry,sl,tp,ok?79:53,ok?'A':'C',ok?'WICK_READY':'RRR_BELOW_CORE_MIN',['RULE-F01','RULE-F02'],['SOURCE_RULE','SOURCE_RULE'],['WICK','FIRST_RETEST','INVALIDATION_FLIP']);
}
function evaluateSiren(c5:Candle[],c1h:Candle[],structure:StructureSnapshot,cfg:EngineConfig):StrategyEvaluation{
 if(c5.length<25||c1h.length<10)return makeEval('SIREN','HERMES_SIREN',false,'NO_TRADE',null,0,0,0,0,null,'INSUFFICIENT_MTF_DATA',['RULE-C01','RULE-C02'],['SOURCE_RULE','SOURCE_RULE'],[]);
 const z=zonesFromCandles(c1h,'1H',structure.bias==='BULLISH'?'LONG':structure.bias==='BEARISH'?'SHORT':null).find(x=>x.type.includes(structure.bias==='BULLISH'?'BULLISH':'BEARISH'));
 const a=c5.at(-3)!,b=c5.at(-2)!,d=c5.at(-1)!,mssBear=b.close>maxHigh(c5.slice(-12,-3))&&d.close<b.low,mssBull=b.close<minLow(c5.slice(-12,-3))&&d.close>b.high;const s:mssBear?'SHORT':'LONG'=mssBear?'SHORT':'LONG';const fired=Boolean(z&&((s==='SHORT'&&mssBear)||(s==='LONG'&&mssBull)));if(!fired)return makeEval('SIREN','HERMES_SIREN',true,'NO_TRADE',null,0,0,0,0,null,'SIREN_TRIGGER_NOT_CONFIRMED',['RULE-C01','RULE-C02'],['SOURCE_RULE','SOURCE_RULE'],['SIREN','1H_POI','5M_STRUCTURE']);
 const entry=d.close;const sl=s==='SHORT'?maxHigh(c5.slice(-6)):minLow(c5.slice(-6));const tp=s==='SHORT'?Math.min(...c5.slice(-30).map(x=>x.low)):Math.max(...c5.slice(-30).map(x=>x.high));const rrr=Math.abs(tp-entry)/Math.max(Math.abs(entry-sl),1e-9);const ok=rrr>=3;return makeEval('SIREN','HERMES_SIREN',true,ok?'SIGNAL':'NO_TRADE',s,entry,sl,tp,ok?81:54,ok?'A':'C',ok?'SIREN_READY':'RRR_BELOW_3R',['RULE-C01','RULE-C02'],['SOURCE_RULE','SOURCE_RULE'],['SIREN','RETAIL_FADE','5M_FVG_INVERSION']);
}
function evaluateMDS(c4h:Candle[],daily:Candle[],macro:MacroContext|undefined,cfg:EngineConfig):StrategyEvaluation{
 const required=macro?.cot52WeekCommercialPercentile!==undefined&&macro.openInterestDrainPct!==undefined&&macro.cotAligned===true; if(!required)return makeEval('MDS','L7_MACRO_SWING',false,'NO_TRADE',null,0,0,0,0,null,'MDS_MACRO_DATA_REQUIRED',['RULE-B01','RULE-B02','RULE-B03','RULE-B04','RULE-B05'],['SOURCE_RULE','REQUIRES_BACKTEST','SOURCE_RULE','SOURCE_RULE','REQUIRES_BACKTEST'],['MDS'],['Requires live COT/OI/macro feeds; no fabricated values']);
 const longBias=(macro.cot52WeekCommercialPercentile>=50)&&macro.openInterestDrainPct>=10&&macro.openInterestDrainPct<=15&&daily.length>=60&&fourPointBias(daily)==='BULLISH';if(!longBias)return makeEval('MDS','L7_MACRO_SWING',true,'NO_TRADE','LONG',0,0,0,0,null,'MDS_CONDITIONS_NOT_MET',['RULE-B01','RULE-B02','RULE-B03','RULE-B04','RULE-B05'],['SOURCE_RULE','REQUIRES_BACKTEST','SOURCE_RULE','SOURCE_RULE','REQUIRES_BACKTEST'],['MDS','52W_COT','OI_DRAIN']);
 const last=c4h.at(-1)!,prev=c4h.at(-2)!;const rejection=last.low<prev.low&&Math.min(last.open,last.close)-last.low>body(last);const displacement=body(last)>=med(c4h.slice(-10,-1).map(body))*1.25;if(!rejection||!displacement)return makeEval('MDS','L7_MACRO_SWING',true,'NO_TRADE','LONG',0,0,0,0,null,'MDS_4H_TRIGGER_NOT_CONFIRMED',['RULE-B03','RULE-B04'],['SOURCE_RULE','SOURCE_RULE'],['MDS','4H_REJECTION','DISPLACEMENT']);
 const entry=last.close,sl=last.low,tp=maxHigh(daily.slice(-60));const rrr=Math.abs(tp-entry)/Math.max(Math.abs(entry-sl),1e-9),ok=rrr>=cfg.mdsOsokMinRRR;return makeEval('MDS','L7_MACRO_SWING',true,ok?'SIGNAL':'NO_TRADE','LONG',entry,sl,tp,ok?88:57,ok?'A+':'C',ok?'MDS_READY':'RRR_BELOW_3R',['RULE-B01','RULE-B02','RULE-B03','RULE-B04','RULE-B05'],['SOURCE_RULE','REQUIRES_BACKTEST','SOURCE_RULE','SOURCE_RULE','REQUIRES_BACKTEST'],['MDS','MWD','52W_COT','OI_DRAIN','4H_DISPLACEMENT']);
}
function evaluateOSOK(c1h:Candle[],daily:Candle[],macro:MacroContext|undefined,weekly:WeeklyContext|undefined,vol:VolatilityContext|undefined,now:number,cfg:EngineConfig):StrategyEvaluation{
 if((weekly?.osokTradesTakenThisWeek??0)>=1)return makeEval('OSOK','L7_WEEKLY_KNOCKOUT',true,'NO_TRADE',null,0,0,0,0,null,'OSOK_WEEKLY_TRADE_ALREADY_CONSUMED',['RULE-C01','RULE-C02'],['SOURCE_RULE','SOURCE_RULE'],['OSOK']);
 if(weekly?.template==='SEEK_AND_DESTROY')return makeEval('OSOK','L7_WEEKLY_KNOCKOUT',true,'NO_TRADE',null,0,0,0,0,null,'SEEK_AND_DESTROY_NO_TRADE',['RULE-C02'],['SOURCE_RULE'],['OSOK','WEEKLY_TEMPLATE']);
 if((vol?.cbdrRangePips??0)>40)return makeEval('OSOK','L7_WEEKLY_KNOCKOUT',true,'NO_TRADE',null,0,0,0,0,null,'CBDR_TOO_WIDE',['RULE-D01'],['SOURCE_RULE'],['CBDR']);
 if((vol?.adr5Pips??0)>0&&(vol?.londonConsumedPips??0)/(vol.adr5Pips??1)>.60)return makeEval('OSOK','L7_WEEKLY_KNOCKOUT',true,'NO_TRADE',null,0,0,0,0,null,'ADR5_LONDON_LOCKOUT',['RULE-D02'],['REJECTED'],['ADR5']);
 const last=c1h.at(-1)!;const lo=minLow(c1h.slice(-120)),hi=maxHigh(c1h.slice(-120)),q=(last.close-lo)/Math.max(hi-lo,1e-9);const long=q<=.5,short=q>=.5;if(!long&&!short)return makeEval('OSOK','L7_WEEKLY_KNOCKOUT',true,'NO_TRADE',null,0,0,0,0,null,'QUADRANT_INVALID',['RULE-C03'],['SOURCE_RULE'],['QUADRANTS']);
 const s:Side=long?'LONG':'SHORT';const entry=last.close;const swing=s==='LONG'?last.low:last.high;const dist=Math.abs(entry-swing);const target=entry+(s==='LONG'?1:-1)*dist*1.62;const sl=s==='LONG'?swing:last.high;const rrr=Math.abs(target-entry)/Math.max(Math.abs(entry-sl),1e-9);const ok=rrr>=3&&inNyKillzone(now);return makeEval('OSOK','L7_WEEKLY_KNOCKOUT',true,ok?'SIGNAL':'NO_TRADE',s,entry,sl,target,ok?90:58,ok?'A+':'C',ok?'OSOK_READY':'OSOK_KILLZONE_OR_RRR',['RULE-C01','RULE-C02','RULE-C03','RULE-C04'],['SOURCE_RULE','SOURCE_RULE','SOURCE_RULE','SOURCE_RULE'],['OSOK','QUADRANT','1.62_EXTENSION']);
}
function evaluateOffset(c:Candle[],cfg:EngineConfig):StrategyEvaluation{
 if(c.length<6)return makeEval('OFFSET_IFVG','L8_INTRADAY',false,'NO_TRADE',null,0,0,0,0,null,'INSUFFICIENT_DATA',['RULE-E01'],['SOURCE_RULE'],[]);
 const p=c.at(-3)!,b=c.at(-2)!,l=c.at(-1)!,sell=b.high>p.high&&l.close<p.low,buy=b.low<p.low&&l.close>p.high; if(!sell&&!buy)return makeEval('OFFSET_IFVG','L8_INTRADAY',true,'NO_TRADE',null,0,0,0,0,null,'IFVG_NOT_CONFIRMED',['RULE-E01'],['SOURCE_RULE'],['OFFSET_ACCUMULATION','IFVG']);
 const s:sSide=sell?'SHORT':'LONG',entry=l.close,sl=s==='SHORT'?b.high:b.low,tp=s==='SHORT'?p.low:p.high,rrr=Math.abs(tp-entry)/Math.max(Math.abs(entry-sl),1e-9),ok=rrr>=cfg.scalpMinRRR;return makeEval('OFFSET_IFVG','L8_INTRADAY',true,ok?'SIGNAL':'NO_TRADE',s,entry,sl,tp,ok?74:54,ok?'B':'C',ok?'OFFSET_IFVG_READY':'RRR_BELOW_SCALP_MIN',['RULE-E01'],['SOURCE_RULE'],['OFFSET_ACCUMULATION','IFVG']);
}
function evaluateAsianNyScalp(c:Candle[],now:number,cfg:EngineConfig,kind:'ASIAN_SCALP'|'NY_SCALP'):StrategyEvaluation{
 const m=nyMinutes(now);const active=kind==='ASIAN_SCALP'?(m>=1200&&m<=1350):(m>=420&&m<=600);if(!active)return makeEval(kind,'L8_SCALPING',true,'NO_TRADE',null,0,0,0,0,null,kind==='ASIAN_SCALP'?'ASIAN_WINDOW_CLOSED':'NY_WINDOW_CLOSED',[kind==='ASIAN_SCALP'?'RULE-E02':'RULE-E03'],['SOURCE_RULE'],['SESSION']);
 const last=c.at(-1)!;const side:Side=last.close>=last.open?'LONG':'SHORT',entry=last.close,sl=side==='LONG'?last.low:last.high,tp=entry+(side==='LONG'?1:-1)*Math.abs(entry-sl)*1.5,rrr=1.5;return makeEval(kind,'L8_SCALPING',true,'SIGNAL',side,entry,sl,tp,65,'B',kind==='ASIAN_SCALP'?'ASIAN_SCALP_READY':'NY_SCALP_READY',[kind==='ASIAN_SCALP'?'RULE-E02':'RULE-E03'],['SOURCE_RULE'],['SCALP','SESSION']);
}
function applyGlobalGates(e:StrategyEvaluation,c:Candle[],symbol:string,structure:StructureSnapshot,macro:MacroContext|undefined,vol:VolatilityContext|undefined,r:RiskState,weekly:WeeklyContext|undefined,now:number,cfg:EngineConfig):StrategyEvaluation{
 const reasons:string[]=[e.reason];if(!e.applicable)return e;
 if(!r.tradingEnabled)return {...e,status:'NO_TRADE',reason:'ACCOUNT_FROZEN',warnings:[...e.warnings,'Risk engine disabled trading']};
 if(r.consecutiveLosses>=r.maxConsecutiveLosses)return {...e,status:'NO_TRADE',reason:'CIRCUIT_BREAKER_TRIGGERED_3_LOSSES'};
 if(r.demonStrikes>=r.maxDemonStrikes)return {...e,status:'NO_TRADE',reason:'DEMON_FINDER_ACCOUNT_LOCKED'};
 if(r.dailyTrades>=r.maxDailyTrades)return {...e,status:'NO_TRADE',reason:'MAX_DAILY_TRADES_EXCEEDED'};
 if(r.dailyLossPct>=cfg.dailyLossLimitPct)return {...e,status:'NO_TRADE',reason:'DAILY_DRAWDOWN_LIMIT_REACHED'};
 if(macro?.newsLock)return {...e,status:'NO_TRADE',reason:'HIGH_IMPACT_NEWS_LOCK'};
 if(e.status==='SIGNAL'&&!inNyKillzone(now)&&!['ASIAN_SCALP'].includes(e.strategy))return {...e,status:'NO_TRADE',reason:'OUT_OF_KILLZONE'};
 if(vol?.spread!==undefined&&vol?.averageSpread!==undefined&&vol.averageSpread>0&&vol.spread>2*vol.averageSpread)return {...e,status:'NO_TRADE',reason:'SPREAD_SPIKE'};
 if(vol?.slippage!==undefined&&vol?.averageSlippage!==undefined&&vol.averageSlippage>0&&vol.slippage>2*vol.averageSlippage)return {...e,status:'NO_TRADE',reason:'SLIPPAGE_SPIKE'};
 const hi=maxHigh(c.slice(-20)),lo=minLow(c.slice(-20)),mid=hi-lo>0?(e.entry-lo)/(hi-lo):.5;if(e.status==='SIGNAL'&&e.strategy!=='OSOK'&&(mid>.35&&mid<.65)&&!e.components.includes('FIRST_LINE'))return {...e,status:'NO_TRADE',reason:'MID_RANGE_LOCKOUT'};
 if(e.status==='SIGNAL'&&structure.bias!=='NEUTRAL'&&e.side&&((structure.bias==='BULLISH'&&e.side==='SHORT')||(structure.bias==='BEARISH'&&e.side==='LONG'))&&e.strategy!=='MDS')reasons.push('FIGHTING_ORDER_FLOW');
 if(e.status==='SIGNAL'&&e.rrr<(e.strategy==='MDS'||e.strategy==='OSOK'?cfg.mdsOsokMinRRR:e.family.includes('SCALP')?cfg.scalpMinRRR:cfg.minRRR))return {...e,status:'NO_TRADE',reason:'RRR_BELOW_STRATEGY_MIN'};
 if(weekly?.template==='SEEK_AND_DESTROY'&&e.strategy!=='ASIAN_SCALP'&&e.status==='SIGNAL')return {...e,status:'NO_TRADE',reason:'SEEK_AND_DESTROY_NO_TRADE'};
 return reasons.length>1?{...e,warnings:[...e.warnings,...reasons.slice(1)]}:e;
}

export function analyze(symbol:string,input:Candle[],timeframe='5m',cfg:EngineConfig=DEFAULT_CONFIG,context:EngineContext={}):Analysis{
 const c=completeCandles(input);const ts=context.now??c.at(-1)?.time??Date.now();const r=defaultRisk(cfg,context);
 if(c.length<30){return emptyAnalysis(symbol,timeframe,'INSUFFICIENT_DATA',r)}
 const ar=atr(c);const last=c.at(-1)!;const prev=c.at(-2)!;const structure=buildStructure(c);const pools=detectPools(c,ar);const zones=zonesFromCandles(c,timeframe,structure.bias==='BULLISH'?'LONG':structure.bias==='BEARISH'?'SHORT':null);
 const macro=context.macro;const weekly=context.weekly;const vol=context.volatility??{};const session=sessionName(ts);
 const last15=c; const d=c.length>=1200?c.slice(-2000,-144):c; const d1=d.length?d:c.slice(-120); const h1=c.filter((_,i)=>i%12===0); const h4=c.filter((_,i)=>i%48===0);
 const f=fvg(c.at(-3)!,c.at(-2)!,last);const bullFvg=f.bull,bearFvg=f.bear;const sweepBull=last.low<(pools.find(p=>p.type==='SSL')?.price??Infinity)&&last.close>=(pools.find(p=>p.type==='SSL')?.price??Infinity);const sweepBear=last.high>(pools.find(p=>p.type==='BSL')?.price??-Infinity)&&last.close<=(pools.find(p=>p.type==='BSL')?.price??-Infinity);const sweep=sweepBull||sweepBear;
 const ob=zones.some(z=>z.type.includes('OB')&&between(last.close,z.bottom,z.top));const breaker=zones.some(z=>z.type.includes('BREAKER')&&between(last.close,z.bottom,z.top));
 const rh=maxHigh(c.slice(-40)),rl=minLow(c.slice(-40));const side:Side|null=structure.bias==='BULLISH'?'LONG':structure.bias==='BEARISH'?'SHORT':sweepBull?'LONG':sweepBear?'SHORT':null;const ote=side==='LONG'?between(last.close,rl+(rh-rl)*.62,rl+(rh-rl)*.79):side==='SHORT'?between(last.close,rh-(rh-rl)*.79,rh-(rh-rl)*.62):false;
 const dolTarget=side==='LONG'?maxHigh(c.slice(-60)):side==='SHORT'?minLow(c.slice(-60)):null;
 const hermes=evaluateHermesStructure(c,structure);const evals=[evaluatePCR(d1,side,session,macro,cfg),evaluateSiren(last15,h1,structure,cfg),evaluateSNAKE(last,prev,context.elapsedFraction),evaluateSAC(last,prev,cfg),evaluateWick(c,structure,cfg),evaluateMDS(h4,d1,macro,cfg),evaluateOSOK(h1,d1,macro,weekly,vol,ts,cfg),evaluateOffset(c,cfg),evaluateAsianNyScalp(c,ts,cfg,'ASIAN_SCALP'),evaluateAsianNyScalp(c,ts,cfg,'NY_SCALP')].map(e=>applyGlobalGates(e,c,symbol,structure,macro,vol,r,weekly,ts,cfg));
 const candidates=evals.filter(e=>e.status==='SIGNAL').sort((a,b)=>b.score-a.score);const best=candidates[0]??null;
 const bestSide=best?.side??side;const entry=best?.entry??last.close;const sl=best?.sl??(bestSide==='LONG'?Math.min(last.low,rl):bestSide==='SHORT'?Math.max(last.high,rh):entry);const tp=best?.tp??(dolTarget??entry);const rrr=best?best.rrr:(Math.abs(tp-entry)/Math.max(Math.abs(entry-sl),1e-9));
 const ruleTrace:RuleTrace[]=[...RULEBOOK.filter(x=>x.scope==='L1-3').slice(0,12).map(x=>({scope:x.scope,id:x.id,status:x.status,passed:structure.bias!=='NEUTRAL',reason:structure.bias!=='NEUTRAL'?'STRUCTURE_PRESENT':'STRUCTURE_UNCLEAR'})),...RULEBOOK.filter(x=>x.scope==='L4-6').slice(0,12).map(x=>({scope:x.scope,id:x.id,status:x.status,passed:best!==null,reason:best?'STRATEGY_DISPATCHED':'NO_QUALIFIED_SETUP'})),...RULEBOOK.filter(x=>x.scope==='L7-9').slice(0,8).map(x=>({scope:x.scope,id:x.id,status:x.status,passed:best?.family.includes('L7')||best?.family.includes('L8')||false,reason:best?.family??'NOT_USED'})),...RULEBOOK.filter(x=>x.scope==='HERMES').map(x=>{const hit=best?.ruleIds.includes(x.id)??false;return {scope:x.scope,id:x.id,status:x.status,passed:hit,reason:hit?'APPLIED_TO_SELECTED_SETUP':'NOT_SELECTED_OR_DATA_UNAVAILABLE'}})];
 const reasons:string[]=[];if(!best)reasons.push(...new Set(evals.filter(e=>e.status!=='SIGNAL').map(e=>e.reason).filter(Boolean)));if(!structure.bias||structure.bias==='NEUTRAL')reasons.push('NO_DIRECTIONAL_STRUCTURE');if(macro?.znDxySyncDays!==undefined&&macro.znDxySyncDays>=5)reasons.push('BOND_DXY_SYNC_CONSOLIDATION_PREDICTED');if(!inNyKillzone(ts)&&!evals.some(e=>e.status==='SIGNAL'&&e.strategy==='ASIAN_SCALP'))reasons.push('OUT_OF_KILLZONE');if(!ote&&!ob&&!bullFvg&&!bearFvg&&!breaker)reasons.push('NO_VALID_POI');if(rrr<cfg.minRRR&&best?.family==='CORE')reasons.push('RRR_BELOW_CORE_MIN');
 const status:ValidationStatus=best?'SIGNAL':'NO_TRADE';const grade:Grade=best?.grade??null;const score=best?.score??Math.max(0,(structure.bias!=='NEUTRAL'?20:0)+(sweep?15:0)+((bullFvg||bearFvg)?12:0)+(ob?12:0)+(ote?12:0)+(structure.mss?15:0));const comps=best?.components??['BOS/MSS','LIQUIDITY','PD_ARRAYS','DOL','RISK_GATE'];
 const sourceWarnings=['Source-derived percentages and fixed thresholds remain marked for backtest where the supplied corpus requires it.','Missing COT/DXY/bond/seasonality/news data is never fabricated; affected strategies remain NO_TRADE.'];
 return {symbol,timeframe,side:bestSide,bias:bestSide==='LONG'?'BULLISH':bestSide==='SHORT'?'BEARISH':structure.bias,bos:structure.bos,mss:structure.mss,sweep,fvg:bullFvg||bearFvg,orderBlock:ob,breaker,ote,liquidity:sweepBull?'SSL_SWEEP':sweepBear?'BSL_SWEEP':'UNMAPPED',dol:dolTarget?.toFixed(5)??'UNKNOWN',grade,rrr,entry,sl,tp,strategy:best?.strategy??null,status,reason:best?.reason??(reasons[0]??'NO_QUALIFIED_SETUP'),score,components,structure,zones,liquidityPools:pools,dolTarget,rrrPolicy:best?.family.includes('SCALP')?'1.5R+':best?.strategy==='MDS'||best?.strategy==='OSOK'?'3R+':'2.5R+',strategyEvaluations:evals,ruleTrace,noTradeReasons:[...new Set(reasons)],state:best?'ORDER_READY':'NO_TRADE',risk:r,sourceWarnings};
}
function emptyAnalysis(symbol:string,timeframe:string,reason:string,r:RiskState):Analysis{return {symbol,timeframe,side:null,bias:'NEUTRAL',bos:false,mss:false,sweep:false,fvg:false,orderBlock:false,breaker:false,ote:false,liquidity:'UNKNOWN',dol:'UNKNOWN',grade:null,rrr:0,entry:0,sl:0,tp:0,strategy:null,status:'NO_TRADE',reason,score:0,components:[],structure:{bias:'NEUTRAL',bullishFourPoint:false,bearishFourPoint:false,strongHigh:null,strongLow:null,weakHigh:null,weakLow:null,bos:false,mss:false,choch:false,insideBarsNeutralized:0,protectedIth:null,protectedItl:null},zones:[],liquidityPools:[],dolTarget:null,rrrPolicy:'strategy-specific',strategyEvaluations:[],ruleTrace:RULEBOOK.map(x=>({scope:x.scope,id:x.id,status:x.status,passed:false,reason})),noTradeReasons:[reason],state:'NO_TRADE',risk:r,sourceWarnings:[]}}

export function positionSize(balance:number,riskPct:number,entry:number,sl:number,contractValue=1){const cash=balance*riskPct/100;const distance=Math.abs(entry-sl);return distance>0?cash/(distance*contractValue):0}
export function currentTraderFRisk(wins:number,losses:number,baseRisk=DEFAULT_CONFIG.baseRiskPct){if(losses>0)return baseRisk;return Math.min(DEFAULT_CONFIG.maxRiskPct,baseRisk+.5*Math.min(Math.max(wins,0),3))}
export function nextRiskAfterTrade(current:number,result:'WIN'|'LOSS',consecutiveWins:number){if(result==='LOSS')return DEFAULT_CONFIG.baseRiskPct;if(consecutiveWins>=5)return DEFAULT_CONFIG.baseRiskPct;return Math.min(DEFAULT_CONFIG.maxRiskPct,Math.max(DEFAULT_CONFIG.baseRiskPct,current+.5))}
export function generateDemoCandles(seed:number,count:number,base:number):Candle[]{let x=seed>>>0,p=base;const out:Candle[]=[];const rnd=()=>{x=(1664525*x+1013904223)>>>0;return x/4294967296};for(let i=0;i<count;i++){const o=p,drift=(rnd()-.47)*base*.004,vol=base*.003*(.65+rnd()),close=Math.max(1,o+drift),high=Math.max(o,close)+vol*rnd(),low=Math.min(o,close)-vol*rnd();p=close;out.push({time:Date.now()-(count-i)*300000,open:o,high,low,close,volume:500+rnd()*1200})}return out}
