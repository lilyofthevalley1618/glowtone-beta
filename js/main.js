import { QUESTIONS, scoreQuiz } from "./quiz.js";
import { analyze } from "./color.js";
import { combine } from "./classify.js";
import { TYPES, byId, nameOf } from "./palettes.js";
import { findFace } from "./face.js";
import * as store from "./storage.js";

const $app = document.getElementById("app"), $tabs = document.getElementById("tabs");
const saved = store.load();
const S = { screen: saved.result ? "home" : "welcome", tab: "profile", qi: 0, answers: saved.answers || {}, photo: null, drape: null, result: saved.result || null, stream: null };
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

result: () => { const r = S.result, t = byId[r.type], ru = byId[r.runnerUp];
  return `<section class="screen">
  <p class="step center">Your personal color</p>${card(t)}
  <div class="conf ${r.label.toLowerCase()}"><b>${r.label} confidence</b><span>${r.conf}%</span></div>
  <ul class="why">${r.why.map(w => `<li>${esc(w)}</li>`).join("")}</ul>
  <p class="muted">Close runner-up: <b>${nameOf(ru)}</b> (${ru.ko}).${r.label === "Low" ? " Try the photo step again in daylight with white paper for a better read." : ""}</p>
  <button class="btn" data-act="toHome">See my palettes →</button>
  <button class="link" data-act="retake">Retake</button></section>`; },

home: () => { const t = S.result ? byId[S.result.type] : null;
  if (!t) return V.welcome();
  if (S.tab === "style") return soon("Style", "Flattering cuts and outfit colors for your type, with optional body questions. Body-positive, always.");
  if (S.tab === "skin") return soon("Skin", "A Korean skincare quiz with researched K-beauty routines. Not medical advice.");
  const m = t.makeup;
  return `<section class="screen">${card(t)}
  <p class="traits">${esc(t.traits)}</p><p>${esc(t.desc)}</p>
  <h3>Best colors</h3><div class="grid">${sw(t.best)}</div>
  <h3>Colors to avoid near your face</h3><div class="grid">${sw(t.worst, "sw x")}</div>
  <h3>Clothing neutrals</h3><div class="grid">${sw(t.neutrals)}</div>
  <h3>Makeup</h3><p class="lbl">Lips</p><div class="grid">${sw(m.lip)}</div><p class="lbl">Blush</p><div class="grid">${sw(m.blush)}</div><p class="lbl">Eyes</p><div class="grid">${sw(m.eyes)}</div>
  <h3>Hair colors</h3><div class="grid">${sw(t.hair)}</div>
  <h3>Jewelry metals</h3><p class="metals">${t.metals.map(x => `<span>${esc(x)}</span>`).join("")}</p>
  <div class="tipbox">💡 ${esc(t.tip)}</div>
  <p class="tiny">Result from ${new Date(S.result.date).toLocaleDateString()} · ${S.result.label} confidence (${S.result.conf}%)</p>
  <div class="row"><button class="btn ghost" data-act="retake">Retake analysis</button><a class="btn ghost" id="fb" href="${store.FEEDBACK_URL.startsWith("PASTE") ? "#" : store.FEEDBACK_URL}" target="_blank" rel="noopener">💌 Send feedback</a></div></section>`; },
};
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
    toHome: () => go("home", { tab: "profile" }),
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
function setText(t, h) { document.getElementById("aTitle").textContent = t; document.getElementById("aHint").textContent = h; }
function ctl(html) { document.getElementById("aCtl").innerHTML = html; }
function labHex({ L, a, b }) { // Lab -> sRGB hex for the skin chip
  const fy = (L + 16) / 116, fx = fy + a / 500, fz = fy - b / 200, fi = t => t ** 3 > 0.008856 ? t ** 3 : (t - 16 / 116) / 7.787;
  const X = fi(fx) * 0.95047, Y = fi(fy), Z = fi(fz) * 1.08883;
  const lin = [3.2406 * X - 1.5372 * Y - 0.4986 * Z, -0.9689 * X + 1.8758 * Y + 0.0415 * Z, 0.0557 * X - 0.204 * Y + 1.057 * Z];
  return "#" + lin.map(c => { c = Math.max(0, Math.min(1, c)); c = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; return Math.round(c * 255).toString(16).padStart(2, "0"); }).join("");
}
function finish() {
  const r = combine(scoreQuiz(S.answers), S.photo, S.drape);
  S.result = r; store.save({ ...store.load(), answers: S.answers, result: r, photoUsed: !!S.photo?.ok });
  go("result");
}
window.__glowtone = { S, analyze, combine, scoreQuiz }; // debug/test hook
render();
