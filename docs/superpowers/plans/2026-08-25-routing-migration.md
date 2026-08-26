# Real Routing for TaxSense (H-04) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace TaxSense's `activeStep` integer + `currentStep` string dual-state navigation model with real URL routing (react-router-dom), so the app gets a working back button, refresh-safety, and deep links — without a big-bang rewrite of `App.tsx` or its 47 call sites across 10 files.

**Architecture:** `App.tsx` currently branches its entire authenticated-shell render tree on a numeric `activeStep` (2, 3, 4, 5, 6, 10, 11) plus a redundant `currentStep` string ('HOME' | 'LANDING' | 'CONFIRM_EXTRACTION' | 'CHAT_QA' | 'FINAL_EXPORT') stored in Zustand. All 47 navigation call sites across 10 files funnel through either the store's `setActiveStep` (passed down as a raw prop reference) or `onNavigateStep` (a one-line wrapper `(step) => setActiveStep(step)` defined in exactly two places in `App.tsx`). That means real routing can be introduced by changing what those two wrapper definitions *do* — making them also call React Router's `navigate()` — without touching Sidebar, CommandPalette, HistoryArchive, VaultComponents, DashboardCommandCenter, AIFilingReadinessEngine, SmartDocumentChecklist, RegimeComparison, or SearchModal at all. A `useEffect` watching `location.pathname` handles the reverse direction (back/forward/refresh/deep-link → store state), so the existing `{activeStep === N && (...)}` conditional rendering keeps working unchanged. *(**Amendment note**, recorded during the final whole-branch review: the claim above that `SmartDocumentChecklist` and `RegimeComparison` need no changes turned out to be **wrong**, and Task 3's review caught it. Both components pull `setActiveStep` directly off `useTaxStore` rather than receiving it as a prop from `App.tsx`, so neither one routes through either wrapper. Each therefore needed its own local `navigate(pathForStep(...))` wrapper mirroring `navigateToStep` — see `src/components/SmartDocumentChecklist.tsx` and `src/components/RegimeComparison.tsx`. The other seven components listed are genuinely untouched.)* Splitting `App.tsx`'s 1,591 lines into real per-route files is a separate, optional, higher-risk task (Task 8) — the routing *behavior* fix (Tasks 1–7) does not depend on it and should ship first.

**Tech Stack:** React 19, Vite 6, Zustand (existing store, unmodified in shape — only how its setter is *wrapped* changes), react-router-dom (new dependency, added in Task 1), TypeScript, Express (`server.ts`, already SPA-fallback-safe — see Global Constraints).

**Spec:** No separate spec document exists. This plan is self-contained; the "why" is the H-04 finding from the TaxSense fix-ledger audit (`activeStep` integer navigation — no back button, no deep link, no refresh-safety, and it's why `App.tsx` is 1,591 lines) plus the concrete facts gathered while writing this plan (listed in Global Constraints below). Read this plan's Global Constraints section before starting Task 1 — it records exact current file/line facts that later tasks depend on.

## Global Constraints

- **No test framework exists in this repo.** There is no jest/vitest/testing-library — only `npx tsc --noEmit` and `npm run build` as automated checks. Every task's "run tests" step in this plan means running those two commands, followed by manual live-browser verification (the project's established practice — see "Manual verification" below). Do not introduce a test framework as part of this plan; that's out of scope.

> **Amendment note (recorded during the final whole-branch review, after Task 7):** this constraint originally referenced `npm run check:classes` (a custom Tailwind dead-class guard) and an aggregate `npm run verify` script. **Neither script exists in this repo.** `package.json`'s actual scripts are `dev`, `build`, `start`, `clean`, and `lint` (`lint` is itself just `tsc --noEmit`). Wherever this plan says "run `npm run verify`", read it as "run `npx tsc --noEmit` and `npm run build`".
- **Manual verification method:** This project's established practice (used throughout its recent fix-ledger work) is to start the dev server, then use direct DOM/network inspection — `document.body.innerText`, `getComputedStyle`, `window.location`, network request logs — rather than trusting screenshots, which have proven unreliable in the available browser tooling. Every task below that has a "Manually verify" step gives the exact thing to check this way.
- **Dev server:** `npm run dev` runs `tsx server.ts` (a custom Express server, not plain `vite dev`), defaulting to port 3000 (respects `$PORT`). Do not use a bare `vite` dev command.
- **SPA fallback already works in all three environments — do not add server-side routing config.** Verified while writing this plan:
  - Local dev (`server.ts:377-383`): Vite runs in `middlewareMode: true, appType: 'spa'`, which auto-serves `index.html` for any non-asset path.
  - Local production (`server.ts:384-390`): explicit `app.get('*', (req,res) => res.sendFile(...index.html))` catch-all already exists.
  - Vercel (`vercel.json`): already rewrites every non-`/api/*` path to `/index.html`.
  - This means deep-linking to e.g. `/vault` and refreshing will work correctly in all three environments as soon as the client-side route exists — no backend changes needed anywhere in this plan.
- **The complete, verified route table** (there are exactly 7 numeric `activeStep` targets in the entire codebase — confirmed via `grep -rhoE "setActiveStep\([0-9]+\)|onNavigateStep\([0-9]+\)" src/ | sort -u`, which returns only 2, 3, 4, 5, 6, 10, 11):

  | `activeStep` | `currentStep` (old) | Path (new) | Renders |
  |---|---|---|---|
  | *(n/a — `currentStep==='HOME'`)* | `HOME` | `/` | `LandingPage` |
  | `2` | `LANDING` | `/start` | `WorkspaceSelection` (no sidebar) |
  | `3` | `LANDING` | `/vault` | `DocumentVault` |
  | `4` | `CONFIRM_EXTRACTION` | `/audit` | `AuditPanel` |
  | `5` | `CHAT_QA` | `/recommendations` | `RecommendationsPanel` |
  | `6` | `FINAL_EXPORT` | `/filing` | `FilingWorkspacePanel` |
  | `10` | `FINAL_EXPORT` | `/history` | `HistoryArchive` |
  | `11` | `LANDING` | `/dashboard` | `DashboardCommandCenter` |

- **The two `onNavigateStep`/`setActiveStep`-as-navigation wrapper definitions in `App.tsx`** (everything else is downstream of these):
  - `src/App.tsx:1006` — `onNavigateStep={(step) => setActiveStep(step)}` (passed into `DashboardCommandCenter`)
  - `src/App.tsx:1583` — `onNavigateStep={(step) => setActiveStep(step)}` (passed into `Sidebar`'s command-palette wiring — confirm exact consumer when you reach Task 3, line numbers may drift slightly as earlier tasks touch the file)
  - Six more places pass the **raw** `setActiveStep` reference directly (no wrapper) as a `setActiveStep` *prop*: `src/App.tsx:854, 1028, 1062, 1098, 1125, 1135`. These need the same treatment in Task 3.
- **The `_migrationRedirectStep` global is dead code.** `src/App.tsx:437-439` and a second identical block near line 839 both read `(window as any)._migrationRedirectStep || 11` — grep confirms nothing in the codebase ever sets it to anything but `null`/undefined, so it always evaluates to `11`. Task 6 removes it.
- **`ContextService.ts`/`PromptBuilder.ts` read `state.currentStep`** to tell the AI Copilot which screen the user is on (`src/services/ai/ContextService.ts:87`, `src/services/ai/PromptBuilder.ts:32`). Task 3's sync effect keeps `currentStep` accurate exactly as before, so **no changes are needed in either AI service file** — this is a verification point in Task 7, not a separate task.
- **Framer Motion / AnimatePresence**: the current per-step blocks (`src/App.tsx:996-1138`) are wrapped in `<AnimatePresence>` with per-step `key` props (`key="step-3"`, etc.) driving cross-fade transitions. Task 3 must **not** remove or restructure this — it keeps working unchanged because the conditional rendering it wraps is untouched; only what *sets* `activeStep` changes.
- Work on a feature branch off `main`/whatever the current default branch is; do not commit directly to it. Use `git checkout -b feat/routing-migration` before Task 1.

---

## Task 1: Install react-router-dom and wrap the app root

**Files:**
- Modify: `package.json` (dependency added by npm, don't hand-edit)
- Modify: `src/main.tsx`

**Interfaces:**
- Produces: `<BrowserRouter>` now wraps `<App />` in the render tree. No component inside `App` uses any router API yet — this task is purely additive and must not change what renders.

- [ ] **Step 1: Install the dependency**

```bash
npm install react-router-dom
```

- [ ] **Step 2: Wrap `<App />` in `<BrowserRouter>`**

Current `src/main.tsx`:
```tsx
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
```

Replace with:
```tsx
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
```

- [ ] **Step 3: Verify the build is clean**

Run: `npx tsc --noEmit && npm run build`
Expected: both succeed with no errors (this is purely additive — `App.tsx` doesn't import anything from `react-router-dom` yet, so there is nothing new to type-check inside it).

- [ ] **Step 4: Manually verify nothing changed at runtime**

Start the dev server (`npm run dev` or the project's `preview_start` tooling against `.claude/launch.json` if working inside Claude Code), then:
- Load `/` — confirm the landing page renders exactly as before (`document.body.innerText` should start with the hero headline text).
- Click through to the dashboard as a guest (Compare My Tax Regime → Launch Sandbox) — confirm it still reaches the dashboard.
Expected: identical behavior to before this task; `<BrowserRouter>` alone changes nothing observable yet.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/main.tsx
git commit -m "chore: add react-router-dom, wrap app root in BrowserRouter"
```

---

## Task 2: Add the step↔path route table as a shared module

**Files:**
- Create: `src/routes/stepRoutes.ts`

**Interfaces:**
- Consumes: `CurrentStep` type from `src/store/useTaxStore.ts` (`export type CurrentStep = 'HOME' | 'LANDING' | 'CONFIRM_EXTRACTION' | 'CHAT_QA' | 'FINAL_EXPORT'`).
- Produces:
  - `pathForStep(activeStep: number, currentStep: CurrentStep): string` — used by Task 3's navigation wrapper.
  - `stepForPath(pathname: string): { activeStep: number; currentStep: CurrentStep } | null` — used by Task 3's URL-to-store sync effect. Returns `null` for any path not in the table (e.g. a 404 case, or a route this migration hasn't covered), so callers can decide what to do (Task 3 treats `null` as "redirect to `/`").

- [ ] **Step 1: Write the route table module**

```ts
// src/routes/stepRoutes.ts
import type { CurrentStep } from '../store/useTaxStore';

// The complete, verified set of activeStep targets in the app -- see
// Global Constraints in the routing-migration plan for how this list was
// confirmed exhaustive (grep of every setActiveStep(N)/onNavigateStep(N)
// call site in src/).
interface StepRoute {
  activeStep: number;
  currentStep: CurrentStep;
  path: string;
}

export const HOME_PATH = '/';

const STEP_ROUTES: StepRoute[] = [
  { activeStep: 2, currentStep: 'LANDING', path: '/start' },
  { activeStep: 3, currentStep: 'LANDING', path: '/vault' },
  { activeStep: 4, currentStep: 'CONFIRM_EXTRACTION', path: '/audit' },
  { activeStep: 5, currentStep: 'CHAT_QA', path: '/recommendations' },
  { activeStep: 6, currentStep: 'FINAL_EXPORT', path: '/filing' },
  { activeStep: 10, currentStep: 'FINAL_EXPORT', path: '/history' },
  { activeStep: 11, currentStep: 'LANDING', path: '/dashboard' },
];

export function pathForStep(activeStep: number): string {
  const route = STEP_ROUTES.find((r) => r.activeStep === activeStep);
  return route ? route.path : HOME_PATH;
}

export function stepForPath(pathname: string): { activeStep: number; currentStep: CurrentStep } | null {
  if (pathname === HOME_PATH) {
    return null; // caller treats HOME specially -- see Task 3
  }
  const route = STEP_ROUTES.find((r) => r.path === pathname);
  if (!route) return null;
  return { activeStep: route.activeStep, currentStep: route.currentStep };
}
```

- [ ] **Step 2: Verify it compiles standalone**

Run: `npx tsc --noEmit`
Expected: no errors. Nothing imports this module yet, so this only checks the file itself is syntactically and type-correct.

- [ ] **Step 3: Commit**

```bash
git add src/routes/stepRoutes.ts
git commit -m "feat: add step<->path route table for routing migration"
```

---

## Task 3: Wire real navigation through the two existing wrapper points

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `pathForStep`, `stepForPath`, `HOME_PATH` from `src/routes/stepRoutes.ts` (Task 2); `useNavigate`, `useLocation` from `react-router-dom` (Task 1).
- Produces: a `navigateToStep(step: number): void` function defined once near the top of the `App` component, replacing every place that currently passes the raw `setActiveStep` reference or a `(step) => setActiveStep(step)` inline wrapper as a prop. After this task, clicking any existing navigation control (Sidebar items, dashboard quick actions, command palette, "Continue" buttons, etc.) updates the URL for real, and the browser back/forward buttons work between the 7 authenticated screens.

- [ ] **Step 1: Add router hooks and the `navigateToStep` wrapper**

Find this in `src/App.tsx` (around line 153-154):
```tsx
  const activeStep = useTaxStore((state) => state.activeStep);
  const setActiveStep = useTaxStore((state) => state.setActiveStep);
```

Add immediately after it:
```tsx
  const activeStep = useTaxStore((state) => state.activeStep);
  const setActiveStep = useTaxStore((state) => state.setActiveStep);

  const navigate = useNavigate();
  const location = useLocation();

  // Single choke point for every "go to step N" call in the app. All 47
  // call sites across 10 files funnel through either this function (via
  // the onNavigateStep prop) or the raw setActiveStep reference passed as
  // a prop below -- so wrapping it here is enough to make every one of
  // them a real navigation, with no changes needed in Sidebar,
  // CommandPalette, HistoryArchive, VaultComponents, DashboardCommandCenter,
  // AIFilingReadinessEngine, SmartDocumentChecklist, RegimeComparison, or
  // SearchModal.
  const navigateToStep = useCallback((step: number) => {
    setActiveStep(step);
    navigate(pathForStep(step));
  }, [setActiveStep, navigate]);
```

Add the import at the top of the file (find the existing `import React, { useState, useEffect, useMemo, lazy, Suspense, useRef } from 'react';` line and add `useCallback`):
```tsx
import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense, useRef } from 'react';
```

Add the react-router-dom and route-table imports near the top of the file, alongside the other local imports (e.g. right after the `useTaxStore` import):
```tsx
import { useNavigate, useLocation } from 'react-router-dom';
import { pathForStep, stepForPath, HOME_PATH } from './routes/stepRoutes';
```

- [ ] **Step 2: Replace every raw `setActiveStep` prop-pass with `navigateToStep`**

There are 8 sites total. Six pass the raw setter as a `setActiveStep` prop; two already wrap it as `onNavigateStep`. Change all 8 to use `navigateToStep`.

The six raw ones (search for `setActiveStep={setActiveStep}` — there are exactly 6 matches at the time of writing, at approximately lines 854, 1028, 1062, 1098, 1125, 1135; confirm exact line numbers with `grep -n "setActiveStep={setActiveStep}" src/App.tsx` since earlier edits in this task shift them):

```tsx
// Before (appears 6 times, once per consumer):
                setActiveStep={setActiveStep}

// After (every occurrence):
                setActiveStep={navigateToStep}
```

Apply this with a single find-and-replace across the file — every occurrence of the exact string `setActiveStep={setActiveStep}` becomes `setActiveStep={navigateToStep}`. (The prop name on the child components stays `setActiveStep` — only which function is passed changes. Renaming the prop itself on `Sidebar`, `DocumentVault`, etc. is out of scope for this task; do not touch those component files.)

The two wrapped ones:
```tsx
// Before (src/App.tsx:1006 and :1583):
                              onNavigateStep={(step) => setActiveStep(step)}

// After (both occurrences):
                              onNavigateStep={navigateToStep}
```

- [ ] **Step 3: Replace the `LandingPage onStart` handler**

Find (around line 723-724):
```tsx
  if (currentStep === 'HOME') {
    return <LandingPage onStart={() => { setActiveStep(2); }} />;
```

Replace with:
```tsx
  if (currentStep === 'HOME') {
    return <LandingPage onStart={() => { navigateToStep(2); }} />;
```

- [ ] **Step 4: Add the URL-to-store sync effect (handles back/forward/refresh/deep-link)**

Add this new `useEffect` in `App.tsx`, placed after the `navigateToStep` definition from Step 1 (order relative to other effects doesn't matter, but it must run on every render where `location.pathname` changes):

```tsx
  // Reverse direction of navigateToStep: when the URL changes because of
  // browser back/forward, a typed-in URL, or a page refresh, sync the
  // store so the existing {activeStep === N && (...)} rendering picks the
  // right screen. This is what actually fixes "no back button" and "no
  // refresh-safety" -- navigateToStep alone only fixes forward navigation.
  useEffect(() => {
    if (!hydrated) return; // wait for the persisted store to rehydrate first
    if (location.pathname === HOME_PATH) {
      if (currentStep !== 'HOME') {
        setStep('HOME');
      }
      return;
    }
    const match = stepForPath(location.pathname);
    if (!match) {
      // Unknown path -- there is no 404 screen in this app yet, so land
      // on the landing page rather than showing a blank render.
      navigate(HOME_PATH, { replace: true });
      return;
    }
    if (match.activeStep !== activeStep) {
      setActiveStep(match.activeStep);
    }
  }, [location.pathname, hydrated]);
```

This references `setStep('HOME')` — check `src/store/useTaxStore.ts` for the existing `setStep` action's exact signature (it's already used elsewhere in `App.tsx`, e.g. inside `ExtractionConfirm.tsx`'s `handleApply` calling `setStep('CHAT_QA')`) and confirm `'HOME'` is a valid argument for it before wiring this in — if `setStep` only sets `currentStep` and not also resetting `activeStep` to something sane, add whatever the equivalent of the old `activeStep: 2` default is so a user landing on `/` from a stale deep state doesn't end up in a broken combination. Read `setStep`'s implementation in the store file before writing this step's final code; do not guess at its behavior.

- [ ] **Step 5 (added during pre-flight review — see plan Amendment note below): Replace direct `setActiveStep(N)`/`setStep('HOME')` call sites inside `App.tsx` that are not part of the original 8-site enumeration**

The Global Constraints' "8 wrapper/prop-pass sites" list covers every navigation call that flows through a *prop* into a child component. It does not cover calls made directly inside `App.tsx`'s own effects and inline JSX handlers, which bypass both wrapper points. Confirmed via `grep -n "setActiveStep([0-9]" src/App.tsx` and `grep -n "setStep(" src/App.tsx` after Task 3 Steps 1-4 are applied (re-run these to get exact current line numbers — Steps 1-4 shift everything below them). At time of writing (pre-Task-3 line numbers), these are the sites, none of which are touched by Steps 1-4 above and all of which represent real user-facing or session-driven navigation that must stay URL-consistent for the back-button/refresh-safety goal to actually hold:

1. **Auto-forward effect** (~line 505-509) — logged-in users are bounced past the login screen:
```tsx
  useEffect(() => {
    if (hydrated && activeStep === 2 && authMode !== null) {
      setActiveStep(11);
    }
  }, [hydrated, activeStep, authMode]);
```
Change `setActiveStep(11)` to `navigateToStep(11)`.

2. **Guest session inactivity expiry** (~line 511-524) — kicks an idle guest back to the start screen:
```tsx
          if (inactiveMs > maxInactiveMs) {
            clearSession();
            setActiveStep(2);
            alert("Your guest session has expired due to 15 minutes of inactivity.");
          }
```
Change `setActiveStep(2)` to `navigateToStep(2)`.

3. **Global keyboard shortcuts** (~line 556-594) — digit keys 1-6 jump between the 6 authenticated screens while `activeStep >= 3`:
```tsx
        switch (e.key) {
          case '1':
            setActiveStep(11); // Dashboard Hub
            break;
          case '2':
            setActiveStep(3);  // Documents
            break;
          case '3':
            setActiveStep(4);  // AI Analysis
            break;
          case '4':
            setActiveStep(5);  // Recommendations
            break;
          case '5':
            setActiveStep(6);  // Tax Return
            break;
          case '6':
            setActiveStep(10); // History logs
            break;
```
Change all six `setActiveStep(N)` calls in this switch to `navigateToStep(N)`. (Note this effect's dependency array is `[activeStep]` — do not add `navigateToStep` to it; `navigateToStep`'s own identity is stable via `useCallback` from Step 1, so omitting it does not create a stale closure over anything that matters here, consistent with the existing dependency array's scope.)

4. **`acceptExtractedData` handler** (~line 628-646) — routes to the AI diagnosis stage after a user confirms extracted data:
```tsx
    setShowConfirmScreen(false);
    setActiveStep(4); // Route to Copilot diagnosis stage
```
Change `setActiveStep(4)` to `navigateToStep(4)`.

5. **`onBackToHome` prop passed to `WorkspaceSelection`** (~line 867) — this one calls `setStep`, not `setActiveStep`, and is a separate bug from the others: it changes `currentStep` to `'HOME'` (which flips the render to `<LandingPage>` per the `if (currentStep === 'HOME')` check) without touching the URL at all, so the address bar keeps showing `/start` while the landing page renders.
```tsx
            onBackToHome={() => setStep('HOME')}
```
Change to:
```tsx
            onBackToHome={() => { setStep('HOME'); navigate(HOME_PATH); }}
```

6. **`onLogout` handler passed to `Sidebar`** (~line 890-895):
```tsx
                onLogout={() => {
                  GoogleAuthService.revokeSession();
                  clearSession();
                  setGoogleGsiState('ready');
                  setActiveStep(2);
                }}
```
Change `setActiveStep(2)` to `navigateToStep(2)`.

7. **Sticky "Continue" button** (~line 947-954) — inline JSX button, not a child-component prop:
```tsx
                          <button
                            onClick={() => setActiveStep(6)}
```
Change `setActiveStep(6)` to `navigateToStep(6)`.

8. **Filing-celebration "View Timeline history" button** (~line 1453-1458):
```tsx
                      <button
                        onClick={() => {
                          setShowCelebration(false);
                          setGuidedFilingStep(1);
                          setActiveStep(10); // Route directly to Timeline Archives (Stage 10)
                        }}
```
Change `setActiveStep(10)` to `navigateToStep(10)`.

After this step, confirm no real-navigation direct calls remain: `grep -n "setActiveStep([0-9]" src/App.tsx` should return nothing (every numeric direct call has become `navigateToStep`), and `grep -n "setStep('HOME')" src/App.tsx` should show only the fixed two-line version from item 5 above plus the sync effect's own internal `setStep('HOME')` call from Step 4 (that one is correct as-is — it runs in response to a URL change, not as a source of one, so it must not also call `navigate()` or it would create a navigation loop).

> **Amendment note (recorded during SDD pre-flight review, before Task 1 was dispatched):** the plan's Global Constraints originally claimed the 8 enumerated prop/wrapper sites were exhaustive. They are exhaustive for calls made *through props into child components*, but not for calls made directly inside `App.tsx`. This step closes that gap. See the SDD ledger for this plan for the full ruling.

- [ ] **Step 6: Type-check and build**

Run: `npx tsc --noEmit && npm run build`
Expected: both succeed. If `tsc` reports unused-variable errors for `setActiveStep` (now only used inside `navigateToStep` and the sync effect, not passed as a raw prop anywhere), that's expected and fine — it's still used, just not passed directly as a prop anymore.

**Pre-existing baseline note:** `npx tsc --noEmit` on this branch's base commit already reports 8 errors unrelated to routing (`src/components/dashboard/DashboardCommandCenter.tsx` framer-motion variant typing, `src/components/SmartDocumentChecklist.tsx` a missing `pages` field on a test fixture object). These are not part of this plan's scope. The bar for this and every later "type-check" step in this plan is **no new errors beyond that pre-existing baseline of 8**, not a fully clean `tsc` run. `npm run build` (Vite/esbuild) is unaffected by these and must stay fully clean.

- [ ] **Step 7: Manually verify forward navigation**

Start the dev server. In the browser:
- Log in as guest, land on `/dashboard`.
- Click "Document Vault" in the sidebar. Check `window.location.pathname` — expect `/vault`.
- Click through to Optimize/Tax Return equivalents (whatever sidebar items map to steps 4/5/6) and confirm each updates `window.location.pathname` to match the table in Global Constraints.
- Press keyboard shortcuts `1`-`6` (per Step 5 item 3) and confirm `window.location.pathname` updates each time, not just the visible screen.
- Click the sticky "Continue" button on `/recommendations` (Step 5 item 7) and confirm the URL updates to `/filing`.

- [ ] **Step 8: Manually verify backward navigation and refresh**

- From `/vault`, click into `/dashboard`, then press the browser Back button. Expect the URL to return to `/vault` and the Document Vault screen to render (not a blank page).
- With the URL at `/vault`, reload the page (`navigate` with `force: true` if using the Claude_Browser MCP tool, or a real refresh). Expect the app to boot straight to Document Vault, not bounce to the landing page or dashboard.
- Manually type a URL ending in `/recommendations` and load it directly (simulating a bookmarked deep link). Expect the Recommendations screen to render.
- From `/start`, trigger `onBackToHome` (Step 5 item 5) and confirm the URL changes to `/` and stays there on refresh.

- [ ] **Step 9: Commit**

```bash
git add src/App.tsx
git commit -m "feat: route all navigation through real URLs via navigateToStep"
```

---

## Task 4: Replace the dead `_migrationRedirectStep` global with a real post-login redirect

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `navigateToStep` (Task 3), `useSearchParams` from `react-router-dom`.
- Produces: a working "come back to where you were" redirect after Google sign-in or guest sandbox launch, driven by a `?redirect=` query param instead of a `window` global that was never actually being set.

- [ ] **Step 1: Read both call sites in full before changing them**

Run: `grep -n "_migrationRedirectStep" src/App.tsx` to get current line numbers (approximately 437-439 and a second block near line 839 — confirm exact numbers, they will have shifted from Task 3's edits). Read 15 lines of context around each with the `Read` tool before editing, since one is inside `handleGoogleLoginSuccess` and the other inside the guest `onLaunchSandbox` handler passed to `WorkspaceSelection` — the surrounding code differs slightly between the two and this step's replacement must fit each correctly.

- [ ] **Step 2: Replace both occurrences**

The pattern in both places is:
```tsx
      const redirectStep = (window as any)._migrationRedirectStep || 11;
      (window as any)._migrationRedirectStep = null;
      setActiveStep(redirectStep);
```

Replace with:
```tsx
      const redirectPath = new URLSearchParams(window.location.search).get('redirect');
      const redirectStep = redirectPath ? stepForPath(redirectPath)?.activeStep ?? 11 : 11;
      navigateToStep(redirectStep);
```

(This reuses `stepForPath` from Task 2 rather than adding a second lookup table. `window.location.search` is used directly here rather than `useSearchParams()` because these handlers are plain functions, not called during render — pulling the query string at call time is correct and matches how the rest of `App.tsx` already reads `window` imperatively inside event handlers.)

- [ ] **Step 3: Type-check and build**

Run: `npx tsc --noEmit && npm run build`
Expected: both succeed.

- [ ] **Step 4: Manually verify**

- Load `/vault?redirect=/vault` directly (simulating a link that wants to land back on the vault after login), and if there's a way to trigger the guest sandbox launch from that state, confirm it lands on `/vault` afterward rather than always going to `/dashboard`.
- With no `redirect` param, confirm guest login still lands on `/dashboard` as before (the `?? 11` fallback).

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "fix: replace dead _migrationRedirectStep global with real ?redirect= param"
```

---

## Task 5: Verify Sidebar's active-item highlighting still matches the real route

**Files:**
- No file changes expected — this is a verification-only task. If verification fails, the fix belongs in `src/App.tsx` (how `activeStep` is passed to `Sidebar`), not in `Sidebar.tsx` itself.

**Interfaces:**
- Consumes: nothing new. `Sidebar.tsx` already receives `activeStep` as a prop (`src/components/sidebar/Sidebar.tsx:25-26`) and checks `isActive={activeStep === N}` at 6 call sites (lines 260, 268, 276, 302, 334, 341) — Task 3's sync effect keeps the store's `activeStep` correct from the URL, so this should already work with zero changes to `Sidebar.tsx`. This task exists to prove that, not to change anything.

- [ ] **Step 1: Manually verify each sidebar item highlights correctly from a direct URL load**

For each path in the route table, load it directly (not by clicking through — a fresh page load, to isolate Task 3's sync effect from any click-driven state), then inspect the DOM for which sidebar item carries the active/highlighted styling:
- `/dashboard` → "Dashboard" item active
- `/recommendations` → whichever sidebar item corresponds to step 5 (check `Sidebar.tsx:268`'s surrounding label to name it precisely)
- `/filing` → step 6's item
- `/audit` → step 4's item
- `/vault` → "Document Vault" item
- `/history` → "Export & Reports" item (per `Sidebar.tsx:341`)

Use `document.querySelector('[aria-current="page"]')` or equivalent (check what `SidebarItem.tsx` actually sets for the active state — grep it) rather than relying on a screenshot.

- [ ] **Step 2: If any mismatch is found, diagnose before fixing**

If a sidebar item doesn't highlight correctly on direct load, the likely cause is `hydrated` not yet being `true` when the sync effect first runs, or a race between Zustand's persisted-state rehydration and the sync effect. Do not patch around it in `Sidebar.tsx` — the fix belongs in Task 3's sync effect (its `if (!hydrated) return;` guard) or in how `hydrated` itself is computed in `App.tsx`. Read `App.tsx`'s `hydrated` state definition before making any change here.

- [ ] **Step 3: Commit (only if a fix was needed)**

```bash
git add src/App.tsx
git commit -m "fix: correct sidebar highlight race on direct route load"
```

---

## Task 6: Remove the now-fully-replaced legacy pieces

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: no behavior change — this is cleanup of code paths Tasks 3-4 made unreachable.

- [ ] **Step 1: Confirm no remaining references to the dead global**

Run: `grep -n "_migrationRedirectStep" src/App.tsx`
Expected: no matches (Task 4 replaced both uses).

- [ ] **Step 2: Confirm no remaining raw `setActiveStep` prop-passes**

Run: `grep -n "setActiveStep={setActiveStep}\|onNavigateStep={(step) => setActiveStep" src/App.tsx`
Expected: no matches (Task 3 replaced all of them with `navigateToStep`).

- [ ] **Step 2b: Confirm no remaining direct `setActiveStep(N)` calls (Task 3 Step 5's amendment)**

Run: `grep -n "setActiveStep([0-9]" src/App.tsx`
Expected: no matches — Task 3 Step 5 converted all 13 of these (auto-forward effect, guest expiry, 6 keyboard shortcuts, `acceptExtractedData`, `onLogout`, sticky continue button, celebration button) to `navigateToStep`. Also run `grep -n "onBackToHome={() => setStep('HOME')}" src/App.tsx` (no trailing `navigate(HOME_PATH)`) — expect no matches, since Task 3 Step 5 item 5 added the `navigate(HOME_PATH)` call alongside it.

- [ ] **Step 3: Type-check and build**

Run: `npx tsc --noEmit && npm run build`
Expected: both succeed. If `tsc` now flags `setActiveStep` (the raw store setter) as unused because every consumer goes through `navigateToStep`, that's expected — `navigateToStep` still calls it internally (Task 3, Step 1), so it isn't actually dead, just no longer passed around directly.

- [ ] **Step 4: Commit**

```bash
git commit --allow-empty -m "chore: confirm legacy activeStep wiring fully replaced by routing"
```

(An empty commit is fine here if Steps 1-2 found nothing to change — it marks the checkpoint in history.)

---

## Task 7: Full verification pass and AI Copilot context check

**Files:**
- No file changes expected unless a bug is found.

**Interfaces:**
- Consumes: nothing new.

- [ ] **Step 1: Run the full verify script**

Run: `npx tsc --noEmit` and `npm run build` (there is no `npm run verify` or `npm run check:classes` script in this repo — see the Global Constraints amendment note).
Expected: `tsc --noEmit` reports no new errors beyond the pre-existing baseline of 8, and `npm run build` is fully clean.

- [ ] **Step 2: Click through every route from a cold start**

Starting from a cleared `localStorage` (fresh guest), walk: `/` → Launch Sandbox → `/dashboard` → click every sidebar item once, confirming both the URL and the rendered screen match the Global Constraints table each time.

- [ ] **Step 3: Verify AI Copilot context still reports the correct screen**

Open the AI Copilot on at least two different routes (e.g. `/vault` and `/recommendations`) and check its behavior reflects awareness of the current screen (per `PromptBuilder.ts:32`'s `Current Application Step/Location: ${currentStep}` line in the system prompt) — since Task 3's sync effect keeps `currentStep` accurate, this should need no code changes; this step exists to confirm that assumption holds, not to implement anything.

- [ ] **Step 4: Verify the three deployment environments' SPA fallback assumption**

This was verified by reading `server.ts` and `vercel.json` while writing this plan (see Global Constraints) but re-confirm locally: build the app (`npm run build`), run it in production mode (`NODE_ENV=production npm start` or equivalent — check `package.json`'s `start` script), navigate directly to `http://localhost:PORT/vault`, and refresh. Expect the Document Vault screen to load, not a 404 or blank page.

- [ ] **Step 5: Commit the verification checkpoint**

```bash
git commit --allow-empty -m "chore: full routing verification pass complete"
```

- [ ] **Step 6: Open a PR**

At this point the core H-04 problem (no back button, no deep links, no refresh-safety) is fixed. Stop here and open a PR rather than continuing straight into Task 8 — Task 8 is a separate, larger, higher-risk piece of work (see its description) that deserves its own review cycle.

---

## Task 8 (optional, separate follow-up): Split `App.tsx`'s per-step blocks into real route files

**This task is intentionally left unscheduled in detail.** Tasks 1-7 fix the actual user-facing and AI-context problems H-04 described. Shrinking `App.tsx` from 1,591 lines by extracting each `{activeStep === N && (...)}` block (lines ~996-1138, per Global Constraints) into its own file under `src/routes/` and switching from manual conditional rendering to `<Routes><Route path="/vault" element={<VaultRoute />} /></Routes>` is a legitimate further improvement, but it:

- Touches the actual screen-rendering JSX (not just navigation wiring), which is a different and larger risk surface than Tasks 1-7.
- Needs to preserve the existing `AnimatePresence` cross-fade behavior between steps (Global Constraints), which `<Routes>` does not do automatically — likely needs `location.pathname` used as the `AnimatePresence` key at the `<Routes>` level, which has its own edge cases with React Router's normal unmount/remount timing.
- Should be scoped as its own plan once Tasks 1-7 have been in production for a while and have proven stable, not bundled into the same PR.

If picking this up later, start a fresh planning pass rather than assuming the shape above — re-verify the current line numbers and behavior of the `AnimatePresence` block first, since Tasks 1-7 will have shifted them.

---

## Self-Review Notes

(Completed while writing this plan, kept here for the next reader's confidence in the facts above.)

- **Spec coverage:** H-04's three stated symptoms — no back button, no deep link, no refresh-safety — are each explicitly addressed and verified in Task 3 (Steps 6-7) and Task 7 (Steps 2, 4). The stated cause (App.tsx bloat) is explicitly deferred to Task 8 with reasoning for why, not silently dropped.
- **Placeholder scan:** No "TBD"/"handle appropriately" phrasing was used. The one place this plan asks the executor to *read code before writing code* (Task 3 Step 4's note about `setStep`'s exact behavior, and Task 4 Step 1's "read both call sites in full") is a deliberate instruction to verify a fact this plan could not fully pin down without executing it — not a placeholder for missing work, since the actual replacement code is still given in full.
- **Type consistency:** `navigateToStep`, `pathForStep`, `stepForPath`, and `HOME_PATH` are named and typed identically everywhere they're introduced (Task 2) and consumed (Tasks 3-4).
