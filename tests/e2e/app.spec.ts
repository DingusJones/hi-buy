import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{await page.route('**/live/latest.json?*',route=>route.fulfill({json:{version:1,entries:{}}}));});
test('complete research-to-paper journey survives reload',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await expect(page.getByRole('link',{name:'hi buy.com',exact:true})).toBeVisible();await expect(page.getByText('SYNTHETIC TEST LAB — SEPARATE FROM PUBLIC SNAPSHOTS')).toBeVisible();
 await expect(page.getByRole('heading',{name:'Top 5 Stock Research Candidates'})).toBeVisible();await expect(page.getByRole('heading',{name:'Top 5 ETF Research Candidates'})).toBeVisible();await expect(page.getByRole('heading',{name:'Top 5 Market News'})).toBeVisible();
 await page.getByRole('link',{name:'Open AAPL test workspace'}).click();await expect(page).toHaveURL(/stocks\/us-aapl/);
 await page.getByRole('button',{name:'Show chart data table'}).click();await expect(page.getByRole('table')).toHaveCount(2);
 await page.getByText('Inspect source, freshness & calculation provenance').first().click();await expect(page.getByText('synthetic_test / local mathematical vectors')).toBeVisible();
 await page.getByRole('button',{name:'Add to watchlist'}).click();await page.getByRole('button',{name:'Notes & scenarios',exact:true}).click();await page.getByLabel('Research note, bull / base / bear scenarios').fill('Base: test only. Bear: missing rights. <script>alert(1)</script>');await page.getByRole('button',{name:'Save note',exact:true}).click();
 await page.reload();await page.getByRole('button',{name:'Notes & scenarios',exact:true}).click();await expect(page.getByLabel('Research note, bull / base / bear scenarios')).toHaveValue('Base: test only. Bear: missing rights. <script>alert(1)</script>');
 await page.getByRole('button',{name:'Paper plan',exact:true}).click();await page.getByRole('button',{name:'Record paper intent'}).click();await page.getByRole('link',{name:'Open stocks journal'}).click();await expect(page.getByText('pending',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Advance one session'}).click();await expect(page.getByText('open',{exact:true})).toBeVisible();
 await page.getByRole('link',{name:'ETF paper journal',exact:true}).click();await expect(page.getByText('100000.00',{exact:true})).toHaveCount(2);expect(errors).toEqual([]);
});
test('independent sections, board headings and honest absent prices',async({page})=>{
 for(const section of ['stocks','etfs']){await page.goto(`/${section}/boards`);for(const title of section==='stocks'?['Top 10 stock gainers','Top 10 stock losers','Top 10 stocks by share volume','Top 10 stocks by dollar volume']:['Top 10 ETF gainers','Top 10 ETF losers','Top 10 ETFs by share volume','Top 10 ETFs by dollar volume'])await expect(page.getByRole('heading',{name:title,exact:true})).toBeVisible();}
 await page.goto('/crypto');for(const symbol of ['BTC','ETH','SOL'])await expect(page.getByRole('heading',{name:symbol,exact:true})).toBeVisible();await expect(page.locator('.price').filter({hasText:/^Unavailable$/})).toHaveCount(3);
 await page.goto('/commodities');await expect(page.getByRole('heading',{name:'WTI crude'})).toBeVisible();await page.getByLabel('Category').selectOption('Metals');await expect(page.getByRole('heading',{name:'Gold',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'WTI crude'})).toHaveCount(0);
 await page.goto('/stocks/unknown');await expect(page.getByRole('heading',{name:'Unknown instrument'})).toBeVisible();
});
for(const width of [360,390,768,1440])test(`responsive, offline and keyboard basics at ${width}px`,async({page,context})=>{
 await page.setViewportSize({width,height:900});const external:string[]=[];page.on('request',req=>{if(!req.url().startsWith('http://127.0.0.1:4173'))external.push(req.url());});
 await page.goto('/');await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();await page.keyboard.press('Enter');
 for(const path of ['/','/stocks/us-aapl','/etfs','/commodities','/crypto','/data-health','/settings']){await page.goto(path);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),path).toBe(true);await expect(page.getByRole('heading',{level:1})).toHaveCount(1);}
 await page.goto('/');await context.setOffline(true);await page.getByRole('link',{name:'Open SPY test workspace'}).click();await expect(page.getByRole('heading',{name:'SPY',exact:true})).toBeVisible();expect(external).toEqual([]);
});
test('export, destructive confirmation and backup restore',async({page})=>{
 await page.goto('/stocks/us-aapl');await page.getByRole('button',{name:'Add to watchlist'}).click();await page.goto('/settings');const exported=page.waitForEvent('download');await page.getByRole('button',{name:'Export private-data backup'}).click();const download=await exported;const file=await download.path();expect(file).toBeTruthy();
 page.once('dialog',d=>d.dismiss());await page.getByRole('button',{name:'Delete private data / reset'}).click();await page.goto('/watchlists');await expect(page.getByRole('link',{name:'AAPL · stocks'})).toBeVisible();
 await page.goto('/settings');page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Delete private data / reset'}).click();await page.goto('/watchlists');await expect(page.getByText('No saved assets. Add one from a research workspace.')).toBeVisible();
 await page.goto('/settings');page.once('dialog',d=>d.accept());await page.getByLabel('Restore backup').setInputFiles(file!);await expect(page.getByRole('status')).toContainText('Backup restored');await page.goto('/watchlists');await expect(page.getByRole('link',{name:'AAPL · stocks'})).toBeVisible();
});
test('theme respects system preference, persists override, and refresh stays same-origin',async({page})=>{await page.emulateMedia({colorScheme:'dark'});await page.goto('/');const toggle=page.getByRole('button',{name:'Dark mode',exact:true});await expect(toggle).toHaveAttribute('aria-pressed','true');await toggle.click();await page.reload();await expect(toggle).toHaveAttribute('aria-pressed','false');await expect(page.locator('html')).toHaveAttribute('data-theme','light');await page.getByRole('button',{name:'Refresh snapshot',exact:true}).click();await expect(page.getByText(/Last snapshot retrieved by this browser:/)).not.toContainText('Not yet');});
