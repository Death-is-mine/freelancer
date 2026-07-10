import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  timeout: 60000,
  retries: 0,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  webServer: {
    command: "npx next start -p 3001",
    url: "http://localhost:3001",
    reuseExistingServer: true,
    timeout: 30000,
  },
  use: {
    baseURL: "http://localhost:3001",
    headless: true,
    screenshot: "on",
    video: "on-first-retry",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
})