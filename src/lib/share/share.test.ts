import { describe, it, expect, beforeEach } from "vitest"
import { mkdtempSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"
import { createJsonRepo } from "./json-repo"
import { toPublicView, generateToken, generateId, type ShareData } from "./types"

let tmpFile: string
let repo: ReturnType<typeof createJsonRepo>

beforeEach(() => {
  tmpFile = join(mkdtempSync(join(tmpdir(), "share-test-")), "shares.json")
  repo = createJsonRepo(tmpFile)
})

function makeShare(overrides: Partial<ShareData> = {}): ShareData {
  return {
    id: generateId(),
    projectId: "proj-1",
    token: generateToken(),
    enabled: true,
    createdAt: new Date().toISOString(),
    expiresAt: null,
    projectSnapshot: { client: "Test", requirement: "Build app", amount: "5000", amountStatus: "Active", dueDate: "2026-08-01", invoiceNum: "INV-001", agreementNum: "AGR-001", ownerEmail: "test@test.com", _private: "secret" },
    ownerId: "user-1",
    ...overrides,
  }
}

describe("ShareRepository (JSON)", () => {
  it("creates a share with unique token", async () => {
    const s1 = await repo.create({ projectId: "p1", projectSnapshot: { client: "A" }, expiresAt: null, enabled: true, ownerId: "u1" })
    const s2 = await repo.create({ projectId: "p2", projectSnapshot: { client: "B" }, expiresAt: null, enabled: true, ownerId: "u1" })
    expect(s1.token).toBeTruthy()
    expect(s2.token).toBeTruthy()
    expect(s1.token).not.toBe(s2.token)
    expect(s1.id).not.toBe(s2.id)
  })

  it("getByToken returns share for valid token", async () => {
    const s = await repo.create({ projectId: "p3", projectSnapshot: { client: "C" }, expiresAt: null, enabled: true, ownerId: "u1" })
    const found = await repo.getByToken(s.token)
    expect(found).not.toBeNull()
    expect(found!.id).toBe(s.id)
  })

  it("getByToken returns null for unknown token", async () => {
    const found = await repo.getByToken("nonexistent-token")
    expect(found).toBeNull()
  })

  it("revoke disables share", async () => {
    const s = await repo.create({ projectId: "p4", projectSnapshot: { client: "D" }, expiresAt: null, enabled: true, ownerId: "u1" })
    const ok = await repo.revoke(s.id, "u1")
    expect(ok).toBe(true)
    const found = await repo.getByToken(s.token)
    expect(found).not.toBeNull()
    expect(found!.enabled).toBe(false)
  })

  it("revoke returns false for wrong owner", async () => {
    const s = await repo.create({ projectId: "p5", projectSnapshot: { client: "E" }, expiresAt: null, enabled: true, ownerId: "u1" })
    const ok = await repo.revoke(s.id, "u2")
    expect(ok).toBe(false)
  })

  it("list returns only owner's shares", async () => {
    await repo.create({ projectId: "p6", projectSnapshot: { client: "F" }, expiresAt: null, enabled: true, ownerId: "u1" })
    await repo.create({ projectId: "p7", projectSnapshot: { client: "G" }, expiresAt: null, enabled: true, ownerId: "u2" })
    const u1Shares = await repo.list("u1")
    expect(u1Shares.every((s) => s.ownerId === "u1")).toBe(true)
  })

  it("listByProject filters by project and owner", async () => {
    await repo.create({ projectId: "p8", projectSnapshot: { client: "H" }, expiresAt: null, enabled: true, ownerId: "u1" })
    const result = await repo.listByProject("p8", "u1")
    expect(result.length).toBeGreaterThanOrEqual(1)
    expect(result.every((s) => s.projectId === "p8" && s.ownerId === "u1")).toBe(true)
  })

  it("cleanupExpired removes expired shares", async () => {
    const past = new Date(Date.now() - 86400000).toISOString()
    await repo.create({ projectId: "p9", projectSnapshot: { client: "I" }, expiresAt: past, enabled: true, ownerId: "u1" })
    const removed = await repo.cleanupExpired()
    expect(removed).toBeGreaterThanOrEqual(1)
  })
})

describe("toPublicView", () => {
  it("returns public view with only approved fields", () => {
    const share = makeShare()
    const view = toPublicView(share)!
    expect(view.project.client).toBe("Test")
    expect(view.project.requirement).toBe("Build app")
    expect(view.project.amount).toBe("5000")
    expect(Object.keys(view.project)).toEqual(["client", "requirement", "amount", "amountStatus", "dueDate", "invoiceNum", "agreementNum"])
  })

  it("does not expose internal fields", () => {
    const share = makeShare()
    const view = toPublicView(share)!
    const json = JSON.stringify(view)
    expect(json).not.toContain("ownerEmail")
    expect(json).not.toContain("_private")
  })

  it("returns null for revoked share", () => {
    const share = makeShare({ enabled: false })
    expect(toPublicView(share)).toBeNull()
  })

  it("returns null for expired share", () => {
    const share = makeShare({ expiresAt: new Date(Date.now() - 1000).toISOString() })
    expect(toPublicView(share)).toBeNull()
  })
})

describe("token generation", () => {
  it("generates unique tokens", () => {
    const tokens = new Set(Array.from({ length: 100 }, () => generateToken()))
    expect(tokens.size).toBe(100)
  })

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()))
    expect(ids.size).toBe(100)
  })
})
