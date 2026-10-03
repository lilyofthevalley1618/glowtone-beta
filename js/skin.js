// Skin quiz + K-beauty routine. On-device only. General guidance, not medical advice. See docs/skincare-research.md.
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
export const SK_STEPS = [
  { id: "tight", q: "About 30 minutes after washing, before any products, your skin feels…", opts: [["vtight", "Very tight, maybe itchy"], ["tight", "A little tight"], ["fine", "Comfortable"], ["shiny", "Already shiny"]] },
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
  <div class="h-block"><p class="h-label">🫧 Skin quiz · ${st.i + 1} of ${SK_STEPS.length}</p><p class="h-name">${esc(s.q)}</p>${s.hint ? `<p class="h-text">${esc(s.hint)}</p>` : ""}</div>
  <div class="st-opts">${s.opts.map(([v, n]) => `<button class="st-opt${sel(v) ? " on" : ""}" data-act="skAns" data-v="${v}">${esc(n)}</button>`).join("")}</div>
  <div class="st-nav">${st.i ? `<button class="link" data-act="skBack">← Back</button>` : "<span></span>"}${s.multi ? `<button class="btn sm" data-act="skNext">${last ? "See my routine" : (a || []).length ? "Next" : "Skip"}</button>` : ""}</div>
  <p class="h-fine">${esc(SAFE)}</p></section>`;
}
const list = xs => xs.length ? `<ul class="st-list">${xs.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : "";
const stepCard = (s, i) => `<div class="card sk-step"><div class="sk-head"><span class="sk-n">${i + 1}</span><b>${esc(s.n)}</b><span class="sk-when">${s.when}</span></div>
  <p class="h-text">${esc(s.why)}</p><p class="h-label">Product types</p>${list(s.types)}
  <div class="sk-ing"><div><p class="h-label">Look for</p><div class="st-tags">${s.look.map(x => `<span>${esc(x)}</span>`).join("")}</div></div>
  <div><p class="h-label">Be careful with</p><div class="st-tags warn">${s.careful.map(x => `<span>${esc(x)}</span>`).join("")}</div></div></div></div>`;
export function skResultsView(r) {
  const [tn, td] = TYPE_INFO[r.type], steps = routine(r), am = steps.filter(s => s.when !== "PM"), pm = steps.filter(s => s.when !== "AM");
  return `<section class="screen home st sk">
  <div class="h-block"><p class="h-label">🫧 Your skin</p><p class="h-name">${tn} skin</p><p class="h-text">${esc(td)}</p>
  ${r.flags.length ? `<div class="sk-flags">${r.flags.map(f => `<div class="sk-flag"><b>${FLAG_INFO[f][0]}</b><span>${esc(FLAG_INFO[f][1])}</span></div>`).join("")}</div>` : ""}</div>
  <div class="sk-safe">⚕️ ${esc(SAFE)}</div>
  <div class="h-block"><p class="h-label">☀️ Morning routine</p><p class="h-text">${am.map(s => s.n).join(" → ")}</p></div>
  <div class="h-block"><p class="h-label">🌙 Night routine</p><p class="h-text">${pm.map(s => s.n).join(" → ")}</p></div>
  <div class="h-block"><p class="h-label">Step by step</p>${steps.map(stepCard).join("")}</div>
  <div class="card"><p class="h-label">Patch-test first</p>${list(PATCH)}</div>
  <div class="h-block h-soon"><p class="h-label">Product picks</p><p class="h-fine">Coming soon</p></div>
  <button class="link h-start" data-act="skRetake">Retake skin quiz</button></section>`;
}
