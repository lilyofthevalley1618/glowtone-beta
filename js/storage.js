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
// ===== Feedback (Home → Feedback pop-up). Posts in the background to a Google Form; users never see the form. =====
// Setup: make a Google Form with a 1–5 question and a paragraph question, open "Get pre-filled link", and copy the entry IDs.
// FEEDBACK_FORM_ACTION looks like https://docs.google.com/forms/d/e/<FORM_ID>/formResponse
export const FEEDBACK_FORM_ACTION = "PASTE_FORM_ACTION_URL_HERE";
export const FEEDBACK_RATING_ENTRY = "entry.PASTE_RATING_ID";
export const FEEDBACK_COMMENT_ENTRY = "entry.PASTE_COMMENT_ID";
// Optional extra fields: sent only when filled in (leave "" to skip).
export const FEEDBACK_VERSION_ENTRY = "";   // e.g. "entry.123456789" → sends the app version
export const FEEDBACK_SEASON_ENTRY = "";    // e.g. "entry.987654321" → sends the saved season type
export const APP_VERSION = "20261003b";
export const feedbackReady = () => ![FEEDBACK_FORM_ACTION, FEEDBACK_RATING_ENTRY, FEEDBACK_COMMENT_ENTRY].some(x => x.includes("PASTE"));
// ===== Future optional cloud vision AI scan (OFF by default; hidden, no UI while disabled) =====
// Turning this on would UPLOAD the photo to a server. Before enabling: Lily's approval, a cost estimate,
// a clear consent screen, and a privacy-policy update. Until then Glowtone stays 100% on-device.
export const CLOUD_AI_SCAN = { enabled: false, endpoint: "", label: "AI scan (cloud)" };
export async function cloudAiScan(/* imageBlob */) {
  if (!CLOUD_AI_SCAN.enabled || !CLOUD_AI_SCAN.endpoint) throw new Error("Cloud AI scan is disabled");
  // TODO (future): POST the photo with explicit consent and return {type, conf, reasons}.
}
