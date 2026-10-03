const KEY = "glowtone.v1";
export const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
export const save = s => localStorage.setItem(KEY, JSON.stringify(s));
// ===== Paywall hook (disabled: free beta). Later: check a Stripe-verified unlock here. =====
export const PAYWALL_ENABLED = false;
export const isUnlocked = () => !PAYWALL_ENABLED || load().unlocked === true;
// ===== Feedback link placeholder: paste a Google Form / Tally URL here =====
export const FEEDBACK_URL = "PASTE_FEEDBACK_FORM_URL_HERE";
