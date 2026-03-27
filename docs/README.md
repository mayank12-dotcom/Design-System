# Documentation

This repo now includes a standalone documentation site at `docs/site/`.

## What it covers

- Intro page for the EDEN design system
- Token explorer driven directly from `eden-ui-tokens.json`
- Typography explorer driven from the `Responsive` token collection
- Component reference page for the first-wave component set

## Source of truth

- `eden-ui-tokens.json` remains the source of truth
- `docs/site/token-data.js` is generated from that JSON file
- Do not hand-edit `docs/site/token-data.js`

## Commands

- `npm run build:tokens`
- `npm run build:docs:data`
- `npm run build`

## Local preview

Because `docs/site/` is a static site, you can preview it with any static server from the repo root. For example:

1. `python3 -m http.server 4173`
2. Open `http://localhost:4173/docs/site/`

## Main files

- `docs/site/index.html`: documentation shell and page structure
- `docs/site/styles.css`: docs styling, motion, and token explorer layout
- `docs/site/app.js`: interactive behavior, filtering, deep links, and token inspector
- `scripts/build-docs-token-data.mjs`: generates docs token data from `eden-ui-tokens.json`
