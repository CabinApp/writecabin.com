# Cabin

The source for [writecabin.com](https://writecabin.com/), a vanilla HTML, CSS, and JavaScript site for the Cabin desktop writing app.

```sh
npm ci
npm run build
npm run dev
npm test
```

The build generates static HTML for every public route and writes a fresh copy to `dist/`. The checked-in route files let GitHub Pages serve direct visits without a rewrite rule. The browser router loads those same documents for internal links and handles history, focus, and scroll. Unknown paths use the branded 404 page. Playwright is used only for development verification against local Chromium.

Edit homepage content in `content/home.html`, journal entries in `content/posts/`, and the shared layout and editorial routes in `scripts/build.mjs`. Run the build and commit the affected generated pages after changing any of those sources.

The Morning and Aurora landscapes were created for this site. The product images are compressed captures of the actual Cabin editor showing the sample manuscript *The Salt House*. The live workspace is a labelled demonstration. Its final state previews planned tools.

See [design decisions and verification](docs/redesign.md).
