# Cabin's scroll walkthrough

The Home journey uses `refuge-walkthrough.glb`, built in Blender through Blender MCP. A GSAP ScrollTrigger drives the camera from the mountains, across the boardwalk, through sliding doors, and into the writing room. The original software mockup follows the existing scroll interaction model.

## Assets and source

- `walkthrough.blend`: the enterable scene, including a furnished interior, hollow walls, sliding door groups, supported porch and boardwalk piles.
- `refuge-walkthrough.glb`: the active scene exported for the browser.
- `refuge.webp`: a supported-cabin still used only when the live scene cannot load.
- `cabin-scenes.blend` and `build_scenes.py`: original source studies; the workbench supplies the interior furniture.
- `build_walkthrough.py`: the adaptation recipe.

To export edits from the saved home scene, run from the repository root with Blender 5:

```sh
blender --background --factory-startup assets/nordic/walkthrough.blend --python scripts/export_walkthrough.py
```

This exports only the `Cabin walkthrough` scene to `refuge-walkthrough.glb`, including its door groups and edited materials. It does not save or rebuild either `.blend` file. The website loads this GLB; it does not load Blender files.

After replacing the GLB, update the matching `?v=` value in `index.html` and `js/walkthrough.js` so returning visitors receive the new export. Both URLs must match to reuse the early download.

`cabin-scenes.blend` is the original source study and workbench used by the adaptation recipe below. Its scene copies also remain inside `walkthrough.blend`. It is retained as a rebuild source, not a separate website scene. To preserve direct walkthrough edits, use the export command above rather than rerunning the adaptation recipe.

To rebuild the walkthrough from the original source instead:

```sh
blender --background assets/nordic/cabin-scenes.blend --python assets/nordic/build_walkthrough.py
```

The script exports the GLB and saves the editable walkthrough. Render the configured camera to regenerate the fallback PNG, then convert it with Pillow:

```sh
python -c "from PIL import Image; Image.open('assets/nordic/refuge-supported.png').save('assets/nordic/refuge.webp',quality=88,method=6)"
```

## Page integration

`css/navigation.css` copies Roadmap's fixed glass navigation and pill button treatment. Mobile links are compact enough to remain visible. Roadmap's page and dependencies are unchanged.

`js/walkthrough.js` and `css/walkthrough.css` integrate the live Home journey. Rendering happens on scroll or resize and pauses off screen. Reduced motion uses a static camera without the long scroll sequence. Loading or WebGL failure leaves the still and the following writing-room section available.

Blog and Philosophy retain their original main content and interactions. About uses maker-desk.glb: an oak desk, notebook and pen, laptop, and typewriter. Scroll moves the camera to each surface; canvas textures put readable biography text directly on the pages and screen. The laptop illuminates as the camera approaches. Reduced motion and WebGL failure expose the semantic text transcript. The original Home mockup reveals its chapter rail, character notes and timeline through GSAP.

The local Three.js 0.160.0 files retain their license in `js/vendor/THREE-LICENSE.txt`. PNG intermediates and Blender backups are ignored by Git.

The desk source is `maker-desk.blend`, generated through Blender MCP with `build_maker_desk.py`. Rebuild using `blender --background --python assets/nordic/build_maker_desk.py`. `maker-desk.webp` is its fallback render.
