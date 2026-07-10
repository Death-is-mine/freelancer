"use client"

import { useState, useEffect } from "react"

const ACCENTS = ["#004ac6", "#943700", "#ba1a1a", "#006b5d", "#6750a4"]
const PRESETS = [
  { name: "Arctic", colors: ["#004ac6", "#505f76", "#943700"] },
  { name: "Midnight", colors: ["#1a1a2e", "#16213e", "#0f3460"] },
  { name: "Graphite", colors: ["#333333", "#555555", "#777777"] },
  { name: "Carbon", colors: ["#222222", "#444444", "#666666"] },
  { name: "Ocean", colors: ["#006994", "#0077b6", "#00b4d8"] },
  { name: "Emerald", colors: ["#006b5d", "#00897b", "#4db6ac"] },
  { name: "Sunset", colors: ["#d84315", "#e65100", "#ff8f00"] },
  { name: "Lavender", colors: ["#6750a4", "#7c5cbf", "#9a82d4"] },
]

export default function AppearanceSettingsPage() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light")
  const [accent, setAccent] = useState(ACCENTS[0])
  const [preset, setPreset] = useState("Arctic")
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("freelancer-theme")
    const savedAccent = localStorage.getItem("freelancer-accent")
    if (saved === "dark" || saved === "system") setTheme(saved)
    if (savedAccent && ACCENTS.includes(savedAccent)) setAccent(savedAccent)
  }, [])

  useEffect(() => {
    document.documentElement.style.setProperty("--color-primary", accent)
  }, [accent])

  function save() {
    localStorage.setItem("freelancer-theme", theme)
    localStorage.setItem("freelancer-accent", accent)
    setDirty(false)
  }

  function discard() {
    const saved = localStorage.getItem("freelancer-theme") as "light" | "dark" | "system" | null
    const savedAccent = localStorage.getItem("freelancer-accent")
    if (saved) setTheme(saved)
    if (savedAccent && ACCENTS.includes(savedAccent)) setAccent(savedAccent)
    setDirty(false)
  }

  function selectAccent(color: string) {
    setAccent(color)
    setDirty(true)
  }

  function selectTheme(t: "light" | "dark" | "system") {
    setTheme(t)
    setDirty(true)
  }

  return (
    <div className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full">
      <div className="mb-10">
        <h2 className="text-headline-lg text-on-surface mb-2">Appearance</h2>
        <p className="text-body-md text-on-surface-variant">Customize how FreelanceOS looks on your device.</p>
      </div>

      <div className="mb-12">
        <h3 className="text-title-lg mb-6">Interface Style</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(["Light", "Dark", "System"] as const).map((mode) => {
            const val = mode.toLowerCase() as "light" | "dark" | "system"
            const selected = theme === val
            return (
              <div key={mode} onClick={() => selectTheme(val)}>
                <div className={`aspect-video rounded-xl border-2 transition-all overflow-hidden p-3 flex flex-col gap-2 shadow-sm cursor-pointer ${selected ? "bg-white border-primary" : "bg-white border-transparent hover:border-primary"}`}>
                  <div className="h-4 w-1/2 bg-slate-100 rounded"></div>
                  <div className="flex gap-2">
                    <div className="h-10 flex-1 bg-slate-50 rounded border border-slate-100"></div>
                    <div className="h-10 flex-1 bg-slate-50 rounded border border-slate-100"></div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-label-md">{mode}</span>
                  <input className="text-primary focus:ring-primary h-4 w-4" name="theme" type="radio" checked={selected} onChange={() => selectTheme(val)} aria-label={`${mode} mode`} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mb-12 bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-title-lg">Accent Color</h3>
            <p className="text-body-md text-on-surface-variant">The primary color used for buttons, links, and indicators.</p>
          </div>
          <div className="flex gap-2">
            {ACCENTS.map((color) => (
              <button key={color} onClick={() => selectAccent(color)} aria-label={`Accent color ${color}`} className={`w-8 h-8 rounded-full border-2 transition-all ${accent === color ? "border-primary scale-110" : "border-white"}`} style={{ backgroundColor: color, "--tw-ring-color": color } as React.CSSProperties}></button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h3 className="text-title-lg mb-6">Color Presets</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PRESETS.map((p) => (
            <div key={p.name} onClick={() => { setPreset(p.name); selectAccent(p.colors[0]) }} className={`p-4 rounded-xl border cursor-pointer ${preset === p.name ? "border-primary bg-secondary-container/50" : "border-outline-variant hover:bg-surface-container"}`}>
              <div className="flex gap-1 mb-3">
                {p.colors.map((c, j) => (
                  <div key={j} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }}></div>
                ))}
              </div>
              <span className="text-label-md">{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 flex items-center justify-end gap-4">
        <button onClick={discard} className="px-6 py-2.5 text-label-md text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors">Discard changes</button>
        <button onClick={save} className="px-8 py-2.5 bg-primary text-white text-label-md font-semibold rounded-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">Save Settings</button>
      </div>
    </div>
  )
}
