import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createServer} from 'vite';

// Run after npm run build. Middleware mode avoids binding a server in CI/sandboxes.
const base=process.env.GITHUB_ACTIONS === 'true' ? '/hi-buy/' : '/';
const themeScript=`<script type="module" src="${base}theme.js"></script>`;
const server=await createServer({server:{middlewareMode:true,ws:false,preTransformRequests:false}});
try {
  const source=await readFile('index.html','utf8');
  const dev=await server.transformIndexHtml(base,source);
  const prod=await readFile('dist/index.html','utf8');
  assert.ok(dev.includes(themeScript),`Development HTML must load ${base}theme.js`);
  assert.ok(prod.includes(themeScript),`Built HTML must load ${base}theme.js`);
  const csp=html=>html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
  assert.equal(csp(dev),csp(source));
  assert.equal(csp(prod),csp(source));
  assert.match(csp(prod),/script-src 'self';/);
  assert.equal(await readFile('dist/theme.js','utf8'),await readFile('public/theme.js','utf8'));
  console.log(`Theme module: dev and build ${base}theme.js verified; CSP unchanged; public asset copied.`);
} finally {
  await server.close();
}
