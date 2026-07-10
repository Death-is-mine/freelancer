"use client"

import { useState, useRef } from "react"

export default function TemplatesSettingsPage() {
  const [templates, setTemplates] = useState<{ name: string; type: "agreement" | "invoice"; file: string; active: boolean }[]>([])
  const [activeType, setActiveType] = useState<"agreement" | "invoice">("agreement")
  const fileRef = useRef<HTMLInputElement>(null)

  const filtered = templates.filter((t) => t.type === activeType)
  const activeTemplate = filtered.find((t) => t.active)

  function handleUpload(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      setTemplates((prev) => [...prev, { name: file.name, type: activeType, file: reader.result as string, active: false }])
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-headline-md text-on-surface mb-2">Templates</h2>
      <p className="text-body-md text-on-surface-variant mb-8">Upload PDF templates for agreements and invoices.</p>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/5 p-6 mb-6">
        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveType("agreement")} className={`px-4 py-2 rounded-lg text-label-md font-medium ${activeType === "agreement" ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-higher"}`}>Agreement</button>
          <button onClick={() => setActiveType("invoice")} className={`px-4 py-2 rounded-lg text-label-md font-medium ${activeType === "invoice" ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-higher"}`}>Invoice</button>
        </div>

        <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f) }} />

        <button onClick={() => fileRef.current?.click()} className="w-full border-2 border-dashed border-outline-variant/30 rounded-xl py-8 text-center hover:border-primary/30 transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-3xl text-on-surface-variant/40" aria-hidden="true">upload_file</span>
          <p className="text-body-md text-on-surface-variant mt-2">Click to upload a PDF template</p>
        </button>

        {filtered.length > 0 && (
          <div className="mt-6 space-y-3">
            <p className="text-label-md text-on-surface-variant uppercase">Uploaded Templates</p>
            {filtered.map((t, i) => (
              <div key={i} className="flex items-center justify-between py-3 px-4 rounded-xl bg-surface-container-high">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant" aria-hidden="true">description</span>
                  <div>
                    <p className="text-body-md text-on-surface">{t.name}</p>
                    <p className="text-label-sm text-on-surface-variant/80">PDF</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setTemplates((prev) => prev.map((x) => x.name === t.name ? { ...x, active: true } : { ...x, active: false }))} className={`px-3 py-1 rounded-lg text-label-sm font-medium ${t.active ? "bg-primary text-on-primary" : "bg-surface-container-lowest text-on-surface-variant"}`}>
                    {t.active ? "Active" : "Use"}
                  </button>
                  <button onClick={() => setTemplates((prev) => prev.filter((x) => x.name !== t.name))} aria-label="Delete template" className="p-1 rounded hover:bg-surface-container-low text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">close</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeTemplate && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/5 p-6">
          <h3 className="text-title-lg text-on-surface mb-2">Active {activeType === "agreement" ? "Agreement" : "Invoice"} Template</h3>
          <p className="text-body-md text-on-surface-variant">{activeTemplate.name}</p>
        </div>
      )}
    </div>
  )
}
