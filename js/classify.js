import { TYPES } from "./palettes.js?v=20261003b";
const W = { t: 1.6, v: 1, c: 1 }; // temperature decides warm vs cool first (Korean method)
const dist = (a, p) => Math.sqrt(W.t * (a.t - p[0]) ** 2 + W.v * (a.v - p[1]) ** 2 + W.c * (a.c - p[2]) ** 2);
// sources: quiz {t,v,c}; photo {axes, rel}|null; drape {t,v,c,n}|null
export function combine(quiz, photo, drape) {
  const out = {}, why = [];
  for (const k of ["t", "v", "c"]) {
    let num = quiz[k] * 1, den = 1;
    if (photo?.ok) { const w = 1.2 * photo.rel[k]; num += photo.axes[k] * w; den += w; }
    if (drape && drape.n) { const w = drape[k + "n"] ? 0.9 : 0; num += drape[k] * w; den += w; }
    out[k] = num / den;
  }
  const ranked = TYPES.map(t => ({ t, d: dist(out, t.proto) })).sort((a, b) => a.d - b.d);
  const [b1, b2] = ranked;
  const margin = Math.min(1, 3 * (b2.d - b1.d) / (b2.d + 1e-6));
  const tStrength = Math.min(1, Math.abs(out.t) / 0.45);
  let agree = 0.5;
  if (photo?.ok && photo.rel.t > 0.4) agree = 1 - Math.min(1, Math.abs(quiz.t - photo.axes.t) / 1.2);
  const sources = 0.3 + (photo?.ok ? 0.4 * Math.min(1, photo.rel.t + 0.2) : 0) + (drape?.n ? 0.3 : 0);
  let conf = Math.round(100 * (0.3 * margin + 0.3 * tStrength + 0.2 * agree + 0.2 * sources));
  if (photo?.ok && photo.rel.t > 0.4 && agree < 0.45) conf = Math.min(conf, 60); // photo vs quiz disagree
  if (!photo?.ok && !drape?.n) conf = Math.min(conf, 65); // quiz alone can't be "High"
  const label = conf >= 70 ? "High" : conf >= 50 ? "Medium" : "Low";
  const lean = (x, p, n) => x > 0.15 ? p : x < -0.15 ? n : "neutral";
  why.push(`Quiz: ${lean(quiz.t, "warm", "cool")} undertone, ${lean(quiz.v, "lighter", "deeper")}, ${lean(quiz.c, "clear", "soft/muted")}.`);
  if (photo?.ok) why.push(`Photo: ${lean(photo.axes.t, "warm", "cool")} skin (hue ${photo.skin.h.toFixed(0)}°), ${lean(photo.axes.v, "light", "deep")} value, ${lean(photo.axes.c, "clear", "muted")}${photo.wb === "paper" ? ", white-balanced" : ", no white reference"}.`);
  if (drape?.n) why.push(`Drapes: you preferred ${lean(drape.t, "warm", "cool")} colors (${drape.n} picks).`);
  if (photo?.ok && agree < 0.45) why.push("Your photo and quiz disagree on undertone, so try again in daylight with white paper.");
  return { axes: out, type: b1.t.id, runnerUp: b2.t.id, conf, label, why, date: new Date().toISOString() };
}
