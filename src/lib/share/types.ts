export interface ShareData {
  id: string
  projectId: string
  token: string
  enabled: boolean
  createdAt: string
  expiresAt: string | null
  projectSnapshot: Record<string, unknown>
  ownerId: string
}

export interface PublicShareView {
  project: {
    id: string
    client: string
    requirement: string
    amount: string
    amountStatus: string
    dueDate: string
    invoiceNum: string
    agreementNum: string
  }
}

export interface ShareRepository {
  create(data: Omit<ShareData, 'id' | 'token' | 'createdAt'>): Promise<ShareData>
  getByToken(token: string): Promise<ShareData | null>
  revoke(id: string, ownerId: string): Promise<boolean>
  list(ownerId: string): Promise<ShareData[]>
  listByProject(projectId: string, ownerId: string): Promise<ShareData[]>
  cleanupExpired(): Promise<number>
}

export function toPublicView(share: ShareData): PublicShareView | null {
  if (!share.enabled) return null
  if (share.expiresAt && new Date(share.expiresAt) < new Date()) return null
  const s = share.projectSnapshot as Record<string, string>
  return {
    project: {
      id: s.id || '',
      client: s.client || '',
      requirement: s.requirement || '',
      amount: s.amount || '',
      amountStatus: s.amountStatus || '',
      dueDate: s.dueDate || '',
      invoiceNum: s.invoiceNum || '',
      agreementNum: s.agreementNum || '',
    },
  }
}

export function generateToken(): string {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, 24)
}

export function generateId(): string {
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, 12)
}
