export function MeetingsWidget() {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/5 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-[10px] font-bold">G</div>
          <h4 className="text-title-lg text-on-surface">Upcoming Meetings</h4>
        </div>
        <button onClick={() => alert("Syncing with Google Calendar...")} className="text-label-md text-primary font-bold">Sync</button>
      </div>
      <div className="space-y-4">
        {[
          { month: "OCT", day: "24", title: "Client Discovery: Studio Bloom", time: "14:00 - 15:00", attendees: 4 },
          { month: "OCT", day: "25", title: "Project Sync: Quantum App", time: "10:30 - 11:00", attendees: 0 },
        ].map((m, i) => (
          <div key={i} onClick={() => alert(`Opening "${m.title}"`)} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/5 flex gap-4 hover:border-primary/20 transition-all cursor-pointer">
            <div className="flex flex-col items-center justify-center w-14 shrink-0 border-r border-outline-variant/20">
              <p className="text-label-sm text-on-surface-variant uppercase">{m.month}</p>
              <p className="text-title-lg font-bold text-on-surface">{m.day}</p>
            </div>
            <div className="flex-1">
              <p className="text-body-md font-semibold text-on-surface">{m.title}</p>
              <p className="text-label-md text-on-surface-variant flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[14px]">schedule</span> {m.time}
              </p>
              {m.attendees > 0 && (
                <div className="flex -space-x-2 mt-3">
                  {Array.from({ length: Math.min(m.attendees, 3) }).map((_, j) => (
                    <div key={j} className="w-6 h-6 rounded-full bg-surface-container-high border-2 border-surface flex items-center justify-center text-[8px] font-bold text-on-surface-variant">
                      U{j + 1}
                    </div>
                  ))}
                  {m.attendees > 3 && (
                    <div className="w-6 h-6 rounded-full bg-surface-container-high border-2 border-surface flex items-center justify-center text-[10px] font-bold text-on-surface-variant">
                      +{m.attendees - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
