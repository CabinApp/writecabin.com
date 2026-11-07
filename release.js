// Set status to 'available' only with verified, public release information.
// Each download: { platform, url, installation }. URLs must use HTTPS.
export const release = Object.freeze({
  status: "coming-soon",
  version: null,
  downloads: [],
  notesUrl: null,
});
