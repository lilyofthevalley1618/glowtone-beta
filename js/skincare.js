// Korean skincare picks for the Skin tab. Names checked on brand/retailer pages Oct 7, 2026 where marked v:1; others are well-known
// products whose exact name/price we haven't re-verified (shown as "unverified"). Prices are rough USD. No brand photos: SVG swatches only.
// cat: cleanser | toner | serum | moisturizer | sunscreen | mask | mist.  for: skin types + concerns (s=sensitive, a=acne, p=dark spots, pore)
export const SKIN_PICKS = [
  { id: "drgRed", brand: "Dr.G", name: "Red Blemish Clear Soothing Cream", cat: "moisturizer", for: ["oily", "combination", "s", "a"], why: "Light gel-cream that calms redness without clogging.", price: 25, v: 1 },
  { id: "drgSun", brand: "Dr.G", name: "Green Mild Up Sun+ SPF50+ PA++++", cat: "sunscreen", for: ["s", "normal", "combination", "dry"], why: "Gentle mineral sunscreen for reactive skin.", price: 22, v: 1 },
  { id: "bojSun", brand: "Beauty of Joseon", name: "Relief Sun: Rice + Probiotics SPF50+ PA++++", cat: "sunscreen", for: ["dry", "normal", "combination", "s"], why: "Creamy, no white cast, feels like a light moisturizer.", price: 18, v: 1 },
  { id: "rlSun", brand: "Round Lab", name: "Birch Juice Moisturizing Sun Cream SPF45 PA++++", cat: "sunscreen", for: ["dry", "normal"], why: "Hydrating finish for dry or normal skin.", price: 20, v: 1 },
  { id: "s1004", brand: "SKIN1004", name: "Hyalu-Cica Water-Fit Sun Serum SPF50+ PA++++", cat: "sunscreen", for: ["oily", "combination", "normal", "a"], why: "Watery and weightless with no white cast.", price: 19, v: 1 },
  { id: "isnSun", brand: "Isntree", name: "Hyaluronic Acid Watery Sun Gel SPF50+", cat: "sunscreen", for: ["oily", "combination"], why: "Gel texture that sinks in fast under makeup.", price: 20 },
  { id: "goodal", brand: "Goodal", name: "Green Tangerine Vita C Dark Spot Care Serum", cat: "serum", for: ["p", "normal", "combination", "oily", "dry"], why: "Vitamin C for dark spots and dull tone. Use in the morning, then SPF.", price: 22, v: 1 },
  { id: "mcPdrn", brand: "Medicube", name: "PDRN Pink Peptide Serum", cat: "serum", for: ["dry", "normal", "combination", "p"], why: "Watery PDRN serum for glow and bounce.", price: 19, v: 1 },
  { id: "anuaPdrn", brand: "Anua", name: "PDRN Hyaluronic Acid 100 Moisturizing Cream", cat: "moisturizer", for: ["dry", "normal"], why: "Plumping cream with PDRN and hyaluronic acid.", price: 25, v: 1 },
  { id: "aestura", brand: "Aestura", name: "Atobarrier 365 Cream (or Lotion)", cat: "moisturizer", for: ["dry", "s", "normal"], why: "Ceramide barrier cream for dry, tight skin.", price: 30, v: 1, fav: 1 },
  { id: "althea", brand: "Dr.Althea", name: "345 Relief Cream", cat: "moisturizer", for: ["dry", "normal", "combination", "oily", "s", "a"], why: "Light, oil-free and fragrance-free calming cream.", price: 25, v: 1, fav: 1 },
  { id: "altheaMist", brand: "Dr.Althea", name: "345 Relief Cream Mist", cat: "mist", for: ["dry", "normal", "combination", "s"], why: "Two-layer cream mist for a midday moisture top-up.", price: 19, v: 1, fav: 1 },
  { id: "madeca", brand: "Centellian24", name: "Madeca Cream", cat: "moisturizer", for: ["s", "dry", "normal", "combination"], why: "Centella cream that soothes an upset barrier.", price: 25, v: 1 },
  { id: "anuaToner", brand: "Anua", name: "Heartleaf 77% Soothing Toner", cat: "toner", for: ["oily", "combination", "normal", "s", "a"], why: "Calming, watery toner that suits most skin.", price: 22, v: 1 },
  { id: "anuaOil", brand: "Anua", name: "Heartleaf Pore Control Cleansing Oil", cat: "cleanser", for: ["oily", "combination", "normal", "pore"], why: "First cleanse at night; rinses off clean.", price: 20, v: 1 },
  { id: "rlClean", brand: "Round Lab", name: "1025 Dokdo Cleanser", cat: "cleanser", for: ["dry", "normal", "combination", "oily", "s"], why: "Mild, low-pH foam that doesn't strip.", price: 13, v: 1 },
  { id: "zeroPad", brand: "Medicube", name: "Zero Pore Pad 2.0", cat: "toner", for: ["oily", "combination", "pore", "a"], why: "AHA/BHA pads for pores. 2–3 nights a week only.", price: 25, v: 1 },
  { id: "mcMask", brand: "Medicube", name: "Collagen Night Wrapping Mask", cat: "mask", for: ["dry", "normal"], why: "Overnight peel-off mask for a glowy morning.", price: 30 },
  { id: "medihealMask", brand: "Mediheal", name: "Teatree Essential Sheet Mask", cat: "mask", for: ["oily", "combination", "a"], why: "Cooling sheet mask for breakout days.", price: 2 },
  { id: "madecaMask", brand: "Centellian24", name: "Madeca Sheet Mask", cat: "mask", for: ["s", "dry", "normal"], why: "Soothing centella sheet mask.", price: 3 }];
const CAT_COL = { cleanser: "#E9EEF2", toner: "#E7F0E6", serum: "#F6E3CF", moisturizer: "#F3ECE4", sunscreen: "#FBF0D6", mask: "#EEE7F3", mist: "#E6EEF5" };
export const swatch = cat => `<svg class="pk-sw" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="12" fill="${CAT_COL[cat] || "#F3ECE4"}"/><rect x="14" y="9" width="12" height="5" rx="2" fill="#C9B8A8"/><rect x="11" y="14" width="18" height="18" rx="5" fill="#fff" stroke="#C9B8A8" stroke-width="1.2"/></svg>`;
// score picks for a skin result
export function picksFor(r, cat) {
  const keys = [r.type, ...r.flags.map(f => ({ sensitive: "s", acne: "a", pigment: "p" })[f]).filter(Boolean)];
  const sc = p => p.for.filter(x => keys.includes(x)).length * 2 + (p.for.includes(r.type) ? 3 : 0) + (p.fav ? 1 : 0);
  return SKIN_PICKS.filter(p => (!cat || p.cat === cat) && p.for.includes(r.type) || (!cat || p.cat === cat) && keys.slice(1).some(k => p.for.includes(k))).sort((a, b) => sc(b) - sc(a));
}
