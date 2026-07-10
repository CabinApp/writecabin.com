const app = document.querySelector("#app");
const header = document.querySelector("[data-header]");
const repoApi = "https://api.github.com/repos/CabinApp/writecabin.com/contents/blog?ref=main";

const philosophies = [
  {
    title: "Progressive complexity",
    body: "Cabin begins as a single blank file and grows only when the writer asks for more. Chapters, timelines, character cards, research and worldbuilding remain optional, never imposed."
  },
  {
    title: "Local ownership",
    body: "Projects live in folders the writer can see, understand and keep. Markdown is the foundation, with human-readable structure and no dependency on a disappearing cloud."
  },
  {
    title: "Writing first",
    body: "Every feature is judged by whether it protects the act of writing. Planning and worldbuilding matter, but the manuscript remains the center of gravity."
  },
  {
    title: "Calm flexibility",
    body: "Workspaces can be resized and rearranged, but Cabin should never become chaos. The default choices should feel complete before the writer customizes anything."
  },
  {
    title: "AI as editor",
    body: "AI can point at grammar, pacing and continuity concerns, but it does not replace the writer's voice. It offers observations, not co-written prose."
  },
  {
    title: "Open exits",
    body: "Exports to Markdown, PDF, DOCX, EPUB and print should feel like ownership. No visible or hidden watermark, no lock-in, no punishment for leaving."
  },
  {
    title: "Modular by design",
    body: "Plugins extend Cabin through panels, commands, views and themes. They add possibilities while the core writing experience stays recognizable."
  },
  {
    title: "Quiet interface",
    body: "Morning light, soft surfaces, hairline dividers and slow motion should make even complex projects feel like a room prepared for thought."
  },
  {
    title: "Built in public",
    body: "The website is the notebook for the journey: design decisions, development logs, roadmap progress and the reasoning behind Cabin's restraint."
  }
];

const roadmap = [
  {
    phase: "Foundation",
    status: "completed",
    title: "Name, domain, identity and philosophy",
    body: "Cabin has its name, domain, GitHub organization, temporary logo, typography, color palette and the first written product philosophy."
  },
  {
    phase: "Research",
    status: "next",
    title: "Understand real writing workflows",
    body: "Create personas for novelists, worldbuilders, screenwriters, researchers and students, then study the tools writers already rely on."
  },
  {
    phase: "MVP shape",
    status: "next",
    title: "Choose what belongs in the first version",
    body: "Move from a large feature inventory to a restrained MVP, keeping everything else in a later drawer."
  },
  {
    phase: "Experience design",
    status: "planned",
    title: "Sketch the workspace before coding",
    body: "Explore layouts, panels, resizing, docking and views until the product feels calm even when the project is large."
  },
  {
    phase: "Technical plan",
    status: "planned",
    title: "Set the architecture",
    body: "Finalize the desktop stack, editor library, file format, export approach and project structure before the implementation begins."
  },
  {
    phase: "Design system",
    status: "planned",
    title: "Make the room feel like Cabin",
    body: "Define spacing, type, icons, buttons, menus, sidebars, modals and reusable themes in the Morning and Aurora palettes."
  },
  {
    phase: "Prototype",
    status: "planned",
    title: "Test the feeling without persistence",
    body: "Build a pure interface prototype for resizing, docking, animations and writing flow before connecting storage."
  },
  {
    phase: "Core editor",
    status: "planned",
    title: "Write, save and return",
    body: "Implement projects, documents, the editor, autosave, themes and tabs with reliability as the baseline."
  },
  {
    phase: "Project system",
    status: "planned",
    title: "Let structure grow naturally",
    body: "Add folders, chapters, scenes, ordering and drag-and-drop so structure appears when the writer needs it."
  },
  {
    phase: "Worldbuilding",
    status: "planned",
    title: "Metadata without overwhelm",
    body: "Introduce characters, locations, events, notes, research, relationships and timelines as optional layers around the manuscript."
  },
  {
    phase: "Workspace, search and export",
    status: "planned",
    title: "Make large projects navigable and portable",
    body: "Build resizable panels, workspace presets, quick open, references, backlinks, and clean exports to common writing formats."
  },
  {
    phase: "Alpha",
    status: "planned",
    title: "Polish, observe and repair",
    body: "Refine accessibility, performance, recovery, keyboard shortcuts, AI editing, plugins and closed alpha feedback before opening wider."
  }
];

function routeFromUrl() {
  if (document.body.dataset.forcePage === "404") return { page: "404" };
  const params = new URLSearchParams(window.location.search);
  const post = params.get("post");
  if (post) return { page: "blog", post };
  return { page: params.get("page") || "home" };
}

function navigate(url) {
  history.pushState({}, "", url);
  render();
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-link]");
  if (!link) return;
  const href = link.getAttribute("href");
  if (!href || href.startsWith("http")) return;
  event.preventDefault();
  navigate(href);
});

window.addEventListener("popstate", render);
window.addEventListener("scroll", () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
  document.querySelectorAll("[data-parallax]").forEach((layer) => {
    const speed = Number(layer.dataset.parallax);
    layer.style.transform = `translate3d(0, ${window.scrollY * speed}px, 0)`;
  });
});

function setActive(page) {
  document.querySelectorAll(".site-nav a").forEach((link) => {
    const isActive = link.href.includes(`page=${page}`);
    link.classList.toggle("is-active", isActive);
  });
}

function reveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((item) => observer.observe(item));
}

function home() {
  return `
    <section class="hero">
      <div class="sky" aria-hidden="true">
        <div class="cloud one" data-parallax="0.06"></div>
        <div class="cloud two" data-parallax="0.1"></div>
        <div class="cloud three" data-parallax="0.16"></div>
        <div class="mist" data-parallax="0.04"></div>
        <div class="mountain back" data-parallax="0.02"></div>
        <div class="mountain" data-parallax="-0.02"></div>
        <div class="tree-line" data-parallax="-0.06"></div>
      </div>
      <div class="hero-copy">
        <p class="eyebrow">Writing software in morning light</p>
        <h1>Cabin grows only when your story asks it to.</h1>
        <p class="lead">Start with a single quiet page. Add chapters, research, character memory, timelines and exports when they become useful, not before.</p>
        <div class="button-row">
          <a class="button" href="?page=philosophy" data-link>Read the philosophy</a>
          <a class="button secondary" href="?page=roadmap" data-link>Follow the roadmap</a>
        </div>
      </div>
      <div class="hero-panel" aria-label="Cabin principles">
        <div><span>01</span><h3>Local-first</h3><p>Your work stays in folders you own.</p></div>
        <div><span>02</span><h3>Progressive</h3><p>Complexity appears by invitation.</p></div>
        <div><span>03</span><h3>Human</h3><p>AI edits from the doorway. It does not write the book.</p></div>
      </div>
    </section>
    <section class="section slim reveal">
      <p class="eyebrow">The shape of the product</p>
      <h2>A tool that slowly disappears into the work.</h2>
      <p class="lead">Cabin is not a dashboard for feeling productive. It is a calm room for writing, planning and returning to a project without the software demanding attention.</p>
    </section>
    <section class="writing-strip">
      <div class="section manuscript">
        <div class="reveal">
          <p class="eyebrow">Focus</p>
          <h2>The manuscript stays central.</h2>
          <p>Worldbuilding, references and metadata can surround the page, but they do not replace it. Cabin treats structure as furniture around the writing.</p>
        </div>
        <div class="paper reveal">
          <p>The room is quiet enough to hear the sentence arrive.</p>
          <div class="line"></div>
          <p>Outside, fog moves slowly across the mountain. Inside, the project can be as simple as one note or as deep as an invented world.</p>
          <div class="line"></div>
          <p>Nothing flashes for attention. Nothing asks to become a system before it has earned the right.</p>
        </div>
      </div>
    </section>
    <section class="section">
      <p class="eyebrow">Cabin principles</p>
      <h2>Calm does not mean small.</h2>
      <div class="feature-grid">
        ${philosophies.slice(0, 6).map(card).join("")}
      </div>
    </section>
  `;
}

function philosophy() {
  return `
    <section class="section slim">
      <p class="eyebrow">Philosophy</p>
      <h1>The beliefs Cabin is being built around.</h1>
      <p class="lead">The full internal notes have been compressed here into public-facing principles: own your files, protect the writer's voice, and let complexity unfold at the writer's pace.</p>
    </section>
    <section class="section">
      <div class="philosophy-grid">
        ${philosophies.map(card).join("")}
      </div>
    </section>
  `;
}

function card(item) {
  return `<article class="principle reveal"><h3>${item.title}</h3><p>${item.body}</p></article>`;
}

function roadmapPage() {
  return `
    <section class="section slim">
      <p class="eyebrow">Roadmap</p>
      <h1>From idea to closed alpha.</h1>
      <p class="lead">The internal developer roadmap is deliberately broad. This version follows the human story: define Cabin, understand writers, build the feeling, then earn the right to add power.</p>
    </section>
    <section class="section">
      <div class="roadmap">
        ${roadmap.map((item) => `
          <article class="milestone ${item.status === "completed" ? "done" : ""} reveal">
            <div class="milestone-card">
              <span class="status">${item.status === "completed" ? "completed" : item.status}</span>
              <h3>${item.phase}: ${item.title}</h3>
              <p>${item.body}</p>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

async function blogPage(selectedSlug) {
  app.innerHTML = `
    <section class="section slim">
      <p class="eyebrow">Blog</p>
      <h1>Development notes from the cabin.</h1>
      <p class="lead">Markdown files placed in the <code>blog</code> folder appear here automatically on GitHub Pages. Opened posts use query URLs such as <code>?post=welcome-to-cabin</code>.</p>
    </section>
    <section class="section">
      <div class="blog-layout">
        <div class="article-list" data-article-list><article class="quiet-card"><p>Gathering posts...</p></article></div>
        <article class="reader" data-reader><p>Select a post to read.</p></article>
      </div>
    </section>
  `;

  const posts = await loadPosts();
  const list = document.querySelector("[data-article-list]");
  const reader = document.querySelector("[data-reader]");
  if (!posts.length) {
    list.innerHTML = `<article class="quiet-card"><p>No posts found yet.</p></article>`;
    return;
  }

  list.innerHTML = posts.map((post) => `
    <a class="article-card" href="?post=${post.slug}" data-link>
      <h3>${post.title}</h3>
      <time datetime="${post.date}">${formatDate(post.date)}</time>
      <p>${post.excerpt || "A Cabin development note."}</p>
    </a>
  `).join("");

  const active = posts.find((post) => post.slug === selectedSlug) || posts[0];
  renderPost(active, reader);
}

async function loadPosts() {
  const files = await discoverBlogFiles();
  const posts = await Promise.all(files.map(async (file) => {
    const response = await fetch(file.path);
    const markdown = await response.text();
    return parsePost(markdown, file.slug, file.path);
  }));
  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

async function discoverBlogFiles() {
  try {
    const response = await fetch(repoApi);
    if (!response.ok) throw new Error("GitHub API unavailable");
    const entries = await response.json();
    return entries
      .filter((entry) => entry.name.endsWith(".md"))
      .map((entry) => ({
        path: `blog/${entry.name}`,
        slug: entry.name.replace(/\.md$/, "")
      }));
  } catch {
    const response = await fetch("blog/index.json");
    const fallback = await response.json();
    return fallback.posts.map((name) => ({
      path: `blog/${name}`,
      slug: name.replace(/\.md$/, "")
    }));
  }
}

function parsePost(markdown, slug, path) {
  const frontmatter = markdown.match(/^---\n([\s\S]*?)\n---\n?/);
  const meta = {};
  let body = markdown;
  if (frontmatter) {
    body = markdown.slice(frontmatter[0].length);
    frontmatter[1].split("\n").forEach((line) => {
      const index = line.indexOf(":");
      if (index > -1) {
        meta[line.slice(0, index).trim()] = line.slice(index + 1).trim().replace(/^["']|["']$/g, "");
      }
    });
  }
  return {
    slug,
    path,
    title: meta.title || titleFromSlug(slug),
    date: meta.date || "2026-07-10",
    excerpt: meta.excerpt || "",
    body
  };
}

function renderPost(post, reader) {
  const renderer = new marked.Renderer();
  marked.setOptions({
    renderer,
    gfm: true,
    breaks: false,
    highlight(code, language) {
      if (language && hljs.getLanguage(language)) {
        return hljs.highlight(code, { language }).value;
      }
      return hljs.highlightAuto(code).value;
    }
  });
  const html = DOMPurify.sanitize(marked.parse(post.body));
  reader.innerHTML = `
    <span class="article-meta">${formatDate(post.date)}</span>
    <h2>${post.title}</h2>
    <div class="article-body">${html}</div>
  `;
  reader.querySelectorAll("pre code").forEach((block) => hljs.highlightElement(block));
}

function notFound() {
  return `
    <section class="not-found">
      <div class="not-found-scene">
        <p class="eyebrow">A quiet wrong turn</p>
        <h1>404</h1>
        <p class="lead">This path disappears into fog. The manuscript is safe; the page simply is not here.</p>
        <div class="button-row">
          <a class="button" href="?page=home" data-link>Return home</a>
          <a class="button secondary" href="?page=roadmap" data-link>See what is being built</a>
        </div>
        <div class="cabin-window" aria-hidden="true"></div>
      </div>
    </section>
  `;
}

function titleFromSlug(slug) {
  return slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(new Date(date));
}

async function render() {
  const route = routeFromUrl();
  setActive(route.page);
  document.title = route.page === "home" ? "Cabin - Writing software that grows with you" : `${titleFromSlug(route.page)} - Cabin`;
  if (route.page === "home") app.innerHTML = home();
  else if (route.page === "philosophy") app.innerHTML = philosophy();
  else if (route.page === "roadmap") app.innerHTML = roadmapPage();
  else if (route.page === "blog") await blogPage(route.post);
  else app.innerHTML = notFound();
  app.focus({ preventScroll: true });
  reveal();
  window.scrollTo({ top: 0, behavior: "instant" });
}

render();
