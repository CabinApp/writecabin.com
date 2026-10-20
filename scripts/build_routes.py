"""Generate clean routes and ready-to-read blog HTML for the static host."""
from pathlib import Path
from datetime import date
import argparse
import html
import json
import math
import os
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--node', default=os.environ.get('NODE_BINARY', 'node'),
                    help='Node.js executable used by the bundled Markdown renderer')
args = parser.parse_args()
manifest = json.loads((ROOT / 'blog/index.json').read_text(encoding='utf-8'))
posts = []
markdowns = []
slugs = set()
for source in manifest['posts']:
    post = dict(source)
    post['slug'] = post.get('slug') or Path(post['path']).stem
    if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', post['slug']):
        raise ValueError('Blog slugs must be lower-case, hyphen-separated words')
    if post['slug'] in slugs:
        raise ValueError('Duplicate blog slug: ' + post['slug'])
    slugs.add(post['slug'])
    markdown = (ROOT / 'blog' / post['path']).read_text(encoding='utf-8')
    markdown = re.sub(r'^---\r?\n[\s\S]*?\r?\n---\r?\n?', '', markdown)
    plain = re.sub(r'```[\s\S]*?```|<[^>]+>|[#>*_`\[\]()!-]', ' ', markdown)
    post['readingTime'] = max(1, math.ceil(len(plain.split()) / 225))
    posts.append(post)
    markdowns.append(markdown)

result = subprocess.run([args.node, str(ROOT / 'scripts/render-markdown.cjs')],
                        input=json.dumps(markdowns), capture_output=True, text=True,
                        encoding='utf-8', check=True)
rendered = json.loads(result.stdout)
e = html.escape

def display_date(value):
    parsed = date.fromisoformat(value)
    return f'{parsed:%B} {parsed.day}, {parsed.year}'

cards = ['<svg class="blog-thread" aria-hidden="true"><path pathLength="1"></path></svg>']
for index, post in enumerate(sorted(posts, key=lambda item: item['date'], reverse=True)):
    tilt = [-1.8, 1.3, -0.7, 1.9][index % 4]
    cards.append(f'''<a class="blog-card" href="/blog/{post['slug']}" style="--note-tilt:{tilt}deg">
      <i class="blog-pin" aria-hidden="true"></i>
      <span class="blog-card-meta"><time datetime="{e(post['date'])}">{display_date(post['date'])}</time><span>{post['readingTime']} min read</span></span>
      <span class="blog-card-copy"><h2>{e(post['title'])}</h2><p>{e(post.get('excerpt', ''))}</p></span>
      <span class="arrow" aria-hidden="true">Read blog <i>&rarr;</i></span>
    </a>''')
blog = (ROOT / 'blog.html').read_text(encoding='utf-8')
blog = re.sub(r'(?<=<!-- blog-list:start -->)[\s\S]*?(?=<!-- blog-list:end -->)',
              lambda _: '\n' + '\n'.join(cards) + '\n                        ', blog)
metadata = json.dumps({'posts': posts}, ensure_ascii=False).replace('<', '\\u003c')
blog = re.sub(r'(<script type="application/json" data-blog-posts>)[\s\S]*?(</script>)',
              lambda match: match[1] + metadata + match[2], blog)
(ROOT / 'blog.html').write_text(blog, encoding='utf-8')

pages = {'/': 'index.html', '/about': 'about.html', '/philosophy': 'philosophy.html',
         '/blog': 'blog.html', '/roadmap': 'roadmap.html'}
routes = {path: {'page': 'home' if path == '/' else path[1:], 'source': '/' + file}
          for path, file in pages.items()}
for path, file in pages.items():
    if path == '/':
        continue
    target = ROOT / path.lstrip('/') / 'index.html'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text((ROOT / file).read_text(encoding='utf-8'), encoding='utf-8')

for post, content in zip(posts, rendered):
    slug = post['slug']
    path = '/blog/' + slug
    source = path + '/index.html'
    routes[path] = {'page': 'blog', 'source': source}
    text = blog.replace('class="ready"', 'class="ready article-view"', 1)
    title = e(post['title'])
    excerpt = e(post.get('excerpt', ''))
    text = re.sub(r'<title>.*?</title>', lambda _: '<title>' + title + ' — Cabin Blog</title>', text)
    replacements = {
        r'<link rel="canonical"[^>]+>': f'<link rel="canonical" href="https://writecabin.com{path}">',
        r'<meta name="description"[^>]+>': f'<meta name="description" content="{excerpt}">',
        r'<meta property="og:title"[^>]+>': f'<meta property="og:title" content="{title} — Cabin Blog">',
        r'<meta property="og:description"[^>]+>': f'<meta property="og:description" content="{excerpt}">',
        r'<meta property="og:url"[^>]+>': f'<meta property="og:url" content="https://writecabin.com{path}">',
    }
    for pattern, replacement in replacements.items():
        text = re.sub(pattern, lambda _, value=replacement: value, text)
    # Articles have no room banner; avoid downloading the index's image.
    text = re.sub(r'\s*<link rel="preload" as="image"[^>]+>', '', text)
    article = f'''<main id="main"><article class="article-shell is-ready" data-article-mount>
      <nav class="article-navigation" aria-label="Blog navigation">
        <a class="article-back-link" href="/blog"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i><span>Back to All Blogs</span></a>
      </nav>
      <header>
        <time class="article-date" datetime="{e(post['date'])}">{display_date(post['date'])}</time>
        <h1>{title}</h1><p>{excerpt}</p>
        <div class="article-meta-row"><span class="article-read-time">{post['readingTime']} min read</span>
          <div class="article-toolbar"><button class="article-share-button" type="button" data-copy-post-link aria-live="polite" aria-label="Copy article link" hidden><i class="fa-solid fa-link" aria-hidden="true"></i><i class="fa-solid fa-check copied-icon" aria-hidden="true"></i><span class="sr-only">Copy link</span></button></div>
        </div>
      </header>
      <div class="article-progress" data-article-progress aria-hidden="true"><span></span></div>
      <div class="article-content">{content}</div>
    </article></main>'''
    text = re.sub(r'<main[\s\S]*?</main>', lambda _: article, text)
    if '<pre>' in content:
        text = text.replace('<script src="/script.js">', '<script src="/js/vendor/highlight.min.js"></script>\n            <script src="/script.js">')
    target = ROOT / source.lstrip('/')
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(text, encoding='utf-8')

(ROOT / 'js/routes.js').write_text(
    '// Generated by scripts/build_routes.py; edit page templates and blog/index.json.\n'
    + 'export const routeMap = ' + json.dumps(routes, indent=2) + ';\n', encoding='utf-8')
(ROOT / '.nojekyll').touch()
print('Generated', len(routes), 'clean routes with', len(posts), 'rendered articles.')
