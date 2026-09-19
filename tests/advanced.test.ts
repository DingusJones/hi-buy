import {it,expect} from 'vitest';
import {divergence,type Bar} from '../src/domain';
it('bullish RSI divergence waits for second pivot confirmation and expires',()=>{
 const b:Bar[]=Array.from({length:30},(_,i)=>({date:`2024-01-${String(i+1).padStart(2,'0')}`,open:100,close:100,high:101,low:99,volume:100}));b[5].low=95;b[15].low=94;
 const rsis=Array(30).fill(50);rsis[5]=30;rsis[15]=36;const atr=Array(30).fill(2);
 expect(divergence(b.slice(0,18),atr,rsis).bullish).toBe(false);
 expect(divergence(b.slice(0,19),atr,rsis).bullish).toBe(true);
 expect(divergence(b,atr,rsis).bullish).toBe(false);
});
