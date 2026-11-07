try {
  const saved = localStorage.getItem("cabin-theme");
  document.documentElement.dataset.theme =
    saved === "dawn" || saved === "aurora"
      ? saved
      : matchMedia("(prefers-color-scheme: dark)").matches
        ? "aurora"
        : "dawn";
} catch {
  /* Dawn remains available when browser storage is restricted. */
}
