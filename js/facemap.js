// Makeup placement by face shape: 6 minimal outline faces with crisp, flat highlight / contour / blush shapes
// (placements adapted from a classic contour chart). Tap a face or legend item for a short tip.
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const DEF = { base: "#E8C8AE", blush: "#EFA7A7", contour: "#A8846A", hi: "#FFFDF8", lip: "#D98A86" };
const mix = (a, b, t) => "#" + [1, 3, 5].map(i => Math.round(parseInt(a.substr(i, 2), 16) * (1 - t) + parseInt(b.substr(i, 2), 16) * t).toString(16).padStart(2, "0")).join("");
// Each face: outline path (160x190 box) and left-side placements (mirrored), plus centered extras.
// h/c = highlight/contour stroke bands [d, width]; b = blush ellipses [cx, cy, rx, ry]; dot = highlight blobs [cx, cy, rx, ry]
const NOSE_C = [["M70 77Q74 82 74.5 94L74.5 110Q74 120 80 124", 4]], BRIDGE = [["M80 90L80 113", 4.5]];
const FACES = [
  { id: "oval", name: "Oval Face", path: "M80 22C112 22 128 50 128 88 128 128 108 166 80 170 52 166 32 128 32 88 32 50 48 22 80 22Z",
    h: [["M44 82Q43 62 60 57", 6], ["M70 98L59 109", 6], ["M50 122L60 115", 6], ["M60 131Q60 150 72 158", 6]], c: [["M38 96Q41 130 58 156", 5]],
    b: [[50, 104, 9, 7], [80, 166, 6, 4, 1]], dot: [[80, 38, 13, 7]],
    tip: "Balanced already, so keep it light. Contour softly along the outer cheeks and nose sides, brighten the forehead, under-eyes and around the mouth, and tap blush on the outer cheeks plus a touch on the chin." },
  { id: "long", name: "Long Face", path: "M80 14C108 14 122 42 122 84 122 128 108 168 80 176 52 168 38 128 38 84 38 42 52 14 80 14Z",
    h: [["M43 70L43 90", 6], ["M72 95Q72 101 63 104", 6], ["M51 124L61 116", 6]], c: [], b: [[54, 106, 11, 5]], dot: [[80, 30, 12, 6]],
    xh: [["M64 160Q80 168 96 160", 6]], xc: [["M62 168Q80 177 98 168", 4.5]],
    tip: "Shorten the face visually. Shade under the chin, keep highlight in short strokes (temples, inner under-eyes, a small chin curve), and sweep blush horizontally across the cheeks." },
  { id: "round", name: "Square/Round Face", path: "M80 24C114 24 132 46 132 84 132 118 130 146 116 160 106 168 94 172 80 172 66 172 54 168 44 160 30 146 28 118 28 84 28 46 46 24 80 24Z",
    h: [["M68 96L58 108", 6], ["M63 133Q61 150 72 160", 6]], c: [["M35 132Q39 154 54 163", 5.5]], b: [[47, 104, 12, 11]], dot: [],
    xh: [["M52 61Q80 52 108 61", 6]], xdot: [[80, 115, 3.6, 3.6]],
    tip: "Soften the jaw corners with contour, add a band of highlight across the forehead and around the chin to lengthen, and use round blush on the apples of the cheeks." },
  { id: "diamond", name: "Diamond Face", path: "M80 22C98 22 108 36 114 56 120 74 130 88 130 100 130 124 104 158 80 172 56 158 30 124 30 100 30 88 40 74 46 56 52 36 62 22 80 22Z",
    h: [["M46 64L44 86", 7], ["M70 98L58 110", 7], ["M53 128L62 120", 6], ["M58 146L68 157", 7]], c: [["M35 97L46 111", 6]], b: [[50, 104, 7, 8], [80, 115, 3.4, 3, 1]], dot: [[80, 36, 10, 7]],
    xc: [["M70 168Q80 173 90 168", 4.5]],
    tip: "Widen the forehead and chin with highlight, tuck contour just under the widest part of the cheekbones and under the chin, and keep blush small and high." },
  { id: "high", name: "High Cheekbones", path: "M80 22C108 22 124 42 128 66 131 82 132 94 126 110 116 140 98 164 80 170 62 164 44 140 34 110 28 94 29 82 32 66 36 42 52 22 80 22Z",
    h: [["M40 80L54 99", 7], ["M70 96L63 106", 6], ["M55 136Q62 155 80 162", 6]], c: [["M37 90L53 119", 6]], b: [[56, 110, 6.5, 7.5]], dot: [[80, 34, 10, 6]],
    tip: "Follow the cheekbone: a diagonal contour band just under it, highlight in a lifted line above it and along the jaw, and a small blush between the two." },
  { id: "concave", name: "Concave Face", path: "M80 22C112 22 128 46 128 80 128 96 124 104 120 114 118 122 120 134 114 148 106 162 94 170 80 172 66 170 54 162 46 148 40 134 42 122 40 114 36 104 32 96 32 80 32 46 48 22 80 22Z",
    h: [["M46 70Q52 56 72 56", 6], ["M40 66L40 90", 6], ["M70 96L60 108", 7], ["M51 122L61 114", 6], ["M47 133L58 147", 6]], c: [["M38 96Q41 116 44 132", 5], ["M58 158Q69 169 80 171", 4.5]], b: [[52, 104, 8, 7]], dot: [[80, 34, 10, 6]],
    tip: "Fill out hollow cheeks with light: highlight the temples, under-eyes and lower cheeks, keep contour very thin along the outer edge, and add soft blush on the upper cheeks." }];
const LEG = [["hi", "Highlight", "Highlight (cream, stick or powder) goes where light hits: forehead center, under-eye, nose bridge and chin. Tap it on, then blend only the edges."],
  ["contour", "Contour", "Contour a shade or two deeper than your cushion, in a cool-taupe or soft-brown that suits your tone. Draw thin lines, then tap to soften."],
  ["blush", "Blush", "Blush in your season shade. Smile and tap it on the apples or upper cheeks, following the shape shown for your face."]];
const HI = "#F5EEE6", HO = "#E2D5C8", CO = "#A88A76", BL = "#F2B8BE";
// wide, flat, rounded brush bands; highlight gets a light outline
const band = (arr, col, f = 1.6) => (arr || []).map(([d, w]) => (col === HI ? `<path d="${d}" fill="none" stroke="${HO}" stroke-width="${w * f + 1.4}" stroke-linecap="round" stroke-linejoin="round"/>` : "") + `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w * f}" stroke-linecap="round" stroke-linejoin="round"/>`).join("");
const ell = (arr, col, f = 1.25) => (arr || []).map(([cx, cy, rx, ry]) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx * f}" ry="${ry * f}" fill="${col}"${col === HI ? ` stroke="${HO}" stroke-width=".8"` : ""}/>`).join("");
const mir = s => `${s}<g transform="translate(160 0) scale(-1 1)">${s}</g>`;
// One master line-art face (left half, mirrored): hair with center part, almond eyes, soft brows, nostrils.
const HAIR = mir(`<path d="M79 12C46 13 27 44 26 90 25 130 22 166 15 200"/><path class="fs-thin" d="M79 14C60 18 46 33 40 58M72 15C48 26 35 58 33 100 32 140 29 172 22 200M40 58C36 88 38 128 35 166 34 180 31 192 27 200"/>`);
const FEAT = mir(`<path class="fs-brow" d="M50 76.5C56 74.6 64 74.4 72 75.8"/><path d="M52 88.5C56 82.4 66 81.6 72.4 87.4"/><path class="fs-thin" d="M53 89.4C58 92.6 66 92.6 71.4 88.6"/>
 <circle cx="62.2" cy="87.6" r="3.5" fill="#8E8078" stroke="none"/><circle cx="62.2" cy="87.6" r="1.5" fill="#4E4540" stroke="none"/><circle cx="63.3" cy="86.5" r=".8" fill="#fff" stroke="none"/>
 <path class="fs-thin" d="M67 83.2l1-2.3M69.8 84.6l1.8-1.7M72.2 87.2l2.3-.8M52 88.5l-2.2-.9"/><path class="fs-thin" d="M74.6 118.5C73 121.4 75.4 123.4 78 122.4"/><path class="fs-thin" d="M66 166C67 178 66 190 63 200"/>`)
 + `<path class="fs-thin" d="M78 122.8Q80 123.6 82 122.8"/><path d="M70 140C73 137 76.5 135.4 78.5 136.8Q80 137.8 81.5 136.8C83.5 135.4 87 137 90 140M70 140Q80 141.8 90 140M71 140.6C74 146.2 77 147.6 80 147.6S86 146.2 89 140.6"/>`;
const LIPS = `<path d="M70 140C73 137 76.5 135.4 78.5 136.8Q80 137.8 81.5 136.8C83.5 135.4 87 137 90 140 86 146.2 83 147.6 80 147.6S74 146.2 70 140Z" fill="#EFC6C0"/>`;
function face(f, k, sel) {
  const side = band(f.c.concat(NOSE_C), CO) + band(f.h, HI) + ell(f.b.filter(e => !e[4]), BL);
  const mid = band(f.xc, CO) + band(BRIDGE.concat(f.xh || []), HI) + ell((f.dot || []).concat(f.xdot || []), HI) + ell(f.b.filter(e => e[4]), BL);
  return `<button class="fs-face${sel === f.id ? " on" : ""}" data-act="fzone" data-z="${f.id}" aria-pressed="${sel === f.id}" aria-label="${f.name}: show tip">
  <svg viewBox="10 6 140 196" aria-hidden="true"><defs><clipPath id="fs-${f.id}"><path d="${f.path}"/></clipPath></defs>
  <path d="${f.path}" fill="#fff"/><g clip-path="url(#fs-${f.id})">${mir(side)}${mid}</g>${LIPS}
  <g class="fs-line"><path d="${f.path}"/>${HAIR}${FEAT}</g></svg><span>${f.name}</span></button>`;
}
export function faceMap(c = DEF, finish, warm = true, sel) {
  c = { ...DEF, ...c };
  const k = { hi: HI, contour: CO, blush: BL };
  const legend = `<div class="fm-legend" role="group" aria-label="Legend">${LEG.map(([id, n]) => `<button class="fm-key${sel === id ? " on" : ""}" data-act="fzone" data-z="${id}" aria-pressed="${sel === id}"><i style="--c:${k[id]}"></i>${n}</button>`).join("")}</div>`;
  const f = FACES.find(x => x.id === sel), l = LEG.find(x => x[0] === sel), tip = f ? [f.name, f.tip] : l ? [l[1], l[2]] : null;
  return `<div class="cg-card fm"><p class="h-label">Where it goes, by face shape</p>${legend}
  <div class="fs-grid" role="group" aria-label="Face shapes">${FACES.map(x => face(x, k, sel)).join("")}</div>
  <p class="fm-tip" id="fmTip" aria-live="polite">${tip ? `<b>${tip[0]}.</b> ${esc(tip[1])}` : "Tap your face shape to see where highlight, contour and blush go."}</p></div>`;
}
