"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { getProjects, updateProject, deleteProject, getProjectActivity, getProjectFiles, addProjectFile, removeProjectFile, generateInvoice, generateAgreement, addShare, getProjectShares, evaluateRules, type ActivityEntry, type ProjectFile } from "@/lib/store"

interface ProjectTask { id: string; title?: string; text?: string; done: boolean; projectId?: string }

function lsGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback }
}

function lsSet(key: string, data: unknown) {
  try { localStorage.setItem(key, JSON.stringify(data)) } catch {}
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
}

function ProjectFiles({ projectId }: { projectId: string }) {
  const [files, setFiles] = useState<ProjectFile[]>(getProjectFiles(projectId))
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const refresh = () => setFiles([...getProjectFiles(projectId)])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const body = new FormData()
      body.append("file", file)
      const res = await fetch("/api/drive/upload", { method: "POST", body })
      const data = await res.json()
      if (data.id) {
        addProjectFile(projectId, { id: crypto.randomUUID().slice(0, 8), name: file.name, driveFileId: data.id, size: file.size, mimeType: file.type, uploadedAt: new Date().toISOString() })
        refresh()
      }
    } catch {}
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ""
  }

  async function handleDelete(fileId: string, driveFileId: string) {
    try {
      await fetch(`/api/drive/delete?fileId=${driveFileId}`, { method: "DELETE" })
    } catch {}
    removeProjectFile(projectId, fileId)
    refresh()
  }

  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/5">
      <h3 className="text-label-md text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">folder</span>
        Files
      </h3>
      <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
      <button onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full py-3 rounded-xl border-2 border-dashed border-outline-variant/30 text-on-surface-variant hover:border-primary/30 hover:text-primary transition-all text-body-md font-medium flex items-center justify-center gap-2 mb-4">
        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{uploading ? "sync" : "upload_file"}</span>
        {uploading ? "Uploading..." : "Upload File"}
      </button>
      {files.length === 0 ? (
        <p className="text-body-md text-on-surface-variant/60 text-center py-4">No files uploaded yet</p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {files.map((f) => (
            <div key={f.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-container-high group transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant" aria-hidden="true">description</span>
              <div className="flex-1 min-w-0">
                <a href={`https://drive.google.com/file/d/${f.driveFileId}/view`} target="_blank" rel="noopener noreferrer" className="text-body-md font-medium text-on-surface hover:text-primary truncate block">{f.name}</a>
                <p className="text-label-sm text-on-surface-variant/60">{(f.size / 1024).toFixed(0)} KB</p>
              </div>
              <button onClick={() => handleDelete(f.id, f.driveFileId)} className="opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Delete ${f.name}`}>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant/50 hover:text-error" aria-hidden="true">delete</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ActivityFeed({ entries }: { entries: ActivityEntry[] }) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/5">
      <h3 className="text-label-md text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">history</span>
        Activity
      </h3>
      {entries.length === 0 ? (
        <p className="text-body-md text-on-surface-variant/60 text-center py-4">No activity yet</p>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {entries.slice(0, 20).map((e) => (
            <div key={e.id} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary/40 mt-2 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-body-md text-on-surface">{e.text}</p>
                <p className="text-label-sm text-on-surface-variant/60">{formatTime(e.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const project = (mounted ? getProjects() : []).find((p) => p.id === id)!
  const [editing, setEditing] = useState(false)
  const [edit, setEdit] = useState({ client: "", requirement: "", amount: "", dueDate: "", leadEmail: "" })
  const [toast, setToast] = useState<{ show: boolean; msg: string }>({ show: false, msg: "" })
  const [notes, setNotes] = useState(lsGet<string>(`fos_notes_${id}`, ""))
  const [noteSaved, setNoteSaved] = useState(false)
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([])
  const [newTaskText, setNewTaskText] = useState("")

  const activity = getProjectActivity(id)

  useEffect(() => {
    if (!editing) return
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setEditing(false) }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [editing])

  useEffect(() => {
    if (!notes) return
    const t = setTimeout(() => { lsSet(`fos_notes_${id}`, notes); setNoteSaved(true); setTimeout(() => setNoteSaved(false), 2000) }, 800)
    return () => clearTimeout(t)
  }, [notes, id])

  useEffect(() => {
    const all = lsGet<ProjectTask[]>("fos_tasks", [])
    setProjectTasks(all.filter((t) => t.projectId === id))
  }, [id])

  function syncAll(fn: (tasks: ProjectTask[]) => ProjectTask[]) {
    const all = lsGet<ProjectTask[]>("fos_tasks", [])
    const next = fn(all)
    lsSet("fos_tasks", next)
    setProjectTasks(next.filter((t) => t.projectId === id))
  }

  const addTask = () => {
    if (!newTaskText.trim()) return
    syncAll((all) => [{ id: crypto.randomUUID().slice(0, 6), title: newTaskText.trim(), done: false, projectId: id, project: project?.client || "General", priority: "Normal", date: "Today" }, ...all])
    setNewTaskText("")
  }

  const toggleTask = (taskId: string) => {
    syncAll((all) => all.map((t) => t.id === taskId ? { ...t, done: !t.done } : t))
  }

  const removeTask = (taskId: string) => {
    syncAll((all) => all.filter((t) => t.id !== taskId))
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4" aria-hidden="true">folder_off</span>
        <h2 className="text-headline-md text-on-surface mb-2">Project not found</h2>
        <p className="text-body-md text-on-surface-variant">This project does not exist or may have been deleted.</p>
        <button onClick={() => router.push("/projects")} className="mt-6 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-body-md">Back to Projects</button>
      </div>
    )
  }

  const amountNum = Number(project.amount.replace(/[^0-9.]/g, "")) || 0
  const paid = project.amountStatus === "Paid" ? amountNum : 0
  const due = amountNum - paid

  function startEdit() {
    setEdit({ client: project.client, requirement: project.requirement, amount: project.amount, dueDate: project.dueDate, leadEmail: project.leadEmail })
    setEditing(true)
  }

  function saveEdit() {
    if (!edit.client.trim() || !edit.requirement.trim()) return
    updateProject(project.id, { client: edit.client, requirement: edit.requirement, amount: edit.amount, dueDate: edit.dueDate, leadEmail: edit.leadEmail })
    setEditing(false)
    setToast({ show: true, msg: "Project updated" })
    setTimeout(() => setToast({ show: false, msg: "" }), 3000)
  }

  function handleDelete() {
    deleteProject(project.id)
    router.push("/projects")
  }

  function handleArchive() {
    updateProject(project.id, { amountStatus: "Paid" })
    setToast({ show: true, msg: "Project archived" })
    setTimeout(() => setToast({ show: false, msg: "" }), 3000)
  }

  return (
    <div>
      <nav className="flex items-center gap-2 text-on-surface-variant mb-6">
        <button onClick={() => router.push("/projects")} className="flex items-center gap-1 text-label-md text-primary hover:underline">
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_back</span>
          Projects
        </button>
        <span className="text-on-surface-variant/30">/</span>
        <span className="text-label-md font-semibold text-on-surface">{project.client}</span>
      </nav>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-headline-xl tracking-tight text-on-surface font-bold">{project.requirement}</h2>
          <p className="text-body-lg text-on-surface-variant mt-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">person</span>
            <Link href={`/clients/${encodeURIComponent(project.client)}`} className="text-primary hover:underline font-medium">{project.client}</Link>
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={startEdit} className="px-4 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface font-semibold text-label-md hover:bg-surface-container-low flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">edit</span>
            Edit
          </button>
          <button onClick={handleArchive} className="px-4 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface font-semibold text-label-md hover:bg-surface-container-low flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">archive</span>
            Archive
          </button>
          <button onClick={handleDelete} className="px-4 py-2.5 rounded-xl border border-error/30 text-error font-semibold text-label-md hover:bg-error/5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">delete</span>
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/5">
          <p className="text-label-md text-on-surface-variant">Total Budget</p>
          <h3 className="text-headline-md font-bold mt-1">{project.amount}</h3>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/5">
          <p className="text-label-md text-on-surface-variant">Paid</p>
          <h3 className="text-headline-md font-bold mt-1 text-secondary">${paid.toLocaleString()}</h3>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/5">
          <p className="text-label-md text-on-surface-variant">Outstanding</p>
          <h3 className="text-headline-md font-bold mt-1 text-error">${due.toLocaleString()}</h3>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/5">
          <p className="text-label-md text-on-surface-variant">Status</p>
          <select value={project.amountStatus} onChange={(e) => { const old = project.amountStatus; updateProject(project.id, { amountStatus: e.target.value }); if (old !== e.target.value) evaluateRules("project.status_changed", { projectId: project.id, client: project.client, status: e.target.value, old }); setToast({ show: true, msg: `Status: ${e.target.value}` }); setTimeout(() => setToast({ show: false, msg: "" }), 2000) }} aria-label="Payment status" className={`mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border-0 outline-none ${project.amountStatus === "Paid" ? "bg-secondary-container text-on-secondary-container" : project.amountStatus === "Overdue" ? "bg-error-container text-on-error-container" : "bg-surface-container-high text-on-surface-variant"}`}>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/5 col-span-1">
          <h3 className="text-label-md text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">info</span>
            Details
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-body-md text-on-surface-variant">Client</span><Link href={`/clients/${encodeURIComponent(project.client)}`} className="text-body-md font-semibold text-primary hover:underline">{project.client}</Link></div>
            <div className="flex justify-between"><span className="text-body-md text-on-surface-variant">Due Date</span><span className="text-body-md font-semibold text-on-surface">{project.dueDate}</span></div>
            <div className="flex justify-between"><span className="text-body-md text-on-surface-variant">Email</span><span className="text-body-md font-semibold text-on-surface">{project.leadEmail || "—"}</span></div>
            <div className="flex justify-between"><span className="text-body-md text-on-surface-variant">Invoice</span><span className="text-body-md font-semibold text-on-surface">{project.invoiceNum}</span></div>
            <div className="flex justify-between"><span className="text-body-md text-on-surface-variant">Agreement</span><span className="text-body-md font-semibold text-on-surface">{project.agreementNum}</span></div>
            <div className="flex justify-between"><span className="text-body-md text-on-surface-variant">Shares</span><span className="text-body-md font-semibold text-on-surface">{getProjectShares(project.id).filter((s) => s.enabled).length} active</span></div>
          </div>
        </div>

        <ProjectFiles projectId={id} />

        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/5">
          <h3 className="text-label-md text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">assignment</span>
            Tasks
          </h3>
          <div className="flex gap-2 mb-4">
            <input value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addTask() }} placeholder="Add a task..." className="flex-1 bg-surface-container-high border-none rounded-lg px-3 py-2 text-body-md outline-none focus:ring-2 focus:ring-primary/20" aria-label="New task" />
            <button onClick={addTask} className="px-3 py-2 rounded-lg bg-primary text-on-primary text-label-md font-semibold" aria-label="Add task">
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">add</span>
            </button>
          </div>
          {projectTasks.length === 0 ? (
            <p className="text-body-md text-on-surface-variant/60 text-center py-4">No tasks yet</p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {projectTasks.map((t) => (
                <div key={t.id} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-surface-container-high group transition-colors">
                  <button onClick={() => toggleTask(t.id)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${t.done ? "bg-secondary border-secondary" : "border-outline-variant group-hover:border-primary"}`} aria-label={t.done ? "Mark incomplete" : "Mark complete"}>
                    {t.done && <span className="material-symbols-outlined text-[12px] text-white" aria-hidden="true">check</span>}
                  </button>
                  <span className={`flex-1 text-body-md ${t.done ? "line-through text-on-surface-variant/50" : "text-on-surface"}`}>{t.title || t.text}</span>
                  <button onClick={() => removeTask(t.id)} className="opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Delete ${t.title || t.text}`}>
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant/50 hover:text-error" aria-hidden="true">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/5">
          <h3 className="text-label-md text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">bolt</span>
            Actions
          </h3>
          <div className="space-y-2">
            <button onClick={() => { generateInvoice(project.id); evaluateRules("invoice.generated", { projectId: project.id, client: project.client, number: project.invoiceNum }); setToast({ show: true, msg: `Invoice ${project.invoiceNum === "—" ? "generated" : "regenerated"}` }); setTimeout(() => setToast({ show: false, msg: "" }), 2000) }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container-high transition-colors text-left">
              <span className="material-symbols-outlined text-on-surface-variant" aria-hidden="true">receipt</span>
              <div><p className="text-body-md font-semibold text-on-surface">Generate Invoice</p><p className="text-label-sm text-on-surface-variant/80">Create an invoice for this project</p></div>
            </button>
            <button onClick={() => { generateAgreement(project.id); setToast({ show: true, msg: `Agreement ${project.agreementNum === "—" ? "generated" : "regenerated"}` }); setTimeout(() => setToast({ show: false, msg: "" }), 2000) }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container-high transition-colors text-left">
              <span className="material-symbols-outlined text-on-surface-variant" aria-hidden="true">contract</span>
              <div><p className="text-body-md font-semibold text-on-surface">Generate Agreement</p><p className="text-label-sm text-on-surface-variant/80">Create a service agreement</p></div>
            </button>
            <button onClick={() => { const share = addShare(project.id); if (share) { const url = `${window.location.origin}/share/${share.token}`; navigator.clipboard?.writeText(url); setToast({ show: true, msg: `Share link copied: ${url}` }); setTimeout(() => setToast({ show: false, msg: "" }), 3000) } }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container-high transition-colors text-left">
              <span className="material-symbols-outlined text-on-surface-variant" aria-hidden="true">share</span>
              <div><p className="text-body-md font-semibold text-on-surface">Share Project</p><p className="text-label-sm text-on-surface-variant/80">Create a public link to share with client</p></div>
            </button>
            <button onClick={() => router.push("/tasks")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container-high transition-colors text-left">
              <span className="material-symbols-outlined text-on-surface-variant" aria-hidden="true">open_in_new</span>
              <div><p className="text-body-md font-semibold text-on-surface">Full Task Manager</p><p className="text-label-sm text-on-surface-variant/80">Open the full tasks page</p></div>
            </button>
          </div>
        </div>

        <ActivityFeed entries={activity} />

        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/5">
          <h3 className="text-label-md text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">timeline</span>
            Timeline
          </h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex flex-col items-center"><div className="w-2.5 h-2.5 rounded-full bg-primary"></div><div className="w-px flex-1 bg-outline-variant/20"></div></div>
              <div><p className="text-body-md font-semibold text-on-surface">Project Created</p><p className="text-label-sm text-on-surface-variant/80">{new Date().toLocaleDateString()}</p></div>
            </div>
            <div className="flex gap-3">
              <div className="flex flex-col items-center"><div className={`w-2.5 h-2.5 rounded-full ${project.agreementNum !== "—" ? "bg-secondary" : "bg-outline-variant/30"}`}></div><div className="w-px flex-1 bg-outline-variant/20"></div></div>
              <div><p className="text-body-md font-semibold text-on-surface">Agreement {project.agreementNum !== "—" ? "Signed" : "Pending"}</p><p className="text-label-sm text-on-surface-variant/80">{project.agreementNum !== "—" ? project.agreementNum : "Not yet generated"}</p></div>
            </div>
            <div className="flex gap-3">
              <div className="flex flex-col items-center"><div className={`w-2.5 h-2.5 rounded-full ${project.invoiceNum !== "—" ? "bg-secondary" : "bg-outline-variant/30"}`}></div><div className="w-px flex-1 bg-outline-variant/20"></div></div>
              <div><p className="text-body-md font-semibold text-on-surface">Invoice {project.invoiceNum !== "—" ? `#${project.invoiceNum}` : "Not Generated"}</p><p className="text-label-sm text-on-surface-variant/80">{project.invoiceNum !== "—" ? "Sent" : "Generate from actions"}</p></div>
            </div>
            <div className="flex gap-3">
              <div className="flex flex-col items-center"><div className={`w-2.5 h-2.5 rounded-full ${project.amountStatus === "Paid" ? "bg-secondary" : "bg-outline-variant/30"}`}></div></div>
              <div><p className="text-body-md font-semibold text-on-surface">Payment {project.amountStatus === "Paid" ? "Received" : project.amountStatus === "Overdue" ? "Overdue" : "Pending"}</p><p className="text-label-sm text-on-surface-variant/80">{project.amountStatus === "Paid" ? "Completed" : project.amountStatus === "Overdue" ? "Action needed" : "Awaiting payment"}</p></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/5 mb-8">
        <h3 className="text-label-md text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">notes</span>
          Notes
        </h3>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes about this project..." className="w-full min-h-[120px] bg-surface-container-high border-none rounded-xl px-4 py-3 text-body-md outline-none focus:ring-2 focus:ring-primary/20 resize-y transition-shadow" aria-label="Project notes" />
        <div className="flex justify-end mt-2">
          {noteSaved && <span className="text-label-sm text-secondary flex items-center gap-1"><span className="material-symbols-outlined text-[14px]" aria-hidden="true">check</span>Saved</span>}
          {!notes && <span className="text-label-sm text-on-surface-variant/60">Notes saved automatically</span>}
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setEditing(false)} />
          <div className="relative bg-surface-container-lowest w-full max-w-lg rounded-2xl border border-outline-variant/10 shadow-2xl p-6 z-10" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-title-lg text-on-surface mb-4">Edit Project</h3>
            <div className="space-y-4">
              <input placeholder="Client name" value={edit.client} onChange={(e) => setEdit({ ...edit, client: e.target.value })} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-primary/20" />
              <input placeholder="Requirement / Project name" value={edit.requirement} onChange={(e) => setEdit({ ...edit, requirement: e.target.value })} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-primary/20" />
              <input placeholder="Amount ($)" value={edit.amount} onChange={(e) => setEdit({ ...edit, amount: e.target.value })} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-primary/20" />
              <input placeholder="Due date (e.g. Aug 15, 2026)" value={edit.dueDate} onChange={(e) => setEdit({ ...edit, dueDate: e.target.value })} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-primary/20" />
              <input placeholder="Lead email (optional)" value={edit.leadEmail} onChange={(e) => setEdit({ ...edit, leadEmail: e.target.value })} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-xl border border-outline-variant/30 text-on-surface text-label-md">Cancel</button>
              <button onClick={saveEdit} className="px-5 py-2 rounded-xl bg-primary text-on-primary text-label-md font-semibold">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <div className="fixed bottom-6 right-6 z-[200] bg-surface-container-lowest border border-outline-variant/10 shadow-2xl rounded-xl px-5 py-3 text-body-md text-on-surface font-medium animate-fade-in flex items-center gap-3" role="status">
          <span className="material-symbols-outlined text-primary text-[20px]" aria-hidden="true">check_circle</span>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
