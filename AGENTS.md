# Repository Guidelines

## IMPORTANT INSTRUCTIONS
Before using or writing ANY code that depends on external APIs/libraries, use exa web search first to verify current docs and examples. Do NOT use cli commands to edit/read files use your NATIVE tools to do so.

## Project Overview
This repo is a Chrome extension project (Manifest V3) for node-based image ideation workflows.

Primary goals:
- Build a browser-native canvas flow for visual idea exploration.
- Support node kinds such as `reference_image`, `prompt`, and `generated_image`.
- Allow branching/multiple outputs from prompt chains.
- Keep local demo setup simple and secure.

If a companion backend exists, it should be treated as a support service only. The extension architecture remains the source of truth for UI flows.

## Canonical Structure
- `src/background/`: MV3 service worker orchestration and runtime messaging.
- `src/sidepanel/`: main node canvas UI (React Flow).
- `src/popup/`: quick actions and status.
- `src/options/`: extension settings (API key/provider/backend URL).
- `src/content/`: content scripts (only if explicitly needed).
- `src/lib/messaging/`: typed message contracts and message bus wrappers.
- `src/lib/storage/`: persistence adapters (`chrome.storage` / IndexedDB).
- `src/lib/graph/`: graph model, ancestry traversal, prompt coalescing.
- `src/lib/integration/`: provider clients and request adapters.
- `src/lib/security/`: sanitization, validation, and permission guards.
- `src/types/`: shared TypeScript interfaces and enums.
- `tests/`: unit/integration/e2e tests.

## Extension Patterns (Must Follow)
- Keep extension code rooted under `src/` with feature-focused modules.
- Use strict TypeScript typing; no `any` unless justified and documented.
- Keep message contracts explicit and versioned.
- Keep request/response payload schemas strict and validated at boundaries.
- Avoid logging secrets, tokens, raw image bytes, or sensitive payload content.
- Keep MV3 permissions minimal (`permissions` and `host_permissions` least privilege).
- Keep generation flow contract stable:
  1. Validate target prompt node and graph state.
  2. Create run record in local persistence.
  3. Execute generation through integration layer (service worker or approved path).
  4. Persist generated asset node(s) and update run status.

Current expected generation behavior:
- Prompt is coalesced from node ancestry in deterministic order.
- Reference image input uses connected ancestor image node(s) according to configured strategy.
- Branch generation supports multiple output variants from one prompt node.

## Frontend Patterns (Must Follow)
- Canvas app lives in `src/sidepanel/` and should remain API/message contract driven.
- Use React Flow state helpers (`useNodesState` / `useEdgesState`) when React Flow is used.
- Keep UI actions mapped to typed commands:
  - project create/load
  - node create/update/delete
  - image upload/paste
  - generate run trigger
  - graph refresh/sync
- Keep environment-based settings prefixed for Vite (e.g., `VITE_...`) when build tooling uses Vite.

## Build, Test, and Dev Commands
From repo root (Windows-friendly examples):
- `cmd /c "set npm_config_cache=.npm-cache&& npm install"`
- `cmd /c "set npm_config_cache=.npm-cache&& npm run dev"`
- `cmd /c "set npm_config_cache=.npm-cache&& npm run build"`
- `cmd /c "set npm_config_cache=.npm-cache&& npm run test"`
- `cmd /c "set npm_config_cache=.npm-cache&& npm run typecheck"`
- `cmd /c "set npm_config_cache=.npm-cache&& npm run lint"`

Notes for this Windows environment:
- PowerShell policy may block `npm.ps1`; use `cmd /c npm ...`.
- If cache permission issues occur, keep npm cache local (`npm_config_cache=.npm-cache`).

## Testing Requirements
- New behavior must include/adjust tests in `tests/`.
- Prefer deterministic tests with mocks for external provider calls.
- Keep critical path tests intact:
  - extension bootstrap/load
  - typed runtime messaging
  - graph validation and cycle prevention
  - prompt coalescing determinism
  - generation enqueue/status transitions
  - upload/paste validation (mime/size)
  - strict schema validation
  - permission-safety checks for privileged actions

## Coding Style & Naming
- TypeScript: 2-space indentation or project standard, strict mode enabled.
- `camelCase` for variables/functions, `PascalCase` for components/types/classes.
- Keep modules single-responsibility and layered.
- Avoid broad refactors unless explicitly requested.
- Do not move core folders without explicit approval.

## Security & Compliance Expectations
- Manifest V3 only.
- No remote code execution patterns.
- No hardcoded secrets in source.
- API keys must be user-supplied securely or routed through approved backend strategy.
- Enforce CSP-safe rendering and sanitize user-provided text displayed in UI.

## PR / Change Expectations
- Keep changes focused and scoped.
- Include commands run and outcomes (build, lint, typecheck, tests).
- Call out behavior changes and message/API contract changes explicitly.
