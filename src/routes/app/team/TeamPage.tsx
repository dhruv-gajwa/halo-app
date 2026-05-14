import React from 'react'
import { IconUsers } from '@tabler/icons-react'
import { ComingSoonCard } from '../../../ui/ComingSoonCard'

/**
 * Phase 3 placeholder for /app/team.
 *
 * Phase 5 (TEAM-01..06) replaces the body of THIS file with the real team
 * management UI. router.tsx is NOT edited at that boundary — the page contract
 * is stable across the Phase 3 → Phase 5 handoff (D-01).
 */
export function TeamPage(): React.JSX.Element {
  return (
    <ComingSoonCard
      featureName="Team"
      phase={5}
      icon={<IconUsers size={48} color="var(--mantine-color-gray-4)" />}
      description="Invite teammates and manage roles."
    />
  )
}
