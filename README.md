# Portfolio — Code World

A scroll-driven 3D portfolio. You scroll, a camera rides through a Blender-made city at night, and each
section (About, Skills, Projects, Experience, Contact) appears on a board in the scene. When you scroll past
the end, it loops back to the start.

Built with **Three.js** (3D), **GSAP** (scroll + menu motion) and **Vite** (dev server / build).

---

## 0. What is in this folder

```
portfolio-code-world/
├── index.html, vite.config.js, package.json   the app's setup
├── src/                                       the app's code (edit src/content.js for your words)
├── public/                                    what the browser loads: the 3D model + camera/zone/sky data
├── blender/                                   the Blender source files (NOT needed to run or deploy the site)
├── docs/                                      notes: the build plan, zone sizes, reference screenshots
└── README.md
```

Only `index.html`, `package.json`, `vite.config.js`, `src/` and `public/` are needed to run or deploy the site.
`blender/` and `docs/` are there so everything about this project lives in one place.

---

## 1. Run it

You need **Node.js 18 or newer**. Check with `node -v`.

```bash
cd ~/Desktop/portfolio-code-world
npm install          # first time only
npm run dev          # opens a server at http://localhost:5173
```

Then open <http://localhost:5173> and scroll.

| Command           | What it does                                                        |
|-------------------|---------------------------------------------------------------------|
| `npm run dev`     | Development server with live reload                                 |
| `npm run build`   | Makes the finished site in the `dist/` folder (about 10 MB)         |
| `npm run preview` | Serves the `dist/` folder locally so you can test the real build    |

### Handy test links (dev server)

| URL                                   | Shows                                                        |
|---------------------------------------|--------------------------------------------------------------|
| `http://localhost:5173/?debug`        | Pink dashed outlines on every board + the current frame      |
| `http://localhost:5173/?frame=1830`   | Jump straight to a frame (1–2040)                            |
| `http://localhost:5173/?debug&frame=476` | Both together                                             |

Useful frames: `1` desk · `148` glitch cut to the street · `476` About · `835` Skills · `1250` Projects ·
`1830` Experience · `1980` Contact · `2040` end (same picture as frame 1, which is what makes the loop work).

---

## 2. Put your own content in (do this first)

**Everything you see is a placeholder.** Open `src/content.js` and replace the text. That is the only file you
need to edit for words:

- `name`, `initials`, `role` — the big title on the first screen and the logo
- `about` — paragraphs and the three fact rows
- `skills` — **exactly 6** (one per sign on the building)
- `projects` — **exactly 6** (one per train window). `href` is the link the card opens
- `experience.items` — the rows of the terminal (4 fit comfortably)
- `contact` — headline and links

Save and the page reloads by itself. If a section has more text than the placeholder, the box is made taller
and the whole thing scales down a little, so text never gets cut off — but very long text becomes small. Keep
it short.

---

## 3. How it works (so you can change it)

```
scroll position ──► frame number (1…2040) ──► camera pose + animations ──► what you see
                                      └─────► which boards are visible and where
```

- `public/models/code-world.glb` — the whole city, exported from Blender.
- `public/data/camera.json` — the camera path, one pose per frame (Y-up, ready for Three.js).
- `public/data/zones.json` — for each section: the empty board in the model and the frame range it is visible.
- `public/data/sky.json` — the sky colours over time.

| File | Job |
|------|-----|
| `src/content.js`   | Your words (edit this) |
| `src/main.js`      | Scroll → frame, menu, loop-at-end, loader, phone zoom |
| `src/world.js`     | Loads the model, drives the camera, sky and lights from the frame |
| `src/overlay.js`   | Pins each section's HTML to its 3D board and scales it to fit |
| `src/scrollmap.js` | **How much scroll each part takes** (slow on content, fast while travelling) |
| `src/glitch.js`    | The monitor glitch and the cut from the desk to the street |
| `src/style.css`    | All colours, fonts and the glass look |

### Common tweaks

- **Make a section stay on screen longer:** raise its number in `SCROLL_CFG` in `src/scrollmap.js`
  (more scroll per frame = slower).
- **Make the night darker or brighter:** in `src/world.js`, `LIGHT_SCALE` (everything), `LIGHT_KEYS`
  (original brightness at the desk and the end, dimmed in between) and `START_DIM` (the first stretch after the glitch).
- **Colours and glass:** the variables at the top of `src/style.css` (`--accent`, `--glass-bg`, …).
- **Font:** JetBrains Mono, loaded from the `@fontsource/jetbrains-mono` package (works offline).

---

## 4. Putting it online

Run `npm run build`, then upload the **contents of `dist/`** to any static host (Netlify, Vercel, GitHub Pages,
Cloudflare Pages). There is no server code.

- The site uses relative paths (`base: './'` in `vite.config.js`), so it also works from a sub-folder.
- The model is about 9 MB. Hosts that compress (gzip/brotli) will make it smaller. If load time matters, see
  "Known limits" below.

---

## 5. Updating the 3D model from Blender

The model comes from `blender/code_world_gltf.blend` (inside this folder). `blender/code_world.blend` is the same scene
before the web-export clean-up (its materials are still the fancy Blender ones). If you change the scene:

1. Re-export as glTF Binary (`.glb`) with **Cameras on**, **Y-up**, **Animations on**, and replace
   `public/models/code-world.glb`.
2. Re-export `camera.json`, `sky.json` and `zones.json` if you moved the camera, the boards or the markers.
   The marker frames come from the timeline markers in Blender.
3. Keep these object names, because the code looks them up: `ZONE_about`, `ZONE_experience`, `ZONE_contact`,
   `ZONE_project_0`…`ZONE_project_5`, `SKILLSIGN_0_back`…`SKILLSIGN_5_back`, `SLOT_experience_heading_anchor`,
   `SLOT_contact_heading_anchor`, `RiderRoot`, `PROJECT_TRAIN`, `apt_mon_screen`.

Blender's lights, the animated sky and the monitor glitch shader **do not export**. They are rebuilt in
`src/world.js` (a few Three.js lights, a gradient sky dome, and a small shader for the monitor).

---

## 6. Known limits (honest list)

- **Phones:** the page zooms in on each board so text is bigger, but on a 390 px-wide phone most text is still
  only about 5–9 px. Skills is the smallest. About and Projects are the most readable.
- **Placeholder text everywhere** until you edit `src/content.js`.
- **File size:** about 10 MB, mostly the 3D model. There are around 1,300 separate meshes; merging more of them
  would reduce draw calls.
- **Loop:** scrolling past the end jumps to the start behind a short glitch. It lands near frame 15, not exactly 1.
- **Projects:** while the train moves between two projects, two cards can show at once.
- **Not tested:** real touch devices, landscape phones, Safari/Firefox (only Chromium was used for testing),
  and screen readers beyond basic `aria` attributes.
- **Accessibility:** if the visitor has "reduce motion" turned on, camera easing is switched off.

---

## 7. Troubleshooting

| Problem | Try |
|---------|-----|
| Blank page, loader stuck | Open the browser console (F12). Usually WebGL is turned off, or the `.glb` did not load. |
| "WebGL is not available" | Use a recent Chrome/Edge/Firefox/Safari with hardware acceleration on. |
| `npm: command not found` | Install Node.js from nodejs.org, then reopen the terminal. |
| Port 5173 already in use | `npm run dev -- --port 5180` |
| Page opens halfway down | Reload — the page always resets to the top on load. |
| Text outside its board | Add `?debug` to see each board's outline, then check the names in section 5. |
