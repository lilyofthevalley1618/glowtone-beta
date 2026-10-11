// Personalized style picks: generic item types (no specific products) matched to quiz answers + color season.
// Links are store SEARCH pages with the item keywords (URL formats from each site's search box; not individually verified).
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
export const SHOPS = {
  zara: ["Zara", "https://www.zara.com/us/en/search?searchTerm=", "mid"], hm: ["H&M", "https://www2.hm.com/en_us/search-results.html?q=", "low"],
  uniqlo: ["Uniqlo", "https://www.uniqlo.com/us/en/search?q=", "mid"], aritzia: ["Aritzia", "https://www.aritzia.com/us/en/search?q=", "high"],
  brandy: ["Brandy Melville", "https://us.brandymelville.com/search?q=", "low"], polly: ["Princess Polly", "https://us.princesspolly.com/search?q=", "mid"],
  shein: ["Shein", "https://us.shein.com/pdsearch/", "low"], uo: ["Urban Outfitters", "https://www.urbanoutfitters.com/search?q=", "mid"],
  garage: ["Garage", "https://www.garageclothing.com/us/search?q=", "low"], lulu: ["Lululemon", "https://shop.lululemon.com/search?Ntt=", "high"],
  af: ["Abercrombie", "https://www.abercrombie.com/shop/us/search?searchTerm=", "mid"], musinsa: ["Musinsa / Korean brands", "https://global.musinsa.com/us/search?keyword=", "mid"],
  thrift: ["Thrift / Depop", "https://www.depop.com/search/?q=", "thrift"], other: ["Any shop you like", "", "mid"] };
const PRICE = { low: ["$12–30", "$20–45"], mid: ["$30–60", "$50–110"], high: ["$60–110", "$90–200"], thrift: ["$5–20", "$10–35"] };
// [item, kind(top|bottom|outer|dress|acc), wear tag, vibes, occasions, trend 0 comfy..2 trendy, fits, big-ticket]
const ITEMS = [
  ["ribbed fitted tee", "top", "basics", ["minimal", "classic"], ["school", "work", "casual"], 0, ["fitted", "mix"]],
  ["oversized graphic tee", "top", "basics", ["street", "bold"], ["school", "casual"], 1, ["oversized", "relaxed"]],
  ["cropped baby tee", "top", "basics", ["soft", "street", "bold"], ["casual", "out"], 2, ["fitted"]],
  ["soft cable-knit cardigan", "top", "knit", ["soft", "classic"], ["school", "work", "casual"], 0, ["relaxed", "mix"]],
  ["fine-knit polo sweater", "top", "knit", ["classic", "minimal"], ["work", "school"], 1, ["fitted", "mix"]],
  ["chunky crewneck sweater", "top", "knit", ["soft", "minimal"], ["casual", "school"], 0, ["oversized", "relaxed"]],
  ["satin cowl-neck top", "top", "basics", ["bold", "minimal"], ["out", "events"], 2, ["fitted", "relaxed"]],
  ["oxford button-down shirt", "top", "tailoring", ["classic", "minimal"], ["work", "school"], 0, ["relaxed", "mix"]],
  ["zip-up hoodie", "top", "basics", ["street", "soft"], ["gym", "casual", "school"], 0, ["oversized", "relaxed"]],
  ["seamless sports bra + tank set", "top", "basics", ["street"], ["gym"], 1, ["fitted"]],
  ["wide-leg trousers", "bottom", "pants", ["minimal", "classic"], ["work", "school", "events"], 1, ["relaxed", "mix"]],
  ["straight-leg jeans", "bottom", "pants", ["minimal", "classic", "street"], ["school", "casual"], 0, ["fitted", "mix", "relaxed"]],
  ["baggy cargo pants", "bottom", "pants", ["street", "bold"], ["casual", "school"], 2, ["oversized", "relaxed"]],
  ["high-rise flare leggings", "bottom", "pants", ["street", "soft"], ["gym", "casual"], 1, ["fitted"]],
  ["satin midi slip skirt", "bottom", "skirts", ["minimal", "soft", "bold"], ["out", "events", "work"], 2, ["fitted", "relaxed"]],
  ["pleated mini skirt", "bottom", "skirts", ["classic", "bold"], ["school", "out"], 2, ["fitted", "mix"]],
  ["denim shorts", "bottom", "shorts", ["street", "soft"], ["casual"], 1, ["relaxed", "mix"]],
  ["wrap midi dress", "dress", "skirts", ["soft", "classic"], ["events", "work", "out"], 1, ["fitted", "mix"]],
  ["knit maxi dress", "dress", "skirts", ["minimal", "soft"], ["casual", "events"], 1, ["fitted"]],
  ["relaxed single-breasted blazer", "outer", "tailoring", ["minimal", "classic"], ["work", "events", "school"], 1, ["relaxed", "mix", "oversized"], 1],
  ["cropped bomber jacket", "outer", "basics", ["street", "bold"], ["casual", "out"], 2, ["oversized", "relaxed"], 1],
  ["long wool-blend coat", "outer", "tailoring", ["minimal", "classic"], ["work", "events"], 0, ["relaxed", "mix"], 1],
  ["leather-look moto jacket", "outer", "basics", ["bold"], ["out", "casual"], 2, ["fitted"], 1],
  ["shoulder bag", "acc", "", ["minimal", "classic", "soft", "bold"], ["work", "out", "school"], 1, []],
  ["claw clip + hair scarf set", "acc", "", ["soft", "street"], ["school", "casual"], 1, []]];
const PATTERN = { stripes: "striped", florals: "floral", plaid: "plaid", graphic: "graphic", animal: "leopard" };
export function stylePicks(ans, type) {
  const shops = (ans.brands || []).filter(b => SHOPS[b]); if (!shops.length) shops.push(ans.budget === "low" ? "hm" : ans.budget === "high" ? "aritzia" : "uniqlo");
  const vibe = ans.vibe || "minimal", fit = ans.fit || "mix", occ = ans.occasion || [], wear = ans.wear || [], fav = ans.favs || [], trend = { comfy: 0, balance: 1, trendy: 2 }[ans.trend] ?? 1;
  const sc = it => (it[3].includes(vibe) ? 4 : 0) + (it[6].includes(fit) ? 2 : 0) + it[4].filter(o => occ.includes(o)).length * 2 + (wear.includes(it[2]) ? 2 : 0)
    + (fav.includes(it[1]) || fav.includes(it[2]) ? 3 : 0) - Math.abs(it[5] - trend) * 1.5 + (shops.includes("lulu") && it[4].includes("gym") ? 3 : 0);
  const ranked = ITEMS.map(it => [it, sc(it)]).sort((a, b) => b[1] - a[1]), out = [], kinds = {};
  for (const [it] of ranked) { if ((kinds[it[1]] || 0) >= (it[1] === "top" ? 2 : 1) || out.length >= 6) continue; kinds[it[1]] = (kinds[it[1]] || 0) + 1; out.push(it); }
  const love = ans.colors || [], pat = (ans.patterns || []).find(p => PATTERN[p]), best = type.best, neu = type.neutrals;
  const metal = { gold: "gold", silver: "silver", rose: "rose-gold", mix: (type.metals?.[0] || "gold").toLowerCase() }[ans.metal] || (type.metals?.[0] || "gold").toLowerCase();
  const picks = out.map((it, i) => {
    const nearFace = it[1] === "top" || it[1] === "dress", col = nearFace || love.includes("brights") ? best[i % best.length] : neu[i % neu.length];
    const fitShops = shops.filter(x => x !== "lulu" || it[4].includes("gym")), shop = (fitShops.length ? fitShops : ["other"])[i % (fitShops.length || 1)], [sn, url, tier] = SHOPS[shop], name = `${col[0].toLowerCase()} ${i === 1 && pat && !it[0].includes(PATTERN[pat]) && it[1] !== "acc" ? PATTERN[pat] + " " : ""}${it[0]}`;
    const why = [nearFace ? `${col[0]} is one of your best ${type.season} colors near the face` : `${col[0]} is an easy ${type.season} neutral`, it[3].includes(vibe) ? `fits your ${vibe} vibe` : "", it[6].includes(fit) ? `${fit} fit` : ""].filter(Boolean).join(", ") + ".";
    return { name, hex: col[1], shop: sn, price: PRICE[tier][it[7] ? 1 : 0], why, url: url ? url + encodeURIComponent(`${col[0]} ${it[0]}`) : "" };
  });
  picks.push({ name: `${metal} small hoops + layered chain`, hex: metal.startsWith("silver") ? "#C9CCD1" : metal.startsWith("rose") ? "#E2B7A8" : "#D4B26A", shop: SHOPS[shops[0]][0], price: PRICE[SHOPS[shops[0]][2]][0], why: `Your metal: ${metal} flatters your ${type.tone.toLowerCase()} undertone.`, url: SHOPS[shops[0]][1] ? SHOPS[shops[0]][1] + encodeURIComponent(`${metal} hoop earrings`) : "" });
  return picks;
}
const sw = h => `<svg class="pk-sw" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="12" fill="#F7F2EC"/><path d="M14 9l-6 5 3 5 3-2v15h12V17l3 2 3-5-6-5c-1 2-3 3-6 3s-5-1-6-3z" fill="${h}" stroke="#00000018"/></svg>`;
export const picksHTML = ps => ps.map(p => `<div class="pk-card">${sw(p.hex)}<div><p class="pk-name">${esc(p.name[0].toUpperCase() + p.name.slice(1))}</p><p class="pk-meta">${esc(p.shop)} · ~${p.price}</p><p class="pk-why">${esc(p.why)}</p>${p.url ? `<a class="link sm" href="${esc(p.url)}" target="_blank" rel="noopener">Search at ${esc(p.shop)} →</a>` : ""}</div></div>`).join("");
