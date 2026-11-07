# Product redesign decisions

## Source of truth

Reviewed Cabin's Core Idea, Product Philosophy, UI Philosophy, Customisation Philosophy, File Philosophy and UI System tokens in the adjacent `App/Information` folder. Checked the actual application's README and verification assets in `App/Cabin App` to distinguish implemented functionality from future product direction.

Actual development screenshots are copied from `verification/writing-polish/`: Dawn and Aurora, each in Writing, Formatting and focus mode. The source screenshots are preserved rather than enhanced or fabricated. The sample prose in the interactive reconstructions is fictional and visibly identified as sample content.

The implementation currently supports manuscript editing and hierarchy, writing modes and project typography preferences. Dedicated notes, research, character tools, arbitrary multi-panel layouts and cloud are not advertised as available. Optional AI is not a website selling point and no AI generation capability is claimed.

## Visual direction

Reading: a product marketing page for writers, using quiet editorial composition. ENERGY 1 / RHYTHM 3 / MOTION 2.

- Dawn/Aurora: existing accessible UI System tokens give the website and product previews the same identity. Accessible token variants replace the earlier low-contrast muted colours.
- Lora: connects the headlines to the manuscript; italic second lines provide a repeated literary voice. Geist: keeps navigation and explanations clear.
- Composition: the manuscript is the main image; generous margins and changing full-width/split/centred sections keep the page calm without repeating feature cards.
- Spacing: major whitespace separates distinct product arguments; smaller spacing connects each claim to its demonstration.
- Controls: flat rectangular actions distinguish navigation and state changes from product panels. No decorative badges or customer claims.
- Accent: restrained sage ties literary emphasis and the availability action to Cabin's palette.
- Product fragments: subtle borders and small radii reproduce the product's embedded panels; they are not floating decorative cards.
- Folder drawing: demonstrates the documented local-file model; it is a conceptual illustration, not an operating-system screenshot.
- Motion: one short hero entrance, one-time supporting section arrivals, pressed states and a brief manuscript transition. All content is visible without animation; reduced motion removes the effects. The workspace stages are controlled by the visitor.

Concept: Cabin's progressive complexity becomes a manuscript that gains context when the visitor chooses it. The four states add chapter navigation, planned story notes, then a planned character panel. Every state retains the manuscript. On phones those panels stack into readable sections rather than shrinking the desktop layout.

## Page argument

1. Your story, your space: show a manuscript immediately and explain the product in one sentence.
2. Start with a page: reveal progressive complexity through four deliberate controls.
3. Stay with the sentence: actual screenshots show editing, formatting and Deep Writing.
4. A workspace, your way: explain implemented layout/typography choices and honestly separate future planning.
5. Your words, yours to keep: a local-folder illustration explains ownership and offline writing.
6. Room for your next chapter: an accurate availability state closes the product story.

## Skill adaptations to the supplied brief

Selected the `product-performs` composition from the three dealt directions. Kept the established fonts and palette. Replaced the dealt signup CTA and tiled contact footer because the brief explicitly prohibits fake waitlists and unnecessary sections. No framework migration was introduced.

The visual inspector's `few-pictures` rule is exempted: the brief specifically asks for meaningful product visuals and prohibits filling the site with literal forest/cabin imagery. Two reconstructed interfaces and an authentic, switchable screenshot are appropriate here. Its `still-page` rule is also exempted: its minimum number of automatically moving elements conflicts with the brief's primary user-controlled demonstration and calm-motion requirement. The site does contain short supporting entrances; extra scroll scenes and video loops would undermine this product direction.

Defended visual warnings: literary italic headings follow the explicit brand brief; the outlined local folder explains a file container. Small text inside accurately reconstructed interface fragments represents product chrome; public explanatory text is at least 13px. Secondary ink has computed AA contrast. Videos remain absent because no authentic product videos were supplied.

## Dependency changes

Removed all vendored Three.js, GLTFLoader and BufferGeometryUtils code, all WebGL experiences, Blender scene files and builders, scene images, the client-side router and obsolete secondary pages. Removed Marked/Highlight.js and the blog build pipeline. Added only `playwright-core` as a development dependency for repeatable browser verification. The published site has no package runtime dependencies.
