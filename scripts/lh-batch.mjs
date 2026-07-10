import { execSync } from "child_process"
import { writeFileSync, mkdirSync, existsSync } from "fs"
import * as path from "path"

const ROUTES = [
  "/dashboard", "/leads", "/clients", "/projects", "/tasks",
  "/invoices", "/payments", "/reports", "/templates",
  "/automation", "/agreements", "/portal",
  "/settings/profile", "/settings/workspace", "/settings/appearance",
  "/settings/notifications", "/settings/integrations",
  "/settings/templates", "/settings/calendar",
]

const BASE = "http://localhost:3002"
const DIR = "lighthouse-reports"
if (!existsSync(DIR)) mkdirSync(DIR)

const results = []

for (const route of ROUTES) {
  const url = `${BASE}${route}`
  const safe = route.replace(/\//g, "_") || "index"
  console.log(`\nAuditing ${route}...`)
  try {
    const out = execSync(`npx lighthouse "${url}" --quiet --chrome-flags="--headless=new --no-sandbox" --output=json --output-path=stdout`, {
      encoding: "utf8",
      timeout: 60000,
      shell: true,
      env: { ...process.env, NODE_OPTIONS: "" },
    })
    // Filter out stderr noise (node warnings go to stderr but shell merges)
    const jsonStart = out.indexOf("{")
    const jsonEnd = out.lastIndexOf("}") + 1
    const lhr = JSON.parse(out.slice(jsonStart, jsonEnd))
    writeFileSync(path.join(DIR, `${safe}.json`), JSON.stringify(lhr, null, 2))
    const s = (c) => Math.round((lhr.categories[c]?.score ?? 0) * 100)
    const m = (id) => lhr.audits[id]?.displayValue || lhr.audits[id]?.numericValue?.toFixed(0) + "ms" || "N/A"
    const entry = {
      route, perf: s("performance"), a11y: s("accessibility"),
      bp: s("best-practices"), seo: s("seo"),
      LCP: m("largest-contentful-paint"),
      CLS: lhr.audits["cumulative-layout-shift"]?.numericValue?.toFixed(3) || "N/A",
      TBT: m("total-blocking-time"),
      SI: m("speed-index"),
    }
    results.push(entry)
    console.log(`  P:${entry.perf}  A:${entry.a11y}  BP:${entry.bp}  SEO:${entry.seo}`)
    console.log(`  LCP:${entry.LCP}  CLS:${entry.CLS}  TBT:${entry.TBT}  SI:${entry.SI}`)
  } catch (e) {
    console.error(`  FAILED: ${e.message}`)
    results.push({ route, error: e.message })
  }
}

console.log("\n=== FULL SUMMARY ===")
console.table(results)
const bad = results.filter(r => r.perf !== undefined && (r.perf < 98 || r.a11y < 100 || r.bp < 100 || r.seo < 100))
if (bad.length) {
  console.log(`\n⚠ ${bad.length} routes below target:`)
  bad.forEach(r => console.log(`  ${r.route}: P${r.perf} A${r.a11y} BP${r.bp} SEO${r.seo}`))
} else {
  console.log("\n✓ ALL ROUTES MEET TARGETS")
}
