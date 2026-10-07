// Skin quiz + K-beauty routine. On-device only. General guidance, not medical advice. See docs/skincare-research.md.
import { picksFor, swatch } from "./skincare.js?v=20261007b";
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
export const SK_STEPS = [
  { id: "tight", q: "After washing your face, how does your skin feel?", hint: "About 30 minutes after washing, before any products.", opts: [["vtight", "Very tight, maybe itchy"], ["tight", "A little tight"], ["fine", "Comfortable"], ["shiny", "Already shiny"]] },
  { id: "flaky", q: "Do you get flaky or rough patches?", opts: [["often", "Often"], ["some", "Sometimes, e.g. in winter"], ["rare", "Rarely or never"]] },
  { id: "acne", q: "How often do you get breakouts?", opts: [["rare", "Rarely"], ["month", "A few around my period or stressful weeks"], ["often", "Most weeks"], ["always", "Almost always some"]] },
  { id: "where", q: "Where do breakouts usually show up?", hint: "Pick any that apply, or skip.", multi: 4, opts: [["forehead", "Forehead"], ["nose", "Nose"], ["cheeks", "Cheeks"], ["jaw", "Chin & jawline"], ["none", "Not really anywhere"]] },
  { id: "oil", q: "Where does your skin get oily?", opts: [["none", "Hardly anywhere"], ["tzone", "Forehead, nose and chin (T-zone)"], ["all", "All over"]] },
  { id: "dewy", q: "Without products, does your skin look moist or dewy?", opts: [["yes", "Yes, it looks naturally dewy"], ["some", "Only in some spots"], ["no", "No, more dull or dry"]] },
  { id: "midday", q: "By midday, your skin feels…", opts: [["dry", "Tight or dull"], ["fine", "About the same as morning"], ["tshine", "Shiny on the T-zone"], ["allshine", "Shiny all over"], ["oilytight", "Oily on top but tight underneath"]] },
  { id: "sens", q: "Do products sting, burn or leave you red?", opts: [["often", "Often, or my skin flushes easily"], ["some", "Sometimes with new products"], ["rare", "Rarely"]] },
  { id: "pores", q: "Your pores look…", opts: [["small", "Barely visible"], ["nose", "Visible on my nose"], ["big", "Visible on my nose and cheeks"]] },
  { id: "spots", q: "Dark spots, leftover marks from pimples, or uneven tone?", opts: [["lots", "Quite a bit"], ["some", "A few"], ["none", "Not really"]] },
  { id: "age", q: "Your age range (optional)", hint: "It only adjusts a couple of tips. Stays on your phone.", opts: [["teen", "Under 18"], ["18", "18–24"], ["25", "25–34"], ["35", "35+"], ["skip", "Skip"]] },
  { id: "routine", q: "What do you use now? (optional)", hint: "Pick any, or skip.", multi: 6, opts: [["cleanser", "Cleanser"], ["moist", "Moisturizer"], ["spf", "Sunscreen"], ["actives", "Acids or retinol"], ["nothing", "Nothing yet"]] }];

export function skinResult(a) {
  const pts = { tight: { vtight: [3, 0], tight: [2, 0], fine: [0, 0], shiny: [0, 3] }, flaky: { often: [2, 0], some: [1, 0], rare: [0, 0] },
    dewy: { yes: [0, 1], some: [0, 0], no: [1, 0] }, midday: { dry: [2, 0], fine: [0, 0], tshine: [0, 1], allshine: [0, 3], oilytight: [0, 2] }, pores: { small: [0, 0], nose: [0, 1], big: [0, 2] } };
  let D = 0, O = 0; for (const k in pts) { const p = pts[k][a[k]]; if (p) { D += p[0]; O += p[1]; } }
  O += a.oil === "all" ? 3 : a.oil === "tzone" ? 1 : 0;
  const tz = a.oil === "tzone" || a.midday === "tshine";
  const type = O >= 6 && !tz ? "oily" : O >= 5 && a.oil === "all" ? "oily" : tz && (O >= 3 || D >= 1) ? "combination" : D >= 3 ? "dry" : O >= 4 ? "oily" : "normal";
  const flags = [];
  if (a.sens === "often" || (a.sens === "some" && (a.flaky === "often" || a.tight === "vtight"))) flags.push("sensitive");
  if (a.acne === "often" || a.acne === "always") flags.push("acne");
  if (a.spots === "lots" || a.spots === "some") flags.push("pigment");
  if (a.midday === "oilytight" || (type !== "dry" && (a.tight === "tight" || a.tight === "vtight")) || (type === "dry" && a.dewy === "no" && a.flaky !== "often")) flags.push("dehydrated");
  return { type, flags, D, O, a };
}
export const TYPE_INFO = { dry: ["Dry", "Your skin makes less oil, so it can feel tight or flaky. Focus on cushioning moisture and a gentle cleanse."],
  oily: ["Oily", "Your skin makes plenty of oil, so shine and visible pores are common. Light, layered hydration keeps it balanced."],
  combination: ["Combination", "Oilier on the T-zone and normal to dry on the cheeks. Use light layers and add a richer cream only where you need it."],
  normal: ["Normal", "Mostly balanced, not very oily or dry. Keep it simple: cleanse gently, hydrate and wear sunscreen every day."] };
export const FLAG_INFO = { sensitive: ["Sensitive", "Go slow, choose fragrance-free and add one new product at a time."], acne: ["Acne-prone", "Choose non-comedogenic textures and be gentle. Picking and scrubbing make it worse."],
  pigment: ["Dark spots", "Daily sunscreen does the most, and brightening ingredients help over months."], dehydrated: ["Dehydrated", "Low on water (not the same as oil), so add watery layers like toner and essence."] };

export function routine(r) {
  const { type, flags, a } = r, f = x => flags.includes(x), oily = type === "oily", dry = type === "dry", combo = type === "combination", teen = a.age === "teen";
  const careSens = f("sensitive") ? ["fragrance and essential oils", "alcohol-heavy formulas"] : ["heavy fragrance"];
  const steps = [
    { n: "Oil cleanser", when: "PM", why: "Melts sunscreen and makeup so your second cleanse can be gentle. On days with no sunscreen or makeup, you can skip it.",
      types: oily || f("acne") ? ["Light cleansing oil that rinses off milky", "Cleansing water or micellar water"] : ["Cleansing balm", "Cleansing oil"],
      look: dry ? ["Squalane", "Plant oils like jojoba or sunflower"] : ["Light oils that rinse clean (emulsify)"], careful: [...careSens, ...(f("acne") ? ["Heavy oils that leave a film; rinse well"] : [])] },
    { n: "Water cleanser", when: "AM + PM", why: dry || f("sensitive") ? "In the morning a splash of water is enough. At night, use a gentle cleanser." : "Gentle and low-pH, so skin feels clean but not squeaky.",
      types: dry || f("sensitive") ? ["Cream or milk cleanser", "Low-pH gel cleanser"] : ["Low-pH gel or foam cleanser"],
      look: ["Glycerin", ...(f("acne") ? ["Salicylic acid (BHA) cleanser, a few times a week"] : []), ...(f("sensitive") ? ["Centella (cica)"] : [])], careful: ["Strong sulfates (SLS)", "Gritty scrubs", "Hot water", ...(f("sensitive") ? ["Fragrance"] : [])] },
    { n: "Toner", when: "AM + PM", why: "In K-beauty, toner is a watery hydration layer, not a harsh astringent. Pat it in with your hands.",
      types: ["Hydrating toner", ...(f("acne") || oily ? ["BHA or PHA exfoliating toner, 2–3 nights a week (PM)"] : f("pigment") || dry ? ["Gentle PHA or AHA toner, 1–2 nights a week (PM)"] : [])],
      look: ["Hyaluronic acid", "Panthenol", ...(f("sensitive") ? ["Centella", "Mugwort"] : ["Green tea"])], careful: ["Lots of denatured alcohol", "Exfoliating every day", ...(f("sensitive") ? ["AHA (start with PHA instead)"] : [])] },
    { n: "Essence / serum", when: "AM + PM", why: "Your targeted step. Pick one main serum, not a stack of strong ones.",
      types: ["Lightweight essence or serum", ...(f("pigment") ? ["Brightening serum"] : []), ...(f("acne") ? ["Calming acne serum"] : [])],
      look: [...(oily || combo || f("acne") || f("pigment") ? ["Niacinamide"] : []), ...(f("dehydrated") || dry ? ["Hyaluronic acid", "Beta-glucan"] : []), ...(f("sensitive") ? ["Centella (madecassoside)", "Panthenol"] : []),
        ...(f("pigment") ? ["Vitamin C (AM)", "Tranexamic acid", "Azelaic acid", "Licorice root"] : []), ...(f("acne") ? ["Azelaic acid", "Tea tree (low %)"] : []), ...(!teen && !f("sensitive") && (a.age === "25" || a.age === "35") ? ["Retinal or retinol (PM, start 2 nights a week)"] : [])],
      careful: ["Strong actives on the same night (retinol + AHA/BHA, or vitamin C + acids). Use them on different days", ...(teen ? ["Retinoids, unless a dermatologist recommends them"] : []), ...(f("sensitive") ? ["High-strength vitamin C"] : [])] },
    { n: "Moisturizer", when: "AM + PM", why: dry ? "Locks everything in. Use a richer layer at night." : combo ? "A light gel-cream all over, plus a richer cream on dry cheeks if needed." : oily ? "Even oily skin needs one. Pick something light so skin doesn't overproduce oil." : "A simple cream that keeps your barrier happy.",
      types: dry ? ["Cream", "Richer barrier cream (PM)"] : oily ? ["Gel or gel-cream (oil-free)"] : ["Gel-cream or light lotion"],
      look: ["Ceramides", ...(dry ? ["Shea butter", "Squalane"] : ["Glycerin"]), ...(f("sensitive") ? ["Centella", "Panthenol"] : []), ...(f("acne") ? ["Non-comedogenic label"] : [])], careful: [...careSens, ...(oily || f("acne") ? ["Thick occlusives like heavy butters on breakout areas"] : [])] },
    { n: "Sunscreen", when: "AM", why: "The most important step, every day, even when it's cloudy. Use about two finger-lengths for your face and neck, and reapply every 2 hours outdoors.",
      types: [f("pigment") ? "SPF 50+, PA++++" : "SPF 30+, PA+++ or higher", oily || f("acne") ? "Light fluid or gel sunscreen" : dry ? "Moisturizing sun cream" : "Light sun cream or fluid", ...(f("sensitive") ? ["Mineral sunscreen (zinc oxide)"] : [])],
      look: ["Broad spectrum (UVA + UVB)", ...(f("sensitive") ? ["Zinc oxide", "Fragrance-free"] : []), ...(f("pigment") ? ["Tinted formulas with iron oxides"] : [])], careful: ["Using too little", "Skipping reapplication", ...careSens] }];
  return steps;
}
export const PATCH = ["Test one new product at a time. Apply a small amount to your inner arm or the bend of your elbow, twice a day for 7–10 days.",
  "For face products, then try a small spot along your jaw for a few days.", "Redness, itching or swelling? Wash it off and stop using it.", "Start strong actives (acids, retinol) 2–3 times a week and build up slowly."];
export const SAFE = "Not medical advice. See a dermatologist for serious, painful or persistent concerns, like painful or cystic acne, rashes, or spots that change.";

export function skQuizView(st) {
  const s = SK_STEPS[st.i], a = st.ans[s.id], sel = v => s.multi ? (a || []).includes(v) : a === v, last = st.i === SK_STEPS.length - 1;
  return `<section class="screen home st">
  <div class="bar"><i style="width:${(st.i / SK_STEPS.length) * 100}%"></i></div>
  <div class="h-block"><p class="h-label">Skin quiz · ${st.i + 1} of ${SK_STEPS.length}</p><p class="h-name">${esc(s.q)}</p>${s.hint ? `<p class="h-text">${esc(s.hint)}</p>` : ""}</div>
  <div class="st-opts">${s.opts.map(([v, n]) => `<button class="st-opt${sel(v) ? " on" : ""}" data-act="skAns" data-v="${v}">${esc(n)}</button>`).join("")}</div>
  <div class="st-nav">${st.i ? `<button class="link" data-act="skBack">← Back</button>` : "<span></span>"}${s.multi ? `<button class="btn sm" data-act="skNext">${last ? "See my routine" : (a || []).length ? "Next" : "Skip"}</button>` : ""}</div>
  <p class="h-fine">${esc(SAFE)}</p></section>`;
}
const list = xs => xs.length ? `<ul class="st-list">${xs.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : "";
const stepCard = (s, i) => `<div class="card sk-step"><div class="sk-head"><span class="sk-n">${i + 1}</span><b>${esc(s.n)}</b><span class="sk-when">${s.when}</span></div>
  <p class="h-text">${esc(s.why)}</p><p class="h-label">Product types</p>${list(s.types)}
  <div class="sk-ing"><div><p class="h-label">Look for</p><div class="st-tags">${s.look.map(x => `<span>${esc(x)}</span>`).join("")}</div></div>
  <div><p class="h-label">Be careful with</p><div class="st-tags warn">${s.careful.map(x => `<span>${esc(x)}</span>`).join("")}</div></div></div></div>`;
// Minimal routine: 3-4 steps each, tailored by skin type. Labels double as the Home checklist.
export function minimal(r) {
  const { type, flags } = r, f = x => flags.includes(x), dry = type === "dry", oily = type === "oily" || type === "combination";
  const pick = c => picksFor(r, c)[0];
  const am = [
    { k: "Cleanse", d: dry || f("sensitive") ? "Optional: a splash of water is enough" : "Gentle low-pH cleanser", p: dry || f("sensitive") ? null : picksFor(r, "cleanser").find(x => x.id !== "anuaOil") },
    { k: "Serum", d: f("pigment") ? "Vitamin C for dark spots" : "Hydrating toner or serum", p: f("pigment") ? pick("serum") : pick("toner") || pick("serum") },
    { k: "Moisturize", d: dry ? "Barrier cream" : oily ? "Light gel-cream" : "Light cream", p: pick("moisturizer") },
    { k: "SPF", d: "SPF 50, two finger-lengths", p: pick("sunscreen") }];
  const pm = [
    { k: "Cleanse", d: "Oil or balm first if you wore SPF or makeup, then a gentle cleanser", p: pick("cleanser") },
    { k: "Treat", d: f("acne") || oily ? "Soothing toner; pore pads 2–3 nights a week" : f("pigment") ? "Hydrating serum (vitamin C stays in the morning)" : "Hydrating serum", p: f("acne") || oily ? pick("toner") : picksFor(r, "serum").find(x => x.id !== "goodal") || pick("serum") },
    { k: "Moisturize", d: dry ? "A richer layer of cream" : "Same moisturizer as the morning", p: pick("moisturizer") }];
  return { am, pm };
}
const pickLine = p => p ? `<span class="rt-pick">${esc(p.brand)} ${esc(p.name)}${p.fav ? ' <em class="fav">Favorite</em>' : ""}</span>` : "";
const stepsList = xs => `<ol class="rt-min">${xs.map(x => `<li><b>${esc(x.k)}</b><span>${esc(x.d)}</span>${pickLine(x.p)}</li>`).join("")}</ol>`;
const pickCard = p => `<div class="pk-card">${swatch(p.cat)}<div><p class="pk-name">${esc(p.name)}${p.fav ? ' <em class="fav">Favorite</em>' : ""}</p><p class="pk-meta">${esc(p.brand)} · ${p.cat}${p.price ? ` · ~$${Math.round(p.price)}` : ""}${p.v ? "" : ' · <span class="unv">unverified</span>'}</p><p class="pk-why">${esc(p.why)}</p></div></div>`;
export function skResultsView(r) {
  const [tn, td] = TYPE_INFO[r.type], m = minimal(r), all = picksFor(r), top = all.slice(0, 4), more = all.slice(4);
  return `<section class="screen home st sk sk2">
  <div class="sec sk-hero"><p class="h-label">Your skin type</p><p class="sk-type">${tn} skin</p><p class="h-text">${esc(td.split(". ")[0])}.</p>
  ${r.flags.length ? `<div class="st-tags">${r.flags.map(f => `<span>${FLAG_INFO[f][0]}</span>`).join("")}</div>` : ""}</div>
  <div class="card sec rt-sec"><h2 class="sec-h am"><svg class="sec-ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.5" fill="#F3D9A8"/><g stroke="#D9B27A" stroke-width="1.6" stroke-linecap="round"><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M5.3 18.7 7 17M17 7l1.7-1.7"/></g></svg>Morning</h2>${stepsList(m.am)}</div>
  <div class="card sec rt-sec"><h2 class="sec-h pm"><svg class="sec-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 15.5A7.5 7.5 0 0 1 8.5 5a7.5 7.5 0 1 0 10.5 10.5z" fill="#C9C2D6" stroke="#A89BB8" stroke-width="1.2" stroke-linejoin="round"/></svg>Night</h2>${stepsList(m.pm)}</div>
  <p class="h-fine less">Fewer products is better. Add one new thing at a time.</p>
  <div class="sec"><h3 class="sec-h2">Picks for you</h3>${top.map(pickCard).join("")}
  ${more.length ? `<details class="more"><summary>More picks (${more.length})</summary>${more.map(pickCard).join("")}</details>` : ""}</div>
  <div class="sec"><h3 class="sec-h2">Tips</h3>
  ${r.flags.map(f => `<p class="h-text"><b>${FLAG_INFO[f][0]}.</b> ${esc(FLAG_INFO[f][1])}</p>`).join("")}
  <details class="more"><summary>Step-by-step details</summary>${routine(r).map(stepCard).join("")}</details>
  <details class="more"><summary>Patch-test first</summary>${list(PATCH)}</details>
  <p class="h-fine">${esc(SAFE)}</p></div>
  <button class="link h-start" data-act="skRetake">Retake skin quiz</button></section>`;
}
