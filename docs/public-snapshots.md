# Public snapshot operations

No account, API key, brokerage, or paid service is configured. The browser fetches
only `BASE_URL/live/latest.json`, including under `/hi-buy/`. Refresh cache-busts
that file; it does not trigger ingestion. Browser retrieval time is separate from
provider observation and retrieval times. Publication time is not supplied by these
adapters; observation time must not be interpreted as publication time.

## Setup and deployment

1. Review and merge these files to main (this implementation session does not commit
   or push). Existing Pages source must remain GitHub Actions.
2. Enable Actions, including the `Ingest public snapshot` workflow. Repository policy
   must allow its job-scoped `contents: write` token to push main. A protected branch
   that disallows bot pushes will fail explicitly; no bypass or personal token is added.
3. Run Actions → Ingest public snapshot → Run workflow on main for initial collection.
4. Inspect its per-symbol log and `public/live/latest.json`, then the Pages run.
   No secrets or environment variables are needed.

The schedule is `*/5 * * * *` UTC, best effort, not streaming or an SLA. GitHub can
delay or drop scheduled runs and disable schedules in inactive public repositories.
Each run has a five-minute job limit; requests have 15-second limits and ingestion
has a three-minute step limit. Requests are sequential, with no retry bursts.
One CoinGecko request covers all three assets (at most 288/day, 8,928/31-day month).
Two Yahoo requests and three FRED requests complete a run.

Only changed observations, values or error states cause a commit. Retrieval time
alone does not change the file; repeated errors are stable too. Consequently a
successful check with identical data is not a published heartbeat. Check Actions
logs for that evidence. Source retrieval age over 20 minutes is labeled stale;
observation thresholds are 20 minutes for crypto, four days for securities daily
bars and ten days for EIA daily series. These are conservative display heuristics,
not exchange calendars. Source delays remain unknown unless stated.

`GITHUB_TOKEN` commits do not trigger push workflows. Pages therefore also listens
for successful ingestion `workflow_run` completion and compares current main to
the ingestion event's starting SHA. A different current main SHA deploys the newly committed snapshot; an equal SHA
skips build/deploy. Failed ingestion runs are excluded by the job condition.
Push and manual runs bypass this comparison and deploy main normally. Pages
never invokes ingestion. Both workflows serialize their own runs; non-fast-forward
pushes fail without force and the next run retries from current main. Pages keeps
contents read-only; ingestion alone gets contents write. There is no deployment loop.

## Sources and limits

- **AAPL / SPY:** Yahoo chart endpoint
  `https://query1.finance.yahoo.com/v8/finance/chart/AAPL?range=6mo&interval=1d`
  (also SPY). It is unofficial, potentially delayed, and not a licensed consolidated
  feed. Valid chart responses are retained for the user-approved public snapshot
  display, explicitly labeled rights-unverified. Access does not establish redistribution
  rights. These observations remain isolated from candidates, rankings, synthetic
  calculations, paper fills and app exports.
- **BTC / ETH / SOL:** CoinGecko `/api/v3/simple/price`, batched IDs with USD price,
  24-hour change, 24-hour USD volume, market cap and last update time. Attribution
  appears on each populated card. [Keyless documentation](https://docs.coingecko.com/docs/keyless-public-api)
  documents no-auth access but warns that shared-IP keyless service is unsuitable
  for production scheduled polling. This is a best-effort public research prototype,
  with one request per run and no retries; it is not a reliable production feed.
  A 429 or missing required numeric field makes the affected observation unavailable.
  `last_updated_at` is optional: when absent, `observedAt` is null and the UI states
  that the provider timestamp is unavailable. `retrievedAt` records retrieval only;
  it never substitutes for observation time.
- **WTI / Brent / natural gas:** official EIA data via FRED CSV
  `https://fred.stlouisfed.org/graph/fredgraph.csv?id=DCOILWTICO`,
  `DCOILBRENTEU`, and `DHHNGSP`. USD/barrel or USD/million Btu; dated daily
  benchmarks with publication lag, not tradable futures. Missing periods are skipped;
  negative historical oil observations are valid. [EIA reuse policy](https://www.eia.gov/about/copyrights_reuse.php)
  permits reuse of its government data with attribution. FRED's other series are not
  blanket approved by that policy.
- **Gold, silver, copper, corn, wheat:** unavailable; no verified keyless series with
  defensible redistribution rights is configured. No synthetic substitution.

## Local direct verification

The direct generator run produced **8 numeric entries out of 13**, and the checked-in
`public/live/latest.json` contains them: AAPL, SPY, BTC, ETH, SOL, WTI, Brent and
natural gas. Gold, silver, copper, corn and wheat remain unavailable. Parsing and
error fixtures pass. This successful collection does not guarantee future provider
availability or scheduled Actions execution; both remain best-effort, with no
production SLA or licensed consolidated feed claimed.

Schema failures and HTTP errors clear affected values.
A catastrophic workflow failure leaves the last deployed file intact; it ages into
stale. A browser fetch failure preserves its last parsed file with an outage warning.

## Local operations

Requires Node >=22.12 and `npm ci`.

```
node --experimental-strip-types scripts/snapshot.mjs --output=/tmp/hi-buy-snapshot.json
node --experimental-strip-types scripts/snapshot.mjs
npm run typecheck
npm test
npm run fixtures:verify
npm run build
node scripts/verify-theme.mjs
npx vitest run tests/snapshot.test.ts
npm run test:e2e
git diff --check
```

The first command is a dry-run to a temporary file; the second updates the published
file locally. The generator validates output using the same parser as the browser.
No command commits or pushes locally. For outages inspect the entry's `error`, source
link and timestamps and the Actions log. Disable the ingestion workflow to stop
polling. Do not put credentials in Pages or expand source rights on mere reachability.

## Blocker-fix verification

The head theme script uses `type="module"` and `/theme.js` in source HTML. Vite
recognizes the public asset and rewrites its production URL to `/hi-buy/theme.js`.
Do not prefix this module URL with `%BASE_URL%`: that causes Vite to resolve the
already-prefixed URL as a source module. `scripts/verify-theme.mjs` checks actual
dev HTML transformation, production HTML, copied asset contents and unchanged CSP
without binding a listening port. The dark-mode button retains its accessible
name and `aria-pressed` state; DOM tests cover persistence and blocked storage.

Local checks passed: typecheck, all 64 unit/DOM tests, both fixture hashes, the
production build (no theme warning), 10 focused snapshot tests, direct Node parser
checks, theme reference checks and `git diff --check`. Both workflow YAML files
parsed with PyYAML; executing the deployment decision shell verified changed and
unchanged ingestion SHAs plus push and manual events. The ingestion success guard
and lack of an ingestion push trigger were also checked.

The direct generator produced **8 numeric entries out of 13**; the checked-in JSON
contains those observations, not mock values. Parsing/error fixtures pass, including
controlled Yahoo, optional-timestamp CoinGecko and dated FRED responses.
`npm run test:e2e` passed **8/8**. Theme path checks passed for `/theme.js` locally
and `/hi-buy/theme.js` in GitHub Actions mode, with both builds passing. These are
local verification results; no deployment or successful scheduled Actions run is
claimed.
