import { useEffect, useRef } from 'react'
import { Box } from '@mantine/core'
import { PENDO_IDS } from '../../../pendo/PENDO_IDS'

const PORTAL_EMBED_URL =
  'https://portal.pendo-helix.pendo-dev.com/p/96707061-4747-48fa-a35d-aaeb529f5193/3g8OYRbwDt6kynOjPOfvWCDV7w0?container=embed'

export function FeedbackPage(): React.JSX.Element {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    let cancelled = false
    let tries = 20

    const loadPortal = () => {
      if (cancelled || iframe.src) return
      iframe.src = PORTAL_EMBED_URL
    }

    const waitForPendo = () => {
      if (cancelled) return
      if (typeof pendo !== 'undefined' && pendo.getVisitorId?.()) {
        loadPortal()
        return
      }
      if (tries > 0) {
        tries -= 1
        window.setTimeout(waitForPendo, 500)
        return
      }
      loadPortal()
    }

    waitForPendo()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Box
      mx="calc(-1 * var(--mantine-spacing-md))"
      mb="calc(-1 * var(--mantine-spacing-md))"
      style={{ height: 'calc(100dvh - var(--app-shell-header-offset, 56px) - var(--mantine-spacing-md))' }}
    >
      <iframe
        ref={iframeRef}
        title="Feedback portal"
        className="feedback-portal-frame"
        data-pendo-id={PENDO_IDS.feedback.portalFrame}
        width="100%"
        height="100%"
        style={{ border: 0, display: 'block' }}
      />
    </Box>
  )
}
