import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/GLTFLoader.js';

const canvas = document.querySelector('#brain-canvas');
if (!(canvas instanceof HTMLCanvasElement)) throw new Error('Brain canvas missing');

const projects = [
  { id: 'sensorlm', zone: 'CORPUS CALLOSUM', title: 'Sensor Language Models', text: 'Raw biosensor time-series into language. A from-scratch temporal encoder built on the optiHealth data stream.' },
  { id: 'optihealth', zone: 'MOTOR CORTEX', title: 'optiHealth', text: 'A personal biometric vector database: sleep, EEG, HRV and glucose in one N-of-1 telemetry engine.' },
  { id: 'dreamwalker', zone: 'VISUAL CORTEX', title: 'Dream Walker', text: 'A shared dream mystery run by local reasoning agents. One server, one dream, one secret.' },
  { id: 'minebit', zone: 'PREFRONTAL CORTEX', title: 'MineBit', text: 'Voxel builds as NFTs on TON: Minestom, Go bridge, FunC contracts and a Telegram Web App.' },
  { id: 'sailfish', zone: 'BRAINSTEM', title: 'SailfishOS on ARM', text: 'A complete GNU/Linux port to Android hardware through libhybris. 2,000+ downloads and a 200-user community.' },
  { id: 'audio', zone: 'AUDITORY CORTEX', title: 'Zero-interference audio', text: 'PostmarketOS, custom kernels and a clean digital audio path — the physical runtime underneath the ideas.' },
];

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x080512, 0.075);
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
camera.position.set(4.15, -5.2, 2.55);
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.1, 0.25); controls.enableDamping = true; controls.dampingFactor = 0.05; controls.minDistance = 3.0; controls.maxDistance = 8.2; controls.autoRotate = true; controls.autoRotateSpeed = 0.28;

scene.add(new THREE.AmbientLight(0x5a2e75, 1.7));
const key = new THREE.PointLight(0xffb357, 90, 8, 2); key.position.set(-2.5, -3.0, 4.0); scene.add(key);
const rim = new THREE.PointLight(0x514cff, 120, 7, 2); rim.position.set(3, 2, 1); scene.add(rim);

const brainRoot = new THREE.Group(); scene.add(brainRoot);
const nodeGroup = new THREE.Group(); scene.add(nodeGroup);
const loader = new GLTFLoader();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let selectedNode = null;
let started = performance.now();
let pulse = 0;

const neuralVertex = `
varying float vEnergy;
uniform float uTime;
uniform float uPulse;
void main() {
  vec3 p = position;
  float wave = sin(p.x * 3.0 + uTime * 1.7) * 0.055 + sin(p.y * 4.0 - uTime * 1.2) * 0.035;
  p += normalize(p + vec3(0.001)) * (wave + uPulse * 0.06);
  vEnergy = 0.35 + 0.65 * (0.5 + 0.5 * sin(p.z * 3.0 + uTime * 2.0));
  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = (1.0 + 1.8 * vEnergy) * (150.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}`;
const neuralFragment = `
varying float vEnergy;
uniform float uPulse;
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float soft = smoothstep(0.5, 0.0, d);
  vec3 cold = vec3(0.18, 0.36, 1.0);
  vec3 hot = vec3(1.0, 0.34, 0.42);
  vec3 color = mix(cold, hot, clamp(vEnergy * 0.72 + uPulse * 0.45, 0.0, 1.0));
  gl_FragColor = vec4(color, soft * (0.055 + vEnergy * 0.10));
}`;

function makeNeuralField() {
  const count = 1100; const positions = new Float32Array(count * 3);
  let seed = 9137;
  const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < count; i++) {
    const t = random() * Math.PI * 2;
    const r = Math.pow(random(), 0.45);
    const shell = 1.0 + r * 1.8;
    positions[i * 3] = Math.cos(t) * shell * (0.7 + random() * 0.55);
    positions[i * 3 + 1] = Math.sin(t) * shell * 1.14;
    positions[i * 3 + 2] = (random() - 0.5) * 2.5 + Math.sin(t * 3.0) * 0.28;
  }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.ShaderMaterial({ vertexShader: neuralVertex, fragmentShader: neuralFragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: { value: 0 }, uPulse: { value: 0 } } });
  const points = new THREE.Points(geometry, material); points.scale.setScalar(0.88); scene.add(points); return material;
}
const neuralMaterial = makeNeuralField();

function showProject(id) {
  const project = projects.find((item) => item.id === id); if (!project) return;
  document.querySelector('#card-zone').textContent = project.zone;
  document.querySelector('#card-title').textContent = project.title;
  document.querySelector('#card-text').textContent = project.text;
  document.querySelector('#project-card').hidden = false;
}
document.querySelector('#close-card')?.addEventListener('click', () => { document.querySelector('#project-card').hidden = true; selectedNode = null; });

loader.load('/brain/brain-atlas.glb', (gltf) => {
  try {
    const importedScene = gltf?.scene ?? gltf?.scenes?.[0];
    if (!importedScene || typeof importedScene.traverse !== 'function') { console.error('[brain-atlas] GLB has no traversable scene'); return; }
    importedScene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = true; object.receiveShadow = true;
      if (object.name.startsWith('node-')) {
        object.userData.projectId = object.name.replace('node-', '');
        nodeGroup.add(object);
      } else brainRoot.add(object);
    });
    brainRoot.add(nodeGroup);
    brainRoot.scale.setScalar(1.02);
  } catch (error) {
    console.error('[brain-atlas] scene assembly failed', error);
  }
}, undefined, (error) => console.error('[brain-atlas] GLB failed to load', error));

function resize() { const width = canvas.clientWidth; const height = canvas.clientHeight; if (!width || !height) return; renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); }
window.addEventListener('resize', resize, { passive: true });
canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect(); pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1; pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera); const hits = raycaster.intersectObjects(nodeGroup.children, true); const target = hits[0]?.object;
  if (target?.userData.projectId) { selectedNode = target; controls.autoRotate = false; showProject(target.userData.projectId); }
});

function animate(now) {
  const elapsed = (now - started) / 1000;
  pulse = 0.5 + 0.5 * Math.sin(elapsed * 2.0);
  neuralMaterial.uniforms.uTime.value = elapsed; neuralMaterial.uniforms.uPulse.value = pulse;
  nodeGroup.children.forEach((node, index) => { const s = 1.0 + pulse * 0.22 + Math.sin(elapsed * 1.8 + index) * 0.06; node.scale.setScalar(s); });
  controls.update(); renderer.render(scene, camera); requestAnimationFrame(animate);
}
resize(); requestAnimationFrame(animate);
