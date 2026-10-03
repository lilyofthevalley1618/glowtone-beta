// Expert scan: scores measured facial coloring against Korean consultant criteria (docs/korean-12-type-research.md).
// Independent of quiz + drape picks. Rule-based color science, not AI. Runs on-device.
import { TYPES } from "./palettes.js";
const cl = (x, a = -1, b = 1) => Math.max(a, Math.min(b, x));
const wrap = h => h > 200 ? h - 360 : h;
// P = output of color.analyze(): white-balanced Lab for skin/hair/eye + reliability.
export function features(P) {
  const { skin, hair, eye } = P;
  // Undertone (T): skin hue angle is primary (golden = warm, pink = cool); hair warmth adds a little if hair isn't near-black.
  let T = cl((wrap(skin.h) - 58) / 10), notes = {};
  if (hair && hair.L > 25 && hair.C > 4) { const hw = cl((wrap(hair.h) - 55) / 15); T = 0.8 * T + 0.2 * hw; notes.hairWarm = hw; }
  // Value (V): overall lightness of skin, hair, eyes.
  const parts = [[cl((skin.L - 63) / 12), 0.5]]; if (hair) parts.push([cl((hair.L - 28) / 18), 0.3]); if (eye) parts.push([cl((eye.L - 30) / 15), 0.2]);
  const V = parts.reduce((s, [x, w]) => s + x * w, 0) / parts.reduce((s, [, w]) => s + w, 0);
  // Contrast (K): skin lightness vs darkest feature (hair or eyes).
  const dark = Math.min(hair ? hair.L : 99, eye ? eye.L : 99), contrast = dark < 99 ? skin.L - dark : null;
  const K = contrast == null ? 0 : cl((contrast - 38) / 15);
  // Chroma (C): skin clarity relative to what's typical at that lightness (fair skin is naturally lower-chroma),
  // plus iris clarity, plus feature contrast (consultants read clear/bright types as vivid, high-contrast coloring).
  const cs = cl((skin.C - (22 - 0.4 * (skin.L - 63))) / 7), ce = eye ? cl((eye.C - 14) / 8) : 0;
  const C = cl(0.45 * cs + (eye ? 0.25 * ce : 0) + (contrast == null ? 0 : 0.3 * K));
  const rel = { T: P.rel.t, V: P.rel.v, C: P.rel.c, K: contrast == null ? 0 : Math.min(1, P.rel.v + 0.2) };
  return { T, V, C, K, rel, raw: { skinH: skin.h, skinL: skin.L, skinC: skin.C, hairL: hair?.L, eyeL: eye?.L, eyeC: eye?.C, contrast }, notes };
}
const W = { T: 1.6, V: 1, C: 1, K: 0.8 };
export function expertScan(P) {
  if (!P?.ok) return null;
  const f = features(P), keys = ["T", "V", "C", "K"];
  const ranked = TYPES.map(t => ({ t, d: Math.sqrt(keys.reduce((s, k, i) => s + W[k] * (0.25 + 0.75 * f.rel[k]) * (f[k] - t.crit[i]) ** 2, 0)) })).sort((a, b) => a.d - b.d);
  const [b1, b2] = ranked, margin = Math.min(1, 3 * (b2.d - b1.d) / (b2.d + 1e-6));
  const relAvg = (f.rel.T * 2 + f.rel.V + f.rel.C + f.rel.K) / 5;
  let conf = Math.round(100 * (0.35 * margin + 0.25 * Math.min(1, Math.abs(f.T) / 0.45) + 0.4 * relAvg));
  conf = Math.min(conf, P.wb === "paper" ? 90 : 60); // a single photo is never certain
  const label = conf >= 70 ? "High" : conf >= 50 ? "Medium" : "Low";
  return { type: b1.t.id, runnerUp: b2.t.id, conf, label, reasons: reasons(f, b1.t), f };
}
function reasons(f, t) {
  const r = [], h = f.raw.skinH.toFixed(0), c = t.crit;
  const cand = [
    [Math.abs(f.T) * 1.2, f.T > 0.15 ? `Your skin leans golden-yellow (hue ${h}°), a warm undertone` : f.T < -0.15 ? `Your skin leans pink-rosy (hue ${h}°), a cool undertone` : `Your undertone reads close to neutral (hue ${h}°)`],
    [Math.abs(f.K) * (Math.sign(f.K) === Math.sign(c[3]) ? 1.1 : 0.4), f.K > 0.2 ? `High contrast between your ${f.raw.hairL < f.raw.skinL - 40 ? "dark hair" : "darker features"} and ${f.raw.skinL > 65 ? "fair " : ""}skin` : f.K < -0.2 ? "Soft, low contrast between your hair, eyes and skin" : "Medium contrast between your hair, eyes and skin"],
    [Math.abs(f.V) * (Math.sign(f.V) === Math.sign(c[1]) ? 1 : 0.4), f.V > 0.2 ? "Light overall coloring (skin, hair and eyes)" : f.V < -0.2 ? "Deep overall coloring, with rich hair and eye depth" : "Medium overall depth"],
    [Math.abs(f.C) * (Math.sign(f.C) === Math.sign(c[2]) ? 1 : 0.4), f.C > 0.2 ? "Clear, vivid skin and eye coloring" : f.C < -0.2 ? "Soft, slightly muted coloring" : "Balanced clarity, neither very vivid nor very soft"],
  ].sort((a, b) => b[0] - a[0]);
  for (const [, s] of cand.slice(0, 3)) r.push(s);
  return r;
}
