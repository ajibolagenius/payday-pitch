# Verify: Stack & architecture · spec 0001 · updated 2026-10-20

_Spec 0001 has no numbered acceptance criteria; these steps come from the scope's "Done when" line and the spec's Offline and Manifest conventions. `/check verify` runs these; `/test` locks the durable ones._

## Commands

- [x] `nvm use && pnpm install && pnpm typecheck && pnpm build` → all pass; every route builds as static → Done when: passes build
- [x] `pnpm dev`, then request `/` and `/app` → both return 200 → Done when: boots locally

## UI / manual

- [x] Open `/` at phone width (Pixel 7 viewport) → no horizontal scroll; headings render in Space Grotesk → Done when: loads well on a phone
- [x] `pnpm build && pnpm start`; load `/`, reload (now controlled by `/sw.js?v=dev`), go offline, reload `/` → the cached page shows → Offline: navigations network first, cached fallback
- [x] Still offline, open `/app` with no user known to the worker → the "You are offline" page, nothing cached under `pages-*` → Offline: unknown users cache nothing
- [x] Online: post `{type:"user",id:"a"}` to the worker, visit `/app` → `pages-<ver>-a` holds `/app`; offline `/app` shows it → Offline: per user page cache
- [x] Post `{type:"user",id:"b"}`, go offline, open `/app` → the offline page, never user a's page; `pages-<ver>-a` is gone → Offline: drop other users' caches
- [x] Post `{type:"sign-out"}` → no `pages-*` caches remain → Offline: sign out clears page caches
- [ ] Deploy a second build (different `VERCEL_GIT_COMMIT_SHA`), reload an open tab → "A new version is ready" prompt; Refresh reloads on the new worker; old version caches are deleted → Offline: no silent skipWaiting (update path proven by Playwright with a second worker registered at `/sw.js?v=e2e-next`; a true second deploy not re-run on 2026-10-21)
- [ ] Install on Android Chrome and Add to Home Screen on iOS Safari → opens `/app` standalone, green placeholder icon, theme color `#1B4638` → Manifest (needs real devices; Playwright proved the manifest fields, standalone config, and that every icon serves as PNG)

## Acceptance-criteria coverage

- Done when (boots, passes build, loads on a phone): the two command steps and the phone width step
- Offline conventions: steps 4 to 9 under UI / manual
- Manifest conventions: the install step
