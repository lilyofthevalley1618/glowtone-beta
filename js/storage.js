const KEY = "glowtone.v1";
export const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
export const save = s => localStorage.setItem(KEY, JSON.stringify(s));
// ===== Paywall hook (disabled: free beta). Later: check a Stripe-verified unlock here. =====
export const PAYWALL_ENABLED = false;
export const isUnlocked = () => !PAYWALL_ENABLED || load().unlocked === true;
// ===== Feedback link placeholder: paste a Google Form / Tally URL here =====
export const FEEDBACK_URL = "PASTE_FEEDBACK_FORM_URL_HERE";
// ===== Future optional cloud vision AI scan (OFF by default; hidden, no UI while disabled) =====
// Turning this on would UPLOAD the photo to a server. Before enabling: Lily's approval, a cost estimate,
// a clear consent screen, and a privacy-policy update. Until then Glowtone stays 100% on-device.
export const CLOUD_AI_SCAN = { enabled: false, endpoint: "", label: "AI scan (cloud)" };
export async function cloudAiScan(/* imageBlob */) {
  if (!CLOUD_AI_SCAN.enabled || !CLOUD_AI_SCAN.endpoint) throw new Error("Cloud AI scan is disabled");
  // TODO (future): POST the photo with explicit consent and return {type, conf, reasons}.
}
