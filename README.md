# hi buy.com

A working, zero-key local research **demo**, implemented from [the approved plan](docs/ASTRA-MARKET-INTELLIGENCE-IMPLEMENTATION-PLAN.md). It includes a complete synthetic research → notes/watchlist → manual paper intent → next-session fill → journal journey. It is **not the complete private/live MVP** described in the plan: licensing, infrastructure and remaining research capabilities are explicitly gated below.

## Run

Requires Node **22.12+** and npm. No API keys, accounts, credentials, database or brokerage are needed for this demo.

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:5173**. Both development and production preview bind to localhost. Installation needs npm access once; the installed application makes no provider requests and works without internet. No remote fonts, images, analytics, chart embeds or tracking pixels load. Outbound research links use the network only when you click them.

```sh
npm run typecheck       # TypeScript
npm test                # Domain, policies, replay import and React DOM integration tests
npm run fixtures:verify # SHA-256 reproducibility of bundled mathematical vectors
npm run build           # TypeScript + production bundle in dist/
npm run preview         # http://127.0.0.1:4173
npm run verify          # All non-browser checks above
npm run test:e2e         # Playwright, starts production preview; build first
```

Playwright defaults to `/usr/bin/chromium` on this ThinkCentre. Set `CHROMIUM_PATH` for a different installed Chromium, or install Playwright's Chromium and set `PLAYWRIGHT_BUNDLED_BROWSER=1`. E2E tests cover the research-to-paper journey, backup restore, all market sections, and 360/390/768/1440 viewport overflow. No separate lint configuration is present; TypeScript is the configured static check.

## Demo data and what you can do

The always-visible **SYNTHETIC TEST LAB** banner is intentional. AAPL and SPY are identity/link examples, not research picks. Their displayed numbers are **original mathematical vectors, not actual historical or current prices**. Each has 440 deterministic weekday bars from **2023-01-02 through 2024-09-06**. Holidays are not modeled. The test clock starts at bar 400 and advances through bar 440. Every calculation sees only the prefix through that clock. The [fixture manifest](docs/FIXTURE-MANIFEST.json) records mode, dates, provenance and SHA-256 hashes.

1. Open **AAPL test workspace** or **SPY test workspace** from Overview.
2. Inspect the chart, data-table equivalent, indicator views and source details.
3. Save a watchlist item and a literal-text note with bull/base/bear scenarios.
4. In **Paper plan**, record a manual test intent. Advance one session, then inspect the section's paper journal.
5. Continue advancing to inspect stop/target/time exits. Rewind to inspect as-known state without deleting the original intent.
6. Create a close-above replay alert under Notes. Inspect deterministic crossing events in Alerts.
7. Export notes/watchlists/screens/alerts/intents in Settings; restore a validated backup or reset with confirmation. Each journal also exports CSV.

Implemented surfaces:

- Separate Stocks, ETFs, Commodities and Crypto routes, identities and health descriptions.
- Eight separately titled top-10 boards, with ten honest vacancies each while required market data/metadata is unavailable. Type-safe board sorting and shortage logic are tested independently using unit vectors.
- Independent **Top 5 Stock Research Candidates** and **Top 5 ETF Research Candidates**. Test vectors never qualify. Candidate selection, issuer/exposure deduplication, tag quotas, concentration fallback, shortage and independent outage states have domain tests.
- **Top 5 Market News**, instrument news, and separately labeled official-source links. Unapproved feeds display explicit vacancies rather than invented headlines. Metadata-only deduplication/rights/time/entity validation is implemented and tested.
- Eight commodity catalog entries with source links, units where reviewed, periodic-observation semantics and unavailable values. No inferred futures curves.
- BTC, ETH and SOL native identities, USD/24-hour field labels, source/network links and honest unavailable states. Actual dated prices can be inspected through a permitted local import; no invented crypto price fixtures are shipped.
- Daily candlesticks/volume, historical SMA/EMA 20/50/100/200 overlays, RSI plot, chart data table, MACD, ATR, DMI/ADX, Bollinger bands/squeeze, OBV/RVOL, volatility and price drawdown. Confirmed Fibonacci pivots/retracements/extensions and RSI divergence use confirmation lag. Complete-link confluence and matched-series relative strength are implemented as pure functions; absent weekly/benchmark inputs remain unavailable in the demo.
- Explainable **illustrative** Stock standard / ETF core component calculations, missing-weight coverage and the stock-only unknown-earnings penalty. No official candidate or probability-of-profit claim.
- Separate $100,000 stock/ETF paper accounts, decimal cash arithmetic, future-bar-only manual entries, 10 bps adverse slippage, participation/cash checks, stop-first ambiguity, conservative targets and 20-session exits. There is no brokerage code or order endpoint.
- Responsive CSS, semantic navigation/forms/tables, 44px controls, visible focus, reduced-motion support and no color-only financial states. Browser/screen-reader acceptance still needs a normal local run.

## Permitted historical imports

Open **Permitted replay** (`/replay`) and select a local JSON file up to 2 MB. Files are held in that page's memory only, never uploaded or silently saved. Leaving the page discards the import. This is an inspection surface; imports cannot silently replace test data, drive official rankings or mutate paper accounts.

The precise, strict runtime contract is [`src/replay.ts`](src/replay.ts). Root fields are `version: 1`, `mode: "replay"`, ISO-8601 `asOf`, and optional arrays `securities`, `crypto`, `commodities`, `news`. Every row requires:

```text
source:
  name: attributed source name
  url: HTTPS URL on the reviewed outbound host registry
  observedAt: original ISO-8601 observation timestamp
  retrievedAt: original ISO-8601 retrieval timestamp
  delaySeconds: nonnegative number, or null if unknown
  rights:
    display: "permitted"
    retention: "permitted"
    evidence: source-specific permission/rights evidence (at least 10 characters)
```

Supply **actual permitted observations**, not made-up examples relabeled as replay. The importer records a SHA-256 of the submitted bytes. A local rights assertion is not independent legal verification or public redistribution permission.

- Securities: canonical `id` (`us-aapl` or `us-spy`), `adjustment` (`"split-adjusted, non-dividend-adjusted"` or `"unadjusted"`), and 1–5,000 chronological `bars` containing `date`, numeric `open/high/low/close`, and integer nonnegative `volume`. Unadjusted imports display observations but withhold technicals.
- Crypto: `id` (`bitcoin`, `ethereum`, `solana`), matching native `chain` (`Bitcoin`, `Ethereum`, `Solana`), `quoteCurrency: "USD"`, `coverage: "aggregate" | "venue"`, `venue` (null for aggregate), positive decimal-string `price`, nullable numeric `change24h`, nullable decimal-string `volume24hUsd` and `marketCapUsd`. Venue fallback cannot inherit aggregate market cap. These are rolling 24-hour fields, not securities-close comparisons.
- Commodities: catalog `id`, `type: "spot" | "benchmark"`, decimal-string `value`, `currency: "USD"`, `unit`, ISO `periodStart/periodEnd`, `frequency: "daily" | "weekly" | "monthly"`. WTI/Brent require `USD/barrel`; gold/silver `USD/troy ounce`; natural gas `USD/million Btu`. Futures/roll imports are deliberately unsupported.
- News: `id`, `title`, `publisher`, `url`, ISO `publishedAt`, explicit verified canonical `entities`, `permitted: true`, and `source`. Article bodies/unknown properties are rejected. Overview shows up to five valid deduplicated stories in the 48 hours before the replay cutoff.

Unknown source hosts require an intentional registry/code review, not an arbitrary URL-fetch option. There is no remote fetch in the importer. Test-only importer examples live in `tests/replay.test.ts` and are never presented as real observations.

## Persistence, privacy and operation

The demo uses versioned browser localStorage for research and test journals. Data is **not encrypted**, authenticated, synced, backed up automatically or durable across browser-data deletion. Corrupt saved state is preserved and automatic replacement is blocked; use a deliberate reset or a valid backup. Notes render as text, never executable HTML. Inputs and restored accounts are schema-validated. Exports cover private user data and original test vectors, not licensed vendor payloads.

Use localhost on a trusted device. **Do not expose this demo publicly or as the plan's authenticated private service.** Before any remote deployment, implement owner authentication/authorization, server-side validation and rights enforcement, TLS, CSRF protection, rate limits, durable storage, job leases and backup/restore operations. The UI does not pretend these exist.

For a manual local backup: Settings → Export private-data backup; retain the JSON securely; Settings → Restore backup; confirm replacement. Round-trip/schema validation is covered by tests; an encrypted production backup/restore drill has not occurred.

## Plan deviations and remaining gates

This environment contained no app and could not resolve npm hosts. Available local packages supported **React + TypeScript + Vite**, so this runnable demo uses Vite and accessible SVG charts instead of the plan's **Next.js + ECharts**. Dependencies are pinned with a lockfile; development copied available local packages, then pruned extras. A fresh online advisory/license review is still required; an offline npm audit summary is not a current security assessment.

Rights/data gates:

- No licensed real securities history, action ledger, exchange calendar, point-in-time fundamentals, holdings, metadata or consolidated liquidity is bundled. The approved 60-stock/40-ETF universes remain uncurated; only two test identity examples are provided.
- Crypto live acceptance requires permitted BTC/ETH/SOL feeds; commodity series need source-specific coverage/rights; headline feeds need display/retention/entity review. There are **no current real-world prices, news or recommendations** in this demo.
- `DataAdapter<T>` and capability guards provide an optional read-only adapter boundary. No live HTTP transport, credentials, provider enrollment or background fetching is implemented. Fetch/display/retention/export/derived rights remain independently unknown and disabled. Provider names are proposed choices from the plan, not claims of current entitlements.
- Intraday, synchronized futures curves, on-chain yields, public redistribution, vendor payload exports and TradingView embeds remain disabled. TradingView is outbound only; AAPL=`NASDAQ:AAPL`, SPY=`AMEX:SPY`, unknown mappings remain unavailable.

Implementation work remaining beyond the demo:

- Next.js server API, owner auth, PostgreSQL migrations, durable worker/outbox, calendar/action ingestion, provider budgets/retries/quarantine, immutable server snapshots and operational backups.
- Full curated universes and metadata-gated real boards/candidates; all category-specific fundamental/valuation profiles, holdings overlap and audited tag provenance.
- Complete weekly technical workspace/confluence, source-aware return series, candidate confirmation/invalidation/expiry state machine, limit intents, corporate-action paper accounting, audit-versioned research notes and full alert rule catalog.
- Advanced numeric screeners, custom tags and richer like-for-like comparisons, complete research tabs, production performance measurements and WCAG/manual screen-reader checks.
- Point-in-time evaluation, delisting/survivorship-bias datasets, cost sensitivity, independent evaluation reports and a minimum 20-session operational pilot. No investment efficacy is established.

## Verification in this environment

See [implementation verification](docs/IMPLEMENTATION-VERIFICATION.md) for commands and outcomes. Unit/DOM tests, fixture verification, TypeScript and the production bundle pass. Browser/server checks were attempted but are **blocked by environment permissions**: listening on `127.0.0.1:4173` fails with `EPERM`; Chromium fails on restricted socket operations. No policy bypass or deployment was attempted. Run the supplied Playwright suite in a normal local shell before browser acceptance.

Required disclosures appear in context: research candidates are not individualized advice; methodology alignment is not probability of profit; modeled fills differ from execution; distribution yield is not guaranteed total return; and past/backtested results do not guarantee future results.
