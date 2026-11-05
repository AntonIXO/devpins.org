"""New scene. Run: blender -b -t 2 --python scripts/build_mind.py."""
import bpy, gzip, base64, zlib, struct, math, json
import xml.etree.ElementTree as ET
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version=0

def material(name, color):
 m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
 b=m.node_tree.nodes.get('Principled BSDF'); b.inputs['Base Color'].default_value=(*color,1); b.inputs['Metallic'].default_value=.3; b.inputs['Roughness'].default_value=.38
 return m
cortex=material('Cortical silver',(0.19,.32,.35)); inner=material('Axonal amber',(.7,.34,.09))
for side in ['left','right']:
 root=ET.fromstring(gzip.open(ROOT/f'assets/mind/pial_{side}.gii.gz').read()); arrays=[]
 for a in root.findall('DataArray'):
  raw=zlib.decompress(base64.b64decode(a.findtext('Data')))
  arrays.append(list(struct.iter_unpack('<fff' if 'FLOAT' in a.attrib['DataType'] else '<iii',raw)))
 verts=[(x/45,y/45,z/45) for x,y,z in arrays[0]]
 mesh=bpy.data.meshes.new(f'{side}-cortex'); mesh.from_pydata(verts,[],arrays[1]); mesh.update()
 ob=bpy.data.objects.new(f'Cortex-{side}',mesh); bpy.context.collection.objects.link(ob); mesh.materials.append(cortex)
 for p in mesh.polygons:p.use_smooth=True
# Supporting structures are authored stylizations; the pial source contains cortex only.
def ellipsoid(name,loc,scale):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=48,ring_count=24,location=loc)
 ob=bpy.context.object; ob.name=name; ob.scale=scale
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 for v in ob.data.vertices:
  if name=='Cerebellum':v.co*=1+.025*math.cos(v.co.z*80)
 for p in ob.data.polygons:p.use_smooth=True
 ob.data.materials.append(cortex); return ob
ellipsoid('Cerebellum',(0,-1.15,-.75),(.85,.55,.48))
stem=ellipsoid('Brainstem',(0,-.52,-1.12),(.23,.28,.68)); stem.rotation_euler.x=-.2
# C-shaped callosal bridge.
curve=bpy.data.curves.new('Callosal bridge','CURVE'); curve.dimensions='3D'; curve.bevel_depth=.095; curve.bevel_resolution=5
sp=curve.splines.new('POLY'); sp.points.add(80)
for i,p in enumerate(sp.points):
 t=-.25+math.pi*1.18*i/80; p.co=(0,.68*math.cos(t)-.2,.44*math.sin(t)+.05,1)
ob=bpy.data.objects.new('Corpus-callosum',curve); bpy.context.collection.objects.link(ob); curve.materials.append(inner)
bpy.context.view_layer.objects.active=ob; ob.select_set(True); bpy.ops.object.convert(target='MESH'); ob.select_set(False)
# Asset coordinates: X left/right, Y anterior, Z superior. GLB converts to Y up.
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'assets/mind/mind.blend'))
bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/mind/mind.glb'),export_format='GLB')
mesh_objects=[o for o in bpy.context.scene.objects if o.type=='MESH']
report={'objects':[o.name for o in mesh_objects], 'triangles':sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in mesh_objects)}
(ROOT/'assets/mind/geometry.json').write_text(json.dumps(report,indent=2))
print(report)
