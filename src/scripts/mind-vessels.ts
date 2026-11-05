import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

type Path = {mesh:string;radius:number;points:number[][]};
type Flow = {samples:Float32Array;length:number;phase:number};
type Shared = Record<string, THREE.IUniform>;

/** Artistic vessels follow the source cortical surface and move with each atlas parcel. */
export async function mountVessels(brain:THREE.Object3D, uniforms:Shared) {
 const response=await fetch('/mind/vessels.json');
 if(!response.ok)throw new Error('Vascular geometry unavailable');
 const data=await response.json() as {paths:Path[]};
 const groups=new Map<string,Path[]>();
 for(const path of data.paths){const group=groups.get(path.mesh)??[];group.push(path);groups.set(path.mesh,group);}
 const vesselMaterial=new THREE.ShaderMaterial({glslVersion:THREE.GLSL3,uniforms,transparent:true,depthWrite:false,
  vertexShader:`out vec3 vN;out vec3 vView;void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);vN=normalize(normalMatrix*normal);vView=-mv.xyz;gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`in vec3 vN;in vec3 vView;uniform vec3 uHigh;uniform float uPulse;out vec4 outColor;void main(){float facing=abs(dot(normalize(vN),normalize(vView)));float shine=pow(facing,3.0);vec3 color=vec3(.32,.035,.16)+uHigh*(.18+shine*.42+uPulse*.5);outColor=vec4(color,.9);}`,
 });
 const particleMaterial=new THREE.ShaderMaterial({glslVersion:THREE.GLSL3,uniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  vertexShader:`uniform float uPulse;out float energy;void main(){vec4 p=modelViewMatrix*vec4(position,1.0);energy=.65+uPulse*.35;gl_Position=projectionMatrix*p;gl_PointSize=clamp(48.0/max(1.0,-p.z),3.0,10.0);}`,
  fragmentShader:`in float energy;uniform vec3 uHigh;out vec4 outColor;void main(){float r=length(gl_PointCoord-.5);float core=exp(-r*r*75.0);float halo=exp(-r*r*18.0);vec3 c=mix(vec3(.9,.32,.55),uHigh,.7)+vec3(core*.7);outColor=vec4(c,halo*energy);}`,
 });
 const batches:{attribute:THREE.BufferAttribute;flows:Flow[]}[]=[];
 const geometries:THREE.BufferGeometry[]=[];
 let seed=119;
 const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 for(const [name,paths] of groups){
  const parent=brain.getObjectByName(name);if(!parent)continue;
  const tubes:THREE.BufferGeometry[]=[];const flows:Flow[]=[];
  for(const path of paths){
   if(path.points.length<2)continue;
   const curve=new THREE.CatmullRomCurve3(path.points.map(p=>new THREE.Vector3().fromArray(p)),false,'centripetal');
   const length=curve.getLength();if(length<.008)continue;
   tubes.push(new THREE.TubeGeometry(curve,Math.max(4,Math.min(64,path.points.length*2)),path.radius,5,false));
   const samples=new Float32Array(65*3);
   curve.getSpacedPoints(64).forEach((p,i)=>{samples[i*3]=p.x;samples[i*3+1]=p.y;samples[i*3+2]=p.z;});
   const count=Math.max(1,Math.min(18,Math.ceil(length/.085)));
   for(let i=0;i<count;i++)flows.push({samples,length,phase:(i+random()*.5)/count});
  }
  const merged=mergeGeometries(tubes);tubes.forEach(g=>g.dispose());
  if(merged){const vessel=new THREE.Mesh(merged,vesselMaterial);vessel.name=`vessels-${name}`;vessel.raycast=()=>{};parent.add(vessel);geometries.push(merged);}
  const geometry=new THREE.BufferGeometry();
  const attribute=new THREE.BufferAttribute(new Float32Array(flows.length*3),3).setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute('position',attribute);
  const particles=new THREE.Points(geometry,particleMaterial);particles.name=`blood-flow-${name}`;particles.raycast=()=>{};particles.frustumCulled=false;parent.add(particles);
  batches.push({attribute,flows});geometries.push(geometry);
 }
 function update(beatTime:number,tone:number){
  for(const {attribute,flows} of batches){
   for(let i=0;i<flows.length;i++){
    const flow=flows[i];const t=((beatTime*(.16+tone*.1)/flow.length+flow.phase)%1)*64;
    const a=Math.floor(t),b=Math.min(64,a+1),f=t-a,p=flow.samples;
    attribute.setXYZ(i,p[a*3]+(p[b*3]-p[a*3])*f,p[a*3+1]+(p[b*3+1]-p[a*3+1])*f,p[a*3+2]+(p[b*3+2]-p[a*3+2])*f);
   }
   attribute.needsUpdate=true;
  }
 }
 update(0,.5);
 return {update,particleCount:batches.reduce((n,b)=>n+b.flows.length,0),dispose(){geometries.forEach(g=>g.dispose());vesselMaterial.dispose();particleMaterial.dispose();}};
}
