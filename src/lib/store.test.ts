import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'

beforeAll(() =>
  vi.stubGlobal('crypto', { randomUUID: () => '00000000-0000-4000-8000-000000000000' }),
)
afterAll(() => vi.unstubAllGlobals())

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('fos_clients_migrated', '1')
  localStorage.setItem('fos_amounts_migrated_v2', '1')
})

import {
  getClients,
  getProjects,
  getLeads,
  getInvoices,
  getAgreements,
  addProject,
  updateProject,
  deleteProject,
  addLead,
  updateLead,
  deleteLead,
  convertLeadToProject,
  getProjectByLeadEmail,
  getProjectsByClient,
  generateInvoice,
  getInvoiceStatus,
  setInvoiceRecurrence,
  generateAgreement,
  signAgreement,
  addPayment,
  getPayments,
  addComment,
  getComments,
  addProjectFile,
  removeProjectFile,
  getProjectFiles,
  getProjectActivity,
  startTimer,
  stopTimer,
  addManualTime,
  getTotalTimeForProject,
  formatDuration,
  parseAmount,
  formatAmount,
  formatNumber,
  getCurrency,
  setCurrency,
  getRules,
  addRule,
  updateRule,
  deleteRule,
  evaluateRules,
} from './store'

function makeLead(overrides: Record<string, unknown> = {}) {
  return {
    id: 'lead-1',
    name: 'Test Lead',
    email: 'lead@test.com',
    company: 'Acme',
    source: 'Web',
    value: '5000',
    status: 'New',
    date: '2026-07-13',
    createdAt: '2026-07-13T00:00:00.000Z',
    ...overrides,
  }
}

function makeProject(overrides: Record<string, unknown> = {}) {
  return {
    id: 'proj-1',
    client: 'Test Client',
    clientId: '',
    requirement: 'Build app',
    amount: '10000',
    amountStatus: 'Pending',
    dueDate: '2026-08-01',
    invoiceNum: '—',
    agreementNum: '—',
    leadEmail: 'client@test.com',
    createdAt: '2026-07-13T00:00:00.000Z',
    ...overrides,
  }
}

function makeClient(overrides: Record<string, unknown> = {}) {
  return {
    id: 'client-1',
    name: 'Test Client',
    email: 'client@test.com',
    phone: '555-0100',
    company: 'Acme Inc',
    status: 'Active',
    revenue: 0,
    notes: '',
    tags: [],
    createdAt: '2026-07-13T00:00:00.000Z',
    ...overrides,
  }
}

// ── CRUD BASICS ──

describe('CRUD basics', () => {
  it('returns empty arrays initially', () => {
    expect(getClients()).toEqual([])
    expect(getProjects()).toEqual([])
    expect(getLeads()).toEqual([])
    expect(getInvoices()).toEqual([])
    expect(getAgreements()).toEqual([])
  })

  it('getProjects survives migration recursion (regression)', () => {
    localStorage.removeItem('fos_clients_migrated')
    localStorage.removeItem('fos_amounts_migrated_v2')
    expect(getProjects()).toEqual([])
    expect(localStorage.getItem('fos_clients_migrated')).toBe('1')
    expect(localStorage.getItem('fos_amounts_migrated_v2')).toBe('1')
  })
})

// ── LEADS ──

describe('Leads CRUD', () => {
  it('addLead stores and getLeads returns', () => {
    const lead = makeLead()
    addLead(lead)
    const all = getLeads()
    expect(all).toHaveLength(1)
    expect(all[0].name).toBe('Test Lead')
  })

  it('addLead sets createdAt if missing', () => {
    const lead = makeLead({ createdAt: undefined })
    addLead(lead)
    expect(getLeads()[0].createdAt).toBeTruthy()
  })

  it('updateLead merges partial update', () => {
    addLead(makeLead())
    updateLead('lead-1', { status: 'Contacted', value: '8000' })
    expect(getLeads()[0].status).toBe('Contacted')
    expect(getLeads()[0].value).toBe('8000')
    expect(getLeads()[0].name).toBe('Test Lead')
  })

  it('deleteLead removes lead', () => {
    addLead(makeLead())
    deleteLead('lead-1')
    expect(getLeads()).toHaveLength(0)
  })

  it('deleteLead is idempotent for missing id', () => {
    addLead(makeLead())
    deleteLead('nonexistent')
    expect(getLeads()).toHaveLength(1)
  })
})

// ── PROJECTS ──

describe('Projects CRUD', () => {
  it('addProject creates client via resolveClient', () => {
    addProject(makeProject())
    expect(getProjects()).toHaveLength(1)
    const clients = getClients()
    expect(clients.some((c) => c.name === 'Test Client')).toBe(true)
  })

  it('addProject reuses existing client by name', () => {
    localStorage.setItem('fos_clients', JSON.stringify([makeClient()]))
    addProject(makeProject())
    const clients = getClients()
    expect(clients.filter((c) => c.name === 'Test Client')).toHaveLength(1)
  })

  it('addProject sets clientId on project', () => {
    addProject(makeProject())
    expect(getProjects()[0].clientId).toBeTruthy()
  })

  it('updateProject merges partial update', () => {
    addProject(makeProject())
    updateProject('proj-1', { amount: '20000', amountStatus: 'Paid' })
    expect(getProjects()[0].amount).toBe('20000')
    expect(getProjects()[0].amountStatus).toBe('Paid')
  })

  it('deleteProject removes project', () => {
    addProject(makeProject())
    deleteProject('proj-1')
    expect(getProjects()).toHaveLength(0)
  })

  it('getProjectsByClient filters correctly', () => {
    addProject(makeProject())
    addProject(makeProject({ id: 'proj-2', client: 'Other Client' }))
    expect(getProjectsByClient('Test Client')).toHaveLength(1)
  })
})

// ── LEAD CONVERSION ──

describe('Lead conversion', () => {
  it('convertLeadToProject creates project and marks lead converted', () => {
    addLead(makeLead())
    const proj = convertLeadToProject('lead-1')
    expect(proj).not.toBeNull()
    expect(proj!.client).toBe('Test Lead')
    expect(getLeads()[0].status).toBe('Converted')
    expect(getProjects().some((p) => p.id === proj!.id)).toBe(true)
  })

  it('returns null for missing lead', () => {
    expect(convertLeadToProject('nonexistent')).toBeNull()
  })

  it('getProjectByLeadEmail finds project', () => {
    addProject(makeProject())
    expect(getProjectByLeadEmail('client@test.com')).toBeTruthy()
    expect(getProjectByLeadEmail('wrong@test.com')).toBeUndefined()
  })
})

// ── INVOICES ──

describe('Invoices', () => {
  it('generateInvoice returns null for missing project', () => {
    expect(generateInvoice('nonexistent')).toBeNull()
  })

  it('generateInvoice creates invoice and updates project', () => {
    addProject(makeProject())
    const inv = generateInvoice('proj-1')
    expect(inv).not.toBeNull()
    expect(inv!.projectId).toBe('proj-1')
    expect(inv!.number).toMatch(/^INV-\d{3}$/)
    expect(getProjects()[0].invoiceNum).toBe(inv!.number)
  })

  it('assigns sequential invoice numbers', () => {
    addProject(makeProject())
    addProject(makeProject({ id: 'proj-2' }))
    const inv1 = generateInvoice('proj-1')!
    const inv2 = generateInvoice('proj-2')!
    expect(inv1.number).toBe('INV-001')
    expect(inv2.number).toBe('INV-002')
  })

  it('getInvoiceStatus returns paid and due amounts', () => {
    addProject(makeProject())
    const inv = generateInvoice('proj-1')!
    addPayment(inv.id, 3000)
    const status = getInvoiceStatus(inv.id)
    expect(status.paid).toBe(3000)
    expect(status.due).toBeGreaterThan(0)
  })

  it('setInvoiceRecurrence sets next date', () => {
    addProject(makeProject())
    const inv = generateInvoice('proj-1')!
    setInvoiceRecurrence(inv.id, 'monthly')
    const invoices = getInvoices()
    const updated = invoices.find((i) => i.id === inv.id)
    expect(updated!.recurrence).toBe('monthly')
    expect(updated!.recurrenceNext).toBeTruthy()
  })

  it("setInvoiceRecurrence with 'none' clears next date", () => {
    addProject(makeProject())
    const inv = generateInvoice('proj-1')!
    setInvoiceRecurrence(inv.id, 'monthly')
    setInvoiceRecurrence(inv.id, 'none')
    const invoices = getInvoices()
    expect(invoices.find((i) => i.id === inv.id)!.recurrenceNext).toBeNull()
  })
})

// ── AGREEMENTS ──

describe('Agreements', () => {
  it('generateAgreement returns null for missing project', () => {
    expect(generateAgreement('nonexistent')).toBeNull()
  })

  it('generateAgreement creates draft agreement', () => {
    addProject(makeProject())
    const agr = generateAgreement('proj-1')
    expect(agr).not.toBeNull()
    expect(agr!.status).toBe('Draft')
    expect(agr!.signed).toBe(false)
    expect(getProjects()[0].agreementNum).toBe(agr!.number)
  })

  it('signAgreement marks signed', () => {
    addProject(makeProject())
    const agr = generateAgreement('proj-1')!
    signAgreement(agr.id)
    expect(getAgreements()[0].signed).toBe(true)
    expect(getAgreements()[0].status).toBe('Signed')
  })

  it('signAgreement is idempotent', () => {
    addProject(makeProject())
    const agr = generateAgreement('proj-1')!
    signAgreement(agr.id)
    signAgreement(agr.id)
    expect(getAgreements().filter((a) => a.signed).length).toBe(1)
  })
})

// ── PAYMENTS ──

describe('Payments', () => {
  it('addPayment stores payment record', () => {
    addProject(makeProject())
    const inv = generateInvoice('proj-1')!
    const payment = addPayment(inv.id, 5000, 'First payment', 'wire')
    expect(payment).not.toBeNull()
    expect(payment!.amount).toBe(5000)
    expect(payment!.method).toBe('wire')
    expect(getPayments(inv.id)).toHaveLength(1)
  })

  it('addPayment returns null for missing invoice', () => {
    expect(addPayment('nonexistent', 1000)).toBeNull()
  })

  it('addPayment marks invoice Paid when fully covered', () => {
    addProject(makeProject())
    const inv = generateInvoice('proj-1')!
    addPayment(inv.id, 10000)
    const invoices = getInvoices()
    expect(invoices.find((i) => i.id === inv.id)!.status).toBe('Paid')
  })
})

// ── COMMENTS / FILES / ACTIVITY ──

describe('Comments, files, activity', () => {
  it('addComment stores and getComments retrieves', () => {
    addComment('proj-1', 'Alice', '  Great work  ')
    const comments = getComments('proj-1')
    expect(comments).toHaveLength(1)
    expect(comments[0].body).toBe('Great work')
    expect(comments[0].author).toBe('Alice')
  })

  it('addComment skips empty body', () => {
    addComment('proj-1', 'Alice', '   ')
    expect(getComments('proj-1')).toHaveLength(0)
  })

  it('addProjectFile and removeProjectFile roundtrip', () => {
    const file = {
      id: 'f1',
      name: 'doc.pdf',
      driveFileId: '123',
      size: 1024,
      mimeType: 'application/pdf',
      uploadedAt: new Date().toISOString(),
    }
    addProjectFile('proj-1', file)
    expect(getProjectFiles('proj-1')).toHaveLength(1)
    removeProjectFile('proj-1', 'f1')
    expect(getProjectFiles('proj-1')).toHaveLength(0)
  })

  it('getProjectActivity returns entries after update', () => {
    addProject(makeProject())
    updateProject('proj-1', { amount: '20000' })
    const activity = getProjectActivity('proj-1')
    expect(activity.length).toBeGreaterThan(0)
    expect(activity[0].type).toBe('update')
  })
})

// ── TIME ENTRIES ──

describe('Time entries', () => {
  it('startTimer creates a running entry', () => {
    startTimer('proj-1', 'Working on feature')
    const entries = getTotalTimeForProject('proj-1')
    expect(entries).toBe(0)
  })

  it('stopTimer sets end and duration', () => {
    vi.useFakeTimers()
    startTimer('proj-1', 'Feature X')
    vi.advanceTimersByTime(3600000)
    stopTimer('proj-1', '00000000')
    vi.useRealTimers()
    const total = getTotalTimeForProject('proj-1')
    expect(total).toBeGreaterThan(0)
  })

  it('addManualTime creates entry with specified duration', () => {
    addManualTime('proj-1', 'Meeting', 30)
    const total = getTotalTimeForProject('proj-1')
    expect(total).toBeGreaterThanOrEqual(30 * 60000)
  })

  it('formatDuration returns readable string', () => {
    expect(formatDuration(0)).toBe('0m')
    expect(formatDuration(3600000)).toBe('1h 0m')
    expect(formatDuration(5400000)).toBe('1h 30m')
    expect(formatDuration(600000)).toBe('10m')
  })
})

// ── CURRENCY ──

describe('Currency helpers', () => {
  it('default currency is USD', () => {
    expect(getCurrency()).toBe('USD')
  })

  it('setCurrency stores the code', () => {
    setCurrency('EUR')
    expect(getCurrency()).toBe('EUR')
  })

  it('parseAmount strips non-numeric characters', () => {
    expect(parseAmount('$1,234.56')).toBe(1234.56)
    expect(parseAmount('₹5,000')).toBe(5000)
    expect(parseAmount('0')).toBe(0)
    expect(parseAmount('')).toBe(0)
  })

  it('formatAmount returns formatted string', () => {
    const result = formatAmount('5000')
    expect(result).toContain('5')
  })

  it('formatNumber returns formatted number', () => {
    const result = formatNumber(10000)
    expect(result).toContain('10')
  })
})

// ── RULE ENGINE ──

describe('Rule engine', () => {
  it('getRules returns defaults when none stored', () => {
    const rules = getRules()
    expect(rules.length).toBeGreaterThanOrEqual(3)
    expect(rules.some((r) => r.trigger === 'lead.created')).toBe(true)
  })

  it('addRule prepends to list', () => {
    const rule = {
      id: 'custom-1',
      name: 'Custom',
      trigger: 'lead.created' as const,
      action: 'notify' as const,
      config: 'Test',
      enabled: true,
    }
    addRule(rule)
    expect(getRules()[0].id).toBe('custom-1')
  })

  it('updateRule merges partial', () => {
    updateRule('r1', { enabled: false })
    expect(getRules().find((r) => r.id === 'r1')!.enabled).toBe(false)
  })

  it('deleteRule removes by id', () => {
    deleteRule('r1')
    expect(getRules().find((r) => r.id === 'r1')).toBeUndefined()
  })

  it('evaluateRules notify action creates notification', () => {
    localStorage.setItem(
      'fos_rules',
      JSON.stringify([
        {
          id: 't1',
          name: 'Test',
          trigger: 'lead.created',
          action: 'notify',
          config: 'New lead: {name}',
          enabled: true,
        },
      ]),
    )
    evaluateRules('lead.created', { name: 'John' })
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('fos_notification_'))
    expect(keys.length).toBeGreaterThanOrEqual(1)
    const notif = JSON.parse(localStorage.getItem(keys[0])!)
    expect(notif.msg).toBe('New lead: John')
  })

  it('evaluateRules create_task action adds task', () => {
    localStorage.setItem(
      'fos_rules',
      JSON.stringify([
        {
          id: 't2',
          name: 'Task on create',
          trigger: 'lead.created',
          action: 'create_task',
          config: 'Follow up with {name}',
          enabled: true,
        },
      ]),
    )
    evaluateRules('lead.created', { name: 'Jane', projectId: 'p1' })
    const tasks = JSON.parse(localStorage.getItem('fos_tasks')!)
    expect(tasks[0].title).toBe('Follow up with Jane')
    expect(tasks[0].done).toBe(false)
  })

  it('evaluateRules update_status action modifies project', () => {
    addProject(makeProject())
    localStorage.setItem(
      'fos_rules',
      JSON.stringify([
        {
          id: 't3',
          name: 'Auto-archive',
          trigger: 'project.status_changed',
          action: 'update_status',
          config: 'Paid',
          enabled: true,
        },
      ]),
    )
    evaluateRules('project.status_changed', { projectId: 'proj-1' })
    expect(getProjects()[0].amountStatus).toBe('Paid')
  })

  it('evaluateRules send_email queues email', () => {
    localStorage.setItem(
      'fos_rules',
      JSON.stringify([
        {
          id: 't4',
          name: 'Email on overdue',
          trigger: 'invoice.overdue',
          action: 'send_email',
          config: 'Invoice overdue for {client}',
          enabled: true,
        },
      ]),
    )
    evaluateRules('invoice.overdue', { client: 'Acme', email: 'billing@acme.com' })
    const pending = JSON.parse(localStorage.getItem('fos_pending_emails')!)
    expect(pending[0].subject).toContain('Acme')
    expect(pending[0].to).toBe('billing@acme.com')
  })

  it('evaluateRules does not fire disabled rules', () => {
    localStorage.setItem(
      'fos_rules',
      JSON.stringify([
        {
          id: 't5',
          name: 'Disabled',
          trigger: 'lead.created',
          action: 'notify',
          config: 'Should not fire',
          enabled: false,
        },
      ]),
    )
    evaluateRules('lead.created', { name: 'Ghost' })
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('fos_notification_'))
    expect(keys).toHaveLength(0)
  })

  it('evaluateRules does not fire on wrong trigger', () => {
    localStorage.setItem(
      'fos_rules',
      JSON.stringify([
        {
          id: 't6',
          name: 'Wrong trigger',
          trigger: 'invoice.overdue',
          action: 'notify',
          config: 'Wrong',
          enabled: true,
        },
      ]),
    )
    evaluateRules('lead.created', { name: 'X' })
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('fos_notification_'))
    expect(keys).toHaveLength(0)
  })

  it('evaluateRules with no matching rules does nothing', () => {
    const keysBefore = Object.keys(localStorage).filter((k) => k.startsWith('fos_'))
    evaluateRules('invoice.generated', { name: 'X' })
    const keysAfter = Object.keys(localStorage).filter((k) => k.startsWith('fos_'))
    expect(keysAfter).toEqual(keysBefore)
  })
})
