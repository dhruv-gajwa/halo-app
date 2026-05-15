import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import { runMigrations } from './storage'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// Run storage migrations synchronously BEFORE React mounts.
// This ensures halo:v1:meta is written and any schema upgrades are applied
// before any component attempts to read from localStorage.
// Note: called at module-init time (not in useEffect), so StrictMode double-mount
// does not affect it. The runner is idempotent — safe to call multiple times.
runMigrations()

// React Router SPA route changes are auto-detected by Pendo via History API hooks.
// Pendo initialization is deferred to Phase 6 (Pendo Install & Wiring).

const container = document.getElementById('root')
if (!container) {
  throw new Error('Root element #root not found in index.html')
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
