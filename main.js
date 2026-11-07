import { release } from "./release.js";
import { renderVideo } from "./media.js";
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const themeButton = $(".theme-toggle");
let screenshotMode = "writing";
function updateScreenshot() {
  const theme = document.documentElement.dataset.theme;
  const themeName = theme === "dawn" ? "Dawn" : "Aurora";
  const mode = {
    writing: "Writing",
    formatting: "Formatting",
    focus: "Deep Writing",
  }[screenshotMode];
  const shot = $("#writing-shot");
  shot.src = `/assets/product/${theme}-${screenshotMode}.png`;
  shot.alt = `Actual Cabin development app in ${themeName}: ${screenshotMode === "focus" ? "Deep Writing with the navigation hidden and the manuscript centred." : screenshotMode === "formatting" ? "rich-text editor with the Bold, Italic, Underline and More formatting toolbar visible." : "manuscript navigation beside the rich-text editor, with a sample titled Manuscript."}`;
  $("#shot-caption").textContent =
    `From the development app. ${mode} mode, ${themeName} theme.`;
  const figure = $("[data-product-media]");
  figure.querySelector("video")?.remove();
  shot.hidden = false;
  renderVideo(figure, `${theme}-${screenshotMode}`);
}
function updateTheme() {
  const theme = document.documentElement.dataset.theme;
  themeButton.setAttribute(
    "aria-label",
    `Switch to ${theme === "dawn" ? "Aurora" : "Dawn"} theme`,
  );
  $(".theme-name").textContent = theme === "dawn" ? "Dawn" : "Aurora";
  $$('img[src="/assets/logo.png"], img[src="/assets/dark-logo.png"]').forEach(
    (image) => {
      image.src =
        theme === "dawn" ? "/assets/logo.png" : "/assets/dark-logo.png";
    },
  );
  $('meta[name="theme-color"]').content =
    theme === "dawn" ? "#F1F4F0" : "#222A30";
  updateScreenshot();
}
themeButton.hidden = false;
themeButton.addEventListener("click", () => {
  document.documentElement.dataset.theme =
    document.documentElement.dataset.theme === "dawn" ? "aurora" : "dawn";
  try {
    localStorage.setItem("cabin-theme", document.documentElement.dataset.theme);
  } catch {
    /* The switch works without persistence. */
  }
  updateTheme();
});
updateTheme();
const menuButton = $(".menu-toggle");
const nav = $("#primary-nav");
const narrow = matchMedia("(max-width: 599px)");
function closeMenu() {
  nav.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
}
function syncMenu() {
  menuButton.hidden = !narrow.matches;
  closeMenu();
}
$(".site-header").classList.add("js-ready");
menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(open));
  nav.classList.toggle("is-open", open);
});
nav.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    menuButton.getAttribute("aria-expanded") === "true"
  ) {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".site-header")) closeMenu();
});
narrow.addEventListener("change", syncMenu);
syncMenu();
const focusButton = $(".focus-toggle");
focusButton.hidden = false;
focusButton.addEventListener("click", () => {
  const focused = focusButton.getAttribute("aria-pressed") !== "true";
  focusButton.setAttribute("aria-pressed", String(focused));
  $(".hero-workspace").classList.toggle("is-focused", focused);
  $(".paper-tools>span").textContent = focused ? "Deep Writing" : "Writing";
  $(".focus-toggle span").textContent = focused
    ? "Back to Writing"
    : "Deep Writing";
});
const descriptions = [
  "A manuscript, a quiet page, and room for the next sentence.",
  "Give your story chapters. Move between them without leaving your manuscript.",
  "Planned: keep questions and research alongside the passage that needs them.",
  "Planned: bring manuscript, notes and characters together in a workspace of your own.",
];
$(".growth-controls").hidden = false;
$$("[data-stage]").forEach((button) =>
  button.addEventListener("click", () => {
    const stage = Number(button.dataset.stage);
    $$("[data-stage]").forEach((item) =>
      item.setAttribute("aria-pressed", String(item === button)),
    );
    const preview = $(".growth-preview");
    preview.dataset.stageView = String(stage);
    $(".growth-tree").hidden = stage === 0;
    $(".growth-notes").hidden = stage < 2;
    $(".character-note").hidden = stage < 3;
    $(".stage-status").textContent =
      stage < 2 ? "Writing" : "Planned workspace concept";
    $(".stage-description").textContent = descriptions[stage];
    preview.classList.remove("changing");
    void preview.offsetWidth;
    preview.classList.add("changing");
  }),
);
const chapters = [
  [
    "The house at low tide",
    "By the time Mara reached the house, the sea had given back the path.",
  ],
  [
    "What the sea keeps",
    "In the morning, there was a small grey stone on the kitchen table. She was certain it hadn’t been there the night before.",
  ],
  [
    "A letter, unopened",
    "The envelope was addressed in a handwriting she recognised before she read her name.",
  ],
];
$$("[data-chapter]").forEach((button) =>
  button.addEventListener("click", () => {
    const [title, paragraph] = chapters[Number(button.dataset.chapter)];
    $("#demo-chapter").textContent = title;
    $("#demo-paragraph").textContent = paragraph;
    $$("[data-chapter]").forEach((item) => {
      item.classList.toggle("selected", item === button);
      item.setAttribute("aria-pressed", String(item === button));
    });
  }),
);
$$("[data-chapter]").forEach((button, index) =>
  button.setAttribute("aria-pressed", String(index === 0)),
);
$(".mode-controls").hidden = false;
$$("[data-mode]").forEach((button) =>
  button.addEventListener("click", () => {
    screenshotMode = button.dataset.mode;
    $$("[data-mode]").forEach((item) =>
      item.setAttribute("aria-pressed", String(item === button)),
    );
    updateScreenshot();
  }),
);
function httpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}
if (
  release.status === "available" &&
  release.version &&
  release.downloads.length > 0 &&
  release.downloads.every((item) => item.platform && httpsUrl(item.url))
) {
  const area = $("#release-area");
  area.replaceChildren();
  const version = document.createElement("p");
  version.className = "release-status";
  version.textContent = `Cabin ${release.version}`;
  const downloads = document.createElement("div");
  downloads.className = "release-downloads";
  release.downloads.forEach((item) => {
    const group = document.createElement("div");
    const link = document.createElement("a");
    link.href = httpsUrl(item.url);
    link.className = "button";
    link.textContent = `Download for ${item.platform}`;
    group.append(link);
    if (item.installation) {
      const note = document.createElement("p");
      note.className = "release-detail";
      note.textContent = item.installation;
      group.append(note);
    }
    downloads.append(group);
  });
  area.append(version, downloads);
  if (httpsUrl(release.notesUrl)) {
    const notes = document.createElement("a");
    notes.href = httpsUrl(release.notesUrl);
    notes.className = "release-notes";
    notes.textContent = "Release notes";
    area.append(notes);
  }
  $(".nav-availability").textContent = "Download";
  $(".hero-copy .button").textContent = "Download Cabin";
}
$("#year").textContent = String(new Date().getFullYear());
if (
  !matchMedia("(prefers-reduced-motion: reduce)").matches &&
  "IntersectionObserver" in window
) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries)
        if (entry.isIntersecting) {
          entry.target.animate(
            [
              { opacity: 0.65, transform: "translateY(12px)" },
              { opacity: 1, transform: "none" },
            ],
            { duration: 550, easing: "cubic-bezier(.22,.68,.25,1)" },
          );
          observer.unobserve(entry.target);
        }
    },
    { threshold: 0.12 },
  );
  $$(
    ".section-heading, .writing-intro, .writing-media, .workspace-statement, .workspace-details>div, .ownership-copy, .file-illustration, .closing h2",
  ).forEach((element) => observer.observe(element));
}
