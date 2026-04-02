# x-dm-plugin (DM Dad Local Demo)

Local-first Chrome Extension (Manifest V3) for X (Twitter) and Reddit DM outreach workflows.

## What This Build Covers

- Campaign creation for X and Reddit.
- Target import from CSV/TXT-style lists.
- Target capture from active X/Reddit pages.
- Reply ingestion from active X/Reddit pages to update local contact reply history.
- Template rendering with `{name}` personalization and spintax.
- Run queue orchestration with warm-up, send, and follow-up actions.
- Safety controls: daily/per-minute caps, natural delays, message-similarity linting, first-message link blocking, and rate-limit cooldown handling.
- Local persistence with IndexedDB + `chrome.storage.local`.

## Architecture

- `src/background/`: queue orchestration, alarm-driven execution, runtime command router.
- `src/sidepanel/`: primary campaign and run management UI.
- `src/popup/`: quick open + recent run status.
- `src/options/`: integration and safety settings.
- `src/content/`: on-page target capture for X/Reddit.
- `src/lib/messaging/`: typed command/event contracts.
- `src/lib/storage/`: Dexie repositories + settings store.
- `src/lib/security/`: policy guards, rate limits, sanitization, redaction, message-risk linting.

## Local Development

```bat
cmd /c "set npm_config_cache=.npm-cache&& npm install"
cmd /c "set npm_config_cache=.npm-cache&& npm run dev"
cmd /c "set npm_config_cache=.npm-cache&& npm run build"
cmd /c "set npm_config_cache=.npm-cache&& npm run typecheck"
cmd /c "set npm_config_cache=.npm-cache&& npm run test"
```

## Notes

- This repo is a local demo-first implementation.
- Production hardening should add stricter policy controls, comprehensive observability, and optional companion-backend routing for sensitive integrations.
