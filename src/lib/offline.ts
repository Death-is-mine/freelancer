import { openDB, IDBPDatabase } from "idb"

const DB_NAME = "freelanceos"
const DB_VERSION = 3

const STORES = ["clients", "projects", "invoices", "tasks", "leads", "agreements", "proposals", "sync-queue", "meta"]

let dbPromise: Promise<IDBPDatabase> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        for (const store of STORES) {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { keyPath: "id" })
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
