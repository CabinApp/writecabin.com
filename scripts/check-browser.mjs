import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import { launchBrowser } from "./browser.mjs";

const port = 4187;
const external = process.env.CABIN_TEST_URL;
const origin = external || `http://127.0.0.1:${port}`;
const server = external
  ? null
  : spawn(process.execPath, ["scripts/serve.mjs", "--dist"], {
      env: { ...process.env, PORT: String(port) },
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
const results = [];
const passed = (message) => {
  results.push(message);
  console.log(`PASS ${message}`);
};
let browser;
try {
  if (server)
    await new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error("Preview did not start")),
        10000,
      );
      server.stdout.once("data", () => {
        clearTimeout(timer);
        resolve();
      });
      server.once("error", reject);
      server.once("exit", (code) => {
        if (code) reject(new Error(`Preview exited ${code}`));
      });
    });
  browser = await launchBrowser();
  await mkdir("qa/final", { recursive: true });
  const context = await browser.newContext({ colorScheme: "light" });
  await context.addInitScript(() =>
    localStorage.setItem("cabin-theme", "aurora"),
  );
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  const failedRequests = [];
  const cancelledRequests = [];
  page.on("requestfailed", (request) => {
    // A theme switch or navigation can supersede an in-flight image request.
    if (request.failure()?.errorText === "net::ERR_ABORTED")
      cancelledRequests.push(request.url());
    else
      failedRequests.push({
        url: request.url(),
        error: request.failure()?.errorText,
      });
  });
  await page.goto(origin);
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator(".theme-toggle").count(), 0);
  assert.equal(await page.locator('img[src*="aurora"]').count(), 1);
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dawn");
  assert.ok(await page.locator('.file-source pre').isVisible());
  assert.match(
    await page.locator(".file-source pre").innerText(),
    /id: .*\ntitle: The house at low tide/,
  );
  assert.match(await page.locator(".file-list").innerText(), /\.cabinpage/);
  assert.doesNotMatch(await page.locator(".file-list").innerText(), /\.xml/);
  await page.locator(".file-source summary").click();
  assert.equal(await page.locator('.file-source pre').isVisible(), false);
  await page.locator('.file-source summary').click();
  assert.ok(await page.locator('.file-source pre').isVisible());
  passed('Dawn-only site, exactly one Aurora screenshot, .cabinpage names and an expandable readable file sample');
  assert.equal(await page.title(), "Cabin | A writing app that grows with you");
  assert.equal(await page.locator("h1").count(), 1);
  assert.equal(
    await page.locator("link[rel=canonical]").getAttribute("href"),
    "https://writecabin.com/",
  );
  assert.equal(
    await page.locator("meta[name=robots][content*=noindex]").count(),
    0,
  );
  assert.equal(await page.locator("a[download]").count(), 0);
  assert.match(await page.locator("#release-area").innerText(), /coming soon/);
  const schema = JSON.parse(
    await page.locator('script[type="application/ld+json"]').textContent(),
  );
  assert.equal(schema.url, "https://writecabin.com/");
  for (const href of await page
    .locator('a[href^="#"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute("href"))))
    assert.equal(await page.locator(href).count(), 1, href);
  for (const path of [
    "/robots.txt",
    "/sitemap.xml",
    "/assets/social.png",
    "/CNAME",
  ])
    assert.equal((await page.request.get(origin + path)).status(), 200, path);
  passed(
    "Canonical, metadata, structured data, sitemap, robots, anchors, social image and coming-soon state",
  );

  for (const width of [320, 390, 600, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const preference of ["light", "dark"]) {
      const theme = "dawn";
      await page.emulateMedia({ colorScheme: preference });
      assert.equal(
        await page.locator("html").getAttribute("data-theme"),
        "dawn",
      );
      assert.equal(
        await page
          .locator("body")
          .evaluate((node) => getComputedStyle(node).backgroundColor),
        "rgb(241, 244, 240)",
      );
      for (let stage = 0; stage < 4; stage++) {
        await page.locator(`[data-stage="${stage}"]`).click();
        assert.equal(
          await page
            .locator(`[data-stage="${stage}"]`)
            .getAttribute("aria-pressed"),
          "true",
        );
        assert.equal(
          await page.locator(".growth-preview").getAttribute("data-stage-view"),
          String(stage),
        );
        assert.equal(await page.locator(".growth-tree").isVisible(), stage > 0);
        assert.equal(
          await page.locator(".growth-notes").isVisible(),
          stage > 1,
        );
        assert.equal(
          await page.locator(".character-note").isVisible(),
          stage === 3,
        );
        if (stage > 1)
          assert.match(
            await page.locator(".stage-status").innerText(),
            /Planned/,
          );
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `${width}px ${theme} stage ${stage}: page overflow`,
        );
        const overflowing = await page.evaluate(() =>
          [...document.querySelectorAll(".growth-body *")]
            .filter(
              (node) =>
                node.getBoundingClientRect().width &&
                node.scrollWidth > node.clientWidth + 2 &&
                getComputedStyle(node).overflowX === "visible",
            )
            .map((node) => node.className),
        );
        assert.deepEqual(
          overflowing,
          [],
          `${width}px ${theme} stage ${stage}: internal overflow`,
        );
      }
      await page.locator('[data-stage="1"]').click();
      for (let chapter = 0; chapter < 3; chapter++) {
        await page.locator(`[data-chapter="${chapter}"]`).click();
        assert.equal(
          await page
            .locator(`[data-chapter="${chapter}"]`)
            .getAttribute("aria-pressed"),
          "true",
        );
        assert.equal(
          await page.locator("#demo-chapter").textContent(),
          (
            await page.locator(`[data-chapter="${chapter}"]`).textContent()
          ).trim(),
        );
      }
      for (const mode of ["writing", "formatting", "focus"]) {
        await page.locator(`[data-mode="${mode}"]`).click();
        const shot = page.locator("#writing-shot");
        assert.equal(
          await shot.getAttribute("src"),
          `/assets/product/${theme}-${mode}.png`,
        );
        await shot.evaluate((image) => image.decode());
        assert.ok(await shot.evaluate((image) => image.naturalWidth > 0));
      }
      await page.locator(".focus-toggle").click();
      assert.equal(
        await page.locator(".focus-toggle").getAttribute("aria-pressed"),
        "true",
      );
      assert.equal(await page.locator(".hero-tree").isVisible(), false);
      await page.locator(".focus-toggle").click();
      assert.equal(
        await page.locator(".focus-toggle").getAttribute("aria-pressed"),
        "false",
      );
      if ([390, 768, 1440].includes(width)) {
        await page.locator('[data-mode="writing"]').click();
        await page.locator('[data-stage="0"]').click();
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({
          path: `qa/final/${theme}-${width}.png`,
          fullPage: true,
        });
      }
    }
    passed(
      `${width}px: Dawn under light/dark system preferences, all stages, chapters, screenshots and Deep Writing; no overflow`,
    );
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator(".menu-toggle").click();
  assert.equal(
    await page.locator(".menu-toggle").getAttribute("aria-expanded"),
    "true",
  );
  await page.keyboard.press("Escape");
  assert.equal(
    await page.locator(".menu-toggle").getAttribute("aria-expanded"),
    "false",
  );
  assert.equal(
    await page.evaluate(() => document.activeElement.className),
    "menu-toggle",
  );
  for (const hash of ["#features", "#philosophy", "#availability"]) {
    await page.locator(".menu-toggle").click();
    await page.locator(`#primary-nav a[href="${hash}"]`).click();
    assert.equal(new URL(page.url()).hash, hash);
    assert.equal(
      await page.locator(".menu-toggle").getAttribute("aria-expanded"),
      "false",
    );
  }
  await page.locator(".hero-copy .button").click();
  assert.equal(new URL(page.url()).hash, "#availability");
  await page.locator(".hero-caption a").click();
  assert.equal(new URL(page.url()).hash, "#features");
  for (const hash of ["#features", "#philosophy"])
    await page.locator(`footer a[href="${hash}"]`).click();
  await page.locator("footer .brand").click();
  assert.equal(new URL(page.url()).pathname, "/");
  await page.locator("header .brand").click();
  passed(
    "Mobile menu opens, closes on selection and Escape, returns focus; header, footer and hero navigation work",
  );

  await page.locator('[data-stage="0"]').focus();
  await page.keyboard.press("Tab");
  assert.equal(
    await page.evaluate(() => document.activeElement.dataset.stage),
    "1",
  );
  await page.keyboard.press("Enter");
  assert.equal(
    await page.locator(".growth-preview").getAttribute("data-stage-view"),
    "1",
  );
  const outline = await page.evaluate(
    () => getComputedStyle(document.activeElement).outlineStyle,
  );
  assert.notEqual(outline, "none");
  await page.locator('[data-stage="0"]').focus();
  await page.keyboard.press("Space");
  assert.equal(
    await page.locator('[data-stage="0"]').getAttribute("aria-pressed"),
    "true",
  );
  await page.reload();
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dawn");
  await page.keyboard.press("Tab");
  assert.equal(
    await page.evaluate(() => document.activeElement.className),
    "skip-link",
  );
  await page.keyboard.press("Enter");
  assert.equal(new URL(page.url()).hash, "#main");
  passed(
    "Keyboard Tab, Enter and Space activate controls with visible focus; skip link works and old theme preferences cannot change Dawn",
  );

  for (const theme of ["dawn"]) {
    const ratios = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      function luminance(hex) {
        return hex
          .match(/[0-9a-f]{2}/gi)
          .map((part) => parseInt(part, 16) / 255)
          .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
          .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
      }
      function ratio(a, b) {
        const x = luminance(style.getPropertyValue(a).trim());
        const y = luminance(style.getPropertyValue(b).trim());
        return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
      }
      return {
        text: Math.min(
          ...[
            "--canvas",
            "--surface",
            "--paper",
            "--navigation",
            "--field",
            "--selection",
          ].flatMap((bg) =>
            ["--text", "--secondary"].map((fg) => ratio(fg, bg)),
          ),
        ),
        button: Math.min(
          ratio("--on-accent", "--accent"),
          ratio("--on-accent", "--accent-hover"),
        ),
        focus: Math.min(
          ...[
            "--canvas",
            "--surface",
            "--paper",
            "--navigation",
            "--selection",
          ].map((bg) => ratio("--focus", bg)),
        ),
      };
    });
    assert.ok(
      ratios.text >= 4.5 && ratios.button >= 4.5 && ratios.focus >= 3,
      JSON.stringify(ratios),
    );
    passed(
      `${theme} contrast: text ≥${ratios.text.toFixed(2)}:1, buttons ≥${ratios.button.toFixed(2)}:1, focus ≥${ratios.focus.toFixed(2)}:1`,
    );
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await page.locator('[data-stage="3"]').click();
  assert.equal(
    await page
      .locator(".growth-paper")
      .evaluate((node) => getComputedStyle(node).animationName),
    "none",
  );
  assert.equal(
    await page
      .locator("html")
      .evaluate((node) => getComputedStyle(node).scrollBehavior),
    "auto",
  );
  passed(
    "Reduced motion removes animation and smooth scrolling while retaining every stage",
  );

  const noScript = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const plain = await noScript.newPage();
  await plain.goto(origin);
  assert.ok(await plain.locator("#hero-title").isVisible());
  assert.ok(await plain.locator("#primary-nav").isVisible());
  assert.match(
    await plain.locator("main").innerText(),
    /Dedicated notes, character tools/,
  );
  assert.match(await plain.locator("#release-area").innerText(), /coming soon/);
  assert.equal(await plain.locator(".growth-controls").isVisible(), false);
  passed(
    "Without JavaScript: readable marketing, visible navigation, coming-soon state and stage explanation",
  );
  await noScript.close();

  assert.deepEqual(errors, []);
  assert.deepEqual(failedRequests, []);
  passed("No browser console errors or failed asset requests");
  const missing = await context.newPage();
  assert.equal((await missing.goto(origin + "/no-such-page")).status(), 404);
  assert.equal((await missing.goto(origin + "/blog/")).status(), 404);
  await missing.locator('a[href="/"]').click();
  assert.equal(new URL(missing.url()).pathname, "/");
  passed(
    "Unknown and retired routes return a real 404 with a working home link",
  );

  const source = await readFile("index.html", "utf8");
  const outputFiles = await readdir("dist", { recursive: true });
  assert.ok(
    !outputFiles.some((file) =>
      /\.glb$|\.blend|three\.module|walkthrough|(^|[\\/])blog([\\/]|$)/.test(
        file,
      ),
    ),
  );
  assert.ok(!/three\.module|webgl|walkthrough\.glb|noindex/.test(source));
  await writeFile(
    "qa/final/results.json",
    JSON.stringify(
      { results, errors, failedRequests, cancelledRequests },
      null,
      2,
    ),
  );
  console.log(
    `\n${results.length} checks passed. Screenshots and results saved in qa/final/.`,
  );
} finally {
  await browser?.close();
  server?.kill();
}
