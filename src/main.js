import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';
import './style.css';
import { content } from './content.js';
import { createWorld } from './world.js';
import { createOverlay } from './overlay.js';
import { buildScrollMap } from './scrollmap.js';
import { overlayGlitch } from './glitch.js';

gsap.registerPlugin(ScrollTrigger);

const params = new URLSearchParams(location.search);
const DEBUG = params.has('debug');
const LAST = 2040;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

const $ = (id) => document.getElementById(id);
const state = { frame: 1, target: 1 };

$('logo-text').textContent = content.initials;
$('hero-name').textContent = content.name;
$('hero-role').textContent = content.role;
document.title = `${content.name} — Portfolio`;

const manager = new THREE.LoadingManager();
manager.onProgress = (_u, loaded, total) => {
  const p = total ? loaded / total : 0;
  $('loader-fill').style.transform = `scaleX(${p})`;
  $('loader-pct').textContent = `${Math.round(p * 100)}%`;
};

function showError(msg) {
  $('loader-text').textContent = msg;
  document.querySelector('.caret').style.display = 'none';
}

async function boot() {
  const test = document.createElement('canvas');
  if (!(test.getContext('webgl2') || test.getContext('webgl'))) {
    showError('WebGL is not available in this browser.');
    return;
  }

  let world;
  try {
    world = await createWorld($('gl'), manager);
  } catch (e) {
    console.error(e);
    showError('could not load the 3D world — see console');
    return;
  }
  const overlay = createOverlay(world, { debug: DEBUG });

  const markers = world.zoneData.markers;
  const order = ['home', 'about', 'skills', 'projects', 'experience', 'contact'];
  const FRAME_OF = { home: 1, about: markers.about, skills: markers.skills, projects: markers.projects + 20, experience: markers.experience, contact: markers.contact };

  // scroll length: non-linear (slow where there is content to read, fast while travelling)
  const smap = buildScrollMap(world.zoneData.zones, LAST);
  let scrollPx = 0;
  function sizeStage() {
    scrollPx = Math.round(smap.screens * window.innerHeight);
    $('stage').style.height = `${scrollPx + window.innerHeight}px`;
  }
  sizeStage();
  addEventListener('resize', () => { sizeStage(); ScrollTrigger.refresh(); });

  const frameAtScroll = (y) => smap.screensToFrame((y / Math.max(scrollPx, 1)) * smap.screens);
  const scrollOfFrame = (f) => (smap.frameToScreens(f) / smap.screens) * scrollPx;

  ScrollTrigger.create({
    trigger: '#stage',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => { state.target = frameAtScroll(self.progress * scrollPx); },
  });

  // ---- side rail + menu
  const rail = $('rail');
  const menu = $('menu');
  order.forEach((id) => {
    const item = content.menu.find((m) => m.id === id);
    const a = document.createElement('a');
    a.href = `#${id}`; a.dataset.goto = id; a.innerHTML = `<i></i><span>${item.label}</span>`;
    rail.appendChild(a);
    const m = document.createElement('a');
    m.href = `#${id}`; m.dataset.goto = id; m.textContent = item.label;
    menu.appendChild(m);
  });

  let nav = null;
  function goto(id) {
    const y = scrollOfFrame(FRAME_OF[id] ?? 1);
    const o = { y: window.scrollY };
    nav?.kill();
    nav = gsap.to(o, {
      y,
      duration: reduced ? 0 : Math.min(2.6, 0.7 + Math.abs(y - window.scrollY) / 9000),
      ease: 'power2.inOut',
      onUpdate: () => window.scrollTo(0, o.y),
    });
    closeMenu();
  }
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-goto]');
    if (t) { e.preventDefault(); goto(t.dataset.goto); }
  });
  addEventListener('wheel', () => nav?.kill(), { passive: true });
  addEventListener('touchstart', () => nav?.kill(), { passive: true });

  // ---- endless loop: frame 2040 is the same picture as frame 1 (checked in Blender), so
  // scrolling on past the end jumps back to the start. A short glitch burst covers the jump.
  let boost = 0;          // extra glitch strength, decays to 0
  let wrapping = false;
  const atEnd = () => scrollY >= scrollPx - 3 && state.target >= LAST - 0.6;
  function wrapToStart() {
    if (wrapping) return;
    wrapping = true;
    nav?.kill();
    boost = 1;
    state.frame = state.target = 1;
    window.scrollTo(0, 0);
    setTimeout(() => { wrapping = false; }, 500);
  }
  addEventListener('wheel', (e) => { if (e.deltaY > 0 && atEnd()) wrapToStart(); }, { passive: true });
  let touchY = null;
  addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchmove', (e) => {
    if (touchY !== null && touchY - e.touches[0].clientY > 24 && atEnd()) { wrapToStart(); touchY = null; }
  }, { passive: true });
  addEventListener('keydown', (e) => {
    if (['ArrowDown', 'PageDown', ' ', 'End'].includes(e.key) && atEnd()) { e.preventDefault(); wrapToStart(); }
  });

  const btn = $('menu-btn');
  function closeMenu() { menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-hidden', 'true'); }
  btn.addEventListener('click', () => {
    const open = !menu.classList.contains('open');
    menu.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  gsap.to('#loader', { opacity: 0, duration: 0.8, delay: 0.3, onComplete: () => $('loader').remove() });
  gsap.from('#hud, #rail', { opacity: 0, y: -10, duration: 1, delay: 0.6 });

  const glitch = $('glitch');
  const hero = $('hero');
  const hint = $('scroll-hint');
  const hintWord = hint.querySelector('span');
  const readout = $('frame-readout');
  const railLinks = [...rail.querySelectorAll('a')];
  let activeId = '';

  function activeSection(f) {
    let cur = 'home';
    for (const id of order) if (f >= (FRAME_OF[id] ?? 1) - 40) cur = id;
    return cur;
  }

  // ---- phone / portrait zoom: render only a window of a bigger virtual picture, centred on the current board.
  // `strength` is 0 on wide screens (nothing changes) and 1 on a phone; text then scales up with the board.
  const camera = world.camera;
  const zoom = { z: 1, cx: innerWidth / 2, cy: innerHeight / 2 };
  function applyPhoneZoom(fc) {
    const W = innerWidth, H = innerHeight, aspect = W / H;
    const strength = Math.min(1, Math.max(0, (1.45 - aspect) / (1.45 - 0.9)));
    let zt = 1, cxT = W / 2, cyT = H / 2;
    if (strength > 0 && fc) {
      const bw = Math.max(fc.x1 - fc.x0, 1), bh = Math.max(fc.y1 - fc.y0, 1);
      const want = Math.min((W * 0.92) / bw, (H * 0.6) / bh, 7);    // board fills 92 % of the width, at most 60 % of the height
      zt = 1 + (Math.max(want, 1) - 1) * strength * fc.a;
      cxT = (fc.x0 + fc.x1) / 2; cyT = (fc.y0 + fc.y1) / 2;
    }
    const k = reduced ? 1 : 0.18;
    zoom.z += (zt - zoom.z) * k; zoom.cx += (cxT - zoom.cx) * k; zoom.cy += (cyT - zoom.cy) * k;
    if (zoom.z > 1.002) {
      const z = zoom.z, Fw = W * z, Fh = H * z;
      const ox = Math.min(Math.max(zoom.cx * z - W / 2, 0), Fw - W);
      const oy = Math.min(Math.max(zoom.cy * z - H / 2, 0), Fh - H);
      camera.setViewOffset(Fw, Fh, ox, oy, W, H);
    }
  }

  let last = performance.now();
  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const k = reduced ? 1 : 1 - Math.pow(0.0008, dt);
    state.frame += (state.target - state.frame) * k;
    if (Math.abs(state.target - state.frame) < 0.01) state.frame = state.target;

    const f = state.frame;
    camera.clearViewOffset();
    world.update(f);
    overlay.update(f);                 // pass 1: where each board is in the normal (wide) shot
    applyPhoneZoom(overlay.focus());   // narrow screens: crop-zoom toward the board that is showing
    overlay.update(f);                 // pass 2: pin the text to the zoomed picture
    world.render();

    boost = Math.max(0, boost - dt * 2.6);
    const g = Math.max(overlayGlitch(f), boost);
    glitch.style.opacity = g.toFixed(3);
    if (g > 0) glitch.style.transform = `translate(${((Math.random() - 0.5) * 18 * g).toFixed(1)}px,0) skewX(${((Math.random() - 0.5) * 6 * g).toFixed(2)}deg)`;

    hero.style.opacity = Math.max(0, 1 - (f - 1) / 60).toFixed(3);
    // hint: "scroll" at the very start, "replay" at the very end
    const endA = Math.max(0, 1 - (LAST - f) / 25);
    hint.style.opacity = Math.max(Math.max(0, 1 - f / 25), endA).toFixed(3);
    const word = endA > 0.5 ? 'scroll to replay' : 'scroll';
    if (hintWord.textContent !== word) hintWord.textContent = word;

    const id = activeSection(f);
    if (id !== activeId) { activeId = id; railLinks.forEach((a) => a.classList.toggle('on', a.dataset.goto === id)); }
    if (DEBUG) readout.textContent = `frame ${f.toFixed(1)} / ${LAST} · ${id} · scroll ${Math.round(scrollY)}/${scrollPx}`;
    requestAnimationFrame(tick);
  }
  readout.style.display = DEBUG ? 'block' : 'none';
  requestAnimationFrame(tick);

  const jump = Number(params.get('frame'));
  if (jump) {
    state.frame = state.target = jump;
    window.scrollTo(0, scrollOfFrame(jump));
  } else {
    window.scrollTo(0, 0);
  }
  window.__world = world; window.__state = state; window.__scrollOfFrame = scrollOfFrame;
}

boot();
