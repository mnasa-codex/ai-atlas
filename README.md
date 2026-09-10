# TALARIA TRADE

Institutional-style BTCUSD and XAUUSD decision platform built from the supplied Talaria / TraderHermes algorithmic knowledge base.

## Active stack

`Market data → closed-candle validation → MTF structure/liquidity → macro/intermarket context → Hermes strategy dispatcher → sweep/MSS/BOS/POI/OTE → RRR/risk gate → signal → management/audit`

The active UI implements the deterministic decision core for BTCUSD and XAUUSD and exposes the full source-defined strategy matrix: PCR, SIREN, SNAKE, SAC, WICK, MDS, OSOK, Offset/IFVG, Asian scalp and New York scalp. Source statuses such as `REQUIRES_BACKTEST`, `REJECTED` and `DATA_DEPENDENT` remain explicit.

## Deployment

GitHub Pages is the static frontend. Supabase contains persistent Talaria structures for rulebook/audit, strategy evaluations, market structure, liquidity, zones, IPDA, daily profiles, macro context, risk events, orders, positions and backtest runs. A real-money broker/exchange adapter must run server-side and validate contract size, point value, currency conversion and order permissions before dispatch.

## Atlas archive

The former Atlas AI-directory application is no longer the active entry point. `_archive/atlas/` is the archive boundary; the original source also remains recoverable from Git history.

## Source basis

Implementation follows the supplied Talaria Trade / TraderHermes Levels 1–9 source package, preserving source terminology, rule IDs and source-status labels rather than inventing missing data.
