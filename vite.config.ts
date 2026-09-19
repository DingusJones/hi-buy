import {defineConfig} from 'vitest/config';
export default defineConfig({base:process.env.GITHUB_ACTIONS === 'true' ? '/hi-buy/' : '/',server:{host:'127.0.0.1',port:5173,strictPort:true},preview:{host:'127.0.0.1',port:4173,strictPort:true},test:{include:['tests/**/*.test.ts']}});
