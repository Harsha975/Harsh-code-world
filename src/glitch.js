// The monitor glitch, copied from the Blender keyframes on the GL_Glitch node
// (constant interpolation, 24 fps). 1 = fully torn, 0 = clean.
const KEYS = [
  [1, 0], [100, 0], [122, 0], [124, 0.5], [127, 0.1], [130, 0.9],
  [133, 0.3], [136, 1.0], [139, 0.5], [142, 1.0], [145, 1.0], [147, 1.0], [149, 0],
];

export const CUT_FRAME = 148; // Blender hard-cuts from the desk to the street here

export function glitchAt(frame) {
  let v = 0;
  for (const [f, g] of KEYS) {
    if (frame >= f) v = g;
    else break;
  }
  return v;
}

// Screen-wide stripes: ramp up before the dive, keep tearing, and fade out after the cut
// so the jump to the street reads as an anime-style transition instead of a jump.
export function overlayGlitch(frame) {
  const tail = frame >= CUT_FRAME && frame < CUT_FRAME + 12 ? 1 - (frame - CUT_FRAME) / 12 : 0;
  const ramp = frame >= 112 && frame < 124 ? ((frame - 112) / 12) * 0.35 : 0;
  return Math.max(glitchAt(frame) * 0.75, tail * 0.9, ramp);
}
