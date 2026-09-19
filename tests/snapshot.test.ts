import {describe,it,expect,vi} from 'vitest';
import {parseSnapshot,freshness,type Entry} from '../src/snapshot';
// @ts-expect-error Node ingestion script is exercised directly as well.
import {generate,stabilize,fred,coin,yahoo} from '../scripts/snapshot.mjs';
const entry:Entry={source:'CoinGecko',url:'https://www.coingecko.com/en/api',unit:'USD',delay:'Unknown',retrievedAt:'2026-09-19T12:00:00Z',observedAt:'2026-09-19T12:00:00Z',status:'available',error:null,price:100,change:2,volume:300,marketCap:400,bars:[]};
describe('public snapshots',()=>{
it('rejects fabricated unavailable values, malformed OHLC and unsafe links',()=>{for(const change of [{status:'unavailable'},{url:'javascript:alert(1)'},{bars:[{date:'2026-09-18',open:2,high:1,low:3,close:2,volume:1}]}])expect(()=>parseSnapshot({version:1,entries:{BTC:{...entry,...change}}})).toThrow();});
it('distinguishes unavailable, stale retrieval, stale observation and future dates',()=>{const now=Date.parse(entry.retrievedAt);expect(freshness(entry,now)).toContain('Recent');expect(freshness(entry,now+21*60000)).toBe('Stale retrieval');expect(freshness({...entry,observedAt:'2026-09-18'},now)).toBe('Stale observation');expect(freshness({...entry,status:'unavailable'},now)).toBe('Unavailable');expect(freshness(entry,now-3600000)).toBe('Invalid future timestamp');});
it('does not publish timestamps alone as data changes',()=>{const old={version:1,entries:{BTC:entry}};expect(stabilize({version:1,entries:{BTC:{...entry,retrievedAt:'2026-09-19T12:05:00Z'}}},old)).toEqual(old);});
it('parses dated official series including negative oil, and rejects missing crypto fields',()=>{expect(fred('observation_date,DCOILWTICO\n2020-04-20,-36.98\n2020-04-21,.').price).toBe(-36.98);expect(()=>fred('<html>blocked</html>')).toThrow();expect(()=>coin({},'bitcoin')).toThrow();expect(()=>yahoo({chart:{error:{code:'blocked'}}})).toThrow();});
it('records provider failures without retaining any numeric value',async()=>{const fetcher=vi.fn().mockResolvedValue({ok:false,status:429});const s=await generate(fetcher);expect(Object.keys(s.entries)).toHaveLength(13);for(const e of Object.values(s.entries) as Entry[]){expect(e.status).toBe('unavailable');expect(e.price).toBeNull();}expect(fetcher).toHaveBeenCalledTimes(6);});
it('accepts public crypto and dated EIA values through the full generator',async()=>{const fetcher=vi.fn(async(url:string)=>({ok:true,json:async()=>url.includes('coingecko')?Object.fromEntries(['bitcoin','ethereum','solana'].map(id=>[id,{usd:100,usd_24h_change:2,usd_24h_vol:300,usd_market_cap:400,last_updated_at:1789819200}])):{chart:{error:{code:'blocked'}}},text:async()=> 'observation_date,value\n2026-09-17,70'}));const s=await generate(fetcher);expect(s.entries.bitcoin.price).toBe(100);expect(s.entries.wti.price).toBe(70);expect(s.entries.AAPL.status).toBe('unavailable');});
});

const chart={chart:{error:null,result:[{meta:{regularMarketPrice:102,regularMarketTime:1789750800},timestamp:[1789750800],indicators:{quote:[{open:[100],high:[103],low:[99],close:[102],volume:[1000]}]}}]}};
const keyless={bitcoin:{usd:63123.45,usd_24h_change:-1.25,usd_24h_vol:23456789012,usd_market_cap:1234567890123}};
it('retains Yahoo OHLCV with explicit restrictions and accepts keyless crypto without provider time',async()=>{
 const s=await generate(async(url:string)=>({ok:true,json:async()=>url.includes('coingecko')?keyless:chart,text:async()=>{expect(url).toMatch(/^https:\/\/fred.stlouisfed.org\/graph\/fredgraph.csv\?id=(DCOILWTICO|DCOILBRENTEU|DHHNGSP)$/);return 'observation_date,value\n2026-09-17,70\n2026-09-18,.';}}));
 for(const id of ['AAPL','SPY']){expect(s.entries[id].status).toBe('available');expect(s.entries[id].price).toBe(102);expect(s.entries[id].bars).toHaveLength(1);expect(s.entries[id].delay).toContain('rights-unverified');expect(s.entries[id].delay).toContain('potentially delayed');}
 expect(s.entries.bitcoin).toMatchObject({status:'available',price:63123.45,change:-1.25,volume:23456789012,marketCap:1234567890123,observedAt:null});
 expect(Number.isFinite(Date.parse(s.entries.bitcoin.retrievedAt))).toBe(true);
 expect(freshness(s.entries.bitcoin)).toContain('Provider timestamp unavailable');
 expect(s.entries.wti).toMatchObject({status:'available',price:70,observedAt:'2026-09-17T00:00:00.000Z'});
 expect(s.entries.gold.status).toBe('unavailable');
 expect(coin({bitcoin:{...keyless.bitcoin,last_updated_at:1789750800}},'bitcoin').observedAt).toBe(new Date(1789750800000).toISOString());
});
it.each([{}, {chart:{result:[{timestamp:[1789750800],indicators:{quote:[{}]}}]}}])('clears malformed Yahoo responses through ingestion',async(raw)=>{
 const s=await generate(async()=>({ok:true,json:async()=>raw,text:async()=>'<html>error</html>'}));
 for(const id of ['AAPL','SPY'])expect(s.entries[id]).toMatchObject({status:'unavailable',price:null,bars:[]});
});
it('rejects impossible FRED calendar dates',()=>{expect(()=>fred('observation_date,value\n2026-02-30,70')).toThrow();});
