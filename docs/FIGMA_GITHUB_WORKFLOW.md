# Figma <-> GitHub Workflow

This repo is the working source for the EDEN design system implementation, and it is linked to the EDEN Figma file through a checked-in manifest in `figma.config.json`.

## Linked assets

- Figma file key: `0td93qgEm15nkmBt7p2z93`
- Primary button canvas node: `123:2600`
- Token export stored in repo: `eden-ui-tokens.json`
- Component mappings stored in repo: `src/code-connect/mappings.ts`

## What is truly bidirectional

### Figma -> GitHub

Use this path when variables, themes, or component definitions change in Figma first.

1. Export the latest token JSON from Figma into `eden-ui-tokens.json`.
2. Run `npm run sync:figma:pull`.
3. Run `npm run validate`.
4. Commit and push the changed files to GitHub.

This updates the generated CSS variables and TypeScript token contracts in `src/tokens/generated`.

### GitHub -> Figma

Use this path when code or component behavior changes in the repo first.

1. Update components, stories, or token source files in the repo.
2. Run `npm run validate`.
3. Commit and push to GitHub.
4. Reflect the approved change back into the linked Figma nodes from `figma.config.json` and `src/code-connect/mappings.ts`.

For component-level sync, Code Connect and the linked node IDs are the bridge. For token-level sync, `eden-ui-tokens.json` remains the exchange file.

## Important constraint

There is no safe fully automatic round-trip for arbitrary manual visual edits in Figma and arbitrary code edits in GitHub at the same time. A source-of-truth handoff is still required for each change:

- Tokens and variables: round-trip through `eden-ui-tokens.json`
- React components and stories: round-trip through code + linked Figma nodes

That means the workflow is bidirectional, but not conflict-free without an explicit sync step.

## Commands

- `npm run figma:status`: show linked Figma file, token metadata, and generated artifact status
- `npm run sync:figma:pull`: validate the checked-in Figma export and rebuild generated token files
- `npm run validate`: run the repo build and test suite before pushing

## Working agreement for Codex

When asked to create or update design-system work:

- Store source files and generated artifacts in this repo
- Read token changes from `eden-ui-tokens.json`
- Use `figma.config.json` to locate the linked Figma file and node IDs
- Push repo changes to GitHub after validation when requested
- Mirror approved Figma changes into the repo through the token export or mapped component files
