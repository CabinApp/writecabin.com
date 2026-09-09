# Clean routes on the static host

Run `python scripts/build_routes.py` after changing page HTML or adding a post to `blog/index.json`. Commit the generated directories and `js/routes.js` with the sources. No server rewrite configuration is required: each known clean route has a static index document. GitHub Pages serves the root `404.html` with a 404 response for unknown paths.

`js/router.js` intercepts ordinary internal navigation, loads page content without reloading the document, manages titles/styles, and restores history scroll positions. Page scopes dispose animation, observers, event handlers, and WebGL resources. Roadmap deliberately uses native document navigation to preserve its existing world and Lenis lifecycle.

Legacy `.html` URLs and `/blog?post=slug` links normalize to clean paths. Articles use `/blog/slug`. Modified clicks and external links retain native behavior. The light 404 has no navigation bar and offers home/back actions.

Preview with `python scripts/serve.py --port 8766`; this serves the same custom 404 for invalid direct requests.

Browser regression checks: start the preview on port 8766, then run `node scripts/check-browser.cjs` with Playwright available. Optional `PLAYWRIGHT_MODULE` and `CHROMIUM_PATH` variables select an existing installation. Checks cover article clicks, scroll restoration, repeated scene disposal, Roadmap navigation, reduced motion, model-load failure, and direct 404 status.
