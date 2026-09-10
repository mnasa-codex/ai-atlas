'use client';

export type OkxCandle = {
  time:number; open:number; high:number; low:number; close:number; volume:number; confirmed:boolean;
};

const REST = 'https://www.okx.com/api/v5/market/candles';
const WS = 'wss://ws.okx.com:8443/ws/v5/business';

export const OKX_SYMBOLS = {
  BTCUSD: { instId:'BTC-USDT', label:'BTC / USDT', kind:'crypto' as const },
  XAUUSD: { instId:'XAU-USDT-SWAP', label:'Gold / USDT', kind:'gold' as const },
};

export function okxBar(tf:string){
  const m:Record<string,string>={ '1m':'1m','3m':'3m','5m':'5m','15m':'15m','30m':'30m','1H':'1H','2H':'2H','4H':'4H','6H':'6H','12H':'12H','1D':'1Dutc','1W':'1Wutc' };
  return m[tf]||'5m';
}

function parse(row:string[]):OkxCandle{
  return {time:Number(row[0]),open:Number(row[1]),high:Number(row[2]),low:Number(row[3]),close:Number(row[4]),volume:Number(row[5]||0),confirmed:row[8]==='1'};
}

export async function fetchOkxCandles(instId:string, timeframe='5m', limit=300):Promise<OkxCandle[]>{
  const url=`${REST}?instId=${encodeURIComponent(instId)}&bar=${encodeURIComponent(okxBar(timeframe))}&limit=${Math.min(limit,300)}`;
  const res=await fetch(url,{cache:'no-store'});
  if(!res.ok) throw new Error(`OKX HTTP ${res.status}`);
  const json=await res.json() as {code:string;msg:string;data:string[][]};
  if(json.code!=='0') throw new Error(json.msg||`OKX error ${json.code}`);
  return json.data.map(parse).filter(x=>x.confirmed).reverse();
}

export function subscribeOkxCandles(instId:string,timeframe='5m',onCandle:(c:OkxCandle)=>void,onStatus?:(s:string)=>void){
  const ws=new WebSocket(WS);
  const channel=`candle${okxBar(timeframe)}`;
  ws.onopen=()=>{ onStatus?.('connected'); ws.send(JSON.stringify({op:'subscribe',args:[{channel,instId}]})); };
  ws.onmessage=e=>{
    const msg=JSON.parse(e.data);
    if(!msg.data?.[0]) return;
    onCandle(parse(msg.data[0]));
  };
  ws.onerror=()=>onStatus?.('error');
  ws.onclose=()=>onStatus?.('disconnected');
  return ()=>{ if(ws.readyState===WebSocket.OPEN) ws.send(JSON.stringify({op:'unsubscribe',args:[{channel,instId}]})); ws.close(); };
}
