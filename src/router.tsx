/**
 * Phase 1 route map — two top-level branches: `/` (public) and `/app` (authenticated shell).
 *
 * Phase 1 also registers /sandbox under PublicLayout for the UI-primitive smoke render.
 * Phase 5 polish may move /sandbox to a dev-only build flag; for Phase 1 it ships in
 * the main route map for verifiability.
 *
 * Phase 2 adds child routes under PublicLayout:
 *   - /signin            (sign-in form)
 *   - /signup            (multi-step registration: /signup, /signup/details,
 *                         /signup/company, /signup/preferences)
 * Phase 2 also wraps the /app/* route segment in a <RequireAuth> guard and adds
 * a <RequireAnon> wrapper around /signup* and /signin.
 *
 * Phase 6 — NOT Phase 1 — adds PendoRouteBridge mounts inside both PublicLayout
 * and AppLayout. Phase 1 only wires the route plumbing so downstream phases have
 * a stable extension point.
 *
 * FND-03: History API routing (createBrowserRouter, NOT createHashRouter). The
 * Vite dev server is configured with server.historyApiFallback (default SPA
 * behavior) so refreshing on any path serves index.html — no server-side routing
 * logic required.
 */
import { createBrowserRouter } from 'react-router'
import { PublicLayout } from './routes/public/PublicLayout'
import { Landing } from './routes/public/Landing'
import { PrimitivesSandbox } from './routes/public/PrimitivesSandbox'
import { AppLayout } from './routes/app/AppLayout'
import { AppPlaceholder } from './routes/app/AppPlaceholder'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: PublicLayout,
    children: [
      {
        index: true,
        Component: Landing,
      },
      {
        path: 'sandbox',
        Component: PrimitivesSandbox,
      },
    ],
  },
  {
    path: '/app',
    Component: AppLayout,
    children: [
      {
        index: true,
        Component: AppPlaceholder,
      },
    ],
  },
])
