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
  const svg = `<svg class="fm-svg" viewBox="0 0 200 250" role="group" aria-label="Face map: where to apply makeup">
  <defs><filter id="fmBlur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4"/></filter><filter id="fmBlur2"><feGaussianBlur stdDeviation="1.6"/></filter>
  <radialGradient id="fmLip"><stop offset="0" stop-color="${c.lip}" stop-opacity=".95"/><stop offset=".55" stop-color="${c.lip}" stop-opacity=".55"/><stop offset="1" stop-color="${c.lip}" stop-opacity=".12"/></radialGradient></defs>
  <path d="M60 236c2-10 4-16 4-24M140 236c-2-10-4-16-4-24" class="fm-line"/>
  ${g("base", "Cushion", `<g filter="url(#fmBlur)" fill="${c.base}" opacity=".55"><ellipse cx="100" cy="140" rx="46" ry="62"/><ellipse cx="100" cy="72" rx="34" ry="14"/></g>`)}
  ${g("contour", "Contour", `<g filter="url(#fmBlur)" fill="${c.contour}" opacity=".5"><ellipse cx="50" cy="160" rx="14" ry="5" transform="rotate(-38 50 160)"/><ellipse cx="150" cy="160" rx="14" ry="5" transform="rotate(38 150 160)"/><ellipse cx="58" cy="198" rx="14" ry="4" transform="rotate(48 58 198)"/><ellipse cx="142" cy="198" rx="14" ry="4" transform="rotate(-48 142 198)"/></g><g filter="url(#fmBlur2)" fill="${c.contour}" opacity=".45"><ellipse cx="93" cy="140" rx="2.4" ry="18"/><ellipse cx="107" cy="140" rx="2.4" ry="18"/></g>`)}
  ${g("blush", "Blush", `<g filter="url(#fmBlur)" fill="${c.blush}" opacity=".7"><ellipse cx="64" cy="150" rx="19" ry="12" transform="rotate(-22 64 150)"/><ellipse cx="136" cy="150" rx="19" ry="12" transform="rotate(22 136 150)"/></g>`)}
  ${g("hi", "Highlight", `<g filter="url(#fmBlur2)" fill="${c.hi}" opacity=".95"><ellipse cx="100" cy="136" rx="2.6" ry="16"/><ellipse cx="70" cy="132" rx="11" ry="3.6" transform="rotate(-16 70 132)"/><ellipse cx="130" cy="132" rx="11" ry="3.6" transform="rotate(16 130 132)"/><ellipse cx="100" cy="182" rx="5" ry="2"/><ellipse cx="100" cy="216" rx="7" ry="4"/></g>`)}
  ${g("eye", "Eyes", `<g fill="${c.eye}" opacity=".55" filter="url(#fmBlur2)"><path d="M58 117c8-9 22-9 30 0-8-3-22-3-30 0z"/><path d="M112 117c8-9 22-9 30 0-8-3-22-3-30 0z"/></g><g fill="${c.hi}" opacity=".95" filter="url(#fmBlur2)"><ellipse cx="73" cy="125.5" rx="11" ry="2.2"/><ellipse cx="127" cy="125.5" rx="11" ry="2.2"/></g>`)}
  ${g("lip", "Lip tint", `<path d="M84 191c5-5 10-6 16-2 6-4 11-3 16 2-5 9-11 12-16 12s-11-3-16-12z" fill="url(#fmLip)"/>`)}
  <g class="fm-line" pointer-events="none">
    <path d="M100 26c40 0 64 32 64 86 0 30-6 56-20 78-12 20-28 34-44 38-16-4-32-18-44-38-14-22-20-48-20-78 0-54 24-86 64-86z"/>
    <path d="M36 112c-6-2-9 3-8 10 1 9 5 16 10 17M164 112c6-2 9 3 8 10-1 9-5 16-10 17"/>
    <path d="M100 16c-46 0-72 38-72 96 0 34 6 62 16 84M100 16c46 0 72 38 72 96 0 34-6 62-16 84"/>
    <path d="M58 104c8-6 20-7 30-3M112 101c10-4 22-3 30 3"/>
    <path d="M60 119c8-8 20-8 28 0-8 5-20 5-28 0zM112 119c8-8 20-8 28 0-8 5-20 5-28 0z"/>
    <path d="M101 116c-1 14-4 30-7 38 3 4 9 4 12 0"/>
    <path d="M84 191c5-5 10-6 16-2 6-4 11-3 16 2-5 9-11 12-16 12s-11-3-16-12zM84 191c10 3 22 3 32 0"/>
  </g></svg>`;
  const legend = `<div class="fm-legend" role="group" aria-label="Makeup zones">${Z.map(([id, n, col]) => `<button class="fm-key${sel === id ? " on" : ""}" data-act="fzone" data-z="${id}" aria-pressed="${sel === id}"><i style="--c:${col}"></i>${n}</button>`).join("")}</div>`;
  return `<div class="cg-card fm"><p class="h-label">Where it goes</p><div class="fm-wrap">${svg}</div>${legend}
  <p class="fm-tip" id="fmTip" aria-live="polite">${tip ? `<b>${tip[1]}.</b> ${esc(tip[3])}` : "Tap a zone or a name to see a quick how-to."}</p></div>`;
}
