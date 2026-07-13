'use client'

export default function TemplatesPage() {
  return (
    <>
      <nav className="flex items-center gap-2 text-on-surface-variant mb-1">
        <span className="text-label-md">Workspace</span>
        <span className="text-on-surface-variant/30">/</span>
        <span className="text-label-md font-semibold text-on-surface">Templates</span>
      </nav>
      <h2 className="text-headline-lg tracking-tight text-on-surface mb-8">Proposal Templates</h2>

      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 p-12 text-center">
        <span
          className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4"
          aria-hidden="true"
        >
          description
        </span>
        <h3 className="text-title-lg text-on-surface mb-2">No templates yet</h3>
        <p className="text-body-md text-on-surface-variant mb-6">
          Upload a PDF template or create one from scratch.
        </p>
        <label className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-body-md shadow-lg shadow-primary/10 inline-flex items-center gap-2 cursor-pointer">
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            upload
          </span>
          Upload PDF
          <input type="file" accept=".pdf" className="hidden" />
        </label>
      </div>
    </>
  )
}
