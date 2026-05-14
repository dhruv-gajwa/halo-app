import React from 'react'
import { IconSettings } from '@tabler/icons-react'
import { ComingSoonCard } from '../../../ui/ComingSoonCard'

/**
 * Phase 3 placeholder for /app/settings.
 *
 * Phase 4 (SET-01..06) replaces the body of THIS file with the real settings
 * UI. router.tsx is NOT edited at that boundary — the page contract is
 * stable across the Phase 3 → Phase 4 handoff (D-01).
 */
export function SettingsPage(): React.JSX.Element {
  return (
    <ComingSoonCard
      featureName="Settings"
      phase={4}
      icon={<IconSettings size={48} color="var(--mantine-color-gray-4)" />}
      description="Update your profile, workspace, and preferences."
    />
  )
}
