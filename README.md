# TALARIA TRADE

Institutional-style BTCUSD and XAUUSD decision platform built from the supplied Talaria / TraderHermes algorithmic knowledge base.

## Active stack

`Market data → closed-candle validation → MTF structure/liquidity → macro/intermarket context → Hermes strategy dispatcher → sweep/MSS/BOS/POI/OTE → RRR/risk gate → signal → management/audit`

The active UI implements the deterministic decision core for BTCUSD and XAUUSD and exposes PCR, SIREN, SNAKE, SAC, WICK, MDS and OSOK strategy families. Default guardrails are 0.5% risk/trade, 2% daily loss limit, 3 daily trades, 3-loss circuit breaker, 2.5R minimum standard RRR and 3R preferred target.

## Deployment

GitHub Pages is the static frontend. Supabase contains the persistent schema for market candles, signals and risk state. A real-money broker/exchange adapter must run server-side and validate contract size, point value, currency conversion and order permissions before dispatch.

## Atlas archive

The former Atlas AI-directory application is no longer the active entry point. `_archive/atlas/` is the archive boundary; the original source also remains recoverable from Git history.

## Source basis

Implementation follows the supplied Talaria Trade / TraderHermes Levels 6–9 master knowledge base and source PDFs, including market structure, liquidity, IPDA/DOL, PD arrays, intermarket context, killzones, Hermes strategies, risk and execution concepts.
