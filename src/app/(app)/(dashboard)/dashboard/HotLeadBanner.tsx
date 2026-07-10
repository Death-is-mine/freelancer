export function HotLeadBanner() {
  return (
    <div className="bg-primary text-on-primary p-8 rounded-xl relative overflow-hidden flex flex-col justify-between shadow-xl shadow-primary/10 h-full">
      <div className="relative z-10">
        <span className="px-3 py-1 bg-white/20 rounded-full text-label-sm backdrop-blur-md">Hot Lead 🔥</span>
        <h4 className="text-headline-md font-bold mt-4 leading-tight">
          Follow up with <br />Nexus Media Group
        </h4>
        <p className="text-primary-fixed-dim text-body-lg mt-2 max-w-md">
          They reviewed your proposal 4 times in the last 2 hours. Now is the best time to reach out.
        </p>
      </div>
      <div className="mt-12 flex gap-4 relative z-10">
        <button onClick={() => alert("Calling nexus@nexusmedia.com via Google Voice...")} className="bg-white text-primary px-6 py-3 rounded-xl font-bold text-label-md hover:bg-primary-fixed transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">call</span>
          Call Now
        </button>
        <button onClick={() => alert("Opening Gmail compose to nexus@nexusmedia.com...")} className="bg-primary-container/20 border border-white/20 text-white px-6 py-3 rounded-xl font-bold text-label-md hover:bg-white/10 transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">drafts</span>
          Email
        </button>
      </div>
      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-[100px]"></div>
      <div className="absolute right-12 top-12 opacity-30">
        <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
      </div>
    </div>
  )
}
