import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 45000,
  use: {
    baseURL: "http://127.0.0.1:41732",
    launchOptions: process.env.PW_CHROME ? { executablePath: process.env.PW_CHROME, args: ["--no-sandbox"] } : { args: ["--no-sandbox"] },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "phone", use: { ...devices["Pixel 5"], viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: "python3 -m http.server 41732 --bind 127.0.0.1",
    url: "http://127.0.0.1:41732",
    reuseExistingServer: true,
    timeout: 20000,
  },
});
