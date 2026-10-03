import { QUESTIONS, scoreQuiz } from "./quiz.js";
import { analyze } from "./color.js";
import { combine } from "./classify.js";
import { TYPES, byId, nameOf, LEGACY } from "./palettes.js";
import { expertScan } from "./expert.js";
import { colorOfDay, tipOfDay, dayIndex } from "./daily.js";
import { chatView, mountChat } from "./chat.js";
import { MAKEUP, FOUNDATION, SHADE_TEST, finishTip } from "./makeup.js";
import { STEPS as ST_STEPS, quizView, resultsView, styleResult, bodySVG } from "./style.js";
import { findFace } from "./face.js";
import * as store from "./storage.js";

const $app = document.getElementById("app"), $tabs = document.getElementById("tabs");
const saved = store.load();
for (const r of [saved.result, saved.result && { type: saved.result.runnerUp }, saved.expert]) if (r && LEGACY[r.type]) r.type = LEGACY[r.type];
if (saved.result && LEGACY[saved.result.runnerUp]) saved.result.runnerUp = LEGACY[saved.result.runnerUp];
if (saved.expert && LEGACY[saved.expert.runnerUp]) saved.expert.runnerUp = LEGACY[saved.expert.runnerUp];
const S = { screen: "home", tab: "home", view: "picks", expert: saved.expert || null, qi: 0, answers: saved.answers || {}, photo: null, drape: null, result: saved.result || null, stream: null };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const sw = (list, cls = "sw") => list.map(([n, h]) => `<div class="${cls}"><i style="--c:${h}"></i><span>${esc(n)}</span></div>`).join("");
function go(screen, extra = {}) { Object.assign(S, extra); if (screen !== "camera") stopCam(); S.screen = screen; render(); window.scrollTo(0, 0); }

// ---------- screens ----------
const V = {
welcome: () => `<section class="screen center">
  <div class="logo big"></div><h1>Glowtone</h1>
  <p class="eyebrow">Inspired by Korean personal color analysis · 퍼스널 컬러</p>
  <p class="sub">Find your type out of 12, like <b>Autumn Warm Mute</b>, with a quick quiz plus an optional daylight drape test.</p>
  <ul class="ticks"><li>⏱ About 3 minutes</li><li>🔒 Photos never leave your phone</li><li>🌤 Best by a window in daylight</li></ul>
  <button class="btn" data-act="start">Start the quiz</button>
  <p class="tiny">Free beta: everything is unlocked.</p></section>`,

quiz: () => { const q = QUESTIONS[S.qi], a = S.answers[q.id];
  return `<section class="screen">
  <div class="bar"><i style="width:${(S.qi / QUESTIONS.length) * 100}%"></i></div>
  <p class="step">Question ${S.qi + 1} of ${QUESTIONS.length}</p>
  <h2>${esc(q.q)}</h2>${q.hint ? `<p class="muted">${esc(q.hint)}</p>` : ""}
  <div class="opts">${q.opts.map((o, i) => `<button class="opt${a === i ? " sel" : ""}" data-act="answer" data-i="${i}">${esc(o[0])}</button>`).join("")}</div>
  <button class="link" data-act="back">← Back</button></section>`; },

camera: () => `<section class="screen">
  <p class="step">Step 2 · Photo + drapes (optional)</p>
  <h2>Daylight drape test</h2>
  <ul class="tips"><li>🌤 Face a window in daylight. No direct sun, flash or warm lamps.</li>
  <li>📄 Hold a <b>sheet of white paper</b> next to your face for white balance.</li>
  <li>🙂 Bare face if you can, hair pulled back, filters/beauty mode off.</li></ul>
  <div class="cam"><video id="vid" playsinline muted autoplay></video><div class="oval"></div><div class="paper-box">paper here</div>
  <p id="camMsg" class="cam-msg">Starting camera…</p></div>
  <div class="row"><button class="btn" data-act="snap" id="snapBtn" disabled>📸 Take photo</button>
  <label class="btn ghost">🖼 Choose photo<input type="file" accept="image/*" id="file" hidden></label></div>
  <p class="tiny center">Processed on your device only. Nothing is uploaded.</p>
  <button class="link" data-act="skipPhoto">Skip, use my quiz only →</button></section>`,

analyze: () => `<section class="screen">
  <p class="step">Step 2 · Reading your colors</p>
  <h2 id="aTitle">Finding your face…</h2><p class="muted" id="aHint">Hang on, this runs on your device.</p>
  <div class="photo" id="photoWrap"><canvas id="cv"></canvas><div class="drape" id="drape" hidden></div></div>
  <div id="aCtl" class="row"></div><div id="reading"></div></section>`,

result: () => { const r = S.result, x = S.expert;
  return `<section class="screen">
  <p class="step center">Your personal color</p>
  ${agreeNote(r, x)}
  <div class="duo">
    ${panel("Your picks", "From your quiz + drape choices", r.type, r.label, r.conf, r.why.filter(w => !/^Photo/.test(w)), r.runnerUp)}
    ${x ? panel("What the scan says looks best", "Expert scan of your photo: skin, hair & eye color science", x.type, x.label, x.conf, x.reasons, x.runnerUp)
        : `<div class="panel empty"><p class="pk">What the scan says looks best</p><p class="muted">No photo yet. Take the daylight photo step to get an independent Expert scan.</p><button class="btn ghost sm" data-act="toCamera">📸 Add a photo scan</button></div>`}
  </div>
  <button class="btn signin" data-act="signin">🔐 Sign in to save your results</button>
  <p id="signinNote" class="note" hidden>Google sign-in is coming soon. Your results are saved on this device for now. 💛</p>
  <button class="btn" data-act="toProfile">See my palettes →</button>
  <button class="link" data-act="retake">Retake</button></section>`; },
home: () => {
  if (S.tab === "home") return homeTab();
  if (S.tab === "chat") return chatView(S);
  if (store.isLocked(S.tab)) return lockView(S.tab);
  if (S.tab === "makeup") return makeupTab();
  const t = S.result ? byId[(S.view === "scan" && S.expert ? S.expert : S.result).type] : null;
  if (!t) return soon("Profile", "Finish an analysis to see your season, palettes and makeup colors here.") + `<div class="row"><button class="btn" data-act="start">Start analysis</button></div>`;
  if (S.tab === "style") return styleTab();
  if (S.tab === "skin") return soon("Skin", "A Korean skincare quiz with researched K-beauty routines. Not medical advice.");
  const m = t.makeup;
  const sw2 = viewSwitch();
  return `<section class="screen">${sw2}${card(t)}
  <p class="traits">${esc(t.traits)}</p><p>${esc(t.desc)}</p>
  <h3>Best colors</h3><div class="grid">${sw(t.best)}</div>
  <h3>Colors to avoid near your face</h3><div class="grid">${sw(t.worst, "sw x")}</div>
  <h3>Clothing neutrals</h3><div class="grid">${sw(t.neutrals)}</div>
  <h3>Makeup</h3><p class="lbl">Lips</p><div class="grid">${sw(MAKEUP[t.id].lip)}</div><p class="lbl">Blush</p><div class="grid">${sw(MAKEUP[t.id].blush)}</div><p class="lbl">Eyes</p><div class="grid">${sw(MAKEUP[t.id].eyes)}</div><p class="lbl">Liner</p><div class="grid">${sw(MAKEUP[t.id].liner)}</div><p class="tiny">More in the Makeup tab.</p>
  <h3>Hair colors</h3><div class="grid">${sw(t.hair)}</div>
  <h3>Jewelry metals</h3><p class="metals">${t.metals.map(x => `<span>${esc(x)}</span>`).join("")}</p>
  <div class="tipbox">💡 ${esc(t.tip)}</div>
  ${(() => { const src = S.view === "scan" && S.expert ? S.expert : S.result; return `<p class="tiny">${src === S.expert ? "Expert scan" : "Your picks"} · ${new Date(S.result.date).toLocaleDateString()} · ${src.label} confidence (${src.conf}%)</p>`; })()}
  <div class="row"><button class="btn ghost" data-act="retake">Retake analysis</button><a class="btn ghost" id="fb" href="${store.FEEDBACK_URL.startsWith("PASTE") ? "#" : store.FEEDBACK_URL}" target="_blank" rel="noopener">💌 Send feedback</a></div></section>`; },
};
const viewSwitch = () => S.result && S.expert && S.expert.type !== S.result.type ? `<div class="seg"><button class="${S.view !== "scan" ? "on" : ""}" data-act="view" data-v="picks">Your picks</button><button class="${S.view === "scan" ? "on" : ""}" data-act="view" data-v="scan">Expert scan</button></div>` : "";
const mkRow = (title, items, first) => `<div class="h-block"><p class="h-label">${title}${first ? ' <span class="start">start here</span>' : ""}</p><div class="mk-row">${items.map(([n, h]) => `<div class="mk"><i style="--c:${h}"></i><span>${esc(n)}</span></div>`).join("")}</div></div>`;
const makeupTab = () => {
  if (!S.result) return `<section class="screen home"><div class="h-block"><p class="h-label">Makeup</p><p class="h-text">Your lip, blush, eye and liner shades will appear here once you know your personal color.</p></div><button class="link h-start" data-act="start">Take the analysis →</button></section>`;
  const t = byId[(S.view === "scan" && S.expert ? S.expert : S.result).type], M = MAKEUP[t.id], P = store.load().mk || {};
  const bold = P.look === "bold", ord = a => bold ? [...a].reverse() : a; // lists run soft → bold
  const tone = S.expert && byId[S.expert.type].tone !== byId[S.result.type].tone ? "Neutral" : t.tone;
  const secs = { lip: ["Lips", ord(M.lip)], blush: ["Blush", ord(M.blush)], eyes: ["Eyeshadow", ord(M.eyes)], liner: ["Liner", ord(M.liner)] };
  const order = bold ? ["lip", "liner", "eyes", "blush"] : ["blush", "lip", "eyes", "liner"];
  const opt = (k, v, label) => `<button class="${P[k] === v ? "on" : ""}" data-act="mkpref" data-k="${k}" data-v="${v}">${label}</button>`;
  return `<section class="screen home mkup">${viewSwitch()}
  <div class="h-block"><p class="h-label">Makeup for</p><p class="h-name">${t.season} ${t.tone} ${t.sub} <span class="ko" lang="ko">${t.ko}</span></p></div>
  <div class="h-block mk-quiz"><p class="h-label">Tailor it <span class="fine">(optional)</span></p>
    <div class="seg sm">${opt("finish", "matte", "Matte")}${opt("finish", "satin", "Satin")}${opt("finish", "dewy", "Dewy")}</div>
    <div class="seg sm">${opt("look", "everyday", "Everyday")}${opt("look", "bold", "Bold")}</div>
    ${P.finish ? `<p class="h-text">${esc(finishTip(P.finish, t))}</p>` : ""}</div>
  ${order.map((k, i) => mkRow(secs[k][0], secs[k][1], i === 0 && P.look)).join("")}
  <div class="h-block"><p class="h-label">Foundation undertone</p><p class="h-text">${esc(FOUNDATION[tone])}</p><p class="h-text">${esc(SHADE_TEST)}</p></div>
  ${mkRow("Skip these", M.avoid)}
  <div class="h-block h-soon"><p class="h-label">Product picks</p><p class="h-fine">Coming soon</p></div></section>`; };
const lockView = tab => { const P = store.PREMIUM, name = tab === "style" ? "Style" : "Makeup";
  const peek = tab === "style" ? `<div class="lock-peek">${bodySVG("hourglass")}${bodySVG("straight")}${bodySVG("inverted")}</div>` : `<div class="lock-peek mk-row">${["#C58A73", "#D9A68C", "#9C8572", "#6F5241"].map(h => `<div class="mk"><i style="--c:${h}"></i></div>`).join("")}</div>`;
  return `<section class="screen home lock"><div class="lock-blur" aria-hidden="true">${peek}</div>
  <div class="h-block lock-card"><p class="h-label">Glowtone Premium</p><p class="h-name">Unlock ${name}</p>
  <p class="h-text">${tab === "style" ? "Flattering shapes, cuts and necklines in your season palette." : "Lip, blush, eyeshadow and liner shades for your type, plus foundation tips."}</p>
  <p class="lock-price"><b>${P.price}</b> ${P.note} · Style + Makeup</p><p class="h-fine">✨ ${P.launchOffer}</p>
  <button class="btn" data-act="unlock">Unlock (coming soon)</button><button class="link" data-act="lockLater">Maybe later</button></div></section>`; };
const styleTab = () => {
  const st = S.style || (S.style = { i: 0, ans: {}, quiz: false });
  if (!S.result) return `<section class="screen home"><div class="h-block"><p class="h-label">Style</p><p class="h-text">Find your personal color first, then we'll show flattering shapes and cuts in your palette.</p></div><button class="link h-start" data-act="start">Take the analysis →</button></section>`;
  const saved = store.load().style, t = byId[(S.view === "scan" && S.expert ? S.expert : S.result).type];
  if (st.quiz || !saved) { if (!st.quiz && !saved) return `<section class="screen home"><div class="h-block"><p class="h-label">Style</p><p class="h-name">Find your flattering shapes</p><p class="h-text">8 quick questions about your shape, fit and vibe. Optional ones can be skipped, and everything stays on your phone.</p></div><button class="btn" data-act="stStart" style="align-self:flex-start">Start style quiz</button></section>`;
    return quizView(st); }
  return resultsView(styleResult(saved, t), t, saved, viewSwitch());
};
const ICONS = { home: "🏠", profile: "🎨", makeup: "💋", style: "👗", skin: "🫧", chat: "💌" };
const greetWord = (h = new Date().getHours()) => h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
function styleIdea(t, saved, i) {
  if (!t) return null;
  const b = t.best, n = t.neutrals, top = b[i % b.length], bottom = n[(i + 1) % n.length], acc = b[(i + 3) % b.length];
  if (saved) { const r = styleResult(saved, t), cut = r.cuts[i % r.cuts.length], shape = r.shapes[i % r.shapes.length], neck = r.necks[i % r.necks.length];
    return { colors: [top, bottom, acc], text: `${shape}, with ${/^[aeiou]/i.test(neck) ? "an" : "a"} ${neck.toLowerCase()} top in ${top[0].toLowerCase()}, ${bottom[0].toLowerCase()} on the bottom and a pop of ${acc[0].toLowerCase()}. Try: ${cut.toLowerCase()}.`, nudge: false }; }
  const ideas = [`A ${top[0].toLowerCase()} knit with ${bottom[0].toLowerCase()} straight-leg pants`, `A ${bottom[0].toLowerCase()} jacket over a ${top[0].toLowerCase()} tee`, `A ${top[0].toLowerCase()} shirt, ${bottom[0].toLowerCase()} bottoms and a ${acc[0].toLowerCase()} accessory`];
  return { colors: [top, bottom, acc], text: ideas[i % ideas.length] + ".", nudge: true };
}
const homeTab = () => { const st = store.load(), t = S.result && byId[(S.view === "scan" && S.expert ? S.expert : S.result).type], c = colorOfDay(t), i = dayIndex();
  const name = (st.name || "").trim(), editing = S.nameEdit || (!name && !st.nameAsked);
  const greet = name ? `${greetWord()}, ${esc(name)}` : `${greetWord()} ✨`;
  const idea = styleIdea(t, st.style, i);
  const sampleQs = t ? [st.style ? "What necklines suit me?" : "Can I wear black?", "Which lip colors suit me?", "Gold or silver?"] : ["What is Korean personal color?"];
  const sq = sampleQs[i % sampleQs.length];
  const qs = (tab, title, sub, done, soon) => `<button class="qs" ${soon ? "disabled" : `data-tab="${tab}"`}><span class="qs-ic">${ICONS[tab]}</span><b>${title}</b><span class="qs-sub">${soon ? "Coming soon" : sub}</span>${done ? '<span class="qs-done" aria-label="Done">✓</span>' : ""}</button>`;
  return `<section class="screen home2">
  <div class="greet"><p class="h-date">${esc(new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }))}</p>
    <h1>${greet}</h1>
    ${editing ? `<div class="namebox"><label for="nameIn">What should we call you? <span class="fine">(optional, saved on this phone)</span></label><div class="row-l"><input id="nameIn" maxlength="24" value="${esc(name)}" placeholder="Your name" autocomplete="given-name"><button class="btn sm" data-act="nameSave">Save</button>${name || !st.nameAsked ? `<button class="link" data-act="nameSkip">${name ? "Cancel" : "Skip"}</button>` : ""}</div></div>` : `<button class="link edit" data-act="nameEdit">${name ? "Edit name" : "Add your name"}</button>`}
    ${t ? `<p class="h-text">You're <b>${t.season} ${t.tone} ${t.sub}</b> <span lang="ko">${t.ko}</span></p>` : `<button class="link h-start" data-act="start">Start your color analysis →</button>`}</div>
  <div class="card cod"><p class="h-label">Color of the day</p><div class="h-color"><i style="--c:${c.hex}"></i><div><p class="h-name">${esc(c.name)}</p><p class="h-text">${esc(c.tip)}</p></div></div></div>
  <div class="card"><p class="h-label">K-beauty tip</p><p class="h-body">${esc(tipOfDay())}</p><p class="h-fine">General tips, not medical advice.</p></div>
  <div><p class="h-label" style="margin-bottom:12px">Quick start</p><div class="qs-row">${qs("style", "Style", st.style ? "See your style" : "8 quick questions", !!st.style)}${qs("makeup", "Makeup", st.mkSeen ? "Your shades" : "Find your shades", !!st.mkSeen)}${qs("skin", "Skin", "", false, true)}</div></div>
  ${idea ? `<div class="card"><p class="h-label">Style idea of the day</p><div class="st-outfit">${idea.colors.map(([n, h]) => `<i style="--c:${h}" title="${esc(n)}"></i>`).join("")}</div><p class="h-body">${esc(idea.text)}</p>${idea.nudge ? `<button class="link h-start" data-tab="style">Take the Style quiz for ideas that fit your shape →</button>` : ""}</div>` : `<div class="card"><p class="h-label">Style idea of the day</p><p class="h-body">Find your season and you'll get a fresh outfit idea in your colors every day.</p><button class="link h-start" data-act="start">Start your color analysis →</button></div>`}
  <div class="card chatcard"><p class="h-label">${ICONS.chat} Try the Chat</p><p class="h-text">Ask anything about your colors, makeup or style.</p><button class="sample" data-act="askSample" data-q="${esc(sq)}">“${esc(sq)}”</button></div>
  <div class="h-soon"><p class="h-label">Product picks</p><p class="h-fine">Coming soon</p></div></section>`; };
const panel = (title, sub, id, label, conf, why, ru) => { const t = byId[id];
  return `<div class="panel" style="--c1:${t.card[0]};--c2:${t.card[1]}"><p class="pk">${title}</p><p class="tiny">${sub}</p>
  <p class="pt">${t.season} ${t.tone} ${t.sub}</p><p class="sc-ko" lang="ko">${t.ko}</p>
  <div class="mini">${t.best.slice(0, 6).map(([, h]) => `<i style="--c:${h}"></i>`).join("")}</div>
  <div class="conf ${label.toLowerCase()}"><b>${label} confidence</b><span>${conf}%</span></div>
  <ul class="why">${why.map(w => `<li>${esc(w)}</li>`).join("")}</ul><p class="tiny">Runner-up: ${nameOf(byId[ru])}</p></div>`; };
function agreeNote(r, x) {
  if (!x) return `<div class="note">Add the photo step for a second opinion from the Expert scan.</div>`;
  const a = byId[r.type], b = byId[x.type];
  if (a.id === b.id) return `<div class="note ok">💛 Both agree: you're <b>${nameOf(a)}</b>.</div>`;
  if (a.season === b.season) return `<div class="note">Same season (${a.season}), different sub-tone. Both palettes will work; try colors from each.</div>`;
  if (a.tone === b.tone) return `<div class="note">Both say <b>${a.tone.toLowerCase()}</b>, but different seasons. Compare the two palettes in a mirror by a window.</div>`;
  return `<div class="note warnbg">Your picks and the scan disagree on warm vs cool. Retake the photo by a window with white paper; the scan can be thrown off by lighting.</div>`;
}
const soon = (n, d) => `<section class="screen center"><div class="soon">✨</div><h2>${n} is coming soon</h2><p class="muted">${d}</p></section>`;
const card = t => `<div class="season-card" style="--c1:${t.card[0]};--c2:${t.card[1]}">
  <div class="sc-top"><span class="sc-brand"><span class="logo sm"></span>Glowtone</span><span class="sc-tag">${t.tone} undertone</span></div>
  <p class="sc-kicker">My personal color is</p><p class="sc-title">${t.season}<br>${t.tone} ${t.sub}</p><p class="sc-ko" lang="ko">${t.ko}</p>
  <div class="sc-palette">${t.best.slice(0, 8).map(([, h]) => `<span style="--c:${h}"></span>`).join("")}</div>
  <p class="sc-label">Best colors</p><ul class="sc-best">${t.best.slice(0, 4).map(([n, h]) => `<li><i style="--c:${h}"></i>${esc(n)}</li>`).join("")}</ul>
  <div class="sc-foot"><span>${esc(t.metals[0])}</span><span>Skip: ${esc(t.worst[0][0].toLowerCase())}</span></div></div>`;

function render() {
  $app.innerHTML = V[S.screen]();
  $tabs.hidden = S.screen !== "home";
  $tabs.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.tab === S.tab));
  if (S.screen === "camera") startCam();
  if (S.screen === "home" && S.tab === "chat") { S.chat = mountChat(S, render); if (S.pendingChat) { const q = S.pendingChat; S.pendingChat = null; S.chat.send(q); } }
  if (S.screen === "home" && S.tab === "makeup" && S.result && !store.isLocked("makeup") && !store.load().mkSeen) store.save({ ...store.load(), mkSeen: true });
  const fb = document.getElementById("fb");
  if (fb && fb.getAttribute("href") === "#") fb.onclick = e => { e.preventDefault(); alert("Feedback form coming soon. Thanks for testing Glowtone! 💛"); };
}

// ---------- actions ----------
document.addEventListener("click", e => {
  const b = e.target.closest("[data-act],[data-tab]"); if (!b) return;
  if (b.dataset.tab) { S.tab = b.dataset.tab; return go("home"); }
  const A = {
    start: () => go("quiz", { qi: 0 }),
    answer: () => { S.answers[QUESTIONS[S.qi].id] = +b.dataset.i; if (S.qi < QUESTIONS.length - 1) { S.qi++; render(); } else go("camera"); },
    back: () => S.qi > 0 ? (S.qi--, render()) : go("welcome"),
    skipPhoto: () => finish(),
    snap: () => { const v = document.getElementById("vid"); const c = document.createElement("canvas"); fit(c, v.videoWidth, v.videoHeight); c.getContext("2d").drawImage(v, 0, 0, c.width, c.height); startAnalyze(c); },
    toProfile: () => go("home", { tab: "profile", view: "picks" }),
    toCamera: () => go("camera"),
    signin: () => { document.getElementById("signinNote").hidden = false; }, // milestone 2: Firebase Google sign-in
    view: () => { S.view = b.dataset.v; render(); },
    stStart: () => { S.style = { i: 0, ans: {}, quiz: true }; render(); },
    stRetake: () => { S.style = { i: 0, ans: { ...(store.load().style || {}) }, quiz: true }; render(); },
    stBack: () => { S.style.i--; render(); },
    stAns: () => { const st = S.style, s = ST_STEPS[st.i], v = b.dataset.v;
      if (s.multi) { let a = st.ans[s.id] || []; a = a.includes(v) ? a.filter(x => x !== v) : v === "none" ? ["none"] : [...a.filter(x => x !== "none"), v]; st.ans[s.id] = a.slice(-s.multi); render(); }
      else { st.ans[s.id] = v; stNext(); } },
    stWeight: () => { const w = (document.getElementById("stW").value || "").trim(); S.style.ans.weight = w || "skip"; stNext(); },
    stNext: () => stNext(),
    unlock: () => alert("Premium checkout is coming soon. During the beta everything is free! 💛"),
    lockLater: () => go("home", { tab: "home" }),
    nameEdit: () => { S.nameEdit = true; render(); setTimeout(() => document.getElementById("nameIn")?.focus(), 30); },
    nameSave: () => { const v = (document.getElementById("nameIn").value || "").trim().slice(0, 24); store.save({ ...store.load(), name: v, nameAsked: true }); S.nameEdit = false; render(); },
    nameSkip: () => { store.save({ ...store.load(), nameAsked: true }); S.nameEdit = false; render(); },
    askSample: () => { S.pendingChat = b.dataset.q; S.tab = "chat"; go("home"); },
    mkpref: () => { const st = store.load(), mk = st.mk || {}; mk[b.dataset.k] = mk[b.dataset.k] === b.dataset.v ? undefined : b.dataset.v; store.save({ ...st, mk }); render(); },
    retake: () => go("quiz", { qi: 0, photo: null, drape: null }),
  };
  A[b.dataset.act]?.();
});
document.addEventListener("change", async e => {
  if (e.target.id !== "file" || !e.target.files[0]) return;
  const bmp = await createImageBitmap(e.target.files[0]);
  const c = document.createElement("canvas"); fit(c, bmp.width, bmp.height); c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height); startAnalyze(c);
});
function fit(c, w, h, max = 1024) { const s = Math.min(1, max / Math.max(w, h)); c.width = Math.round(w * s); c.height = Math.round(h * s); }

// ---------- camera ----------
async function startCam() {
  const msg = document.getElementById("camMsg");
  try {
    S.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false });
    const v = document.getElementById("vid"); v.srcObject = S.stream; await v.play();
    msg.textContent = "Line your face up with the oval and hold the paper in the box."; document.getElementById("snapBtn").disabled = false;
  } catch { msg.textContent = "Camera unavailable or blocked. You can choose a photo instead."; }
}
function stopCam() { S.stream?.getTracks().forEach(t => t.stop()); S.stream = null; }

// ---------- photo analysis ----------
function grab(ctx, x, y, r, step = 2) { const px = [], x0 = Math.max(0, x - r | 0), y0 = Math.max(0, y - r | 0), d = ctx.getImageData(x0, y0, Math.ceil(2 * r) + 1, Math.ceil(2 * r) + 1);
  for (let j = 0; j < d.height; j += step) for (let i = 0; i < d.width; i += step) { if ((i + x0 - x) ** 2 + (j + y0 - y) ** 2 > r * r) continue; const k = (j * d.width + i) * 4; px.push([d.data[k], d.data[k + 1], d.data[k + 2]]); } return px; }
function grabRect(ctx, x, y, w, h, step = 3) { const d = ctx.getImageData(Math.max(0, x | 0), Math.max(0, y | 0), Math.max(1, w | 0), Math.max(1, h | 0)), px = [];
  for (let j = 0; j < d.height; j += step) for (let i = 0; i < d.width; i += step) { const k = (j * d.width + i) * 4; px.push([d.data[k], d.data[k + 1], d.data[k + 2]]); } return px; }

async function startAnalyze(src) {
  go("analyze");
  const cv = document.getElementById("cv"), ctx = cv.getContext("2d", { willReadFrequently: true });
  cv.width = src.width; cv.height = src.height; ctx.drawImage(src, 0, 0);
  const clean = ctx.getImageData(0, 0, cv.width, cv.height), R = Math.max(6, cv.width * 0.025);
  const smp = { skin: [], hair: [], eye: [], paper: null }; let chinY = cv.height * 0.72;
  const dot = (x, y, r, col) => { ctx.strokeStyle = col; ctx.lineWidth = Math.max(2, cv.width / 300); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke(); };
  const face = await findFace(cv);
  const base = () => ctx.getImageData(0, 0, cv.width, cv.height);
  if (face) {
    face.cheeks.forEach(p => smp.skin.push(...grab(ctx, p.x, p.y, face.r)));
    face.eyes.forEach(p => smp.eye.push(...grab(ctx, p.x, p.y, face.eyeR, 1)));
    smp.hair = grabRect(ctx, face.hair.x, face.hair.y, face.hair.w, face.hair.h);
    chinY = face.chinY;
    face.cheeks.forEach(p => dot(p.x, p.y, face.r, "#fff")); face.eyes.forEach(p => dot(p.x, p.y, face.eyeR, "#C7B7E3"));
    ctx.strokeStyle = "#F6C9A8"; ctx.strokeRect(face.hair.x, face.hair.y, face.hair.w, face.hair.h);
    askPaper();
  } else manual(0);

  function tapOnce(title, hint, skippable, cb) {
    setText(title, hint);
    ctl(skippable ? `<button class="btn ghost" id="skipTap">${skippable}</button>` : "");
    const h = e => { const r = cv.getBoundingClientRect(); cv.removeEventListener("click", h); cb({ x: (e.clientX - r.left) * cv.width / r.width, y: (e.clientY - r.top) * cv.height / r.height }); };
    cv.addEventListener("click", h);
    const sk = document.getElementById("skipTap"); if (sk) sk.onclick = () => { cv.removeEventListener("click", h); cb(null); };
  }
  function manual(stage) { // fallback when no face found
    const steps = [["Tap your cheek", "We couldn't auto-detect a face. Tap the middle of a cheek (no shadow or shine).", null, p => { smp.skin = grab(ctx, p.x, p.y, R * 1.6); dot(p.x, p.y, R * 1.6, "#fff"); }],
      ["Tap your hair", "Tap natural hair near your face.", "No visible hair", p => { if (p) { smp.hair = grab(ctx, p.x, p.y, R * 1.4); dot(p.x, p.y, R * 1.4, "#F6C9A8"); } }],
      ["Tap one eye (the iris)", "Zoom isn't needed; tap the colored part.", "Skip", p => { if (p) { smp.eye = grab(ctx, p.x, p.y, R * 0.5, 1); dot(p.x, p.y, R * 0.5, "#C7B7E3"); chinY = Math.min(cv.height, p.y + cv.height * 0.3); } }]];
    if (stage >= steps.length) return askPaper();
    const [t, h, sk, fn] = steps[stage];
    tapOnce(t, h, sk, p => { fn(p); manual(stage + 1); });
  }
  function askPaper() {
    tapOnce("Tap the white paper", "This lets us cancel your lighting's color tint.", "No paper", p => {
      if (p) { smp.paper = grab(ctx, p.x, p.y, R * 1.5); dot(p.x, p.y, R * 1.5, "#B9D3A6"); }
      S.photo = analyze(smp); S.cleanImg = clean; showReading(chinY);
    });
  }
  function showReading(cy) {
    const P = S.photo, lean = (x, a, b) => x > 0.15 ? a : x < -0.15 ? b : "in between";
    setText("Your photo reading", P.ok ? "Now try the virtual drapes below." : "We couldn't read this photo, so we'll use your quiz.");
    document.getElementById("reading").innerHTML = P.ok ? `<div class="readcard">
      <div><b>Undertone</b><span>${lean(P.axes.t, "Warm", "Cool")}</span></div><div><b>Value</b><span>${lean(P.axes.v, "Light", "Deep")}</span></div><div><b>Chroma</b><span>${lean(P.axes.c, "Clear", "Muted")}</span></div>
      <div class="skinchip"><i style="--c:${labHex(P.skin)}"></i>Your skin (corrected)</div></div>
      ${P.warnings.length ? `<ul class="warn">${P.warnings.map(w => `<li>⚠️ ${esc(w)}</li>`).join("")}</ul>` : `<p class="ok">✅ Good lighting. This reading looks reliable.</p>`}` : "";
    ctx.putImageData(clean, 0, 0); drapes(cy);
  }
  function drapes(cy) {
    const q = scoreQuiz(S.answers), lean = combine(q, S.photo, null).axes, warm = lean.t >= 0;
    const pairs = [
      ["t", ["Peach coral", "#F4A07A"], ["Rose pink", "#E58FB0"]],
      ["t", ["Warm ivory", "#F3E3C3"], ["Pure white", "#FFFFFF"]],
      ["t", ["Gold", "linear-gradient(135deg,#B8862B,#F6D77A,#B8862B)"], ["Silver", "linear-gradient(135deg,#8E949C,#EEF1F4,#8E949C)"]],
      ["t", ["Camel", "#C19A6B"], ["Cool gray", "#9EA3AB"]],
      ["c", warm ? ["Bright coral", "#FF6F59"] : ["Fuchsia", "#D9338B"], warm ? ["Soft terracotta", "#B9876A"] : ["Mauve", "#B58A9E"]],
      ["v", warm ? ["Light peach", "#FBD1B5"] : ["Powder blue", "#B7D3EE"], warm ? ["Chocolate", "#5A3A2A"] : ["Navy", "#1B2A4A"]]];
    const stripes = cs => `linear-gradient(90deg,${cs.map((c, i) => `${c} ${i * 100 / cs.length}% ${(i + 1) * 100 / cs.length}%`).join(",")})`;
    const seasons = ["Spring", "Summer", "Autumn", "Winter"].map(s => { const ts = TYPES.filter(t => t.season === s); return [s, stripes(ts.flatMap(t => t.best.slice(0, 2).map(b => b[1])))]; });
    const D = { t: 0, v: 0, c: 0, tn: 0, vn: 0, cn: 0, n: 0 }; let i = 0, side = 0;
    const band = document.getElementById("drape"); band.hidden = false; band.style.top = (cy / cv.height * 100) + "%";
    const show = () => {
      if (i < pairs.length) { const [ax, A, B] = pairs[i], cur = side ? B : A; band.style.background = cur[1];
        setText(`Drape ${i + 1} of ${pairs.length + 1}: ${A[0]} vs ${B[0]}`, `Flip between them. Which makes your skin look clearer and brighter, with fewer shadows?`);
        ctl(`<button class="btn ghost" id="flip">↔ Showing: ${cur[0]}</button><button class="btn sm" data-p="1">${A[0]}</button><button class="btn sm" data-p="-1">${B[0]}</button><button class="btn ghost sm" data-p="0">Same</button>`);
      } else { const [s, g] = seasons[side % 4]; band.style.background = g;
        setText(`Drape ${pairs.length + 1}: season swatches`, "Flip through the 4 seasons and pick the one that glows on you.");
        ctl(`<button class="btn ghost" id="flip">↔ Showing: ${s}</button><button class="btn sm" data-season="${s}">Pick ${s}</button><button class="btn ghost sm" data-season="">Skip</button>`); }
      document.getElementById("flip").onclick = () => { side = i < pairs.length ? 1 - side : side + 1; show(); };
      document.querySelectorAll("[data-p]").forEach(b => b.onclick = () => { const ax = pairs[i][0], val = +b.dataset.p, sign = ax === "t" || ax === "c" || ax === "v" ? 1 : 1;
        D[ax] += val * sign; D[ax + "n"]++; D.n++; i++; side = 0; show(); });
      document.querySelectorAll("[data-season]").forEach(b => b.onclick = () => { const s = b.dataset.season;
        if (s) { const m = { Spring: [1, 0.3, 0.5], Summer: [-1, 0.5, -0.2], Autumn: [1, -0.4, -0.5], Winter: [-1, -0.3, 0.6] }[s];
          ["t", "v", "c"].forEach((k, j) => { D[k] += 0.5 * m[j]; D[k + "n"] += 0.5; }); D.n++; }
        for (const k of ["t", "v", "c"]) D[k] = D[k + "n"] ? Math.max(-1, Math.min(1, D[k] / D[k + "n"])) : 0;
        S.drape = D; finish(); });
    };
    show();
  }
}
function stNext() { const st = S.style; if (st.i < ST_STEPS.length - 1) { st.i++; render(); window.scrollTo(0, 0); return; }
  const ans = { ...st.ans, date: new Date().toISOString() }; store.save({ ...store.load(), style: ans }); S.style = { i: 0, ans: {}, quiz: false }; render(); window.scrollTo(0, 0); }
function setText(t, h) { document.getElementById("aTitle").textContent = t; document.getElementById("aHint").textContent = h; }
function ctl(html) { document.getElementById("aCtl").innerHTML = html; }
function labHex({ L, a, b }) { // Lab -> sRGB hex for the skin chip
  const fy = (L + 16) / 116, fx = fy + a / 500, fz = fy - b / 200, fi = t => t ** 3 > 0.008856 ? t ** 3 : (t - 16 / 116) / 7.787;
  const X = fi(fx) * 0.95047, Y = fi(fy), Z = fi(fz) * 1.08883;
  const lin = [3.2406 * X - 1.5372 * Y - 0.4986 * Z, -0.9689 * X + 1.8758 * Y + 0.0415 * Z, 0.0557 * X - 0.204 * Y + 1.057 * Z];
  return "#" + lin.map(c => { c = Math.max(0, Math.min(1, c)); c = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; return Math.round(c * 255).toString(16).padStart(2, "0"); }).join("");
}
function finish() {
  const r = combine(scoreQuiz(S.answers), null, S.drape); // "Your picks": quiz + drapes only
  const x = expertScan(S.photo);                           // Expert scan: photo measurements only (independent)
  S.result = r; S.expert = x; S.view = "picks";
  store.save({ ...store.load(), answers: S.answers, result: r, expert: x && { type: x.type, runnerUp: x.runnerUp, conf: x.conf, label: x.label, reasons: x.reasons } });
  go("result");
}
window.__glowtone = { S, analyze, combine, scoreQuiz, expertScan }; // debug/test hook
render();
