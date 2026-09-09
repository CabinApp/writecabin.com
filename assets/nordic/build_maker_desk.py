"""Cabin maker desk: Blender source for the scroll-driven About scene."""
import bpy, math
from pathlib import Path
from mathutils import Vector
OUT=Path(__file__).resolve().parent
scene=bpy.data.scenes.new('Cabin maker desk')
bpy.context.window.scene=scene
def mat(name,c,r=.7,metal=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=(*c,1)
 bs=m.node_tree.nodes['Principled BSDF'];bs.inputs['Base Color'].default_value=(*c,1);bs.inputs['Roughness'].default_value=r;bs.inputs['Metallic'].default_value=metal
 return m
oak=mat('Light Scandinavian oak',(.57,.43,.28));edge=mat('Oak endgrain',(.4,.29,.18))
sage=mat('Sage enamel',(.25,.35,.28),.42);dark=mat('Warm graphite',(.095,.12,.105),.48)
paper=mat('Cream paper',(.92,.91,.84));keys=mat('Ivory keys',(.8,.8,.69),.35)
metal=mat('Brushed aluminium',(.48,.51,.49),.35,.55);ink=mat('Black screen',(.025,.035,.03),.25)
brass=mat('Brass details',(.52,.39,.18),.28,.65)
def box(name,loc,size,m,bevel=.025,rotation=(0,0,0)):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=size
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 o.rotation_euler=rotation;o.data.materials.append(m)
 if bevel:
  b=o.modifiers.new('Soft joinery','BEVEL');b.width=bevel;b.segments=3;o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
 return o
def cylinder(name,loc,r,depth,m,rotation=(0,0,0),vertices=32):
 bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=r,depth=depth,location=loc,rotation=rotation)
 o=bpy.context.object;o.name=name;o.data.materials.append(m)
 b=o.modifiers.new('Rounded edge','BEVEL');b.width=.008;b.segments=2;o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
 return o
def page(name,loc,w,h,m,vertical=False):
 x,y,z=loc
 verts=[(x-w/2,y-h/2,z),(x+w/2,y-h/2,z),(x+w/2,y+h/2,z),(x-w/2,y+h/2,z)] if not vertical else [(x-w/2,y,z-h/2),(x+w/2,y,z-h/2),(x+w/2,y,z+h/2),(x-w/2,y,z+h/2)]
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],[(0,1,2,3)]);mesh.update()
 uv=mesh.uv_layers.new()
 for i,coord in enumerate([(0,0),(1,0),(1,1),(0,1)]):uv.data[i].uv=coord
 o=bpy.data.objects.new(name,mesh);scene.collection.objects.link(o);mesh.materials.append(m)
 return o
box('Solid oak tabletop',(0,0,1.42),(8.15,3.5,.18),oak,.08)
for x in [-3.62,3.62]:
 for y in [-1.3,1.3]:box('Oak leg',(x,y,.67),(.18,.18,1.4),oak,.035)
box('Back apron',(0,1.3,1.18),(7.4,.12,.38),edge)
for x in [-3.62,3.62]:box('Side apron',(x,0,1.18),(.12,2.6,.38),edge)
# Student: a stitched school notebook, ruled paper and a fountain pen.
box('Notebook cover',(-2.5,-.2,1.54),(1.85,2.16,.065),sage,.035,rotation=(0,0,-.06))
box('Notebook paper block',(-2.5,-.2,1.59),(1.74,2.04,.045),paper,.012)
page('NotebookPage',(-2.5,-.2,1.615),1.7,2,paper)
for i in range(12):
 cylinder('Notebook stitch',(-3.39,-1.02+i*.15,1.59),.018,.07,brass,(math.pi/2,0,0),12)
pen=box('Fountain pen',(-1.25,-.28,1.56),(.075,1.48,.075),dark,.025,rotation=(0,0,-.19))
box('Pen clip',(-1.17,.25,1.61),(.027,.34,.012),brass,.006,rotation=(0,0,-.19))
# Developer: a restrained aluminium laptop with a genuinely separate display.
box('Laptop base',(0,.28,1.565),(2.05,1.48,.10),metal,.04)
box('Keyboard recess',(0,.47,1.625),(1.79,.65,.02),dark,.025)
for row in range(4):
 for col in range(12):box('Laptop key',(-.79+col*.145,.24+row*.15,1.642),(.12,.105,.018),dark,.01)
box('Trackpad',(0,-.20,1.63),(.69,.38,.012),metal,.02)
box('Laptop lid',(0,1.02,2.28),(2.09,.09,1.39),metal,.055)
box('Screen bezel',(0,.963,2.30),(1.97,.028,1.24),dark,.025)
page('LaptopScreen',(0,.946,2.30),1.87,1.14,ink,True)
cylinder('Laptop hinge',(0,.95,1.64),.065,1.72,dark,(0,math.pi/2,0))
# Writer: an enamel typewriter with round keys, carriage, platen and paper.
box('Typewriter base',(2.53,-.35,1.65),(2.05,1.55,.27),sage,.12)
box('Typewriter shoulder',(2.53,.08,1.87),(2.01,.75,.38),sage,.13)
box('Keyboard bed',(2.53,-.73,1.80),(1.83,.78,.10),dark,.045,rotation=(.15,0,0))
for row in range(4):
 for col in range(10-row%2):
  x=1.75+col*.17+(row%2)*.07;y=-1.03+row*.18;z=1.865+row*.022
  cylinder('Typewriter key stem',(x,y,z-.04),.019,.10,brass,vertices=12)
  cylinder('Round typewriter key',(x,y,z),.059,.045,keys,vertices=24)
box('Spacebar',(2.53,-1.23,1.83),(.98,.10,.07),keys,.03)
cylinder('Platen',(2.53,.24,2.16),.12,1.98,dark,(0,math.pi/2,0))
for x in [1.43,3.63]:cylinder('Carriage knob',(x,.24,2.16),.14,.13,dark,(0,math.pi/2,0))
box('Paper backing',(2.53,.31,2.74),(1.58,.025,1.40),paper,.018)
page('TypewriterPage',(2.53,.29,2.74),1.51,1.34,paper,True)
box('Carriage return',(1.43,.40,2.23),(.10,.45,.06),brass,.02)
box('Carriage handle',(1.43,.61,2.31),(.18,.08,.17),dark,.035)
# Quiet supporting details.
cylinder('Ceramic cup',(-3.5,1.0,1.70),.16,.36,keys)
cylinder('Coffee',(-3.5,1.0,1.89),.13,.008,edge)
bpy.ops.mesh.primitive_torus_add(major_radius=.13,minor_radius=.027,location=(-3.69,1.0,1.72),rotation=(math.pi/2,0,0));bpy.context.object.data.materials.append(keys)
for o in scene.objects:o.select_set(o.type=='MESH')
bpy.ops.export_scene.gltf(filepath=str(OUT/'maker-desk.glb'),export_format='GLB',use_selection=True,use_active_scene=True)
scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
scene.world=bpy.data.worlds.new('Soft daylight');scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.76,.8,.73,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.8
bpy.ops.object.light_add(type='AREA',location=(-4,-5,9));bpy.context.object.data.energy=1800;bpy.context.object.data.size=7
bpy.context.object.rotation_euler=(Vector((0,0,1.5))-bpy.context.object.location).to_track_quat('-Z','Y').to_euler()
floor=box('Render ground',(0,0,-.1),(200,200,.1),paper,0);floor.is_shadow_catcher=True
bpy.ops.object.camera_add(location=(8,-10,8));c=bpy.context.object;c.rotation_euler=(Vector((0,0,1.65))-c.location).to_track_quat('-Z','Y').to_euler();c.data.type='ORTHO';c.data.ortho_scale=11.5;scene.camera=c
scene.render.film_transparent=True;scene.render.resolution_x=1600;scene.render.resolution_y=1050;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.filepath=str(OUT/'maker-desk.png')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'maker-desk.blend'))
print('Maker desk exported',len(scene.objects),'objects')
