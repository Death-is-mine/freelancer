"use client"

import { useEffect, useState } from "react"
import { use } from "react"
import { getShareByToken, getComments, addComment } from "@/lib/store"
import type { ProjectComment } from "@/lib/store"

export default function ShareView({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [project, setProject] = useState<{ id: string; client: string; requirement: string; amount: string; amountStatus: string; dueDate: string; invoiceNum: string; agreementNum: string } | null | undefined>(undefined)

  useEffect(() => { getShareByToken(token).then((d) => setProject(d?.project ?? null)) }, [token])

  if (project === undefined) return <div className="flex items-center justify-center min-h-screen"><p>Loading…</p></div>
  if (!project) return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <div className="text-center max-w-md">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4" aria-hidden="true">lock</span>
        <h1 className="text-2xl font-bold mb-2">Link Expired or Invalid</h1>
        <p className="text-on-surface-variant">This share link is no longer available. Contact the sender for a new link.</p>
      </div>
    </div>
  )
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-outline-variant/10 bg-surface-container-lowest/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary" aria-hidden="true">rocket_launch</span>
          <span className="font-semibold text-lg">FreelanceOS</span>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/5 p-8">
          <div className="flex items-center gap-2 text-label-sm text-on-surface-variant mb-6">
            <span className="material-symbols-outlined text-base" aria-hidden="true">lock_open</span>
            Shared via secure link
          </div>
          <h1 className="text-3xl font-bold mb-2">{project.requirement}</h1>
          <p className="text-xl text-on-surface-variant mb-8">Client: {project.client}</p>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-surface-container-high">
              <p className="text-label-sm text-on-surface-variant mb-1">Amount</p>
              <p className="text-xl font-semibold">{project.amount || "—"}</p>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-high">
              <p className="text-label-sm text-on-surface-variant mb-1">Status</p>
              <p className="text-xl font-semibold">{project.amountStatus}</p>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-high">
              <p className="text-label-sm text-on-surface-variant mb-1">Invoice</p>
              <p className="text-xl font-semibold">{project.invoiceNum}</p>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-high">
              <p className="text-label-sm text-on-surface-variant mb-1">Due Date</p>
              <p className="text-xl font-semibold">{project.dueDate}</p>
            </div>
          </div>
        </div>

        <ShareComments projectId={project.id} />
      </main>
    </div>
  )
}

function ShareComments({ projectId }: { projectId: string }) {
  const [comments, setComments] = useState<ProjectComment[]>([])
  const [body, setBody] = useState("")
  useEffect(() => { setComments(getComments(projectId)) }, [projectId])
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/5 p-8 mt-6">
      <h3 className="text-title-lg text-on-surface mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined" aria-hidden="true">chat</span>
        Comments ({comments.length})
      </h3>
      <div className="flex gap-2 mb-4">
        <input aria-label="Add a comment" placeholder="Write a comment…" value={body} onChange={(e) => setBody(e.target.value)} className="flex-1 bg-surface-container-high border-none rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-primary/20" />
        <button onClick={() => { addComment(projectId, "Client", body); setBody(""); setComments(getComments(projectId)) }} disabled={!body.trim()} className="px-4 py-2 rounded-lg bg-primary text-on-primary text-label-md font-semibold disabled:opacity-40">Post</button>
      </div>
      {comments.length === 0 && <p className="text-body-md text-on-surface-variant/60">No comments yet.</p>}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3 p-3 rounded-xl bg-surface-container-high/40">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-label-sm font-semibold text-primary shrink-0">{c.author[0]}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1"><span className="text-label-sm font-semibold text-on-surface">{c.author}</span><span className="text-label-xs text-on-surface-variant/60">{new Date(c.createdAt).toLocaleDateString()}</span></div>
              <p className="text-body-md text-on-surface-variant whitespace-pre-wrap">{c.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
