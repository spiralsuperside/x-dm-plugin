# x-dm-plugin

Chrome Extension (Manifest V3) for node-based image ideation workflows.

## What It Does

- Provides a browser-native canvas flow for visual idea exploration.
- Supports node kinds such as `reference_image`, `prompt`, and `generated_image`.
- Supports branching and multiple generated variants from prompt chains.
- Keeps local demo setup simple and secure.

## Project Structure

- `src/background/` MV3 service worker orchestration and runtime messaging
- `src/sidepanel/` Main node canvas UI (React Flow)
- `src/popup/` Quick actions and status
- `src/options/` Extension settings
- `src/lib/` Shared libraries (messaging, storage, graph, integration, security)
- `src/types/` Shared TypeScript types
- `tests/` Unit/integration/e2e tests

## Development

Windows-friendly commands:

```bat
cmd /c "set npm_config_cache=.npm-cache&& npm install"
cmd /c "set npm_config_cache=.npm-cache&& npm run dev"
cmd /c "set npm_config_cache=.npm-cache&& npm run build"
cmd /c "set npm_config_cache=.npm-cache&& npm run test"
cmd /c "set npm_config_cache=.npm-cache&& npm run typecheck"
cmd /c "set npm_config_cache=.npm-cache&& npm run lint"
```
