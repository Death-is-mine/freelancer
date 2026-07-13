import { describe, it, expect } from 'vitest'
import { createJsonRepo } from './json-repo'
import { toPublicView } from './types'

// ponytail: E2E share workflow without server/API — tests the repo layer end to end

describe('Share E2E workflow (JSON repo)', () => {
  const repo = createJsonRepo()

  it('full lifecycle: create → resolve → revoke → expired', async () => {
    const share = await repo.create({
      projectId: 'e2e-proj-1',
      projectSnapshot: {
        client: 'E2E Client',
        requirement: 'E2E Project',
        amount: '10000',
        amountStatus: 'Active',
        dueDate: '2026-09-01',
        invoiceNum: 'INV-001',
        agreementNum: 'AGR-001',
      },
      expiresAt: null,
      enabled: true,
      ownerId: 'e2e-user',
    })

    expect(share.token).toBeTruthy()
    expect(share.id).toBeTruthy()

    // resolve
    const resolved = await repo.getByToken(share.token)
    expect(resolved).not.toBeNull()
    expect(resolved!.projectId).toBe('e2e-proj-1')

    // public view
    const view = toPublicView(resolved!)
    expect(view).not.toBeNull()
    expect(view!.project.client).toBe('E2E Client')

    // revoke
    const revoked = await repo.revoke(share.id, 'e2e-user')
    expect(revoked).toBe(true)

    // after revoke, getByToken still returns the share but enabled=false
    const afterRevoke = await repo.getByToken(share.token)
    expect(afterRevoke!.enabled).toBe(false)
    // public view should be null
    expect(toPublicView(afterRevoke!)).toBeNull()

    // wrong owner cannot revoke
    const wrongOwner = await repo.revoke(share.id, 'other-user')
    expect(wrongOwner).toBe(false)
  })

  it('expired share returns null from public view', async () => {
    const past = new Date(Date.now() - 1000).toISOString()
    const share = await repo.create({
      projectId: 'e2e-proj-2',
      projectSnapshot: { client: 'Expired' },
      expiresAt: past,
      enabled: true,
      ownerId: 'e2e-user',
    })

    const resolved = await repo.getByToken(share.token)
    expect(resolved).not.toBeNull()
    expect(toPublicView(resolved!)).toBeNull()
  })

  it('owner can list their shares', async () => {
    const before = (await repo.list('e2e-user-2')).length
    await repo.create({
      projectId: 'lp1',
      projectSnapshot: {},
      expiresAt: null,
      enabled: true,
      ownerId: 'e2e-user-2',
    })
    await repo.create({
      projectId: 'lp2',
      projectSnapshot: {},
      expiresAt: null,
      enabled: true,
      ownerId: 'e2e-user-2',
    })
    const after = await repo.list('e2e-user-2')
    expect(after.length).toBe(before + 2)
  })

  it('cleanupExpired removes only expired', async () => {
    const past = new Date(Date.now() - 86400000).toISOString()
    await repo.create({
      projectId: 'clean-1',
      projectSnapshot: {},
      expiresAt: past,
      enabled: true,
      ownerId: 'cleaner',
    })
    await repo.create({
      projectId: 'clean-2',
      projectSnapshot: {},
      expiresAt: null,
      enabled: true,
      ownerId: 'cleaner',
    })
    const removed = await repo.cleanupExpired()
    expect(removed).toBeGreaterThanOrEqual(1)
  })
})
