"""New scene. Run: blender -b -t 2 --python scripts/build_mind.py."""
import bpy, bmesh, gzip, base64, zlib, struct, math, json
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

# Destrieux 2009 surface labels in the same fsaverage5 vertex space.
# Broad territories group anatomical parcels, not arbitrary coordinate boxes.
PARCELS={
 'motor':{3,29,46,69,70},
 'bridge':{8,9,10,25,26,27,28,30,47,56,57,66,68,72},
 'audio':{21,22,23,33,34,35,36,37,38,44,51,52,61,62,73,74,75},
 'vision':{2,11,19,20,43,45,58,59,60},
 'frontal':{1,4,5,6,7,12,13,14,15,16,24,31,32,39,40,53,54,55,63,64,65,71},
 'root':{17,18,41,48,49,50},
 'medial':{0,42,67},
}
PALETTE={'motor':(.28,.56,.45),'bridge':(.36,.49,.65),'audio':(.58,.39,.5),'vision':(.48,.4,.63),'frontal':(.67,.51,.32),'root':(.28,.53,.56),'medial':(.39,.39,.4)}
region_mats={key:material(key,color) for key,color in PALETTE.items()}
parcel_notes={};anchor_candidates={}
def read_annot(path):
 with open(path,'rb') as f:
  def integer():return struct.unpack('>i',f.read(4))[0]
  def string():return f.read(integer()).decode().rstrip('\0')
  n=integer();pairs=[(integer(),integer()) for _ in range(n)]
  assert integer()==1 and integer()==-2
  integer();string();count=integer();colors={};names={}
  for _ in range(count):
   index=integer();name=string();r,g,b,alpha=[integer() for _ in range(4)]
   colors[r+g*256+b*65536]=index;names[index]=name
  labels=[0]*n
  for v,color in pairs:labels[v]=colors.get(color,0)
  return labels,names
for side,short in [('left','lh'),('right','rh')]:
 root=ET.fromstring(gzip.open(ROOT/f'assets/mind/pial_{side}.gii.gz').read()); arrays=[]
 for a in root.findall('DataArray'):
  raw=zlib.decompress(base64.b64decode(a.findtext('Data')))
  arrays.append(list(struct.iter_unpack('<fff' if 'FLOAT' in a.attrib['DataType'] else '<iii',raw)))
 verts=[(x/45,y/45,z/45) for x,y,z in arrays[0]]
 labels,names=read_annot(ROOT/f'assets/mind/{short}.aparc.a2009s.annot')
 assert len(labels)==len(verts)==10242
 parcel_notes.update({key:[names[i] for i in sorted(ids)] for key,ids in PARCELS.items()})
 original=bpy.data.meshes.new('normals-reference');original.from_pydata(verts,[],arrays[1]);original.update()
 for p in original.polygons:p.use_smooth=True
 normals=[v.normal.copy() for v in original.vertices]
 for region,ids in PARCELS.items():
  # Majority vote on each source triangle preserves every original face exactly once.
  def territory(face):
   groups=[next(k for k,v in PARCELS.items() if labels[index] in v) for index in face]
   return max(dict.fromkeys(groups),key=groups.count)
  faces=[face for face in arrays[1] if territory(face)==region]
  used=sorted({v for f in faces for v in f});remap={old:new for new,old in enumerate(used)}
  mesh=bpy.data.meshes.new(f'{side}-{region}');mesh.from_pydata([verts[i] for i in used],[],[[remap[i] for i in f] for f in faces]);mesh.update()
  ob=bpy.data.objects.new(f'{side}-{region}',mesh);bpy.context.collection.objects.link(ob);mesh.materials.append(region_mats[region]);ob['region']=region
  for p in mesh.polygons:p.use_smooth=True
  mesh.normals_split_custom_set_from_vertices([normals[i] for i in used])
  # Smooth the low-resolution atlas cut edge, then give each cortical shell thickness.
  # The parcellation remains unchanged; only its presentation boundary is softened.
  bm=bmesh.new();bm.from_mesh(mesh)
  boundary=[v.index for v in bm.verts if any(e.is_boundary for e in v.link_edges)]
  bm.free()
  if boundary:
   group=ob.vertex_groups.new(name='Atlas boundary');group.add(boundary,1.0,'REPLACE')
   smooth=ob.modifiers.new('Soften parcel rim','SMOOTH');smooth.vertex_group=group.name;smooth.factor=.6;smooth.iterations=5
   subdiv=ob.modifiers.new('Smooth parcel silhouette','SUBSURF');subdiv.levels=1;subdiv.render_levels=1
   decimate=ob.modifiers.new('Web surface budget','DECIMATE');decimate.ratio=.45;decimate.use_collapse_triangulate=True
   shell=ob.modifiers.new('Cortical thickness','SOLIDIFY');shell.thickness=.075;shell.offset=-1;shell.use_even_offset=False;shell.thickness_clamp=1.0

  if side=='right' and region!='medial':
   candidates=[Vector(verts[i]) for i in used if labels[i] in ids]
   center=sum(candidates,Vector())/len(candidates)
   # Use an actual outer surface vertex near the parcel centroid, not a guessed coordinate.
   target=Vector((max(v.x for v in candidates)*.94,center.y,center.z))
   anchor=min(candidates,key=lambda v:(v-target).length)
   anchor_candidates[region]=[anchor.x,anchor.z,-anchor.y]
 bpy.data.meshes.remove(original)
(ROOT/'public/mind/regions.json').write_text(json.dumps({'anchors':anchor_candidates,'parcels':parcel_notes},indent=2))
# Supporting structures are authored stylizations; the pial source contains cortex only.
def ellipsoid(name,loc,scale):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=48,ring_count=24,location=loc)
 ob=bpy.context.object; ob.name=name; ob.scale=scale
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 for v in ob.data.vertices:
  if name=='Cerebellum':v.co*=1+.025*math.cos(v.co.z*80)
 for p in ob.data.polygons:p.use_smooth=True
 ob.data.materials.append(region_mats['medial']);ob['region']='support'; return ob
ellipsoid('Cerebellum',(0,-1.15,-.75),(.85,.55,.48))
stem=ellipsoid('Brainstem',(0,-.52,-1.12),(.23,.28,.68)); stem.rotation_euler.x=-.2
# C-shaped callosal bridge.
curve=bpy.data.curves.new('Callosal bridge','CURVE'); curve.dimensions='3D'; curve.bevel_depth=.095; curve.bevel_resolution=5
sp=curve.splines.new('POLY'); sp.points.add(80)
for i,p in enumerate(sp.points):
 t=-.25+math.pi*1.18*i/80; p.co=(0,.68*math.cos(t)-.2,.44*math.sin(t)+.05,1)
ob=bpy.data.objects.new('Corpus-callosum',curve); bpy.context.collection.objects.link(ob); curve.materials.append(region_mats['medial']);ob['region']='medial'
bpy.context.view_layer.objects.active=ob; ob.select_set(True); bpy.ops.object.convert(target='MESH'); ob.select_set(False)
# Asset coordinates: X left/right, Y anterior, Z superior. GLB converts to Y up.
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'assets/mind/mind.blend'))
bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/mind/mind.glb'),export_format='GLB',export_extras=True,export_apply=True)
mesh_objects=[o for o in bpy.context.scene.objects if o.type=='MESH']
depsgraph=bpy.context.evaluated_depsgraph_get()
triangles=0
for obj in mesh_objects:
 evaluated=obj.evaluated_get(depsgraph);mesh=evaluated.to_mesh();triangles+=sum(len(p.vertices)-2 for p in mesh.polygons);evaluated.to_mesh_clear()
report={'objects':[o.name for o in mesh_objects], 'sourceCortexTriangles':40960, 'triangles':triangles}
(ROOT/'assets/mind/geometry.json').write_text(json.dumps(report,indent=2))
print(report)
