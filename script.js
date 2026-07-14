const forcedReducedMotion = new URLSearchParams(window.location.search).has("reduced-motion");
const prefersReducedMotion = forcedReducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector("[data-header]");
const blogManifestPath = "blog/index.json";
const workspaceSequence = document.querySelector("[data-workspace-sequence]");
const workspaceSticky = document.querySelector(".workspace-sticky");
const stageCopy = document.querySelector("[data-stage-copy]");
const stageDetail = document.querySelector("[data-stage-detail]");
const disappearScene = document.querySelector("[data-disappear-scene]");
let articleProgressBar = null;
let refreshAmbientSpores = () => {};
const parallaxLayers = [...document.querySelectorAll("[data-depth]")];
let workspacePinnedByScrollTrigger = false;
let activeWorkspaceCopy = 0;
let workspaceCopyTimer = null;
const stageText = [
  {
    title: "Begin with only the page.",
    detail: "The manuscript spans the room first. Nothing else enters before the writing has a place."
  },
  {
    title: "Let chapters appear beside it.",
    detail: "A quiet rail is drawn on the left when the draft needs shape and sequence."
  },
  {
    title: "Keep character notes close.",
    detail: "A margin note opens on the right, near enough to guide the scene without taking over."
  },
  {
    title: "Trace the world underneath.",
    detail: "A fantasy timeline settles below the manuscript, keeping the larger world visible at the edge."
  }
];

document.body.classList.add("ready");
initMotionLibraries();
initImageLoading();
initAmbientSpores();

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

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLightbox();
  if (event.key === "Enter" && event.target instanceof Element && event.target.matches(".article-content img")) openLightbox(event.target);
});

document.addEventListener("click", async (event) => {
  if (!(event.target instanceof Element)) return;

  const shareButton = event.target.closest("[data-copy-post-link]");
  if (shareButton) {
    await copyText(window.location.href);
    shareButton.classList.add("is-copied");
    window.setTimeout(() => { shareButton.classList.remove("is-copied"); }, 1500);
    return;
  }

  const codeButton = event.target.closest("[data-copy-code]");
  if (codeButton) {
    await copyText(codeButton.closest("pre")?.querySelector("code")?.innerText || "");
    codeButton.classList.add("is-copied");
    codeButton.innerHTML = `<i class="fa-solid fa-check" aria-hidden="true"></i><span class="sr-only">Copied</span>`;
    window.setTimeout(() => {
      codeButton.classList.remove("is-copied");
      codeButton.innerHTML = `<i class="fa-regular fa-copy" aria-hidden="true"></i><span class="sr-only">Copy code</span>`;
    }, 1400);
    return;
  }

  const image = event.target.closest(".article-content img");
  if (image) {
    openLightbox(image);
    return;
  }

  if (event.target.closest(".article-lightbox button") || event.target.classList.contains("article-lightbox")) {
    closeLightbox();
    return;
  }

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
let articleMount = document.querySelector("[data-article-mount]");

if (blogList || articleMount) {
  loadBlog();
}

initReveals();
initRoadmapPath();
initWorkspaceTimelinePath();
updateScrollEffects();

async function loadBlog() {
  const posts = await getPosts();
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("post");

  if (slug) {
    const post = posts.find((item) => item.slug === slug);
    if (post) {
      articleMount = ensureArticleMount();
      document.querySelector(".page-hero")?.remove();
      blogList?.remove();
      document.body.classList.add("article-view");
      articleMount.classList.add("is-loading");
      await renderArticle(post);
      return;
    }
  }

  articleMount?.remove();
  if (blogList) renderBlogList(posts);
}

function ensureArticleMount() {
  if (articleMount) return articleMount;
  const mount = document.createElement("article");
  mount.className = "article-shell";
  mount.dataset.articleMount = "";
  document.querySelector("main")?.append(mount);
  return mount;
}

async function getPosts() {
  try {
    const response = await fetch(blogManifestPath);
    const manifest = await response.json();
    const manifestUrl = new URL(blogManifestPath, window.location.href);

    const posts = await Promise.all(manifest.posts.map(async (post) => {
      const path = new URL(post.path, manifestUrl).href;
      let content = "";
      try {
        const markdownResponse = await fetch(path, { cache: "no-cache" });
        if (markdownResponse.ok) content = await markdownResponse.text();
      } catch {
        content = "";
      }

      return {
        title: post.title,
        date: post.date,
        excerpt: post.excerpt,
        path,
        content,
        readingTime: estimateReadingTime(content || post.excerpt || ""),
        slug: post.slug || post.path.split("/").pop().replace(/\.md$/, "")
      };
    }));

    return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch {
    return [];
  }
}

function renderBlogList(posts) {
  if (!posts.length) {
    blogList.innerHTML = `<p>No blog posts have been published yet.</p>`;
    return;
  }

  blogList.innerHTML = posts.map((post) => `
    <a class="blog-card" href="blog.html?post=${post.slug}">
      <span class="blog-card-meta"><time datetime="${post.date}">${formatDate(post.date)}</time><span>${post.readingTime} min read</span></span>
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

  if (!markdown) {
  try {
    const response = await fetch(post.path, {
      cache: "no-cache"
    });

    if (response.ok) {
      markdown = await response.text();
    }
  } catch {
    markdown = "";
  }
  }

  if (!markdown) {
    articleMount.innerHTML = `
      <header>
        <p class="eyebrow">Blog</p>
        <h1>Post unavailable</h1>
        <p>This article could not be loaded. Please return to the Blog and try another entry.</p>
      </header>
    `;
    revealArticleMount();
    return;
  }

  const content = stripFrontmatter(markdown);
  const parsed = window.marked
    ? marked.parse(content)
    : basicMarkdown(content);

  const html = window.DOMPurify
    ? DOMPurify.sanitize(parsed)
    : parsed;

  document.title = `${post.title} - Cabin Blog`;

  setMeta("description", post.excerpt || "A Cabin blog post.");
  setMeta("og:title", `${post.title} - Cabin Blog`, true);
  setMeta("og:description", post.excerpt || "A Cabin blog post.", true);
  setCanonical(`https://writecabin.com/blog.html?post=${post.slug}`);

  articleMount.innerHTML = `
    <a class="article-back-link" href="blog.html">
      <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
      <span>Back to All Blogs</span>
    </a>

    <header>
      <div class="article-meta-row">
        <time class="article-date" datetime="${post.date}">${formatDate(post.date)}</time>
        <span>${estimateReadingTime(markdown)} min read</span>
        <button class="article-share-button" type="button" data-copy-post-link aria-live="polite"><span class="share-label">Copy link</span><span class="share-label copied-label">Copied</span></button>
      </div>
      <h1>${escapeHtml(post.title)}</h1>
      <p>${escapeHtml(post.excerpt || "")}</p>
    </header>

    <div class="article-progress" data-article-progress aria-hidden="true"><span></span></div>

    <div class="article-content">${html}</div>
  `;

  if (window.hljs) {
    articleMount
      .querySelectorAll("pre code")
      .forEach((block) => hljs.highlightElement(block));
  }

  articleProgressBar = articleMount.querySelector("[data-article-progress] span");
  enhanceCodeBlocks();
  enhanceArticleImages(post.path);
  requestAnimationFrame(() => {
    updateArticleProgress();
    refreshAmbientSpores();
  });
  articleMount.querySelectorAll("img").forEach((image) => {
    image.addEventListener("load", refreshAmbientSpores, { once: true });
  });
  revealArticleMount();
}

function revealArticleMount() {
  if (!articleMount) return;

  const items = [
    articleMount.querySelector(".article-back-link"),
    articleMount.querySelector("header"),
    ...articleMount.querySelectorAll(".article-content > *")
  ].filter(Boolean);

  items.forEach((item, index) => {
    item.classList.add("article-reveal");
    item.style.transitionDelay = prefersReducedMotion
      ? "0ms"
      : `${Math.min(index * 70, 560)}ms`;
  });

  window.requestAnimationFrame(() => {
    articleMount.classList.remove("is-loading");
    articleMount.classList.add("is-ready");
    items.forEach((item) => item.classList.add("is-visible"));
  });
}

function estimateReadingTime(markdown) {
  const text = stripFrontmatter(markdown)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_`\[\]()!-]/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 225));
}

function updateArticleProgress() {
  if (!articleProgressBar || !document.body.classList.contains("article-view")) return;
  const max = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight
  ) - window.innerHeight;
  const progress = max > 0 ? clamp(window.scrollY / max, 0, 1) : 1;
  articleProgressBar.style.transform = `scaleX(${progress})`;
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const input = document.createElement("textarea");
  input.value = value;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.append(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

function enhanceCodeBlocks() {
  articleMount?.querySelectorAll(".article-content pre").forEach((pre) => {
    if (pre.querySelector("[data-copy-code]")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "code-copy-button";
    button.dataset.copyCode = "";
    button.setAttribute("aria-label", "Copy code");
    button.innerHTML = `<i class="fa-regular fa-copy" aria-hidden="true"></i><span class="sr-only">Copy code</span>`;
    pre.append(button);
  });
}

function enhanceArticleImages(basePath = window.location.href) {
  articleMount?.querySelectorAll(".article-content img").forEach((image) => {
    const source = image.getAttribute("src");
    if (source && !/^(?:[a-z]+:|#|\/)/i.test(source)) {
      image.src = new URL(source, basePath).href;
    }
    image.classList.add("lightbox-image");
    image.setAttribute("tabindex", "0");
  });
}

function openLightbox(image) {
  closeLightbox(true);
  const lightbox = document.createElement("div");
  lightbox.className = "article-lightbox";
  lightbox.innerHTML = `
    <button type="button" aria-label="Close image"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
    <img src="${image.currentSrc || image.src}" alt="${escapeHtml(image.alt || "")}">
  `;
  document.body.append(lightbox);
  document.body.classList.add("has-lightbox");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => lightbox.classList.add("is-open"));
  });
}

function closeLightbox(skipAnimation = false) {
  const lightbox = document.querySelector(".article-lightbox");
  if (!lightbox) return;
  if (skipAnimation) {
    lightbox.remove();
    document.body.classList.remove("has-lightbox");
    return;
  }
  lightbox.classList.remove("is-open");
  window.setTimeout(() => {
    lightbox.remove();
    document.body.classList.remove("has-lightbox");
  }, prefersReducedMotion ? 0 : 260);
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
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from(".approach-copy", { opacity: 0, y: 42, duration: 1.2, ease: "power4.out" });
    initWorkspacePin();
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

function initWorkspacePin() {
  if (!workspaceSequence || !workspaceSticky) return;
  workspacePinnedByScrollTrigger = true;

  ScrollTrigger.create({
    trigger: workspaceSequence,
    start: "top top",
    end: "bottom bottom",
    scrub: 0.65,
    invalidateOnRefresh: true,
    onUpdate: (self) => updateWorkspaceProgress(normalizeWorkspaceProgress(self.progress)),
    onLeaveBack: () => updateWorkspaceProgress(0),
    onLeave: () => updateWorkspaceProgress(1)
  });
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

  if (!workspacePinnedByScrollTrigger) updateWorkspace(scrollY);
  updateDisappearance(scrollY);
  updateArticleProgress();
}

function updateWorkspace(scrollY) {
  if (!workspaceSequence || !workspaceSticky) return;
  const rect = workspaceSequence.getBoundingClientRect();
  const total = workspaceSequence.offsetHeight - window.innerHeight;
  const progress = clamp((-rect.top) / Math.max(total, 1), 0, 1);
  updateWorkspaceProgress(normalizeWorkspaceProgress(progress));
}

function normalizeWorkspaceProgress(progress) {
  return clamp(progress, 0, 1);
}

function updateWorkspaceProgress(progress) {
  const stage = progress < 0.24 ? 0 : progress < 0.50 ? 1 : progress < 0.76 ? 2 : 3;
  workspaceSticky.dataset.stage = String(stage);

  const copyIndex = stage;
  if (stageCopy && activeWorkspaceCopy !== copyIndex) {
    activeWorkspaceCopy = copyIndex;
    const copyWrap = stageCopy.closest(".workspace-copy");
    window.clearTimeout(workspaceCopyTimer);
    copyWrap?.classList.add("is-changing");
    workspaceCopyTimer = window.setTimeout(() => {
      stageCopy.textContent = stageText[copyIndex].title;
      if (stageDetail) stageDetail.textContent = stageText[copyIndex].detail;
      window.requestAnimationFrame(() => copyWrap?.classList.remove("is-changing"));
    }, prefersReducedMotion ? 0 : 90);
  }
}

function updateDisappearance() {
  if (!disappearScene) return;
  const rect = disappearScene.getBoundingClientRect();
  const progress = clamp((window.innerHeight - rect.top) / Math.max(rect.height, 1), 0, 1);
  disappearScene.classList.toggle("is-dissolved", progress > 0.42);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function initRoadmapPath() {
  const roadmap = document.querySelector(".roadmap-grid");
  const mount = document.querySelector("[data-roadmap-path]");
  if (!roadmap || !mount) return;

  const media = window.matchMedia("(max-width: 1100px)");
  let frame = null;

  const draw = () => {
    if (media.matches) {
      mount.innerHTML = "";
      return;
    }

    const cards = [...roadmap.querySelectorAll(".roadmap-card")];
    if (!cards.length) return;

    const roadRect = roadmap.getBoundingClientRect();
    const points = cards.map((card) => {
      const rect = card.getBoundingClientRect();
      return {
        x: rect.left - roadRect.left + rect.width / 2,
        y: rect.top - roadRect.top - 48,
        status: card.classList.contains("done") ? "done" : card.classList.contains("active") ? "active" : "future"
      };
    });

    mount.innerHTML = "";
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${roadRect.width} ${roadRect.height}`);
    svg.setAttribute("preserveAspectRatio", "none");
    mount.append(svg);

    const route = window.d3?.line
      ? d3.line()
        .x((point) => point.x)
        .y((point) => point.y)
        .curve(d3.curveCatmullRom.alpha(0.55))
      : (routePoints) => routePoints.map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" ");

    appendSvgElement(svg, "path", {
      class: "roadmap-route-base",
      d: route(points)
    });

    const livePoints = points.slice(0, 2);
    appendSvgElement(svg, "path", {
      class: "roadmap-route-live",
      d: route(livePoints)
    });

    points.forEach((point) => {
      appendSvgElement(svg, "circle", {
        class: `roadmap-dot is-${point.status}`,
        cx: point.x,
        cy: point.y,
        r: 14
      });
    });
  };

  const scheduleDraw = () => {
    if (frame) window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(draw);
  };

  scheduleDraw();
  window.addEventListener("resize", scheduleDraw, { passive: true });
  media.addEventListener?.("change", scheduleDraw);

  if ("ResizeObserver" in window) {
    new ResizeObserver(scheduleDraw).observe(roadmap);
  }
}

function appendSvgElement(svg, tagName, attributes) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tagName);
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
  svg.append(element);
  return element;
}

function initWorkspaceTimelinePath() {
  const timeline = document.querySelector(".fantasy-timeline");
  const mount = document.querySelector("[data-timeline-path]");
  if (!timeline || !mount) return;

  let frame = null;

  const draw = () => {
    const events = [...timeline.querySelectorAll("span")];
    if (events.length < 2) return;

    const timelineRect = timeline.getBoundingClientRect();
    const isCompact = window.matchMedia("(max-width: 760px)").matches;
    const points = events.map((event) => {
      const rect = event.getBoundingClientRect();
      return {
        x: isCompact ? 22 : rect.left - timelineRect.left + 4.5,
        y: rect.top - timelineRect.top + 7,
        current: event.classList.contains("current-event")
      };
    });

    mount.innerHTML = "";
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${timelineRect.width} ${timelineRect.height}`);
    svg.setAttribute("preserveAspectRatio", "none");
    mount.append(svg);

    const route = points.map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" ");

    appendSvgElement(svg, "path", {
      class: "timeline-route-base",
      d: route
    });

    points.forEach((point) => {
      appendSvgElement(svg, "circle", {
        class: point.current ? "timeline-dot is-current" : "timeline-dot",
        cx: point.x,
        cy: point.y,
        r: 5.5
      });
    });
  };

  const scheduleDraw = () => {
    if (frame) window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(draw);
  };

  scheduleDraw();
  window.addEventListener("resize", scheduleDraw, { passive: true });

  if ("ResizeObserver" in window) {
    new ResizeObserver(scheduleDraw).observe(timeline);
  }
}

function initImageLoading() {
  const images = [...document.querySelectorAll(".approach-art-image, .moment-image, .disappear-image")];
  if (!images.length) return;

  images.forEach((image) => {
    const markLoaded = () => image.classList.add("is-loaded");
    if (image.complete && image.naturalWidth > 0) {
      if (image.decode) {
        image.decode().then(markLoaded).catch(markLoaded);
      } else {
        markLoaded();
      }
      return;
    }

    image.addEventListener("load", markLoaded, { once: true });
    image.addEventListener("error", markLoaded, { once: true });
  });
}

function initAmbientSpores() {
  const layer = document.createElement("div");
  layer.className = "ambient-spores";
  layer.setAttribute("aria-hidden", "true");
  document.body.prepend(layer);

  const populate = () => {
    layer.style.height = "0px";
    const height = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      window.innerHeight
    );
    const count = Math.min(Math.max(Math.ceil(height / (prefersReducedMotion ? 360 : 150)), 34), 150);
    layer.style.height = `${height}px`;
    layer.replaceChildren();

    for (let index = 0; index < count; index += 1) {
      const spore = document.createElement("span");
      const size = index % 10 === 0 ? 12 + Math.random() * 4 : 5 + Math.random() * 5;
      spore.style.setProperty("--spore-x", `${Math.random() * 100}%`);
      spore.style.setProperty("--spore-y", `${Math.random() * height}px`);
      spore.style.setProperty("--spore-size", `${size}px`);
      spore.style.setProperty("--spore-delay", `${Math.random() * -18}s`);
      spore.style.setProperty("--spore-duration", `${18 + Math.random() * 18}s`);
      spore.style.setProperty("--spore-drift-x", `${(Math.random() - 0.5) * 64}px`);
      spore.style.setProperty("--spore-drift-y", `${-24 - Math.random() * 48}px`);
      spore.style.setProperty("--spore-opacity", `${0.16 + Math.random() * 0.10}`);
      spore.style.setProperty("--spore-rotation", `${Math.random() * 360}deg`);
      layer.append(spore);
    }
  };

  populate();
  refreshAmbientSpores = populate;
  window.addEventListener("load", populate, { once: true });
  window.addEventListener("resize", populate, { passive: true });
}
