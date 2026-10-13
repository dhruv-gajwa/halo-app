/**
 * Signup wizard — Pendo `signup_validation_failed` track event.
 *
 * Fires when a wizard step rejects the user's input on Continue / Create
 * account — the funnel's key friction signal. Shared by all four step pages
 * so every call site sends the same property names:
 *
 *   - failureType 'schema': the step's Zod schema rejected the form — wired
 *     as the `onInvalid` callback of RHF's `form.handleSubmit(onValid, onInvalid)`.
 *   - failureType 'duplicate_email' / 'duplicate_username': Step 1's
 *     submit-time uniqueness check found the value already taken. The
 *     duplicate-email case surfaces returning users re-registering instead of
 *     signing in.
 *
 * Privacy: only field NAMES are sent — never field values (Step 1 holds the
 * email and password).
 */

import type { SignupDraft } from '../../../auth'

export type SignupValidationFailureType = 'schema' | 'duplicate_email' | 'duplicate_username'

export function trackSignupValidationFailed(
  step: keyof SignupDraft,
  failureType: SignupValidationFailureType,
  errorFields: string[],
): void {
  if (typeof pendo !== 'undefined') {
    pendo.track('signup_validation_failed', {
      step,
      failureType,
      errorFields: errorFields.join(', '),
      errorCount: errorFields.length,
    })
  }
}
