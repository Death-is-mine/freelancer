"use client"

import { useEffect, useState } from "react"
import { popUndo, popRedo, useUndoCount } from "@/lib/undo"
import { put, del } from "@/lib/offline"

export function UndoHandler() {
  const [msg, setMsg] = useState("")
  useUndoCount()

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        const action = popUndo()
        if (!action) return
        if (action.type === "delete") {
          put(action.store, action.item).then(() => setMsg("Undo delete"))
        }
        setTimeout(() => setMsg(""), 2000)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault()
        const action = popRedo()
        if (!action) return
        if (action.type === "delete") {
          del(action.store, (action.item as { id: string }).id).then(() => setMsg("Redo delete"))
        }
        setTimeout(() => setMsg(""), 2000)
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  return (
    <>
      {msg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] bg-on-surface text-surface px-4 py-2 rounded-xl shadow-lg text-label-sm animate-fade-in" role="status" aria-live="polite">
          {msg}
        </div>
      )}
    </>
  )
}
