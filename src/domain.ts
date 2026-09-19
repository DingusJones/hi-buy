export type Section = 'stocks' | 'etfs';
export type Bar = {date:string; open:number; high:number; low:number; close:number; volume:number};
export const ENGINE='methodology-v1.0.0';
export const mean=(a:number[])=>a.reduce((s,x)=>s+x,0)/a.length;
export const last=(a:(number|null)[])=>a.at(-1)??null;
export function smooth(a:number[],n:number,wilder=false):(number|null)[]{
 const out:(number|null)[]=a.map(()=>null); if(a.length<n)return out;
 let s=mean(a.slice(0,n));out[n-1]=s; const alpha=wilder?1/n:2/(n+1);
 for(let i=n;i<a.length;i++){s+=alpha*(a[i]-s);out[i]=s;}return out;
}
export function sma(a:number[],n:number){return a.map((_,i)=>i<n-1?null:mean(a.slice(i-n+1,i+1)));}
export function rsi(c:number[],n=14){const gains=c.slice(1).map((x,i)=>Math.max(0,x-c[i])), losses=c.slice(1).map((x,i)=>Math.max(0,c[i]-x));const g=smooth(gains,n,true),l=smooth(losses,n,true);return [null,...g.map((v,i)=>v===null||l[i]===null?null:v===0&&l[i]===0?50:l[i]===0?100:100-100/(1+v/l[i]!))];}
export function validateBars(b:Bar[]){for(let i=0;i<b.length;i++){const x=b[i];if(!/^\d{4}-\d{2}-\d{2}$/.test(x.date)||!Number.isFinite(Date.parse(x.date))||new Date(x.date).toISOString().slice(0,10)!==x.date||(i>0&&x.date<=b[i-1].date)||![x.open,x.high,x.low,x.close].every(v=>Number.isFinite(v)&&v>0)||x.low>Math.min(x.open,x.close)||x.high<Math.max(x.open,x.close)||!Number.isInteger(x.volume)||x.volume<0)throw Error('Invalid or unordered securities bar');}}
export type Pivot={index:number;price:number;type:'high'|'low';knownAt:string};
export function fibonacci(b:Bar[],atr:(number|null)[],k=3){
 const pivots:Pivot[]=[];
 for(let i=Math.max(k,b.length-126);i<b.length-k;i++){
 const range=b.slice(i-k,i+k+1);const high=range.findIndex(x=>x.high===Math.max(...range.map(y=>y.high)))===k;const low=range.findIndex(x=>x.low===Math.min(...range.map(y=>y.low)))===k;
 if(high===low)continue;const p:Pivot={index:i,price:high?b[i].high:b[i].low,type:high?'high':'low',knownAt:b[i+k].date};const prev=pivots.at(-1);
 if(!prev)pivots.push(p);else if(prev.type===p.type){if(p.type==='high'?p.price>prev.price:p.price<prev.price)pivots[pivots.length-1]=p;}else if(i-prev.index>=5&&atr[i+k]!==null&&Math.abs(p.price-prev.price)>=2*atr[i+k]!)pivots.push(p);
 }
 const a=pivots.at(-2),z=pivots.at(-1);if(!a||!z)return null;
 const up=a.type==='low',range=Math.abs(a.price-z.price),close=b.at(-1)!.close;
 return {a,z,up,active:up?close>=a.price:close<=a.price,levels:[0,.236,.382,.5,.618,.786,1].map(r=>({ratio:r,price:up?z.price-r*range:z.price+r*range})).filter(x=>x.price>0),extensions:[1.272,1.618,2,2.618].map(r=>({ratio:r,price:up?a.price+r*range:a.price-r*range})).filter(x=>x.price>0)};
}
export function indicators(input:Bar[],asOf:string){
 const b=input.filter(x=>x.date<=asOf);validateBars(b);if(!b.length)throw Error('No bars at replay cutoff');const c=b.map(x=>x.close),n=b.length,C=c[n-1];
 const tr=b.map((x,i)=>i?Math.max(x.high-x.low,Math.abs(x.high-c[i-1]),Math.abs(x.low-c[i-1])):x.high-x.low),atr=smooth(tr,14,true);
 const plus=b.slice(1).map((x,i)=>{const u=x.high-b[i].high,d=b[i].low-x.low;return u>d&&u>0?u:0;}),minus=b.slice(1).map((x,i)=>{const u=x.high-b[i].high,d=b[i].low-x.low;return d>u&&d>0?d:0;});
 const dt=smooth(tr.slice(1),14,true),p=smooth(plus,14,true),m=smooth(minus,14,true);
 const diP=p.map((x,i)=>x===null?null:dt[i]===0?0:100*x/dt[i]!),diM=m.map((x,i)=>x===null?null:dt[i]===0?0:100*x/dt[i]!);
 const dx=diP.flatMap((x,i)=>x===null?[]:[(x+diM[i]!)===0?0:100*Math.abs(x-diM[i]!)/(x+diM[i]!)]);
 const e12=smooth(c,12),e26=smooth(c,26),macds=c.flatMap((_,i)=>e26[i]===null?[]:[e12[i]!-e26[i]!]),signals=smooth(macds,9);
 const ma=Object.fromEntries([20,50,100,200].map(k=>[k,{sma:last(sma(c,k)),ema:last(smooth(c,k)),slope:n>=k+5?100*(last(sma(c,k))!/sma(c,k)[n-6]!-1)/5:null}]));
 const obv=[0];for(let i=1;i<n;i++)obv.push(obv[i-1]+Math.sign(c[i]-c[i-1])*b[i].volume);
 const adv=n>=21?mean(b.slice(-21,-1).map(x=>x.volume)):null,addv=n>=21?mean(b.slice(-21,-1).map(x=>x.close*x.volume)):null;
 const mid=n>=20?mean(c.slice(-20)):null,sd=mid===null?null:Math.sqrt(mean(c.slice(-20).map(x=>(x-mid)**2)));
 const returns=c.slice(1).map((x,i)=>Math.log(x/c[i])).slice(-63),vol=returns.length===63?Math.sqrt(returns.reduce((s,x)=>s+(x-mean(returns))**2,0)/62)*Math.sqrt(252):null;
 const regime=ma[200].sma===null?'insufficient_history':C>ma[200].sma&&ma[50].sma!>ma[200].sma&&ma[200].slope!>0?'bullish':C<ma[200].sma&&ma[50].sma!<ma[200].sma&&ma[200].slope!<0?'bearish':'mixed';
 return {asOf:b[n-1].date,engine:ENGINE,count:n,close:C,ma,rsi:last(rsi(c)),rsiSeries:rsi(c),atr:last(atr),atrPercent:last(atr)===null?null:100*last(atr)!/C,diPlus:last(diP),diMinus:last(diM),adx:last(smooth(dx,14,true)),macd:last(macds),signal:last(signals),histogram:last(signals)===null?null:last(macds)!-last(signals)!,adv,addv,rvol:adv?b[n-1].volume/adv:null,obv:obv[n-1],obv10:n>10&&b.slice(-10).reduce((s,x)=>s+x.volume,0)>0?(obv[n-1]-obv[n-11])/b.slice(-10).reduce((s,x)=>s+x.volume,0):null,bollinger:mid===null?null:{middle:mid,upper:mid+2*sd!,lower:mid-2*sd!,percentB:sd? (C-(mid-2*sd))/(4*sd):null},volatility:vol,drawdown:C/Math.max(...c)-1,regime,divergence:divergence(b,atr,rsi(c)),squeeze:bollingerSqueeze(c),fib:fibonacci(b,atr)};
}
export type Component={name:string;weight:number;value:number|null;availability:number;reason:string};
const clip=(x:number)=>Math.min(1,Math.max(0,x));
export function score(i:ReturnType<typeof indicators>,section:Section){
 const t=i.ma[200].sma===null?null:25*([i.close>i.ma[50].sma!,i.ma[50].sma!>i.ma[200].sma,i.ma[200].slope!>0,i.diPlus!>i.diMinus!&&i.adx!>=20].filter(Boolean).length);
 const support=i.fib?.active?i.fib.levels.filter(x=>x.price<=i.close).sort((a,b)=>b.price-a.price)[0]:undefined;
 const components:Component[]=[{name:'Trend',weight:25,value:t,availability:t===null?0:1,reason:'Four trend flags; each contributes 25 points.'},{name:'Momentum',weight:section==='stocks'?20:15,value:i.rsi===null||i.histogram===null||!i.atr?null:Math.max(0,mean([100*clip(1-Math.abs(i.rsi-55)/30),100*clip(.5+i.histogram/(.2*i.atr))])-(i.divergence.bearish?15:0)),availability:i.rsi===null||i.histogram===null?0:2/3,reason:'RSI suitability and MACD/ATR; peer excess return missing (<20 peers). Confirmed bearish RSI divergence deducts 15; bullish divergence has no bonus.'},{name:'Fibonacci',weight:15,value:i.fib? support&&i.atr?70*clip(1-(i.close-support.price)/i.atr/.5):0:null,availability:i.fib?1:0,reason:'Daily support only; weekly confluence unavailable.'},{name:'Participation',weight:section==='stocks'?10:15,value:i.rvol===null||i.obv10===null?null:mean([100*clip((i.rvol-.5)/1.5),100*clip((i.obv10+1)/2)]),availability:i.rvol===null||i.obv10===null?0:2/3,reason:'RVOL and OBV; consolidated peer liquidity percentile missing.'},{name:'Volatility quality',weight:section==='stocks'?10:15,value:i.atrPercent===null?null:100*clip(1-Math.abs(i.atrPercent-2)/4),availability:i.atrPercent===null?0:1,reason:'Chosen movement band; not a measure of safety.'},{name:'Fundamentals',weight:section==='stocks'?15:5,value:null,availability:0,reason:'No permitted point-in-time fundamentals.'},{name:'Valuation',weight:section==='stocks'?5:10,value:null,availability:0,reason:'No comparable peer population or issuer facts.'}];
 const available=components.reduce((s,x)=>s+x.weight*x.availability,0),raw=available?components.reduce((s,x)=>s+x.weight*x.availability*(x.value??0),0)/available:0,penalty=section==='stocks'?5:0;
 return {components,coverage:available/100,raw,final:Math.max(0,raw*available/100-penalty),eventPenalty:penalty,eligible:false,reasons:['Synthetic test vectors cannot qualify as real research candidates','Missing mandatory market cap/AUM, benchmark and action verification','Peer population below 20',section==='stocks'?'Unknown earnings coverage: 5-point deduction; wait-only':'Fund-event coverage unknown; no company earnings deduction']};
}
export function percentile(values:number[],x:number){if(values.length<20)return null;const below=values.filter(v=>v<x).length,equal=values.filter(v=>v===x).length;return (below+(equal-1)/2)/(values.length-1);}

/** Complete-link clusters: a cluster's full span may not exceed 0.25 daily ATR. */
export function confluence(levels:{price:number;timeframe:'daily'|'weekly';ratio:number}[],atr:number,close:number){
 if(!Number.isFinite(atr)||atr<=0)return [];
 const groups:typeof levels[]=[];
 for(const level of [...levels].filter(l=>Number.isFinite(l.price)&&l.price>0).sort((a,b)=>a.price-b.price)){const g=groups.at(-1);if(g&&level.price-g[0].price<=.25*atr)g.push(level);else groups.push([level]);}
 return groups.map(members=>{const midpoint=(members[0].price+members.at(-1)!.price)/2;return {members,midpoint,width:members.at(-1)!.price-members[0].price,timeframes:new Set(members.map(x=>x.timeframe)).size,distanceAtr:(close-midpoint)/atr,near:Math.abs(close-midpoint)<=.5*atr};});
}
export function divergence(b:Bar[],atr:(number|null)[],rsis:(number|null)[],k=3){
 const highs:number[]=[],lows:number[]=[];
 for(let i=k;i<b.length-k;i++){const window=b.slice(i-k,i+k+1);const high=window.findIndex(x=>x.high===Math.max(...window.map(x=>x.high)))===k,low=window.findIndex(x=>x.low===Math.min(...window.map(x=>x.low)))===k;if(high&&!low)highs.push(i);if(low&&!high)lows.push(i);}
 function check(indices:number[],bullish:boolean){const [a,z]=indices.slice(-2);if(a===undefined||z===undefined||z-a<5||z-a>60||b.length-1-(z+k)>10||rsis[a]===null||rsis[z]===null||!atr[z])return false;return bullish?b[z].low<=b[a].low-.1*atr[z]!&&rsis[z]!>=rsis[a]!+5:b[z].high>=b[a].high+.1*atr[z]!&&rsis[z]!<=rsis[a]!-5;}
 return {bullish:check(lows,true),bearish:check(highs,false),knownAt:b.at(-1)?.date??null};
}
export function bollingerSqueeze(closes:number[]){
 const widths=closes.flatMap((_,i)=>{if(i<19)return [];const w=closes.slice(i-19,i+1),m=mean(w),sd=Math.sqrt(mean(w.map(x=>(x-m)**2)));return m!==0?[4*sd/m]:[];});
 if(widths.length<127)return null;const prior=widths.slice(-127,-1).sort((a,b)=>a-b),position=.2*(prior.length-1),low=Math.floor(position),threshold=prior[low]+(prior[Math.ceil(position)]-prior[low])*(position-low);
 return {width:widths.at(-1)!,threshold,squeeze:widths.at(-1)!<=threshold};
}
export function relativeStrength(asset:{date:string;value:number}[],benchmark:{date:string;value:number}[],basis:'price-only'|'total-return'){
 if(asset.length!==benchmark.length||asset.some((x,i)=>x.date!==benchmark[i].date||x.value<=0||benchmark[i].value<=0))return null;
 const n=asset.length;if(!n)return null;const excess=(h:number)=>n>h?(asset[n-1].value/asset[n-1-h].value-1)-(benchmark[n-1].value/benchmark[n-1-h].value-1):null;
 return {basis,line:asset[n-1].value/benchmark[n-1].value,excess21:excess(21),excess63:excess(63)};
}
