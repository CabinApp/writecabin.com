const forcedReducedMotion = new URLSearchParams(window.location.search).has("reduced-motion");
const prefersReducedMotion = forcedReducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector("[data-header]");
const blogManifestPath = "blog/index.json";
const workspaceSequence = document.querySelector("[data-workspace-sequence]");
const workspaceSticky = document.querySelector(".workspace-sticky");
const stageCopy = document.querySelector("[data-stage-copy]");
const stageDetail = document.querySelector("[data-stage-detail]");
const disappearScene = document.querySelector("[data-disappear-scene]");
const parallaxLayers = [...document.querySelectorAll("[data-depth]")];
const stageText = [
  {
    title: "Begin with only the page.",
    detail: "The writing surface is quiet first. No chrome, no ceremony, no structure before it has earned a place."
  },
  {
    title: "Add structure when the story asks for it.",
    detail: "A chapter rail enters. Then scenes. The page is still the room's center."
  },
  {
    title: "Build an entire world without losing sight of the writing.",
    detail: "Characters, timeline and research gather at the edges, close enough to help and quiet enough to disappear."
  }
];

document.body.classList.add("ready");
initMotionLibraries();

if (window.location.pathname.endsWith("/") || window.location.pathname.endsWith("index.html")) {
  const params = new URLSearchParams(window.location.search);
  const page = params.get("page");
  if (page && page !== "home") {
    const map = {
      philosophy: "philosophy.html",
      blog: "blog.html",
      roadmap: "roadmap.html"
    };
    if (map[page]) window.location.replace(map[page]);
  }
}

let ticking = false;

window.addEventListener("scroll", () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 10);
  if (!ticking) {
    window.requestAnimationFrame(updateScrollEffects);
    ticking = true;
  }
}, { passive: true });

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (!link || prefersReducedMotion) return;
  const url = new URL(link.href, window.location.href);
  const isInternal = url.origin === window.location.origin && !link.hash && link.target !== "_blank";
  if (!isInternal) return;
  event.preventDefault();
  document.body.classList.add("page-leaving");
  window.setTimeout(() => {
    window.location.href = link.href;
  }, 180);
});

const blogList = document.querySelector("[data-blog-list]");
const articleMount = document.querySelector("[data-article-mount]");

if (blogList || articleMount) {
  loadBlog();
}

initReveals();
updateScrollEffects();

async function loadBlog() {
  const posts = await getPosts();
  if (articleMount) {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("post");
    if (slug) {
      const post = posts.find((item) => item.slug === slug);
      if (post) {
        document.querySelector(".page-hero")?.remove();
        blogList?.remove();
        articleMount.removeAttribute("hidden");
        await renderArticle(post);
        return;
      }
    }
  }
  if (blogList) renderBlogList(posts);
}

async function getPosts() {
  try {
    const response = await fetch(blogManifestPath);
    const manifest = await response.json();
    return manifest.posts
      .map((post) => ({
        title: post.title,
        date: post.date,
        excerpt: post.excerpt,
        content: post.content,
        path: post.path,
        slug: post.slug || post.path.split("/").pop().replace(/\.md$/, "")
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch {
    return [];
  }
}

function renderBlogList(posts) {
  if (!posts.length) {
    blogList.innerHTML = `<p>No devlog posts have been published yet.</p>`;
    return;
  }

  blogList.innerHTML = posts.map((post) => `
    <a class="blog-card" href="blog.html?post=${post.slug}">
      <time datetime="${post.date}">${formatDate(post.date)}</time>
      <span>
        <h2>${escapeHtml(post.title)}</h2>
        <p>${escapeHtml(post.excerpt || "A Cabin development note.")}</p>
      </span>
      <span class="arrow" aria-hidden="true">-></span>
    </a>
  `).join("");
}

async function renderArticle(post) {
  let markdown = post.content || "";
  try {
    const response = await fetch(new URL(post.path, window.location.href), { cache: "no-cache" });
    if (response.ok) markdown = await response.text();
  } catch {
    markdown = post.content || "";
  }

  if (!markdown) {
    articleMount.innerHTML = `
      <header>
        <p class="eyebrow">Devlog</p>
        <h1>Post unavailable</h1>
        <p>This article could not be loaded. Please return to the devlog and try another entry.</p>
      </header>
    `;
    return;
  }
  const content = stripFrontmatter(markdown);
  const parsed = window.marked ? marked.parse(content) : basicMarkdown(content);
  const html = window.DOMPurify ? DOMPurify.sanitize(parsed) : parsed;

  document.title = `${post.title} - Cabin Devlog`;
  setMeta("description", post.excerpt || "A Cabin development note.");
  setMeta("og:title", `${post.title} - Cabin Devlog`, true);
  setMeta("og:description", post.excerpt || "A Cabin development note.", true);
  setCanonical(`https://writecabin.com/blog.html?post=${post.slug}`);

  articleMount.innerHTML = `
    <header>
      <p class="eyebrow">Devlog</p>
      <time class="article-date" datetime="${post.date}">${formatDate(post.date)}</time>
      <h1>${escapeHtml(post.title)}</h1>
      <p>${escapeHtml(post.excerpt || "")}</p>
    </header>
    <div class="article-content">${html}</div>
  `;

  if (window.hljs) {
    articleMount.querySelectorAll("pre code").forEach((block) => hljs.highlightElement(block));
  }
}

function stripFrontmatter(markdown) {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
}

function basicMarkdown(markdown) {
  return markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .split(/\n{2,}/)
    .map((block) => block.startsWith("<h") ? block : `<p>${block.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(new Date(date));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setMeta(name, content, property = false) {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let tag = document.querySelector(selector);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(property ? "property" : "name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setCanonical(url) {
  let tag = document.querySelector('link[rel="canonical"]');
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", "canonical");
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", url);
}

function initReveals() {
  const revealItems = [...document.querySelectorAll(".reveal, .roadmap-card, .philosophy-item, .blog-card")];
  if (!revealItems.length) return;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.18 });

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 90, 360)}ms`;
    observer.observe(item);
  });
}

function initMotionLibraries() {
  if (prefersReducedMotion) return;
  if (window.Lenis) {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from(".approach-copy", { opacity: 0, y: 42, duration: 1.2, ease: "power4.out" });
    gsap.utils.toArray(".principle-moment").forEach((item) => {
      gsap.fromTo(item, { opacity: 0.35, y: 80, scale: 0.96 }, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1,
        ease: "power4.out",
        scrollTrigger: { trigger: item, start: "top 72%", end: "top 32%", scrub: 0.7 }
      });
    });
    gsap.fromTo(".today-panel", { opacity: 0, y: 48 }, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power4.out",
      scrollTrigger: { trigger: ".project-today", start: "top 70%" }
    });
  }
}

function updateScrollEffects() {
  ticking = false;
  const scrollY = window.scrollY;

  if (!prefersReducedMotion) {
    parallaxLayers.forEach((layer) => {
      const speed = Number(layer.dataset.depth || 0);
      layer.style.transform = `translate3d(0, ${scrollY * speed}px, 0)`;
    });
  }

  updateWorkspace(scrollY);
  updateDisappearance(scrollY);
}

function updateWorkspace(scrollY) {
  if (!workspaceSequence || !workspaceSticky) return;
  const rect = workspaceSequence.getBoundingClientRect();
  const total = workspaceSequence.offsetHeight - window.innerHeight;
  const progress = clamp((-rect.top) / Math.max(total, 1), 0, 1);
  const stage = progress < 0.24 ? 0 : progress < 0.46 ? 1 : progress < 0.68 ? 2 : progress < 0.86 ? 3 : 4;
  workspaceSticky.dataset.stage = String(stage);

  const copyIndex = stage < 2 ? 0 : stage < 4 ? 1 : 2;
  if (stageCopy && stageCopy.textContent !== stageText[copyIndex].title) {
    stageCopy.textContent = stageText[copyIndex].title;
    stageDetail.textContent = stageText[copyIndex].detail;
  }
}

function updateDisappearance() {
  if (!disappearScene || !header) return;
  const rect = disappearScene.getBoundingClientRect();
  const progress = clamp((window.innerHeight - rect.top) / Math.max(rect.height, 1), 0, 1);
  disappearScene.classList.toggle("is-dissolved", progress > 0.42);
  header.classList.toggle("nav-vanish", progress > 0.5);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
