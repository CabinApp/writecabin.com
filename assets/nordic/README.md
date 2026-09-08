# Cabin's mountain studies

Original assets made in Blender through Blender MCP for Cabin.

- `refuge.webp`: a faceted Scandinavian mountain refuge, oak cabin, spruce trees, still fjord and warm window.
- `workbench.webp`: the maker's oak desk with a transparent background and soft ground shadow.
- `workbench.glb`: the same desk for the on-demand, turnable About study.
- `cabin-scenes.blend`: editable source scenes, materials, lighting and cameras.
- `build_scenes.py`: procedural source for both studies.

## Rebuild

Run from the repository root with Blender 5:

```sh
blender --background --python assets/nordic/build_scenes.py
```

The script renders two intermediate PNGs and exports the desk GLB. Convert the PNGs to WebP with Pillow, preserving the workbench alpha channel:

```sh
python -c "from PIL import Image; from pathlib import Path; p=Path('assets/nordic'); [Image.open(p/(n+'.png')).save(p/(n+'.webp'),quality=90,method=6) for n in ['refuge','workbench']]"
```

Intermediate PNGs and Blender backups are ignored by Git. WebP previews keep the normal page load small. The local Three.js 0.160.0 runtime and GLB load only when the visitor requests the 3D workbench. Three.js licensing is in `js/vendor/THREE-LICENSE.txt`.

## Integration

`css/nordic.css` and `js/nordic.js` are loaded only by Home, About, Blog, Philosophy and 404. The existing shared styles, shared script, blog content and Roadmap are unchanged. All 404 asset paths are rooted so nested missing URLs work.

The home study is explicitly a product design concept, not a working editor or a promise that Cabin has shipped. Reduced motion disables parallax and transitions; 3D renders only on demand. If WebGL or model loading fails, the illustrated desk remains visible.

Validated at 1440px and 390px widths in Chromium: all requested pages, room modes and reset, live GLB, fallback on failed model request, blog article loading, Philosophy controls, reduced motion, Home without JavaScript, and nested 404 routes. No page script errors, broken loaded images, or horizontal page overflow.
