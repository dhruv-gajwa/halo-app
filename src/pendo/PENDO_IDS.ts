/**
 * This is the ONLY source of `data-pendo-id` string values in the codebase.
 *
 * UI primitive wrappers (src/ui/primitives/*) accept `pendoId: PendoId` and
 * forward it as `data-pendo-id` to the DOM. Page-level code MUST reference
 * `PENDO_IDS.<namespace>.<id>` — never hand-type a string literal
 * `data-pendo-id` value.
 *
 * Phase 6's Pendo agent attaches to these attributes for guide targeting,
 * feature tagging, and track events. See docs/CONVENTIONS.md for the full
 * markup convention rules (PEN-07).
 *
 * Namespace growth plan:
 *   Phase 1: `layout`, `sandbox`
 *   Phase 2 (landed): `signup`, `signin`
 *   Phase 3: `nav`, `topbar`, `dashboard`, `comingSoon`
 *   Phase 4: `lists`, `settings`, `reports`
 *   Phase 5: `team`, `help`
 */

/** Derives a union of every leaf string value from a nested `as const` object. */
type Leaves<T> = T extends string
  ? T
  : T extends Record<string, unknown>
    ? Leaves<T[keyof T]>
    : never

export const PENDO_IDS = {
  /** Phase 1 layout-level markers (PublicLayout + AppLayout). */
  layout: {
    publicDemoBanner: 'layout.public.demo-banner',
    publicLanding: 'layout.public.landing',
  },

  /**
   * Phase 1 sandbox smoke-render markers.
   * Used only by src/routes/public/PrimitivesSandbox.tsx — one per primitive
   * so the forwarding contract is end-to-end verifiable in DevTools.
   */
  sandbox: {
    primaryButton: 'sandbox.primary-button',
    emailInput: 'sandbox.email-input',
    passwordInput: 'sandbox.password-input',
    signupAnchor: 'sandbox.signup-anchor',
  },

  /**
   * Phase 2 signup wizard markers (four-URL flow + stepper).
   * Step labels in the registry are `step1`..`step4` so the registry
   * structure mirrors the wizard's narrative order regardless of the URL
   * slug (`/signup`, `/signup/details`, `/signup/company`, `/signup/preferences`).
   * `signup.step4.submit` is the funnel-conversion target for Phase 6.
   */
  signup: {
    /** Step 1: Account (/signup) */
    step1: {
      email: 'signup.step1.email',
      password: 'signup.step1.password',
      firstName: 'signup.step1.first-name',
      lastName: 'signup.step1.last-name',
      username: 'signup.step1.username',
      submit: 'signup.step1.submit',
      signinAnchor: 'signup.step1.signin-anchor',
    },
    /** Step 2: About you (/signup/details) */
    step2: {
      jobTitle: 'signup.step2.job-title',
      role: 'signup.step2.role',
      yearsExperience: 'signup.step2.years-experience',
      location: 'signup.step2.location',
      back: 'signup.step2.back',
      submit: 'signup.step2.submit',
    },
    /** Step 3: Company (/signup/company) */
    step3: {
      companyName: 'signup.step3.company-name',
      companySize: 'signup.step3.company-size',
      industry: 'signup.step3.industry',
      planTier: 'signup.step3.plan-tier',
      back: 'signup.step3.back',
      submit: 'signup.step3.submit',
    },
    /** Step 4: Setup (/signup/preferences) — final step, funnel conversion target. */
    step4: {
      useCase: 'signup.step4.use-case',
      teamSize: 'signup.step4.team-size',
      goals: 'signup.step4.goals',
      back: 'signup.step4.back',
      submit: 'signup.step4.submit',
    },
    /**
     * The wizard <Stepper> container. Sub-targeting individual step circles
     * is done via Mantine's aria-* attributes, not per-step data-pendo-id —
     * stepper internals re-render on navigation and should not carry IDs.
     */
    stepper: 'signup.stepper',
  },

  /**
   * Phase 2 sign-in markers (/signin).
   * `signin.submit` is the funnel-conversion target for Phase 6.
   */
  signin: {
    email: 'signin.email',
    password: 'signin.password',
    submit: 'signin.submit',
    signupAnchor: 'signin.signup-anchor',
  },

  /** Phase 3 side-nav targets. */
  nav: {
    dashboard: 'nav.dashboard',
    lists:     'nav.lists',
    reports:   'nav.reports',
    team:      'nav.team',
    settings:  'nav.settings',
    help:      'nav.help',
  },

  /** Phase 3 top-bar + user-menu targets. */
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

  /** Phase 3 dashboard widget targets (KPIs, charts, activity, empty state). */
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

  /** Phase 3 shared placeholder-card target — single ID across all five placeholder routes. */
  comingSoon: {
    card: 'coming-soon.card',
  },
} as const

/**
 * Union of every leaf string value in PENDO_IDS.
 * UI primitive `pendoId` props are typed as `PendoId` — TypeScript will flag
 * any hand-typed string that isn't in the registry.
 */
export type PendoId = Leaves<typeof PENDO_IDS>
