/**
 * Phase 1 route map — two top-level branches: `/` (public) and `/app` (authenticated shell).
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
