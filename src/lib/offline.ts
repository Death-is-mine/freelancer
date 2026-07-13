import { openDB, IDBPDatabase } from 'idb'

const DB_NAME = 'freelanceos'
const DB_VERSION = 3

const STORES = [
  'clients',
  'projects',
  'invoices',
  'tasks',
  'leads',
  'agreements',
  'proposals',
  'sync-queue',
  'meta',
]

let dbPromise: Promise<IDBPDatabase> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        for (const store of STORES) {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { keyPath: 'id' })
          }
        }
      },
    })
  }
  return dbPromise
}

export async function getAll<T>(store: string): Promise<T[]> {
  const db = await getDb()
  return db.getAll(store)
}

export async function get<T>(store: string, id: string): Promise<T | undefined> {
  const db = await getDb()
  return db.get(store, id)
}

export async function put<T>(store: string, value: T): Promise<void> {
  const db = await getDb()
  await db.put(store, value)
}

export async function del(store: string, id: string): Promise<void> {
  const db = await getDb()
  await db.delete(store, id)
}

export async function syncAll(): Promise<void> {
  if (typeof window === 'undefined') return
  const keys = [
    'fos_projects',
    'fos_leads',
    'fos_tasks',
    'fos_clients',
    'fos_invoices',
    'fos_agreements',
  ]
  const storeMap: Record<string, string> = {
    fos_projects: 'projects',
    fos_leads: 'leads',
    fos_tasks: 'tasks',
    fos_clients: 'clients',
    fos_invoices: 'invoices',
    fos_agreements: 'agreements',
  }
  for (const key of keys) {
    const raw = localStorage.getItem(key)
    if (!raw) continue
    try {
      const items = JSON.parse(raw)
      const store = storeMap[key]
      if (Array.isArray(items)) {
        for (const item of items) {
          await put(store, item)
        }
      }
    } catch {}
  }
}
