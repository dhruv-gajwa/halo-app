import React from 'react'
import { IconChartBar } from '@tabler/icons-react'
import { ComingSoonCard } from '../../../ui/ComingSoonCard'

/**
 * Phase 3 placeholder for /app/reports.
 *
 * Phase 4 (REPT-01..05) replaces the body of THIS file with the real reports
 * UI. router.tsx is NOT edited at that boundary — the page contract is
 * stable across the Phase 3 → Phase 4 handoff (D-01).
 */
export function ReportsPage(): React.JSX.Element {
  return (
    <ComingSoonCard
      featureName="Reports"
      phase={4}
      icon={<IconChartBar size={48} color="var(--mantine-color-gray-4)" />}
      description="Filter task data and export reports."
    />
  )
}
