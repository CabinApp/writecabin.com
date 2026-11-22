import { cp, mkdir, readFile, writeFile, stat, rm, realpath } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const host = "https://writecabin.com";
const read = (path) => readFile(path, "utf8");
const safe = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );
const nav = [
  ["/features/", "Features"],
  ["/philosophy/", "Philosophy"],
  ["/pricing/", "Pricing"],
  ["/roadmap/", "Roadmap"],
  ["/blog/", "Blog"],
];
const brand =
  '<a class="brand" href="/" aria-label="Cabin home"><img src="/assets/logo.png" width="37" height="37" alt=""><span>Cabin</span></a>';
const navLinks = nav
  .map(([url, label]) => `<a href="${url}">${label}</a>`)
  .join("");
const heading = (title, summary) =>
  `<header class="page-intro"><h1>${title}</h1><p>${summary}</p></header>`;
const list = (items) =>
  `<dl class="editorial-list">${items.map(([name, copy]) => `<div><dt>${name}</dt><dd>${copy}</dd></div>`).join("")}</dl>`;
const page = (title, summary, body) =>
  `<article class="frame editorial">${heading(title, summary)}${body}</article>`;
const routes = new Map();
const add = (path, title, description, content) =>
  routes.set(path, { title, description, content });

add(
  "/",
  "Cabin | A little more room to write",
  "Cabin is a local-first desktop writing app. Start with a page and shape your workspace as your story grows.",
  await read("content/home.html"),
);
add(
  "/features/",
  "Features | Cabin",
  "Explore Cabin’s manuscript editor, Deep Writing mode, dockable workspace and local notes.",
  page(
    "Room for the work.",
    "Cabin starts with a manuscript. The rest opens when you need it.",
    `<figure class="route-photo"><img src="/assets/product/dawn-writing.webp" width="1440" height="1000" alt="Cabin’s Dawn editor with chapters and a sample manuscript."><figcaption>Writing in Cabin’s Dawn theme.</figcaption></figure>
  ${list([
    [
      "Manuscript",
      "Draft in a rich-text editor. Nest, move and rename pages as chapters and scenes take shape.",
    ],
    [
      "Deep Writing",
      "Hide the surrounding panels and centre the manuscript. Return to your previous arrangement when you need it.",
    ],
    [
      "A dockable workspace",
      "Open the Component Library and place a component beside your draft. Move it into a tab or expand it when you need more room.",
    ],
    [
      "Notes alongside the page",
      "Keep General and Wiki Notes in the project. Link notes by stable references and keep them when you rearrange the workspace.",
    ],
    [
      "Local files",
      "Cabin saves manuscript pages and notes in readable files in your project folder. Draft checkpoints can be recovered from inside the app.",
    ],
  ])}<a class="action" href="/#workspace">Try the workspace preview</a>`,
  ),
);
add(
  "/philosophy/",
  "Philosophy | Cabin",
  "How Cabin puts writing first, with progressive complexity and local ownership.",
  page(
    "The writing comes first.",
    "We’re building a place where your attention can stay with the work.",
    list([
      [
        "Start small",
        "Start with a page. Build a structure around it as the work takes shape.",
      ],
      [
        "Keep what’s yours",
        "The manuscript lives in a folder you control. You can write offline and read your work outside Cabin.",
      ],
      [
        "Make room, then clear it",
        "Arrange the tools around your draft. Set them aside again when you need the page to yourself.",
      ],
      [
        "Keep the author in charge",
        "Any future AI tools are intended as optional assistance. Cloud services, if introduced, will be optional too.",
      ],
    ]) + '<a class="text-link" href="/features/">See how Cabin works</a>',
  ),
);
add(
  "/pricing/",
  "Pricing | Cabin",
  "Cabin is in development. See the intended local and optional additions before pricing is announced.",
  page(
    "Pricing",
    "Cabin is in development. Prices and purchase options haven’t been announced.",
    list([
      [
        "Local writing",
        "The plan is to keep a free core for local writing and organisation, including the manuscript editor and local projects.",
      ],
      [
        "Advanced tools",
        "Paid tools for more advanced planning and publishing are being considered.",
      ],
      [
        "Optional cloud",
        "Sync and cloud backup are planned as optional services. They aren’t required to write or keep files on your device.",
      ],
    ]) + '<a class="text-link" href="/roadmap/">See what’s in development</a>',
  ),
);
add(
  "/roadmap/",
  "Roadmap | Cabin",
  "Follow what is implemented in Cabin’s development build and what is planned.",
  page(
    "The roadmap",
    "Cabin is in development for Windows. These are development milestones, with no announced release dates.",
    list([
      [
        "Implemented in development",
        "Local projects and readable manuscript files, rich-text editing, draft recovery, manuscript hierarchy, Deep Writing, dockable components, and General and Wiki Notes.",
      ],
      [
        "Planned",
        "Dedicated character, timeline and worldbuilding tools, asset management, and export workflows.",
      ],
      [
        "Exploring",
        "Optional cloud services and assistive AI. Scope and timing are still open.",
      ],
    ]) + '<a class="text-link" href="/blog/">Read the development journal</a>',
  ),
);

const { posts } = JSON.parse(await read("content/posts.json"));
const dateLabel = (date) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(date));
const postURL = (post) => `/blog/${post.slug}/`;
add(
  "/blog/",
  "Blog | Cabin",
  "Essays and development notes about building Cabin, a local-first writing app.",
  page(
    "The Cabin journal",
    "Notes on writing software, what we’re making, and how it’s taking shape.",
    `<img class="journal-cover" src="/assets/cabin-blog-room.webp" width="1536" height="1024" loading="lazy" alt="A writing desk looking out of a quiet cabin window.">
  <ul class="journal-list">${[...posts]
    .reverse()
    .map(
      (post) =>
        `<li><a href="${postURL(post)}"><time datetime="${post.date}">${dateLabel(post.date)}</time><div><h2>${safe(post.title)}</h2><p>${safe(post.excerpt)}</p></div><span aria-hidden="true">↗</span></a></li>`,
    )
    .join("")}</ul>`,
  ),
);
for (const post of posts) {
  const article = (await read(`content/posts/${post.slug}.html`))
    .replace(/https:\/\/(?:www\.)?writecabin\.com\/(?=[^"])/g, "/")
    .replace('href="/bouncy-buttons"', 'href="/bouncy-buttons.html"');
  add(
    postURL(post),
    `${post.title} | Cabin`,
    post.excerpt,
    `<article class="frame editorial essay"><a class="text-link" href="/blog/">Back to the journal</a>
    ${heading(safe(post.title), safe(post.excerpt))}
    <time datetime="${post.date}">${dateLabel(post.date)}</time>
    <div class="essay-body">${article}</div></article>`,
  );
}
add(
  "/about/",
  "About | Cabin",
  "Cabin is a local-first desktop application for writers.",
  page(
    "About Cabin",
    "Cabin is an independent desktop writing app in development for Windows.",
    '<p>It began with a question. What if writing software could stay as simple as a page until the writer needed more?</p><a class="text-link" href="/philosophy/">Read Cabin’s philosophy</a>',
  ),
);
add(
  "/404.html",
  "Page not found | Cabin",
  "Return to Cabin.",
  page(
    "A page turned.",
    "We couldn’t find that page.",
    '<a class="action" href="/">Back to Cabin</a>',
  ),
);

function document(path, route) {
  const isError = path === "/404.html";
  const canonical = host + path;
  const description = safe(route.description);
  const title = safe(route.title);
  return `<!doctype html>
<!-- Generated by scripts/build.mjs. Edit the content sources or the builder. -->
<html lang="en-GB" data-environment="morning">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  ${
    isError
      ? '<meta name="robots" content="noindex">'
      : `<link rel="canonical" href="${canonical}">
  <meta property="og:url" content="${canonical}">`
  }
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="${path.startsWith("/blog/") && path !== "/blog/" ? "article" : "website"}">
  <meta property="og:site_name" content="Cabin">
  <meta property="og:image" content="${host}/assets/social.jpg">
  <meta property="og:image:alt" content="The Cabin website opens on a misty Nordic valley.">
  <meta name="theme-color" content="#f1f4f0">
  <link rel="icon" href="/assets/logo.png" type="image/png">
  <link rel="preload" href="/assets/fonts/lora-400.ttf" as="font" type="font/ttf" crossorigin>
  <link rel="stylesheet" href="/styles.css">
  <script src="/environment.js"></script>
  <script type="module" src="/main.js"></script>
</head>
<body data-route="${path}">
  <a class="skip" href="#main">Skip to main content</a>
  <header class="site-header"><div class="frame header-inner">${brand}
    <button type="button" class="menu-toggle" aria-controls="navigation" aria-expanded="false" hidden>Menu</button>
    <nav class="site-nav" id="navigation" aria-label="Main navigation">${navLinks}<a class="header-action" href="/#workspace">Try the workspace</a></nav>
    <button type="button" class="environment-switch" aria-label="Switch to Aurora" hidden>Morning</button>
  </div></header>
  <main id="main" tabindex="-1">${route.content}</main>
  <footer class="site-footer"><div class="frame footer-inner">${brand}
    <p>A place for your words.</p>
    <nav aria-label="Footer navigation">${navLinks}<a href="https://github.com/CabinApp/writecabin.com">GitHub</a></nav>
    <small>© 2026 Cabin</small>
  </div></footer>
</body>
</html>
`;
}

const paths = [];
for (const [path, route] of routes) {
  const output = path === "/404.html" ? "404.html" : `.${path}index.html`;
  const html = document(path, route);
  for (const [, asset] of html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)) {
    await stat(`.${asset}`);
  }
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, html);
  paths.push(output);
}
await writeFile(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...routes.keys()]
  .filter((path) => path !== "/404.html")
  .map((path) => `  <url><loc>${host}${path}</loc></url>`)
  .join("\n")}
</urlset>
`,
);
await writeFile(
  "robots.txt",
  `User-agent: *\nAllow: /\nSitemap: ${host}/sitemap.xml\n`,
);
const outputDirectory = resolve(await realpath("."), "dist");
const existingOutput = await realpath(outputDirectory).catch((error) => {
  if (error.code !== "ENOENT") throw error;
  return outputDirectory;
});
if (existingOutput !== outputDirectory) throw new Error("Build output must be inside this checkout.");
await rm(outputDirectory, { recursive: true, force: true });
for (const path of [
  ...paths,
  "assets",
  "styles.css",
  "main.js",
  "environment.js",
  "bouncy-buttons.html",
  "robots.txt",
  "sitemap.xml",
  ".nojekyll",
  "CNAME",
]) {
  await mkdir(dirname(`dist/${path}`), { recursive: true });
  await cp(path, `dist/${path}`, { recursive: true });
}
console.log(`Built ${routes.size} static pages for GitHub Pages and dist/.`);
