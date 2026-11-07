// Render the actual app frontend with its existing storage test fixture.
// No product source, rendered interface, or screenshot pixels are altered.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { launchBrowser } from "./browser.mjs";

const app = resolve(process.env.CABIN_APP_ROOT || "../App/Cabin App");
const root = resolve(app, "src");
const support = await readFile(
  resolve(app, "tests/browser/support.js"),
  "utf8",
);
const start = support.indexOf("    ({ document, theme, entryCount }) => {");
const end = support.lastIndexOf("    },");
if (start < 0 || end < start)
  throw new Error("App test fixture changed; review capture integration.");
const initialize = support.slice(start, end + 5);
const prose = JSON.parse(
  await readFile(new URL("./sample-manuscript.json", import.meta.url), "utf8"),
);
const document = prose.map((text) => ({
  tag: "paragraph",
  children: [{ tag: "#text", text }],
}));
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".ttf": "font/ttf",
  ".png": "image/png",
};
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, "http://localhost").pathname;
  const path = resolve(
    root,
    "." + (pathname === "/" ? "/index.html" : decodeURIComponent(pathname)),
  );
  if (!path.startsWith(root + sep)) {
    response.writeHead(403).end();
    return;
  }
  try {
    response.setHeader(
      "Content-Type",
      types[extname(path)] || "application/octet-stream",
    );
    response.end(await readFile(path));
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await launchBrowser();
try {
  for (const theme of ["dawn", "aurora"]) {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript({
      content: `(${initialize})(${JSON.stringify({ document, theme, entryCount: 3 })})`,
    });
    await page.goto(origin);
    await page.evaluate(() => {
      window.__books[0].title = "The Salt House";
      Object.values(window.__pages).forEach((item, index) => {
        item.title = [
          "The house at low tide",
          "What the sea keeps",
          "A letter, unopened",
        ][index];
        item.filename = item.title;
      });
    });
    await page.locator("#recent-list .book-open").click();
    await page.locator(".ProseMirror[contenteditable=true]").waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() =>
      document
        .querySelector(".ProseMirror")
        ?.textContent.includes("For the first time in seven years"),
    );
    const words = (await page.locator(".ProseMirror").innerText())
      .trim()
      .split(/\s+/).length;
    if (words < 250)
      throw new Error(`Manuscript was not populated: ${words} words`);
    await page.screenshot({ path: `assets/product/${theme}-writing.png` });
    if (theme === "dawn") {
      await page.locator(".ProseMirror").focus();
      await page.keyboard.press("Control+Home");
      await page.keyboard.press("Shift+End");
      await page.keyboard.press("Alt+F10");
      await page.getByRole("toolbar").waitFor({ state: "visible" });
      await page.screenshot({ path: "assets/product/dawn-formatting.png" });
      await page.keyboard.press("Escape");
      await page.locator("#focus-button").click();
      await page.locator('#toast').waitFor({ state: 'hidden', timeout: 8000 });
      await page.screenshot({ path: "assets/product/dawn-focus.png" });
    }
    if (errors.length) throw new Error(errors.join("\n"));
    await page.close();
  }
  console.log(
    "Captured three Dawn views and one Aurora view from the actual editor, with a full sample chapter.",
  );
} finally {
  await browser.close();
  server.close();
}
