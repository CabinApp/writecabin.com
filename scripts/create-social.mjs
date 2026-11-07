import { launchBrowser } from "./browser.mjs";
const origin = process.env.CABIN_TEST_URL || "http://127.0.0.1:4173";
const browser = await launchBrowser();
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.goto(origin);
  await page.setContent(
    `<!doctype html><style>@font-face{font-family:Lora;src:url('${origin}/assets/fonts/lora-400.ttf')}@font-face{font-family:Geist;src:url('${origin}/assets/fonts/geist-400.ttf')}*{box-sizing:border-box}body{margin:0;padding:58px 74px;background:#f1f4f0;color:#202522;font-family:Geist}header{display:flex;align-items:center;gap:12px;font:36px Lora}img{width:46px;height:46px}h1{font:84px/1.1 Lora;letter-spacing:-4px;margin:65px 0 28px}h1 span{color:#506457}footer{display:flex;justify-content:space-between;color:#56635b;font-size:23px;margin-top:54px}p{margin:0;font-size:25px;color:#56635b}</style><header><img src="${origin}/assets/logo.png" alt="">Cabin</header><h1>Your story.<br><span>Your space.</span></h1><p>A local-first writing app that grows with you.</p><footer><span>Coming soon</span><span>writecabin.com</span></footer>`,
  );
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: "assets/social.png" });
  console.log("Created assets/social.png (1200 × 630).");
} finally {
  await browser.close();
}
