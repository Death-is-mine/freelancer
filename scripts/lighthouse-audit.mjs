import lighthouse from "lighthouse"
import playwright from "playwright"
import * as fs from "fs"

const ROUTES = [
  "/dashboard", "/leads", "/clients", "/projects", "/tasks",
  "/invoices", "/payments", "/reports", "/templates",
  "/automation", "/agreements", "/portal",
  "/settings/profile", "/settings/workspace", "/settings/appearance",
  "/settings/notifications", "/settings/integrations",
  "/settings/templates", "/settings/calendar",
]

const BASE = "http://localhost:3001"
const REPORT_DIR = "lighthouse-reports"
if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true })

async function run() {
  const browser = await playwright.chromium.launch({ headless: true, args: ["--no-sandbox"] })
  const results = []
  for (const route of ROUTES) {
    const url = `${BASE}${route}`
    console.log(`\nAuditing ${route}...`)
    try {
      const context = await browser.newContext()
      const page = await context.newPage()
      const cdp = await context.newCDPSession(page)
      const result = await lighthouse(url, {
        port: null,
        output: "json",
        onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
        logLevel: "error",
        driver: cdp,
      }, cdp)
      await context.close()
      const lhr = result.lhr
      const score = (cat) => Math.round((lhr.categories[cat]?.score ?? 0) * 100)
      const val = (id) => {
        const a = lhr.audits[id]
        if (!a) return "N/A"
        if (a.numericValue !== undefined) {
          if (id === "cumulative-layout-shift") return a.numericValue.toFixed(3)
          return a.displayValue || a.numericValue.toFixed(0) + " ms"
        }
        return a.displayValue || "N/A"
      }
      const entry = {
        route,
        performance: score("performance"),
        accessibility: score("accessibility"),
        "best-practices": score("best-practices"),
        seo: score("seo"),
        FCP: val("first-contentful-paint"),
        LCP: val("largest-contentful-paint"),
        CLS: val("cumulative-layout-shift"),
        TBT: val("total-blocking-time"),
        SI: val("speed-index"),
        TTFB: val("server-response-time"),
      }
      results.push(entry)
      console.log(`  Perf:${entry.performance}  A11y:${entry.accessibility}  BP:${entry["best-practices"]}  SEO:${entry.seo}`)
      console.log(`  FCP:${entry.FCP}  LCP:${entry.LCP}  CLS:${entry.CLS}  TBT:${entry.TBT}  SI:${entry.SI}  TTFB:${entry.TTFB}`)
      fs.writeFileSync(`${REPORT_DIR}/${route.replace(/\//g, "_") || "index"}.json`, JSON.stringify(lhr, null, 2))
    } catch (e) {
      console.error(`  FAILED: ${e.message}`)
      results.push({ route, error: e.message })
    }
  }
  await browser.close()
  console.log("\n=== SUMMARY ===")
  console.table(results)
  const fails = results.filter(r => r.performance !== undefined && (r.performance < 98 || r.accessibility < 100 || r["best-practices"] < 100 || r.seo < 100))
  if (fails.length > 0) {
    console.log(`\n⚠ ${fails.length} routes below target:`)
    fails.forEach(r => console.log(`  ${r.route}: P${r.performance} A${r.accessibility} BP${r["best-practices"]} SEO${r.seo}`))
    process.exit(1)
  } else {
    console.log("\n✓ ALL ROUTES MEET TARGETS")
  }
}

run().catch(e => { console.error(e); process.exit(1) })
