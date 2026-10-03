// Onboarding quiz. Each option nudges axes: t (+warm/-cool), v (+light/-deep), c (+clear/-mute).
export const QUESTIONS = [
 { id:"skin", q:"In natural daylight, your bare skin looks more…", hint:"Check your jawline next to a window, no makeup.", opts:[
   ["Peachy, golden or yellow-beige", {t:1}], ["Pink, rosy or slightly bluish", {t:-1}], ["Olive or greenish-beige", {t:0.3, c:-0.4}], ["Honestly not sure", {}]]},
 { id:"veins", q:"Veins on your inner wrist look…", hint:"Look in daylight, not under warm lamps.", opts:[
   ["Green or olive", {t:1}], ["Blue or purple", {t:-1}], ["A mix / hard to tell", {}]]},
 { id:"sun", q:"After time in the sun, your skin usually…", opts:[
   ["Tans easily, rarely burns", {t:0.5, v:-0.3}], ["Tans deeply, almost never burns", {t:0.2, v:-0.7}], ["Burns first, then tans a little", {t:-0.3, v:0.3}], ["Burns or turns pink, rarely tans", {t:-0.6, v:0.5}]]},
 { id:"metal", q:"Which jewelry makes your skin look better?", opts:[
   ["Gold", {t:1}], ["Silver", {t:-1}], ["Rose gold", {t:0.2, v:0.3}], ["Both look about the same", {}]]},
 { id:"white", q:"Which white looks better near your face?", opts:[
   ["Ivory / cream", {t:0.7, c:-0.2}], ["Pure bright white", {t:-0.6, c:0.5}], ["Can't tell", {}]]},
 { id:"hair", q:"Your natural hair color (no dye)?", opts:[
   ["Jet / blue-black", {v:-1, c:0.5, t:-0.2}], ["Dark brown / soft black", {v:-0.6}], ["Medium or soft brown", {v:0, c:-0.4}], ["Golden, honey or strawberry", {t:0.7, v:0.5}], ["Ash brown or ash blonde", {t:-0.5, v:0.4, c:-0.4}], ["Auburn / red / copper", {t:0.8, v:-0.2, c:0.2}]]},
 { id:"eyes", q:"Your eye color?", opts:[
   ["Very dark brown/black, sharp whites", {v:-0.7, c:0.6}], ["Dark brown", {v:-0.4}], ["Soft medium or light brown", {t:0.3, c:-0.4}], ["Amber or golden brown", {t:0.7, c:0.1}], ["Gray or blue", {t:-0.5, v:0.4}], ["Green or hazel", {t:0.4, c:-0.2}]]},
 { id:"contrast", q:"Contrast between your hair/eyes and skin?", hint:"Think of a black-and-white photo of you.", opts:[
   ["High: hair/eyes much darker than skin", {c:0.7, v:-0.2}], ["Medium", {}], ["Low: everything blends softly", {c:-0.7, v:0.2}]]},
 { id:"compliments", q:"What colors get you the most compliments?", opts:[
   ["Warm pastels: peach, butter, mint", {t:0.6, v:0.7, c:0.1}], ["Warm brights: coral, orange, turquoise", {t:0.7, c:0.7}], ["Earthy: camel, olive, terracotta", {t:0.7, c:-0.6, v:-0.3}], ["Cool pastels: baby pink, lavender, sky", {t:-0.6, v:0.7}], ["Dusty: mauve, gray-blue, rose brown", {t:-0.5, c:-0.7}], ["Jewel tones, black & white", {t:-0.6, c:0.7, v:-0.4}]]},
];
export function scoreQuiz(answers) { // answers: {id: optionIndex}
  const sum = { t: 0, v: 0, c: 0 }, max = { t: 0, v: 0, c: 0 };
  for (const q of QUESTIONS) {
    for (const k of ["t", "v", "c"]) max[k] += Math.max(...q.opts.map(o => Math.abs(o[1][k] || 0)));
    const i = answers[q.id]; if (i == null) continue;
    const d = q.opts[i][1]; for (const k in d) sum[k] += d[k];
  }
  const out = {}; for (const k of ["t", "v", "c"]) out[k] = Math.max(-1, Math.min(1, max[k] ? 2.2 * sum[k] / max[k] : 0));
  return out;
}
