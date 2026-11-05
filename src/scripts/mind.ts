import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import cortexShader from '../shaders/cortex.glsl?raw';
import { mindZones } from '../data/mind';

async function init() {
 const canvas = document.querySelector<HTMLCanvasElement>('#mind-canvas')!;
 const status = document.querySelector<HTMLElement>('#scene-status')!;
 const renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
 const scene = new THREE.Scene();
 const camera = new THREE.PerspectiveCamera(36,1,.1,100);
 const narrow = () => innerWidth < 900;
 const home = () => { camera.position.set(6.4,3.0,6.8); if(narrow()) camera.position.multiplyScalar(1.2); controls.target.set(0,0,0); controls.update(); };
 const controls = new OrbitControls(camera,canvas);
 controls.enableZoom=false;controls.enablePan=false;controls.enableDamping=true;controls.autoRotateSpeed=.35;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let paused=reduced.matches;
 const rotate=document.querySelector<HTMLButtonElement>('#rotate')!;
 function syncMotion(){controls.autoRotate=!paused;rotate.textContent=paused?'Resume motion':'Pause motion';rotate.setAttribute('aria-pressed',String(paused));}
 reduced.addEventListener('change',()=>{paused=reduced.matches;syncMotion();});
 rotate.addEventListener('click',()=>{paused=!paused;syncMotion();});
 controls.addEventListener('start',()=>{paused=true;syncMotion();});
 document.querySelector('#reset')!.addEventListener('click',home);
 home();syncMotion();
 const uniforms={uTime:{value:0},uFocus:{value:new THREE.Vector3(...mindZones[0].position)},uColor:{value:new THREE.Color(mindZones[0].color)}};
 const material=new THREE.ShaderMaterial({glslVersion:THREE.GLSL3,uniforms,transparent:true,depthWrite:true,
 vertexShader:`out vec3 vP; out vec3 vN; out vec3 vV; void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);vP=(modelMatrix*vec4(position,1.0)).xyz;vN=normalize(normalMatrix*normal);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}`,
 fragmentShader:`precision highp float; precision highp int; in vec3 vP; in vec3 vN; in vec3 vV; uniform float uTime; uniform vec3 uFocus; uniform vec3 uColor; out vec4 outColor; ${cortexShader}
 void main(){float focus=exp(-dot(vP-uFocus,vP-uFocus)*2.5);vec3 c=corticalLight(vP,normalize(vN),normalize(vV),uTime,0.0);c+=uColor*focus*.45;outColor=vec4(c,.88);}`});
 const gltf=await new GLTFLoader().loadAsync('/mind/mind.glb');
 const brain=gltf.scene;scene.add(brain);
 const allPoints:number[]=[];
 brain.updateMatrixWorld(true);
 brain.traverse(object=>{if(object instanceof THREE.Mesh){object.material=material; const a=object.geometry.getAttribute('position');for(let i=0;i<a.count;i+=2){const v=new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(object.matrixWorld);allPoints.push(v.x,v.y,v.z);}}});
 const pointsGeo=new THREE.BufferGeometry();pointsGeo.setAttribute('position',new THREE.Float32BufferAttribute(allPoints,3));
 const pointsMat=new THREE.ShaderMaterial({glslVersion:THREE.GLSL3,uniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
 vertexShader:`uniform float uTime;out float energy;void main(){energy=.25+.75*pow(.5+.5*sin(position.y*8.0+position.z*4.0-uTime*1.4),6.0);vec4 p=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*p;gl_PointSize=min(5.0,(10.0+energy*15.0)/max(.1,-p.z));}`,
 fragmentShader:`in float energy;out vec4 outColor;void main(){float d=length(gl_PointCoord-.5);float a=1.0-smoothstep(.1,.5,d);outColor=vec4(mix(vec3(.22,.6,.55),vec3(1.0,.72,.35),energy),a*(.25+energy*.6));}`});
 scene.add(new THREE.Points(pointsGeo,pointsMat));
 // Procedural communication paths; artistic connections, not tractography data.
 const tracks:number[]=[];const phase:number[]=[];
 const anchors=mindZones.map(z=>new THREE.Vector3(...z.position));
 for(let j=0;j<anchors.length;j++)for(let k=j+1;k<anchors.length;k++){
  const a=anchors[j],b=anchors[k],mid=a.clone().add(b).multiplyScalar(.35);mid.x+=.15*Math.sin(j*4+k);
  const curve=new THREE.QuadraticBezierCurve3(a,mid,b);
  for(let i=0;i<100;i++){const p=curve.getPoint(i/99);tracks.push(p.x,p.y,p.z);phase.push(i/99+j*.17);}
 }
 const tractGeo=new THREE.BufferGeometry();tractGeo.setAttribute('position',new THREE.Float32BufferAttribute(tracks,3));tractGeo.setAttribute('phase',new THREE.Float32BufferAttribute(phase,1));
 const tractMat=new THREE.ShaderMaterial({glslVersion:THREE.GLSL3,uniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
 vertexShader:`in float phase;uniform float uTime;out float vE;void main(){vE=pow(1.0-fract(phase-uTime*.16),9.0);vec4 p=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*p;gl_PointSize=(6.0+vE*22.0)/max(.1,-p.z);}`,
 fragmentShader:`in float vE;out vec4 outColor;void main(){float a=1.0-smoothstep(.05,.5,length(gl_PointCoord-.5));outColor=vec4(vec3(.9,.63,.3),a*(.1+vE*.9));}`});
 scene.add(new THREE.Points(tractGeo,tractMat));
 const buttons=mindZones.map((z,i)=>{const b=document.createElement('button');b.textContent=z.number;b.title=`${z.area}: ${z.project}`;b.setAttribute('aria-label',b.title);b.style.setProperty('--zone',z.color);b.addEventListener('click',()=>select(i));document.querySelector('#hotspots')!.append(b);return b;});
 function select(i:number){const z=mindZones[i];uniforms.uFocus.value.copy(anchors[i]);uniforms.uColor.value.set(z.color);
  document.querySelectorAll<HTMLButtonElement>('[data-zone]').forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));buttons.forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));
  document.querySelector<HTMLElement>('#detail')!.style.setProperty('--accent',z.color);
  document.querySelector('#detail-area')!.textContent=`${z.number} / ${z.area}`;document.querySelector('#detail-title')!.textContent=z.project;document.querySelector('#detail-text')!.textContent=z.text;document.querySelector('#detail-status')!.textContent=z.status;
  const link=document.querySelector<HTMLAnchorElement>('#detail-link')!;link.href=z.href;link.textContent=`${z.action} ↗`;
 }
 document.querySelectorAll<HTMLButtonElement>('[data-zone]').forEach(b=>b.addEventListener('click',()=>select(Number(b.dataset.zone))));select(0);
 function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
 new ResizeObserver(resize).observe(canvas);resize();status.hidden=true;
 let visible=true;new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;}).observe(canvas);
 let last=0,time=0;
 renderer.setAnimationLoop((now)=>{const dt=Math.min((now-last)/1000,.05);last=now;if(document.hidden||!visible)return;if(!paused)time+=dt;uniforms.uTime.value=time;controls.update(dt);camera.updateMatrixWorld();
  anchors.forEach((p,i)=>{const v=p.clone().project(camera);buttons[i].style.left=`${(v.x*.5+.5)*canvas.clientWidth}px`;buttons[i].style.top=`${(-v.y*.5+.5)*canvas.clientHeight}px`;buttons[i].style.transform='translate(-50%,-50%)';buttons[i].hidden=Math.abs(v.z)>1;});renderer.render(scene,camera);
 });
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();renderer.setAnimationLoop(null);status.hidden=false;status.textContent='3D paused. All projects are available below.';});
 window.addEventListener('pagehide',()=>{renderer.setAnimationLoop(null);controls.dispose();renderer.dispose();},{once:true});
}
init().catch(error=>{console.error('[inner-world]',error);const status=document.querySelector<HTMLElement>('#scene-status')!;status.textContent='3D unavailable. Explore every project below.';});
