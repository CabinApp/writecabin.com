import bpy, math, random
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'assets'/'nordic'
OUT.mkdir(exist_ok=True)
random.seed(17)
def material(name,color,roughness=.7,emission=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*color,1);bs.inputs['Roughness'].default_value=roughness
 if emission:
  bs.inputs['Emission Color'].default_value=(*color,1);bs.inputs['Emission Strength'].default_value=emission
 return m
def box(name,loc,scale,mat,bevel=.04):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(mat)
 if bevel: mod=o.modifiers.new('Soft edges','BEVEL');mod.width=bevel;mod.segments=3;o.modifiers.new('Normals','WEIGHTED_NORMAL')
 return o
def mesh(name,verts,faces,mat):
 me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o);o.data.materials.append(mat);return o
def scene(name,location,target,ortho,width=1600,height=1100):
 s=bpy.data.scenes.new(name);bpy.context.window.scene=s;s.render.engine='CYCLES';s.cycles.samples=24;s.cycles.use_denoising=True
 s.render.resolution_x=width;s.render.resolution_y=height;s.render.resolution_percentage=100
 s.world=bpy.data.worlds.new(name+' sky');s.world.use_nodes=True;s.world.node_tree.nodes['Background'].inputs[0].default_value=(.69,.76,.73,1);s.world.node_tree.nodes['Background'].inputs[1].default_value=.65
 s.view_settings.view_transform='AgX'
 bpy.ops.object.camera_add(location=location);c=bpy.context.object;c.rotation_euler=(Vector(target)-c.location).to_track_quat('-Z','Y').to_euler();c.data.type='ORTHO';c.data.ortho_scale=ortho;s.camera=c
 bpy.ops.object.light_add(type='AREA',location=(-5,-8,14));l=bpy.context.object;l.data.energy=2100;l.data.shape='DISK';l.data.size=9;l.rotation_euler=(Vector((0,0,0))-l.location).to_track_quat('-Z','Y').to_euler()
 return s
def pine(x,y,z,h):
 box('Pine trunk',(x,y,z+h*.25),(.09,.09,h*.5),wood,.01)
 for i in range(3):
  bpy.ops.mesh.primitive_cone_add(vertices=9,radius1=h*(.28-i*.05),radius2=0,depth=h*.57,location=(x,y,z+h*(.43+i*.22)))
  bpy.context.object.name='Nordic spruce';bpy.context.object.data.materials.append(pine_mat)
home=scene('Cabin — mountain refuge',(16,-25,18),(0,2,1),30,1800,1200)
wood=material('Honey oak',(.42,.27,.15));dark=material('Charcoal standing seam',(.09,.14,.13));pine_mat=material('Blue spruce',(.18,.28,.25));stone=material('Lichen granite',(.43,.48,.42));snow=material('Chalk peaks',(.77,.80,.75));ground=material('Moss meadow',(.36,.43,.31));water=material('Still fjord',(.39,.53,.51),.22);light=material('Warm window',(.95,.63,.25),.35,1.5);paper=material('Uncoated paper',(.9,.87,.75))
box('Fjord',(0,5,-.48),(200,200,.3),water,0)
# Soft faceted shore, with cabin at the water's edge.
bpy.ops.mesh.primitive_uv_sphere_add(segments=48,ring_count=16,location=(3,2,-.9));o=bpy.context.object;o.name='Quiet island';o.scale=(10,7,1.35);o.data.materials.append(ground)
for x,y,h,r in [(-10,15,8,8),(0,21,11,10),(12,20,9,9),(-19,23,12,12)]:
 bpy.ops.mesh.primitive_cone_add(vertices=7,radius1=r,radius2=.15,depth=h,location=(x,y,h/2-1));o=bpy.context.object;o.name='Scandinavian ridge';o.data.materials.append(stone if x%2 else snow)
# Cabin, gable facing the camera.
box('Stone foundation',(3,0,.5),(3.8,4.2,.35),stone)
box('Oak cabin',(3,0,1.7),(3.4,3.8,2.3),wood)
mesh('Gable',[(1.3,-1.9,2.85),(4.7,-1.9,2.85),(3,-1.9,4.5),(1.3,1.9,2.85),(4.7,1.9,2.85),(3,1.9,4.5)],[(0,1,2),(3,5,4),(0,3,4,1),(1,4,5,2),(2,5,3,0)],wood)
for sign in [-1,1]:
 o=box('Folded roof',(3+sign*.96,0,3.65),(2.75,4.35,.14),dark);o.rotation_euler.y=sign*math.radians(44)
for x in [1.6+i*.19 for i in range(16)]:
 box('Vertical timber',(x,-1.93,1.75),(.045,.04,2.1),wood,.005)
box('Window surround',(3,-1.97,1.9),(1.85,.12,1.7),dark)
box('Amber interior',(3,-2.04,1.9),(1.61,.04,1.48),light,.01)
box('Window mullion',(3,-2.08,1.9),(.065,.06,1.55),dark,.01)
box('Window crossbar',(3,-2.08,1.9),(1.68,.06,.06),dark,.01)
box('Chimney',(4,1,4.1),(.38,.45,1.45),dark)
box('Front deck',(3,-2.8,.55),(4.2,1.5,.18),wood)
for i in range(9):box('Jetty board',(3,-3.65-i*.3,.23),(1.5,.26,.12),wood,.02)
for x,y,h in [(6,2,4),(7,4,5),(0,3,3.5),(-2,4,4),(8,0,3),(-3,1,2.8),(5,5,4.5),(-1,6,4),(9,3,3.8)]:
 pine(x,y,.15,h)
for i in range(22):
 x=random.uniform(-5,10);y=random.uniform(-1,7)
 if 1<x<5 and y<3:continue
 bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=random.uniform(.18,.5),location=(x,y,.25));bpy.context.object.data.materials.append(stone)
home.render.image_settings.file_format='WEBP' if False else 'PNG'
home.render.filepath=str(OUT/'refuge.png')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'cabin-scenes.blend'))
print('Mountain scene ready:',len(home.objects),'objects')

bpy.ops.render.render(write_still=True)

# A second scene: a small, intentional oak writing desk.
desk=scene('Cabin — makers workbench',(7,-9,7),(0,0,1.1),9,1200,1200)
oak=material('Pale oak',(.62,.47,.3));ink=material('Forest green',(.15,.23,.18));ceramic=material('Warm ceramic',(.74,.72,.62));sheet=material('Ivory pages',(.92,.9,.81));brass=material('Brushed brass',(.53,.4,.19),.3)
box('Oak desktop',(0,0,1.7),(4.7,2.5,.16),oak,.07)
for x in [-1.95,1.95]:
 for y in [-.95,.95]:box('Tapered oak leg',(x,y,.83),(.16,.16,1.65),oak,.025)
box('Desk drawer',(.95,.1,1.38),(1.65,1.8,.4),oak)
box('Drawer pull',(.95,-.84,1.4),(.48,.06,.045),brass,.02)
for i in range(5):
 o=box('Manuscript page',(-.25,-.35,1.8+i*.015),(1.25,1.55,.012),sheet,.005);o.rotation_euler.z=-.08+i*.014
for i in range(9):box('Printed sentence',(-.25,-.78+i*.12,1.883),(random.uniform(.65,1),.012,.003),ink,0)
for i,(w,mat) in enumerate([(1.2,ink),(1.1,ceramic),(.98,oak)]):
 box('Research book',(-1.45,.42,1.82+i*.12),(w,.7,.1),mat,.015)
bpy.ops.mesh.primitive_cylinder_add(vertices=48,radius=.22,depth=.45,location=(1.5,-.45,2.01));bpy.context.object.name='Ceramic mug';bpy.context.object.data.materials.append(ceramic)
bpy.ops.mesh.primitive_cylinder_add(vertices=48,radius=.175,depth=.008,location=(1.5,-.45,2.24));bpy.context.object.name='Coffee';bpy.context.object.data.materials.append(dark)
bpy.ops.mesh.primitive_torus_add(major_radius=.17,minor_radius=.045,location=(1.74,-.45,2.02),rotation=(math.pi/2,0,0));bpy.context.object.name='Mug handle';bpy.context.object.data.materials.append(ceramic)
box('Pencil',(.66,-.43,1.81),(.045,1.2,.045),brass,.01)
bpy.ops.mesh.primitive_cylinder_add(vertices=48,radius=.33,depth=.06,location=(1.7,.72,1.83));bpy.context.object.name='Lamp foot';bpy.context.object.data.materials.append(ink)
box('Lamp stem',(1.7,.72,2.45),(.06,.06,1.2),brass,.02)
bpy.ops.mesh.primitive_cone_add(vertices=48,radius1=.47,radius2=.16,depth=.4,location=(1.7,.72,3.05));bpy.context.object.name='Green desk lamp';bpy.context.object.data.materials.append(ink)
bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=8,radius=.1,location=(1.7,.72,2.83));bpy.context.object.name='Warm lamp bulb';bpy.context.object.data.materials.append(light)
# Ground receives soft shadows in the render, omitted from the reusable model.
floor=box('Studio ground',(0,0,-.05),(200,200,.1),material('Studio cream',(.85,.85,.79)),0)
bpy.ops.object.select_all(action='DESELECT')
for o in desk.objects:
 if o.type=='MESH' and o!=floor:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'workbench.glb'),export_format='GLB',use_selection=True)
floor.is_shadow_catcher=True
desk.render.film_transparent=True
desk.render.filepath=str(OUT/'workbench.png')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'cabin-scenes.blend'))
print('Workbench created and exported')

bpy.ops.render.render(write_still=True)
