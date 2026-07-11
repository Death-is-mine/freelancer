"use client"

import { useState, useEffect, useCallback } from "react"

type Task = {
  id: string
  title: string
  priority: string
  project: string
  date: string
  done: boolean
}

const priorityColors: Record<string, string> = {
  Urgent: "bg-error",
  High: "bg-primary",
  Medium: "bg-secondary",
  Normal: "bg-secondary",
  Low: "bg-surface-variant",
}

function lsTasks(): Task[] {
  if (typeof window === "undefined") return []
  try {
    const v = localStorage.getItem("fos_tasks")
    return v ? JSON.parse(v) : []
  } catch { return [] }
}

function saveTasks(tasks: Task[]) {
  try { localStorage.setItem("fos_tasks", JSON.stringify(tasks)) } catch {}
}

const defaults: Task[] = [
  { id: "1", title: "Finalize Lumina branding assets", priority: "High", project: "Lumina", date: "Today", done: false },
  { id: "2", title: "Send Q4 invoice to Stellar Media", priority: "Medium", project: "Apex Systems", date: "Today", done: false },
  { id: "3", title: "Review Nexus Systems proposal", priority: "Urgent", project: "Nexus", date: "Today", done: false },
  { id: "4", title: "Update project timeline", priority: "Low", project: "Internal", date: "Tomorrow", done: false },
  { id: "5", title: "Team standup meeting", priority: "Normal", project: "Team", date: "Today", done: false },
]

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(lsTasks)
  const [showInput, setShowInput] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [filter, setFilter] = useState<"all" | "active" | "done">("all")

  useEffect(() => {
    const stored = lsTasks()
    if (stored.length === 0) {
      saveTasks(defaults)
      setTasks(defaults)
    }
  }, [])

  const persist = useCallback((fn: (prev: Task[]) => Task[]) => {
    setTasks((prev) => {
      const next = fn(prev)
      saveTasks(next)
      return next
    })
  }, [])

  const addTask = () => {
    const title = newTitle.trim()
    if (!title) return
    persist((prev) => [
      { id: Date.now().toString(), title, priority: "Normal", project: "General", date: "Today", done: false },
      ...prev,
    ])
    setNewTitle("")
    setShowInput(false)
  }

  const toggleTask = (id: string) => {
    persist((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  const deleteTask = (id: string) => {
    persist((prev) => prev.filter((t) => t.id !== id))
  }

  const visible = tasks.filter((t) => {
    if (filter === "active") return !t.done
    if (filter === "done") return t.done
    return true
  })

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-headline-lg tracking-tight text-on-surface">Tasks</h2>
          <p className="text-body-md text-on-surface-variant mt-1">{tasks.filter((t) => !t.done).length} remaining</p>
        </div>
        <button
          onClick={() => setShowInput(true)}
          className="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-body-md font-semibold flex items-center gap-2 shadow-lg shadow-primary/10"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">add</span>
          New Task
        </button>
      </div>

      {showInput && (
        <div className="mb-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-4">
          <form
            onSubmit={(e) => { e.preventDefault(); addTask() }}
            onKeyDown={(e) => { if (e.key === "Escape") setShowInput(false) }}
          >
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What needs to be done?"
              aria-label="New task title"
              className="w-full bg-transparent border-none outline-none text-body-lg text-on-surface placeholder:text-on-surface-variant/70 mb-3"
            />
            <div className="flex items-center gap-2">
              <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-on-primary text-label-md font-semibold">
                Add Task
              </button>
              <button type="button" onClick={() => { setShowInput(false); setNewTitle("") }} className="px-4 py-2 rounded-lg text-label-md text-on-surface-variant hover:bg-surface-container-high">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
        {(["all", "active", "done"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-label-md capitalize ${
              filter === f ? "bg-primary/10 text-primary font-semibold" : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-sm overflow-hidden">
        {visible.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3" aria-hidden="true">check_circle</span>
            <p className="text-body-md text-on-surface-variant">{filter === "done" ? "No completed tasks yet" : "All tasks are done!"}</p>
          </div>
        ) : (
          visible.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-4 px-6 py-4 border-b border-outline-variant/5 last:border-0 hover:bg-surface-container/50 transition-colors group ${task.done ? "opacity-50" : ""}`}
            >
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleTask(task.id)}
                aria-label={`Mark "${task.title}" as ${task.done ? "incomplete" : "complete"}`}
                className="w-4 h-4 rounded border-outline text-primary focus:ring-primary cursor-pointer"
              />
              <div className="flex-1 min-w-0">
                <p className={`text-body-md ${task.done ? "line-through text-on-surface-variant/70" : "text-on-surface"}`}>{task.title}</p>
                <p className="text-label-sm text-on-surface-variant mt-0.5">
                  {task.priority} &bull; {task.project} &bull; {task.date}
                </p>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant opacity-0 group-hover:opacity-100 transition-all"
                aria-label={`Delete ${task.title}`}
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">close</span>
              </button>
              <div className={`w-2 h-2 rounded-full shrink-0 ${priorityColors[task.priority] || "bg-secondary"}`}></div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
