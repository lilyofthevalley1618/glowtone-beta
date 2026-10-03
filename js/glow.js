// Home: routine checklist, glow streak and skin weather. All stored on the device; weather from Open-Meteo (free, no key).
import * as store from "./storage.js?v=20261003b";
import { skinResult, routine } from "./skin.js?v=20261003b";
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const ymd = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; // local date
const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return ymd(d); };
const SHORT = { "Oil cleanser": "Oil cleanse", "Water cleanser": "Cleanse", "Toner": "Toner", "Essence / serum": "Serum", "Moisturizer": "Moisturize", "Sunscreen": "SPF" };

/* ---------- checklist + streak ---------- */
export function steps() {
  const sk = store.load().skin;
  if (!sk) return { am: ["Cleanse", "Moisturize", "SPF"], pm: ["Cleanse", "Moisturize"], fromSkin: false };
  const r = routine(skinResult(sk));
  return { am: r.filter(s => s.when !== "PM").map(s => SHORT[s.n] || s.n), pm: r.filter(s => s.when !== "AM").map(s => SHORT[s.n] || s.n), fromSkin: true };
}
const today = st => (st.check && st.check.date === ymd()) ? st.check : { date: ymd(), am: [], pm: [] }; // resets daily
export function streakNow(st = store.load()) {
  const s = st.streak || { cur: 0, best: 0, last: null };
  const alive = s.last === ymd() || s.last === yesterday();
  return { cur: alive ? s.cur : 0, best: s.best || 0, doneToday: s.last === ymd() };
}
export function toggle(part, step) {
  const st = store.load(), c = today(st), list = c[part].includes(step) ? c[part].filter(x => x !== step) : [...c[part], step];
  c[part] = list; const S = steps(), full = S.am.every(x => c.am.includes(x)) && S.pm.every(x => c.pm.includes(x));
  let s = st.streak || { cur: 0, best: 0, last: null };
  if (full && s.last !== ymd()) { const cur = s.last === yesterday() ? s.cur + 1 : 1; s = { cur, best: Math.max(s.best || 0, cur), last: ymd(), prev: s }; }
  else if (!full && s.last === ymd() && s.prev) s = s.prev; // unchecked again today: undo today's count
  store.save({ ...st, check: c, streak: s });
}
export function routineCard() {
  if (!store.load().skin) return `<button class="card rt-cta" data-act="rtStart"><p class="h-label">Your routine</p><p class="rt-cta-t">Take the Skin quiz to get your routine →</p><p class="h-text">12 quick questions. Then you'll get a daily morning and night checklist and a glow streak.</p></button>`;
  const S = steps(), c = today(store.load()), k = streakNow();
  const row = (part, label) => `<div class="rt-part"><p class="rt-when">${label}</p><div class="rt-steps">${S[part].map(x => { const on = c[part].includes(x);
    return `<button class="rt-step${on ? " on" : ""}" data-act="rtTog" data-p="${part}" data-s="${esc(x)}" aria-pressed="${on}"><span class="rt-box">${on ? "✓" : ""}</span>${esc(x)}</button>`; }).join("")}</div></div>`;
  const msg = k.doneToday ? "All done today. Nice and gentle." : k.cur ? "Finish today's steps to keep it going." : "Check off today's steps to start a streak.";
  return `<div class="card rt"><div class="rt-head"><p class="h-label">Today's routine</p></div>
  ${row("am", "Morning")}${row("pm", "Night")}
  <div class="streak"><div><b>${k.cur}</b><span>day glow streak</span></div><div><b>${k.best}</b><span>best</span></div></div><p class="h-fine">${msg}</p></div>`;
}

/* ---------- skin weather ---------- */
const HOUR = 36e5;
export function weatherTip(w) {
  if (!w) return "";
  const t = w.t, rh = w.rh, uv = w.uv, wind = w.wind;
  if (uv >= 6) return "UV is high today. Reapply SPF every 2 hours outdoors.";
  if (rh < 35) return "The air is dry today. Add a hydrating toner and pat in an extra layer.";
  if (t >= 27 && rh >= 60) return "Hot and humid. A lighter gel moisturizer will feel more comfortable.";
  if (t <= 7 && wind >= 20) return "Cold and windy. A richer barrier cream helps protect your skin.";
  if (t <= 7) return "Chilly today. A slightly richer moisturizer helps your skin stay comfortable.";
  if (uv >= 3) return "Moderate UV. Your morning SPF has you covered. Reapply if you're outside a lot.";
  return "Mild conditions. Your usual routine is perfect today.";
}
export function weatherCard() {
  const st = store.load(), W = st.weather || {}, loc = st.wloc, unitF = (st.wunit || "F") === "F";
  const temp = c => unitF ? `${Math.round(c * 9 / 5 + 32)}°F` : `${Math.round(c)}°C`;
  const setup = `<div class="wx-set"><button class="btn ghost sm" data-act="wxGeo">Use my location</button><div class="row-l"><input id="wxCity" placeholder="Or type a city" autocomplete="address-level2" value=""><button class="btn sm" data-act="wxCity">Set</button></div>${W.err ? `<p class="h-fine">${esc(W.err)}</p>` : ""}</div>`;
  if (!loc) return `<div class="card wx"><p class="h-label">Skin weather</p><p class="h-text">See today's humidity and UV with a skin tip to match. Your location stays on this phone.</p>${setup}</div>`;
  const d = W.data && W.key === loc.key ? W.data : null;
  return `<div class="card wx"><div class="rt-head"><div><p class="h-label">Skin weather</p><p class="wx-loc">${esc(loc.name)}</p></div><button class="link wx-unit" data-act="wxUnit" aria-label="Switch units">Show °${unitF ? "C" : "F"}</button></div>
  ${d ? `<div class="wx-stats"><div><b>${temp(d.t)}</b><span>Temp</span></div><div><b>${Math.round(d.rh)}%</b><span>Humidity</span></div><div><b>${Math.round(d.uv)}</b><span>UV index</span></div></div><p class="h-body">${esc(weatherTip(d))}</p>` : `<p class="h-fine">${W.err && W.key === loc.key ? "Weather isn't available right now." : "Loading weather…"}</p>`}
  ${S_edit ? setup : `<button class="link wx-change" data-act="wxEdit">Change location</button>`}</div>`;
}
let S_edit = false;
export const wxEdit = () => { S_edit = !S_edit; };
async function fetchWeather(loc) {
  const u = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,relative_humidity_2m,uv_index,wind_speed_10m&timezone=auto`;
  const r = await fetch(u); if (!r.ok) throw new Error("weather " + r.status);
  const c = (await r.json()).current; return { t: c.temperature_2m, rh: c.relative_humidity_2m, uv: c.uv_index ?? 0, wind: c.wind_speed_10m ?? 0 };
}
let inflight = false;
export async function refreshWeather(rerender, force = false) {
  const st = store.load(), loc = st.wloc; if (!loc || inflight) return;
  const W = st.weather || {};
  if (!force && W.key === loc.key && W.at && Date.now() - W.at < HOUR && (W.data || Date.now() - W.at < 6e5)) return; // ~1h cache; retry errors after 10 min
  inflight = true;
  try { const data = await fetchWeather(loc); store.save({ ...store.load(), weather: { key: loc.key, at: Date.now(), data } }); }
  catch { store.save({ ...store.load(), weather: { ...(W.key === loc.key ? W : {}), key: loc.key, at: Date.now(), err: "offline" } }); } // fail quietly, keep old data
  inflight = false; rerender();
}
export async function setCity(name, rerender) {
  name = (name || "").trim(); if (!name) return;
  try {
    const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`);
    const g = (await r.json()).results?.[0];
    if (!g) { store.save({ ...store.load(), weather: { err: `Couldn't find "${name}". Try adding the state or country.` } }); return rerender(); }
    const loc = { name: [g.name, g.admin1 || g.country].filter(Boolean).join(", "), lat: +g.latitude.toFixed(3), lon: +g.longitude.toFixed(3) }; loc.key = `${loc.lat},${loc.lon}`;
    store.save({ ...store.load(), wloc: loc, weather: {} }); S_edit = false; rerender(); refreshWeather(rerender, true);
  } catch { store.save({ ...store.load(), weather: { err: "You seem to be offline. Try again later." } }); rerender(); }
}
export function useGeo(rerender) { // only called from a tap
  if (!navigator.geolocation) { store.save({ ...store.load(), weather: { err: "Location isn't available on this device. Type a city instead." } }); return rerender(); }
  navigator.geolocation.getCurrentPosition(p => {
    const loc = { name: "Your location", lat: +p.coords.latitude.toFixed(2), lon: +p.coords.longitude.toFixed(2) }; loc.key = `${loc.lat},${loc.lon}`; // rounded: no need for precise coordinates
    store.save({ ...store.load(), wloc: loc, weather: {} }); S_edit = false; rerender(); refreshWeather(rerender, true);
  }, () => { store.save({ ...store.load(), weather: { err: "No problem. You can type a city instead." } }); rerender(); }, { timeout: 10000, maximumAge: HOUR });
}
