# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A WebExtension (Chrome / Firefox / Edge / Opera) that adds a **GHN Inspector** devtools panel for managing the GHN SingleWeb Portal's MFE (Module Federation) module map at runtime. The panel drives the portal via a `window.__ghnInspector` facade injected by the host page — toggling local-development mode, getting/setting the alias→`mf-manifest.json` map, and triggering a reload — so developers can point individual mini-apps at local/remote manifests without rebuilding the portal.

The facade is invoked from the service worker via `browser.scripting.executeScript` running in the **MAIN world** (the default ISOLATED world cannot see `window.__ghnInspector`). The shape of that facade is mirrored in `PortalInspectorAPI` (`source/types.ts`) and is **hand-synced** with the portal — if the portal changes its API surface, update both the interface and the injected functions in `service-worker.ts` together.

## Common commands

Package manager is **yarn v1** (pinned via `packageManager` field). Node ≥ 14.

```bash
yarn install
yarn dev:chrome        # watch build for Chrome (also: dev:firefox, dev:edge, dev:opera)
yarn build:chrome      # production build for one target
yarn build             # build all four targets, each zipped to extension/<browser>.{zip|xpi}
yarn lint              # eslint .ts/.tsx (lint:fix to autofix)
yarn types             # tsc --noEmit type check
```

Output goes to `extension/<browser>/` (unpacked) and `extension/<browser>.zip` (or `firefox.xpi`). Load the unpacked folder via `chrome://extensions` → Load Unpacked, or `about:debugging` in Firefox. Dev builds auto-reload via `webpack-extension-reloader` on port 9090.

There is no test runner configured. Note both `biome.json` and `.eslintrc.json` exist; ESLint is the script-wired linter, Biome is present but not yet invoked from `package.json`.

## Architecture

Three runtime contexts, wired by `webpack.config.js` as four entries (`manifest`, `serviceworker`, `devtools`, `panel`):

1. **Service worker** — `source/Background/service-worker.ts`
   The only context with `scripting` + `tabs` permissions. Listens on `browser.runtime.onMessage` and dispatches on the `MessageCommand` enum (`source/types.ts`): `GET_TAB_INFO`, `GET_LOCAL_DEVELOPMENT`, `SET_LOCAL_DEVELOPMENT`, `GET_PORTAL_MODULE`, `SET_PORTAL_MODULE`, `ON_RELOAD`. Every case (except `GET_TAB_INFO`, which uses `browser.tabs.get`) flows through a shared `execInPage(tabId, func, args)` helper that runs the supplied function in the inspected page's MAIN world and returns its result. The panel never touches the target page directly.

2. **Devtools page** — `source/Devtools/index.tsx` (loaded by `views/devtools.html`)
   Tiny bootstrap that calls `browser.devtools.panels.create(...)` to register the "GHN inspector" panel pointing at `panel.html`.

3. **Panel UI** — `source/Devtools/panel.tsx` (loaded by `views/panel.html`)
   React 17 app rendered into `#panel-root`. Provider stack:
   `ErrorBoundary` → `LocalStorageProvider` → `ConfigContextProvider` → `<DevTools />`.

### React state model

Two contexts under `source/Devtools/context/`:

- **`localStorage.context.tsx`** owns the bridge to the inspected tab. Holds `activeTab`, the `extensionStorage` map (alias → mf-manifest URL), and exposes `getAppListFromPortal` (parses a JSON blob the user pastes from the Portal's apps API and writes derived `{alias: cdnUrl/version/mf-manifest.json}` entries to both `browser.storage.local` and the page's `localStorage`), `saveAppListToPortal`, and `refreshAppList` (reloads the inspected tab). All cross-context messaging goes through `browser.runtime.sendMessage({ command, tabId, data? })`.
- **`localConfigs.context.tsx`** wraps the extension's own preferences (persisted via `browser.storage.local`, keys in `source/Devtools/constant/`).

Custom hooks live in `source/Devtools/hooks/` (`useApplicationListData`, `useGlobal`).

### Manifest generation

`source/manifest.json` is processed by `wext-manifest-loader`. Keys prefixed `__chrome|edge|opera__` or `__firefox__` are selected based on `TARGET_BROWSER`. Manifest V3 is emitted for Chromium browsers (service worker background), V2 for Firefox (background scripts array). Host permissions cover `https://*.ghn.tech/*`, `https://*.ghn.vn/*`, and `http://localhost/*` (Firefox lists the hosts inside `permissions`; Chromium splits them into `host_permissions`). The version field is overwritten from `package.json` at build time (`usePackageJSONVersion: true`).

### Styling

PostCSS pipeline (`postcss.config.js`) with `css-loader` + `MiniCssExtractPlugin`, output to `css/[name].css`. Panel styles live in `source/Devtools/panel.css`. Tailwind plugin is present in eslint config but the project uses plain CSS.

## Conventions worth knowing

- **TypeScript paths**: no `@/` alias — imports are relative. `tsconfig.json` extends `@abhijithvijayan/tsconfig`.
- **`const enum MessageCommand`** in `source/types.ts` is the single source of truth for IPC commands. When adding a new background capability, add a case both in the enum and in the `onMessage` switch in `service-worker.ts`.
- **No direct page DOM access from the panel** — always route through the service worker via a `MessageCommand`. The panel runs in an extension origin and cannot touch the inspected tab's `localStorage` directly.
- **Versioning**: `package.json` `version` flows into both the built manifest and (per the README) is normally `0.0.0` in source — CI bumps it before release. Recent commits show manual `chore: bump version` commits, so check the existing pattern before editing.
- **Two formatter configs coexist**: `.prettierrc.json` (used by `eslint-plugin-prettier`) and `biome.json`. Prefer Prettier-compatible output unless explicitly migrating to Biome.
