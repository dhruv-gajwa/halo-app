/**
 * Demo session bootstrap data — creates or reuses a default visitor/workspace
 * when no auth session exists so `/app/*` routes work without sign-in.
 */

import { nanoid } from 'nanoid'
import { K, writeJSON } from '../storage'
import { findVisitorByEmail, listVisitors, listWorkspaces } from './authRepo'
import type { Visitor, Workspace } from './types'

const DEMO_EMAIL = 'dhruv.gajwa@pendo.io'

/** Precomputed SHA-256 hex of 'hunter2' — demo password if sign-in is used. */
const DEMO_PASSWORD_HASH =
  'f52fbd32b2b3b86ff88ef6c490628285f482af15ddcb29541f94bcf526a3f6c7'

export function getOrCreateDemoCredentials(): { visitor: Visitor; workspace: Workspace } {
  let visitor = findVisitorByEmail(DEMO_EMAIL)
  let workspace = visitor
    ? listWorkspaces().find((w) => w.ownerVisitorId === visitor!.id)
    : undefined

  if (!visitor) {
    visitor = createDemoVisitor()
  }
  if (!workspace) {
    workspace = createDemoWorkspace(visitor.id)
  }

  return { visitor, workspace }
}

function createDemoVisitor(): Visitor {
  const visitor: Visitor = {
    id: nanoid(),
    email: DEMO_EMAIL,
    passwordHash: DEMO_PASSWORD_HASH,
    firstName: 'Demo',
    lastName: 'User',
    username: 'demo',
    jobTitle: 'Product Manager',
    role: 'Product',
    yearsExperience: 5,
    location: 'San Francisco, CA',
    primaryUseCase: 'Project management',
    teamSize: 8,
    topGoals: ['Ship faster', 'Better visibility'],
    createdAt: new Date().toISOString(),
  }
  writeJSON(K.visitors(), [...listVisitors(), visitor])
  return visitor
}

function createDemoWorkspace(ownerVisitorId: string): Workspace {
  const workspace: Workspace = {
    id: nanoid(),
    ownerVisitorId,
    companyName: 'Halo Demo Co',
    companySize: '11–50',
    industry: 'Software',
    planTier: 'Pro',
    createdAt: new Date().toISOString(),
  }
  writeJSON(K.workspaces(), [...listWorkspaces(), workspace])
  return workspace
}
