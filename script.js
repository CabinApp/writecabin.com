const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector("[data-header]");
const blogManifestPath = "blog/index.json";

document.body.classList.add("ready");

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

window.addEventListener("scroll", () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 10);
  if (prefersReducedMotion) return;
  document.querySelectorAll("[data-parallax]").forEach((layer) => {
    const speed = Number(layer.dataset.parallax || 0);
    layer.style.transform = `translate3d(0, ${window.scrollY * speed}px, 0)`;
  });
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
  const response = await fetch(post.path);
  const markdown = await response.text();
  const content = stripFrontmatter(markdown);
  const html = window.DOMPurify
    ? DOMPurify.sanitize(marked.parse(content))
    : marked.parse(content);

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
  return markdown.replace(/^---\n[\s\S]*?\n---\n?/, "");
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
