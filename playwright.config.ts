import { defineConfig, devices } from '@playwright/test'

const PORT = 5199

// Solo para la skill validation: los specs son desechables y viven en .claude/tmp/
export default defineConfig({
  testDir: '.claude/tmp',
  testMatch: '**/e2e/**/*.spec.ts',
  outputDir: '.claude/tmp/playwright-results',
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
