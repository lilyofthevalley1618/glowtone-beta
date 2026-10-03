// On-device face detection (MediaPipe BlazeFace, ~230 KB model + WASM runtime), lazy-loaded from a CDN.
// Images are processed locally; nothing is uploaded. Falls back to tap-to-mark if it can't load.
const V = "1.0.1", BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${V}`;
const MODEL = "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";
let detP = null;
function load() {
  if (!detP) detP = (async () => {
    const { FilesetResolver, FaceDetector } = await import(`${BASE}/vision_bundle.mjs`);
    const fs = await FilesetResolver.forVisionTasks(`${BASE}/wasm`);
    return FaceDetector.createFromOptions(fs, { baseOptions: { modelAssetPath: MODEL, delegate: "CPU" }, runningMode: "IMAGE", minDetectionConfidence: 0.5 });
  })().catch(e => { detP = null; throw e; });
  return detP;
}
const timeout = (p, ms) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error("timeout")), ms))]);
// Returns {cheeks:[{x,y}], hair:{x,y,w,h}, eyes:[{x,y}], chinY, r} in canvas pixels, or null.
export async function findFace(canvas) {
  try {
    const det = await timeout(load(), 20000);
    const res = det.detect(canvas);
    const d = res.detections && res.detections[0];
    if (!d) return null;
    const W = canvas.width, H = canvas.height, bb = d.boundingBox, k = d.keypoints.map(p => ({ x: p.x * W, y: p.y * H }));
    const [e1, e2, nose, mouth] = k, fw = bb.width;
    const cheek = e => ({ x: e.x + 0.25 * (e.x - nose.x), y: e.y + 0.55 * (mouth.y - e.y) });
    return { cheeks: [cheek(e1), cheek(e2)], eyes: [e1, e2], r: fw * 0.055, eyeR: fw * 0.03,
      hair: { x: bb.originX + fw * 0.2, y: Math.max(0, bb.originY - bb.height * 0.22), w: fw * 0.6, h: bb.height * 0.12 },
      chinY: Math.min(H, bb.originY + bb.height * 1.08), box: bb };
  } catch (e) { console.warn("Face detection unavailable:", e.message); return null; }
}
