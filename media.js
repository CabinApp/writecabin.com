// Add an entry only when a real, captioned product video exists.
// Key: 'dawn-writing', 'dawn-focus', etc.
// Value: { src, poster, captions: [{ src, language, label }] }.
export const videos = {};

export function renderVideo(figure, key) {
  const asset = videos[key];
  if (!asset?.src || !asset.poster || !asset.captions?.length) return;
  const image = figure.querySelector("img");
  const existing = figure.querySelector("video");
  existing?.remove();
  image.hidden = false;
  const video = document.createElement("video");
  video.controls = true;
  video.playsInline = true;
  video.preload = "none";
  video.poster = asset.poster;
  video.src = asset.src;
  video.setAttribute("aria-label", image.alt);
  for (const [index, caption] of asset.captions.entries()) {
    const track = document.createElement("track");
    track.kind = "captions";
    track.src = caption.src;
    track.srclang = caption.language;
    track.label = caption.label;
    track.default = index === 0;
    video.append(track);
  }
  video.addEventListener(
    "error",
    () => {
      video.remove();
      image.hidden = false;
    },
    { once: true },
  );
  image.hidden = true;
  figure.prepend(video);
}
