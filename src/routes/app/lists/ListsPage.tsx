import React from 'react'
import { IconChecklist } from '@tabler/icons-react'
import { ComingSoonCard } from '../../../ui/ComingSoonCard'

/**
 * Phase 3 placeholder for /app/lists.
 *
 * Phase 4 (LIST-01..09) replaces the body of THIS file with the real task
 * list UI. router.tsx is NOT edited at that boundary — the page contract is
 * stable across the Phase 3 → Phase 4 handoff (D-01).
 */
export function ListsPage(): React.JSX.Element {
  return (
    <ComingSoonCard
      featureName="Lists"
      phase={4}
      icon={<IconChecklist size={48} color="var(--mantine-color-gray-4)" />}
      description="Create and manage tasks for your workspace."
    />
  )
}
