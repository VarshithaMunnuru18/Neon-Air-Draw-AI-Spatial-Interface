/**
 * Gesture Detection Utility
 * Analyzes hand landmarks to detect various gestures
 */

export class GestureDetector {
  // Threshold values for gesture detection
  static PINCH_THRESHOLD = 0.05;
  static SPREAD_THRESHOLD = 0.15;
  static FIST_THRESHOLD = 0.08;
  static INDEX_UP_THRESHOLD = 0.1;

  /**
   * Calculate distance between two landmarks
   */
  static distance(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    const dz = (point1.z || 0) - (point2.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Detect if a hand is performing a pinch gesture
   */
  static isPinching(hand) {
    if (!hand || hand.length < 9) return false;
    const thumbTip = hand[4];
    const indexTip = hand[8];
    return this.distance(thumbTip, indexTip) < this.PINCH_THRESHOLD;
  }

  /**
   * Detect if a hand is performing a spread gesture (opposite of pinch)
   */
  static isSpreading(hand) {
    if (!hand || hand.length < 9) return false;
    const thumbTip = hand[4];
    const indexTip = hand[8];
    return this.distance(thumbTip, indexTip) > this.SPREAD_THRESHOLD;
  }

  /**
   * Detect if a hand is in a fist position
   */
  static isFist(hand) {
    if (!hand || hand.length < 21) return false;
    const wrist = hand[0];
    const fingers = [
      hand[4], // Thumb
      hand[8], // Index
      hand[12], // Middle
      hand[16], // Ring
      hand[20], // Pinky
    ];

    // Check if all fingertips are close to wrist
    return fingers.every((finger) => this.distance(wrist, finger) < this.FIST_THRESHOLD);
  }

  /**
   * Detect if index finger is pointing up (other fingers curled)
   */
  static isIndexUp(hand) {
    if (!hand || hand.length < 21) return false;

    const indexTip = hand[8];
    const indexPIP = hand[6];
    const middleTip = hand[12];
    const ringTip = hand[16];
    const pinkyTip = hand[20];
    const wrist = hand[0];

    // Index should be extended upward
    const indexExtended = indexTip.y < indexPIP.y;

    // Other fingers should be curled (close to wrist)
    const othersCurled =
      this.distance(wrist, middleTip) < 0.15 &&
      this.distance(wrist, ringTip) < 0.15 &&
      this.distance(wrist, pinkyTip) < 0.15;

    return indexExtended && othersCurled;
  }

  /**
   * Detect if two fingers (index and middle) are pointing up
   */
  static isTwoFingers(hand) {
    if (!hand || hand.length < 21) return false;

    const indexTip = hand[8];
    const indexPIP = hand[6];
    const middleTip = hand[12];
    const middlePIP = hand[10];
    const ringTip = hand[16];
    const pinkyTip = hand[20];
    const wrist = hand[0];

    // Index and middle should be extended
    const indexExtended = indexTip.y < indexPIP.y;
    const middleExtended = middleTip.y < middlePIP.y;

    // Ring and pinky should be curled
    const othersCurled = this.distance(wrist, ringTip) < 0.15 && this.distance(wrist, pinkyTip) < 0.15;

    return indexExtended && middleExtended && othersCurled;
  }

  /**
   * Detect if palm is open (all fingers extended)
   */
  static isPalmOpen(hand) {
    if (!hand || hand.length < 21) return false;

    const wrist = hand[0];
    const fingertips = [hand[4], hand[8], hand[12], hand[16], hand[20]];

    // All fingers should be relatively extended from wrist
    return fingertips.every((tip) => this.distance(wrist, tip) > 0.15);
  }

  /**
   * Detect hand chirality (left vs right)
   */
  static getHandedness(handedness) {
    return handedness && handedness.length > 0 ? handedness[0].label : null;
  }

  /**
   * Get hand center point (average of all landmarks)
   */
  static getHandCenter(hand) {
    if (!hand || hand.length === 0) return null;

    let x = 0,
      y = 0,
      z = 0;
    hand.forEach((point) => {
      x += point.x;
      y += point.y;
      z += point.z || 0;
    });

    return {
      x: x / hand.length,
      y: y / hand.length,
      z: z / hand.length,
    };
  }

  /**
   * Get finger position (normalized to 0-1 screen coordinates)
   */
  static getFingerPosition(fingerTip, canvasWidth, canvasHeight) {
    return {
      x: fingerTip.x * canvasWidth,
      y: fingerTip.y * canvasHeight,
      z: fingerTip.z,
    };
  }

  /**
   * Analyze overall hand gesture state
   */
  static analyzeGesture(hand, handedness) {
    return {
      isIndexUp: this.isIndexUp(hand),
      isTwoFingers: this.isTwoFingers(hand),
      isPalmOpen: this.isPalmOpen(hand),
      isPinching: this.isPinching(hand),
      isSpreading: this.isSpreading(hand),
      isFist: this.isFist(hand),
      handedness: this.getHandedness(handedness),
      center: this.getHandCenter(hand),
    };
  }
}

export default GestureDetector;
