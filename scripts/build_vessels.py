"""Deterministic artistic vascular trees following the source cortical surface.
Not measured angiography. Run with Python's standard library only.
"""
import gzip,base64,zlib,struct,json,heapq,math,random
import xml.etree.ElementTree as ET
from pathlib import Path
from collections import Counter,defaultdict
ROOT=Path(__file__).resolve().parents[1]
REGIONS=json.loads((ROOT/'public/mind/regions.json').read_text())['parcels']

def annot(path):
 with open(path,'rb') as f:
  def integer():return struct.unpack('>i',f.read(4))[0]
  def string():return f.read(integer()).decode().rstrip('\0')
  count=integer();pairs=[(integer(),integer()) for _ in range(count)]
  assert integer()==1 and integer()==-2
  integer();string();ct=integer();colors={}
  for _ in range(ct):
   integer();name=string();r,g,b,a=[integer() for _ in range(4)]
   colors[r+g*256+b*65536]=next((k for k,ns in REGIONS.items() if name in ns),'medial')
  return [colors.get(c,'medial') for _,c in pairs]

def sub(a,b):return tuple(x-y for x,y in zip(a,b))
def norm(a):return math.sqrt(sum(x*x for x in a))
paths=[];cores=[]
for side,short,sign in [('left','lh',-1),('right','rh',1)]:
 root=ET.fromstring(gzip.open(ROOT/f'assets/mind/pial_{side}.gii.gz').read())
 arrays=[]
 for a in root.findall('DataArray'):
  raw=zlib.decompress(base64.b64decode(a.findtext('Data')))
  arrays.append(list(struct.iter_unpack('<fff' if 'FLOAT' in a.attrib['DataType'] else '<iii',raw)))
 vertices=[(x/45,z/45,-y/45) for x,y,z in arrays[0]];faces=arrays[1]
 labels=annot(ROOT/f'assets/mind/{short}.aparc.a2009s.annot')
 adj=[set() for _ in vertices];normals=[[0.,0.,0.] for _ in vertices]
 for a,b,c in faces:
  adj[a].update([b,c]);adj[b].update([a,c]);adj[c].update([a,b])
  u=sub(vertices[b],vertices[a]);v=sub(vertices[c],vertices[a]);n=(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0])
  for i in [a,b,c]:
   for k in range(3):normals[i][k]+=n[k]
 lifted=[]
 for v,n in zip(vertices,normals):
  length=norm(n) or 1
  lifted.append([round(v[k]+n[k]/length*.028,5) for k in range(3)])
 # Two root trees on each hemisphere: anterior and posterior circulation motifs.
 for root_point in [(sign*1.25,-.12,-.25),(sign*.95,.1,1.35)]:
  start=min(range(len(vertices)),key=lambda i:norm(sub(vertices[i],root_point)))
  distances=[math.inf]*len(vertices);parents=[-1]*len(vertices);distances[start]=0;heap=[(0,start)]
  while heap:
   d,i=heapq.heappop(heap)
   if d!=distances[i]:continue
   for j in sorted(adj[i]):
    step=norm(sub(vertices[i],vertices[j]));nd=d+step
    if nd<distances[j]:distances[j]=nd;parents[j]=i;heapq.heappush(heap,(nd,j))
  candidates=[i for i,v in enumerate(vertices) if v[0]*sign>.45 and labels[i]!='medial' and distances[i]>1.0]
  # Farthest-point terminal spacing creates branches rather than uniform noise.
  rng=random.Random(42+int(root_point[2]*100));rng.shuffle(candidates);targets=[]
  for i in candidates:
   if all(norm(sub(vertices[i],vertices[j]))>.48 for j in targets):targets.append(i)
   if len(targets)==38:break
  counts=Counter()
  for i in targets:
   while parents[i]>=0:counts[i]+=1;i=parents[i]
  children=defaultdict(list)
  for i in counts:children[parents[i]].append(i)
  def walk(node):
   for child in children[node]:
    chain=[node,child];region=labels[child];current=child
    while len(children[current])==1 and labels[children[current][0]]==region:
     current=children[current][0];chain.append(current)
    if region!='medial':paths.append({'mesh':side+'-'+region,'radius':round(.006+.004*math.sqrt(counts[child]),4),'points':[lifted[k] for k in chain]})
    walk(current)
  walk(start)
 inset=[[round(v[k]-n[k]/(norm(n) or 1)*.11,5) for k in range(3)] for v,n in zip(vertices,normals)]
 cores.append({'side':side,'positions':[x for p in inset for x in p],'indices':[x for face in faces for x in face]})
(ROOT/'public/mind/vessels.json').write_text(json.dumps({'provenance':'Artistic surface-following trees; not measured vasculature.','paths':paths},separators=(',',':')))
(ROOT/'public/mind/cortex-core.json').write_text(json.dumps(cores,separators=(',',':')))
print(len(paths),'vascular branches;',sum(len(p['points']) for p in paths),'path vertices')
