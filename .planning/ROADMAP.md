# Roadmap: Halo

## Overview

Halo is built in five phases that go horizontal-layers-first: phase 1 lands the cross-cutting Pendo plumbing, the versioned localStorage envelope, the provider stack, the `data-pendo-id` selector registry, and the public/`/app` route split — none of which any page can be retrofitted onto cleanly. Phase 2 builds the multi-step registration funnel and sign-in/sign-out so the *first* real `pendo.identify` fires end-to-end against a measurable anonymous-to-known transition. Phase 3 ships the authenticated AppShell and Dashboard, giving every subsequent page a chrome to live in. Phase 4 delivers the three core interactive pages (Lists, Settings, Reports) — by the end of which all four Pendo pillars (events/funnels, guides, feature adoption, Session Replay) are exercisable at v1 baseline. Phase 5 closes coverage with Team and Help (Resource Center anchor), cross-page polish, idempotent seeding, and a final "Looks Done But Isn't" audit.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Cross-Cutting Contracts** - Scaffold + provider stack + Pendo plumbing + versioned localStorage + selector registry + route split
- [ ] **Phase 2: Registration, Sign-In & First Pendo Identify** - Four-URL signup wizard + sign-in/out with the anonymous-to-known `pendo.identify` transition working end-to-end
- [ ] **Phase 3: Authenticated Shell & Dashboard** - AppShell (side nav + top bar + user menu) + post-sign-in Dashboard with stat cards, SVG charts, time range, and activity feed
- [ ] **Phase 4: Core Pages (Lists, Settings, Reports)** - Task CRUD, settings tabs with metadata sync, reports with CSV export — all four Pendo pillars exercisable
- [ ] **Phase 5: Team, Help & Polish** - Team invite/role flows, searchable Help with Resource Center anchor, cross-page polish, idempotent seeding, demo-ready audit

## Phase Details

### Phase 1: Foundation & Cross-Cutting Contracts
**Goal**: A runnable Halo skeleton has every cross-cutting Pendo, storage, and routing contract installed *before* any page is built — retrofitting these later is far more expensive than installing them upfront.
**Depends on**: Nothing (first phase)
**Requirements**: FND-01, FND-02, FND-03, FND-04, FND-05, FND-06, FND-07, PEN-01, PEN-02, PEN-06, PEN-07, PEN-08, PEN-09
**Success Criteria** (what must be TRUE):
  1. `npm run dev` boots a Halo-branded Mantine-themed app at a History-API URL with no console errors, a visible public layout, and a "Demo data only — never enter real credentials" banner
  2. On first load, Pendo is initialized exactly once with an anonymous visitor (verifiable: a `data?...` request fires from the Pendo agent and `window.pendo.getVisitorId()` returns a stable anonymous ID across reloads)
  3. Every navigation between public routes emits a `pendo.location.setUrl(window.location.href)` call (verifiable in the Network tab and in `PendoRouteBridge`)
  4. The `PENDO_IDS` TypeScript registry exists and is the only source of `data-pendo-id` values; the UI primitive wrappers forward `data-pendo-id` to the DOM without baking values in
  5. The `halo:v1:meta` key is created on first boot with `{ schemaVersion, seededAt, appVersion }`, every storage read is Zod-validated with a safe fallback, and the API key is loaded from `import.meta.env.VITE_PENDO_API_KEY` (with `.env.example` checked in, `.env` gitignored)
**Plans**: TBD

### Phase 2: Registration, Sign-In & First Pendo Identify
**Goal**: The canonical Pendo funnel demo is live — a four-step registration wizard whose every step has its own URL, plus sign-in/sign-out — so the first real `pendo.identify` fires end-to-end with verifiable anonymous-to-known continuity.
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, AUTH-08, AUTH-09, AUTH-10, AUTH-11, AUTH-12, PEN-03
**Success Criteria** (what must be TRUE):
  1. A new user can complete a four-step signup at `/signup`, `/signup/details`, `/signup/company`, `/signup/preferences` — each step lives at its own URL, browser back/forward/refresh work, and invalid input blocks advance with inline RHF + Zod errors
  2. On completing step 4, a visitor + workspace record is written to localStorage (with the password SHA-256 hashed via `crypto.subtle.digest`), the user is signed in, redirected into the authenticated area, and `pendo.identify` fires exactly once with the new visitor + account metadata (verifiable in the Pendo network call payload)
  3. A returning user can sign in at `/signin` with their email + password and the authenticated session is restored on browser refresh from localStorage
  4. Sign-out from anywhere clears the in-memory session, resets Pendo identity (`pendo.clearSession()` or hard reload), returns the user to the public landing, and a fresh sign-in never inherits stale identity from the prior session
  5. The `RequireAuth` guard redirects unauthenticated users from `/app/*` to `/signin`, and the `RequireAnon` guard redirects authenticated users away from `/signup*` / `/signin` to `/app`
**Plans**: TBD
**UI hint**: yes

### Phase 3: Authenticated Shell & Dashboard
**Goal**: Every authenticated route lives in a real SaaS chrome (Mantine AppShell with persistent side nav + top bar + user menu), and the post-sign-in landing is a believable Dashboard that proves SVG charting and empty-state guide anchors work.
**Depends on**: Phase 2
**Requirements**: SHELL-01, SHELL-02, SHELL-03, SHELL-04, DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06
**Success Criteria** (what must be TRUE):
  1. After sign-in the user lands on a Dashboard route inside a Mantine AppShell with a persistent left side nav (Dashboard, Lists, Reports, Team, Settings, Help — active route visually indicated) and a top bar showing the workspace name and a user menu (Profile / Settings / Sign Out)
  2. Refreshing on any `/app/*` route deep-links back to that exact route (no fallback to root)
  3. The Dashboard shows 4–6 KPI stat cards computed from seeded task data, a recent-activity feed, and a friendly empty state when no tasks exist
  4. The Dashboard renders at least two Recharts SVG charts (one bar/area + one pie/donut) — every chart is SVG, no canvas anywhere — and a time-range selector (7 / 30 / 90 days) re-filters all stats and charts
  5. Every side-nav item, top-bar control, and user-menu item carries a stable `data-pendo-id` from the `PENDO_IDS` registry
**Plans**: TBD
**UI hint**: yes

### Phase 4: Core Pages (Lists, Settings, Reports)
**Goal**: The three highest-leverage interactive pages ship so all four Pendo pillars (events/funnels, guides, feature adoption, Session Replay) are exercisable at v1 baseline, and Settings sync + sign-out reset close the Pendo identity lifecycle.
**Depends on**: Phase 3
**Requirements**: LIST-01, LIST-02, LIST-03, LIST-04, LIST-05, LIST-06, LIST-07, LIST-08, LIST-09, SET-01, SET-02, SET-03, SET-04, SET-05, SET-06, REP-01, REP-02, REP-03, REP-04, PEN-04, PEN-05
**Success Criteria** (what must be TRUE):
  1. At `/app/lists` the user can create, edit, mark complete/incomplete, and delete tasks via modal forms and inline controls; sort by any visible column; filter by status, priority, and assignee; see a friendly empty state when no tasks exist; and every mutation persists to localStorage and survives refresh
  2. At `/app/settings` the user can edit Profile (name, username, job title, role, location), Workspace (company name, size, industry, plan tier), and Preferences (including a light/dark theme toggle) across three tabs; every save persists to localStorage and triggers a `pendo.identify` (or `updateOptions`) call so Pendo metadata stays in sync
  3. A "Reset demo data" button in Settings (with a destructive-action confirmation modal) clears every `halo:v1:*` key and reloads the app to the public landing
  4. At `/app/reports` the user can filter task data by date range and at least one other dimension (assignee or status), view the filtered data in a TanStack Table with at least 5 columns and at least one SVG chart, and click "Export CSV" to download the filtered table as a client-side CSV blob
  5. Sign-out from the user menu resets Pendo identity (`pendo.clearSession()` or hard reload) so the next sign-in never inherits stale identity — verifiable by signing in as a different seeded visitor and confirming `pendo.getVisitorId()` returns the new ID
**Plans**: TBD
**UI hint**: yes

### Phase 5: Team, Help & Polish
**Goal**: Team and Help pages complete the v1 surface (account-scoped guides on Team, Pendo Resource Center anchor on Help), demo data seeds idempotently, and a final cross-page polish + "Looks Done But Isn't" audit confirms Halo is demo-ready.
**Depends on**: Phase 4
**Requirements**: TEAM-01, TEAM-02, TEAM-03, HELP-01, HELP-02, HELP-03, HELP-04, DATA-01, UI-01, UI-02, UI-03, UI-04
**Success Criteria** (what must be TRUE):
  1. At `/app/team` the user sees a list of seeded team members for the current workspace (name, email, role, last-active); can open an "Invite teammate" modal, fill in email + role, click Invite, and see the modal close with an "Invite sent" toast (no real email); and can change a teammate's role inline via a dropdown that persists to localStorage
  2. At `/app/help` the user can search at least six seeded articles by title/keyword (grouped by topic), click any article to open a detail view with body content, and click a persistent help anchor (a "?" floating button or top-bar help icon) suitable for the Pendo Resource Center to attach to
  3. On first sign-in for a brand-new workspace, faker-seeded tasks, team members, activity, and help articles populate the app; subsequent reloads do not clobber user mutations (idempotency gated by `meta.seededAt`)
  4. Every page that can be empty shows a polished empty state with a primary CTA (good guide anchors), every meaningful action (create/save/delete/invite) shows a toast, and every destructive action (delete task, reset demo data, remove member) shows a confirmation modal
  5. A manual "could this pass for a real B2B SaaS in a screenshot?" audit passes — consistent spacing/typography/color across all pages — and the "Looks Done But Isn't" checklist (routes deep-link, Pendo metadata syncs on Settings save, Replay masks passwords, no canvas charts, every interactive element has a `data-pendo-id`) is walked end-to-end and signed off
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Cross-Cutting Contracts | 0/TBD | Not started | - |
| 2. Registration, Sign-In & First Pendo Identify | 0/TBD | Not started | - |
| 3. Authenticated Shell & Dashboard | 0/TBD | Not started | - |
| 4. Core Pages (Lists, Settings, Reports) | 0/TBD | Not started | - |
| 5. Team, Help & Polish | 0/TBD | Not started | - |
