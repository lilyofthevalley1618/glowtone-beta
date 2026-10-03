// Style quiz + results. Body-positive and gender-neutral: every tip is about what's "flattering", never "fixing".
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
// Simple outline silhouettes (half-widths at shoulder / waist / hip).
const SHAPES = { straight: [20, 18, 20], triangle: [16, 15, 25], inverted: [26, 17, 17], hourglass: [23, 13, 23], oval: [20, 25, 21] };
export function bodySVG(id) {
  if (!SHAPES[id]) return `<svg viewBox="0 0 80 180" class="body" aria-hidden="true"><circle cx="40" cy="20" r="11"/><text x="40" y="112" text-anchor="middle" font-size="34" fill="#B9A7D9" stroke="none">?</text></svg>`;
  const [s, w, h] = SHAPES[id], c = 40;
  const d = `M${c - 6},34 L${c - s},44 Q${c - s - 2},62 ${c - w},86 Q${c - h - 2},104 ${c - h},116 L${c - h * 0.55},172 L${c - 3},172 L${c},128 L${c + 3},172 L${c + h * 0.55},172 L${c + h},116 Q${c + h + 2},104 ${c + w},86 Q${c + s + 2},62 ${c + s},44 L${c + 6},34 Z`;
  return `<svg viewBox="0 0 80 180" class="body" aria-hidden="true"><circle cx="40" cy="20" r="11"/><path d="${d}"/></svg>`;
}
export const STEPS = [
  { id: "body", q: "Which outline feels closest to you?", hint: "There's no right or wrong body. This just helps us suggest shapes you might enjoy.", body: true, opts: [
    ["straight", "Straight", "Shoulders, waist and hips about even"], ["triangle", "Lower-body curve", "Hips wider than shoulders"], ["inverted", "Upper-body width", "Shoulders wider than hips"],
    ["hourglass", "Balanced curve", "Shoulders and hips even, defined waist"], ["oval", "Fuller middle", "Softer, rounder midsection"], ["unsure", "Not sure", "We'll keep it general"]] },
  { id: "height", q: "Your height?", opts: [["petite", "Under 160 cm (5'3\")"], ["mid", "160–175 cm (5'3\"–5'9\")"], ["tall", "Over 175 cm (5'9\")"], ["skip", "Skip"]] },
  { id: "weight", q: "Weight (optional)", hint: "Totally optional. Your results don't depend on it, and it never leaves your phone.", input: true, opts: [["skip", "Skip"]] },
  { id: "shoulders", q: "Your shoulders compared to your hips?", opts: [["narrow", "Narrower"], ["even", "About the same"], ["wide", "Wider"], ["unsure", "Not sure"]] },
  { id: "fit", q: "What fit do you like to wear?", opts: [["fitted", "Fitted"], ["relaxed", "Relaxed"], ["oversized", "Oversized"], ["mix", "A mix"]] },
  { id: "vibe", q: "Your style vibe?", opts: [["minimal", "Minimal & clean"], ["soft", "Soft & cozy"], ["street", "Street & sporty"], ["classic", "Classic & preppy"], ["bold", "Edgy & bold"]] },
  { id: "highlight", q: "Anything you love to show off?", hint: "Pick up to 2, or none.", multi: 2, opts: [["shoulders", "Shoulders"], ["waist", "Waist"], ["legs", "Legs"], ["arms", "Arms"], ["neck", "Neck & collarbones"], ["none", "Nothing in particular"]] },
  { id: "wear", q: "What do you like to wear?", hint: "Pick any.", multi: 6, opts: [["pants", "Pants & jeans"], ["skirts", "Skirts & dresses"], ["shorts", "Shorts"], ["tailoring", "Blazers & tailoring"], ["knit", "Knitwear"], ["basics", "Tees & hoodies"]] },
];
// [text, tags]: tags limit an item to the clothing types the user picked (untagged = always shown).
const BODY = {
  straight: { shapes: [["Belted or wrap shapes that create a waist", []], ["Layered looks, like an open shirt over a tee", []], ["Straight- or wide-leg pants", ["pants"]], ["A-line or slip skirts", ["skirts"]]],
    cuts: [["Cropped or peplum jackets", ["tailoring"]], ["Boxy tees, half-tucked", ["basics"]], ["Chunky knits with a defined hem", ["knit"]]], necks: ["Scoop", "Square", "Sweetheart"] },
  triangle: { shapes: [["Tops with detail or structure up top", []], ["A-line or flared bottoms", ["pants", "skirts"]], ["Fit-and-flare dresses", ["skirts"]]],
    cuts: [["Structured-shoulder jackets", ["tailoring"]], ["Wide-leg or bootcut pants, mid or high rise", ["pants"]], ["Statement-sleeve knits", ["knit"]]], necks: ["Boat neck", "Square", "Off-shoulder"] },
  inverted: { shapes: [["Clean, simple tops", []], ["Volume or pattern on the bottom half", []], ["Wide-leg or cargo pants", ["pants"]], ["A-line or full skirts", ["skirts"]]],
    cuts: [["Raglan or soft sleeves", []], ["Single-breasted, soft-shoulder blazers", ["tailoring"]], ["Relaxed tees and hoodies", ["basics"]]], necks: ["V-neck", "Scoop", "Halter"] },
  hourglass: { shapes: [["Pieces that follow your waist", []], ["Wrap tops and wrap dresses", ["skirts"]], ["High-rise bottoms", ["pants", "skirts", "shorts"]]],
    cuts: [["Belted coats and tailored blazers", ["tailoring"]], ["Straight or flare jeans", ["pants"]], ["Fitted knits", ["knit"]]], necks: ["V-neck", "Sweetheart", "Scoop"] },
  oval: { shapes: [["Long lines and open layers", []], ["Fabrics that skim rather than cling", []], ["Empire or A-line shapes", ["skirts"]]],
    cuts: [["Longline cardigans and unbuttoned shirts", ["knit", "basics"]], ["Straight-leg, mid or high-rise pants", ["pants"]], ["Blazers with structured shoulders", ["tailoring"]]], necks: ["V-neck", "Open collar", "Wide scoop"] },
  unsure: { shapes: [["A simple, well-fitting base: a tee that skims and straight-leg pants", []], ["One fitted piece plus one relaxed piece", []]],
    cuts: [["Try both cropped and longline jackets to see what you like", ["tailoring"]], ["Mid-rise straight jeans are an easy start", ["pants"]]], necks: ["V-neck", "Crew neck", "Scoop"] },
};
const HEIGHT = { petite: "Cropped jackets, high-rise bottoms and one-color outfits make lines look long.", tall: "Long coats, wide-leg pants and bold color-blocking look great on a tall frame." };
const SHOULDER = { narrow: "Puff or structured sleeves and boat necks add width up top.", wide: "Raglan sleeves, V-necks and soft drape look easy and relaxed on your shoulders." };
const FIT = { fitted: "Fitted pieces in stretchy or structured fabrics keep the look sharp.", relaxed: "Relaxed fits in fabrics with nice drape look effortless, not baggy.", oversized: "Balance one oversized piece with one slimmer piece.", mix: "Mix one fitted piece with one relaxed piece in every outfit." };
const HL = { shoulders: "Off-shoulder, square or one-shoulder tops", waist: "Belts, front tucks and cropped tops", legs: "Shorter hems, slits and straight or slim legs", arms: "Sleeveless or short-sleeve tops", neck: "V-necks and open collars, plus a necklace in your metal", none: "Comfort first: pick pieces you feel great in" };
const VIBE = { minimal: ["Minimal & clean", "A neutral base with one best color"], soft: ["Soft & cozy", "Soft knits in your lightest best colors"], street: ["Street & sporty", "An oversized hoodie in a best color with wide pants in a neutral"], classic: ["Classic & preppy", "A blazer in a neutral over a shirt in a best color"], bold: ["Edgy & bold", "Your darkest neutral with one bold best color"] };

export function styleResult(ans, type) {
  const B = BODY[ans.body] || BODY.unsure, wear = ans.wear || [];
  const keep = list => { const k = list.filter(([, tags]) => !tags.length || !wear.length || tags.some(t => wear.includes(t))); return (k.length ? k : list).map(([t]) => t); };
  const tips = [HEIGHT[ans.height], SHOULDER[ans.shoulders], FIT[ans.fit]].filter(Boolean);
  const hl = (ans.highlight || []).map(h => HL[h]).filter(Boolean);
  const v = VIBE[ans.vibe] || VIBE.minimal, best = type.best, neu = type.neutrals;
  const dark = [...neu].sort((a, b) => lum(a[1]) - lum(b[1]))[0], light = [...best].sort((a, b) => lum(b[1]) - lum(a[1]))[0];
  const outfit = ans.vibe === "bold" ? [dark, best[0], best[2]] : ans.vibe === "soft" ? [light, neu[0], best[1]] : ans.vibe === "classic" ? [neu[1] || neu[0], best[0], neu[0]] : ans.vibe === "street" ? [best[0], neu[2] || neu[0], neu[0]] : [neu[0], neu[1] || neu[0], best[0]];
  return { shapes: keep(B.shapes), cuts: keep(B.cuts), necks: B.necks, tips, hl, vibe: v[0], outfitText: v[1], outfit, tops: best.slice(0, 4), bottoms: neu.slice(0, 4) };
}
const lum = h => { const n = parseInt(h.slice(1), 16); return 0.2126 * (n >> 16) + 0.7152 * (n >> 8 & 255) + 0.0722 * (n & 255); };
const chips = l => `<div class="st-chips">${l.map(([n, h]) => `<span><i style="--c:${h}"></i>${esc(n)}</span>`).join("")}</div>`;

export function quizView(st) {
  const s = STEPS[st.i], a = st.ans[s.id];
  const sel = v => s.multi ? (a || []).includes(v) : a === v;
  const opts = s.body
    ? `<div class="bodygrid">${s.opts.map(([v, n, d]) => `<button class="bodyopt${sel(v) ? " on" : ""}" data-act="stAns" data-v="${v}">${bodySVG(v)}<b>${n}</b><span>${d}</span></button>`).join("")}</div>`
    : `<div class="st-opts">${s.opts.map(([v, n]) => `<button class="st-opt${sel(v) ? " on" : ""}" data-act="stAns" data-v="${v}">${esc(n)}</button>`).join("")}</div>`;
  return `<section class="screen home st">
  <div class="h-block"><p class="h-label">Style quiz · ${st.i + 1} of ${STEPS.length}</p><p class="h-name">${esc(s.q)}</p>${s.hint ? `<p class="h-text">${esc(s.hint)}</p>` : ""}</div>
  ${s.input ? `<div class="st-input"><input id="stW" inputmode="numeric" placeholder="e.g. 55 kg or 120 lb" value="${esc(typeof a === "string" && a !== "skip" ? a : "")}"><button class="btn sm" data-act="stWeight">Next</button></div>` : ""}
  ${opts}
  <div class="st-nav">${st.i ? `<button class="link" data-act="stBack">← Back</button>` : "<span></span>"}${s.multi ? `<button class="btn sm" data-act="stNext">${st.i === STEPS.length - 1 ? "See my style" : "Next"}</button>` : ""}</div></section>`;
}
export function resultsView(r, type, ans, sw) {
  const sec = (title, items) => items.length ? `<div class="h-block"><p class="h-label">${title}</p><ul class="st-list">${items.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>` : "";
  return `<section class="screen home st">${sw}
  <div class="h-block st-hero">${bodySVG(ans.body)}<div><p class="h-label">Your style</p><p class="h-name">${esc(r.vibe)} · ${type.season} ${type.tone} ${type.sub}</p><p class="h-text">Shapes, cuts and colors that flatter you. Wear what you love!</p></div></div>
  ${sec("Flattering shapes", r.shapes)}${sec("Cuts to try", r.cuts)}
  <div class="h-block"><p class="h-label">Necklines</p><div class="st-tags">${r.necks.map(n => `<span>${esc(n)}</span>`).join("")}</div></div>
  ${sec("Show off", r.hl)}${sec("Good to know", r.tips)}
  <div class="h-block"><p class="h-label">Outfit idea in your palette</p><div class="st-outfit">${r.outfit.map(([n, h]) => `<i style="--c:${h}" title="${esc(n)}"></i>`).join("")}</div><p class="h-text">${esc(r.outfitText)}: ${r.outfit.map(o => o[0].toLowerCase()).join(" + ")}.</p></div>
  <div class="h-block"><p class="h-label">Tops near your face</p>${chips(r.tops)}</div>
  <div class="h-block"><p class="h-label">Bottoms & basics</p>${chips(r.bottoms)}</div>
  <div class="h-block h-soon"><p class="h-label">Product picks</p><p class="h-fine">Coming soon</p></div>
  <button class="link h-start" data-act="stRetake">Retake style quiz</button></section>`;
}
