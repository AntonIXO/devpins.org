"""Generate an inward-offset, intact cortical surface behind selectable parcels.
Uses the same FreeSurfer source data as build_mind.py, with its retained license.
"""
from pathlib import Path
import gzip,base64,zlib,struct,json,math
import xml.etree.ElementTree as ET
root=Path(__file__).resolve().parents[1]
cores=[]
for side in ['left','right']:
 arrays=[]
 for a in ET.fromstring(gzip.open(root/f'assets/mind/pial_{side}.gii.gz').read()).findall('DataArray'):
  raw=zlib.decompress(base64.b64decode(a.findtext('Data')))
  arrays.append(list(struct.iter_unpack('<fff' if 'FLOAT' in a.attrib['DataType'] else '<iii',raw)))
 vertices=[(x/45,z/45,-y/45) for x,y,z in arrays[0]];faces=arrays[1]
 normals=[[0.,0.,0.] for _ in vertices]
 for a,b,c in faces:
  u=[vertices[b][k]-vertices[a][k] for k in range(3)]
  v=[vertices[c][k]-vertices[a][k] for k in range(3)]
  n=(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0])
  for i in [a,b,c]:
   for k in range(3):normals[i][k]+=n[k]
 inset=[[round(v[k]-n[k]/(math.sqrt(sum(x*x for x in n)) or 1)*.11,5) for k in range(3)] for v,n in zip(vertices,normals)]
 cores.append({'side':side,'positions':[x for p in inset for x in p],'indices':[x for face in faces for x in face]})
(root/'public/mind/cortex-core.json').write_text(json.dumps(cores,separators=(',',':')))
