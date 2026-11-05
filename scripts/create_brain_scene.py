import bpy
import math
from mathutils import Vector
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'brain'
OUT.mkdir(parents=True, exist_ok=True)
GLB = OUT / 'brain-atlas.glb'
BLEND = OUT / 'brain-atlas.blend'

bpy.ops.wm.read_factory_settings(use_empty=True)
for collection in list(bpy.data.collections):
    if collection.name != 'Collection':
        bpy.data.collections.remove(collection)
base = bpy.data.collections.get('Collection')
if base:
    base.name = 'Brain Atlas'

# Atlas palette: muted tissue base, distinct region accents, emissive nodes.
def mat(name, color, metallic=0.0, roughness=0.52, emission=None):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1.0)
    m.use_nodes = True
    bs = m.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Base Color'].default_value = (*color, 1.0)
    bs.inputs['Roughness'].default_value = roughness
    bs.inputs['Metallic'].default_value = metallic
    if emission:
        bs.inputs['Emission Color'].default_value = (*emission, 1.0)
        bs.inputs['Emission Strength'].default_value = 1.8
    return m

mats = {
    'cortex_l': mat('Cortex / left', (0.22, 0.09, 0.16), roughness=0.65),
    'cortex_r': mat('Cortex / right', (0.28, 0.10, 0.19), roughness=0.65),
    'cerebellum': mat('Cerebellum', (0.48, 0.18, 0.22), roughness=0.58),
    'brainstem': mat('Brainstem', (0.58, 0.31, 0.20), roughness=0.58),
    'inner': mat('Inner structures', (0.75, 0.42, 0.24), roughness=0.44),
    'ridge': mat('Sulci', (0.045, 0.018, 0.05), roughness=0.8),
    'node': mat('Project nodes', (0.95, 0.68, 0.25), emission=(1.0, 0.28, 0.06), roughness=0.2),
}

def move_to_collection(obj, name):
    for c in list(obj.users_collection): c.objects.unlink(obj)
    c = bpy.data.collections.get(name) or bpy.data.collections.new(name)
    if not c.name in bpy.context.scene.collection.children:
        try: bpy.context.scene.collection.children.link(c)
        except RuntimeError: pass
    c.objects.link(obj)
    return obj

def ico(name, loc, scale, material, subdivisions=3, collection='Brain', cortex=False):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=subdivisions, radius=1, location=loc)
    o = bpy.context.object; o.name = name; o.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if cortex:
        # Low-amplitude anatomical convolution: preserve the silhouette, break the perfect sphere.
        for vertex in o.data.vertices:
            p = vertex.co.normalized()
            fold = (
                math.sin(vertex.co.y * 7.0 + vertex.co.z * 2.4) * 0.042
                + math.sin(vertex.co.z * 10.0 - vertex.co.x * 3.0) * 0.028
                + math.sin((vertex.co.x + vertex.co.y) * 13.0) * 0.018
            )
            vertex.co += p * fold
    o.data.materials.append(mats[material])
    move_to_collection(o, collection)
    for p in o.data.polygons: p.use_smooth = True
    return o

def uv(name, loc, scale, material, segments=48, rings=24, collection='Brain'):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=loc)
    o = bpy.context.object; o.name = name; o.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(mats[material]); move_to_collection(o, collection)
    for p in o.data.polygons: p.use_smooth = True
    return o

def curve(name, points, bevel, material='ridge', collection='Sulci'):
    c = bpy.data.curves.new(name, 'CURVE'); c.dimensions = '3D'; c.resolution_u = 1
    c.bevel_depth = bevel; c.bevel_resolution = 1
    s = c.splines.new('POLY'); s.points.add(len(points)-1)
    for point, co in zip(s.points, points): point.co = (*co, 1.0)
    o = bpy.data.objects.new(name, c); bpy.data.collections.get(collection) or bpy.data.collections.new(collection)
    col = bpy.data.collections.get(collection)
    if col.name not in [x.name for x in bpy.context.scene.collection.children]: bpy.context.scene.collection.children.link(col)
    col.objects.link(o); c.materials.append(mats[material]); return o

# Primary anatomical masses. X = left/right, Y = front/back, Z = inferior/superior.
ico('Cerebral hemisphere L', (-0.88, 0.05, 0.52), (1.20, 1.58, 1.22), 'cortex_l', 4, cortex=True)
ico('Cerebral hemisphere R', (0.88, 0.05, 0.52), (1.20, 1.58, 1.22), 'cortex_r', 4, cortex=True)
ico('Cerebellum', (0.0, 1.18, -0.22), (0.72, 0.58, 0.56), 'cerebellum', 3)
ico('Brainstem', (0.0, 0.72, -0.82), (0.28, 0.34, 0.78), 'brainstem', 3)
ico('Corpus callosum', (0.0, 0.05, 0.45), (0.25, 0.92, 0.24), 'inner', 3, 'Inner structures')
ico('Thalamus', (0.0, -0.10, 0.18), (0.34, 0.42, 0.34), 'inner', 3, 'Inner structures')

# Deliberately readable cortical folds, mirrored with slight phase differences.
for side in (-1, 1):
    for i in range(9):
        pts = []
        local_x = side * (0.93 - i * 0.095)
        for j in range(13):
            t = j / 12
            lx = local_x + side * 0.035 * math.sin(t * math.pi * 3.0 + i * 0.8)
            lz = -0.16 + t * 1.38 + 0.035 * math.sin(t * math.pi * 5.0 + i)
            surface = max(0.08, 1.0 - (lx / 1.20) ** 2 - ((lz - 0.52) / 1.22) ** 2)
            px = side * 0.88 + lx
            py = 0.05 - 1.58 * math.sqrt(surface) - 0.008
            pz = 0.52 + lz
            pts.append((px, py, pz))
        curve(f'Sulcus {"L" if side < 0 else "R"} {i:02d}', pts, 0.010)

# Project anchors: intentionally semantic names for Three.js raycast and labels.
anchors = [
    ('node-sensorlm', (-0.72, -0.72, 1.24), 'inner'),
    ('node-optihealth', (-0.98, 0.18, 1.18), 'cortex_l'),
    ('node-dreamwalker', (0.76, 0.58, 1.20), 'cortex_r'),
    ('node-minebit', (1.02, -0.52, 0.70), 'cortex_r'),
    ('node-sailfish', (-0.94, 0.76, 0.66), 'cortex_l'),
    ('node-audio', (0.94, 0.12, 0.18), 'cortex_r'),
]
for name, loc, _ in anchors:
    ico(name, loc, (0.10, 0.10, 0.10), 'node', 2, 'Project nodes')

# World/camera for the authored Blender view; runtime will use its own camera.
world = bpy.context.scene.world or bpy.data.worlds.new('Brain World')
bpy.context.scene.world = world; world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.004, 0.002, 0.012, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.08
bpy.ops.object.camera_add(location=(4.3, -5.4, 2.6))
cam = bpy.context.object; cam.name = 'Atlas Camera'; bpy.context.scene.camera = cam

def track(obj, target): obj.rotation_euler = (Vector(target) - obj.location).to_track_quat('-Z', 'Y').to_euler()
track(cam, (0, 0.15, 0.25)); cam.data.lens = 52
bpy.ops.object.light_add(type='AREA', location=(2.8, -3.0, 4.2)); key = bpy.context.object; key.name='Key'; key.data.energy=850; key.data.shape='DISK'; key.data.size=4.0; track(key,(0,0,0))
bpy.ops.object.light_add(type='AREA', location=(-3.0, 1.8, 1.0)); fill=bpy.context.object; fill.name='Fill'; fill.data.energy=420; fill.data.color=(0.22,0.18,1.0); fill.data.size=3.0; track(fill,(0,0,0))

scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE'; scene.render.resolution_x = 900; scene.render.resolution_y = 700; scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'; scene.render.filepath = str(OUT / 'brain-atlas-preview.png')
scene.render.film_transparent = False
scene.view_settings.look = 'AgX - Medium High Contrast'

# Custom properties are carried into GLB for runtime semantic mapping.
scene['atlas_contract'] = 'inside-eye anatomical project map'
scene['zones'] = 'cortex, corpus-callosum, thalamus, cerebellum, brainstem'
for name, loc, zone in anchors:
    bpy.data.objects[name]['project_zone'] = zone

bpy.ops.wm.save_as_mainfile(filepath=str(BLEND))
bpy.ops.export_scene.gltf(filepath=str(GLB), export_format='GLB', export_materials='EXPORT', use_selection=False)
bpy.ops.render.render(write_still=True)
print(f'WROTE {BLEND}')
print(f'WROTE {GLB}')
