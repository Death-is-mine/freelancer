"use client"

import { useRouter } from "next/navigation"

const activities = [
  { icon: "task_alt", iconBg: "bg-primary/5", iconColor: "text-primary", title: "Phase 1 Complete", subtitle: "Lumina Rebrand Project", time: "10:45 AM" },
  { icon: "mail", iconBg: "bg-secondary-container/30", iconColor: "text-secondary", title: "New Lead Received", subtitle: "Studio Noir Inquiry", time: "9:20 AM" },
  { icon: "error_outline", iconBg: "bg-error/5", iconColor: "text-error", title: "Invoice Overdue", subtitle: "Apex Systems - INV-203", time: "Yesterday" },
  { icon: "chat_bubble", iconBg: "bg-primary/5", iconColor: "text-primary", title: "Message from Team", subtitle: "New task assigned in 'Dev Pipeline'", time: "Yesterday" },
]

export function ActivityFeed() {
  const router = useRouter()
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/5 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-title-lg text-on-surface">Recent Activity</h4>
        <button onClick={() => alert("Activity options coming soon")} className="p-1.5 hover:bg-surface-container-high rounded-full transition-colors">
          <span className="material-symbols-outlined text-[20px]">more_vert</span>
        </button>
      </div>
      <div className="space-y-6 flex-1">
        {activities.map((a, i) => (
          <div key={i} className="flex gap-4 items-start group">
            <div className={`w-10 h-10 rounded-full ${a.iconBg} flex items-center justify-center shrink-0`}>
              <span className={`material-symbols-outlined ${a.iconColor} text-[20px]`}>{a.icon}</span>
            </div>
            <div>
              <p className="text-body-md text-on-surface font-medium">{a.title}</p>
              <p className="text-label-md text-on-surface-variant">{a.subtitle}</p>
              <p className="text-[11px] text-outline mt-1 font-medium">{a.time}</p>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => router.push("/tasks")} className="mt-8 w-full py-2.5 text-label-md font-bold text-primary hover:bg-primary/5 rounded-xl transition-all">
        View All Activity
      </button>
    </div>
  )
}
