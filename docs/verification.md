# Redesign verification

Verified locally on 7 November 2026 in installed Chromium, against the production build. No production deployment was performed.

## Executed checks

- `npm run build`: PASS. Validates release configuration, checks HTML asset references and creates a clean static output.
- `npm test`: PASS, 15 check groups. Uses the actual browser against `dist/` and saves screenshots/results in ignored `qa/final/`.
- Desktop/tablet/mobile: PASS at 320, 390, 600, 768, 1024 and 1440px in both themes. Checked every stage, chapter control, screenshot mode and focus toggle. No page or internal demo overflow.
- Navigation: PASS. Menu selection and Escape close correctly; Escape returns focus. Hero actions, section links and both home links work.
- Keyboard: PASS. Tab, Enter and Space operate controls; visible focus and the skip link were verified.
- Contrast: PASS. Minimum tested text ratio 4.85:1 in Dawn and 5.11:1 in Aurora; button ratios 6.19:1 and 8.05:1; focus ratios 5.07:1 and 4.66:1. These are computed from the rendered theme token pairs, including selection and panel surfaces.
- Reduced motion: PASS. Animation is removed and smooth scrolling becomes automatic scrolling; workspace controls still work.
- No JavaScript: PASS. Marketing copy, native navigation, development status, availability and the static demonstration remain readable; inactive enhancement controls stay hidden.
- SEO/assets: PASS. Canonical URL, description, social card, structured data, sitemap, robots, single H1 and internal anchors checked. No homepage `noindex`.
- Console/network: PASS. No JavaScript errors, browser console errors or failed asset requests during the main page checks.
- Missing routes: PASS. Unknown URLs and retired `/blog/` return real 404 responses, with working home navigation.
- Deployment compatibility: PASS locally. Root source and `dist/` serve successfully; the existing `CNAME` and `.nojekyll` remain. Live Pages settings, DNS, www redirects and HTTPS were not changed or remotely verified.
- Source cleanup: PASS. Retired 3D assets, vendored Three.js, router, blog pipeline and secondary pages removed. Historical ignored local scene/QA files were cleaned too.

## Visual review

Inspected rendered desktop, tablet and phone screenshots, including both themes. The manuscript is the visual anchor; headline and product sit on the same margins. Sections change from a broad demo to split editorial layouts and a centred close. Mobile changes the header to a labelled menu and stacks supporting workspace panels. The two-line headline remains intact at the three inspector widths.

Before/after inspector measurements at 1440px:

| Measurement | Previous site | Redesign |
| --- | --- | --- |
| Hero heading | 3 lines | 2 lines |
| Page length | 13.1 screens | 5.7 screens |
| Inspector failures | 16 | 0 with two documented brief-specific exceptions |

Source visual lint: 0 failures. Browser visual inspector: 0 failures with `few-pictures` and `still-page` exempted. Reasons and defended warnings are recorded in [redesign decisions](redesign.md). This is a product site with user-controlled interaction, not a motion-gallery submission. Actual screenshots are development captures and will benefit from replacement as the app matures.

## Anti Slop delivery gate

### Hard gate

- R-02 PASS: authored website copy contains no em dashes.
- R-03 PASS: browser assertions found no horizontal overflow at six widths and all demo stages in both themes.
- R-17 PASS: no invented user counts, awards, statistics or performance claims.
- R-18 PASS: no testimonials or customer avatars.
- R-23 PASS: existing brand assets retained; reconstructed interfaces and local-folder illustration fulfil the supplied brief and are identified as previews/concepts.
- R-24 PASS: every internal navigation destination exists and was checked.
- R-25 PASS: computed theme text, action and focus contrast exceeds AA thresholds.
- R-26 PASS: every displayed control has working navigation or state behaviour; coming soon is an informational destination, not a fake download.
- R-27 PASS: there are no transactional forms or loading simulations; unavailable release state is explicit, the site has a real 404 and future media has an image fallback.
- R-28 PASS: no template FAQ.
- R-32 PASS: keyboard activation, Escape, skip link and focus outline verified in Chromium.
- R-33 PASS: features were authored directly in source; automated formatting did not generate or patch features.
- R-34 PASS: both themes checked across all stages and six widths; screenshot and logo assets change with the theme.
- R-35 PASS: production build and complete interactive click-through executed.
- R-36 PASS: no invented security, compliance or customer claims.
- R-37 PASS: design direction and ENERGY 1 / RHYTHM 3 / MOTION 2 were declared before implementation.
- R-38 PASS: authentic screenshots identified, fiction labelled as sample, planned tools explicitly distinguished from implemented writing features.

### Purpose gate

- R-01/R-07/R-09/R-10/R-12/R-13/R-14/R-22 PASS: no gradients, background patterns, decorative badges, glass panels, resting shadows, glows, repeated feature cards or stock illustrations.
- R-04/R-08 PASS: icons only explain focus, theme and local-folder functions; the hero arrow indicates navigation to availability.
- R-06 PASS: Geist and Lora are the documented brand faces; no decorative monospace/uppercase labels.
- R-19 PASS: motion supports arrival and state change; no autoplaying background or scroll hijacking.

### Liveliness

- PASS: declared dials are maintained by calm surfaces, varied compositions and short functional transitions.
- PASS: the manuscript and editorial headline establish hierarchy; spacing separates distinct product arguments.
- PASS: sage is the deliberate accent; Lora and its italic second lines are the repeated literary motif.
- PASS: the signature interaction lets the visitor reveal complexity without leaving the manuscript.

### Craftsmanship and quality locks

- C-1/R-31 PASS: reasons for colour, type, composition, spacing, controls and imagery are written in the design decisions.
- C-2/C-4 PASS: every displayed control was exercised; keyboard, mobile, no-script and reduced-motion paths checked.
- C-3/R-05 PASS: each section proves a distinct product claim; no stock logo bar, testimonials, pricing or feature-card grid.
- C-5 PASS: product claims were checked against the adjacent app's implementation notes, not inferred from its roadmap.
- R-11/R-15/R-16/R-20/R-21/R-29/R-30 PASS: consistent control geometry, specific actions, restrained copy, brand themes, one sage accent and original manuscript-led composition.

## Remaining launch work

Merge this branch into the production Pages source branch when approved for publication. Configure real release details only when installers exist. Add genuine captioned video assets only when available. No launch dates, platforms, download links, legal policies or notification backend have been invented.
