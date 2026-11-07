# Cabin website

The product website for [writecabin.com](https://writecabin.com/). Plain HTML, CSS and JavaScript, with no runtime dependencies or external font service.

## Local development

Use Node.js 22 or later.

```sh
npm ci
npm run dev
```

Preview: http://127.0.0.1:4173. `PORT` overrides the port.

```sh
npm run build
npm run preview
npm test
```

The build validates local HTML references and release configuration and creates a clean `dist/`. Browser checks require an installed Chrome or Edge; set `CHROME_PATH` for another Chromium location. The test runner starts and stops its own production preview on port 4187. Set `CABIN_TEST_URL` to test an existing server instead. Browser screenshots and results are written to ignored `qa/final/`.

## Deployment

The root remains a complete static website for the existing GitHub Pages deployment. `CNAME` retains `writecabin.com`; `.nojekyll` is retained. No hosting provider migration or production branch change is required. A static host can also publish `dist/` after `npm run build`.

The redesign is on a separate Git branch. Pushing it does not change the production branch. Merge it into the branch configured in GitHub Pages when ready to publish. GitHub Pages manages custom-domain HTTPS and www redirects; those settings cannot be configured by a static HTML file. The canonical URL is always `https://writecabin.com/`.

Removed blog, roadmap and about routes intentionally return the branded 404. They are absent from navigation and the sitemap. GitHub Pages cannot issue arbitrary server-side 301 redirects; a move to a host with redirect rules would be needed if redirecting those URLs becomes a requirement.

## Release configuration

`release.js` is the only release configuration. Keep `status: 'coming-soon'` until public installers exist. To activate downloads, supply `status: 'available'`, a verified `version` and at least one `{ platform, url, installation }` entry in `downloads`. URLs must use HTTPS. `notesUrl` is optional. Do not fill these fields with speculative platforms, dates or placeholder links. The navigation, hero and final section update from this configuration. Until then, availability links scroll to an honest coming-soon message.

## Product imagery and future video

`assets/product/` contains authentic development screenshots. Theme and writing-mode controls choose among them. The hero and progressive-complexity demonstration are explicitly labelled reconstructions with original sample fiction, based on the actual app and product documentation. Planned tools are labelled at the controls, in the preview and in permanent text.

To introduce a real product video, add its configuration to `videos` in `media.js`, keyed by theme and mode, such as `dawn-writing`. Every video requires a source, poster and caption tracks. It receives native controls, optional playback, `preload="none"`, inline mobile support and a screenshot fallback on error. No player is displayed before a real asset is configured.

Fonts are self-hosted; their OFL notices are retained in `assets/fonts/`. Regenerate the 1200 × 630 social card with the preview running and `node scripts/create-social.mjs`.

See [design and product decisions](docs/redesign.md) and [verification](docs/verification.md).
