---
system: "Cabin Morning"
version: 1
north_star: "A quiet Scandinavian writing room where the interface gathers around the page, then disappears."
personality: "Quiet · Deliberate · Literary"
---

# DESIGN.md

## 1. Overview

The Cabin website must make people feel Cabin before they understand it. It is an atmospheric editorial website for a writing environment in product design, not a conversion-heavy startup landing page.

The experience should feel like walking through mist toward a calm writing room: full-screen compositions, soft natural light, tactile surfaces, slow reveals, carefully controlled depth, and a sense that structure arrives only after the page is respected.

The story arc:

1. Atmosphere first: stillness, fog, morning light, writing room.
2. Writer frustration: too much software complexity, rigid workflows, tools that interrupt.
3. Cabin's answer: progressive complexity, writing first, local ownership, calm before clever.
4. Deliberate progress: philosophy, roadmap, public writing, active design.
5. The promise: the software should disappear, leaving only the story.

## 2. Colors

Use the Morning palette as the site foundation.

- Canvas: `#F1F4F0`
- Surface: `#F8F9F6`
- Elevated Surface: `#FCFCFA`
- Navigation: `#E8EDE8`
- Header: `#F3F6F2`
- Outline: `#D8DED8`
- Divider: `#E3E8E3`
- Text Primary: `#202522`
- Text Secondary: `#68736D`
- Text Muted: `#929B95`
- Accent: `#718B7C`
- Accent Hover: `#60786A`
- Accent Active: `#506457`
- Selection: `#D8E5DC`

Atmospheric extensions may use transparent warm oak, pine, linen, and paper tones, but they must remain subordinate to the Morning palette.

- Oak: `#B9A37E`
- Pine: `#405D4B`
- Warm light: `rgba(212, 180, 119, 0.28)`

Use color as atmosphere and hierarchy, not decoration. Never rely on color alone for meaning.

## 3. Typography

Use Geist for interface, navigation, labels, buttons, dates, metadata, and compact UI copy. Use Lora for expressive, literary statements and long-form page headings.

Type should feel confident and readable, not oversized to the point of clipping. Long-form text should sit around 60-75 characters per line. Large headings should use `text-wrap: balance` where supported and retain enough line-height for descenders and accents.

Scale:

- Navigation and metadata: 0.78rem-0.95rem.
- Body: 1rem-1.15rem with 1.7-1.85 line-height.
- Editorial body lead: 1.2rem-1.45rem.
- Page headings: clamp from about 2.7rem to 5rem.
- Homepage atmospheric statements: large only when they have room, never clipped.

## 4. Elevation

Depth should feel tactile, like paper and furniture, not bubbly neumorphism. Use a few controlled shadows, inset hairlines, translucent surfaces, and tonal section changes.

Preferred treatments:

- Thin borders in Outline or Divider.
- Soft shadows under manuscript or furniture-like panels.
- Paper grain as a subtle overlay.
- Environmental light using radial gradients.
- Tactile surfaces with 6-10px radius or square editorial edges.
- Integrated panels that feel built into the room.

Avoid glassmorphism, glowing neon, giant gradients, rounded card grids, and ornamental clutter.

Motion:

- Use GSAP, ScrollTrigger, and Lenis via CDN where useful, with native fallback.
- Motion must respond to scroll: parallax atmosphere, sticky progressive assembly, staggered reveal, flow along roadmap, and final disappearance.
- Respect `prefers-reduced-motion`; the site must remain beautiful when motion is disabled.
- Use slow easing around 700-1100ms with gentle deceleration.

## 5. Components

Navigation:

- Fixed and quiet.
- Compact logo and wordmark on the left, core pages on the right.
- Never disappear at the bottom.
- Active, hover, and focus states must be clear and elegant.

Home:

- Full-screen atmospheric opening.
- No fake screenshots.
- Use honest conceptual writing-room and manuscript imagery created with CSS/canvas/HTML.
- Progressive complexity should assemble around a central manuscript as the user scrolls.
- Principles should be cinematic moments, not identical feature cards.

Blog:

- Show a clear list of posts.
- Clicking a post opens a full article page at `blog.html?post=slug`.
- Articles keep navigation, title, date, and content.
- Markdown rendering supports headings, lists, tables, quotes, links, inline code, and syntax-highlighted code blocks.
- Do not call it a devlog in public UI.

Philosophy:

- Summarize Cabin's philosophy with editorial structure and rhythm.
- Avoid huge clipped typography.
- Use designed manifesto surfaces, pull statements, and readable explanations.

Roadmap:

- Show that Cabin is actively moving toward a usable alpha.
- Use a smooth, continuous path with milestones placed beside it, not on top of disconnected line segments.
- Completed and active work should be clear by more than color.

404:

- Evocative and calm.
- Should feel like a wrong turn in the same atmosphere, not a generic error page.

## 6. Do's and Don'ts

Do:

- Lead with atmosphere before explanation.
- Make the site feel written for writers.
- Use generous whitespace without making the page feel empty.
- Let the manuscript remain central.
- Be honest about the product design phase.
- Use the Roadmap to show deliberate progress.
- Keep accessibility calm and invisible.

Don't:

- Build a generic SaaS landing page.
- Use stock cabin or forest photos.
- Invent product screenshots, social proof, metrics, or testimonials.
- Make AI feel like the main product.
- Use productivity dashboard language or aesthetics.
- Fill the site with identical rounded feature cards.
- Hide navigation at the bottom.
- Let large type clip, overflow, or crowd mobile layouts.
- Let motion become distracting or necessary for comprehension.
