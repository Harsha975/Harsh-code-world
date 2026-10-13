import * as THREE from 'three';
import { content } from './content.js';

const FADE = 10; // frames

const CORNERS = [];
for (const x of [-0.5, 0.5]) for (const y of [-0.5, 0.5]) for (const z of [-0.5, 0.5]) CORNERS.push(new THREE.Vector3(x, y, z));

const el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// corners of a node's local box: unit cube for ZONE_* empties, real geometry bounds for meshes
function cornersOf(node) {
  if (!node.geometry) return CORNERS;
  if (!node.geometry.boundingBox) node.geometry.computeBoundingBox();
  const b = node.geometry.boundingBox;
  const out = [];
  for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) out.push(new THREE.Vector3(x, y, z));
  return out;
}

function fadeAlpha(frame, a, b) {
  if (frame < a - FADE || frame > b + FADE) return 0;
  if (frame < a) return (frame - (a - FADE)) / FADE;
  if (frame > b) return 1 - (frame - b) / FADE;
  return 1;
}

/*
 * HOW TEXT STAYS ON THE BOARDS
 * Every section is laid out ONCE at a fixed design size (W x H, in CSS px) inside `.fit`.
 * Each frame the board's size on screen is measured and `.fit` is scaled to fit inside it
 * (scale = min(boardW / W, boardH / H)). Text therefore keeps its layout and can never be cut off:
 * on a phone it is simply smaller. H grows automatically if your real text is longer than the placeholder.
 */
const DESIGN = {
  about:      { W: 640, aspect: 1.66 },
  skill:      { W: 250, aspect: 2.12 },
  project:    { W: 720, aspect: 2.35 },
  experience: { W: 900, aspect: 2.34 },
  contact:    { W: 800, aspect: 2.0 },
};

export function createOverlay(world, { debug = false } = {}) {
  const { zoneNodes, anchors, zoneData, camera } = world;
  const stageEl = document.getElementById('stage');
  const boxes = [];
  const fitList = [];

  function addBox(zoneKey, kind, cls, inner, opts = {}) {
    const node = opts.node || zoneNodes[zoneKey];
    const range = opts.range || zoneData.zones[zoneKey]?.visible_frames;
    if (!node || !range) return null;
    const box = el('section', `zbox ${cls}`);
    const fit = el('div', 'fit', inner);
    box.appendChild(fit);
    box.setAttribute('aria-hidden', 'true');
    box.style.visibility = 'hidden';
    if (debug) box.classList.add('debug');
    document.body.appendChild(box);
    const d = DESIGN[kind];
    fit.style.width = `${d.W}px`;
    const b = { box, fit, node, range, zoneKey, kind, W: d.W, H: d.W / d.aspect, s: 1, alpha: 0, key: '', corners: cornersOf(node), lastS: 0, lastX: 0, lastY: 0 };
    boxes.push(b);
    fitList.push(b);
    return b;
  }

  // HOME: the big name/role is the fixed #hero element (index.html), so no zone box here.

  addBox('about', 'about', 'z-about',
    `<div class="inner"><h3>${esc(content.about.title)}</h3>${content.about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}
     <dl>${content.about.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div>`);

  // SKILLS: one card per sign, each pinned to its own SKILLSIGN_n_back mesh
  const skillRange = zoneData.zones.skills?.visible_frames;
  content.skills.forEach((s, i) => {
    const node = world.root.getObjectByName(`SKILLSIGN_${i}_back`);
    if (!node) return;
    addBox('skills', 'skill', 'z-skill',
      `<div class="inner"><span class="n">${String(i + 1).padStart(2, '0')}</span><b>${esc(s.name)}</b><small>${esc(s.note)}</small></div>`,
      { node, range: skillRange });
  });

  content.projects.forEach((p, i) => {
    addBox(`project_${i}`, 'project', 'z-project',
      `<a class="inner" href="${esc(p.href)}" target="_blank" rel="noopener"><span class="n">${String(i + 1).padStart(2, '0')}</span><h3>${esc(p.title)}</h3><p>${esc(p.blurb)}</p>
       <ul>${p.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul><span class="go">View →</span></a>`);
  });

  addBox('experience', 'experience', 'z-experience',
    `<ol>${content.experience.items.map((it) => `<li><time>${esc(it.when)}</time><div><b>${esc(it.role)}</b> <span>· ${esc(it.where)}</span><p>${esc(it.text)}</p></div></li>`).join('')}</ol>`);

  addBox('contact', 'contact', 'z-contact',
    `<div class="inner"><h3>${esc(content.contact.headline)}</h3><ul>${content.contact.links
      .map((l) => `<li><a href="${esc(l.href)}" target="_blank" rel="noopener"><small>${esc(l.label)}</small><b>${esc(l.value)}</b></a></li>`)
      .join('')}</ul></div>`);

  // If the real text is taller than the design box, make the design box taller (so it is scaled down, never clipped).
  function measureAll() {
    for (const b of fitList) {
      b.fit.style.height = 'auto';
      const natural = b.fit.scrollHeight;
      const d = DESIGN[b.kind];
      b.H = Math.max(d.W / d.aspect, natural);
      b.fit.style.height = `${b.H}px`;
      b.lastS = 0;
    }
  }
  measureAll();
  document.fonts?.ready.then(measureAll);

  // headings drawn in HTML, placed on the 3D anchors; sized with their section so they stay inside the title bar
  const headings = [
    { key: 'experience', anchor: anchors.experienceHeading, text: content.experience.title, range: zoneData.zones.experience?.visible_frames },
    { key: 'contact', anchor: anchors.contactHeading, text: content.contact.title, range: zoneData.zones.contact?.visible_frames },
  ]
    .filter((h) => h.anchor && h.range)
    .map((h) => {
      const e = el('div', 'z-heading', esc(h.text));
      document.body.appendChild(e);
      return { ...h, el: e };
    });

  const v = new THREE.Vector3();
  const w = window;

  function projectRect(node, corners) {
    node.updateWorldMatrix(true, false);
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    let behind = false;
    for (const c of corners) {
      v.copy(c).applyMatrix4(node.matrixWorld).project(camera);
      if (v.z > 1 || v.z < -1) behind = true;
      const x = (v.x * 0.5 + 0.5) * w.innerWidth;
      const y = (-v.y * 0.5 + 0.5) * w.innerHeight;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
    return { x0, y0, x1, y1, behind };
  }

  function setVis(b, a) {
    const key = a.toFixed(3);
    if (key === b.key) return;
    b.key = key;
    const vis = a > 0;
    b.box.style.opacity = key;
    b.box.style.visibility = vis ? 'visible' : 'hidden'; // hidden boxes cost nothing (no backdrop blur)
    b.box.style.pointerEvents = vis && a > 0.9 ? 'auto' : 'none';
    b.box.setAttribute('aria-hidden', vis && a > 0.5 ? 'false' : 'true');
  }

  function update(frame) {
    for (const b of boxes) {
      const a = fadeAlpha(frame, b.range[0], b.range[1]);
      b.alpha = a;
      b.r = null;
      if (a <= 0) { setVis(b, 0); continue; }
      const r = projectRect(b.node, b.corners);
      if (r.behind) { b.box.style.opacity = '0'; b.key = ''; continue; }
      b.r = r;
      const bw = r.x1 - r.x0;
      const bh = r.y1 - r.y0;
      const s = Math.max(0.01, Math.min(bw / b.W, bh / b.H));
      b.s = s;
      const bs = b.box.style;
      bs.left = `${r.x0.toFixed(1)}px`;
      bs.top = `${r.y0.toFixed(1)}px`;
      bs.width = `${bw.toFixed(1)}px`;
      bs.height = `${bh.toFixed(1)}px`;
      const tx = (bw - b.W * s) / 2;
      const ty = (bh - b.H * s) / 2;
      b.fit.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${s.toFixed(4)})`;
      setVis(b, a);
    }

    for (const h of headings) {
      const a = fadeAlpha(frame, h.range[0], h.range[1]);
      h.el.style.opacity = a.toFixed(3);
      if (a <= 0) continue;
      const owner = boxes.find((x) => x.zoneKey === h.key);
      h.anchor.getWorldPosition(v);
      v.project(camera);
      h.el.style.left = `${((v.x * 0.5 + 0.5) * w.innerWidth).toFixed(1)}px`;
      h.el.style.top = `${((-v.y * 0.5 + 0.5) * w.innerHeight).toFixed(1)}px`;
      if (owner) h.el.style.fontSize = `${(15 * owner.s).toFixed(2)}px`; // same scale as the section it belongs to
    }
  }

  // The board(s) fully showing right now (all six skill cards count as one), as a single screen rectangle.
  function focus() {
    let best = 0;
    for (const b of boxes) if (b.r && b.alpha > best) best = b.alpha;
    if (best <= 0) return null;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const b of boxes) {
      if (!b.r || b.alpha < best * 0.98) continue;
      x0 = Math.min(x0, b.r.x0); y0 = Math.min(y0, b.r.y0); x1 = Math.max(x1, b.r.x1); y1 = Math.max(y1, b.r.y1);
    }
    return { x0, y0, x1, y1, a: best };
  }

  return { update, focus, boxes, stageEl };
}
