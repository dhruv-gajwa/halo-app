---
phase: 04-core-pages-lists-settings-reports
reviewed: 2026-05-15T00:00:00Z
depth: standard
files_reviewed: 36
files_reviewed_list:
  - src/main.tsx
  - src/App.tsx
  - index.html
  - src/pendo/PENDO_IDS.ts
  - src/tasks/now-ref.ts
  - src/tasks/assigneeOptions.ts
  - src/tasks/tasksRepo.ts
  - src/tasks/schemas.ts
  - src/tasks/types.ts
  - src/tasks/labels.ts
  - src/tasks/index.ts
  - src/auth/authRepo.ts
  - src/ui/primitives/Checkbox.tsx
  - src/ui/primitives/Textarea.tsx
  - src/ui/primitives/DatePickerInput.tsx
  - src/ui/primitives/index.ts
  - src/dashboard/Dashboard.tsx
  - src/tasks/components/TaskTable.tsx
  - src/tasks/components/TaskTable.module.css
  - src/tasks/components/TaskFiltersBar.tsx
  - src/tasks/components/TaskFormModal.tsx
  - src/tasks/components/DeleteConfirmModal.tsx
  - src/tasks/components/ListsEmptyState.tsx
  - src/tasks/components/FilteredEmptyState.tsx
  - src/routes/app/lists/ListsPage.tsx
  - src/settings/ProfileTab.tsx
  - src/settings/WorkspaceTab.tsx
  - src/settings/PreferencesTab.tsx
  - src/settings/ResetDemoDataModal.tsx
  - src/routes/app/settings/SettingsPage.tsx
  - src/reports/ReportsFiltersBar.tsx
  - src/reports/ReportsChart.tsx
  - src/reports/ReportsTable.tsx
  - src/reports/csvExport.ts
  - src/routes/app/reports/ReportsPage.tsx
  - package.json
findings:
  critical: 3
  blocker: 3
  warning: 9
  info: 5
  total: 17
status: issues_found
---

# Phase 4: Code Review Report

**Reviewed:** 2026-05-15T00:00:00Z
**Depth:** standard
**Files Reviewed:** 36
**Status:** issues_found

## Summary

Phase 4 delivers the Lists / Settings / Reports surfaces plus three new UI
primitives (Checkbox, Textarea, DatePickerInput), the tasks-repo writers,
and the shared `computeNowRef` / `getAssigneeOptions` helpers. Code is
generally well-structured, schema-driven, and consistent with Phase 2 and
Phase 3 idioms, but a small cluster of date-handling bugs and one mutation
hazard rise to the BLOCKER tier. The date bugs in particular are user-
visible (wrong displayed due-date on non-UTC machines, lost tasks in
Reports filtering) and need to be addressed before this phase ships.

The most consequential findings:

1.  **CR-01 (BLOCKER):** Due dates are written as UTC midnight (`new Date("YYYY-MM-DD").toISOString()`)
    but displayed via `dayjs(value).format('MMM D, YYYY')` (local time) — users
    west of UTC see the date one day earlier than what they picked, in every
    table that renders `task.dueDate`.
2.  **CR-02 (BLOCKER):** `ReportsChart` matches tasks to day buckets by `dayjs(t.createdAt).format('YYYY-MM-DD')` (local-time
    formatting), while `ReportsPage` filters tasks by `dayjs(t.createdAt).isBefore(dayjs(dateRange[0]).startOf('day'))`
    (also local) but the date inputs round-trip through `new Date("YYYY-MM-DD")`
    which produces UTC midnight — i.e., the chart and the filter use different
    notions of "what day is this task in," and tasks land in the wrong bar or
    drop off the chart entirely near day boundaries.
3.  **CR-03 (BLOCKER):** The status filter in `ReportsPage` treats an empty
    array as "match nothing" (line 86: `if (statusFilter.length === 0) return false`).
    Visually this looks like a feature (deselect-all → empty state), but the
    Status MultiSelect has no minimum-selection constraint and there is no
    "Clear filters" CTA in the empty-state branch, so a user who clicks the
    first chip's X without re-adding one is silently stranded at "No tasks
    match these filters."

A handful of WARNING-tier issues center on race-prone state, `as` casts that
hide type drift, and accidental coupling to the Reports table CSS module.
None of those are user-blocking, but most are one-line fixes and the patterns
they introduce will replicate if uncorrected.

## Critical Issues

### CR-01: Due dates persisted as UTC midnight render one day earlier than picked in non-UTC timezones

**File:** `src/tasks/components/TaskFormModal.tsx:218-227` (write) and `src/tasks/components/TaskTable.tsx:158-167`, `src/reports/ReportsTable.tsx:113-134` (read)

**Issue:**
`handleDueDateChange` converts the DatePickerInput's `"YYYY-MM-DD"` string to
an ISO datetime via `new Date(value).toISOString()`. Per ECMA-262, a bare
`"YYYY-MM-DD"` string is parsed as **UTC midnight**, so `"2026-05-15"`
becomes `"2026-05-15T00:00:00.000Z"`.

The display path then runs `dayjs(value).format('MMM D, YYYY')`. Dayjs (and
the underlying `Date`) format in the browser's **local** timezone. For any
user west of UTC (which is most North American users, including this
codebase's stated audience), `"2026-05-15T00:00:00.000Z"` formats as
`"May 14, 2026"` — i.e., the due date the user picked shows up as the day
before in both the Lists `TaskTable` and the Reports `ReportsTable` Due-date
column.

The reopen of the edit modal masks the bug: there, `dueDateValue` is the
first 10 chars of the stored ISO string (`.slice(0, 10)`), which still reads
back as `"2026-05-15"` — so the picker and the rendered cell disagree. CSV
export (`csvExport.ts:56`) hits the same `dayjs(...).format('YYYY-MM-DD')`
local-format path and is also affected.

**Fix:**
Either store the date as a pure `YYYY-MM-DD` string (preferred — schema
intent for `dueDate` is "a day," not "an instant") OR force UTC formatting
on read. Storing as a date-only string requires loosening the schema to
accept either form, which is invasive. The minimal fix is UTC-anchored
formatting at every read site:

```tsx
// src/tasks/components/TaskFormModal.tsx — write side
const handleDueDateChange = (value: string | null) => {
  if (value === null) {
    form.setValue('dueDate', null, { shouldValidate: false, shouldDirty: true })
    return
  }
  // Anchor explicitly to UTC midnight; existing code already does this implicitly
  // but be explicit so the intent is obvious to the read side.
  const iso = new Date(`${value}T00:00:00Z`).toISOString()
  form.setValue('dueDate', iso, { shouldValidate: false, shouldDirty: true })
}

// src/tasks/components/TaskTable.tsx — read side
{value ? dayjs(value).utc().format('MMM D, YYYY') : '—'}
// (requires `dayjs.extend(utc)` once at app boot, or use `new Date(value).toLocaleDateString('en-US', { timeZone: 'UTC', ... })`)

// src/reports/ReportsTable.tsx and src/reports/csvExport.ts — same .utc() patch
```

If `dayjs.extend(utc)` isn't desired, the cheapest portable alternative is
`(new Date(value)).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })`.

---

### CR-02: ReportsChart bucketing and ReportsPage date-range filter disagree on "what day a task is in"

**File:** `src/reports/ReportsChart.tsx:73-84` and `src/routes/app/reports/ReportsPage.tsx:75-91`

**Issue:**
Two distinct local/UTC mismatches collide in the Reports surface:

1.  `ReportsChart` builds day buckets with `dayjs(t.createdAt).format('YYYY-MM-DD')`
    (local time). A task created at `2026-05-15T02:00:00Z` formats as
    `"2026-05-14"` in UTC-3 and `"2026-05-15"` in UTC+0 — same task, different
    bucket.

2.  `ReportsPage`'s date-range filter operates on `dateRange[0]/[1]` which are
    `Date` objects produced by `new Date(value)` from a `"YYYY-MM-DD"` string
    (so UTC midnight). Then it runs
    `dayjs(t.createdAt).isBefore(dayjs(dateRange[0]).startOf('day'))`.
    `dayjs(utc_midnight_date).startOf('day')` resolves `.startOf('day')` in
    local time, so the filter boundary is local-midnight-of-(UTC-midnight-of-picked-date).
    For a user in UTC-3 who picks May 15, the lower bound is 2026-05-14 21:00
    local (= UTC midnight) → `.startOf('day')` → 2026-05-14 00:00 local. The
    result: a task created May 14 23:30 local time on a "May 15 → May 20"
    range filter is *included*, contradicting the user's intent.

The two systems also disagree with each other: a task could pass the
ReportsPage filter and still not land in any visible day bucket on the
chart (or vice versa), producing the visual "rows in the table, missing
bar on the chart" inconsistency.

**Fix:**
Pick one timezone convention everywhere (UTC is cleanest because the stored
ISO string is unambiguous) and apply it uniformly. The smallest patch:

```tsx
// ReportsChart.tsx — bucket key uses UTC
const dayTasks = tasks.filter(
  (t) => dayjs.utc(t.createdAt).format('YYYY-MM-DD') === ymd,
)
// (and build `start`/`end` from dayjs.utc(...) too)

// ReportsPage.tsx — compare against UTC day boundaries
if (
  dateRange[0] &&
  dayjs.utc(t.createdAt).isBefore(dayjs.utc(dateRange[0]).startOf('day'))
) {
  return false
}
```

The Dashboard already lives in UTC explicitly (`getUTCFullYear()` /
`getUTCMonth()` / `getUTCDate()` in `computeDayBuckets`, line 141-143 of
`Dashboard.tsx`). Make Reports match.

---

### CR-03: Deselecting every Status chip strands the user with no way out

**File:** `src/routes/app/reports/ReportsPage.tsx:71, 86` and `src/reports/ReportsFiltersBar.tsx:100-107`

**Issue:**
`DEFAULT_STATUS_FILTER` starts as `['todo', 'in_progress', 'done']` and the
filter predicate at line 86 returns `false` for every task whenever
`statusFilter.length === 0`. The Status `MultiSelect` accepts free deselection
(no `clearable={false}`, no `minSelected` constraint) and `ReportsTable`'s
empty state (line 200-207) renders "No tasks match these filters." with **no
clear-filters affordance** (in contrast to the Lists `FilteredEmptyState`,
which has a Clear filters anchor — line 34-42 of `FilteredEmptyState.tsx`).

The user-visible failure mode: click the X on each Status chip → table goes
blank → no obvious way to recover except guessing that re-selecting a status
restores rows. CSV export is also disabled in this state (`disabled={filteredTasks.length === 0}`
at line 106 of `ReportsPage.tsx`), compounding the dead-end feel.

**Fix:**
Either:

1.  Treat empty `statusFilter` as "all" (`if (statusFilter.length > 0 && !statusFilter.includes(t.status)) return false`),
    so deselect-all is semantically the same as having all checked — matches
    the Lists "All" Select idiom; or
2.  Constrain the MultiSelect to enforce at least one selection (`onChange` rejects empty arrays),
    OR add a "Clear filters" anchor to the Reports empty state that resets
    date range + assignee + status to defaults.

(1) is the smallest behavioral change and matches the spec's stated intent
that `DEFAULT_STATUS_FILTER` is "equivalent to no status filter."

```tsx
// ReportsPage.tsx
.filter((t) => {
  if (dateRange[0] && /* ... */) return false
  if (dateRange[1] && /* ... */) return false
  if (assignee !== 'all' && t.assignee?.id !== assignee) return false
  // Empty status = match all (matches "All" sentinel idiom from Lists).
  if (statusFilter.length > 0 && !statusFilter.includes(t.status)) return false
  return true
})
```

The file-level comment at lines 20-22 of `ReportsPage.tsx` will need an
update too — currently it claims "deselecting all yields the empty state"
as a designed behavior, which contradicts the user-rescue requirement.

---

## Warnings

### WR-01: TanStack column-definition useMemo depends on `onToggleComplete` but its identity is unstable

**File:** `src/tasks/components/TaskTable.tsx:103-179` and `src/routes/app/lists/ListsPage.tsx:146-151`

**Issue:**
`TaskTable`'s `columns` useMemo lists `[onEdit, onDelete, onToggleComplete]`
as dependencies. The parent `ListsPage` passes
`onToggleComplete={(task, nextDone) => { updateTask(...); refresh() }}` as an
**inline arrow** — a new function identity every render. Every time anything
in `ListsPage` triggers a re-render (filter change, refreshKey bump, route
revisit), `columns` recomputes from scratch, which causes TanStack to rebuild
its internal column model and forces a full re-render of every row. With ~20
tasks this is invisible; the issue is that the dependency array is providing
zero memoization benefit and the spec-locked comment "TanStack getSortedRowModel"
suggests memoization was the intent.

Same pattern in `onEdit` / `onDelete` (also inline arrows).

**Fix:**
Wrap the handlers in `useCallback` in `ListsPage.tsx`, or accept the
re-render and drop the useMemo (one or the other — the current state is the
worst of both worlds: a useMemo cost with no benefit).

```tsx
// ListsPage.tsx
const handleEdit = useCallback((task: Task) => setEditTask(task), [])
const handleDelete = useCallback((task: Task) => setDeleteTarget(task), [])
const handleToggleComplete = useCallback(
  (task: Task, nextDone: boolean) => {
    updateTask(workspaceId, task.id, { status: nextDone ? 'done' : 'todo' })
    refresh()
  },
  [workspaceId],
)
```

---

### WR-02: `useForm` is called after an early `if (!visitor) return null` — Rules-of-Hooks hazard

**File:** `src/settings/ProfileTab.tsx:81-94` and `src/settings/WorkspaceTab.tsx:82-93`

**Issue:**
Both `ProfileTab` and `WorkspaceTab` call `useAuthStore(...)`, then
**early-return** `null` when the visitor/workspace is missing, then call
`useForm(...)`. The inline comment in `ProfileTab.tsx` lines 75-80 acknowledges
this and claims "since the guard is render-time (not effect-time) and visitor
stability is established at module-init hydration, there is no Rules of
Hooks violation in practice." This is incorrect framing — the React linter
treats this as a violation because the *number of hooks called* differs
across renders. If `currentVisitor` ever flips between `defined` and
`undefined` while the component is mounted (e.g., a sign-out flow that
unmounts via route change vs. one that nulls the store first), React will
crash with "Rendered fewer hooks than expected."

The current AuthProvider hydrates module-init, which makes this *unlikely*
in practice — but `RequireAuth`'s redirect runs after a render, so there is
at least one render between sign-out and unmount where this matters. The
sign-out flow in `useAuthStore.signOut()` (Phase 2) sets visitor → null,
which causes a re-render, then RequireAuth redirects. That intermediate
render is the failure window.

**Fix:**
Move the guard *below* the hook calls, or hoist the conditional rendering
into a guard component that mounts the form-bearing inner component only
when state is present:

```tsx
export function ProfileTab() {
  const visitor = useAuthStore((s) => s.currentVisitor)
  if (!visitor) return null
  return <ProfileTabInner visitor={visitor} />
}

function ProfileTabInner({ visitor }: { visitor: Visitor }) {
  const form = useForm({ /* ... */ })
  // ... rest of the body
}
```

This eliminates the conditional-hook pattern entirely.

---

### WR-03: ReportsPage default date range is captured once and never refreshed

**File:** `src/routes/app/reports/ReportsPage.tsx:66-69`

**Issue:**
The lazy initializer `useState(() => [dayjs(nowRef).subtract(30, 'day').toDate(), dayjs(nowRef).toDate()])`
captures `nowRef` from the first render only. If the user navigates Lists →
creates a task → returns to Reports, the component remounts and the default
recomputes, so the practical impact is small. But:

-  If the user creates a task on Lists, then opens Reports in a **second
   tab**, the second tab sees the new task in `allTasks` but the date range
   already includes "today" via `dayjs()` baseline — fine.
-  If the user is on Reports when another tab creates a task, the
   `storage` event isn't wired up, so `allTasks` won't refresh until the
   user navigates away and back. The default date range will be stale
   relative to the now-newer `nowRef`. The user sees the task only if it
   falls inside the old window.

This is not a critical bug for the demo's intended single-tab usage but
combines awkwardly with WR-04 below.

**Fix:**
Acknowledge with a code comment, or accept a slightly more expensive
useEffect that re-syncs the default range when `allTasks` first transitions
from empty to non-empty:

```tsx
// Optional: realign the default window once tasks load (single-shot).
useEffect(() => {
  if (allTasks.length > 0) {
    // No-op for the demo; documented for future multi-tab work.
  }
}, [allTasks.length === 0])
```

---

### WR-04: `computeNowRef` silently returns `new Date(0)` (1970-01-01) when all timestamps are unparseable

**File:** `src/tasks/now-ref.ts:30-43`

**Issue:**
The function initializes `maxMs = 0`. If every parsed timestamp is `NaN`
(corrupt tasks survived schema validation somehow — say, a future schema
change that loosens `.iso.datetime()` to accept malformed strings), the
function returns `new Date(0)` — the Unix epoch. Downstream consumers
treat this as "now": the Dashboard's range start becomes 1969-12-02 (30
days before epoch) and the Reports default date range becomes
1969-12-02 → 1970-01-01.

Right now `TasksArraySchema` enforces `z.iso.datetime()` on each timestamp
so corrupt data trips schema validation upstream and `listTasks` returns
`[]` — which the function handles via the `tasks.length === 0` short-circuit.
The hazard is a deferred one (any future schema relaxation breaks this),
but the fix is cheap.

**Fix:**

```ts
export function computeNowRef(tasks: Task[]): Date {
  if (tasks.length === 0) return new Date()

  let maxMs = -Infinity
  for (const task of tasks) {
    // ... existing scan
  }
  return maxMs === -Infinity ? new Date() : new Date(maxMs)
}
```

`maxMs = -Infinity` plus the post-loop guard handles the "all NaN" case
cleanly without changing the happy path.

---

### WR-05: `dayCount = Math.max(end.diff(start, 'day') + 1, 1)` allows negative ranges to silently collapse

**File:** `src/reports/ReportsChart.tsx:69`

**Issue:**
If `dateRange[0] > dateRange[1]` (e.g., user picks end date before start
date, which Mantine's range picker generally prevents but **type='range'**
in v9 does not enforce in all interaction paths — drag-pick + manual entry),
`end.diff(start, 'day')` returns a negative number and `Math.max(..., 1)`
collapses the chart to a single day showing nothing. The user gets a blank
chart with no error or feedback.

**Fix:**
Swap the bounds if they're inverted, or render an explicit "invalid range"
message:

```ts
let [start, end] = dateRange[0] && dateRange[1]
  ? [dayjs(dateRange[0]), dayjs(dateRange[1])]
  : [today.subtract(30, 'day'), today]
if (start.isAfter(end)) [start, end] = [end, start]
const dayCount = end.diff(start, 'day') + 1
```

---

### WR-06: `dueDate` in `TaskFormSchema` rejects valid YYYY-MM-DD if Mantine ever emits one without round-tripping

**File:** `src/tasks/schemas.ts:107` and `src/tasks/components/TaskFormModal.tsx:218-227`

**Issue:**
`TaskFormSchema.dueDate` is `z.iso.datetime().nullable()`. Mantine v9
`DatePickerInput type='default'` returns a `DateStringValue` (`YYYY-MM-DD`).
The form value is only ever set via `handleDueDateChange` which converts the
string to a full ISO datetime before `form.setValue`. That works *as long
as `setValue` is the only mutation path*. But:

-  `form.register('dueDate')` is not used (Mantine wraps it controlled), so
   the form doesn't accidentally bind a raw input.
-  `form.reset()` in the edit modal feeds `initialTask.dueDate` (a full
   ISO datetime from the repo) → schema passes.
-  `form.reset()` in the create modal feeds `null` → schema passes.

The hazard is hypothetical, but the schema's strict ISO datetime constraint
means future contributors who try to assign a `YYYY-MM-DD` via `register`
will get a confusing "Enter a valid date" error rather than an explicit
type error. Either:

1.  Tighten the form to use a `Date | null` internal type and parse at
    save time, or
2.  Loosen the schema to accept either form and normalize in `tasksRepo`.

**Fix:**
Document the contract inline if (1)/(2) are out of scope; otherwise tighten
the internal value type so the conversion happens at exactly one place.

---

### WR-07: `assigneeOptions` re-runs `listTasks(workspaceId)` per render of every consumer

**File:** `src/tasks/assigneeOptions.ts:32-47` consumed by `src/tasks/components/TaskFiltersBar.tsx:61`, `src/tasks/components/TaskFormModal.tsx:138`, `src/reports/ReportsFiltersBar.tsx:60`

**Issue:**
`getAssigneeOptions` calls `listTasks(workspaceId)` synchronously, which
hits `readWithSchema` → `JSON.parse` → `TasksArraySchema.parse` on every
invocation. The three consumer components all call it inline in render
(no `useMemo`), so on every keystroke in a filter or modal field, the
entire task array is re-read from localStorage and re-validated against
the Zod schema. With ~30 tasks the cost is small; with ~500 (the demo's
implied upper bound) it's noticeable.

This is borderline-perf and the v1 scope excludes performance from review,
but the *correctness* side effect: every call to `listTasks` returns a
fresh array reference, so a `useMemo` keyed on `[allTasks, ...]` in
`ListsPage` cannot match — explaining why `eslint-disable-next-line
react-hooks/exhaustive-deps` is needed on line 75. Stash the result so
the memoization actually works.

**Fix:**
Either memoize `assigneeOptions` at the consumer with `useMemo`, or have
the consumer pass in `tasks` (already loaded for the table) and have the
helper derive from that array:

```ts
export function getAssigneeOptions(
  tasks: Task[],
  visitor: Visitor,
): Array<{ value: string; label: string }> { ... }
```

The signature change is contained — three call sites.

---

### WR-08: `as unknown as` casts in Settings `Select` onChange handlers paper over the type system

**File:** `src/settings/ProfileTab.tsx:165, 175` and `src/settings/WorkspaceTab.tsx:139, 149, 165, 175, 192, 202`

**Issue:**
The pattern `form.setValue('role', undefined as unknown as ProfileFormValues['role'], { ... })`
is repeated eight times across the two Settings tabs to handle Mantine's
`Select` returning `null` on clear. The `as unknown as` cast bypasses the
fact that `ProfileFormValues['role']` is typed as a non-nullable
`RoleEnum` value — the form's runtime state is now `undefined` while
TypeScript thinks it's a valid enum value, and the only thing preventing
a downstream crash is that Zod re-validates on submit.

The pattern is fragile: if a future contributor reads `form.getValues().role`
during the in-progress edit (e.g., a "smart default for related field" flow),
they get back `undefined` despite the type system promising otherwise. The
WR-02 inline comment claims "no `as` casts hiding type drift," but the
casts are doing exactly that.

**Fix:**
Make the form schema accept `undefined` explicitly for these optional-in-UI
fields:

```ts
const ProfileFormSchema = VisitorSchema.pick({ /* ... */ }).extend({
  role: VisitorSchema.shape.role.optional(),
})
```

Then `form.setValue('role', undefined, ...)` type-checks cleanly with no
casts. The Zod resolver will surface "Pick a role" on submit if it's still
undefined.

---

### WR-09: ReportsTable empty-state row uses `colSpan={columns.length}` but `columns` is the column-definition array, not the visible column count

**File:** `src/reports/ReportsTable.tsx:201-207`

**Issue:**
`<Table.Td colSpan={columns.length}>` works *as long as* no column is hidden
and no column is the leading-checkbox / trailing-actions display column.
For Reports the columns are all `helper.accessor(...)` (six of them) and the
arithmetic happens to match. But the pattern is fragile — adding a column
visibility toggle or a hidden column later would break the colSpan silently
(empty-state row doesn't span the full width → ugly layout).

**Fix:**
Use the live column count from TanStack:

```tsx
<Table.Td colSpan={table.getVisibleLeafColumns().length}>
```

---

## Info

### IN-01: `setSearchParams({ tab: ... })` blows away other query params on the Settings page

**File:** `src/routes/app/settings/SettingsPage.tsx:62`

**Issue:**
`setSearchParams({ tab: (v ?? 'profile') }, { replace: false })` replaces the
entire query-string with `{ tab }`. Any other params (none in Phase 4, but a
future Phase 6 might thread `?utm_*` markers for Pendo deep-link analytics)
are silently dropped on tab change.

**Fix:**
Use the functional setter:

```tsx
setSearchParams(
  (prev) => {
    const next = new URLSearchParams(prev)
    next.set('tab', v ?? 'profile')
    return next
  },
  { replace: false },
)
```

---

### IN-02: ResetDemoDataModal's localStorage iteration uses a `for` loop that's still index-shift-safe — but the two-pass comment understates the failure mode

**File:** `src/settings/ResetDemoDataModal.tsx:56-63`

**Issue:**
The inline comment says "Modifying localStorage during a `localStorage.key(i)`
iteration shifts indices and silently skips keys." True, and the two-pass
collect-then-remove avoids it. But the loop bound `i < localStorage.length`
is re-evaluated each iteration. If any other tab writes to localStorage
during the collection pass (a real possibility — `storage` events fire
cross-tab), `localStorage.length` grows mid-loop and the loop happily picks
up the new key, which may or may not be a `halo:v*` key. The current
implementation handles that gracefully (the `startsWith` filter excludes
unrelated keys) but the *order* of removal isn't guaranteed.

**Fix:**
No fix needed — just upgrade the comment so future contributors aren't
tempted to "optimize" the two-pass into a one-pass:

```ts
// We deliberately scan-then-remove in two passes:
//   1. Snapshot the key set first (mid-iteration writes from other tabs
//      can grow localStorage.length but won't break the prefix filter).
//   2. Remove from the snapshot — guarantees we touch each key exactly once
//      regardless of cross-tab churn.
```

---

### IN-03: Inconsistent imports — barrel vs. direct path

**File:** Multiple. `src/routes/app/lists/ListsPage.tsx:45-46` vs. `src/dashboard/Dashboard.tsx:37-39`

**Issue:**
Dashboard imports `listTasks`, `TASK_STATUS_LABELS`, and `Task` from
`'../tasks'` (barrel). ListsPage imports `listTasks, updateTask, deleteTask`
from `'../../../tasks/tasksRepo'` (direct path) and `Task` from
`'../../../tasks/types'`. Reports does similar mixed imports. The barrel
exists specifically to be the import target; using it inconsistently means
a future refactor of `src/tasks/index.ts` could miss the direct-path
consumers.

**Fix:**
Standardize on the barrel:

```ts
import { listTasks, updateTask, deleteTask, type Task } from '../../../tasks'
```

The barrel re-exports everything ListsPage and ReportsPage need.

---

### IN-04: `react-hooks/exhaustive-deps` is disabled for the refreshKey trick — acceptable but documented obliquely

**File:** `src/routes/app/lists/ListsPage.tsx:74-77`

**Issue:**
The `eslint-disable-next-line react-hooks/exhaustive-deps` exists because
`useMemo(() => listTasks(workspaceId), [workspaceId, refreshKey])` references
`refreshKey` only to invalidate, not to compute. ESLint flags this as a
phantom dependency. The pattern is correct (it's how React docs recommend
manual refresh tickers work), but the inline reason isn't documented.

**Fix:**
Replace the bare disable with an explanatory one:

```tsx
const allTasks = useMemo(
  // refreshKey is a manual cache-bust dependency — listTasks doesn't see it
  // as a variable, but we re-run the read whenever a CRUD mutation bumps it.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  () => (workspaceId ? listTasks(workspaceId) : []),
  [workspaceId, refreshKey],
)
```

---

### IN-05: ReportsTable imports `classes from '../tasks/components/TaskTable.module.css'` — tight coupling across feature directories

**File:** `src/reports/ReportsTable.tsx:57`

**Issue:**
Reports' read-only table reaches across the directory tree into
`tasks/components/TaskTable.module.css` for cell padding styles. If the
Lists table ever needs distinct cell padding (or the file moves during a
refactor), the cross-cut breaks Reports silently. The shared concern is
"Halo table cell padding," which doesn't conceptually belong to Lists.

**Fix:**
Hoist the shared CSS module into `src/ui/primitives/Table.module.css` (or
similar) and import from there in both places. Optional for v1, but worth
flagging now before the pattern replicates.

---

_Reviewed: 2026-05-15T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
