# Adding and updating Cabin blogs

The sources you edit are Markdown files in `blog/` and the post entries in `blog/index.json`. Cards, reading times, article HTML, and clean URLs are generated from those sources. You do not need to edit the generated HTML.

## Add a new post

1. Create `blog/my-new-post.md` and write the article in Markdown. Start with the article text; the title comes from the index. Headings, lists, links, images, and fenced code blocks are supported.
2. Add an entry to the `posts` array in `blog/index.json`:

   ```json
   {
     "title": "My New Post",
     "date": "2026-10-20",
     "excerpt": "A short description for the card and article header.",
     "path": "my-new-post.md",
     "slug": "my-new-post"
   }
   ```

   Use your intended publication date in `YYYY-MM-DD` format. The path is relative to `blog/`. Use a unique lowercase, hyphen-separated slug. This example produces `/blog/my-new-post`. Posts are listed newest first, and reading times are calculated automatically.

3. From the website folder, run:

   ```powershell
   .\scripts\build-site.cmd
   ```

   This command works in this workspace using the available Python and Node runtimes. It requires no package installation. On other Windows machines, it uses Python and Node on PATH; `PYTHON_BINARY` and `NODE_BINARY` can specify executables explicitly.

4. Publish with the site's usual Git push/deployment. Include the generated HTML files together with your Markdown and index change.

## Update an existing post

Edit its `blog/*.md` file. Change its title, date, or excerpt in `blog/index.json` if needed. Run the same build command and publish the generated changes. There is no need to change its slug or recreate the page.

## Preview before publishing

```powershell
.\scripts\build-site.cmd --preview
```

Open [the local blog](http://127.0.0.1:8766/blog), then stop the preview with Ctrl+C. The command builds first, so the preview includes your latest edits. The same `.cmd` commands work in PowerShell or Command Prompt.

## Why there are generated HTML copies

The static host serves the complete cards and articles immediately, including when JavaScript is slow or unavailable. These are build outputs, not separate manually maintained text. The build refreshes `blog.html`, `blog/index.html`, each `blog/<slug>/index.html`, and `js/routes.js` from your sources. Rebuild after each addition or edit so the published output stays current.

For macOS/Linux, the equivalent command is `python3 scripts/build_routes.py` with Node.js on PATH. See [ROUTING.md](ROUTING.md) for routing details.
