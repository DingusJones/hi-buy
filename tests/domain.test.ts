import {describe,it,expect} from 'vitest';
import {fibonacci,indicators,last,percentile,rsi,sma,smooth,validateBars,type Bar} from '../src/domain';
import {assets,dates} from '../src/data';
const flat=(n:number,step=0):Bar[]=>Array.from({length:n},(_,i)=>({date:new Date(Date.UTC(2020,0,i+1)).toISOString().slice(0,10),open:100+i*step,high:100+i*step,low:100+i*step,close:100+i*step,volume:1000}));
describe('independent hand-calculated indicator vectors',()=>{
 it('SMA and seeded EMA / Wilder recursion',()=>{expect(sma([1,2,3,4],3)).toEqual([null,null,2,3]);expect(smooth([1,2,3,4],3)).toEqual([null,null,2,3]);expect(smooth([1,2,3,4],3,true)[3]).toBeCloseTo(8/3,10);});
 it('RSI flat/rising/falling and warmup',()=>{expect(last(rsi(Array(20).fill(5)))).toBe(50);expect(last(rsi([1,2,3,4,5],3))).toBe(100);expect(last(rsi([5,4,3,2,1],3))).toBe(0);expect(last(rsi([5,4,3],3))).toBeNull();});
 it('flat prices have no false momentum or infinite bands',()=>{const i=indicators(flat(300),'2025-01-01');expect(i.rsi).toBe(50);expect(i.atr).toBe(0);expect(i.adx).toBe(0);expect(i.macd).toBe(0);expect(i.histogram).toBe(0);expect(i.bollinger?.percentB).toBeNull();expect(i.volatility).toBe(0);expect(i.obv).toBe(0);expect(i.fib).toBeNull();});
 it('Bollinger uses population variance and ADV excludes present bar',()=>{const b=flat(21,1);b[20].volume=21000;const i=indicators(b,'2025-01-01');expect(i.bollinger!.middle).toBe(110.5);expect(i.bollinger!.upper).toBeCloseTo(110.5+2*Math.sqrt(33.25),9);expect(i.adv).toBe(1000);expect(i.rvol).toBe(21);expect(i.addv).toBe(109500);});
 it('MACD and ADX seed at the documented warmups',()=>{expect(indicators(flat(33,1),'2025-01-01').signal).toBeNull();expect(indicators(flat(34,1),'2025-01-01').signal).toBeCloseTo(7,8);expect(indicators(flat(27,1),'2025-01-01').adx).toBeNull();expect(indicators(flat(28,1),'2025-01-01').adx).toBe(100);});
 it('rejects invalid geometry, duplicate dates, NaN and negative security prices',()=>{const b=flat(3);expect(()=>validateBars([b[0],b[0]])).toThrow();expect(()=>validateBars([{...b[0],close:NaN}])).toThrow();expect(()=>validateBars([{...b[0],low:-1}])).toThrow();expect(()=>validateBars([{...b[0],high:99}])).toThrow();});
 it('appending arbitrary future information does not change historical snapshot',()=>{const a=assets[0];const cutoff=dates[399];expect(indicators(a.bars,cutoff)).toEqual(indicators(a.bars.slice(0,400),cutoff));expect(indicators([...a.bars,{...a.bars.at(-1)!,date:'2099-01-01',close:999999}],cutoff)).toEqual(indicators(a.bars,cutoff));});
 it('confirmed pivots respect confirmation lag and minimum separation',()=>{const a=assets[0],i=indicators(a.bars,dates[399]);expect(i.fib).not.toBeNull();const fib=i.fib!;expect(fib.z.index).toBeLessThanOrEqual(396);expect(fib.z.index-fib.a.index).toBeGreaterThanOrEqual(5);expect(fib.z.knownAt).toBe(a.bars[fib.z.index+3].date);expect(fib.levels.find(x=>x.ratio===.5)!.price).toBeCloseTo((fib.a.price+fib.z.price)/2,10);expect(fibonacci(flat(30),Array(30).fill(1))).toBeNull();});
 it('midrank constant feature is neutral; fewer than 20 peers is missing',()=>{expect(percentile(Array(20).fill(7),7)).toBe(.5);expect(percentile([1,2],2)).toBeNull();expect(percentile(Array.from({length:20},(_,i)=>i),19)).toBe(1);});
});

describe('confluence and relative context',()=>{
 it('prevents single-link chaining and duplicate timeframe votes',async()=>{const {confluence}=await import('../src/domain');const groups=confluence([{price:10,timeframe:'daily',ratio:.5},{price:10.2,timeframe:'daily',ratio:.618},{price:10.4,timeframe:'weekly',ratio:.5}],1,10.5);expect(groups).toHaveLength(2);expect(groups[0].timeframes).toBe(1);expect(groups[0].width).toBeCloseTo(.2,10);});
 it('squeeze excludes current width and requires 126 prior valid widths',async()=>{const {bollingerSqueeze}=await import('../src/domain');expect(bollingerSqueeze(Array(145).fill(100))).toBeNull();expect(bollingerSqueeze(Array(146).fill(100))?.squeeze).toBe(true);});
 it('relative strength requires matched dates and has no short-history excess return',async()=>{const {relativeStrength}=await import('../src/domain');expect(relativeStrength([{date:'2024-01-01',value:2}],[{date:'2024-01-02',value:1}],'price-only')).toBeNull();expect(relativeStrength([{date:'2024-01-01',value:2}],[{date:'2024-01-01',value:1}],'price-only')).toEqual({basis:'price-only',line:2,excess21:null,excess63:null});});
});

it('rejects calendar-invalid dates instead of normalizing them silently',()=>{expect(()=>validateBars([{date:'2024-02-30',open:1,close:1,high:1,low:1,volume:0}])).toThrow('Invalid');});
