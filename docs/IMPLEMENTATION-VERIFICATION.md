# Implementation and verification — 2026-09-19

## Delivered scope

A working React/TypeScript local **demo**, not completion of the plan's full private/live MVP. The original implementation plan and `CODEX_PLAN_PROMPT.md` were read/preserved, not rewritten. No commits, pushes, credentials, brokerage integration, trades or deployment were made.

The complete test journey is implemented and DOM-tested: overview → separate asset workspace → source/chart/table → literal-text note + watchlist → manual paper intent → later replay bar → modeled fill → isolated journal. Additional code provides technical indicators, scoring explanations, candidate/board selection policies, news validation, rights-guarded adapter contracts, local permitted-replay inspection, data-health surfaces, backup restore and replay alerts. The separate public-source snapshot layer includes a no-key GitHub Actions generator, same-origin browser retrieval, explicit freshness/error states, and a persistent theme with an early theme script. The current checked-in JSON holds 8 numeric observations out of 13; these do not drive live news, candidates, boards or paper fills. See README for precise implemented/unavailable distinctions.

## Commands and exit status

Final verification, after fixes:

| Command | Exit | Evidence |
|---|---:|---|
| `npm run verify` | 0 | Full non-browser verification chain passed |
| `npm run typecheck` | 0 | Strict TypeScript; app, configs and tests |
| `npm test` | 0 | **64 tests across 7 files**: formulas, confirmation lag, prefix invariance, rights, ranking boundaries, news, importer, paper ledger, backup, snapshot parsing/error fixtures, theme persistence and React DOM journey |
| `npm run fixtures:verify` | 0 | SHA-256 matches for both 440-bar vector series and fixture module |
| `npm run build` | 0 | Local Vite production bundle with base `/` |
| `GITHUB_ACTIONS=true npm run build` | 0 | GitHub Actions mode bundle with base `/hi-buy/`; local verification, not deployment |
| `node --experimental-strip-types scripts/verify-theme.mjs` (also with `GITHUB_ACTIONS=true` after its build) | 0 | `/theme.js` locally and `/hi-buy/theme.js` in Actions mode; copied asset and unchanged CSP |
| `node --experimental-strip-types scripts/snapshot.mjs --output=/tmp/hi-buy-snapshot.json` | 0 | Recorded direct generator run: 8 numeric entries out of 13; checked-in JSON contains these observations |
| Snapshot parser/direct Node checks and `npx vitest run tests/snapshot.test.ts` | 0 | 10 snapshot tests, parsing/error fixtures and direct parser checks passed |
| `npm run test:e2e` | 0 | **8 tests passed**: complete research/paper journey; independent boards/section absence states; four viewport runs (360/390/768/1440); export/reset/restore; theme persistence and same-origin snapshot refresh |
| `npm run preview` | 0 | Preview bound to `http://127.0.0.1:4173/`; curl smoke returned the built `index.html` |
| Direct browser acceptance | 0 | Playwright Chromium executed the suite successfully against the production preview |
| `git diff --check` | 0 | No tracked diff whitespace errors; new files remain untracked |
| `npm ls --depth=0` | 0 | All declared direct dependencies available; extras pruned |

Setup/diagnostic commands:

| Command | Exit | Result |
|---|---:|---|
| `npm --cache /tmp/hi-buy-npm --fetch-retries=0 --fetch-timeout=15000 view next version` | 1 | DNS `EAI_AGAIN registry.npmjs.org`; no Next.js/ECharts download available |
| Copy available local `node_modules` into this workspace | 0 | Temporary offline bootstrap, not a committed dependency tree |
| `npm install --package-lock-only --offline --ignore-scripts --cache /tmp/hi-buy-npm` | 0 | Exact installed versions captured in package-lock; not a fresh online advisory review |
| `npm prune --offline --ignore-scripts --cache /tmp/hi-buy-npm` | 0 | Removed unrelated copied packages |
| `node --experimental-strip-types scripts/fixtures.mjs --write` | 0 | Intentional dated manifest creation/regeneration after inspected source edits |

Early TypeScript runs exposed nullability/CSS-declaration and expression syntax errors; these were corrected before the final passing chain. No configured lint command exists. Clean-network `npm ci` was not executable in this environment; the lock pins locally inspected versions but lacks registry integrity metadata for those offline-derived entries. Refresh/verify dependency provenance with network access before deployment.

## Browser acceptance

The production preview binds successfully on loopback, and the Playwright suite runs in this environment with Chromium. The suite covers real browser layout assertions, keyboard skip-link behavior, offline navigation, persistence across reload, source/link rendering, paper-account separation, and backup download/reset/restore. It does not replace manual screen-reader review or production performance testing.

Playwright contains eight tests: complete research/paper journey; independent boards/section absence states; four viewport runs (360/390/768/1440); export/reset/restore; theme preference/persistence and same-origin snapshot refresh. The configured preview runs on loopback. No environment policy bypass was attempted.

## Files added

- App/runtime: `src/bootstrap.tsx`, `src/main.tsx`, `src/ReplayView.tsx`, `src/Live.tsx`, `public/theme.js`, `src/style.css`, `src/vite-env.d.ts`.
- Domain/data: `src/domain.ts`, `src/data.ts`, `src/paper.ts`, `src/replay.ts`, `src/snapshot.ts`, `public/live/latest.json`.
- Tests: `tests/domain.test.ts`, `tests/advanced.test.ts`, `tests/policies.test.ts`, `tests/paper.test.ts`, `tests/replay.test.ts`, `tests/ui.test.ts`, `tests/snapshot.test.ts`, `tests/e2e/app.spec.ts`.
- Setup/build: `.gitignore`, `index.html`, `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `playwright.config.ts`, `scripts/fixtures.mjs`, `scripts/snapshot.mjs`, `scripts/verify-theme.mjs`, `.github/workflows/pages.yml`, `.github/workflows/snapshot.yml`.
- Documentation: `README.md`, `docs/FIXTURE-MANIFEST.json`, `docs/THIRD-PARTY-NOTICES.md`, `docs/public-snapshots.md`, this verification record.

`node_modules`, `dist`, Playwright results and local environment files are ignored. The pre-existing plan and prompt were already untracked at the beginning; their presence in `git status` is not an implementation modification.

## Remaining blockers and limitations

1. **Market inputs and rights:** eight public observations (AAPL, SPY, BTC, ETH, SOL, WTI, Brent and natural gas) are present in the checked-in snapshot; gold, silver, copper, corn and wheat remain unavailable. Yahoo is unofficial, potentially delayed and rights-unverified, not a licensed consolidated feed. Scheduled Actions/provider availability is best-effort, with no production SLA. There are no live news or candidate rankings, populated live boards or snapshot-driven paper fills. The curated 60/40 universe, complete action/calendar/benchmark data, fundamentals and ETF holdings remain missing. Import inspection supports permitted observations supplied locally, but does not complete live acceptance.
2. **Full private/live backend not implemented:** Next.js, ECharts, PostgreSQL/migrations, durable worker/outbox, owner authentication, server API/rights enforcement, remote TLS, rate budgets, encrypted backups and an operational restore drill. The environment constraint prompted a Vite/SVG/localStorage demo; this is a documented stack deviation, not a claim that the planned architecture is complete.
3. **Research scope not complete:** all real profile recipes and eligibility integration, full weekly/benchmark workspace, candidate state machine, corporate-action/limit paper accounting, advanced screeners/custom tags, audit-versioned note history, full alert catalog and immutable server publication remain future implementation work. The board/candidate policy functions have unit tests but are deliberately not fed synthetic real-market candidates in the UI.
4. **Release evidence:** manual accessibility, clean online dependency verification, hardware performance/uptime measurements, point-in-time evaluation and the minimum 20-session operational pilot remain outstanding.

No strategy efficacy, real-time availability, public-display entitlement or financial suitability is claimed.
