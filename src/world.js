import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { glitchAt } from './glitch.js';

const FPS = 24;
// Light level by frame: 1 = original Blender brightness, 0 = dimmed.
// Original at the desk, dimmed from the glitch cut through the street ride, original again
// from the bike stop (return) through Experience and Contact. Edit these numbers to taste.
const LIGHT_KEYS = [[1, 1], [132, 1], [146, 0], [1500, 0], [1640, 1], [2040, 1]];
function lightMix(f) {
  if (f <= LIGHT_KEYS[0][0]) return LIGHT_KEYS[0][1];
  for (let i = 1; i < LIGHT_KEYS.length; i++) {
    const [f1, v1] = LIGHT_KEYS[i];
    if (f <= f1) {
      const [f0, v0] = LIGHT_KEYS[i - 1];
      const t = (f - f0) / (f1 - f0);
      return v0 + (v1 - v0) * (t * t * (3 - 2 * t));
    }
  }
  return LIGHT_KEYS[LIGHT_KEYS.length - 1][1];
}
// Extra dimming for the first stretch of the street ride only (the golden-hour sky made it far brighter
// than the rest). 1 = no change. It lifts back to 1 by frame ~420. Lower the 0.45 for darker.
const START_DIM = [[1, 1], [147, 1], [149, 0.45], [260, 0.55], [420, 1], [2040, 1]];
function startDim(f) {
  if (f <= START_DIM[0][0]) return START_DIM[0][1];
  for (let i = 1; i < START_DIM.length; i++) {
    const [f1, v1] = START_DIM[i];
    if (f <= f1) {
      const [f0, v0] = START_DIM[i - 1];
      const t = (f - f0) / (f1 - f0);
      return v0 + (v1 - v0) * (t * t * (3 - 2 * t));
    }
  }
  return 1;
}
const CUT_JUMP = 15; // metres; a camera jump bigger than this between two frames is a hard cut, never interpolate

const lerp = (a, b, t) => a + (b - a) * t;

export async function createWorld(canvas, manager) {
  const [camData, skyData, zoneData] = await Promise.all([
    fetch('./data/camera.json').then((r) => r.json()),
    fetch('./data/sky.json').then((r) => r.json()),
    fetch('./data/zones.json').then((r) => r.json()),
  ]);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.AgXToneMapping;
  renderer.toneMappingExposure = 0.8;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x2a1a3a, 0.0022);

  const camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, camData.far);
  scene.add(camera);

  // ---- lights. Blender's 22 lights are not exported, so these stand in for them.
  // The scene is a NIGHT scene: keep these low. Raise LIGHT_SCALE to brighten everything at once.
  const LIGHT_SCALE = 1.0;
  const hemi = new THREE.HemisphereLight(0x7a66b0, 0x120c18, 0.28 * LIGHT_SCALE);
  const moon = new THREE.DirectionalLight(0x8a9aff, 0.28 * LIGHT_SCALE);
  moon.position.set(-60, 120, 80);
  const riderLight = new THREE.PointLight(0xffc88a, 55 * LIGHT_SCALE, 22, 1.8);
  scene.add(hemi, moon, riderLight);

  // ---- sky dome driven by sky.json
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    toneMapped: true,
    uniforms: {
      c0: { value: new THREE.Color() },
      c1: { value: new THREE.Color() },
      c2: { value: new THREE.Color() },
      stops: { value: new THREE.Vector3(0, 0.42, 1) },
      rng: { value: new THREE.Vector2(skyData.map_range[0], skyData.map_range[1]) },
      mult: { value: 1 },
    },
    vertexShader: `
      varying vec3 vDir;
      void main(){
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position.z = gl_Position.w;
      }`,
    fragmentShader: `
      uniform vec3 c0; uniform vec3 c1; uniform vec3 c2; uniform vec3 stops; uniform vec2 rng; uniform float mult;
      varying vec3 vDir;
      void main(){
        float t = clamp((vDir.y - rng.x) / (rng.y - rng.x), 0.0, 1.0);
        vec3 col = t < stops.y ? mix(c0, c1, (t - stops.x) / max(stops.y - stops.x, 1e-4))
                               : mix(c1, c2, (t - stops.y) / max(stops.z - stops.y, 1e-4));
        gl_FragColor = vec4(col * mult, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), skyMat);
  sky.renderOrder = -10;
  sky.frustumCulled = false;
  scene.add(sky);

  // ---- the model
  const gltf = await new Promise((resolve, reject) => {
    new GLTFLoader(manager).load('./models/code-world.glb', resolve, undefined, reject);
  });
  const root = gltf.scene;
  scene.add(root);
  root.traverse((o) => {
    if (o.isMesh) {
      o.frustumCulled = true;
      if (o.material) o.material.fog = true;
    }
  });
  root.updateMatrixWorld(true);

  const byName = (n) => root.getObjectByName(n);
  const rider = byName('RiderRoot');

  // ---- the monitor: the Blender glitch shader can't be exported, so it is rebuilt here.
  // Rows of the screen slide sideways and flash magenta, driven by the same keyframes as Blender.
  let monitorU = null;
  const screenMesh = byName('apt_mon_screen');
  const screenTex = screenMesh?.material?.map || screenMesh?.material?.emissiveMap;
  if (screenMesh && screenTex) {
    monitorU = { uMap: { value: screenTex }, uGlitch: { value: 0 }, uSeed: { value: 0 } };
    screenMesh.material = new THREE.ShaderMaterial({
      uniforms: monitorU,
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `
        uniform sampler2D uMap; uniform float uGlitch; uniform float uSeed; varying vec2 vUv;
        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        void main(){
          vec2 uv = vUv;
          float row = floor(uv.y * 26.0);
          float n = hash(vec2(row, uSeed));
          uv.x += (n - 0.5) * uGlitch * 0.4;
          vec3 c = texture2D(uMap, uv).rgb;
          float bar = step(0.72, n) * uGlitch;
          c = mix(c, c * vec3(1.8, 0.25, 1.6), bar);
          c *= 1.0 + uGlitch * 3.0;
          gl_FragColor = vec4(c, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
  } else {
    console.warn('monitor screen not found - glitch disabled');
  }

  // Every clip is driven by hand from the scroll frame. A clip that ends before the last frame
  // (rider at ~1588, "MY WORK" letters at 1078, cars, puffs...) must HOLD its last pose, not loop
  // back to its start - that is what made the bike and the letters vanish.
  const mixer = new THREE.AnimationMixer(root);
  const actions = gltf.animations.map((clip) => {
    const a = mixer.clipAction(clip);
    a.play();
    return { a, end: Math.max(clip.duration - 1e-4, 0) };
  });
  function poseClips(seconds) {
    for (const { a, end } of actions) a.time = Math.min(seconds, end);
    mixer.update(0);
  }

  // ---- zones (empties exported from Blender)
  const zoneNodes = {};
  for (const key of Object.keys(zoneData.zones)) {
    const n = byName(zoneData.zones[key].empty);
    if (n) zoneNodes[key] = n;
  }
  const anchors = {
    experienceHeading: byName('SLOT_experience_heading_anchor'),
    contactHeading: byName('SLOT_contact_heading_anchor'),
  };

  // ---- sizing: keep the authored horizontal field of view, widen vertical on tall screens
  const hfov = 2 * Math.atan(camData.sensor_width / 2 / camData.lens[0]);
  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  const q0 = new THREE.Quaternion();
  const q1 = new THREE.Quaternion();
  const tmpC = new THREE.Color();

  function setCamera(frame) {
    const f = Math.min(Math.max(frame, 1), camData.frames);
    const i = Math.floor(f) - 1;
    const j = Math.min(i + 1, camData.frames - 1);
    const tRaw = f - Math.floor(f);
    const p = camData.pos;
    // hard cut (desk -> street at frame 148): snap, don't fly 190 m across the city in half a frame
    const jump = Math.hypot(p[j * 3] - p[i * 3], p[j * 3 + 1] - p[i * 3 + 1], p[j * 3 + 2] - p[i * 3 + 2]);
    const t = jump > CUT_JUMP ? 0 : tRaw;
    camera.position.set(lerp(p[i * 3], p[j * 3], t), lerp(p[i * 3 + 1], p[j * 3 + 1], t), lerp(p[i * 3 + 2], p[j * 3 + 2], t));
    const q = camData.quat;
    q0.set(q[i * 4], q[i * 4 + 1], q[i * 4 + 2], q[i * 4 + 3]);
    q1.set(q[j * 4], q[j * 4 + 1], q[j * 4 + 2], q[j * 4 + 3]);
    camera.quaternion.copy(q0).slerp(q1, t);
    camera.__jump = jump > CUT_JUMP;
    const lens = lerp(camData.lens[i], camData.lens[j], jump > CUT_JUMP ? 0 : tRaw);
    const hf = 2 * Math.atan(camData.sensor_width / 2 / lens);
    // authored: 16:9. Narrower screens keep the horizontal field so nothing important is cropped.
    const aspect = camera.aspect;
    const vf = 2 * Math.atan(Math.tan(hf / 2) / Math.min(aspect, camData.aspect_authored) * (aspect >= camData.aspect_authored ? aspect / camData.aspect_authored : 1));
    camera.fov = THREE.MathUtils.radToDeg(aspect >= camData.aspect_authored ? 2 * Math.atan(Math.tan(hf / 2) / camData.aspect_authored) : vf);
    camera.updateProjectionMatrix();
  }

  function setSky(frame) {
    const keys = skyData.keys;
    let k = 0;
    while (k < keys.length - 2 && keys[k + 1].f <= frame) k++;
    const a = keys[k];
    const b = keys[k + 1];
    const t = THREE.MathUtils.clamp((frame - a.f) / Math.max(b.f - a.f, 1), 0, 1);
    const set = (u, s0, s1) => u.value.setRGB(lerp(s0[1], s1[1], t), lerp(s0[2], s1[2], t), lerp(s0[3], s1[3], t), THREE.LinearSRGBColorSpace);
    set(skyMat.uniforms.c0, a.stops[0], b.stops[0]);
    set(skyMat.uniforms.c1, a.stops[1], b.stops[1]);
    set(skyMat.uniforms.c2, a.stops[2], b.stops[2]);
    skyMat.uniforms.stops.value.set(a.stops[0][0], lerp(a.stops[1][0], b.stops[1][0], t), a.stops[2][0]);
    const lm = lightMix(frame);
    const sd = startDim(frame);
    skyMat.uniforms.mult.value = lerp(a.strength, b.strength, t) * lerp(1.0, 1.7, lm) * lerp(1, 0.7, 1 - sd);
    tmpC.copy(skyMat.uniforms.c0.value);
    scene.fog.color.copy(tmpC).multiplyScalar(0.5 * skyMat.uniforms.mult.value * sd).lerp(new THREE.Color(0x14101c), 0.35);
    // the warm golden horizon colour is what over-lit the opening street, so desaturate it toward a cool violet there
    hemi.color.copy(skyMat.uniforms.c0.value).lerp(new THREE.Color(0xb090d8), 0.5 + 0.4 * (1 - sd));
    moon.color.setRGB(lerp(a.sun[0], b.sun[0], t), lerp(a.sun[1], b.sun[1], t), lerp(a.sun[2], b.sun[2], t));
    const sunE = lerp(a.sunE, b.sunE, t);
    moon.intensity = lerp((0.18 + sunE * 0.6) * LIGHT_SCALE, 0.8 + sunE * 2.0, lm) * sd;
    hemi.intensity = lerp(0.28 * LIGHT_SCALE, 1.1, lm) * sd;
    riderLight.intensity = lerp(55 * LIGHT_SCALE, 120, lm) * lerp(1, 0.7, 1 - sd);
    renderer.toneMappingExposure = lerp(0.8, 1.0, lm) * lerp(1, 0.85, 1 - sd);
  }

  const tmpV = new THREE.Vector3();
  function update(frame) {
    setCamera(frame);
    setSky(frame);
    poseClips(Math.min(frame / FPS, 85));
    if (monitorU) {
      monitorU.uGlitch.value = glitchAt(frame);
      monitorU.uSeed.value = Math.floor(frame / 2);
    }
    root.updateMatrixWorld(true);
    sky.position.copy(camera.position);
    if (rider) {
      rider.getWorldPosition(tmpV);
      riderLight.position.set(tmpV.x + 2.2, tmpV.y + 1.4, tmpV.z);
    }
    camera.updateMatrixWorld(true);
  }

  function render() {
    renderer.render(scene, camera);
  }

  return { renderer, scene, camera, root, zoneNodes, anchors, zoneData, update, render, resize };
}
