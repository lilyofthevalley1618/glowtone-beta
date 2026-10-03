const KEY = "glowtone.v1";
export const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
export const save = s => localStorage.setItem(KEY, JSON.stringify(s));
// ===== Paywall hook (disabled: free beta). Later: check a Stripe-verified unlock here. =====
// Premium later: Style + Makeup, $4.99 one-time, first 100 sign-ups 50% off. OFF during the beta (everything unlocked).
export const PAYWALL_ENABLED = false;
export const PREMIUM = { price: "$4.99", note: "one-time", launchOffer: "First 100 sign-ups get 50% off", tabs: ["style", "makeup"] };
// globalThis.__GT_PREVIEW_PAYWALL lets a local test preview the lock screen; it is never set by the app.
export const paywallOn = () => PAYWALL_ENABLED || globalThis.__GT_PREVIEW_PAYWALL === true;
export const isUnlocked = () => !paywallOn() || load().unlocked === true;
export const isLocked = tab => PREMIUM.tabs.includes(tab) && !isUnlocked();
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
