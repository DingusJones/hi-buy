import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {assets,fixtureManifest} from '../src/data.ts';
const sha256=value=>createHash('sha256').update(value).digest('hex');
const manifest={...fixtureManifest,calendar:'Synthetic weekdays, not an exchange calendar',assets:assets.map(a=>({id:a.id,count:a.bars.length,from:a.bars[0].date,to:a.bars.at(-1).date,sha256:sha256(JSON.stringify(a.bars))})),dataModuleSha256:sha256(await readFile(new URL('../src/data.ts',import.meta.url)))};
const destination=new URL('../docs/FIXTURE-MANIFEST.json',import.meta.url);
if(process.argv.includes('--write')){await writeFile(destination,JSON.stringify(manifest,null,2)+'\n');console.log('Fixture manifest written');}else{const prior=JSON.parse(await readFile(destination,'utf8'));if(JSON.stringify(prior)!==JSON.stringify(manifest))throw Error('Fixture manifest changed: inspect and regenerate intentionally');console.log('Fixture hashes verified: 2 identities × 440 synthetic bars');}
