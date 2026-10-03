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
  // Cute, minimal sticker-style face: closed smiling eyes, soft bob, round cheeks. Right-side features mirror the left via <use>.
  const M = 'transform="translate(240 0) scale(-1 1)"', HAIR = "#F1E9E0", SKIN = "#FFFCF8";
  const svg = `<svg class="fm-svg" viewBox="0 18 240 236" role="group" aria-label="Face map: where to apply makeup">
  <defs><linearGradient id="fmLip" x1="0" x2="1"><stop offset="0" stop-color="${c.lip}" stop-opacity=".35"/><stop offset=".5" stop-color="${c.lip}" stop-opacity=".9"/><stop offset="1" stop-color="${c.lip}" stop-opacity=".35"/></linearGradient>
  <g id="fmEyeL"><path class="fm-line fm-eye" d="M81 134Q92 145 103 134"/><path class="fm-line fm-lash" d="M83.2 136.6l-4 2.2M86.6 139.4l-2.6 3.4"/></g></defs>
  <g class="fm-line" pointer-events="none">
    <path fill="${HAIR}" d="M120 30C180 30 210 76 208 134 207 166 206 188 198 204Q190 214 178 208Q164 197 150 196L90 196Q76 197 62 208Q50 214 42 204C34 188 33 166 32 134 30 76 60 30 120 30Z"/>
    <path fill="${SKIN}" d="M64 254C66 236 86 226 106 223L106 204 134 204 134 223C154 226 174 236 176 254"/>
  </g>
  <path fill="${SKIN}" d="M120 54C168 54 190 90 190 130 190 178 160 210 120 210S50 178 50 130C50 90 72 54 120 54Z"/>
  ${g("base", "Cushion", `<ellipse cx="120" cy="148" rx="46" ry="44" fill="${c.base}" opacity=".2"/>`)}
  ${g("contour", "Contour", `<g fill="${c.contour}" opacity=".32"><path id="fmConL" d="M54 150C56 172 66 190 84 202 72 191 62 175 59 150 58 146 54 146 54 150Z"/><use href="#fmConL" ${M}/></g>`)}
  ${g("blush", "Blush", `<g fill="${c.blush}" opacity=".55"><ellipse cx="78" cy="160" rx="17" ry="11"/><ellipse cx="162" cy="160" rx="17" ry="11"/></g>`)}
  ${g("hi", "Highlight", `<g fill="${c.hi}"><ellipse cx="120" cy="108" rx="10" ry="5.5"/><ellipse cx="120" cy="146" rx="2.8" ry="7"/><circle cx="101" cy="154" r="3.6"/><circle cx="139" cy="154" r="3.6"/><ellipse cx="120" cy="196" rx="7.5" ry="3.6"/></g>`)}
  ${g("eye", "Eyes", `<g><path id="fmLidL" fill="${c.eye}" opacity=".5" d="M81 134Q92 123 103 134Q92 145 81 134Z"/><use href="#fmLidL" ${M}/><path id="fmAegL" fill="${c.hi}" d="M83 141Q92 153 101 141Q92 145 83 141Z"/><use href="#fmAegL" ${M}/></g>`)}
  ${g("lip", "Lip tint", `<path fill="url(#fmLip)" d="M111 172Q115.5 168.4 120 171 124.5 168.4 129 172 124.8 178 120 178 115.2 178 111 172Z"/>`)}
  <g class="fm-line" pointer-events="none">
    <path d="M120 54C168 54 190 90 190 130 190 178 160 210 120 210S50 178 50 130C50 90 72 54 120 54Z"/>
    <path fill="${HAIR}" d="M52 116C54 76 82 52 120 52S186 76 188 116C180 98 164 86 146 82 136 92 118 96 100 94 84 94 66 102 52 116Z"/>
    <use href="#fmEyeL"/><use href="#fmEyeL" ${M}/>
    <path d="M117.4 156.4q2.6 3 5.2 0"/>
    <path class="fm-lipline" d="M111 172Q115.5 168.4 120 171 124.5 168.4 129 172 124.8 178 120 178 115.2 178 111 172ZM112.4 172.4Q120 174.4 127.6 172.4"/>
  </g></svg>`;
  const legend = `<div class="fm-legend" role="group" aria-label="Makeup zones">${Z.map(([id, n, col]) => `<button class="fm-key${sel === id ? " on" : ""}" data-act="fzone" data-z="${id}" aria-pressed="${sel === id}"><i style="--c:${col}"></i>${n}</button>`).join("")}</div>`;
  return `<div class="cg-card fm"><p class="h-label">Where it goes</p><div class="fm-wrap">${svg}</div>${legend}
  <p class="fm-tip" id="fmTip" aria-live="polite">${tip ? `<b>${tip[1]}.</b> ${esc(tip[3])}` : "Tap a zone or a name to see a quick how-to."}</p></div>`;
}
