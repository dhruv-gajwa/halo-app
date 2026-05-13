/**
 * Storage key builders for the Halo localStorage envelope.
 *
 * All persistent localStorage keys must be constructed via the `K` object.
 * Do NOT use raw string literals for keys outside this module.
 *
 * Namespace schema: `halo:v{SCHEMA_VERSION}:{domain}[:{qualifier}]`
 */

/** Current schema version — bump this when a breaking localStorage shape change ships.
 *  The migration runner in `migrations.ts` must have a handler registered for each
 *  source version before bumping. */
export const SCHEMA_VERSION = 1

/** Application version — keep in sync with package.json `version` field.
 *  Updated during Phase 5 polish. */
export const APP_VERSION = '0.1.0'

/**
 * Namespaced key builders.
 *
 * Keys are functions (even zero-argument ones) so the API stays uniform when
 * scoped keys like `tasks(accountId)` are added in Phase 4.
 *
 * Phase 2+ extends this object — do NOT add keys outside this file.
 */
export const K = {
  /** `halo:v1:meta` — boot-time schema version + seed timestamp record */
  meta: (): string => `halo:v${SCHEMA_VERSION}:meta`,

  /** `halo:v1:pendo:anonId` — anonymous Pendo visitor ID (set in Phase 6) */
  pendoAnonId: (): string => `halo:v${SCHEMA_VERSION}:pendo:anonId`,
} as const
