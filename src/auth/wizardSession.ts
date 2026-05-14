/**
 * Halo signup-wizard draft state — `sessionStorage`-backed.
 *
 * Stores in-flight registration data so refresh / back / forward mid-wizard
 * doesn't lose typed input (AUTH-07). Cleared on (a) successful wizard
 * completion via `clearWizardDraft()` from Plan 02-09's submit handler, and
 * (b) sign-out via Plan 02-05's `signOut()`.
 *
 * UI-SPEC locks `sessionStorage` (NOT `localStorage`) — sessionStorage is
 * tab-scoped, doesn't leak partial PII across tabs, and clears on tab close.
 * That tab-close clear is the privacy backstop for a wizard abandoned on a
 * shared machine.
 *
 * This module is the ONLY allowed accessor of `sessionStorage[K.signupDraft()]`.
 * It mirrors the storage codec's never-throw contract: every read swallows
 * `SecurityError` / `QuotaExceededError` (Safari private-mode + over-quota),
 * every write logs-then-swallows, every read validates against
 * `SignupDraftSchema` and falls through to `{}` on schema mismatch.
 *
 * Why we don't reuse `readWithSchema` from `src/storage/codec.ts`: that helper
 * targets the localStorage backend directly. localStorage and sessionStorage
 * share an API shape but are different storage backends. FND-04's "only the
 * codec touches localStorage" rule applies to localStorage only —
 * wizardSession.ts is the sessionStorage twin.
 *
 * Naming note: the generic parameter is named `Step` (not `K`) to avoid
 * shadowing the imported `K` storage-key-builder from `'../storage'`.
 */

import { K } from '../storage'
import { SignupDraftSchema } from './schemas'
import type { SignupDraft } from './types'

/**
 * Read the current wizard draft from sessionStorage, validating against
 * `SignupDraftSchema`. Returns `{}` on:
 *   - missing key
 *   - `sessionStorage` access throw (Safari private mode)
 *   - JSON.parse failure (corrupt stored value)
 *   - Zod schema validation failure (tampered or malformed value)
 *
 * Never throws.
 */
export function readWizardDraft(): SignupDraft {
  let raw: string | null
  try {
    raw = sessionStorage.getItem(K.signupDraft())
  } catch {
    return {}
  }
  if (raw === null) return {}

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return {}
  }

  const result = SignupDraftSchema.safeParse(parsed)
  return result.success ? result.data : {}
}

/**
 * Merge `partial` into the existing draft's `stepKey` slot and persist.
 *
 * Read-merge-write semantics: writing step3 doesn't wipe steps 1+2; writing a
 * single field of step1 keeps the other step1 fields. Last-write-wins per field.
 *
 * Non-fatal: on QuotaExceededError or private-mode write block, logs a console
 * warning and continues. Never throws to the caller.
 */
export function writeWizardDraftStep<Step extends keyof SignupDraft>(
  stepKey: Step,
  partial: SignupDraft[Step],
): void {
  const current = readWizardDraft()
  const merged: SignupDraft = {
    ...current,
    [stepKey]: { ...(current[stepKey] ?? {}), ...(partial ?? {}) },
  }
  try {
    sessionStorage.setItem(K.signupDraft(), JSON.stringify(merged))
  } catch (err) {
    console.warn('[halo:wizardSession] write failed', err)
  }
}

/**
 * Remove the wizard draft from sessionStorage. Called by:
 *   - Plan 02-05's `signOut()`
 *   - Plan 02-09's wizard-completion submit handler (after persisting the
 *     final Visitor + Workspace + Session records)
 *
 * Non-fatal: errors are swallowed silently.
 */
export function clearWizardDraft(): void {
  try {
    sessionStorage.removeItem(K.signupDraft())
  } catch {
    // swallow — e.g. sessionStorage unavailable in some private mode contexts
  }
}

/**
 * Returns `true` when the named step has at least one truthy field in the
 * supplied draft; `false` otherwise (including when the step is absent or
 * holds only empty strings / empty arrays).
 *
 * Used by Wave 3 step pages (02-08, 02-09) to gate-check mount: a user who
 * deep-links to `/signup/details` without completing step 1 should be
 * redirected to `/signup`.
 *
 * Pure function — does NOT read sessionStorage. Pass in a previously-read
 * draft (`hasStep(readWizardDraft(), 'step1')`).
 */
export function hasStep<Step extends keyof SignupDraft>(
  draft: SignupDraft,
  stepKey: Step,
): boolean {
  const step = draft[stepKey]
  if (step === undefined) return false
  // Empty step object (`{}`) or step with only "empty" values is NOT
  // considered filled in. This deliberately treats '' and [] as not-provided
  // so a user who tabbed through an empty step doesn't trip the gate.
  return Object.values(step).some(
    (v) => v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0),
  )
}
