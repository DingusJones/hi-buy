import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'tests/e2e',use:{baseURL:'http://127.0.0.1:4173',launchOptions:{executablePath:process.env.PLAYWRIGHT_BUNDLED_BROWSER==='1'?undefined:process.env.CHROMIUM_PATH??'/usr/bin/chromium',args:['--no-sandbox']}},webServer:{command:'npm run preview',url:'http://127.0.0.1:4173',reuseExistingServer:false},reporter:'list'});
