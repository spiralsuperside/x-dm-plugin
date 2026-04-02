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
- Browser-native send mode (`browser_native`) that dispatches from the logged-in X/Reddit tab session (no API key in extension request path).

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
- Browser-native mode is unofficial web automation behavior and depends on platform DOM/UI selectors and active logged-in tab state.
- Production hardening should add stricter policy controls, comprehensive observability, and optional companion-backend routing for sensitive integrations.

## What The User Must Do (Exact Flow)

1. Install extension locally.
   - Run build: `cmd /c "set npm_config_cache=.npm-cache&& npm run build"`.
   - In Chrome: `chrome://extensions` -> enable Developer mode -> Load unpacked -> select `dist/`.

2. Choose integration mode in Options.
   - `demo`: local simulated dispatch, no real send.
   - `browser_native`: real dispatch through X/Reddit web UI in the active logged-in tab.
   - Current build does not expose `api` mode in UI. `companionApiBaseUrl` is stored as legacy/fallback and is not used by the active dispatch path.

3. Configure safety settings in Options.
   - Set: `safeMode`, `dailyHardCap`, `hourlyHardCap`, `perMinuteCap`, `minDelaySec`, `maxDelaySec`, `followupDelayMinutes`, `requireRunStartConfirmation`, `maxRetries`, `stopOnRateLimit`, `messageSimilarityThreshold`.

4. Be logged in on the target platform in the same browser profile.
   - X: `https://x.com/*` or `https://twitter.com/*`
   - Reddit: `https://www.reddit.com/*` or `https://*.reddit.com/*`
   - Keep browser/computer active while runs execute.

5. Grant runtime permissions when prompted.
   - `tabs`
   - Host permissions for active platform page:
     - `https://x.com/*` or `https://twitter.com/*`
     - `https://www.reddit.com/*` or `https://*.reddit.com/*`

6. Create a campaign in Sidepanel.
   - Click `Create X Campaign` or `Create Reddit Campaign`.

7. Add targets.
   - Paste usernames and click `Import CSV (X)` or `Import CSV (Reddit)`, or
   - Open a target X/Reddit page and click `Capture From X Page` / `Capture From Reddit Page`.

8. Set template.
   - Save template text with `{name}` and optional spintax like `{Hey|Hi|Hello}`.
   - First-message links are blocked by lint rules.

9. Run campaign.
   - Click `Create Run Queue`.
   - Open `Runs` tab, copy/type run start code if required, then click `Start`.
   - Use `Pause`, `Retry`, `Cancel`, or `Emergency Stop Active Runs` as needed.

10. Capture replies.
   - Click `Ingest X Replies` or `Ingest Reddit Replies` to update reply history on matched contacts.
