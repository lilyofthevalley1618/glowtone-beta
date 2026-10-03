// Makeup face placement map: line-drawing face (inline SVG) with soft zones in the user's season shades.
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const DEF = { base: "#E8C8AE", blush: "#E7A7A0", contour: "#A88B7A", hi: "#F6EADB", lip: "#D27C7C", eye: "#C9A28C" };
// c: colors {base, blush, contour, hi, lip, eye}; finish: matte|satin|dewy|undefined
export function zones(c, finish, warm) {
  const dewy = finish === "dewy", matte = finish === "matte";
  return [
    ["base", "Cushion", c.base, `${dewy ? "Dewy" : matte ? "Soft-matte" : "Glow"} cushion. Tap a thin layer in the center of the face and the T-zone with the puff, then press it outward so it fades at the edges.`],
    ["blush", "Blush", c.blush, `${dewy ? "Cream or liquid" : "Powder"} blush. Smile, tap it on the apples and upper cheeks, then blend up and out slightly toward the temples. Keep it soft and sheer.`],
    ["contour", "Contour", c.contour, `A ${warm ? "soft warm-brown" : "cool taupe"} contour powder or stick. Use a light touch under the cheekbones, along the jaw edge and down the sides of the nose, then blend well.`],
    ["hi", "Highlight", c.hi, `${matte ? "A satin" : "A sheer, glowy"} highlighter. Dab it on the nose bridge, the tops of the cheekbones, the cupid's bow and the chin.`],
    ["lip", "Lip tint", c.lip, `${dewy ? "Glossy or water tint" : matte ? "Velvet tint" : "Tint"}, Korean gradient style. Dab it in the center of the lips, press the lips together, then blur the edges with a fingertip.`],
    ["eye", "Eyes", c.eye, "Eyeshadow on the lids: sweep a light base over the lid and a slightly deeper shade near the lash line. For aegyo-sal, add a little shimmer just under the lower lash line."]];
}
export function faceMap(c = DEF, finish, warm = true, sel) {
  c = { ...DEF, ...c }; const Z = zones(c, finish, warm), tip = Z.find(z => z[0] === sel);
  const g = (id, label, inner) => `<g class="fz${sel === id ? " on" : ""}" data-act="fzone" data-z="${id}" role="button" tabindex="0" aria-label="${label}: show tip" aria-pressed="${sel === id}">${inner}</g>`;
  // Fashion-illustration face (original drawing): left-side features are drawn once and mirrored with <use>.
  const M = 'transform="translate(240 0) scale(-1 1)"';
  const svg = `<svg class="fm-svg" viewBox="0 22 240 260" role="group" aria-label="Face map: where to apply makeup">
  <defs><linearGradient id="fmLip" x1="0" x2="1"><stop offset="0" stop-color="${c.lip}" stop-opacity=".18"/><stop offset=".5" stop-color="${c.lip}" stop-opacity=".85"/><stop offset="1" stop-color="${c.lip}" stop-opacity=".18"/></linearGradient>
  <g id="fmHairL"><path class="fm-line" d="M120 34C82 30 52 56 48 104 45 140 52 168 46 200 41 226 30 244 34 262c4 6 10 6 14 2"/>
   <path class="fm-line fm-thin" d="M118 36C92 44 74 66 68 98 64 120 63 140 63 156M112 38C84 50 62 86 58 128 55 162 60 190 54 216 50 234 44 248 46 262M102 42C74 60 56 100 54 146 52 180 54 206 46 230 42 242 40 252 42 260M63 156C66 186 72 206 70 226 69 238 64 248 58 256M90 46C66 70 52 110 52 150"/></g>
  <g id="fmEyeL"><path class="fm-line fm-thin" d="M81 122C89 115 101 115 108 121"/>
   <path class="fm-line" d="M79 129C86 121 100 119 108 127M82 130C90 135 100 135 107 129"/>
   <circle cx="94" cy="127.6" r="4.6" fill="#B9AEA6"/><circle cx="94" cy="127.6" r="2" fill="#6F6662"/><circle cx="95.5" cy="126.2" r=".9" fill="#fff"/>
   <path class="fm-line fm-thin" d="M79 129l-3 -2.4M98 120.6l1.2 -3.2M102.4 121.6l2 -2.8M106 124l2.8 -1.8M108 127l3.4 -.6"/>
   <path d="M75 115C85 106 100 105 111 110 100 108.6 88 109.6 75 115z" fill="#8E8580"/></g></defs>
  ${g("base", "Cushion", `<path fill="${c.base}" opacity=".32" d="M120 72c18 0 30 8 30 22 0 10-6 16-6 26 0 14 16 24 16 46 0 26-18 46-40 46s-40-20-40-46c0-22 16-32 16-46 0-10-6-16-6-26 0-14 12-22 30-22z"/>`)}
  ${g("contour", "Contour", `<g fill="${c.contour}" opacity=".45"><path id="fmConL" d="M65 146C68 164 79 177 93 184 85 174 77 162 72 146 70 141 66 141 65 146zM77 196C88 212 100 222 112 226 101 218 91 208 84 194 81 190 76 192 77 196zM112 134c1 0 1.6.6 1.6 1.6v24c0 1-.6 1.6-1.6 1.6s-1.6-.6-1.6-1.6v-24c0-1 .6-1.6 1.6-1.6z"/><use href="#fmConL" ${M}/></g>`)}
  ${g("blush", "Blush", `<g fill="${c.blush}" opacity=".5"><ellipse cx="81" cy="161" rx="15" ry="9.5" transform="rotate(-18 81 161)"/><ellipse cx="159" cy="161" rx="15" ry="9.5" transform="rotate(18 159 161)"/></g>`)}
  ${g("hi", "Highlight", `<g fill="${c.hi}" opacity=".9" stroke="${c.hi}" stroke-width="3" stroke-linejoin="round"><circle cx="120" cy="88" r="11" stroke="none"/><path d="M86 142h18l-9 12z"/><path d="M136 142h18l-9 12z"/><rect x="118" y="128" width="4" height="30" rx="2" stroke="none"/><ellipse cx="120" cy="181" rx="4" ry="1.6" stroke="none"/><ellipse cx="120" cy="214" rx="10" ry="5.5" stroke="none"/></g>`)}
  ${g("eye", "Eyes", `<g><path id="fmLidL" fill="${c.eye}" opacity=".55" d="M80 127.5C86 116 102 114 108.5 125 100 119.5 88 119.5 80 127.5z"/><use href="#fmLidL" ${M}/><path id="fmAegL" fill="${c.hi}" opacity=".95" d="M82 132C90 139 100 139 107 131 102 142 89 142 82 132z"/><use href="#fmAegL" ${M}/></g>`)}
  ${g("lip", "Lip tint", `<path fill="url(#fmLip)" d="M100 190C106 184 113 182 117 185 119 186 121 186 123 185 127 182 134 184 140 190 134 200 126 203 120 203 114 203 106 200 100 190z"/>`)}
  <g pointer-events="none">
    <use href="#fmHairL"/><use href="#fmHairL" ${M}/><use href="#fmEyeL"/><use href="#fmEyeL" ${M}/>
    <path class="fm-line" d="M62 108C62 76 88 58 120 58S178 76 178 108C180 144 174 174 160 196 148 214 134 226 120 227 106 226 92 214 80 196 66 174 60 144 62 108zM98 216C100 232 99 248 95 262M142 216C140 232 141 248 145 262M95 262C76 266 54 270 34 276M145 262C164 266 186 270 206 276"/>
    <path class="fm-line fm-thin" d="M114 132C113.4 146 111.6 158 109 165M109 165c0 4 4 6 7.5 4M131 165c0 4-4 6-7.5 4M116.5 171c2.4 1 4.6 1 7 0"/>
    <path class="fm-line" d="M100 190C106 184 113 182 117 185 119 186 121 186 123 185 127 182 134 184 140 190M100 190C108 192.4 132 192.4 140 190M101.5 191C107 200 114 203 120 203S133 200 138.5 191"/>
  </g></svg>`;
  const legend = `<div class="fm-legend" role="group" aria-label="Makeup zones">${Z.map(([id, n, col]) => `<button class="fm-key${sel === id ? " on" : ""}" data-act="fzone" data-z="${id}" aria-pressed="${sel === id}"><i style="--c:${col}"></i>${n}</button>`).join("")}</div>`;
  return `<div class="cg-card fm"><p class="h-label">Where it goes</p><div class="fm-wrap">${svg}</div>${legend}
  <p class="fm-tip" id="fmTip" aria-live="polite">${tip ? `<b>${tip[1]}.</b> ${esc(tip[3])}` : "Tap a zone or a name to see a quick how-to."}</p></div>`;
}
