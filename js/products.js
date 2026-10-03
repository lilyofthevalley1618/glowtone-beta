// Product picks for the Makeup tab. Swap-ready: replace `url` with affiliate links or add `img` later.
// Shade names were checked on the source pages below on Oct 3, 2026. Prices are approximate (USD). Swatch hexes are OUR approximations,
// not brand colors, and the UI says "Shade colors are approximate." We never hotlink brand or retailer photos.
// tags: which sub-types a shade suits best (light / bright / true / mute / deep), or "all" for the whole season family.
export const CHECKED = "Oct 2026";
export const LINES = {
  jlt:   { brand: "rom&nd", name: "The Juicy Lasting Tint", kind: "lip", finish: "dewy", price: 17, url: "https://www.yesstyle.com/en/romand-the-juicy-lasting-tint-23-colors-01-pomelo-skin/info.html/pid.1134228333" },
  glowy: { brand: "Peripera", name: "Ink Mood Glowy Tint", kind: "lip", finish: "dewy", price: 9, url: "https://www.yesstyle.com/en/peripera-ink-mood-glowy-tint-3-colors-11-brown-heaven/info.html/pid.1111841655" },
  velvet:{ brand: "Peripera", name: "Ink the Velvet", kind: "lip", finish: "matte", price: 10, url: "https://www.yesstyle.com/en/peripera-ink-velvet-31-colors-19-love-sniper-red/info.html/pid.1057853640" },
  ce3:   { brand: "3CE", name: "Velvet Lip Tint", kind: "lip", finish: "matte", price: 17, url: "https://www.yesstyle.com/en/3ce-velvet-lip-tint-15-colors/info.html/pid.1062772614" },
  btc:   { brand: "rom&nd", name: "Better Than Cheek", kind: "blush", finish: "matte", price: 12.5, url: "https://romandbeauty.com/products/better-than-cheek" },
  pbs:   { brand: "Peripera", name: "Pure Blushed Sunshine Cheek", kind: "blush", finish: "matte", price: 8, url: "https://www.yesstyle.com/en/peripera-pure-blushed-sunshine-cheek-9-colors-05-rose/info.html/pid.1092832302" },
  roll:  { brand: "rom&nd", name: "Juicy Roll Cheek", kind: "blush", finish: "dewy", price: 23, url: "https://kiyoko.com/products/rom-nd-juicy-roll-cheek-8-4g" },
  balm:  { brand: "AMUSE", name: "Lip & Cheek Healthy Balm", kind: "blush", finish: "dewy", price: 17, url: "https://sungsinsa.com/products/amuse-lip-cheek-healthy-balm" },
  btp:   { brand: "rom&nd", name: "Better Than Palette", kind: "eyes", finish: "any", price: 26, url: "https://romandbeauty.com/products/better-than-palette" },
  dsq:   { brand: "dasique", name: "Shadow Palette", kind: "eyes", finish: "any", price: 28, url: "https://www.yesstyle.com/en/dasique-shadow-palette-9-types/info.html/pid.1124811137" },
  fw:    { brand: "CLIO", name: "Kill Cover Founwear Cushion The Original", kind: "base", finish: "matte", price: 31, url: "https://global.oliveyoung.com/product/detail?prdtNo=GA250832751" },
  mesh:  { brand: "CLIO", name: "Kill Cover Mesh Glow Essential Cushion", kind: "base", finish: "dewy", price: 22, url: "https://www.yesstyle.com/en/clio-kill-cover-mesh-glow-cushion-set-4-colors-21n-linen/info.html/pid.1133975498" },
  amuse: { brand: "AMUSE", name: "Dew Power Vegan Cushion", kind: "base", finish: "dewy", price: 32, url: "https://amuseseoulmakeup.com/products/dew-power-vegan-cushion-foundation" },
};
// [line, shade, approx hex (or 4 hexes for palettes), season family, tags, short note]
export const PICKS = [
  // Lips
  ["jlt", "#23 Peach Peach Me", "#EE9A82", "Spring", ["light", "true"], "Coral peach with a hint of beige"],
  ["glowy", "#02 Coral Influencer", "#F0715E", "Spring", ["bright", "true"], "Juicy coral"],
  ["velvet", "#04 Vitality Coral", "#EB6652", "Spring", ["bright", "true"], "Fresh coral velvet"],
  ["velvet", "#35 Spring Salmon", "#F08A7A", "Spring", ["light"], "Soft salmon velvet"],
  ["jlt", "#03 Bare Grape", "#D38E98", "Summer", ["light", "mute"], "Pink beige"],
  ["jlt", "#04 Fig Fig", "#B76674", "Summer", ["mute", "true"], "Cool rose MLBB"],
  ["glowy", "#03 Rose In Mind", "#D06A82", "Summer", ["true", "light"], "Glowy rose"],
  ["velvet", "#02 Celeb Deep Rose", "#A94D63", "Summer", ["mute", "true"], "Deep rose velvet"],
  ["velvet", "#46 Pink Mauve Nude", "#C78893", "Summer", ["light", "mute"], "Pink mauve nude"],
  ["jlt", "#09 Mulled Peach", "#CF7A66", "Autumn", ["mute", "true"], "Muted coral"],
  ["jlt", "#13 Eat Dotori", "#9C3D30", "Autumn", ["deep", "true"], "Red brick, like an autumn acorn"],
  ["ce3", "Taupe", "#A0695D", "Autumn", ["mute"], "Muted rosy brown nude"],
  ["velvet", "#01 Good Brick", "#8B3833", "Autumn", ["deep", "true"], "Brick burgundy velvet"],
  ["jlt", "#07 Cherry Bomb", "#A0182E", "Winter", ["deep", "true"], "Darkened cherry red"],
  ["jlt", "#21 Grape Bomb", "#BE2F5C", "Winter", ["bright", "true"], "Reddish pink with a hint of blue"],
  ["velvet", "#08 Sellout Red", "#BE1A2D", "Winter", ["true", "deep"], "Classic red velvet"],
  ["velvet", "#16 Heart Fuchsia Pink", "#CE2C72", "Winter", ["bright"], "Fuchsia pink velvet"],
  // Blush
  ["btc", "C01 Peach Chip", "#F3A58C", "Spring", ["true", "bright"], "Peach coral"],
  ["btc", "W03 Apricot Milk", "#F6BE9A", "Spring", ["light"], "Soft apricot with milk"],
  ["balm", "02 Mango Balm", "#F29A72", "Spring", ["all"], "Coral mango cream"],
  ["roll", "Apricot Beige", "#EDB394", "Spring", ["light", "true"], "Soft apricot beige liquid"],
  ["btc", "C02 Blueberry Chip", "#D9A3AE", "Summer", ["mute", "true"], "Pale muted pink"],
  ["btc", "W02 Strawberry Milk", "#F2B5C0", "Summer", ["light"], "Baby pink with milk"],
  ["pbs", "#29 Dusty Mauve", "#C792A0", "Summer", ["mute"], "Dusty mauve"],
  ["roll", "White Peach", "#F4C3C4", "Summer", ["light", "true"], "Pale white-peach pink liquid"],
  ["roll", "Bare Grape", "#D7A0A8", "Summer", ["mute"], "Muted pink-beige liquid"],
  ["balm", "03 Strawberry Balm", "#E58A9E", "Summer", ["true", "light"], "Cool strawberry pink cream"],
  ["btc", "C03 Fig Chip", "#B9695A", "Autumn", ["deep", "true"], "Fig brick"],
  ["btc", "N01 Nutty Nude", "#D5A28C", "Autumn", ["mute"], "Soft beige nude"],
  ["pbs", "#16 Acorn Beige", "#C99079", "Autumn", ["mute", "true"], "Warm acorn beige"],
  ["balm", "05 Fig Balm", "#B8615A", "Autumn", ["deep", "true"], "Reddish fig cream"],
  ["roll", "Apricot Beige", "#EDB394", "Autumn", ["mute"], "Soft apricot beige liquid"],
  ["btc", "W01 Odi Milk", "#C892B4", "Winter", ["all"], "Mulberry cream"],
  ["btc", "C02 Blueberry Chip", "#D9A3AE", "Winter", ["true"], "Cool pale pink (sheer it out)"],
  ["balm", "03 Strawberry Balm", "#E58A9E", "Winter", ["bright", "true"], "Cool strawberry pink cream"],
  ["balm", "04 Grape Balm", "#B76C93", "Winter", ["deep"], "Grape cream"],
  // Eyeshadow palettes
  ["btp", "01 Pampas Garden", ["#F6D8C2", "#F0B49A", "#E39A7C", "#D9B77A"], "Spring", ["all"], "Peach, coral and champagne gold"],
  ["dsq", "07 Milk Latte", ["#F5E6D6", "#E8CDB2", "#D2AE8C", "#A98468"], "Spring", ["light"], "Light cream beige"],
  ["btp", "03 Rosebud Garden", ["#EBCFCB", "#D7A5A6", "#B98188", "#8E626B"], "Summer", ["all"], "Dusty rose, mauve and pink beige"],
  ["btp", "04 Dusty Fog Garden", ["#E2D3CC", "#C7B2AA", "#A68E87", "#7D6A66"], "Summer", ["mute"], "Muted, foggy neutrals"],
  ["dsq", "02 Rose Petal", ["#F2D3D0", "#E2AFB0", "#C98A91", "#9C6670"], "Summer", ["light", "true"], "Soft rose"],
  ["btp", "02 Mahogany Garden", ["#E7C49E", "#C58B5A", "#9A5A3A", "#5E3226"], "Autumn", ["deep", "true"], "Caramel, cinnamon, copper and chocolate"],
  ["dsq", "01 Sugar Brownie", ["#E6CBB2", "#C49A7A", "#94684D", "#5E4030"], "Autumn", ["mute", "true"], "Soft browns and bronze"],
  ["dsq", "05 Sunset Muhly", ["#F0C7A8", "#DE9572", "#B66A4E", "#7E4836"], "Autumn", ["true"], "Warm coral and brown"],
  ["btp", "07 Berry Fuchsia Garden", ["#EBC6D3", "#D07AA0", "#A0406E", "#5E2240"], "Winter", ["bright", "true"], "Berry and fuchsia"],
  ["btp", "05 Shade & Shadow Garden", ["#E2D6D0", "#AE9C96", "#6E5E5C", "#3A3234"], "Winter", ["deep"], "Light-to-dark contrast shades"],
];
// Cushion shades by undertone. CLIO Founwear has no W shade in this line, so warm types get the closest (23N).
export const BASE = {
  fw: { Cool: ["21C Lingerie", "#E9C7B0"], Neutral: ["21N Linen", "#E6C2A2"], Warm: ["23N Ginger", "#DDB290"] },
  mesh: { Cool: ["21C Lingerie", "#E9C7B0"], Neutral: ["21N Linen", "#E6C2A2"], Warm: ["23W Sand", "#DDB18A"] },
  amuse: { light: ["01 Pure", "#EFD3BC"], mid: ["1.5 Natural", "#E8C6A8"], deep: ["02 Healthy", "#DDB495"] }, // undertone not in the shade name, so match by depth
};
const SUB_TAG = { Light: "light", Bright: "bright", True: "true", Mute: "mute", Deep: "deep" };
// finish: matte | satin | dewy | undefined; look: everyday | bold | undefined
export function picksFor(type, finish, look, tone) {
  const tag = SUB_TAG[type.sub], fam = type.season;
  const fit = f => !finish || finish === "satin" || f === "any" || f === finish;
  const score = ([ln, , , , tags]) => { const L = LINES[ln];
    let s = tags.includes(tag) ? 3 : tags.includes("all") ? 2 : 0;
    if (finish === "satin" && L.finish !== "any") s += L.kind === "lip" ? (L.finish === "dewy" ? 0.6 : 0.5) : 0; // satin sits between: keep both, sheer first
    if (look === "bold") s += tags.some(x => x === "deep" || x === "bright") ? 1 : 0; else if (look === "everyday") s += tags.some(x => x === "light" || x === "mute") ? 1 : 0;
    return s; };
  const pick = kind => PICKS.filter(p => p[3] === fam && LINES[p[0]].kind === kind && fit(LINES[p[0]].finish))
    .map(p => [score(p), p]).sort((a, b) => b[0] - a[0]).slice(0, 2).map(([, p]) => ({ line: LINES[p[0]], shade: p[1], hex: p[2], tags: p[4], note: p[5], match: p[4].includes(tag) }));
  const depth = /Light/.test(type.sub) ? "light" : /Deep/.test(type.sub) ? "deep" : "mid";
  const baseLines = finish === "matte" ? ["fw"] : finish === "dewy" ? ["mesh", "amuse"] : finish === "satin" ? ["mesh", "fw"] : ["fw", "mesh"];
  const base = baseLines.map(k => { const [shade, hex] = k === "amuse" ? BASE.amuse[depth] : BASE[k][tone]; return { line: LINES[k], shade, hex, note: k === "amuse" ? "Shade by depth; undertone isn't in the name, so compare on your jaw" : k === "fw" && tone === "Warm" ? "No W shade in this line, so N is the closest" : `${tone} undertone shade`, other: k === "amuse" ? null : Object.values(BASE[k]).map(x => x[0]) }; });
  return { lip: pick("lip"), blush: pick("blush"), eyes: pick("eyes"), base };
}
