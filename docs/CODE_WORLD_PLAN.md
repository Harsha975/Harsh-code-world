# Code World plan (works on code_world.blend only)

Original `bengaluru_ride_web.blend` is NOT touched. Backups of earlier states sit beside it.

## UPDATE: user lifted the "don't touch" limits. Camera, apartment, monitor dive, train and content slots may all be changed if it makes the code world better. Still keep frame 1 == frame 2040 and verify every step.

## Rules for myself
- One step at a time. After each step: render camera frames, run the check below, fix faults, THEN tick the box.
- Never break the loop: frame 1 must equal frame 2040 (camera, apartment, sky, everything animated).
- Content stays EMPTY (no text/images for GSAP/Three.js). Keep all ANCHOR_* / SLOT_* empties and the markers.
- Do not move/delete: camera WEB_CAM, markers, apt_* objects, PROJECT_TRAIN + its children.
- Do not touch the monitor dive/glitch (frames 106-148).
- Save after each verified step. Keep light count and triangle count from growing (target: lights <= 39, tris < 400k).
- Colour story per zone (editor-theme palette): Home = cyan/teal, About = amber/orange, Skills = magenta, Projects = green, Contact = violet/white.

## Standard check after every step
1. Look at frames 160, 476, 835, 1194, 1500, 1750 through the camera.
2. Compare frame 1 vs frame 2040 (camera pose + a render).
3. Confirm anchors/markers/slots still exist (count ANCHOR_*, SLOT_*, markers = 7).
4. Note triangle + light counts.
5. Write any fault found below, fix it, re-check.

## Steps
- [x] 1. Palette + materials: 5 zone materials code_b_{about,home,skills,projects,contact}, assigned by X position (91 slots). VERIFIED frames 160/380/700/1100/1500/1750.
- [x] 2. Glowing edges on buildings: edge lines done in-shader (Generated coords, threshold 0.4725). Windows still the old flat squares -> NOT yet code lines (revisit in step 3/4).
- [x] 3. Ground: n_road cyan grid (4m), n_walk violet grid (2m), 34 kerb ticks (CodeGround, every 10m, taller every 50m) on sidewalk z=0.23. Windows now striped code lines (n_win* materials, "codeified"). VERIFIED frames 160/300/380/700/1100.
- [x] 4. Sky: Env_Stars + old Moon hidden. 60 falling streams (CodeSky, 541 glyph objects, keyed 1->1020->2040 loop) placed y -62..-22 so they show behind the buildings; CODE_cursor_moon blinks 1Hz (constant interp). VERIFIED frames 260/700/1100/1500.
  - NOTE: streams are only visible when camera looks up/down the street (not in frame 260/380 close-ups). Sky is purple, not black, so green reads OK.
- [x] 5. Ride details: 9 ">" chevrons (CodeRide, CODE_chevron_0..8, parented to RiderRoot, local -Y, shrinking). Cars/auto/bus mats (carB/R/W, autoG/Y, glass2, c_b_a, d_*) + 17 pp_* people mats now get cube-edge glow ("edged"). VERIFIED frames 160/330/380/700.
  - NOTE: people are small in frame, edge glow barely visible on them; cars/bus/auto read well. Trail arms are thin and read as "^" at some angles.
- [x] 6. Zone landmarks (collection CodeZones): Home terminal ZH_* at x=-180 (cyan, blinking cursor); About file panel ZA_* at x=-134 (amber code lines + gutter); Skills module shelves ZS_* flanking the sign wall (magenta); Projects pipeline ZP_* (3 green pipes along the viaduct, 20 nodes, 3 gates build/test/deploy); Contact deploy console + lever + beacon on the apartment roof ZC_* (violet, red lever knob, 3 status lights). Old far-away CONTACT_* deck hidden. VERIFIED frames 160/200/240/300/476/835/1000/1194/1300/1660/1690/1715/1735.
  - FAULT FIXED: About panel was double-offset (parent at same loc) -> reset parent to origin. Falling code streams were too low and crossed the skills wall -> raised to z 75-105, shorter drop.
  - NOTE: pipeline gates are not visible in the camera frames I checked (they sit over the road); roof console reads blocky and its base is near-black.
- [ ] 7. Easter eggs restyled: UFO -> 404 ship, shooting star -> commit streak, collectible { } ; slots (empties only).
- [ ] 8. Lighting trim: reduce/merge lights, keep key ones; check sky/day-to-night still loops.
- [ ] 9. Final full check + handoff JSON update + save.

## USER FEEDBACK (after step 6): cyan frames/grid/pipes are "too much and ugly"; wants VERY CLEAN + MINIMAL, NOT SHINY.
- DONE: removed road/sidewalk/ground grid glow, cyan (home) building outlines, kerb ticks (CODE_tick_*), pipes+nodes+connectors+gates (ZP_*), terminal frame edges (ZH_edge_*). Backup: code_world_BEFORE_CYAN_REMOVAL.blend.
- STILL GLOWING (not yet asked to remove): amber/magenta/green/violet building outlines, mint ">" trail, green falling code, neon windows. ASK USER before touching.
- RULE going forward: prefer flat, matte, low-emission looks; no outlines/frames unless asked.

## CONTACT + GOLD DESK (user: rooftop is fine; desk should be evening gold like the world)
- DONE: apartment lights recoloured warm gold (apt_*), added apt_goldsun area light (energy 70, no shadow to avoid grain). Sky keys at frame 1 and 2040 set to the frame-148 golden-hour values (loop kept). Camera holds on the roof 1688-1722; marker 'contact' moved 2040 -> 1705; ANCHOR_contact moved to (0,-51,9). zone_panel colour lifted. Backup: code_world_BEFORE_ROOF_GOLD.blend.
- OPEN: roof shot (1705) still sits in the deep-night part of the sky timeline, so it is dark vs the golden desk; person/chair parts look grainy (pre-existing).

## CORRECTION: user meant the MONITOR IMAGE (not the room) should match the world's golden evening. Room stays DARK.
- DONE: room lights + sky keys at frames 1/2040 restored to pre-gold values; apt_goldsun deleted. Monitor texture (material apt_screen_world, both image nodes) replaced with a render of frame 165 (golden street), packed as image 'World_Gold'. Old 'World_First' image still in file (unused).
- NOTE: the monitor image is a STATIC still. The street in it will not match later zone colour changes unless re-rendered. Render path restored to /Users/harsham/Desktop/fix_415.png.
- LESSON: user wording "desktop" = the computer screen. Ask before changing lighting of a whole room.

## ROOFTOP REDO (user: use the long empty end for EXPERIENCE + CONTACT on the roof, remove old roof stuff, animate)
- DONE: deleted all ZC_*, CONTACT_*, SLOT_roof_*, SLOT_contact_* (25 objs). New collection RoofStage:
  - EXPERIENCE (lower roof, y=-50): RS_rail + 4 nodes/posts/cards, slots SLOT_exp_0..3_anchor, ANCHOR_experience. Builds frames 1745-1830 (rail draws, then node->post->card pop in), leaves 1900-1930.
  - CONTACT (top roof, y=-55.3): header slab + 2 legs + 3 plates/posts/nodes, slots SLOT_contact_0..2_anchor + SLOT_contact_headline_anchor, ANCHOR_contact moved. Builds 1925-2000, shrinks to hidden by 2040 so loop is clean.
  - Camera frames 1700-2040 rewritten: shots at 1745/1840 (pan along experience), 1900/1985 (swing + push-in on contact), 2008 dive through window, 2024 -> 2040 = frame-1 pose.
  - Markers: removed 'contact'@1705; added 'experience'@1760, 'contact'@1930. Backup: code_world_BEFORE_ROOFTOP_REDO.blend.
- FAULT FIXED: first camera pass left ~every other key from the old curve (location.y jumped between -43 and -55 -> camera flew inside the room at 1800/1950/2030). Deleted all old keys 1701-2039 and re-inserted only the shots.
- VERIFIED frames 1700,1745,1800,1840,1900,1950,1985,2008,2030,2040; camera f1==f2040; roof stage f1==f2040.
- OPEN: cards/plates are BLANK light-grey boxes (content slots) - read bright/flat against the dark night. Roof still in deep-night sky.

## ROOFTOP v2 (user: a frame is stuck bike->apartment, animation boring, make Experience + Contact more "code world")
- STUCK FRAME: camera keys 1689-1700 were identical (leftover hold). Fixed by deleting all camera keys 1651-2039 and re-inserting shots; scanned 1560-2040, 0 identical consecutive frames. Backup before this: code_world_BEFORE_GITTERM.blend.
- EXPERIENCE = `git log` in a terminal (y=-50, 16 m wide): panel CRT-opens 1704, traffic-light dots, `>` prompt + typed command with blinking cursor, 4 commit rows (node + link + hash + message, first/last get tags), selection bar steps down each row 1752/1776/1800/1824. Gone by 1872.
- CONTACT = deploy (y=-55.3, 10 m wide): panel opens 1888, headline bar + cursor, vertical bus, 3 rows: waiting dot -> packet travels along bus -> green ok + row slot + `>` chevron (ping/ack), deploy progress bar fills 1932-1986, done dot 1986. Gone by 2003.
- Everything is matte (emission <= 1.1, specular 0), scale-keyed from hidden, hidden at frames 1 and 2040 (loop clean). Anchors: SLOT_exp_0..3, ANCHOR_experience (row text start), SLOT_contact_0..2 (row slots), SLOT_contact_headline, ANCHOR_contact.
- Camera: 1700 wide on roof -> 1735-1835 pan along terminal from +X to -X (camera looks -Y so screen-right is -X; first try panned the wrong way and clipped) -> 1870-2000 slow push-in on Contact (linear, no hold) -> 2010 dive to window -> 2040 frame-1 pose.
- VERIFIED frames 1700,1735,1760,1790,1820,1845,1866,1890,1915,1940,1965,1990,2005,2020,2040; camera f1==f2040; roof f1==f2040.
- OPEN: terminal/contact panels are near-black on a night sky and read dark; Experience framing is close (text rows partly cut at the left edge in 1820/1845); no content in rows (empty slots by design).

## CONTENT ZONES (user: terminal lines will collide with web text; review/resize the space for each section)
- Measured every area at 1920x1080 first (frames fully on screen + px size). Backup: code_world_BEFORE_ZONES.blend.
- NEW rule: every section has ONE empty `ZONE_*` (empty cube, scale = size in metres, hidden in render) in collection ZONES. Decoration is OUTSIDE it or clears before the hold range.
- Experience: panel 14x6.4 m, git-log animation plays 1708-1790 then CLEARS (only title bar, left commit rail, status bar remain). Zone hold 1790-1870 (81 f, 64% width). Marker 'experience' -> 1795.
- Contact: panel 11x6.4 m, deploy animation plays 1884-1952 then clears (title bar + progress bar remain). Hold 1952-2006 (55 f, 65% width). Marker 'contact' -> 1958. Camera push-in 1900-2004 is linear.
- About: old decorated ZA_* panel (29 objs) deleted, new EMPTY 9x5.4 m panel + title bar + 3 dots + status bar at wall x=-134. Hold 380-671 (292 f, 32% width). ANCHOR_about moved to panel centre.
- Skills: deleted all 51 ZS_* shelf objects; 6 sign backs + glow panels scaled x1.32. ZONE_skills = whole board, hold 821-1000 (180 f, 65% width).
- Projects: camera 1172-1468 rewritten to track each train window in turn (26 f per window, lens 30); train now parked until 1440 (was 1340), leaves by 1500. ZONE_project_0..5 are parented to PROJECT_TRAIN. Holds 33-44 f each, ~56% width.
- Home: ZONE_home on back wall upper-left of monitor, 0.44 m wide; hold 1-77 f; ~10 px overlap with monitor at worst. ANCHOR_home moved to it.
- Handoff JSON got `content_zones` (empty name, visible frame range, hold frames, px size, top-left px) + markers.
- VERIFIED: camera f1==f2040, roof stage f1==f2040. 2 near-identical camera frames left (107 in the monitor dive, 1431 where the last project shot eases out) - sub-0.001 m, not a hold.
- OPEN: Home zone is only ~490x440 px at the end of its hold (wanted 700x350). Project holds are ~33 frames, not the 100 I proposed - the camera has to follow a moving train. ZONE sizes assume 16:9.

## PRE-EXPORT REVIEW + CLEANUP (user: "fix it")
- Review found: 7 parked cars broken (133 zero-scale parts, copied from a car that scales to 0 near the end), hidden star dome/moons/glyph proto would still export, 27 meshes with no material, 148 unused meshes, ~100 objects animated by DRIVERS (do not export), 43 procedural materials on 429 objects (do not export), 39 lights (22 with shadows), 1,733 meshes / 252 materials, 38k keyframes. Backup: code_world_BEFORE_CLEANUP.blend.
- DONE: deleted 7 broken parked cars (168 objs), Env_Stars, LM_moon, Moon*, CODE_glyph_proto; gave 27 material-less meshes 'metro_concrete'; purged unused data; baked 91 driven rotation channels to keyframes (18 linear spinners every 60 f; 73 sampled per frame then thinned at 0.004 rad), removed the drivers. Verified vs live-driver snapshot at 14 frames: worst error 0.004 rad.
- RESULT: keyframes went UP 38,067 -> 158,256 (baked sine motion needs dense keys). Alternative: recreate those sines in Three.js from the expressions instead of exporting keys.
- STILL OPEN: 1 driver left on material apt_screen_world (GL_Seed = floor(frame/2), the glitch); 43 procedural materials; sky (world nodes) not exportable; 39 lights; 1,700+ separate meshes; plan steps 7 (easter eggs restyle), 8 (light trim), 9 (final handoff) not done.

## EXPORT COPY (user: trim lights + merge meshes; asked why lines stream inside the terminal)
- Work now continues in `code_world_export.blend` (saved as a copy of code_world.blend first). `code_world.blend` is the editable, UNMERGED file. Backup: code_world_BEFORE_TRIM_MERGE.blend.
- MERGED 311 static meshes into 32 (grouped by collection + material). Skipped on purpose: animated/under animated parents, anything named SLOT_/SKILLSIGN/PROJWIN/ZA_/ZH_/apt_mon/apt_tv/apt_screen/CODE_/RS_/LM_/sign_/SIGN_/GLASS/SHELL (content/texturing), Env_Road/Sidewalks/Ground, meshes using Generated-coord materials (edge glow would break), multi-material, shared data.
- LIGHTS 39 -> 22: removed 9 MetroUnderLight, apt_flamp/lamp/led_fill/neon/rgb, TLlight_amber/red, StLamp11 (all contributed ~nothing in the shot frames, ranked by energy/distance^2 at 14 frames). Still 22 incl. 7 shadow casters; far more than web wants.
- TERMINAL ANSWER: the streaming lines are the intro animation (git log typing / deploy ping). They fully clear by frame 1795 (Experience) and 1957 (Contact); zone holds are 1795-1870 and 1957-2006. Markers 'experience'=1795 and 'contact'=1958 sit on those frames.
- OPEN: 43 procedural materials, animated sky, glitch driver (apt_screen_world GL_Seed), 1,321 meshes still, 22 lights.

## EMPTY TERMINALS (user screenshot at f1791: commit rows/dots/cmd/highlight still visible = what they meant)
- Deleted all 45 animated decoration meshes from the Experience + Contact panels (RS_e_cmd/cursor/hash/msg/node/prompt/rail/sel/statcur/tag, RS_c_bus/cursor/done/fill/go/headline/ok/packet/row/track/wait). KEPT per panel: panel, title bar, 3 traffic dots, status bar, 2 feet (16 meshes total). Done in code_world_export.blend only; backup code_world_export_BEFORE_EMPTY_TERMINAL.blend. code_world.blend still has the animation.
- Handoff JSON: experience hold now 1722-1868 (147 f, 68% width), contact 1898-2004 (107 f, 62% width) - panel fully open AND zone fully on screen.
- Markers 'experience'=1795 / 'contact'=1958 unchanged; content can now appear any time inside the ranges above.

## TERMINAL HEADINGS (user: add "Experience" and "Contact" headings)
- Added RS_e_heading ("Experience") and RS_c_heading ("Contact") as real 3D text converted to mesh (~1,900 polys each), in the title bar of each panel, matte off-white (rs3_white, recreated because the purge removed it). They scale in when the panel is open (1738-1868 / 1913-2004) and out after; hidden at frames 1 and 2040.
- Size on a 1920x1080 render: Experience 186x40 px, Contact 156x34 px. 0 px overlap with ZONE_experience / ZONE_contact. Backup: code_world_export_BEFORE_HEADINGS.blend.
- FAULT FIXED: first run failed (KeyError rs3_white - purged earlier); nothing was created, re-ran after recreating the material.
- Done in code_world_export.blend only.

## HEADINGS -> HTML (user: "we will draw them in HTML then")
- Deleted RS_e_heading / RS_c_heading (3D text). Added empties SLOT_experience_heading_anchor (world 4.248,-49.9,14.369) and SLOT_contact_heading_anchor (world 0.999,-55.2,17.117) at the exact spots. Title bars now hold only the 3 traffic dots.
- Handoff JSON: each of experience/contact got `heading_anchor` with world position + title-bar text box in px at 1920x1080 (Experience left 442, top 233, 186x40 at f1800; Contact left 542, top 192, 156x34 at f1990).
- A render call was blocked once by a temporary rate limit; retried and re-verified frames 1800/1990. code_world_export.blend only.

## Faults found / fixed
(none yet)
