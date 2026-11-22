const root = document.documentElement;
const main = document.querySelector("#main");
const menu = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");
const environment = document.querySelector(".environment-switch");
const mobileNav = matchMedia("(max-width: 63.99rem)");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const stickyDemo = matchMedia(
  "(min-width: 64rem) and (min-height: 47rem) and (prefers-reduced-motion: no-preference)",
);
const header = document.querySelector(".site-header");
const canonicalPath = (path) =>
  path.endsWith("/") || path.endsWith(".html") ? path : path + "/";
const snapshots = new Map();
let activePage = null;
let activeFetch;
let pageKey = history.state?.cabinKey || crypto.randomUUID();
let lastScroll = scrollY;

root.classList.add("js");
history.scrollRestoration = "manual";
history.replaceState({ ...history.state, cabinKey: pageKey }, "");

function closeMenu(returnFocus = false) {
  nav.classList.remove("open");
  menu.setAttribute("aria-expanded", "false");
  if (returnFocus) menu.focus();
}

function syncMenu() {
  menu.hidden = !mobileNav.matches;
  closeMenu();
}

menu.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") !== "true";
  nav.classList.toggle("open", open);
  menu.setAttribute("aria-expanded", String(open));
});
mobileNav.addEventListener("change", syncMenu);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && nav.classList.contains("open")) closeMenu(true);
});
document.addEventListener("pointerdown", (event) => {
  if (!header.contains(event.target)) closeMenu();
});
syncMenu();

function updateEnvironmentControl() {
  const night = root.dataset.environment === "aurora";
  environment.textContent = night ? "Aurora" : "Morning";
  environment.setAttribute(
    "aria-label",
    night ? "Switch to Morning" : "Switch to Aurora",
  );
  document.querySelector('meta[name="theme-color"]').content = night
    ? "#1a252b"
    : "#f1f4f0";
}

function setEnvironment(value) {
  root.dataset.environment = value;
  try {
    sessionStorage.setItem("cabin-environment", value);
  } catch {
    /* The current page still changes. */
  }
  updateEnvironmentControl();
  activePage?.setHorizon(value);
}

environment.hidden = false;
environment.addEventListener("click", () =>
  setEnvironment(root.dataset.environment === "morning" ? "aurora" : "morning"),
);
updateEnvironmentControl();

const chapters = [
  [
    "The house at low tide",
    [
      "By the time Mara reached the house, the sea had given back the path.",
      "She stood at the gate with her father’s key in her palm. Beyond it, the windows held the last of the afternoon light, and somewhere inside, a clock was still keeping time.",
      "Nothing had changed. That was the strange part. The blue door, the crooked letterbox, the rosemary growing through the step. All of it had carried on without her.",
    ],
  ],
  [
    "What the sea keeps",
    [
      "In the morning, there was a small grey stone on the kitchen table.",
      "Mara turned it over in her hand. A white seam divided it neatly in two. There had been hundreds just like it on the beach when she was a child, but she had never seen one this far inside the house.",
      "She slipped it into her coat pocket and listened for the tide.",
    ],
  ],
  [
    "A letter, unopened",
    [
      "She recognised the handwriting before she read her name.",
      "Mara sat down slowly. For years, she had prepared for all the things her father might never say. It had never occurred to her that he might have written them down.",
      "She left the envelope where it was and put the kettle on.",
    ],
  ],
];

function mountHome() {
  const hero = main.querySelector(".hero");
  if (!hero) return null;
  const journey = main.querySelector(".journey");
  const dock = main.querySelector(".demo-dock");
  const stageButtons = [...main.querySelectorAll("[data-step]")];
  const beats = main.querySelector(".scroll-beats");
  const bench = main.querySelector(".workbench");
  const tree = main.querySelector(".manuscript-tree");
  const notes = main.querySelector(".notes-pane");
  const caption = main.querySelector(".demo-caption");
  const chapterButtons = [...bench.querySelectorAll("[data-chapter]")];
  const chapterTitle = bench.querySelector(".excerpt h3");
  const paragraphs = [...bench.querySelectorAll(".excerpt p")];
  const focusMode = bench.querySelector(".focus-mode");
  const focusShot = main.querySelector("[data-focus-shot]");
  const focusFigure = main.querySelector(".focus-figure");
  const writingImage = focusFigure.querySelector("img");
  const deepImage = focusFigure.querySelector(".focus-shot");
  const horizon = main.querySelector(".horizon");
  const dayShot = horizon.querySelector(".day-shot");
  const nightShot = horizon.querySelector(".night-shot");
  const sceneLabel = hero.querySelector(".scene-label");
  const sceneButtons = [...horizon.querySelectorAll("[data-environment]")];
  const breaks = [0, 0.24, 0.5, 0.76];
  const captions = [
    "An uncluttered page, with the manuscript at the centre.",
    "Collect pages and scenes in a manuscript tree. Open any chapter to read it.",
    "Dock General Notes alongside the manuscript. Pull in other components through the library.",
    "Concept preview: dedicated characters, places and timelines are planned.",
  ];
  let stage = 0;
  let focused = false;
  let landscapeOverride = Boolean(history.state?.environmentOverride);
  let manualUntil = 0;
  let lastNight;

  stageButtons[0].parentElement.hidden = false;
  sceneButtons[0].parentElement.hidden = false;
  focusMode.hidden = false;
  focusShot.hidden = false;

  function showStage(next) {
    stage = next;
    bench.dataset.stage = String(stage);
    bench.classList.toggle("focused", focused);
    tree.inert = focused || stage < 1;
    notes.inert = focused || stage < 2;
    stageButtons.forEach((button, index) =>
      button.setAttribute("aria-pressed", String(index === stage)),
    );
    const description = focused
      ? "Deep Writing brings the manuscript back to the centre."
      : captions[stage];
    if (caption.textContent !== description) caption.textContent = description;
    focusMode.setAttribute("aria-pressed", String(focused));
    focusMode.textContent = focused ? "Restore workspace" : "Deep Writing";
  }

  function scope() {
    const start =
      scrollY + journey.getBoundingClientRect().top - header.offsetHeight;
    const distance = journey.offsetHeight - dock.offsetHeight;
    return { start, distance };
  }

  stageButtons.forEach((button, index) =>
    button.addEventListener("click", () => {
      focused = false;
      showStage(index);
      if (stickyDemo.matches) {
        const { start, distance } = scope();
        manualUntil = performance.now() + 850;
        scrollTo({
          top: start + distance * (breaks[index] + 0.03),
          behavior: "smooth",
        });
      }
    }),
  );
  chapterButtons.forEach((button, index) =>
    button.addEventListener("click", () => {
      const [title, text] = chapters[index];
      chapterTitle.textContent = title;
      paragraphs.forEach((paragraph, i) => {
        paragraph.textContent = text[i];
      });
      chapterButtons.forEach((entry) =>
        entry.setAttribute("aria-pressed", String(entry === button)),
      );
    }),
  );
  focusMode.addEventListener("click", () => {
    focused = !focused;
    showStage(stage);
  });
  focusShot.addEventListener("click", () => {
    const isFocused = focusFigure.classList.toggle("is-focused");
    focusShot.setAttribute("aria-pressed", String(isFocused));
    focusShot.textContent = isFocused
      ? "Restore chapter navigation"
      : "Show Deep Writing";
    writingImage.alt = isFocused
      ? ""
      : "Cabin’s manuscript editor with chapter navigation beside The Salt House.";
    deepImage.alt = isFocused
      ? "The Salt House centred in the Cabin editor, with surrounding panels hidden."
      : "";
    focusFigure.querySelector("figcaption").textContent = isFocused
      ? "Deep Writing centres the manuscript and clears the surrounding controls."
      : "Cabin in Dawn, with a sample manuscript.";
  });

  function paintHorizon(night) {
    if (night === lastNight) return;
    lastNight = night;
    horizon.classList.toggle("is-night", night);
    sceneButtons.forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String((button.dataset.environment === "aurora") === night),
      ),
    );
    dayShot.alt = night
      ? ""
      : "Cabin’s Dawn editor with formatting controls over the selected opening sentence.";
    nightShot.alt = night
      ? "The Salt House in Cabin’s dark Aurora editor."
      : "";
  }

  sceneButtons.forEach((button) =>
    button.addEventListener("click", () =>
      setEnvironment(button.dataset.environment),
    ),
  );
  function setHorizon(value) {
    landscapeOverride = true;
    history.replaceState({ ...history.state, environmentOverride: true }, "");
    sceneLabel.textContent =
      value === "aurora" ? "Aurora in Cabin" : "Morning in Cabin";
    paintHorizon(value === "aurora");
  }
  if (root.dataset.environment === "aurora") setHorizon("aurora");

  function draw() {
    if (
      stickyDemo.matches &&
      performance.now() > manualUntil &&
      !focused &&
      !tree.contains(document.activeElement)
    ) {
      const { start, distance } = scope();
      const progress = (scrollY - start) / Math.max(1, distance);
      const next = Math.max(
        0,
        breaks.findLastIndex((point) => progress >= point),
      );
      if (next !== stage) showStage(next);
    }
    if (!reducedMotion.matches) {
      const offset = hero.getBoundingClientRect().top - header.offsetHeight;
      if (offset > -innerHeight)
        hero.style.setProperty(
          "--drift",
          `${Math.max(0, Math.min(42, -0.09 * offset))}px`,
        );
    } else {
      hero.style.removeProperty("--drift");
    }
    if (!landscapeOverride) {
      const top = horizon.getBoundingClientRect().top;
      paintHorizon(!reducedMotion.matches && top < innerHeight * 0.28);
    }
  }

  function resize() {
    journey.classList.toggle("scroll-active", stickyDemo.matches);
    beats.hidden = !stickyDemo.matches;
    draw();
  }
  resize();
  return { draw, resize, setHorizon };
}

function syncRoute() {
  const current = document.body.dataset.route;
  document.querySelectorAll(".site-nav a").forEach((link) => {
    const key = link.pathname;
    if (
      !link.hash &&
      (key === current || (key === "/blog/" && current.startsWith(key)))
    ) {
      link.setAttribute("aria-current", key === current ? "page" : "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
  activePage = mountHome();
  updateEnvironmentControl();
}

function placePage(url, restored, focus) {
  let target = null;
  if (url.hash) {
    try {
      target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    } catch {
      /* Ignore an invalid fragment. */
    }
  }
  if (restored != null) scrollTo(0, restored);
  else if (target) target.scrollIntoView();
  else scrollTo(0, 0);
  if (focus) {
    if (target && !target.hasAttribute("tabindex"))
      target.setAttribute("tabindex", "-1");
    (target || main).focus({ preventScroll: true });
  }
  activePage?.draw();
}

async function navigate(url, { push = false, restored, focus = true } = {}) {
  activeFetch?.abort();
  const controller = new AbortController();
  activeFetch = controller;
  const route = canonicalPath(url.pathname);
  const same = route === document.body.dataset.route;
  try {
    if (!same) {
      const response = await fetch(route, { signal: controller.signal });
      if (!response.ok) throw new Error("Route unavailable");
      const doc = new DOMParser().parseFromString(
        await response.text(),
        "text/html",
      );
      const nextMain = doc.querySelector("main");
      if (!nextMain || doc.body.dataset.route !== route)
        throw new Error("Route response did not match");
      if (controller.signal.aborted) return;
      document.title = doc.title;
      for (const selector of [
        'link[rel="canonical"]',
        'meta[name="description"]',
        'meta[name="robots"]',
        'meta[property^="og:"]',
      ]) {
        document.head
          .querySelectorAll(selector)
          .forEach((node) => node.remove());
        doc.head
          .querySelectorAll(selector)
          .forEach((node) => document.head.append(node.cloneNode(true)));
      }
      main.replaceChildren(...nextMain.childNodes);
      document.body.dataset.route = route;
      main.classList.remove("route-in");
      requestAnimationFrame(() => main.classList.add("route-in"));
    }
    if (push) {
      snapshots.set(pageKey, lastScroll);
      pageKey = crypto.randomUUID();
      history.pushState(
        { cabinKey: pageKey },
        "",
        route + url.search + url.hash,
      );
    }
    closeMenu();
    if (!same) syncRoute();
    placePage(url, restored, focus);
  } catch (error) {
    if (error.name !== "AbortError") location.assign(url.href);
  }
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (
    !link ||
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    link.target ||
    link.download
  )
    return;
  const url = new URL(link.href);
  if (
    url.origin !== location.origin ||
    /\.(?!html$)[a-z\d]+$/i.test(url.pathname) ||
    url.pathname === "/bouncy-buttons.html"
  )
    return;
  if (link.classList.contains("skip")) return;
  if (
    canonicalPath(url.pathname) === document.body.dataset.route &&
    url.hash === location.hash
  ) {
    if (!url.hash) {
      event.preventDefault();
      closeMenu();
      scrollTo(0, 0);
    }
    return;
  }
  event.preventDefault();
  navigate(url, { push: true });
});

window.addEventListener("popstate", (event) => {
  snapshots.set(pageKey, lastScroll);
  pageKey = event.state?.cabinKey || crypto.randomUUID();
  navigate(new URL(location.href), {
    restored: snapshots.get(pageKey),
    focus: false,
  });
});

let frame = 0;
window.addEventListener(
  "scroll",
  () => {
    lastScroll = scrollY;
    if (!frame)
      frame = requestAnimationFrame(() => {
        frame = 0;
        activePage?.draw();
      });
  },
  { passive: true },
);
window.addEventListener("resize", () => activePage?.resize(), {
  passive: true,
});
reducedMotion.addEventListener("change", () => activePage?.resize());
syncRoute();
