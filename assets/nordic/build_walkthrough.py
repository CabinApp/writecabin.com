"""Adapt Cabin's source scene into an enterable, physically supported refuge."""
import bpy, math
from pathlib import Path
from mathutils import Vector
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'assets/nordic'
# Run after opening cabin-scenes.blend; preserve the original in its own file.
source = bpy.data.scenes.get('Cabin — mountain refuge')
home = bpy.data.scenes.new('Cabin walkthrough')
bpy.context.window.scene = home
for original in source.objects:
    copy = original.copy()
    if original.data:
        copy.data = original.data.copy()
    home.collection.objects.link(copy)
# Use a separate scene so the editable original stays available.
def remove_prefix(prefix):
    for obj in list(home.objects):
        if obj.name.startswith(prefix):
            bpy.data.objects.remove(obj, do_unlink=True)
def mat(name, color, roughness=.8):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (*color,1)
    m.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = roughness
    return m
oak = bpy.data.materials.get('Honey oak')
stone = bpy.data.materials.get('Lichen granite')
dark = bpy.data.materials.get('Charcoal standing seam')
pale = mat('Interior limewash',(.77,.78,.69))
warm = mat('Door glazing',(.77,.66,.41),.3)
def box(name,loc,size,material,bevel=.02,parent=None):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc)
    o=bpy.context.object;o.name=name;o.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    o.data.materials.append(material)
    if bevel:
        mod=o.modifiers.new('Rounded joinery','BEVEL');mod.width=bevel;mod.segments=2
        o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    if parent:
        o.parent=parent
    return o
for prefix in ['Oak cabin','Vertical timber','Window surround','Amber interior','Window mullion','Window crossbar','Front deck','Jetty board']:
    remove_prefix(prefix)
# Hollow walls and a genuine opening; the camera never tunnels through a solid box.
box('Cabin floor',(3,0,.66),(3.5,3.85,.16),oak)
box('Left wall',(1.36,0,1.75),(.16,3.8,2.2),pale)
box('Right wall',(4.64,0,1.75),(.16,3.8,2.2),pale)
box('Back wall',(3,1.82,1.75),(3.4,.16,2.2),pale)
for x in [1.7,4.3]:
    box('Front wall',(x,-1.86,1.75),(.8,.16,2.2),oak)
box('Door lintel',(3,-1.88,2.82),(1.85,.18,.18),oak)
for x in [2.1,3.9]:
    box('Door jamb',(x,-1.99,1.72),(.085,.12,2.1),dark)
for name,x in [('DoorLeft',2.55),('DoorRight',3.45)]:
    group=bpy.data.objects.new(name,None);home.collection.objects.link(group)
    box(name+' pane',(x,-1.97,1.72),(.82,.055,1.99),warm,parent=group)
    for edge in [-.43,.43]:
        box(name+' frame',(x+edge,-2.01,1.72),(.055,.08,2.1),dark,parent=group)
    for z in [.69,1.74,2.75]:
        box(name+' crossbar',(x,-2.01,z),(.88,.08,.055),dark,parent=group)
# A supported porch, with joists and piers meeting the shore.
box('Porch stone plinth',(3,-2.65,.08),(3.9,1.55,.98),stone)
box('Porch deck',(3,-2.65,.64),(4.15,1.55,.14),oak)
for x in [1.05,4.95]:
    box('Porch rim beam',(x,-2.65,.48),(.14,1.65,.24),oak)
# The boardwalk meets the porch at the same level. Piles extend into the fjord.
for i in range(13):
    box('Walkway plank',(3,-3.5-i*.29,.64),(1.5,.26,.14),oak)
for x in [2.36,3.64]:
    box('Walkway joist',(x,-5.25,.47),(.14,3.9,.22),oak)
    for y in [-3.5,-4.65,-5.8,-7.05]:
        box('Walkway pile',(x,y,-.06),(.15,.15,1.23),oak)
# Furnish the interior using the Blender workbench, scaled to the room.
desk=bpy.data.scenes.get('Cabin — makers workbench')
for obj in desk.objects:
    if obj.type!='MESH' or obj.name.startswith('Studio ground'):
        continue
    copy=obj.copy();copy.data=obj.data.copy();home.collection.objects.link(copy)
    copy.name='Interior '+obj.name
    copy.location=Vector((3,.8,.74))+obj.location*.48
    copy.scale=obj.scale*.48
box('Woven rug',(3,-.55,.754),(1.85,1.45,.015),mat('Wool sage',(.43,.51,.4)))
# A framed view over the desk.
box('Picture frame',(3,1.72,2.1),(1.5,.06,.75),oak)
box('Mountain print',(3,1.68,2.1),(1.38,.02,.64),mat('Mountain print green',(.47,.58,.51)))
for o in home.objects:
    o.select_set(o.type=='MESH' or o.name in ['DoorLeft','DoorRight'])
bpy.ops.export_scene.gltf(filepath=str(OUT/'refuge-walkthrough.glb'),export_format='GLB',use_selection=True,use_active_scene=True,export_cameras=False,export_lights=False)
home.world = source.world.copy()
home.camera = next(o for o in home.objects if o.type == 'CAMERA')
home.render.engine = 'CYCLES'
home.cycles.samples = 24
home.cycles.use_denoising = True
home.render.resolution_x = 1600
home.render.resolution_y = 1100
home.render.resolution_percentage = 100
home.render.image_settings.file_format = 'PNG'
home.render.filepath = str(OUT/'refuge-supported.png')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'walkthrough.blend'))
print('Walkthrough exported:',len(home.objects),'objects')
