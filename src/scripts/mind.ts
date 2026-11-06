import { animate } from 'motion';
import { readTheme, THEME_EVENT } from './theme';
import { mountMindCv } from './mind-cv';
mountMindCv();
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import cortexShader from '../shaders/cortex.glsl?raw';
import { FALLBACK_VITALS } from '../data/metrics';
import { healthStyle, cardiac, watchMindVitals } from './mind-health';
import { mindZones, cvRegionLabels } from '../data/mind';

async function init() {
 const canvas = document.querySelector<HTMLCanvasElement>('#mind-canvas')!;
 const status = document.querySelector<HTMLElement>('#scene-status')!;
 const renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
 const scene = new THREE.Scene();
 const camera = new THREE.PerspectiveCamera(36,1,.1,100);
 const modelCenter=new THREE.Vector3();
 let modelRadius=2.4;
 const fitDistance = () => modelRadius / Math.sin(Math.atan(Math.tan(THREE.MathUtils.degToRad(18)) * Math.min(1, canvas.clientWidth / canvas.clientHeight)));
 const home = () => { camera.position.set(9.0,2.8,-4.0).setLength(fitDistance()).add(modelCenter); controls.target.copy(modelCenter); controls.update(); };
 const controls = new OrbitControls(camera,canvas);
 controls.enableZoom=false;controls.enablePan=false;controls.enableDamping=true;controls.autoRotateSpeed=.35;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let paused=reduced.matches;
 const rotate=document.querySelector<HTMLButtonElement>('#rotate')!;
 function syncMotion(){controls.autoRotate=false;rotate.textContent=paused?'Resume':'Pause';rotate.setAttribute('aria-pressed',String(paused));}
 reduced.addEventListener('change',()=>{paused=reduced.matches;syncMotion();});
 rotate.addEventListener('click',()=>{paused=!paused;syncMotion();});
 document.querySelector('#reset')!.addEventListener('click',home);
 home();syncMotion();
 let vitals={...FALLBACK_VITALS};
 const style=healthStyle(vitals);
 const uniforms={uLight:{value:readTheme()==='light'?1:0},uRegionColor:{value:new THREE.Color(.4,.4,.4)},uSelection:{value:0},uTime:{value:0},uPulse:{value:0},uTone:{value:style.tone},uWash:{value:new THREE.Vector3().fromArray(style.wash)},uMiddle:{value:new THREE.Vector3().fromArray(style.middle)},uLow:{value:new THREE.Vector3().fromArray(style.low)},uHigh:{value:new THREE.Vector3().fromArray(style.high)},uResolution:{value:new THREE.Vector2(1,1)},uFocus:{value:new THREE.Vector3(...mindZones[0].position)},uColor:{value:new THREE.Color(mindZones[0].color)}};
 const stopVitals=watchMindVitals((next,cached)=>{
  vitals=next;
  const label=document.querySelector<HTMLElement>('#health-values')!;
  label.textContent=`HR ${Math.round(next.bpm)} · HRV ${Math.round(next.hrv)} · sleep ${next.sleepHours.toFixed(1)}h`;
  const source=document.querySelector<HTMLElement>('#health-source')!;
  source.textContent=next.source==='fallback'?'Fallback values':`${cached?'Cached':'optiHealth'}${next.asOf?' · '+next.asOf.slice(0,10):' · latest snapshot'}`;
  source.title=next.asOf??'Timestamp unavailable';
 });
 const onTheme=()=>{uniforms.uLight.value=readTheme()==='light'?1:0;};
 document.addEventListener(THEME_EVENT,onTheme);
 const backdrop=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({glslVersion:THREE.GLSL3,uniforms,depthTest:false,depthWrite:false,
  vertexShader:`void main(){gl_Position=vec4(position.xy,0.999,1.0);}`,
  fragmentShader:`precision highp float;precision highp int;uniform vec2 uResolution;uniform float uLight;uniform float uTime;uniform float uPulse;uniform float uTone;uniform vec3 uLow;uniform vec3 uHigh;out vec4 outColor;${cortexShader}void main(){vec2 uv=(2.0*gl_FragCoord.xy-uResolution)/uResolution.y;outColor=vec4(mix(neuralAtmosphere(uv,uTime,uPulse,uTone,uLow,uHigh),vec3(.965,.94,.932),uLight),1.0);}`
 }));backdrop.frustumCulled=false;backdrop.renderOrder=-10;scene.add(backdrop);
 const material=new THREE.ShaderMaterial({glslVersion:THREE.GLSL3,uniforms,side:THREE.DoubleSide,transparent:false,depthWrite:true,
 vertexShader:`out vec3 vP; out vec3 vLocalN; out vec3 vN; out vec3 vV; void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);vP=position;vLocalN=normal;vN=normalize(normalMatrix*normal);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}`,
 fragmentShader:`precision highp float; precision highp int; in vec3 vP; in vec3 vLocalN; in vec3 vN; in vec3 vV; uniform vec3 uRegionColor;uniform float uSelection;uniform float uTime; uniform float uPulse; uniform float uTone;uniform vec3 uLow;uniform vec3 uHigh;uniform vec3 uWash;uniform vec3 uMiddle; uniform vec3 uFocus; uniform vec3 uColor; out vec4 outColor; ${cortexShader}
 void main(){float focus=exp(-dot(vP-uFocus,vP-uFocus)*2.5);vec3 c=corticalLight(vP,normalize(vN),normalize(vV),uTime,uPulse,uTone,uLow,uHigh,uRegionColor,uSelection,uWash,uMiddle,normalize(vLocalN));c+=(corticalGrain(floor(gl_FragCoord.xy))-.5)*.065;outColor=vec4(clamp(c,0.0,1.0),1.0);}`});
 const regionalData=await fetch('/mind/regions.json').then(r=>{if(!r.ok)throw new Error('Regions unavailable');return r.json();});
 const gltf=await new GLTFLoader().loadAsync('/mind/mind.glb').catch(error=>{stopVitals();throw error;});
 const brain=gltf.scene;scene.add(brain);
 const bounds=new THREE.Box3().setFromObject(brain);bounds.getCenter(modelCenter);modelRadius=bounds.getBoundingSphere(new THREE.Sphere()).radius*.95;home();

 const regionMaterials: {region:string,material:THREE.ShaderMaterial,mesh:THREE.Mesh,base:THREE.Vector3,direction:THREE.Vector3}[]=[];
 let selectionAnimation: {stop:()=>void}|undefined;
 brain.updateMatrixWorld(true);
 brain.traverse(object=>{if(object instanceof THREE.Mesh){const original=object.material as THREE.MeshStandardMaterial;
 const surface=material.clone();surface.uniforms={...uniforms,uRegionColor:{value:new THREE.Color(mindZones.find(z=>z.id===object.userData.region)?.color ?? '#352a36')},uSelection:{value:0}};object.material=surface;
 const center=new THREE.Box3().setFromObject(object).getCenter(new THREE.Vector3());
 const direction=center.clone().sub(modelCenter).normalize();
 direction.x=object.name.startsWith('left-')?-Math.max(.65,Math.abs(direction.x)):Math.max(.65,Math.abs(direction.x));
 direction.normalize();
 regionMaterials.push({region:object.userData.region,material:surface,mesh:object,base:object.position.clone(),direction});
 }});
 // An intact inset cortex prevents the small region lift from exposing hollow cut faces.
 const coreResponse=await fetch('/mind/cortex-core.json');
 if(coreResponse.ok){
  const cores=await coreResponse.json() as {positions:number[];indices:number[]}[];
  for(const core of cores){
   const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(core.positions,3));geometry.setIndex(core.indices);geometry.computeVertexNormals();
   const innerMaterial=material.clone();innerMaterial.uniforms={...uniforms,uRegionColor:{value:new THREE.Color(.08,.025,.07)},uSelection:{value:0}};
   const inner=new THREE.Mesh(geometry,innerMaterial);inner.raycast=()=>{};brain.add(inner);
  }
 }
 const anchors=mindZones.map(z=>new THREE.Vector3().fromArray(regionalData.anchors[z.id] ?? z.position));
 const buttons=mindZones.map((z,i)=>{const b=document.createElement('button');b.textContent=z.number;b.title=`${z.area}: ${cvRegionLabels[z.id]}`;b.setAttribute('aria-label',b.title);b.style.setProperty('--zone',z.color);b.style.borderColor=z.color;b.addEventListener('click',()=>document.dispatchEvent(new CustomEvent('mind:open',{detail:i})));document.querySelector('#hotspots')!.append(b);return b;});
 function select(i:number|null){
  selectionAnimation?.stop();
  const starts=regionMaterials.map(entry=>entry.mesh.position.clone());
  const targets=regionMaterials.map(entry=>{
   const interactive=mindZones.some(z=>z.id===entry.region);
   const amount=interactive?(i!==null&&entry.region===mindZones[i].id?(entry.mesh.name.startsWith('right-')?0.20:0.06):0):0;
   return entry.base.clone().addScaledVector(entry.direction,amount);
  });
  const move=(progress:number)=>{regionMaterials.forEach((entry,index)=>entry.mesh.position.lerpVectors(starts[index],targets[index],progress));brain.updateMatrixWorld(true);};
  if(reduced.matches)move(1);else selectionAnimation=animate(0,1,{duration:0.28,ease:[0.77,0,0.175,1],onUpdate:move});
  regionMaterials.forEach(entry=>{entry.material.uniforms.uSelection.value=i!==null&&entry.region===mindZones[i].id?1:0;});
  buttons.forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));
  if(i!==null){const z=mindZones[i];uniforms.uFocus.value.copy(anchors[i]);uniforms.uColor.value.set(z.color);}
 }
 document.addEventListener('mind:region',((e:CustomEvent<number|null>)=>select(e.detail)) as EventListener);
 // A short tap picks the actual labelled mesh; drags only orbit.
 const raycaster=new THREE.Raycaster();
 let press: {x:number;y:number}|null=null;
 canvas.addEventListener('pointerdown',e=>{press={x:e.clientX,y:e.clientY};});
 canvas.addEventListener('pointercancel',()=>{press=null;});
 canvas.addEventListener('pointerup',e=>{
  if(!press)return;const distance=Math.hypot(e.clientX-press.x,e.clientY-press.y);press=null;if(distance>7)return;
  const rect=canvas.getBoundingClientRect();
  raycaster.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2),camera);
  const hit=raycaster.intersectObject(brain,true)[0];if(!hit)return;
  const region=hit.object.userData.region;
  const index=mindZones.findIndex(z=>z.id===region);
  if(index>=0)document.dispatchEvent(new CustomEvent('mind:open',{detail:index}));
 });
 const initialZone=mindZones.findIndex(z=>z.id===document.body.dataset.activeRegion);select(initialZone<0?null:initialZone);
 function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);uniforms.uResolution.value.set(canvas.width,canvas.height);camera.aspect=w/h;camera.position.sub(controls.target).setLength(fitDistance()).add(controls.target);camera.updateProjectionMatrix();}
 new ResizeObserver(resize).observe(canvas);resize();status.hidden=true;
 let visible=true;new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;}).observe(canvas);
 let last=0,time=0,phaseTime=0;
 let bpm=vitals.bpm,hrv=vitals.hrv,sleep=vitals.sleepHours;
 const trace=document.querySelector('#eeg-trace')!;
 let lastTrace=0;
 renderer.setAnimationLoop((now)=>{const elapsedDt=last?Math.min((now-last)/1000,1):0;const dt=Math.min(elapsedDt,.05);last=now;if(document.hidden||!visible)return;const ease=1-Math.exp(-dt*2);bpm+=(vitals.bpm-bpm)*ease;hrv+=(vitals.hrv-hrv)*ease;sleep+=(vitals.sleepHours-sleep)*ease;
  if(!paused){time+=elapsedDt;phaseTime+=elapsedDt*bpm/60;}
  const health=healthStyle({...vitals,bpm,hrv,sleepHours:sleep},uniforms.uLight.value>.5?'light':'dark');
  uniforms.uTime.value=time;uniforms.uPulse.value=paused?0:cardiac(phaseTime%1);
  // Heartbeat modulates light only. Geometry and labels stay still between selections.
  brain.updateMatrixWorld(true);uniforms.uTone.value=health.tone;
  uniforms.uWash.value.fromArray(health.wash);uniforms.uMiddle.value.fromArray(health.middle);
  uniforms.uLow.value.fromArray(health.low);uniforms.uHigh.value.fromArray(health.high);
  if(now-lastTrace>50){lastTrace=now;let d='';for(let x=0;x<=320;x+=2){const t=x*.045-time;const amplitude=5+health.tone*5;const y=20+amplitude*(Math.sin(t*(2.2+health.rest*.4))*.6+Math.sin(t*7.3+Math.sin(t*.7))*.24+Math.sin(t*13.1)*(.08+.1*health.tone))+uniforms.uPulse.value*2*Math.sin(x*.04);d+=`${x===0?'M':'L'}${x} ${y.toFixed(2)} `;}trace.setAttribute('d',d);}
  controls.update(dt);camera.updateMatrixWorld();
  anchors.forEach((p,i)=>{const part=regionMaterials.find(entry=>entry.region===mindZones[i].id&&entry.mesh.name.startsWith('right-'));
 const shifted=p.clone();if(part)shifted.add(part.mesh.position).sub(part.base);const v=brain.localToWorld(shifted).project(camera);buttons[i].style.left=`${(v.x*.5+.5)*canvas.clientWidth}px`;buttons[i].style.top=`${(-v.y*.5+.5)*canvas.clientHeight}px`;buttons[i].style.transform='translate(-50%,-50%)';buttons[i].hidden=Math.abs(v.z)>1;});renderer.render(scene,camera);
 });
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();renderer.setAnimationLoop(null);status.hidden=false;status.textContent='3D paused. All projects are available below.';});
 window.addEventListener('pagehide',()=>{selectionAnimation?.stop();stopVitals();document.removeEventListener(THEME_EVENT,onTheme);renderer.setAnimationLoop(null);controls.dispose();renderer.dispose();},{once:true});
}
init().catch(error=>{console.error('[inner-world]',error);const status=document.querySelector<HTMLElement>('#scene-status')!;status.textContent='3D unavailable. Explore every project below.';});
