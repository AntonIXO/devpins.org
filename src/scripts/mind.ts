import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import cortexShader from '../shaders/cortex.glsl?raw';
import { FALLBACK_VITALS } from '../data/metrics';
import { healthStyle, cardiac, watchMindVitals } from './mind-health';
import { mindZones } from '../data/mind';

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
 const home = () => { camera.position.set(4.5,2.1,4.9).setLength(fitDistance()).add(modelCenter); controls.target.copy(modelCenter); controls.update(); };
 const controls = new OrbitControls(camera,canvas);
 controls.enableZoom=false;controls.enablePan=false;controls.enableDamping=true;controls.autoRotateSpeed=.35;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let paused=reduced.matches;
 const rotate=document.querySelector<HTMLButtonElement>('#rotate')!;
 function syncMotion(){controls.autoRotate=!paused;rotate.textContent=paused?'Resume':'Pause';rotate.setAttribute('aria-pressed',String(paused));}
 reduced.addEventListener('change',()=>{paused=reduced.matches;syncMotion();});
 rotate.addEventListener('click',()=>{paused=!paused;syncMotion();});
 controls.addEventListener('start',()=>{paused=true;syncMotion();});
 document.querySelector('#reset')!.addEventListener('click',home);
 home();syncMotion();
 let vitals={...FALLBACK_VITALS};
 const style=healthStyle(vitals);
 const uniforms={uTime:{value:0},uPulse:{value:0},uTone:{value:style.tone},uLow:{value:new THREE.Vector3().fromArray(style.low)},uHigh:{value:new THREE.Vector3().fromArray(style.high)},uResolution:{value:new THREE.Vector2(1,1)},uFocus:{value:new THREE.Vector3(...mindZones[0].position)},uColor:{value:new THREE.Color(mindZones[0].color)}};
 const stopVitals=watchMindVitals((next,cached)=>{
  vitals=next;
  const label=document.querySelector<HTMLElement>('#health-values')!;
  label.textContent=`HR ${Math.round(next.bpm)} · HRV ${Math.round(next.hrv)} · sleep ${next.sleepHours.toFixed(1)}h`;
  const source=document.querySelector<HTMLElement>('#health-source')!;
  source.textContent=next.source==='fallback'?'Fallback values':`${cached?'Cached':'optiHealth'}${next.asOf?' · '+next.asOf.slice(0,10):' · latest snapshot'}`;
  source.title=next.asOf??'Timestamp unavailable';
 });
 const backdrop=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({glslVersion:THREE.GLSL3,uniforms,depthTest:false,depthWrite:false,
  vertexShader:`void main(){gl_Position=vec4(position.xy,0.999,1.0);}`,
  fragmentShader:`precision highp float;precision highp int;uniform vec2 uResolution;uniform float uTime;uniform float uPulse;uniform float uTone;uniform vec3 uLow;uniform vec3 uHigh;out vec4 outColor;${cortexShader}void main(){vec2 uv=(2.0*gl_FragCoord.xy-uResolution)/uResolution.y;outColor=vec4(neuralAtmosphere(uv,uTime,uPulse,uTone,uLow,uHigh),1.0);}`
 }));backdrop.frustumCulled=false;backdrop.renderOrder=-10;scene.add(backdrop);
 const material=new THREE.ShaderMaterial({glslVersion:THREE.GLSL3,uniforms,transparent:true,depthWrite:true,
 vertexShader:`out vec3 vP; out vec3 vN; out vec3 vV; void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);vP=(modelMatrix*vec4(position,1.0)).xyz;vN=normalize(normalMatrix*normal);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}`,
 fragmentShader:`precision highp float; precision highp int; in vec3 vP; in vec3 vN; in vec3 vV; uniform float uTime; uniform float uPulse; uniform float uTone;uniform vec3 uLow;uniform vec3 uHigh; uniform vec3 uFocus; uniform vec3 uColor; out vec4 outColor; ${cortexShader}
 void main(){float focus=exp(-dot(vP-uFocus,vP-uFocus)*2.5);vec3 c=corticalLight(vP,normalize(vN),normalize(vV),uTime,uPulse,uTone,uLow,uHigh);c+=uColor*focus*.08;outColor=vec4(c,.88);}`});
 const gltf=await new GLTFLoader().loadAsync('/mind/mind.glb').catch(error=>{stopVitals();throw error;});
 const brain=gltf.scene;scene.add(brain);
 const bounds=new THREE.Box3().setFromObject(brain);bounds.getCenter(modelCenter);modelRadius=bounds.getBoundingSphere(new THREE.Sphere()).radius*.95;home();
 const allPoints:number[]=[];
 brain.updateMatrixWorld(true);
 brain.traverse(object=>{if(object instanceof THREE.Mesh){object.material=material; const a=object.geometry.getAttribute('position');for(let i=0;i<a.count;i+=2){const v=new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(object.matrixWorld);allPoints.push(v.x,v.y,v.z);}}});
 const pointsGeo=new THREE.BufferGeometry();pointsGeo.setAttribute('position',new THREE.Float32BufferAttribute(allPoints,3));
 const pointsMat=new THREE.ShaderMaterial({glslVersion:THREE.GLSL3,uniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
 vertexShader:`uniform float uTime;uniform float uPulse;uniform float uTone;out float energy;void main(){energy=.2+uPulse*.35+(.3+uTone*.3)*pow(.5+.5*sin(position.y*8.0+position.z*4.0-uTime*1.4),6.0);vec4 p=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*p;gl_PointSize=min(5.0,(10.0+energy*15.0)/max(.1,-p.z));}`,
 fragmentShader:`in float energy;out vec4 outColor;void main(){float d=length(gl_PointCoord-.5);float a=1.0-smoothstep(.1,.5,d);outColor=vec4(mix(vec3(.48,.1,.36),vec3(1.0,.78,.42),energy),a*(.25+energy*.6));}`});
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
 vertexShader:`in float phase;uniform float uTime;uniform float uPulse;uniform float uTone;out float vE;void main(){vE=uPulse*.25+pow(1.0-fract(phase-uTime*(.08+uTone*.14)),9.0);vec4 p=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*p;gl_PointSize=(6.0+vE*22.0)/max(.1,-p.z);}`,
 fragmentShader:`in float vE;out vec4 outColor;void main(){float a=1.0-smoothstep(.05,.5,length(gl_PointCoord-.5));outColor=vec4(vec3(.9,.63,.3),a*(.1+vE*.9));}`});
 scene.add(new THREE.Points(tractGeo,tractMat));
 const buttons=mindZones.map((z,i)=>{const b=document.createElement('button');b.textContent=z.number;b.title=`${z.area}: ${z.project}`;b.setAttribute('aria-label',b.title);b.style.setProperty('--zone',z.color);b.addEventListener('click',()=>select(i));document.querySelector('#hotspots')!.append(b);return b;});
 function select(i:number){document.querySelector<HTMLElement>('#detail')!.hidden=false;const z=mindZones[i];uniforms.uFocus.value.copy(anchors[i]);uniforms.uColor.value.set(z.color);
  document.querySelectorAll<HTMLButtonElement>('[data-zone]').forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));buttons.forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));
  document.querySelector<HTMLElement>('#detail')!.style.setProperty('--accent',z.color);
  document.querySelector('#detail-area')!.textContent=`${z.number} / ${z.area}`;document.querySelector('#detail-title')!.textContent=z.project;document.querySelector('#detail-status')!.textContent=z.status;
  const link=document.querySelector<HTMLAnchorElement>('#detail-link')!;link.href=z.href;link.textContent=`${z.action} ↗`;
 }
 document.querySelectorAll<HTMLButtonElement>('[data-zone]').forEach(b=>b.addEventListener('click',()=>select(Number(b.dataset.zone))));
 document.querySelector('#close-detail')!.addEventListener('click',()=>{document.querySelector<HTMLElement>('#detail')!.hidden=true;document.querySelectorAll('[aria-pressed][data-zone],#hotspots button').forEach(b=>b.setAttribute('aria-pressed','false'));});
 function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);uniforms.uResolution.value.set(canvas.width,canvas.height);camera.aspect=w/h;camera.position.sub(controls.target).setLength(fitDistance()).add(controls.target);camera.updateProjectionMatrix();}
 new ResizeObserver(resize).observe(canvas);resize();status.hidden=true;
 let visible=true;new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;}).observe(canvas);
 let last=0,time=0,phaseTime=0;
 let bpm=vitals.bpm,hrv=vitals.hrv,sleep=vitals.sleepHours;
 const trace=document.querySelector('#eeg-trace')!;
 let lastTrace=0;
 renderer.setAnimationLoop((now)=>{const dt=Math.min((now-last)/1000,.05);last=now;if(document.hidden||!visible)return;const ease=1-Math.exp(-dt*2);bpm+=(vitals.bpm-bpm)*ease;hrv+=(vitals.hrv-hrv)*ease;sleep+=(vitals.sleepHours-sleep)*ease;
  if(!paused){time+=dt;phaseTime+=dt*bpm/60;}
  const health=healthStyle({...vitals,bpm,hrv,sleepHours:sleep});
  uniforms.uTime.value=time;uniforms.uPulse.value=paused?0:cardiac(phaseTime%1);uniforms.uTone.value=health.tone;
  uniforms.uLow.value.fromArray(health.low);uniforms.uHigh.value.fromArray(health.high);
  if(now-lastTrace>50){lastTrace=now;let d='';for(let x=0;x<=320;x+=2){const t=x*.045-time;const amplitude=5+health.tone*5;const y=20+amplitude*(Math.sin(t*(2.2+health.rest*.4))*.6+Math.sin(t*7.3+Math.sin(t*.7))*.24+Math.sin(t*13.1)*(.08+.1*health.tone))+uniforms.uPulse.value*2*Math.sin(x*.04);d+=`${x===0?'M':'L'}${x} ${y.toFixed(2)} `;}trace.setAttribute('d',d);}
  controls.update(dt);camera.updateMatrixWorld();
  anchors.forEach((p,i)=>{const v=p.clone().project(camera);buttons[i].style.left=`${(v.x*.5+.5)*canvas.clientWidth}px`;buttons[i].style.top=`${(-v.y*.5+.5)*canvas.clientHeight}px`;buttons[i].style.transform='translate(-50%,-50%)';buttons[i].hidden=Math.abs(v.z)>1;});renderer.render(scene,camera);
 });
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();renderer.setAnimationLoop(null);status.hidden=false;status.textContent='3D paused. All projects are available below.';});
 window.addEventListener('pagehide',()=>{stopVitals();renderer.setAnimationLoop(null);controls.dispose();renderer.dispose();},{once:true});
}
init().catch(error=>{console.error('[inner-world]',error);const status=document.querySelector<HTMLElement>('#scene-status')!;status.textContent='3D unavailable. Explore every project below.';});
