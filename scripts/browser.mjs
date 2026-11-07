import { chromium } from "playwright-core";
import { existsSync } from "node:fs";
import { join } from "node:path";
export async function launchBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    join(
      process.env.PROGRAMFILES || "",
      "Google/Chrome/Application/chrome.exe",
    ),
    join(
      process.env["PROGRAMFILES(X86)"] || "",
      "Microsoft/Edge/Application/msedge.exe",
    ),
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ];
  const executablePath = candidates.find((path) => path && existsSync(path));
  if (!executablePath)
    throw new Error(
      "Install Chrome or Edge, or set CHROME_PATH. No browser is downloaded by this project.",
    );
  return chromium.launch({ executablePath, headless: true });
}
