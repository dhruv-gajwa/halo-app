import React from 'react'
import { Stack, Text, Title } from '@mantine/core'

/**
 * Phase 1 placeholder content for the /app index route.
 *
 * Phase 3 replaces this with the real Dashboard page (charts, task lists, KPI
 * cards). Phase 1 only verifies the /app route tree renders and deep-linking
 * (refreshing while on /app) stays on /app rather than falling back to 404 or
 * redirecting to /.
 */
export function AppPlaceholder(): React.JSX.Element {
  return (
    <Stack gap="md" pt="md">
      <Title order={2}>Authenticated area (Phase 3 placeholder)</Title>
      <Text c="dimmed">
        Phase 3 will build out the Dashboard with charts, task lists, and KPI cards.
      </Text>
    </Stack>
  )
}
