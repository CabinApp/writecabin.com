import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { launchBrowser } from "./browser.mjs";

const origin = process.env.CABIN_TEST_URL || "http://127.0.0.1:4388";
const server = process.env.CABIN_TEST_URL
  ? null
  : spawn(process.execPath, ["scripts/serve.mjs", "--dist"], {
      env: { ...process.env, PORT: "4388" },
      windowsHide: true,
      stdio: ["ignore", "pipe", "inherit"],
    });
let browser;
try {
  if (server)
    await new Promise((resolve, reject) => {
      server.stdout.once("data", resolve);
      server.once("error", reject);
      server.once("exit", (code) =>
        reject(new Error(`Preview exited (${code})`)),
      );
    });
  browser = await launchBrowser();
  await mkdir("qa/final", { recursive: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 950 },
  });
  const failures = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") failures.push(message.text());
  });
  page.on("response", (response) => {
    if (response.status() >= 400)
      failures.push(`${response.status()} ${response.url()}`);
  });

  await page.goto(origin);
  await page.evaluate(() => document.fonts.ready);
  await page.locator(".hero .morning").evaluate((image) => image.decode());
  const mobile = page.locator(".menu-toggle");
  const theme = page.locator(".environment-switch");
  const stage = page.locator(".workbench");
  const assertStage = (value) =>
    page.waitForFunction(
      (id) => document.querySelector(".workbench").dataset.stage === id,
      String(value),
    );
  const assertRoute = (path) =>
    page.waitForFunction(
      (route) =>
        location.pathname === route && document.body.dataset.route === route,
      path,
    );

  await page.evaluate(() => {
    window.__spa = true;
  });
  for (const path of [
    "/features/",
    "/philosophy/",
    "/pricing/",
    "/roadmap/",
    "/blog/",
  ]) {
    await page.locator(`.site-nav a[href="${path}"]`).click();
    await assertRoute(path);
    assert.equal(await page.evaluate(() => window.__spa), true);
    assert.equal(
      await page.locator('link[rel="canonical"]').getAttribute("href"),
      "https://writecabin.com" + path,
    );
    assert.equal(
      await page.locator(".site-nav [aria-current=page]").getAttribute("href"),
      path,
    );
  }
  for (const link of await page.locator(".journal-list a").all()) {
    const path = await link.getAttribute("href");
    await link.click();
    await assertRoute(path);
    await page.locator(".essay > a").click();
    await assertRoute("/blog/");
  }
  await page.goBack();
  await page.waitForURL("**/blog/welcome-to-cabin/");
  await assertRoute("/blog/welcome-to-cabin/");
  await page.goForward();
  await assertRoute("/blog/");
  await page.reload();
  await assertRoute("/blog/");
  await page.locator(".site-header .brand").click();
  await assertRoute("/");
  console.log(
    "PASS all clean routes, journal articles, same-document navigation, back/forward and reload",
  );

  await page.locator(".hero .action").click();
  await page.waitForURL("**/#workspace");
  for (const value of [0, 1, 2, 3]) {
    await page.locator(`[data-step="${value}"]`).click();
    await assertStage(value);
    await page.waitForFunction(
      (expected) =>
        document
          .querySelector(`[data-step="${expected}"]`)
          .getAttribute("aria-pressed") === "true",
      value,
    );
  }
  assert.match(await page.locator(".demo-caption").textContent(), /planned/);
  await page.locator("[data-chapter='1']").click();
  assert.match(await page.locator(".excerpt").innerText(), /small grey stone/);
  await page.locator("[data-chapter='2']").click();
  assert.match(
    await page.locator(".excerpt").innerText(),
    /recognised the handwriting/,
  );
  await page.locator("[data-chapter='0']").click();
  const focus = page.locator(".focus-mode");
  await focus.click();
  assert.equal(await focus.getAttribute("aria-pressed"), "true");
  assert.equal(
    await stage.locator(".manuscript-tree").getAttribute("inert"),
    "",
  );
  await focus.click();
  assert.equal(await focus.getAttribute("aria-pressed"), "false");
  await page.waitForTimeout(900);
  await page.evaluate(() => {
    const journey = document.querySelector(".journey");
    const dock = document.querySelector(".demo-dock");
    const top =
      scrollY +
      journey.getBoundingClientRect().top -
      document.querySelector(".site-header").offsetHeight;
    scrollTo(0, top + (journey.offsetHeight - dock.offsetHeight) * 0.55);
  });
  await assertStage(2);
  assert.equal(await page.locator(".notes-pane").getAttribute("inert"), null);
  await stage.screenshot({ path: "qa/final/workspace.png" });
  const focusShot = page.locator("[data-focus-shot]");
  await focusShot.click();
  assert.equal(await focusShot.getAttribute("aria-pressed"), "true");
  await focusShot.click();
  assert.equal(await focusShot.getAttribute("aria-pressed"), "false");
  console.log(
    "PASS scroll-linked progression, four stage controls, three chapters and both Deep Writing controls",
  );

  await page.locator(".horizon").scrollIntoViewIfNeeded();
  await page.evaluate(() =>
    document.querySelector(".horizon").scrollIntoView(),
  );
  await page.waitForFunction(() =>
    document.querySelector(".horizon").classList.contains("is-night"),
  );
  await page.locator("button[data-environment=morning]").click();
  assert.equal(
    await page.locator("html").getAttribute("data-environment"),
    "morning",
  );
  await page.locator("button[data-environment=aurora]").click();
  assert.equal(
    await page.locator("html").getAttribute("data-environment"),
    "aurora",
  );
  assert.equal(
    await page.locator(".night-shot").getAttribute("alt"),
    "The Salt House in Cabin’s dark Aurora editor.",
  );
  await page
    .locator(".horizon")
    .screenshot({ path: "qa/final/aurora.png", animations: "disabled" });
  await page.reload();
  assert.equal(
    await page.locator("html").getAttribute("data-environment"),
    "aurora",
  );
  await theme.click();
  assert.equal(
    await page.locator("html").getAttribute("data-environment"),
    "morning",
  );
  console.log(
    "PASS scroll-driven nightfall, scene controls, header switch and saved environment",
  );

  await page.evaluate(async () => {
    const images = [...document.querySelectorAll("main img[loading=lazy]")];
    for (const image of images) image.loading = "eager";
    await Promise.all(images.map((image) => image.decode()));
  });
  const measureContrast = () => page.evaluate(() => {
    const color = (hex) =>
      hex
        .slice(1)
        .match(/../g)
        .map((channel) => parseInt(channel, 16));
    const luminance = (channels) =>
      channels.reduce((result, value, i) => {
        const v = value / 255;
        return (
          result +
          [0.2126, 0.7152, 0.0722][i] *
            (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
        );
      }, 0);
    const ratio = (a, b) => {
      const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return (values[0] + 0.05) / (values[1] + 0.05);
    };
    const blendOverWhite = (colorValue, alpha) =>
      color(colorValue).map((v) => v * alpha + 255 * (1 - alpha));
    const style = getComputedStyle(document.documentElement);
    const token = (prop) => color(style.getPropertyValue(prop).trim());
    return {
      text: Math.min(
        ...["--ground", "--paper", "--field", "--panel"].map((surface) =>
          ratio(token("--ink"), token(surface)),
        ),
      ),
      action: ratio(token("--action"), token("--action-ink")),
      photoText: ratio(
        token("--land-ink"),
        blendOverWhite("#101915", 0xa8 / 255),
      ),
    };
  });
  for (const env of ["morning", "aurora"]) {
    if (await page.locator("html").getAttribute("data-environment") !== env) await theme.click();
    const contrast = await measureContrast();
    assert.ok(Object.values(contrast).every((ratio) => ratio >= 4.5), JSON.stringify(contrast));
    console.log(`PASS ${env} contrast and worst-case mobile photo scrim`, contrast);
  }
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const env of ["morning", "aurora"]) {
      if ((await page.locator("html").getAttribute("data-environment")) !== env)
        await theme.click();
      await page.evaluate(() => scrollTo(0, 0));
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
        `${env} ${width}px overflow`,
      );
      if (env === "morning" && [390, 768, 1440].includes(width)) {
        await page.screenshot({
          path: `qa/final/morning-${width}.png`,
          fullPage: true,
          animations: "disabled",
        });
      }
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await mobile.focus();
  await page.keyboard.press("Enter");
  assert.equal(await mobile.getAttribute("aria-expanded"), "true");
  await page.keyboard.press("Escape");
  assert.equal(await mobile.getAttribute("aria-expanded"), "false");
  assert.equal(
    await mobile.evaluate((element) => document.activeElement === element),
    true,
  );
  await mobile.click();
  await page.locator(".site-nav a[href='/features/']").click();
  await assertRoute("/features/");
  assert.equal(await mobile.getAttribute("aria-expanded"), "false");
  await page.locator(".site-header .brand").click();
  await assertRoute("/");
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(await page.locator(".scroll-beats").isVisible(), false);
  await page.locator("[data-step='3']").click();
  assert.equal(await stage.getAttribute("data-stage"), "3");
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  console.log(
    "PASS five widths in both environments, keyboard mobile menu and motion-free demo",
  );

  const staticPage = await browser.newPage({ javaScriptEnabled: false });
  for (const path of [
    "/",
    "/features/",
    "/philosophy/",
    "/pricing/",
    "/roadmap/",
    "/blog/",
    "/blog/defining-cabin/",
  ]) {
    assert.equal((await staticPage.goto(origin + path)).status(), 200);
    assert.equal(await staticPage.locator("main h1").isVisible(), true);
  }
  assert.equal((await staticPage.goto(origin + "/wrong-turn/")).status(), 404);
  await staticPage.locator("main a[href='/']").click();
  assert.equal(new URL(staticPage.url()).pathname, "/");
  assert.deepEqual(failures, []);
  console.log(
    "PASS direct static pages without JavaScript, 404 recovery and clean network/console",
  );
} finally {
  await browser?.close();
  server?.kill();
}
