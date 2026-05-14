/**
 * Halo tasks barrel.
 *
 * Single import target for the Phase 3 tasks surface — schemas, types,
 * the repo (Phase 3 reads, Phase 4 writers), and the display-label map.
 *
 * Convention: `export *` for schemas / types / repo / labels where the
 * file IS the surface; the seeder will be re-exported here by Plan 03-03
 * once `src/tasks/tasksSeed.ts` is created.
 */
export * from './schemas'
export * from './types'
export * from './tasksRepo'
export * from './labels'
