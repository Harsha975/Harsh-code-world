// Scroll is NOT linear in frames. Travel frames fly past quickly; the frames where a
// content zone is on screen get much more scroll distance so people can actually read.
// Units are "screens of scroll per frame". Tune these numbers, nothing else.
export const SCROLL_CFG = {
  travel: 0.0035,
  home: 0.010,
  about: 0.012,
  skills: 0.012,
  project: 0.030,
  experience: 0.012,
  contact: 0.012,
};

export function buildScrollMap(zones, total = 2040, cfg = SCROLL_CFG) {
  const w = new Float64Array(total + 2).fill(cfg.travel);
  for (const [key, z] of Object.entries(zones)) {
    if (!z.visible_frames) continue;
    const wt = key.startsWith('project_') ? cfg.project : cfg[key] ?? cfg.travel;
    for (let f = z.visible_frames[0]; f <= z.visible_frames[1]; f++) w[f] = wt;
  }
  const cum = new Float64Array(total + 2);
  for (let f = 2; f <= total; f++) cum[f] = cum[f - 1] + (w[f - 1] + w[f]) / 2;
  const screens = cum[total];

  function frameToScreens(frame) {
    const f = Math.min(Math.max(frame, 1), total);
    const i = Math.floor(f);
    const j = Math.min(i + 1, total);
    return cum[i] + (cum[j] - cum[i]) * (f - i);
  }
  function screensToFrame(s) {
    const x = Math.min(Math.max(s, 0), screens);
    let lo = 1, hi = total;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] <= x) lo = mid; else hi = mid;
    }
    const span = cum[lo + 1] - cum[lo];
    return lo + (span > 0 ? (x - cum[lo]) / span : 0);
  }
  return { screens, frameToScreens, screensToFrame };
}
