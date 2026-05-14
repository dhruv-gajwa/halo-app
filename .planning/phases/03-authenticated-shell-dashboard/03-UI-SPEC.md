---
phase: 3
slug: authenticated-shell-dashboard
status: draft
shadcn_initialized: false
preset: not applicable
created: 2026-05-14
---

# Phase 3 — UI Design Contract

> Visual and interaction contract for the Mantine AppShell (persistent side nav + top bar + user menu) and the Dashboard page at `/app`. Phase 3 also adds five placeholder routes (`/app/lists`, `/app/reports`, `/app/team`, `/app/settings`, `/app/help`) each rendering a shared `<ComingSoonCard>`, and installs the task data layer + seeder.

This contract inherits 100% of its primitives, tokens, and markup conventions from Phase 2 (which inherited from Phase 1). Phase 3 extends with three new PENDO_IDS namespaces (`nav`, `topbar`, `dashboard`), a fourth shared component namespace (`comingSoon`), and the AppShell-specific layout rules documented below. It MUST NOT redefine theme tokens, change the DemoBanner, or alter any existing `src/ui/primitives/*` wrappers beyond adding `NavLink.tsx`.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | **none** — Mantine 9 is locked by CLAUDE.md and Phase 1; shadcn is explicitly not used |
| Preset | not applicable |
| Component library | **Mantine 9.2.0** (`@mantine/core`, `@mantine/hooks`) — already installed and wired via `MantineProvider theme={haloTheme}` in `src/App.tsx`. New Mantine components used in Phase 3: `AppShell`, `NavLink`, `Avatar`, `Menu`, `UnstyledButton`, `SegmentedControl`, `SimpleGrid`, `Timeline`, `Timeline.Item`. **All interactive primitives MUST go through `src/ui/primitives/*`; raw Mantine `Button`/`TextInput`/`Anchor` in page code are FORBIDDEN (PEN-07).** Phase 3 adds one new wrapper: `NavLink.tsx`. `MenuTrigger.tsx` is optional — acceptable to forward `data-pendo-id` via `<Menu.Target>` props if the wrapper approach adds unnecessary ceremony; planner decides. |
| Icon library | **`@tabler/icons-react` 3.44.0** — already installed. Phase 3 icons: `IconLayoutDashboard`, `IconChecklist`, `IconChartBar`, `IconUsers`, `IconSettings`, `IconHelpCircle` (side nav); `IconChevronDown` (user menu trigger); `IconUser`, `IconLogout` (user menu items, alongside `IconSettings` reused); `IconCheck`, `IconEdit`, `IconPlus` (activity feed); `IconClipboardCheck` (empty state). Icon size in nav: 18px, `stroke={1.6}`. Icon size in menu items: 16px. |
| Chart library | **`recharts` ^2.x** — new runtime dep installed in Phase 3. Approved by docs/CONVENTIONS.md §2 (SVG mandate). `<AreaChart>` for completed-per-day; `<PieChart>` for by-status donut. No canvas chart surfaces anywhere. |
| Font | **Inter** with system fallback chain `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` — locked in `src/theme.ts`. Phase 3 MUST NOT install a webfont or change the font family. |

**New primitive added in Phase 3** — mirrors existing wrapper contract:

| Primitive | Wraps | Why needed | Forwarded prop |
|-----------|-------|------------|----------------|
| `NavLink.tsx` | `@mantine/core` `NavLink` | Side-nav items must carry `data-pendo-id` from PENDO_IDS registry; `NavLink` is not yet wrapped | `pendoId: PendoId` → `data-pendo-id` on root element |

---

## Spacing Scale

Phase 3 inherits Mantine 9's named spacing tokens without change. The same accepted deviation from strict 4-multiple values applies (see Phase 2 UI-SPEC §Spacing for rationale).

| Mantine token | Pixel value | Usage in Phase 3 |
|---------------|-------------|------------------|
| `xs` | **10px** | Icon gap inside nav items (icon ↔ label); menu-item icon ↔ text |
| `sm` | **12px** | KPI card label-to-value gap; timeline body text top-margin |
| `md` | **16px** | AppShell `padding="md"` (main content inset); `SimpleGrid` gap for KPI cards; inner Paper padding on KPI cards; chart Paper inner padding |
| `lg` | **20px** | Gap between chart row and KPI row; gap between activity feed header and items |
| `xl` | **32px** | Dashboard section-to-section vertical gap; ComingSoonCard Paper `p="xl"` |

**Hard rules (inherited):**
- Raw pixel values are FORBIDDEN in Phase 3 markup. Every spacing prop references a Mantine token.
- Exception: icon `size={18}`, `size={16}`, `size={64}` props on `@tabler/icons-react` — Tabler accepts pixel numbers, not tokens.
- The AppShell fixed dimensions (`navbar={{ width: 240 }}`, `header={{ height: 56 }}`) are structural, not spacing — expressed in the Mantine `AppShell` config props, not as CSS margin/padding overrides.

---

## Typography

Phase 3 inherits the four-role, two-weight typography system from Phase 2. No new sizes or weights are introduced.

| Role | Mantine API | Size | Weight | Line Height | Where used in Phase 3 |
|------|-------------|------|--------|-------------|----------------------|
| Display | `<Title order={1}>` | **34px** | **600** | 1.3 | Not used in Phase 3 — AppShell has no page-level Display title. The "Halo" wordmark uses `<Text fw={600} size="lg">` (see Topbar, below). |
| Heading | `<Title order={2}>` | **26px** | **600** | 1.35 | Dashboard section headings ("Overview", "Completed per day", "Tasks by status", "Recent activity"); `<ComingSoonCard>` feature-name heading (uses `<Title order={3}>` — see note). |
| Body | `<Text size="md">` (default) | **16px** | **400** | 1.55 | ComingSoonCard one-line description; Dashboard intro text (if any); empty state body copy. |
| Label | `<Text size="sm">` / `<Text size="xs">` | **14px / 12px** | **400 / 400** | 1.45 | KPI card label (`<Text size="xs" c="dimmed" tt="uppercase">`); KPI value (`<Title order={2}>`); nav item labels; top-bar workspace name (`<Text size="sm" c="dimmed">`); user name in trigger (`<Text size="sm" fw={500}>`); timeline event text (`<Text size="sm">`); relative time stamps (`<Text size="xs" c="dimmed">`). |

**Phase 3 typography notes:**

1. `<ComingSoonCard>` uses `<Title order={3}>` (not order={2}) to avoid over-weighting placeholder content. `order={3}` is approximately 22px in Mantine 9 — within the Heading role range, acceptable as a sub-heading variant. This is the ONLY use of `order={3}` in Phase 3.
2. The "Halo" wordmark in the top bar uses `<Text fw={600} size="lg" c="indigo.7">` — `size="lg"` is Mantine's 20px text size. This is a one-off branding treatment, not a new typography role.
3. No `fw={700}` anywhere in Phase 3 (inherited rule from Phase 2).
4. No 5th font size. If copy doesn't fit the four roles, rewrite the copy.

---

## Color

Phase 3 inherits the locked indigo-on-light-neutral palette from Phase 2 with one new exception: the active NavLink state.

| Role | Mantine token | Approximate hex | Usage |
|------|---------------|-----------------|-------|
| **Dominant (60%)** | `--mantine-color-body` (light) | **`#ffffff`** | AppShell main area background; page background behind all content |
| **Secondary (30%)** | `<Paper withBorder>` surface — `gray.0` fill, `gray.3` border | Surface **`#f8f9fa`**, border **`#dee2e6`** | KPI stat cards; chart containers; ComingSoonCard; AppShell navbar background (Mantine AppShell default for `navbar` section is `--mantine-color-body`, which is white — the visual separation comes from the right-side border, not a fill color change) |
| **Accent (10%)** | `indigo.6` / `indigo` (primary) | **`#4263eb`** | See "Accent reserved for" below |
| **Destructive** | `red.6` | **`#fa5252`** | Sign-out is the one potentially destructive action in Phase 3 — it is a one-click menu item with NO confirmation modal (same as Phase 2 rule: sign-out is reversible, no data is destroyed). No destructive color treatment on sign-out menu item (`color` prop omitted — renders as default text). Phase 3 introduces no other destructive actions. |
| **Muted text** | `c="dimmed"` | **`#868e96`** | KPI card labels; workspace name in top bar; timeline timestamps; chart axis labels; ComingSoonCard description; empty-state body copy |
| **Banner** | `color="orange"` | **`#fd7e14`** | DemoBanner — Phase 1 lock, untouched. NOTE: DemoBanner only appears on PublicLayout. AppShell (authenticated area) does NOT render the DemoBanner. |

**Accent (indigo) reserved for — exhaustive list for Phase 3. NOTHING ELSE may use indigo:**

1. Active NavLink state: `variant="light"` on Mantine `<NavLink>` renders `indigo.0` tinted background with `indigo.7` text for the active route item. This is the ONE new indigo surface added in Phase 3 — a deliberate, documented exception to the Phase 2 rule that prohibited `bg="indigo.0"`. The exception is limited strictly to `NavLink` `variant="light"` active state; no other element in Phase 3 uses indigo as a background fill.
2. "Halo" wordmark: `c="indigo.7"` — branding treatment on the top-bar text only.
3. Avatar in user menu trigger: `color="indigo"` on Mantine `<Avatar>` — generates the indigo initials avatar automatically.
4. Area chart fill: `indigo.6` stroke at 100% + `indigo.6` fill at 60% opacity — chart-only, inside the chart SVG container.
5. "In progress" donut segment: `indigo.6` — inside the PieChart SVG container only.
6. "To do" donut segment: `indigo.3` — inside the PieChart SVG container only.
7. Dashboard empty-state CTA button: `variant="filled"` (Mantine default for `primaryColor="indigo"`) — exactly one CTA, same rule as Phase 2 primary submit buttons.
8. Timeline "created" event bullet: `color="green.6"` (completed) / `color="gray.6"` (updated) / `color="indigo.6"` (created) — limited to Timeline.Item `color` prop; not a background on page layout.

**Forbidden uses of indigo in Phase 3:**
- Any background tinting on KPI cards, chart wrappers, or ComingSoonCard containers (`bg="indigo.0"` etc. is forbidden except the NavLink active state above).
- NavLink inactive state — must render without indigo treatment.
- ComingSoonCard icon — uses `c="gray.4"` explicitly (D-02 decision).
- Top-bar `<Menu>` item labels — default text color, no indigo override.
- KPI card values — `<Title order={2}>` at default body color, not indigo.

**Light / dark color scheme:** Phase 3 is **light scheme only**. The theme toggle is Phase 4 (SET-04). Phase 3 MUST NOT use `useComputedColorScheme`.

**Shadow rule:** The Phase 2 "no shadows" rule is conditionally relaxed for AppShell in Phase 3. If Mantine's `AppShell` default renders a `box-shadow` on the navbar or header edge (Mantine 9 does apply a subtle shadow to the header by default), **accept it as a Mantine default** — do not fight the component's built-in visual affordances. Do not add `shadow` props to KPI cards, chart containers, or any non-AppShell element. `withBorder` remains the Phase 3 surface-separation convention for all non-AppShell `<Paper>` components.

---

## Layout

### AppShell structure

```
┌─────────────────────────────────────────────────────────────────┐
│  Header (height: 56px, full-width)                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ [240px col]  Halo wordmark                               │   │
│  │ [flex spacer]                                            │   │
│  │                    workspace name  [Avatar+Name ▾] menu  │   │
│  └──────────────────────────────────────────────────────────┘   │
├─────────────┬───────────────────────────────────────────────────┤
│  Navbar     │  Main content area (padding="md")                 │
│  240px      │                                                   │
│             │  <Outlet /> — Dashboard / Placeholder routes      │
│  NavLink:   │                                                   │
│  Dashboard  │                                                   │
│  Lists      │                                                   │
│  Reports    │                                                   │
│  Team       │                                                   │
│  Settings   │                                                   │
│  Help       │                                                   │
│             │                                                   │
└─────────────┴───────────────────────────────────────────────────┘
```

**AppShell config (verbatim):**
```
<AppShell
  navbar={{ width: 240, breakpoint: 'sm' }}
  header={{ height: 56 }}
  padding="md"
>
```

- **Desktop-only:** No `<Burger>` component. No mobile drawer. Demos run on desktop. The AppShell collapses at `breakpoint: 'sm'` (576px) — this is Mantine's built-in behavior; Phase 3 does NOT add a hamburger to handle the collapse. Below sm, the nav will collapse per Mantine default. This is acceptable for a demo-only surface.
- **No DemoBanner in AppShell:** The `DemoBanner` (FND-06) renders only in `PublicLayout`. Authenticated routes inside `AppShell` do NOT show the DemoBanner.

### Navbar contents

```
<AppShell.Navbar p="md">
  <Stack gap="xs">
    <NavLink label="Dashboard"   leftSection={<IconLayoutDashboard size={18} stroke={1.6} />} active={...} variant="light" pendoId={PENDO_IDS.nav.dashboard} />
    <NavLink label="Lists"       leftSection={<IconChecklist size={18} stroke={1.6} />}       active={...} variant="light" pendoId={PENDO_IDS.nav.lists} />
    <NavLink label="Reports"     leftSection={<IconChartBar size={18} stroke={1.6} />}         active={...} variant="light" pendoId={PENDO_IDS.nav.reports} />
    <NavLink label="Team"        leftSection={<IconUsers size={18} stroke={1.6} />}            active={...} variant="light" pendoId={PENDO_IDS.nav.team} />
    <NavLink label="Settings"    leftSection={<IconSettings size={18} stroke={1.6} />}         active={...} variant="light" pendoId={PENDO_IDS.nav.settings} />
    <NavLink label="Help"        leftSection={<IconHelpCircle size={18} stroke={1.6} />}       active={...} variant="light" pendoId={PENDO_IDS.nav.help} />
  </Stack>
</AppShell.Navbar>
```

Active detection logic (one helper function):
- `/app` (exact) → Dashboard active
- `pathname.startsWith('/app/lists')` → Lists active
- `pathname.startsWith('/app/reports')` → Reports active
- `pathname.startsWith('/app/team')` → Team active
- `pathname.startsWith('/app/settings')` → Settings active
- `pathname.startsWith('/app/help')` → Help active

### Header contents

```
<AppShell.Header>
  <Group h="100%" px="md" justify="space-between">
    {/* Left: wordmark aligned to navbar column width */}
    <Box w={208}>  {/* 240px navbar - md padding on each side = ~208px */}
      <Text fw={600} size="lg" c="indigo.7" data-pendo-id={PENDO_IDS.topbar.logo}>
        Halo
      </Text>
    </Box>
    {/* Right: workspace name + user menu trigger */}
    <Group gap="md">
      <Text size="sm" c="dimmed" data-pendo-id={PENDO_IDS.topbar.workspaceName}>
        {workspace?.companyName ?? ''}
      </Text>
      <Menu>
        <Menu.Target>
          <UnstyledButton data-pendo-id={PENDO_IDS.topbar.userMenu.button}>
            <Group gap="xs">
              <Avatar size="sm" color="indigo" radius="xl">{initials}</Avatar>
              <Text size="sm" fw={500}>{visitor.firstName} {visitor.lastName}</Text>
              <IconChevronDown size={14} />
            </Group>
          </UnstyledButton>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item leftSection={<IconUser size={16} />}     data-pendo-id={PENDO_IDS.topbar.userMenu.profile}  onClick={...}>Profile</Menu.Item>
          <Menu.Item leftSection={<IconSettings size={16} />} data-pendo-id={PENDO_IDS.topbar.userMenu.settings} onClick={...}>Settings</Menu.Item>
          <Menu.Divider />
          <Menu.Item leftSection={<IconLogout size={16} />}   data-pendo-id={PENDO_IDS.topbar.userMenu.signout}  onClick={...}>Sign out</Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  </Group>
</AppShell.Header>
```

Initials: `visitor.firstName[0].toUpperCase() + visitor.lastName[0].toUpperCase()`.
`Menu.Item` color for Sign out: **no `color` prop** (default text, not red) — sign-out is reversible, no destructive color treatment.

### Dashboard page layout

```
<Stack gap="xl">
  {/* Time-range control — top-right aligned */}
  <Group justify="flex-end">
    <SegmentedControl
      data={{ value: '7', label: '7d' }, { value: '30', label: '30d' }, { value: '90', label: '90d' }}
      defaultValue="30"
      data-pendo-id={PENDO_IDS.dashboard.timeRange}
    />
  </Group>

  {/* KPI cards */}
  <SimpleGrid cols={{ base: 1, sm: 2, md: 5 }} gap="md">
    {/* 5× KPI Paper — see KPI card spec below */}
  </SimpleGrid>

  {/* Charts row */}
  <SimpleGrid cols={{ base: 1, md: 2 }} gap="md">
    {/* Area chart Paper */}
    {/* Donut chart Paper */}
  </SimpleGrid>

  {/* Activity feed */}
  <Paper withBorder p="md" radius="md">
    <Text fw={600} mb="lg">Recent activity</Text>
    <Timeline active={-1} bulletSize={24} lineWidth={2}>
      {/* 8× Timeline.Item — see Activity spec below */}
    </Timeline>
  </Paper>
</Stack>
```

When `listTasks(workspaceId).length === 0`: render empty state instead of all of the above (see Empty State section).

### KPI card layout (×5)

```
<Paper withBorder p="md" radius="md" data-pendo-id={PENDO_IDS.dashboard.kpi.[name]}>
  <Text size="xs" c="dimmed" tt="uppercase" mb="sm">{label}</Text>
  <Title order={2}>{value}</Title>
</Paper>
```

| KPI | Label | Value logic | Pendo ID leaf |
|-----|-------|-------------|---------------|
| Active tasks | `Active tasks` | count where `status !== 'done'` (no time filter) | `kpi.active` |
| Completed in range | `Completed in range` | count where `completedAt` falls within selected window | `kpi.completedInRange` |
| Overdue | `Overdue` | count where `status !== 'done'` AND `dueDate < nowRef` (no time filter) | `kpi.overdue` |
| Completion rate | `Completion rate` | `completedInRange / (completedInRange + createdInRange still open)` as `"42%"` or `"—"` | `kpi.completionRate` |
| Avg cycle time | `Avg cycle time` | mean `(completedAt - createdAt)` in days for tasks completed in range, as `"2.3d"` or `"—"` | `kpi.avgCycleTime` |

### Area chart layout

```
<Paper withBorder p="md" radius="md" data-pendo-id={PENDO_IDS.dashboard.chart.completedPerDay}>
  <Text fw={600} mb="md">Completed per day</Text>
  <AreaChart width={...} height={240} data={buckets}>
    <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-gray-2)" />
    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
    <YAxis tick={{ fontSize: 12 }} />
    <Tooltip />
    <Area type="monotone" dataKey="count" stroke="#3b5bdb" fill="#4263eb" fillOpacity={0.6} />
  </AreaChart>
</Paper>
```

X axis: day-bucket labels across the selected window. For 7d: 7 ticks. For 30d: weekly ticks (every 7 days). For 90d: bi-weekly or monthly ticks — planner picks readable interval. Y axis: completed count per bucket.

### Donut chart layout

```
<Paper withBorder p="md" radius="md" data-pendo-id={PENDO_IDS.dashboard.chart.byStatus}>
  <Text fw={600} mb="md">Tasks by status</Text>
  <PieChart width={...} height={240}>
    <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value">
      {/* To do: fill="#a5b4fc" (indigo.3) */}
      {/* In progress: fill="#4263eb" (indigo.6) */}
      {/* Done: fill="#adb5bd" (gray.5) */}
      <Label value={totalCount} position="center" style={{ fontSize: 20, fontWeight: 600 }} />
    </Pie>
    <Tooltip />
    <Legend />
  </PieChart>
</Paper>
```

Color mapping:
- To do: `#a5b4fc` (Mantine indigo.3)
- In progress: `#4263eb` (Mantine indigo.6)
- Done: `#adb5bd` (Mantine gray.5)

### Activity feed layout

Each of the 8 most recent events is a `Timeline.Item`:

```
<Timeline.Item
  bullet={<IconCheck size={14} />}    {/* or IconEdit / IconPlus */}
  color="green.6"                     {/* or gray.6 / indigo.6 */}
  title={<Text size="sm">{assignee.name} {verb} "{task.title}"</Text>}
  data-pendo-id={PENDO_IDS.dashboard.activity.item}
  data-pendo-task-id={task.id}
>
  <Text size="xs" c="dimmed">{relativeTime}</Text>
</Timeline.Item>
```

Verb + icon + color map:
- `completedAt` latest → verb `"completed"`, icon `IconCheck`, color `"green.6"`
- `updatedAt` latest (and not completed) → verb `"updated"`, icon `IconEdit`, color `"gray.6"`
- `createdAt` latest (brand new) → verb `"created"`, icon `IconPlus`, color `"indigo.6"`

### Empty state layout

Triggers when `listTasks(workspaceId).length === 0`. Replaces ALL Dashboard content (KPIs + charts + activity).

```
<Center mih={400} data-pendo-id={PENDO_IDS.dashboard.emptyState.container}>
  <Stack align="center" gap="md">
    <IconClipboardCheck size={64} stroke={1.2} color="var(--mantine-color-gray-4)" />
    <Title order={3}>No tasks yet</Title>
    <Text c="dimmed" ta="center" maw={420}>
      Looks like your workspace is fresh. Head over to Lists to create
      your first task and see this dashboard come to life.
    </Text>
    <Button
      variant="filled"
      pendoId={PENDO_IDS.dashboard.emptyState.cta}
      onClick={() => navigate('/app/lists')}
    >
      Go to Lists
    </Button>
  </Stack>
</Center>
```

### ComingSoonCard layout

Used by all five placeholder routes (`/app/lists`, `/app/reports`, `/app/team`, `/app/settings`, `/app/help`). Props: `featureName: string`, `phase: number`.

```
<Center mih={400}>
  <Paper withBorder p="xl" radius="md" data-pendo-id={PENDO_IDS.comingSoon.card}>
    <Stack align="center" gap="md">
      {/* Icon: per-route (see below), size=48, c="gray.4" */}
      <Title order={3}>{featureName} is coming in Phase {phase}</Title>
      <Text c="dimmed" ta="center" maw={360}>{description}</Text>
    </Stack>
  </Paper>
</Center>
```

Per-route icon and description:

| Route | featureName | phase | Icon | Description |
|-------|-------------|-------|------|-------------|
| `/app/lists` | `Lists` | `4` | `IconChecklist` | `Create and manage tasks for your workspace.` |
| `/app/reports` | `Reports` | `4` | `IconChartBar` | `Filter task data and export reports.` |
| `/app/team` | `Team` | `5` | `IconUsers` | `Invite teammates and manage roles.` |
| `/app/settings` | `Settings` | `4` | `IconSettings` | `Update your profile, workspace, and preferences.` |
| `/app/help` | `Help` | `5` | `IconHelpCircle` | `Search articles and find answers.` |

---

## Copywriting Contract

### Navigation labels (verbatim)

| Nav item | Label | Route |
|----------|-------|-------|
| Side nav 1 | `Dashboard` | `/app` |
| Side nav 2 | `Lists` | `/app/lists` |
| Side nav 3 | `Reports` | `/app/reports` |
| Side nav 4 | `Team` | `/app/team` |
| Side nav 5 | `Settings` | `/app/settings` |
| Side nav 6 | `Help` | `/app/help` |

### Top bar user menu (verbatim)

| Menu item | Copy | Action |
|-----------|------|--------|
| User menu button | `{firstName} {lastName}` (with avatar initials) | Opens dropdown |
| Menu item 1 | `Profile` | `navigate('/app/settings?tab=profile')` |
| Menu item 2 | `Settings` | `navigate('/app/settings')` |
| Menu item 3 (after divider) | `Sign out` | `signOut()` then `navigate('/', { replace: true })` |

### Dashboard (verbatim)

| Element | Copy |
|---------|------|
| Area chart title | `Completed per day` |
| Donut chart title | `Tasks by status` |
| Activity feed title | `Recent activity` |
| KPI label 1 | `Active tasks` |
| KPI label 2 | `Completed in range` |
| KPI label 3 | `Overdue` |
| KPI label 4 | `Completion rate` |
| KPI label 5 | `Avg cycle time` |
| KPI null value | `—` (em-dash, for Completion rate and Avg cycle time when no data) |
| Avg cycle time format | `{N.N}d` (e.g., `2.3d`) |
| Completion rate format | `{N}%` (e.g., `42%`) |
| Timeline verb: completed | `completed` |
| Timeline verb: updated | `updated` |
| Timeline verb: created | `created` |
| Timeline sentence pattern | `{assignee.name} {verb} "{task.title}"` |

### Empty state (verbatim)

| Element | Copy |
|---------|------|
| Empty state heading | `No tasks yet` |
| Empty state body | `Looks like your workspace is fresh. Head over to Lists to create your first task and see this dashboard come to life.` |
| Empty state primary CTA | `Go to Lists` |

### ComingSoonCard (verbatim — per route)

| Route | Heading | Description |
|-------|---------|-------------|
| `/app/lists` | `Lists is coming in Phase 4` | `Create and manage tasks for your workspace.` |
| `/app/reports` | `Reports is coming in Phase 4` | `Filter task data and export reports.` |
| `/app/team` | `Team is coming in Phase 5` | `Invite teammates and manage roles.` |
| `/app/settings` | `Settings is coming in Phase 4` | `Update your profile, workspace, and preferences.` |
| `/app/help` | `Help is coming in Phase 5` | `Search articles and find answers.` |

### State copy

| State | Where | Copy |
|-------|-------|------|
| Empty state | Dashboard when `tasks.length === 0` | See "Empty state" above |
| Error state | Not applicable in Phase 3 — no user mutations occur; Dashboard is read-only. | n/a |
| Loading state | Not applicable — auth hydration is synchronous (module-init pattern); tasks load synchronously from localStorage via `tasksRepo.listTasks()`. No async loading state needed. | n/a |
| Sign-out | Post-action | No toast (Phase 5 UI-02 adds retroactively). The redirect to `/` is the confirmation signal. |

### Confirmation copy

| Action | Confirmation modal? | Copy |
|--------|---------------------|------|
| Sign out (user menu) | **No** — single-click, no modal. Sign-out clears session only; no data destroyed. Consistent with Phase 2 rule. | n/a |

---

## Interaction Contracts

### AppShell navigation (per SHELL-01, SHELL-02)

- Mantine `AppShell` renders the navbar and header persistently across all `/app/*` routes. The main area changes via `<Outlet />` per React Router's two-level structure.
- Active NavLink state: `active` prop is derived from `useLocation().pathname` at AppLayout render time (one comparison per nav item — see Layout section). `variant="light"` is the visual treatment for active items.
- Clicking an inactive NavLink navigates via React Router `<NavLink component={RouterLink}>` or via `onClick={() => navigate(path)}` — planner picks the cleanest integration with the wrapped `NavLink` primitive.
- Deep-linking (SHELL-04): structurally satisfied by Phase 1's `createBrowserRouter` + Vite SPA fallback (`index.html` for all 404s). Phase 3 adds no special handling — it verifies via manual refresh test per route.

### User menu interactions (per SHELL-03)

- Menu trigger: `<Menu>` with `<Menu.Target>` wrapping the `<UnstyledButton>`. The `data-pendo-id` lands on the `<UnstyledButton>` (the actual clickable element).
- Profile → `navigate('/app/settings?tab=profile')` — the `?tab=profile` param is wired now; the consumer (`useSearchParams` in SettingsPage) lands in Phase 4. No crash if the query param is unread.
- Settings → `navigate('/app/settings')`
- Sign out → `useAuthStore.getState().signOut()` then `navigate('/', { replace: true })`. The `signOut()` call is synchronous (localStorage write + Zustand state clear). `navigate` fires immediately after.

### Task seeding + idempotency (per DASH-01, DASH-02, FND-05)

- On AppLayout mount (or inside a `seedIfNeeded(workspaceId)` function called from AppLayout's `useEffect`): read `meta.seededAt` via `readWithSchema(K.meta(), MetaSchema, fallback)`.
- If `seededAt === null` AND `tasksRepo.listTasks(workspaceId).length === 0`: run seeder → write ~40–60 fake tasks → stamp `meta.seededAt = new Date().toISOString()`.
- Subsequent mounts skip seeding (stamp is set).
- The seed runs ONCE per workspace per browser session (gated by `meta.seededAt`). User mutations in Phase 4 are never clobbered.

### Time-range filter (per DASH-04)

- `<SegmentedControl>` state lives in Dashboard component state (`useState<'7' | '30' | '90'>('30')`). Default: `'30'`.
- On change: re-compute all five KPI values + area chart buckets + (optionally) donut segments. The donut shows all-time distribution; time range affects the area chart and the "Completed in range" + "Completion rate" + "Avg cycle time" KPIs. "Active tasks" and "Overdue" are time-range-independent (current state).
- No URL persistence (`?range=30`) in Phase 3 — component state only (deferred to Phase 4+).

### nowRef anchor (per D-21)

- `nowRef = max(max task timestamps)` across all tasks, defaulting to `new Date()` if tasks array is empty. Computed once per Dashboard render using `useMemo` on the `tasks` array. All date math (time-range window cutoff, overdue comparison, relative timestamps) uses `nowRef` as "today" — this prevents demo staleness when seeded data is days/weeks old.

### Pendo runtime — explicitly out of scope

Phase 3 MUST NOT:
- Call `pendo.initialize`, `pendo.identify`, `pendo.clearSession`, `pendo.location.setUrl`, or any `window.pendo.*` method.
- Add the Pendo snippet to `index.html`.
- Modify `src/pendo/PendoBridge.tsx` (remains a no-op stub).

All `data-pendo-id` attributes are inert markup. Phase 6 retrofits the runtime.

---

## PENDO_IDS Additions (Phase 3)

Phase 3 extends `src/pendo/PENDO_IDS.ts` with four new namespaces: `nav`, `topbar`, `dashboard`, `comingSoon`. Existing `layout`, `sandbox`, `signup`, `signin` namespaces are NOT touched.

The `layout.appPlaceholder` leaf (`'layout.app.placeholder'`) is retired in Phase 3: the `AppPlaceholder` component it targets is deleted and replaced by the real Dashboard. Remove the `appPlaceholder` leaf from the `layout` namespace to keep the registry clean. No other `layout.*` leaves are touched.

```ts
nav: {
  dashboard: 'nav.dashboard',
  lists:     'nav.lists',
  reports:   'nav.reports',
  team:      'nav.team',
  settings:  'nav.settings',
  help:      'nav.help',
},

topbar: {
  logo:          'topbar.logo',
  workspaceName: 'topbar.workspace-name',
  userMenu: {
    button:   'topbar.user-menu.button',
    profile:  'topbar.user-menu.profile',
    settings: 'topbar.user-menu.settings',
    signout:  'topbar.user-menu.sign-out',
  },
},

dashboard: {
  timeRange: 'dashboard.time-range',
  kpi: {
    active:           'dashboard.kpi.active',
    completedInRange: 'dashboard.kpi.completed-in-range',
    overdue:          'dashboard.kpi.overdue',
    completionRate:   'dashboard.kpi.completion-rate',
    avgCycleTime:     'dashboard.kpi.avg-cycle-time',
  },
  chart: {
    completedPerDay: 'dashboard.chart.completed-per-day',
    byStatus:        'dashboard.chart.by-status',
  },
  activity: {
    container: 'dashboard.activity.container',
    item:      'dashboard.activity.item',
  },
  emptyState: {
    container: 'dashboard.empty-state.container',
    cta:       'dashboard.empty-state.cta',
  },
},

comingSoon: {
  card: 'coming-soon.card',
},
```

**Leaf string convention (unchanged from Phase 1/2):** dotted path, kebab-case values. Keys in the object are camelCase; string values are kebab-case. The `PendoId` type derives automatically from `Leaves<typeof PENDO_IDS>` — no manual type update needed.

**Parameterized IDs on timeline items:** Each `<Timeline.Item>` carries BOTH:
- `data-pendo-id={PENDO_IDS.dashboard.activity.item}` — static, for guide targeting (Pendo can find "any activity item")
- `data-pendo-task-id={task.id}` — dynamic, for Session Replay context (per CLAUDE.md "lists.row.complete" + `data-pendo-item-id` precedent)

**Chart wrapper IDs:** `data-pendo-id` lands on the `<Paper>` wrapping `<div>` container, NOT on individual Recharts SVG `<rect>` or `<path>` elements (per CLAUDE.md chart-wrapper rule). The `PENDO_IDS.dashboard.chart.*` IDs are applied to the outermost `<Paper>` for each chart.

---

## Registry Safety

Halo does not use shadcn or any third-party component registry. The vetting gate is not applicable.

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| (none — Mantine 9 native components only) | n/a | not applicable |
| (no third-party registries declared) | n/a | not applicable |

`recharts` is installed as an npm package dependency, not as a shadcn/registry block. It is exempt from the registry vetting gate. Recharts SVG-only rendering is verified by docs/CONVENTIONS.md §2 and CLAUDE.md "What NOT to Use" (canvas forbidden).

---

## What Phase 3 Does NOT Touch

Hard out-of-scope for the executor — enforced by CONTEXT.md `<deferred>` section:

- **Real task CRUD UI** — Phase 4 (`LIST-*`). Phase 3 writes the data layer + seeder only; no create/edit/delete/complete task UI.
- **Real Settings page contents** — Phase 4 (`SET-*`). The user-menu deep-link `?tab=profile` is wired; the `useSearchParams` consumer lands in Phase 4.
- **Toast notifications** — Phase 5 (UI-02). `@mantine/notifications` is NOT installed in Phase 3. Sign-out has no toast.
- **Theme toggle / dark mode** — Phase 4 (SET-04). Light scheme only.
- **Mobile-responsive AppShell (hamburger + drawer)** — Out of scope per PROJECT.md.
- **Workspace switcher** — v2 (WS2-01).
- **Notifications bell / command-bar / search input in top bar** — v2 (UX2-02, UX2-01).
- **URL persistence for time-range** — Deferred to Phase 4+.
- **Pendo runtime (PEN-01..06)** — Phase 6. Only `data-pendo-id` markup affordances land in Phase 3.
- **`src/App.tsx`** — UNTOUCHED. Provider stack is FND-07-locked.
- **`src/routes/public/PublicLayout.tsx`** — UNTOUCHED. DemoBanner stays public-only.
- **Existing PENDO_IDS namespaces** (`layout.*` minus the retired `appPlaceholder`, `sandbox.*`, `signup.*`, `signin.*`) — NOT edited beyond removing the retired leaf.

---

## Pre-population Sources

Every value in this UI-SPEC was sourced from upstream artifacts — no new user questions were required.

| Section | Source |
|---------|--------|
| Design System: Mantine 9 | CLAUDE.md + Phase 1 + Phase 2 UI-SPEC |
| Design System: recharts | CLAUDE.md (SVG mandate), 03-CONTEXT.md D-18/D-19 |
| Design System: shadcn = none | CLAUDE.md + `components.json` absent from repo |
| Design System: icons | Phase 1 (`@tabler/icons-react@3.44.0` installed), 03-CONTEXT.md D-12 |
| Design System: font | `src/theme.ts` (`Inter` locked) |
| Spacing scale | Mantine 9 default theme (inherited from Phase 2 UI-SPEC) |
| Typography | Mantine 9 default theme (inherited from Phase 2 UI-SPEC) + 03-CONTEXT.md D-14 |
| Color: indigo primary | `src/theme.ts` (`primaryColor: 'indigo'`) |
| Color: NavLink active exception | 03-CONTEXT.md D-12 + `<specifics>` note on Phase 2 UI-SPEC §Color "Forbidden uses" |
| AppShell dimensions | 03-CONTEXT.md D-11 (`width: 240`, `height: 56`, `padding="md"`) |
| Nav links + icons | 03-CONTEXT.md D-12 |
| Top bar layout | 03-CONTEXT.md D-14 |
| User menu items | 03-CONTEXT.md D-15, D-16 |
| KPI card spec | 03-CONTEXT.md D-17 |
| Area chart spec | 03-CONTEXT.md D-18 |
| Donut chart spec | 03-CONTEXT.md D-19 |
| Time-range control | 03-CONTEXT.md D-20 |
| nowRef anchor | 03-CONTEXT.md D-21 |
| Activity feed | 03-CONTEXT.md D-22 |
| Empty state | 03-CONTEXT.md D-23 |
| PENDO_IDS additions | 03-CONTEXT.md D-24, D-25 |
| ComingSoonCard | 03-CONTEXT.md D-01, D-02 |
| Seed data / idempotency | 03-CONTEXT.md D-03, D-04, D-05 |
| Task schema | 03-CONTEXT.md D-06 through D-10 |
| Provider stack untouched | 03-CONTEXT.md D-26 |
| Schema version unchanged | 03-CONTEXT.md D-27 |
| Copywriting per-route | 03-CONTEXT.md D-02 (ComingSoonCard copy left to "Claude's Discretion" → resolved here) |
| Phase 6 deferral | STATE.md "2026-05-13: User decision — defer all Pendo runtime to Phase 6" |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
