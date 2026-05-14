import React from 'react'
import { IconHelpCircle } from '@tabler/icons-react'
import { ComingSoonCard } from '../../../ui/ComingSoonCard'

/**
 * Phase 3 placeholder for /app/help.
 *
 * Phase 5 (HELP-01..04) replaces the body of THIS file with the real help
 * UI. router.tsx is NOT edited at that boundary — the page contract is
 * stable across the Phase 3 → Phase 5 handoff (D-01).
 */
export function HelpPage(): React.JSX.Element {
  return (
    <ComingSoonCard
      featureName="Help"
      phase={5}
      icon={<IconHelpCircle size={48} color="var(--mantine-color-gray-4)" />}
      description="Search articles and find answers."
    />
  )
}
