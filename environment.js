// Apply a visitor's chosen environment before the first frame. New visits start in Morning.
try {
  if (sessionStorage.getItem("cabin-environment") === "aurora") {
    document.documentElement.dataset.environment = "aurora";
  }
} catch {
  // Morning remains usable when storage is unavailable.
}
