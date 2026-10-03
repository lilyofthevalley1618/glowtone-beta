// Feedback pop-up: 5 stars + comment, posted in the background (no-cors) to a Google Form. No redirect, no form UI.
import * as store from "./storage.js?v=20261003b";
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
export function openFeedback(season) {
  if (document.getElementById("fbModal")) return;
  let rating = 0; const prev = document.activeElement;
  const wrap = document.createElement("div"); wrap.id = "fbModal"; wrap.className = "modal";
  wrap.innerHTML = `<div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="fbT"><button class="modal-x" aria-label="Close">×</button><div class="fb-body">
    <p class="h-label">Feedback</p><h2 id="fbT">How's Glowtone so far?</h2>
    <div class="stars" role="radiogroup" aria-label="Rating">${[1, 2, 3, 4, 5].map(n => `<button role="radio" aria-checked="false" aria-label="${n} star${n > 1 ? "s" : ""}" data-n="${n}">★</button>`).join("")}</div>
    <textarea id="fbC" rows="4" maxlength="1500" placeholder="What would make Glowtone better?"></textarea>
    <button class="btn" id="fbSend" disabled>Send</button><p class="h-fine fb-err" hidden></p></div></div>`;
  document.body.appendChild(wrap);
  const close = () => { wrap.remove(); document.removeEventListener("keydown", onKey); prev?.focus?.(); };
  const onKey = e => { if (e.key === "Escape") close(); };
  document.addEventListener("keydown", onKey);
  wrap.addEventListener("click", e => { if (e.target === wrap || e.target.closest(".modal-x")) close(); });
  const stars = [...wrap.querySelectorAll(".stars button")], send = wrap.querySelector("#fbSend"), ta = wrap.querySelector("#fbC");
  const paint = () => stars.forEach(b => { const on = +b.dataset.n <= rating; b.classList.toggle("on", on); b.setAttribute("aria-checked", String(+b.dataset.n === rating)); });
  stars.forEach(b => b.onclick = () => { rating = +b.dataset.n; paint(); send.disabled = false; });
  ta.oninput = () => { send.disabled = !rating && !ta.value.trim(); };
  send.onclick = async () => {
    const comment = ta.value.trim(), entry = { rating, comment, date: new Date().toISOString() };
    let msg = "Thank you! Your feedback helps make Glowtone better.";
    if (store.feedbackReady()) {
      const body = new URLSearchParams({ [store.FEEDBACK_RATING_ENTRY]: String(rating || ""), [store.FEEDBACK_COMMENT_ENTRY]: comment });
      if (store.FEEDBACK_VERSION_ENTRY) body.append(store.FEEDBACK_VERSION_ENTRY, store.APP_VERSION);
      if (store.FEEDBACK_SEASON_ENTRY && season) body.append(store.FEEDBACK_SEASON_ENTRY, season);
      send.disabled = true; send.textContent = "Sending…";
      try { await fetch(store.FEEDBACK_FORM_ACTION, { method: "POST", mode: "no-cors", body }); } // opaque response: success can't be read, so we trust it
      catch { const st = store.load(); store.save({ ...st, feedback: [...(st.feedback || []), entry] }); msg = "You seem to be offline. We saved your feedback on this phone. Thank you!"; }
    } else { const st = store.load(); store.save({ ...st, feedback: [...(st.feedback || []), entry] }); msg = "Feedback is coming soon, thanks!"; }
    wrap.querySelector(".fb-body").innerHTML = `<div class="fb-thanks"><div class="fb-heart">♡</div><h2>${esc(msg)}</h2><button class="btn ghost" id="fbDone">Close</button></div>`;
    wrap.querySelector("#fbDone").onclick = close; wrap.querySelector("#fbDone").focus();
  };
  stars[0].focus();
}
