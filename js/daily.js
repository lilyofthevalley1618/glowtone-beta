// Home tab daily content. Rotates by local date, works offline, no tracking.
import { TYPES } from "./palettes.js";
export const dayIndex = (d = new Date()) => Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) / 864e5);
const WEAR = [
  n => `Wear it close to your face (a top, scarf or knit) and keep the rest of the outfit in your ${n}.`,
  n => `Try it as one accent piece and let ${n} do the rest.`,
  n => `Pair it with ${n} for an easy, put-together look.`,
  n => `Keep it near your face, where it brightens the most, and ground it with ${n}.`,
];
// Without a result: gentle, widely wearable softened shades (no claim that they suit you).
const GENERAL = [["Soft teal", "#5E9A96"], ["Dusty rose", "#C9A0A8"], ["Periwinkle", "#8E9BDB"], ["Sage", "#9DB59A"], ["Warm taupe", "#9C8572"], ["Soft navy", "#4F5D75"], ["Muted coral", "#E08E7A"]];
export function colorOfDay(type) {
  const i = dayIndex();
  if (!type) { const [name, hex] = GENERAL[i % GENERAL.length]; return { name, hex, tip: "A soft, easy-to-wear shade. Find your season to get colors picked for you." }; }
  const [name, hex] = type.best[i % type.best.length], neutral = type.neutrals[i % type.neutrals.length][0].toLowerCase();
  return { name, hex, tip: WEAR[i % WEAR.length](neutral) };
}
// General, widely accepted skincare habits (not medical advice).
export const KBEAUTY_TIPS = [
  "Sunscreen is the last step of your morning routine, every day, even when it's cloudy. Reapply about every 2 hours when you're outside.",
  "Layer from thinnest to thickest: toner, then essence or serum, then moisturizer.",
  "Pat, don't rub. Press toner and essence into your skin with clean hands.",
  "Patch-test new products on your jawline or inner arm for a few days before using them all over your face.",
  "Add one new product at a time so you can tell what's actually working.",
  "Wash with lukewarm water. Hot water can leave skin dry and tight.",
  "Oily skin still needs moisture. Try a lightweight gel moisturizer.",
  "Gentle exfoliation once or twice a week is plenty. Overdoing it can irritate your skin.",
  "Double cleanse on days with heavy sunscreen or makeup: an oil cleanser first, then a gentle, low-pH cleanser.",
  "Sheet masks are a treat, not a must. Leave one on for 10–20 minutes, then pat in the leftover essence.",
  "Don't forget your neck and ears when you apply sunscreen.",
  "If a product stings, burns or makes you itchy, stop using it.",
  "Swap pillowcases often and wipe your phone screen. Both touch your face every day.",
  "Night routine can be simple: cleanse, moisturize, and a thin layer of lip balm.",
];
export const tipOfDay = () => KBEAUTY_TIPS[dayIndex() % KBEAUTY_TIPS.length];
