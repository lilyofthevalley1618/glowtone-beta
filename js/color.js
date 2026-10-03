// Pure color math (no DOM) so it can be unit-tested in Node.
const clamp = (x, a = -1, b = 1) => Math.max(a, Math.min(b, x));
export const toLin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const f = t => t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116;
export function linToLab(r, g, b) { // linear sRGB -> CIELAB (D65)
  const X = 0.4124 * r + 0.3576 * g + 0.1805 * b, Y = 0.2126 * r + 0.7152 * g + 0.0722 * b, Z = 0.0193 * r + 0.1192 * g + 0.9505 * b;
  const fx = f(X / 0.95047), fy = f(Y), fz = f(Z / 1.08883);
  const L = 116 * fy - 16, A = 500 * (fx - fy), B = 200 * (fy - fz);
  return { L, a: A, b: B, C: Math.hypot(A, B), h: ((Math.atan2(B, A) * 180 / Math.PI) + 360) % 360 };
}
export const rgbToLab = (r, g, b) => linToLab(toLin(r), toLin(g), toLin(b));
const median = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[s.length >> 1] : NaN; };

// px: array of [r,g,b] (0-255). gains: linear-RGB multipliers from white balance.
function labsOf(px, gains) {
  return px.map(([r, g, b]) => linToLab(Math.min(1, toLin(r) * gains[0]), Math.min(1, toLin(g) * gains[1]), Math.min(1, toLin(b) * gains[2])));
}
function summarize(labs, lo = 0.1, hi = 0.9) { // trim by lightness, then median
  const s = labs.filter(l => l.L > 3).sort((x, y) => x.L - y.L);
  const t = s.slice(Math.floor(s.length * lo), Math.max(1, Math.ceil(s.length * hi)));
  if (!t.length) return null;
  const a = median(t.map(l => l.a)), b = median(t.map(l => l.b));
  return { L: median(t.map(l => l.L)), a, b, C: Math.hypot(a, b), h: ((Math.atan2(b, a) * 180 / Math.PI) + 360) % 360, n: t.length };
}

// Main analysis. samples = {skin:[...], hair:[...], eye:[...], paper:[...]|null}
export function analyze(samples) {
  const warnings = []; let rel = { t: 1, v: 1, c: 1 };
  let gains = [1, 1, 1], wb = "none";
  const rawSkin = summarize(labsOf(samples.skin || [], [1, 1, 1]));
  if (!rawSkin) return { ok: false, warnings: ["Couldn't read skin pixels."], rel: { t: 0, v: 0, c: 0 } };

  if (samples.paper && samples.paper.length) {
    const pr = summarize(labsOf(samples.paper, [1, 1, 1]), 0, 1);
    if (!pr || pr.L < rawSkin.L + 5 || pr.C > 45) { warnings.push("That spot doesn't look like white paper, so we skipped white balance."); samples.paper = null; }
  }
  if (samples.paper && samples.paper.length) {
    const lin = [0, 1, 2].map(k => median(samples.paper.map(p => toLin(p[k]))));
    const raw = linToLab(...lin);
    const clipped = samples.paper.filter(p => Math.max(...p) >= 252).length / samples.paper.length > 0.5;
    if (raw.L < 35) { warnings.push("It looks quite dark. Move closer to a window for a better reading."); rel.t *= 0.6; rel.v *= 0.6; rel.c *= 0.6; }
    if (raw.C > 30) { warnings.push("Strong color cast detected (corrected with your paper, but extra care needed)."); rel.t *= 0.7; rel.c *= 0.8; }
    else if (raw.C > 12) warnings.push("Your lighting has a color tint. We corrected it using the white paper.");
    if (clipped) { warnings.push("The paper is overexposed, so the white balance is approximate."); rel.t *= 0.8; rel.v *= 0.8; }
    const avg = Math.max(1e-3, (lin[0] + lin[1] + lin[2]) / 3), s = Math.min(0.85 / avg, 4); // exposure: paper -> ~L 94
    gains = lin.map(c => s * avg / Math.max(1e-3, c));                                        // neutralize paper's tint
    wb = "paper"; samples._paperRaw = raw;
  } else {
    warnings.push("No white paper, so lighting may shift your colors. Your quiz counts more.");
    rel.t *= 0.55; rel.v *= 0.5; rel.c *= 0.7;
  }
  if (rawSkin.L < 30) { warnings.push("Low light: your face is underexposed."); rel.t *= 0.6; rel.v *= 0.5; rel.c *= 0.6; }
  if (rawSkin.L > 92) { warnings.push("Too bright: your skin is washed out. Avoid direct sun or flash."); rel.t *= 0.6; rel.v *= 0.5; rel.c *= 0.5; }

  const skin = summarize(labsOf(samples.skin, gains));
  if (!skin) return { ok: false, warnings: ["Couldn't read skin pixels."], rel: { t: 0, v: 0, c: 0 } };
  // Hair: keep only pixels clearly darker than skin (drops forehead/background), then the darkest half.
  let hair = null;
  if (samples.hair && samples.hair.length) {
    const hl = labsOf(samples.hair, gains).filter(l => l.L < skin.L - 12);
    if (hl.length >= Math.max(8, samples.hair.length * 0.08)) hair = summarize(hl, 0, 0.5);
    else { warnings.push("Couldn't find your hair clearly, so contrast is estimated from your eyes."); }
  }
  // Eyes: sample area includes eyelid skin, so use the darker part (iris + lashes), skipping the very darkest (pupil).
  let eye = null;
  if (samples.eye && samples.eye.length) {
    const el = labsOf(samples.eye, gains).filter(l => l.L < skin.L - 15);
    if (el.length >= 6) eye = summarize(el, 0.1, 0.6); else warnings.push("Couldn't read your eye color clearly.");
  }

  if ((skin.h > 200 ? skin.h - 360 : skin.h) < 25 || skin.h > 85 || skin.C < 5) { warnings.push("Your skin reading looks unusual (makeup, filters or a color cast?). Leaning on your quiz."); rel.t *= 0.4; rel.c *= 0.6; }

  // Temperature: skin hue angle. Higher = more yellow/golden (warm), lower = more pink/red (cool).
  const hs = skin.h > 200 ? skin.h - 360 : skin.h; // wrap pinkish-red hues near 360° to negative
  const t = clamp((hs - 58) / 10); // ~±10° hue spans cool→warm (calibration estimate)
  // Value: lightness of skin, hair, eyes (needs exposure normalization for absolute L).
  const parts = [[clamp((skin.L - 63) / 12), 0.5]];
  if (hair) parts.push([clamp((hair.L - 28) / 18), 0.3]);
  if (eye) parts.push([clamp((eye.L - 30) / 15), 0.2]);
  const v = parts.reduce((s, [x, w]) => s + x * w, 0) / parts.reduce((s, [, w]) => s + w, 0);
  // Chroma/clarity: skin chroma + facial contrast (skin vs darkest of hair/eyes).
  const dark = Math.min(hair ? hair.L : 99, eye ? eye.L : 99);
  const contrast = dark < 99 ? skin.L - dark : null;
  const cs = clamp((skin.C - 22) / 7);
  const c = contrast == null ? cs : 0.6 * clamp((contrast - 38) / 15) + 0.4 * cs;
  if (!hair && !eye) { rel.v *= 0.7; rel.c *= 0.6; }
  return { ok: true, wb, gains, skin, hair, eye, contrast, axes: { t, v, c }, rel, warnings };
}
