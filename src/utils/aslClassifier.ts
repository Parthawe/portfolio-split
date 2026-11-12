/* ═══════════════════════════════════════════════════════════
   ASL Fingerspelling Classifier — from MediaPipe landmarks

   Classifies 21 hand landmarks into ASL alphabet letters.
   Uses geometric features: finger curl, spread, thumb
   position, relative angles.

   Covers most static ASL letters (A–Y, excluding J and Z
   which require motion). Returns best-match letter +
   confidence score.
   ═══════════════════════════════════════════════════════════ */

// MediaPipe landmark indices
const WRIST = 0
// MediaPipe hand landmark indices (unused indices kept as comments for reference)
// THUMB: CMC=1, MCP=2, IP=3, TIP=4
const THUMB_IP = 3, THUMB_TIP = 4
const INDEX_MCP = 5, INDEX_PIP = 6, INDEX_DIP = 7, INDEX_TIP = 8
const MIDDLE_MCP = 9, MIDDLE_PIP = 10, MIDDLE_TIP = 12
const RING_MCP = 13, RING_PIP = 14, RING_TIP = 16
const PINKY_MCP = 17, PINKY_PIP = 18, PINKY_TIP = 20

type Lm = { x: number; y: number; z: number }

function dist3(a: Lm, b: Lm): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2)
}

function dist2(a: Lm, b: Lm): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

// Is finger extended? Tip farther from wrist than PIP joint
function isExtended(lm: Lm[], tip: number, pip: number): boolean {
  return dist3(lm[tip], lm[WRIST]) > dist3(lm[pip], lm[WRIST]) * 1.05
}

// Is finger curled? Tip closer to wrist than MCP
function isCurled(lm: Lm[], tip: number, mcp: number): boolean {
  return dist3(lm[tip], lm[WRIST]) < dist3(lm[mcp], lm[WRIST]) * 0.9
}

// Is thumb extended outward (away from palm)?
function isThumbOut(lm: Lm[]): boolean {
  const thumbDist = dist3(lm[THUMB_TIP], lm[INDEX_MCP])
  const palmWidth = dist3(lm[INDEX_MCP], lm[PINKY_MCP])
  return thumbDist > palmWidth * 0.8
}

// Are two tips touching (within threshold)?
function tipsTouching(lm: Lm[], a: number, b: number, thresh = 0.06): boolean {
  return dist3(lm[a], lm[b]) < thresh
}

// Finger spread: angle between adjacent extended fingers
function fingerSpread(lm: Lm[], tip1: number, mcp1: number, tip2: number, mcp2: number): number {
  const v1x = lm[tip1].x - lm[mcp1].x, v1y = lm[tip1].y - lm[mcp1].y
  const v2x = lm[tip2].x - lm[mcp2].x, v2y = lm[tip2].y - lm[mcp2].y
  const dot = v1x * v2x + v1y * v2y
  const mag1 = Math.sqrt(v1x * v1x + v1y * v1y)
  const mag2 = Math.sqrt(v2x * v2x + v2y * v2y)
  return Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2 + 1e-8))))
}

export interface ASLResult {
  letter: string
  confidence: number
}

export function classifyASL(landmarks: Lm[]): ASLResult {
  const lm = landmarks

  // Feature extraction
  const indexExt = isExtended(lm, INDEX_TIP, INDEX_PIP)
  const middleExt = isExtended(lm, MIDDLE_TIP, MIDDLE_PIP)
  const ringExt = isExtended(lm, RING_TIP, RING_PIP)
  const pinkyExt = isExtended(lm, PINKY_TIP, PINKY_PIP)

  const indexCurl = isCurled(lm, INDEX_TIP, INDEX_MCP)
  const middleCurl = isCurled(lm, MIDDLE_TIP, MIDDLE_MCP)
  const ringCurl = isCurled(lm, RING_TIP, RING_MCP)
  const pinkyCurl = isCurled(lm, PINKY_TIP, PINKY_MCP)

  const thumbOut = isThumbOut(lm)
  const thumbExt = isExtended(lm, THUMB_TIP, THUMB_IP)

  const extCount = [indexExt, middleExt, ringExt, pinkyExt].filter(Boolean).length
  const curlCount = [indexCurl, middleCurl, ringCurl, pinkyCurl].filter(Boolean).length

  const indexMiddleSpread = fingerSpread(lm, INDEX_TIP, INDEX_MCP, MIDDLE_TIP, MIDDLE_MCP)
  const middleRingSpread = fingerSpread(lm, MIDDLE_TIP, MIDDLE_MCP, RING_TIP, RING_MCP)

  const thumbIndexDist = dist3(lm[THUMB_TIP], lm[INDEX_TIP])
  const palmSize = dist3(lm[INDEX_MCP], lm[PINKY_MCP])

  // Normalized distances
  const thumbIndexNorm = thumbIndexDist / (palmSize + 1e-6)
  const indexTipY = lm[INDEX_TIP].y
  const wristY = lm[WRIST].y

  // ── Rule-based classification ──
  // Each rule returns [letter, confidence]

  const candidates: [string, number][] = []

  // A — fist with thumb to the side
  if (curlCount >= 3 && !thumbOut && thumbExt) {
    candidates.push(['A', 0.7 + (curlCount === 4 ? 0.15 : 0)])
  }

  // B — four fingers extended, thumb curled across palm
  if (extCount >= 3 && !thumbOut && indexExt && middleExt && ringExt) {
    const spread = indexMiddleSpread + middleRingSpread
    if (spread < 0.5) { // fingers together
      candidates.push(['B', 0.65 + (extCount === 4 ? 0.15 : 0)])
    }
  }

  // C — curved hand (fingers together, partially extended, thumb out)
  if (extCount >= 2 && extCount <= 3 && thumbOut) {
    const curveCheck = !indexCurl && !middleCurl && thumbIndexNorm > 0.8
    if (curveCheck) candidates.push(['C', 0.6])
  }

  // D — index extended, others curled, thumb touches middle
  if (indexExt && middleCurl && ringCurl && pinkyCurl) {
    if (tipsTouching(lm, THUMB_TIP, MIDDLE_TIP, 0.08)) {
      candidates.push(['D', 0.8])
    }
  }

  // E — all fingers curled, thumb across
  if (curlCount >= 3 && !thumbOut) {
    if (!thumbExt) candidates.push(['E', 0.55 + (curlCount === 4 ? 0.1 : 0)])
  }

  // F — OK sign: thumb + index touching, others extended
  if (tipsTouching(lm, THUMB_TIP, INDEX_TIP, 0.07) && middleExt && ringExt && pinkyExt) {
    candidates.push(['F', 0.85])
  }

  // G — index pointing sideways (horizontal), thumb out
  if (indexExt && middleCurl && ringCurl && pinkyCurl) {
    // Check if hand is rotated (index pointing horizontally)
    const indexDir = Math.abs(lm[INDEX_TIP].x - lm[INDEX_MCP].x)
    const indexVert = Math.abs(lm[INDEX_TIP].y - lm[INDEX_MCP].y)
    if (indexDir > indexVert) candidates.push(['G', 0.65])
  }

  // H — index + middle extended sideways
  if (indexExt && middleExt && ringCurl && pinkyCurl) {
    const indexDir = Math.abs(lm[INDEX_TIP].x - lm[INDEX_MCP].x)
    const indexVert = Math.abs(lm[INDEX_TIP].y - lm[INDEX_MCP].y)
    if (indexDir > indexVert) candidates.push(['H', 0.65])
  }

  // I — pinky extended, others curled
  if (pinkyExt && indexCurl && middleCurl && ringCurl) {
    candidates.push(['I', 0.8])
  }

  // K — index + middle extended with spread, thumb between
  if (indexExt && middleExt && ringCurl && pinkyCurl && indexMiddleSpread > 0.3) {
    candidates.push(['K', 0.65])
  }

  // L — L shape: index + thumb extended, others curled
  if (indexExt && middleCurl && ringCurl && pinkyCurl && thumbOut) {
    candidates.push(['L', 0.85])
  }

  // M — fist with thumb under three fingers
  if (curlCount >= 3 && !thumbOut && !thumbExt) {
    // thumb tip below index MCP
    if (lm[THUMB_TIP].y > lm[INDEX_MCP].y) {
      candidates.push(['M', 0.45])
    }
  }

  // N — fist with thumb between index and middle
  if (curlCount >= 3 && !thumbOut && !thumbExt) {
    if (tipsTouching(lm, THUMB_TIP, MIDDLE_PIP, 0.1)) {
      candidates.push(['N', 0.45])
    }
  }

  // O — fingertips touch thumb (circle shape)
  if (tipsTouching(lm, THUMB_TIP, INDEX_TIP, 0.07) && !middleExt && !ringExt) {
    candidates.push(['O', 0.7])
  }

  // P — like K but pointing down (wrist above fingers)
  if (indexExt && middleExt && ringCurl && pinkyCurl) {
    if (wristY < indexTipY) { // wrist above = fingers pointing down
      candidates.push(['P', 0.6])
    }
  }

  // Q — like G but pointing down
  if (indexExt && middleCurl && ringCurl && pinkyCurl && thumbOut) {
    if (wristY < indexTipY) candidates.push(['Q', 0.55])
  }

  // R — index + middle crossed
  if (indexExt && middleExt && ringCurl && pinkyCurl) {
    const crossDist = dist2(lm[INDEX_TIP], lm[MIDDLE_TIP])
    if (crossDist < 0.03) candidates.push(['R', 0.7])
  }

  // S — fist with thumb over fingers
  if (curlCount >= 3 && !thumbOut && lm[THUMB_TIP].y < lm[INDEX_PIP].y) {
    candidates.push(['S', 0.55])
  }

  // T — fist with thumb between index and middle (tip visible)
  if (curlCount >= 3 && tipsTouching(lm, THUMB_TIP, INDEX_PIP, 0.08)) {
    candidates.push(['T', 0.5])
  }

  // U — index + middle extended together (no spread)
  if (indexExt && middleExt && ringCurl && pinkyCurl && indexMiddleSpread < 0.2) {
    // Check vertical orientation
    const indexVert = Math.abs(lm[INDEX_TIP].y - lm[INDEX_MCP].y)
    const indexDir = Math.abs(lm[INDEX_TIP].x - lm[INDEX_MCP].x)
    if (indexVert > indexDir) candidates.push(['U', 0.7])
  }

  // V — peace sign: index + middle spread
  if (indexExt && middleExt && ringCurl && pinkyCurl && indexMiddleSpread > 0.2) {
    const indexVert = Math.abs(lm[INDEX_TIP].y - lm[INDEX_MCP].y)
    const indexDir = Math.abs(lm[INDEX_TIP].x - lm[INDEX_MCP].x)
    if (indexVert > indexDir) candidates.push(['V', 0.85])
  }

  // W — index + middle + ring extended with spread
  if (indexExt && middleExt && ringExt && pinkyCurl) {
    candidates.push(['W', 0.8])
  }

  // X — index hooked (partially curled, not fully)
  if (!indexExt && !indexCurl && middleCurl && ringCurl && pinkyCurl) {
    // Index partially bent
    const indexMid = dist3(lm[INDEX_DIP], lm[WRIST])
    const indexBase = dist3(lm[INDEX_MCP], lm[WRIST])
    if (indexMid > indexBase * 0.8) candidates.push(['X', 0.55])
  }

  // Y — thumb + pinky extended, others curled (hang loose)
  if (pinkyExt && thumbOut && indexCurl && middleCurl && ringCurl) {
    candidates.push(['Y', 0.9])
  }

  // Sort by confidence and return best match
  if (candidates.length === 0) {
    return { letter: '', confidence: 0 }
  }

  candidates.sort((a, b) => b[1] - a[1])
  return { letter: candidates[0][0], confidence: candidates[0][1] }
}
