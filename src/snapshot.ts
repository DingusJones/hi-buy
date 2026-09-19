import {z} from 'zod';
import {validateBars} from './domain.ts';
const date=z.string().refine(v=>Number.isFinite(Date.parse(v)),'Invalid date');
const number=z.number().finite();
const bar=z.object({date:date,open:number.positive(),high:number.positive(),low:number.positive(),close:number.positive(),volume:number.int().nonnegative()});
export const entrySchema=z.object({source:z.string(),url:z.url().refine(v=>v.startsWith('https://')),unit:z.string(),delay:z.string(),retrievedAt:date,observedAt:date.nullable(),status:z.enum(['available','unavailable']),error:z.string().nullable(),price:number.nullable(),change:number.nullable(),volume:number.nonnegative().nullable(),marketCap:number.nonnegative().nullable(),bars:z.array(bar)}).superRefine((e,c)=>{if(e.status==='available'&&(e.price===null||e.error))c.addIssue({code:'custom',message:'Incomplete observation'});if(e.status==='unavailable'&&[e.price,e.change,e.volume,e.marketCap].some(v=>v!==null)||e.status==='unavailable'&&e.bars.length)c.addIssue({code:'custom',message:'Unavailable values must be empty'});try{validateBars(e.bars);}catch{c.addIssue({code:'custom',message:'Invalid bars'});}});
export const snapshotSchema=z.object({version:z.literal(1),entries:z.record(z.string(),entrySchema)});
export type Entry=z.infer<typeof entrySchema>;
export type Snapshot=z.infer<typeof snapshotSchema>;
export function parseSnapshot(value:unknown):Snapshot{return snapshotSchema.parse(value);}
export function freshness(e:Entry,now=Date.now()){if(e.status==='unavailable')return 'Unavailable';if(Date.parse(e.retrievedAt)>now+300000||(e.observedAt!==null&&Date.parse(e.observedAt)>now+300000))return 'Invalid future timestamp';if(now-Date.parse(e.retrievedAt)>20*60000)return 'Stale retrieval';if(e.observedAt===null)return 'Provider timestamp unavailable · retrieval time only';const limit=e.bars.length?4*86400000:e.source.includes('EIA')?10*86400000:20*60000;return now-Date.parse(e.observedAt!)>limit?'Stale observation':'Recent retrieval · source may be delayed';}
