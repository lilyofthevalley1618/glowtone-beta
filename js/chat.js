/* =========================================================
   ASK GLOWTONE: chat tab (modeled on Zapling's Sprig chat)
   Mode 1: free offline helper that answers from Glowtone's own data (default)
   Mode 2: optional bring-your-own-key, OpenAI-compatible /chat/completions
   The key lives ONLY in this browser's localStorage under 'glowtone.ai'. No Glowtone server.
   ========================================================= */
import { TYPES, byId, nameOf } from "./palettes.js?v=20261003b";
import { rgbToLab } from "./color.js?v=20261003b";
import { KBEAUTY_TIPS, tipOfDay, colorOfDay } from "./daily.js?v=20261003b";
import { MAKEUP, FOUNDATION, SHADE_TEST } from "./makeup.js?v=20261003b";
import { styleResult } from "./style.js?v=20261003b";
import { load } from "./storage.js?v=20261003b";
import { picksFor } from "./products.js?v=20261003b";
import { skinResult, routine, TYPE_INFO, FLAG_INFO, SAFE, PATCH } from "./skin.js?v=20261003b";

const AIKEY = "glowtone.ai";
export const AI_PRESETS = {
  xai: { name: "xAI (Grok)", base: "https://api.x.ai/v1", model: "grok-4.7", models: ["grok-4.7", "grok-4.3"], where: "console.x.ai → API Keys" },
  openai: { name: "OpenAI", base: "https://api.openai.com/v1", model: "gpt-6-luna", models: ["gpt-6-luna", "gpt-5.6-luna", "gpt-5.4-mini"], where: "platform.openai.com → API keys" },
  custom: { name: "Custom (OpenAI-compatible)", base: "", model: "", models: [], where: "your provider's dashboard" },
};
const aiLoad = () => { try { const c = JSON.parse(localStorage.getItem(AIKEY)); return c && typeof c === "object" ? c : {}; } catch { return {}; } };
const aiSave = c => { try { localStorage.setItem(AIKEY, JSON.stringify(c)); } catch { } };
const aiReady = () => { const c = aiLoad(); return !!(c.key && c.base && c.model && c.on !== false); };
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const list = (a, n = 4) => a.slice(0, n).map(x => x[0].toLowerCase()).join(", ").replace(/, ([^,]*)$/, " and $1");

/* ---------- context from Glowtone data ---------- */
// ctx = { result, expert } from main.js (saved results). Returns facts used by both modes.
export function chatCtx(S) {
  const t = S.result && byId[S.result.type], x = S.expert && byId[S.expert.type];
  const sa = load().style, st = t && sa ? styleResult(sa, x && S.view === "scan" ? x : t) : null;
  const sk = load().skin ? skinResult(load().skin) : null;
  return { t, x, r: S.result, e: S.expert, st, sk, label: t ? `${nameOf(t)}${x && x.id !== t.id ? ` · scan: ${nameOf(x)}` : ""}` : "No results yet" };
}
function ctxLines(c) {
  if (!c.t) return ["I haven't finished my Glowtone analysis yet."];
  const t = c.t, m = t.makeup, o = [
    `My Glowtone result (from my quiz + drape picks): ${nameOf(t)} (${t.ko}), ${c.r.label.toLowerCase()} confidence. Traits: ${t.traits}.`,
    `Best colors: ${t.best.map(b => b[0]).join(", ")}.`, `Colors to avoid near my face: ${t.worst.map(b => b[0]).join(", ")}.`,
    `Clothing neutrals: ${t.neutrals.map(b => b[0]).join(", ")}. Metals: ${t.metals.join(", ")}.`,
    `Makeup: lips ${MAKEUP[t.id].lip.map(b => b[0]).join(", ")}; blush ${MAKEUP[t.id].blush.map(b => b[0]).join(", ")}; eyeshadow ${MAKEUP[t.id].eyes.map(b => b[0]).join(", ")}; liner ${MAKEUP[t.id].liner.map(b => b[0]).join(", ")}. Hair colors: ${t.hair.map(b => b[0]).join(", ")}.`];
  if (c.sk) o.push(`My Skin quiz: ${TYPE_INFO[c.sk.type][0].toLowerCase()} skin${c.sk.flags.length ? `, concerns: ${c.sk.flags.map(f => FLAG_INFO[f][0].toLowerCase()).join(", ")}` : ""}.`);
  if (c.st) o.push(`My Style quiz results: flattering shapes: ${c.st.shapes.join("; ")}. Cuts: ${c.st.cuts.join("; ")}. Necklines: ${c.st.necks.join(", ")}. Vibe: ${c.st.vibe}.`);
  if (c.x) o.push(`Glowtone's on-device Expert scan of my photo says: ${nameOf(c.x)} (${c.e.label.toLowerCase()} confidence). Reasons: ${c.e.reasons.join("; ")}.`);
  return o;
}
export function copyPrompt(c, q) {
  return ["I'm using Glowtone, an app based on Korean personal color analysis (퍼스널 컬러: warm/cool undertone, 4 seasons with Korean sub-tones, drape testing). Please answer in friendly, plain words and keep it short unless I ask for more. Keep any skincare advice general, not medical.",
    ...ctxLines(c), "", `My question: ${q || "What should I know about my colors?"}`].join("\n");
}

/* ---------- Mode 1: offline answer (1–3 short sentences) ---------- */
const COLOR_WORDS = { black: "#141414", white: "#FFFFFF", ivory: "#FFF6E0", cream: "#F6EAD2", beige: "#D8C7A8", camel: "#C19A6B", brown: "#6E4B32", chocolate: "#4E2A1E", gray: "#9A9A9A", grey: "#9A9A9A", charcoal: "#36393F", navy: "#1B2A4A",
  red: "#D0103A", burgundy: "#6D1A36", wine: "#6D1A36", pink: "#F06292", "hot pink": "#FF1F8E", "baby pink": "#F6C1D1", fuchsia: "#E0218A", magenta: "#D1007A", coral: "#FF7F61", peach: "#FFC9A3", orange: "#F28C28", rust: "#B7410E", terracotta: "#B9876A",
  yellow: "#F5C242", mustard: "#C9A227", gold: "#D4AF37", olive: "#6B6B2A", khaki: "#A89F7B", green: "#3D8B4A", mint: "#B5E3D8", sage: "#9DB59A", emerald: "#009B77", teal: "#1F6F78", turquoise: "#2EC4B6", blue: "#2F6FDE", "sky blue": "#9CC7E8",
  "royal blue": "#2547D0", cobalt: "#0047AB", "powder blue": "#B7D3EE", lavender: "#C9B8E8", lilac: "#D7BDE2", purple: "#6A2BA0", violet: "#7B2FBE", plum: "#4B1E4F", mauve: "#B58A9E" };
const hexLab = h => rgbToLab(parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16));
const dE = (a, b) => Math.hypot(a.L - b.L, a.a - b.a, a.b - b.b);
function colorVerdict(t, word) {
  const name = word.toLowerCase(), all = [...t.best.map(b => [b, "best"]), ...t.neutrals.map(b => [b, "neutral"]), ...t.worst.map(b => [b, "worst"])];
  const exact = all.find(([b]) => b[0].toLowerCase() === name) || all.find(([b]) => b[0].toLowerCase().includes(name));
  const hex = exact ? exact[0][1] : COLOR_WORDS[name]; if (!hex) return null;
  const L = hexLab(hex);
  const near = all.map(([b, k]) => [dE(L, hexLab(b[1])), b, k]).sort((p, q) => p[0] - q[0])[0];
  const kind = exact ? exact[1] : near[0] < 18 ? near[2] : null;
  const alt = t.best[0][0].toLowerCase(), good = [...t.best, ...t.neutrals].map(b => [dE(L, hexLab(b[1])), b]).sort((p, q) => p[0] - q[0])[0][1];
  if (kind === "best") return `Yes! ${cap(word)} is one of your best colors as ${nameOf(t)}. Wear it near your face.`;
  if (kind === "neutral") return `Yes, ${word} works as a neutral for you. It's great for basics like coats, pants and bags.`;
  if (kind === "worst") return `${cap(word)} isn't your easiest color near the face. Keep it for pants, shoes or bags, and wear something like ${alt} up top.`;
  return `${cap(word)} isn't on your palette, so try a version that's ${t.tone === "Warm" ? "warmer (more golden)" : "cooler (more blue-based)"} and ${/Mute/.test(t.sub) ? "softer" : /Deep/.test(t.sub) ? "deeper" : /Light/.test(t.sub) ? "lighter" : "clear"}. Your closest match is ${good[0].toLowerCase()}.`;
}
const lc1 = x => /^[A-Z][a-z]/.test(x) ? x[0].toLowerCase() + x.slice(1) : x;
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
export function offlineAnswer(c, q) {
  const s = q.toLowerCase(), t = c.t, has = re => re.test(s);
  if (t && has(/\b(products?|buy|brands?|recommend|which (tint|blush|cushion|palette|lipstick)|what (tint|blush|cushion|palette) should)/) && !has(/skin ?care|serum|toner|cleanser|sunscreen|moistur/)) {
    const mk = load().mk || {}, P = picksFor(t, mk.finish, mk.look, t.tone), cat = has(/blush|cheek/) ? "blush" : has(/eye|shadow|palette/) ? "eyes" : has(/cushion|foundation|base/) ? "base" : "lip";
    const ps = P[cat].slice(0, 2).map(p => `${p.line.brand} ${p.line.name} in ${p.shade}`);
    return { html: `For ${esc(nameOf(t))}, try ${esc(ps.join(" or "))}. The Makeup tab has links and rough prices (checked Oct 2026).` };
  }
  if (has(/\b(tip|skincare|skin ?care|k-?beauty|routine|sunscreen|spf|cleans|moistur|toner|serum|essence|mask|exfoliat|acne|pimple|breakout|patch|my skin|skin type|rash|eczema|itch|rosacea|cyst)/)) {
    if (has(/\b(rash|eczema|psoria|rosacea|allerg|hurts?|painful|bleed|infect|swell|burns?|burning|itch|cyst|mole|medication|prescri|accutane|isotretinoin)/)) return { html: "That sounds like something a dermatologist or doctor should look at, especially if it's painful, spreading or not going away. Until then, keep things gentle and stop anything that stings." };
    if (c.sk) { const R = c.sk, steps = routine(R), tn = TYPE_INFO[R.type][0].toLowerCase(), fine = ` <span class="fine">${esc(SAFE.split(".")[0])}.</span>`;
      const KEYS = [[/oil cleans|double cleans|cleansing (oil|balm)|\bbalm\b|remove (makeup|sunscreen)/, 0], [/sunscreen|\bspf\b|sun ?cream|\bsun\b/, 5], [/toner/, 2], [/serum|essence|ampoule/, 3], [/moistur|\bcream\b|lotion/, 4], [/cleanser|face ?wash|wash my face|cleans/, 1]];
      const hit = KEYS.find(([re]) => has(re)), step = hit ? steps[hit[1]] : null;
      if (step) return { html: `${esc(step.n)} (${step.when}) for your ${tn} skin: try ${esc(step.types.slice(0, 2).map(lc1).join(" or "))}. Look for ${esc(step.look.slice(0, 3).map(lc1).join(", "))}, and be careful with ${esc(lc1(step.careful[0]))}.${fine}` };
      if (has(/patch/)) return { html: esc(PATCH.slice(0, 2).join(" ")) };
      if (has(/acne|pimple|breakout/)) return { html: `For breakouts${R.flags.includes("acne") ? " (your quiz flagged acne-prone)" : ""}: gentle low-pH cleanser, a BHA toner 2–3 nights a week, niacinamide or azelaic acid, a light non-comedogenic moisturizer and daily sunscreen. For painful or persistent acne, see a dermatologist.` };
      if (has(/routine|order|steps?|morning|night|\bam\b|\bpm\b|skin ?care|what should i use|my skin/)) {
        const am = steps.filter(x => x.when !== "PM").map(x => x.n.toLowerCase()), pm = steps.filter(x => x.when !== "AM").map(x => x.n.toLowerCase());
        return { html: `For your ${tn} skin${R.flags.length ? ` (${esc(R.flags.map(f => FLAG_INFO[f][0].toLowerCase()).join(", "))})` : ""}: AM is ${esc(am.join(" → "))}. PM is ${esc(pm.join(" → "))}. Add one new product at a time and patch-test first.${fine}` }; }
    } else if (has(/routine|my skin|skin type|what should i use/)) return { html: "Take the Skin quiz in the Skin tab (12 quick questions) and I can suggest an AM and PM routine for your skin type." };
    if (has(/\b(acne|pimple)/)) return { html: "For acne, keep it gentle: low-pH cleanser, non-comedogenic moisturizer, daily sunscreen, and no picking. For painful or persistent acne, a dermatologist is the best person to ask." };
    const words = s.split(/\W+/).filter(w => w.length > 3), hit = KBEAUTY_TIPS.find(k => words.some(w => k.toLowerCase().includes(w)));
    return { html: `${esc(hit || tipOfDay())} <span class="fine">General tip, not medical advice.</span>`, more: hit ? null : KBEAUTY_TIPS.slice(0, 5).map(esc).join("<br>• ") };
  }
  if (has(/\b(style|outfits?|body type|body shape|flattering|silhouettes?|necklines?|neck lines?|cuts?|fits?|jeans|pants|skirts?|dress(es)?|jackets?|blazers?|wear to)\b/) && !has(/colou?r|lip|blush|makeup/)) {
    if (!c.st) return { html: "Take the Style quiz in the Style tab (8 quick questions) and I can suggest flattering shapes, cuts and necklines in your palette." };
    const r = c.st;
    if (has(/neck/)) return { html: `Necklines to try: ${r.necks.join(", ").toLowerCase()}.` };
    if (has(/outfit|wear to|idea/)) return { html: `${esc(r.outfitText)}: ${esc(r.outfit.map(o => o[0].toLowerCase()).join(" + "))}.` };
    if (has(/cut|jeans|pants|skirt|dress|jacket|blazer/)) return { html: `Cuts to try: ${esc(r.cuts.slice(0, 2).join("; ").toLowerCase())}.` };
    return { html: `${esc(r.shapes[0])}, plus ${esc((r.shapes[1] || r.cuts[0]).toLowerCase())}. Wear what you love, and these are just flattering ideas.` };
  }
  if (has(/korean personal|퍼스널|personal colou?r|colou?r analysis|12 types?|twelve types|how does (glowtone|it|this app|the app) work|how accurate|accuracy/) && !has(/my (season|type|colou?r)/))
    return { html: "Korean personal color analysis (퍼스널 컬러) checks your undertone (warm or cool) first, then lightness, clarity and the contrast between your skin, hair and eyes, which gives one of 12 types. Glowtone runs on your phone, so think of it as a guide, not a final verdict." };
  if (!t) return { html: "I don't have your results yet. Tap Home → Start analysis (about 3 minutes), then ask me about your best colors, makeup or metals!" };
  if (has(/colou?r of the day|today'?s colou?r/)) { const d = colorOfDay(t); return { html: `Today's color is <b>${esc(d.name)}</b>. ${esc(d.tip)}` }; }
  if (has(/\b(scan|picks?|differ|disagree|agree|which (one|result)|confiden|why (am i|did i get))/)) {
    if (!c.x) return { html: `Your result is ${nameOf(t)} with ${c.r.label.toLowerCase()} confidence, from your quiz and drape picks. Add the daylight photo step for a second opinion from the Expert scan.` };
    if (c.x.id === t.id) return { html: `Your picks and the Expert scan both say ${nameOf(t)}, so that's a strong sign! 💛` };
    return { html: `Your picks say ${nameOf(t)}, and the scan says ${nameOf(c.x)} (${esc(c.e.reasons[0].toLowerCase())}). ${c.x.tone === t.tone ? "You're " + t.tone.toLowerCase() + " either way, so try colors from both palettes." : "They disagree on warm vs cool, so retake the photo by a window with white paper."}` };
  }
  if (has(/\b(metal|jewel|gold|silver|platinum|earring|necklace|ring)\b/)) return { html: `Your best metals are ${list(t.metals.map(m => [m]), 3)}. ${t.tone === "Warm" ? "Warm metals echo your golden undertone." : "Cool metals match your cool undertone."}` };
  if (has(/\b(lip|lipstick|tint|gloss|blush|cheek|eyeshadow|eye shadow|shadow|makeup|make-up|liner|eyeliner|foundation|cushion|concealer|shade match)/)) {
    const M = MAKEUP[t.id], tone = c.x && c.x.tone !== t.tone ? "Neutral" : t.tone;
    if (has(/foundation|cushion|concealer|shade match/)) return { html: `${esc(FOUNDATION[tone])}`, more: esc(SHADE_TEST) };
    if (has(/liner/)) return { html: `For liner, try ${list(M.liner, 2)}.` };
    if (has(/\blip|lipstick|tint|gloss/)) return { html: `Try ${list(M.lip, 4)} for lips. They suit your ${t.tone.toLowerCase()} ${t.season} coloring.` };
    if (has(/blush|cheek/)) return { html: `For blush, go with ${list(M.blush, 3)}.` };
    if (has(/eye|shadow/)) return { html: `For eyeshadow, try ${list(M.eyes, 4)}.` };
    return { html: `Lips: ${list(M.lip, 2)}. Blush: ${list(M.blush, 2)}. Eyes: ${list(M.eyes, 2)}. See the Makeup tab for more.` };
  }
  if (has(/\b(hair|dye|highlight|balayage)/)) return { html: `If you dye your hair, ${list(t.hair, 3)} are your most flattering shades.` };
  if (has(/\b(avoid|worst|bad|unflattering|not wear|don'?t wear|shouldn'?t)/)) return { html: `Keep ${list(t.worst, 3)} away from your face. If you love them, wear them on the bottom half.` };
  if (has(/\b(neutral|basic|coat|jeans|pants|work|school)/)) return { html: `Your best neutrals are ${list(t.neutrals, 4)}. They're perfect for basics.` };
  if (has(/\b(warm|cool|undertone|neutral undertone)\b/)) return { html: `You read as a ${t.tone.toLowerCase()} undertone (${t.tone === "Warm" ? "웜" : "쿨"}). ${t.traits}.` };
  // "can I wear X?" / "is X good on me?" / any color word
  const words = Object.keys(COLOR_WORDS).sort((a, b) => b.length - a.length), found = [...t.best, ...t.neutrals, ...t.worst].map(b => b[0].toLowerCase()).find(n => s.includes(n)) || words.find(w => new RegExp(`\\b${w}\\b`).test(s));
  if (found) { const v = colorVerdict(t, found); if (v) return { html: esc(v) }; }
  if (has(/\b(best|good|wear|flatter|suit|palette|colou?rs?)\b/)) return { html: `Your best colors are ${list(t.best, 4)}. Wear them close to your face, in tops, scarves or lip colors.`, more: `All your best colors: ${t.best.map(b => esc(b[0])).join(", ")}.<br>Neutrals: ${t.neutrals.map(b => esc(b[0])).join(", ")}.` };
  if (has(/\b(season|type|result|who am i|my colou?r)\b/)) return { html: `You're <b>${nameOf(t)}</b> (${t.ko}): ${esc(t.desc)}` };
  return { html: "I'm not sure about that one yet. Try asking about your best colors, a specific color, makeup, metals or today's tip. Or copy your question to any AI below.", fallback: true };
}

/* ---------- Mode 2: bring your own key ---------- */
const SYSTEM = "You are Glowtone's friendly color helper. Glowtone is a Korean personal color analysis (퍼스널 컬러) app for teens and young adults. "
  + "BREVITY RULE: reply in 1–3 short, warm, plain sentences unless the user asks for more detail. Base answers on the user's results below. Be body-positive (say 'flattering', never 'fixing'). "
  + "Skincare: general tips only; for skin problems suggest seeing a dermatologist. If unsure, say so. Plain text, no markdown headings.";
async function aiAsk(c, hist, q) {
  const cfg = aiLoad(), ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), 30000);
  const messages = [{ role: "system", content: SYSTEM + "\n\nUser's Glowtone results:\n" + ctxLines(c).join("\n") }, ...hist.slice(-10), { role: "user", content: q }];
  try {
    const r = await fetch(cfg.base.replace(/\/+$/, "") + "/chat/completions", { method: "POST", signal: ctl.signal, headers: { "Content-Type": "application/json", Authorization: "Bearer " + cfg.key }, body: JSON.stringify({ model: cfg.model, messages, max_tokens: 200 }) });
    let data = null; try { data = await r.json(); } catch { }
    if (!r.ok) {
      const m = (data && data.error && (data.error.message || data.error)) || "";
      const why = r.status === 401 || r.status === 403 ? "The API key was rejected. Check it in AI settings." : r.status === 404 ? "That model or base URL wasn't found." : r.status === 429 ? "The provider says you hit a rate or credit limit." : r.status === 400 ? "The provider rejected the request (often a wrong model name)." : `The AI service returned an error (${r.status}).`;
      throw Object.assign(new Error(why), { detail: String(m).slice(0, 160) });
    }
    const txt = data?.choices?.[0]?.message?.content; if (!txt) throw new Error("The AI sent back an empty reply.");
    return String(txt);
  } catch (e) {
    if (e.name === "AbortError") throw new Error("The AI took too long to answer.");
    if (e instanceof TypeError) throw new Error(navigator.onLine === false ? "You seem to be offline." : "Couldn't reach the AI service (offline, blocked, or wrong base URL).");
    throw e;
  } finally { clearTimeout(tm); }
}
const mdLite = t => esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>");

/* ---------- chat UI ---------- */
const CHAT = { msgs: [], hist: [], busy: false, settings: false }; // in-memory: history lasts for this session
async function copyText(t) {
  try { await navigator.clipboard.writeText(t); return true; } catch { }
  try { const ta = document.createElement("textarea"); ta.value = t; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); const ok = document.execCommand("copy"); ta.remove(); return ok; } catch { return false; }
}
function toast(msg) { document.querySelector(".toast")?.remove(); const d = document.createElement("div"); d.className = "toast"; d.textContent = msg; document.body.appendChild(d); setTimeout(() => d.remove(), 2600); }
export function chatView(S) {
  const c = chatCtx(S), cfg = aiLoad(), ai = aiReady();
  if (!CHAT.msgs.length) CHAT.msgs.push({ who: "bot", html: c.t ? `Hi! I'm your Glowtone helper. Ask me anything about your colors as <b>${esc(nameOf(c.t))}</b>.` : "Hi! I'm your Glowtone helper. Finish an analysis and I can answer questions about your colors. You can still ask me about Korean personal color or skincare tips." });
  const sugg = c.t ? ["What are my best colors?", "Can I wear black?", "Which lip colors suit me?", "Gold or silver?", "Why do my picks and scan differ?"] : ["What is Korean personal color?", "Today's K-beauty tip"];
  return `<section class="screen chat">
  <div class="ch-head"><div style="flex:1"><b>Ask Glowtone</b><div class="ch-mode">${ai ? `AI mode · ${esc(cfg.model)}, your key` : "Answers from your results"} · ${esc(c.label)}</div></div><button class="iconbtn" id="aiGear" aria-label="AI settings">⚙︎</button></div>
  ${CHAT.settings ? aiPanel() : ""}
  <div class="msgs" id="msgs" aria-live="polite"></div>
  <div class="ch-bottom"><div class="sugg" id="sugg">${sugg.map(s => `<button>${esc(s)}</button>`).join("")}</div>
  <div class="composer"><textarea id="chIn" rows="2" placeholder="Ask about your colors…" aria-label="Your question" enterkeyhint="enter"></textarea><button class="btn sm" id="chSend">Send</button></div></div></section>`;
}
export function mountChat(S, rerender) {
  const c = chatCtx(S), box = document.getElementById("msgs");
  const paint = () => {
    box.innerHTML = "";
    CHAT.msgs.forEach(m => {
      const d = document.createElement("div"); d.className = `msg ${m.who}${m.err ? " err" : ""}`; d.innerHTML = m.html;
      if (m.who === "bot" && m.more) { d.insertAdjacentHTML("beforeend", `<div><button class="morechip">Want more detail?</button></div>`); d.querySelector(".morechip").onclick = () => { const mo = m.more; m.more = null; CHAT.msgs.push({ who: "me", html: "Want more detail?" }, { who: "bot", html: mo, q: m.q, copy: true }); paint(); }; }
      if (m.who === "bot" && m.copy) {
        const pr = copyPrompt(c, m.q);
        d.insertAdjacentHTML("beforeend", `<div class="copyrow"><button class="copybtn">Copy for any AI</button><p class="fine">Paste it into free ChatGPT or Grok for a longer answer. It includes your question and your results (never your photo).</p><details><summary>See what gets copied</summary><pre>${esc(pr)}</pre></details></div>`);
        d.querySelector(".copybtn").onclick = async () => { const ok = await copyText(pr); toast(ok ? "Copied! Paste it into ChatGPT or Grok." : "Couldn't copy. Open \"See what gets copied\" and copy it by hand."); };
      }
      box.appendChild(d);
    });
    box.scrollTop = box.scrollHeight;
  };
  const send = async q => {
    q = (q || "").trim(); if (!q || CHAT.busy) return;
    CHAT.msgs.push({ who: "me", html: esc(q) }); { const t = document.getElementById("chIn"); t.value = ""; t.dispatchEvent(new Event("input")); } paint();
    if (aiReady()) {
      CHAT.busy = true; CHAT.msgs.push({ who: "bot", html: "<i>Thinking…</i>", tmp: true }); paint();
      try { const a = await aiAsk(c, CHAT.hist, q); CHAT.hist.push({ role: "user", content: q }, { role: "assistant", content: a }); CHAT.msgs = CHAT.msgs.filter(m => !m.tmp); CHAT.msgs.push({ who: "bot", html: mdLite(a), q }); }
      catch (e) { CHAT.msgs = CHAT.msgs.filter(m => !m.tmp); CHAT.msgs.push({ who: "bot", err: true, html: `<b>AI help didn't work:</b> ${esc(e.message)}${e.detail ? `<p class="fine">${esc(e.detail)}</p>` : ""}<p class="fine">Here's the offline helper instead.</p>` }); const o = offlineAnswer(c, q); CHAT.msgs.push({ who: "bot", html: o.html, more: o.more, q, copy: true }); }
      CHAT.busy = false;
    } else { const o = offlineAnswer(c, q); CHAT.msgs.push({ who: "bot", html: o.html, more: o.more, q, copy: true }); }
    if (document.body.contains(box)) paint();
  };
  document.getElementById("chSend").onclick = () => send(document.getElementById("chIn").value);
  const ta = document.getElementById("chIn"), touch = matchMedia("(pointer: coarse)").matches;
  const grow = () => { ta.style.height = "auto"; const max = parseFloat(getComputedStyle(ta).maxHeight) || 150; ta.style.height = Math.min(ta.scrollHeight + 2, max) + "px"; ta.style.overflowY = ta.scrollHeight + 2 > max ? "auto" : "hidden"; };
  ta.addEventListener("input", grow);
  // Desktop: Enter sends, Shift+Enter = new line. Phones: Enter = new line, the Send button sends.
  ta.onkeydown = e => { if (e.key === "Enter" && !e.shiftKey && !touch && !e.isComposing) { e.preventDefault(); send(ta.value); } };
  const tabs = document.getElementById("tabs"); if (tabs) document.documentElement.style.setProperty("--tabsH", tabs.offsetHeight + "px");
  grow();
  document.querySelectorAll("#sugg button").forEach(b => b.onclick = () => send(b.textContent));
  document.getElementById("aiGear").onclick = () => { CHAT.settings = !CHAT.settings; rerender(); };
  if (CHAT.settings) mountAiPanel(rerender);
  paint();
  return { send };
}

/* ---------- AI settings panel (optional bring-your-own-key) ---------- */
function aiPanel() {
  const cfg = aiLoad(), pv = cfg.provider || "xai", P = AI_PRESETS[pv];
  return `<div class="aiform" id="aiPanel"><h3>AI help (optional)</h3>
  <p class="fine">The chat works offline using your Glowtone results. If you like, connect your <b>own</b> AI account for free-form answers. Glowtone has no server: your question and results text go straight from this browser to the provider you pick. Your photo is never sent.</p>
  <label for="aiProv">Provider</label><select id="aiProv">${Object.entries(AI_PRESETS).map(([k, v]) => `<option value="${k}" ${k === pv ? "selected" : ""}>${v.name}</option>`).join("")}</select>
  <label for="aiBase">Base URL</label><input id="aiBase" value="${esc(cfg.base || P.base)}" placeholder="https://…/v1" autocomplete="off" spellcheck="false">
  <label for="aiModel">Model</label><input id="aiModel" list="aiModels" value="${esc(cfg.model || P.model)}" autocomplete="off" spellcheck="false"><datalist id="aiModels">${P.models.map(m => `<option value="${m}">`).join("")}</datalist>
  <label for="aiKey">API key</label><input id="aiKey" type="password" placeholder="${cfg.key ? "Saved: ••••" + esc(cfg.key.slice(-4)) + " (type to replace)" : "Paste your key (" + esc(P.where) + ")"}" autocomplete="off" spellcheck="false">
  <label class="aion"><input type="checkbox" id="aiOn" ${cfg.key && cfg.on !== false ? "checked" : ""} ${cfg.key ? "" : "disabled"}> Use AI mode <span class="fine">${cfg.key ? "Key saved on this device ••••" + esc(cfg.key.slice(-4)) : "No key saved: the chat uses the offline helper"}</span></label>
  <div class="row"><button class="btn sm" id="aiSaveBtn">Save</button><button class="btn ghost sm" id="aiRemove" ${cfg.key ? "" : "disabled"}>Remove key</button></div>
  <div class="warnbox">Your key is stored only in this browser (localStorage) on this device. It's never sent to Glowtone and is only sent to the base URL above. <b>Anyone with access to this browser could read it</b>, so use it only on your own device and set a <b>low spending limit</b> on your provider account. The offline helper and "Copy for any AI" are always free.</div></div>`;
}
function mountAiPanel(rerender) {
  const $ = id => document.getElementById(id);
  $("aiProv").onchange = e => { const Q = AI_PRESETS[e.target.value]; $("aiBase").value = Q.base; $("aiModel").value = Q.model; $("aiModels").innerHTML = Q.models.map(m => `<option value="${m}">`).join(""); };
  $("aiSaveBtn").onclick = () => {
    const c = aiLoad(), k = $("aiKey").value.trim(), base = $("aiBase").value.trim(), model = $("aiModel").value.trim();
    if (base && !/^https:\/\//i.test(base) && !/^http:\/\/(localhost|127\.0\.0\.1)/i.test(base)) { toast("Base URL must start with https://"); return; }
    Object.assign(c, { provider: $("aiProv").value, base, model }); if (k) { c.key = k; c.on = true; }
    aiSave(c); toast(k ? "AI key saved on this device" : "AI settings saved"); rerender();
  };
  $("aiRemove").onclick = () => { const c = aiLoad(); delete c.key; c.on = false; aiSave(c); toast("Key removed from this browser"); rerender(); };
  $("aiOn").onchange = () => { const c = aiLoad(); if (!c.key) return; c.on = $("aiOn").checked; aiSave(c); rerender(); };
}
