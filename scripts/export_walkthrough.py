"""Export the saved walkthrough scene without rebuilding or modifying the blend."""
import bpy
from pathlib import Path

root = Path(__file__).resolve().parents[1]
scene = bpy.data.scenes.get('Cabin walkthrough')
if scene is None:
    raise RuntimeError('Open walkthrough.blend: the Cabin walkthrough scene is missing')
bpy.context.window.scene = scene
if not all(name in scene.objects for name in ('DoorLeft', 'DoorRight', 'Interior Coffee')):
    raise RuntimeError('The walkthrough is missing its doors or coffee object')
for obj in scene.objects:
    obj.select_set(obj.type == 'MESH' or obj.name in ('DoorLeft', 'DoorRight'))
target = root / 'assets/nordic/refuge-walkthrough.glb'
bpy.ops.export_scene.gltf(filepath=str(target), export_format='GLB',
                          use_selection=True, use_active_scene=True,
                          export_cameras=False, export_lights=False)
print('Exported saved walkthrough to', target)
