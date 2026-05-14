import React from 'react'
import { Outlet } from 'react-router'
import { Container, Title } from '@mantine/core'

/**
 * Authenticated application shell — Phase 1 placeholder.
 *
 * Phase-specific notes:
 *   - Phase 3 replaces this with the full Mantine AppShell layout (side nav +
 *     top bar + user menu). Phase 1 only verifies that the /app route tree is
 *     reachable and renders correctly.
 *   - Phase 2 wraps the /app/* route segment in a <RequireAuth> guard so
 *     unauthenticated visitors are redirected to /signin. Phase 1 intentionally
 *     has no auth gate — verify the plumbing first, add the gate in Phase 2.
 *   - Phase 6 will mount <PendoRouteBridge /> here (and in PublicLayout) to report
 *     SPA route changes to Pendo. Phase 1 deliberately does not include it.
 */
export function AppLayout(): React.JSX.Element {
  return (
    <Container size="lg" py="md">
      <Title order={2}>App (Phase 1 placeholder)</Title>
      <Outlet />
    </Container>
  )
}
