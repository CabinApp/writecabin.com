import { cp, mkdir, readFile, writeFile, stat, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { release } from "../release.js";

const files = [
  "index.html",
  "404.html",
  "styles.css",
  "main.js",
  "media.js",
  "release.js",
  "robots.txt",
  "sitemap.xml",
  "CNAME",
  ".nojekyll",
];
const html = await readFile("index.html", "utf8");
if (!html.includes("https://writecabin.com/"))
  throw new Error("Canonical domain missing");
if (release.status === "available") {
  if (!release.version || !release.downloads.length)
    throw new Error("A public release needs a version and downloads");
  for (const item of release.downloads)
    if (!item.platform || new URL(item.url).protocol !== "https:")
      throw new Error("Invalid download configuration");
} else if (release.status !== "coming-soon")
  throw new Error("Unknown release status");
const references = [...html.matchAll(/(?:src|href)="(\/(?!\/)[^"#]*)"/g)].map(
  (match) => match[1],
);
for (const reference of references) {
  if (reference === "/") continue;
  await stat(resolve("." + reference));
}
await stat("assets/social.png");
const output = resolve("dist");
if (output !== resolve(".") + "\\dist" && output !== resolve(".") + "/dist")
  throw new Error("Unexpected build destination");
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of files) await cp(file, `dist/${file}`);
await cp("assets", "dist/assets", { recursive: true });
await writeFile("dist/.nojekyll", "");
console.log(
  "Built static Cabin website in dist/. Root source also remains GitHub Pages compatible.",
);
