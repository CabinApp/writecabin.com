# Cabin's scroll walkthrough

The Home journey uses `refuge-walkthrough.glb`, built in Blender through Blender MCP. A GSAP ScrollTrigger drives the camera from the mountains, across the boardwalk, through sliding doors, and into the writing room. The original software mockup and About drawer sequence follow the existing scroll interaction model.

## Assets and source

- `walkthrough.blend`: the enterable scene, including a furnished interior, hollow walls, sliding door groups, supported porch and boardwalk piles.
- `refuge-walkthrough.glb`: the active scene exported for the browser.
- `refuge.webp`: a supported-cabin still used only when the live scene cannot load.
- `cabin-scenes.blend` and `build_scenes.py`: original source studies; the workbench supplies the interior furniture.
- `build_walkthrough.py`: the adaptation recipe.

Run from the repository root with Blender 5:

```sh
blender --background assets/nordic/cabin-scenes.blend --python assets/nordic/build_walkthrough.py
```

The script exports the GLB and saves the editable walkthrough. Render the configured camera to regenerate the fallback PNG, then convert it with Pillow:

```sh
python -c "from PIL import Image; Image.open('assets/nordic/refuge-supported.png').save('assets/nordic/refuge.webp',quality=88,method=6)"
```

## Page integration

`css/navigation.css` copies Roadmap's fixed glass navigation and pill button treatment. Mobile links are compact enough to remain visible. Roadmap's page and dependencies are unchanged.

`js/walkthrough.js` and `css/walkthrough.css` integrate the live Home journey. Rendering happens on scroll or resize and pauses off screen. Reduced motion uses a static camera without the long scroll sequence. Loading or WebGL failure leaves the still and the direct writing-room link available.

Blog, Philosophy and 404 retain their original main content and interactions. About retains the original scroll-controlled drawers, with mobile height adjusted to leave room for its text. The original Home mockup reveals its chapter rail, character notes and timeline through GSAP.

The local Three.js 0.160.0 files retain their license in `js/vendor/THREE-LICENSE.txt`. PNG intermediates and Blender backups are ignored by Git.
