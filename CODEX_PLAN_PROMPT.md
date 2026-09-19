# Codex brief: hi buy.com — plan only

You are Codex working on the ThinkCentre (`thinkcentre`) in the new git repository `/home/jay/Projects/astra-market-intelligence`.

Produce a rigorous implementation plan for a web app called **hi buy.com**. This is a planning task only.

## Hard constraints for this run

- Inspect the repository first, but assume it is a greenfield project unless the repo contains relevant requirements.
- Do **not** implement application code, scaffold the app, install packages, create API keys, connect a brokerage, or make trades.
- Do not promise profits, “winning” signals, or guaranteed daily income.
- Do not design autonomous order execution. This app is research and decision-support software.
- Write the finished plan to `docs/ASTRA-MARKET-INTELLIGENCE-IMPLEMENTATION-PLAN.md` and print the plan or a complete executive summary to stdout.
- The plan must be concrete enough for a later coding agent to implement without inventing major requirements.
- Call out assumptions and unresolved choices instead of silently guessing.

## Product objective

Design a mobile-first, responsive web app that helps a user discover and monitor stocks and ETFs using transparent technical, fundamental, liquidity, and market-structure signals. It should explain *why* an asset ranks highly, show data freshness and source provenance, and make it easy to paper-trade or set alerts. It is not personalized financial advice and must clearly communicate uncertainty, data delays, risks, and limitations.

The user specifically wants:

1. ETF discovery separated into **Dividend**, **Growth**, and useful additional categories, with multi-label tagging so a fund can be both dividend and growth when appropriate.
2. Rankings and filters by **TVL**, **APR/APY**, and **date created/inception** where those metrics are meaningful.
3. A daily market board with the **top 10 gainers**, **top 10 losers**, and **top 10 volume leaders**.
4. Five daily **research buy candidates** based on real-world data that can be obtained legally without paying for a premium data subscription.
5. A “what to watch now” workflow that can provide a candidate entry zone, invalidation level, possible exit/stop conditions, holding horizon, and follow-up alerts—without promising that the trade will make money.

## Important metric separation

Traditional listed stocks and ETFs generally do not have DeFi-style TVL or APR. The plan must prevent misleading comparisons:

- For traditional stocks/ETFs, use applicable metrics such as AUM, average daily dollar volume, expense ratio, distribution yield, SEC yield where available, dividend growth, total-return history, holdings, tracking difference, volatility, and issuer-reported inception date.
- For tokenized funds, DeFi yield products, or other on-chain instruments, TVL, APR/APY, utilization, chain, contract age, and creation/deployment date may be relevant. Put these in a clearly labeled separate instrument type or adapter, not in the same ranking as ordinary securities unless the UI makes the distinction explicit.
- Show `N/A`, not zero, for metrics that do not apply. Label whether APR is fixed, variable, incentive-driven, or estimated; show the observation timestamp and source.
- “Date created” must be defined per instrument type: ETF inception date, stock listing/IPO date where available, or on-chain deployment/launch date.

## Technical analysis requirements

The plan must specify formulas, parameter defaults, timeframes, data requirements, edge cases, and explainability for:

- Fibonacci retracement and extension levels, including how swing highs/lows are detected, how lookback and timeframe are selected, and how the app handles changing pivots. Include 0.236, 0.382, 0.500, 0.618, 0.786, 1.000 and extension levels where sensible.
- Multi-timeframe Fibonacci confluence and distance from the nearest level.
- RSI, including configurable period (default candidate: 14), regime-aware interpretation, divergence detection, and avoidance of the simplistic rule that overbought automatically means sell.
- SMA/EMA moving averages (at least 20/50/100/200 where data history permits), slope, price distance, crossovers, and trend alignment.
- MACD, ADX/DMI, ATR, Bollinger Bands, volume/OBV or comparable volume confirmation, and relative strength versus a benchmark such as SPY or an appropriate sector/index.
- Liquidity and volatility quality checks: average dollar volume, abnormal volume, ATR percentage, spread proxy if available, stale/limited data, and microcap/penny-stock exclusions or warnings.
- Fundamental/context signals where free data supports them: revenue or earnings growth, profitability, valuation ratios, dividend consistency, analyst/news/earnings-event risk where legally available. Do not invent unavailable fundamentals.
- A configurable composite score with factor weights, category-specific weights, confidence/data-quality modifiers, and a plain-English reason list. The score must never be presented as a probability of profit unless statistically validated.

Require a backtesting/evaluation design that avoids look-ahead bias, survivorship bias, data leakage, and unrealistic fills. Include point-in-time data assumptions, transaction costs/slippage, delisted securities if feasible, walk-forward validation, benchmark comparisons, and metrics such as drawdown, hit rate, expectancy, turnover, and risk-adjusted return. Make clear that backtests do not guarantee live performance.

## ETF and stock organization

Plan the taxonomy, database fields, and UI for:

- Dividend ETFs: distribution yield, SEC yield, distribution frequency, dividend-growth history, concentration, sector exposure, expense ratio, AUM, liquidity, total return, and drawdown.
- Growth ETFs: earnings/revenue growth exposure, sector/style exposure, valuation context, momentum, volatility, expense ratio, AUM, liquidity, and total return.
- Core/broad-market, bond/income, sector, thematic, international, and other useful categories if they improve the product without bloating the first release.
- Custom tags, hybrid classification, saved screens, watchlists, compare mode, and a transparent “why this category” explanation.
- Stocks with sector/industry, market cap, liquidity, dividend status, growth/fundamental fields, and technical setup.

## Daily market board

Specify a daily refresh and intraday-refresh strategy for:

- Top 10 gainers: define the comparison window (normally percentage change from prior regular-session close), minimum price/liquidity filters, and how pre-market/after-hours are labeled separately.
- Top 10 losers: same definitions and safeguards.
- Top 10 by volume: show both share volume and dollar volume when possible; explain which one drives the ranking.
- Include last price, percent change, absolute change, volume, average volume, relative-volume ratio, timestamp, session type, source, and data delay.
- Handle ties, halts, splits, reverse splits, bad ticks, missing data, market holidays, and symbols with insufficient history.
- Provide a “market snapshot as of” timestamp and never imply the board is live if the source is delayed.

## Five daily research candidates

Design a daily shortlist of exactly five **research candidates**, not guaranteed buys:

- Define the eligible universe, minimum liquidity, price, exchange, market-cap, and data-quality filters.
- Include a category-aware mix or explain why the five may be concentrated. Avoid duplicate share classes and duplicate ETF exposure where possible.
- Combine technical confluence, trend, momentum, relative strength, volume/liquidity, volatility, fundamentals, valuation/context, and event-risk filters in a documented ranking.
- For each candidate display: symbol/name, category, current price and timestamp, data delay, score breakdown, reasons it qualified, Fibonacci levels, RSI, moving averages, trend/regime, ATR/risk context, relevant fundamentals, catalyst/event warnings, liquidity, and what would invalidate the setup.
- Produce a **candidate plan** containing an entry zone or “wait for confirmation” state, an invalidation/stop reference, one or more possible target/exit conditions, expected holding horizon, risk/reward assumptions, and a prominent statement that this is not individualized advice and may lose money.
- Do not call a candidate “BUY NOW” as an unconditional instruction. If the product uses that UI label, define it as a configurable research-alert state and pair it with the timestamp, assumptions, invalidation, and confirmation requirements.
- Add a paper-trading mode so recommendations can be tracked without real money. Include a journal of signal time, later outcome, slippage assumptions, and whether the signal was active or stale.
- Define follow-up alerts for invalidation, target/exit conditions, major indicator changes, earnings/dividend dates, data staleness, and source outages. Do not promise that an alert will arrive before a price move.
- Explain how a user can change risk tolerance and how the app avoids pretending that “daily” means daily profit.

## Data and cost requirements

The user wants real-world data available without paying for a premium service. The plan must compare practical legal options and explicitly state:

- Which sources are free without an API key, which require a free-tier key, their rate limits, delay, coverage, terms/licensing, and whether redistribution/display is permitted.
- A primary and fallback provider strategy for quotes, historical OHLCV, corporate actions, ETF metadata/holdings, fundamentals, SEC filings, macro/benchmark data, and optional on-chain TVL/APR.
- How to normalize symbols, corporate actions, time zones, market calendars, and source conflicts.
- Caching, rate limiting, retry/backoff, request budgets, scheduled jobs, freshness SLAs, provenance, and a visible data-health panel.
- A design that works in a demo without paid keys using fixtures/replay data, while making live-source integration pluggable and honest about limitations.
- No scraping that violates terms of service, no fabricated data, and no hidden paid dependency.

## UX and product quality

Plan these core surfaces:

- Overview/dashboard with market status, daily board, five candidates, data-health/freshness, and risk disclaimer.
- ETF explorer with Dividend/Growth tabs, filters, sortable metrics, TVL/APR/date-created handling, and compare mode.
- Stock screener with technical/fundamental filters and saved screens.
- Asset detail page with multi-timeframe chart, Fibonacci overlays, indicators, fundamentals, events, source timestamps, and an explanation of the score.
- Candidate detail and paper-trading journal.
- Watchlists and configurable alerts.
- Methodology/data-sources page that exposes formulas, defaults, limitations, and backtest results.
- Responsive/mobile-first layout, accessible charts and tables, keyboard navigation, good empty/error/loading states, and clear labels for delayed data.

## Engineering plan requirements

Recommend a practical stack based on repository context, but do not code it. Cover:

- Frontend, backend/API, background jobs, database/time-series storage, cache, charting, and deployment choices.
- Domain model/schema and API contracts for instruments, prices, indicators, rankings, sources, signals, alerts, and paper trades.
- Deterministic indicator calculation and versioned scoring configuration.
- Job schedules for end-of-day, intraday, and on-demand refreshes.
- Observability, data validation, test fixtures, contract tests, indicator unit tests, ranking tests, backtest tests, accessibility tests, and end-to-end acceptance tests.
- Security, secret handling, abuse/rate limits, privacy, auditability, and disclosure text.
- A phased MVP roadmap, later phases, dependencies, risks, and explicit out-of-scope items.
- Estimated effort by milestone and the smallest useful vertical slice.

## Required plan structure

Write the plan with these sections:

1. Executive summary and product principles
2. Assumptions and decisions required from Jay
3. Scope: MVP vs later phases
4. User journeys and screen map
5. Data-source and licensing/cost analysis
6. Instrument taxonomy and metric applicability matrix
7. Technical-indicator definitions and scoring methodology
8. Daily board and five-candidate pipeline
9. Candidate entry/exit/follow-up alert model and paper trading
10. System architecture and data flow
11. Data model and API contracts
12. Testing, backtesting, and validation strategy
13. Security, privacy, disclaimers, and operational risks
14. Milestones with implementation order and acceptance criteria
15. Recommended first vertical slice
16. Open questions and explicit non-goals

Be candid where free data is delayed, incomplete, rate-limited, or not redistributable.

## TradingView links and single-pane research hub

The user wants this app to be the primary place they go for stock and ETF research. Design it as a **single-pane research workspace** that brings together the app's own data, calculations, explanations, filings, fundamentals, events, news/context where legally available, watchlists, paper trades, alerts, and external research links. Be honest that no free app can guarantee complete coverage or replace every licensed data terminal.

For every stock, ETF, tokenized fund, or other supported instrument, plan a reliable outbound-link system that includes, when a valid exchange-qualified symbol mapping exists:

- An “Open in TradingView” chart link.
- A “TradingView overview/analysis” link where a stable public URL is available.
- A clearly labeled external-link icon, new-tab behavior, and a note that TradingView is an external service.
- Correct exchange-qualified symbol construction such as `NASDAQ:AAPL` or `NYSE:SPY`, URL encoding, symbol aliases, share classes, delisted symbols, and an explicit fallback when the exchange mapping is unknown.
- A link registry or resolver so links are generated from canonical instrument metadata rather than string concatenation in multiple UI components.
- Tests for common symbols, ETFs, international symbols, punctuation, preferred shares, and invalid/unknown symbols.

The plan must distinguish outbound links from data integrations. Do not scrape TradingView, copy its proprietary data, embed restricted charts, or imply an official integration unless the relevant public API, embed permission, and terms actually allow it. Prefer a compliant public deep link as the baseline. If a chart library or TradingView widget is proposed, document the exact licensing, attribution, privacy, and technical constraints and provide a non-TradingView fallback chart using the app's own permitted data.

To make the app a credible research home, include a per-asset research workspace with:

- Current quote, session status, delay, source, and freshness.
- Interactive price/volume chart with the app's Fibonacci levels, moving averages, RSI, MACD, ADX, ATR, Bollinger Bands, relative strength, and selectable timeframes.
- Fundamental snapshot, ETF holdings/exposure, dividend/distribution history, valuation/context, corporate actions, earnings/dividend dates, and relevant filings or official issuer/SEC links when available.
- Daily gainers/losers/volume context, peer and benchmark comparison, sector/industry context, and the five-candidate ranking explanation.
- A source drawer showing where each displayed value came from, observation time, delay, calculation version, and any conflicts or missing fields.
- User notes, thesis, bull/base/bear scenarios, risk checklist, paper-trade journal, saved chart settings, watchlist membership, and alert history.
- One-click links to TradingView plus official issuer, SEC, exchange, fund prospectus, and other primary-source pages where available.
- A research completeness indicator that shows what is known, delayed, missing, or stale; never imply that the app has information it does not have.

The plan should help build a useful, honest research tool—not sell the user a fantasy of guaranteed daily income.

## Revision requirements from Jay — separate asset sections and news

These requirements supersede any earlier wording that combined stock and ETF boards or produced one combined list of candidates.

### Separate top-level product sections

Design the primary navigation and dashboard as clearly separated sections:

1. **Stocks** — individual listed stocks only.
2. **ETFs** — ordinary listed ETFs, with Dividend, Growth, Core/Broad Market, Bond/Income, Sector, Thematic, International, and other appropriate tags.
3. **Commodities** — a separate commodities/macro view for permitted spot, futures, or benchmark instruments such as gold, silver, WTI/Brent crude, natural gas, copper, and selected agricultural commodities. Clearly show instrument type, unit, contract month/expiry, session, roll methodology, contango/backwardation where available, source, and delay. Do not mix futures prices with spot prices or commodity ETF prices without labeling them.
4. **Crypto** — a separate digital-asset view showing at minimum live or delayed prices for BTC, ETH, and SOL, 24-hour change, volume, market-cap/liquidity fields where permitted, timestamp, exchange/source coverage, and links to the source or explorer. Do not mix crypto scores, volume, TVL, or APR with stock/ETF rankings. If on-chain TVL/APR is later added, show it as a separate crypto/DeFi metric family with chain, protocol, contract, and risk labels.

Use separate routes, headings, filter state, API response types, data-health status, and methodology profiles for these sections. A combined “all markets” overview may link to each section, but it must not flatten incompatible metrics into one ranking.

### Separate daily boards

For **Stocks**, provide separate daily boards for:

- Top 10 stock gainers
- Top 10 stock losers
- Top 10 stocks by share volume
- Top 10 stocks by dollar volume where permitted

For **ETFs**, provide separate daily boards for:

- Top 10 ETF gainers
- Top 10 ETF losers
- Top 10 ETFs by share volume
- Top 10 ETFs by dollar volume where permitted

Every board must state the universe, session, comparison window, timestamp, delay, source/feed, and coverage. Do not combine stock and ETF rows in the same top-10 list. Use separate filters and eligibility rules: stock boards can use stock liquidity/market-cap rules; ETF boards can use AUM, expense/inception/type, fund liquidity, and duplicate-exposure warnings. Pre-market/after-hours boards remain separate from regular-session boards. If fewer than ten eligible instruments exist, show empty slots with the reason rather than filling them with another asset type or stale data.

### Separate daily research candidates

Create two independent daily recommendation areas:

- **Top 5 Stock Research Candidates** — exactly five qualifying stock candidates when possible, with stock-specific score weights and eligibility rules.
- **Top 5 ETF Research Candidates** — exactly five qualifying ETF candidates when possible, with ETF-specific weights, Dividend/Growth tagging, AUM/expense/liquidity/exposure checks, and overlap warnings.

Never combine the five stocks and five ETFs into one ranking. Each section must have its own success/degraded/data-unavailable status and may show fewer than five when honest data gates leave fewer candidates. Do not backfill a missing stock candidate with an ETF or vice versa. The dashboard may display 10 total cards as two labeled groups: “5 Stock Candidates” and “5 ETF Candidates.”

For each candidate provide the same transparent research-plan fields: current price and observation time, delay, entry zone or wait-for-confirmation state, invalidation/stop reference, target/exit conditions, expected review horizon, risk/reward assumptions, score breakdown, reasons for inclusion and exclusion, indicator values, data quality, relevant upcoming events, news links when available, and a prominent not-personalized-advice disclaimer. Maintain paper trading and follow-up alerts separately by asset type. Never promise a daily profit or turn a research candidate into an unconditional trade instruction.

### Small daily news panel and per-asset news links

Add a compact **Top 5 Market News** panel to the overview. It should show five current, deduplicated stories with headline, source/publisher, publication time, link, affected symbol(s)/ETF(s)/commodity/crypto, category, and a one-sentence neutral relevance note. Prefer official company/issuer/SEC/exchange releases and legally usable news feeds or RSS/API metadata. Do not scrape or reproduce paywalled article bodies, hide the source, or treat a headline as proof of a trade signal. News data must have source rights, attribution, timestamps, freshness, and delayed/unavailable states.

On every relevant stock and ETF detail page—and on candidate cards when relevant—include a **News** area with linked headlines filtered to that instrument. Store canonical source URL, publisher, title, published_at, retrieved_at, tickers/entities, duplicate/syndication group, and relevance classification. Use source links rather than copied article text. Include official filing/release links as a separate primary-source group. A stock with no permitted news coverage must display “News unavailable” or official-source links, never an empty area that implies there are no events.

News can create an event-risk warning or explain a price move, but it must not silently change technical scores or generate a buy recommendation. Make the scoring/data flow explicit: news is context unless a versioned, validated event feature is deliberately enabled later. Add tests for duplicate stories, stale timestamps, wrong ticker matches, missing publisher/source, malformed URLs, paywall/link-only items, and one story relevant to multiple assets.

### Revised plan deliverables

Revise the screen map, data taxonomy, metric applicability matrix, source/licensing analysis, schemas/API contracts, scheduled jobs, score profiles, acceptance criteria, testing plan, and MVP milestones to cover all requirements above. Include separate endpoints or typed responses for stock boards/candidates, ETF boards/candidates, commodities, crypto prices, overview news, and asset news. Keep the product name exactly **hi buy.com**. This remains a plan-only revision: do not build application code, install packages, create credentials, connect a brokerage, or make trades.

The plan should help build a useful, honest research tool—not sell the user a fantasy of guaranteed daily income.
