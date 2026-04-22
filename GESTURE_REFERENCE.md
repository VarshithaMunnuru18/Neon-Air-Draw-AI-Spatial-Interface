# Gesture Reference Guide

## Hand Landmark Points (MediaPipe)

```
Hand Skeleton (21 points):
0  - Wrist
1-4  - Thumb (base to tip)
5-8  - Index (base to tip)
9-12 - Middle (base to tip)
13-16 - Ring (base to tip)
17-20 - Pinky (base to tip)
```

## Drawing Hand Gestures (Right Hand)

### 1. Index Up ☝️
**Purpose:** Start drawing a stroke

**Detection Logic:**
```javascript
- Index finger tip (8) is above index PIP (6)
- Middle, ring, pinky fingers are curled (close to wrist)
- Only index extends upward
```

**Threshold:** INDEX_UP_THRESHOLD = 0.1
**Hand Points Used:** 0 (wrist), 6, 8, 12, 16, 20
**Processing:** Adds point to current stroke every frame

**Visual Feedback:**
- Cursor-like behavior
- Continuous line drawing

---

### 2. Pinch 🤏
**Purpose:** Selective eraser

**Detection Logic:**
```javascript
- Thumb tip (4) and index tip (8) distance < PINCH_THRESHOLD
- Typically close together (< 5cm in real space)
```

**Threshold:** PINCH_THRESHOLD = 0.05
**Hand Points Used:** 4, 8
**Processing:** 
1. Trace finger path through space
2. Find all strokes intersecting with path
3. Remove intersecting strokes

**Visual Feedback:**
- Pink/red cursor outline
- Crosshair pattern

---

### 3. Fist ✊
**Purpose:** Clear entire canvas

**Detection Logic:**
```javascript
- All fingertips (4, 8, 12, 16, 20) are close to wrist (0)
- Distance from wrist to each fingertip < FIST_THRESHOLD
- Hand is "balled up"
```

**Threshold:** FIST_THRESHOLD = 0.08
**Hand Points Used:** 0, 4, 8, 12, 16, 20
**Processing:** 
- Single frame detection triggers canvas clear
- All strokes removed immediately

**Visual Feedback:**
- Canvas goes blank
- Confirmation of action

---

## Control Hand Gestures (Left Hand)

### 4. Two Fingers ✌️
**Purpose:** Move nearest stroke

**Detection Logic:**
```javascript
- Index (8) and middle (12) fingers extended upward
- Ring (16) and pinky (20) fingers curled (close to wrist)
- Only two fingers pointing
```

**Threshold:** Similar to index up but checks two fingers
**Hand Points Used:** 0, 6, 8, 10, 12, 16, 20 (wrist, index, middle, ring, pinky)
**Processing:**
1. Calculate hand center point
2. Find nearest stroke to hand center
3. Track movement of hand center
4. Apply translation to stroke

**Visual Feedback:**
- Blue crosshair at hand center
- Glowing circle around target stroke
- Stroke follows hand movement

**Physics:**
- Smooth inertia decay when hand stops
- Configurable friction = 0.95

---

### 5. Pinch & Spread 🤏↔️
**Purpose:** Scale stroke size

**Detection Logic:**
```javascript
Pinching (Scale Down):
- Thumb (4) and index (8) tips < PINCH_THRESHOLD

Spreading (Scale Up):
- Thumb (4) and index (8) tips > SPREAD_THRESHOLD
- Fingers opening apart (> 15cm in real space)
```

**Thresholds:**
- PINCH_THRESHOLD = 0.05
- SPREAD_THRESHOLD = 0.15

**Hand Points Used:** 4, 8
**Processing:**
1. Find nearest stroke to hand center
2. On pinch: multiply strokes scale by 0.98 (0.98x)
3. On spread: multiply strokes scale by 1.02 (1.02x)
4. Apply during gesture, not on state change

**Visual Feedback:**
- Concentric rings radiating from hand center
- Percentage label (0-500%)
- Color-coded rings for feedback

**Scale Constraints:**
- Minimum: 0.1x (10% of original)
- Maximum: 5x (500% of original)

---

### 6. Open Palm 🖐️
**Purpose:** Rotate stroke

**Detection Logic:**
```javascript
- All fingers extended outward from wrist
- All fingertips (4, 8, 12, 16, 20) are far from wrist (0)
- Distance from wrist to each fingertip > 0.15
- Hand is fully open/splayed
```

**Threshold:** All fingers > 0.15 from wrist
**Hand Points Used:** 0, 4, 8, 12, 16, 20
**Processing:**
1. Find nearest stroke to hand center
2. Calculate angle from thumb position to palm center
3. Apply rotation to stroke
4. After gesture release, snap to 45° increment

**Visual Feedback:**
- Orange arc around hand center
- Snap points at 0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°
- Rotation indicator line

**Snap-to-Angle:**
- After gesture completes, round to nearest 45° increment
- Each increment = π/4 radians
- 8 possible rotations (octants)

---

## Implementation Details

### Distance Calculation
```javascript
distance(point1, point2) = √((x₁-x₂)² + (y₁-y₂)² + (z₁-z₂)²)
```

### Handedness Detection
```javascript
- "Right" - Right hand
- "Left" - Left hand
- Always check before processing
```

### Hand Center
```javascript
center = average of all 21 landmark points
center.x = Σ(landmark.x) / 21
center.y = Σ(landmark.y) / 21
center.z = Σ(landmark.z) / 21
```

### Transform Application Order
```
1. Scale: (point - center) * scale + center
2. Rotate: Apply rotation matrix around center
3. Translate: Add tx, ty to rotated point
```

### Rotation Matrix
```
cos(θ)  -sin(θ)
sin(θ)   cos(θ)
```

---

## Gesture State Machine

```
Drawing Hand:
idle → index_up (draw) → idle
idle → pinch (erase) → idle
idle → fist (clear) → idle

Control Hand:
idle → two_fingers (move) → idle
idle → pinching (scale down) → idle
idle → spreading (scale up) → idle
idle → palm_open (rotate) → snap_rotation
```

---

## Performance Considerations

### Detection Frequency
- Every frame (~60/sec)
- ~16ms per frame budget

### Processing Order
1. Hand tracking: 30-50ms
2. Gesture detection: <5ms
3. Action processing: <5ms
4. Rendering: <16ms

### Optimization Tips
- Cache gesture state (don't recalculate every frame)
- Only process changed hand positions
- Batch transform updates
- Use OffscreenCanvas for heavy rendering (future)

---

## Tuning Gesture Sensitivity

### More Sensitive Gestures
- Decrease thresholds (smaller values = easier to trigger)
- Example: `PINCH_THRESHOLD = 0.03` (very easy pinch)

### Stricter Gestures
- Increase thresholds (larger values = harder to trigger)
- Example: `FIST_THRESHOLD = 0.12` (very tight fist required)

### Testing Gestures
Add to [src/utils/GestureDetector.js](src/utils/GestureDetector.js):
```javascript
console.log({
  indexUp: this.isIndexUp(hand),
  pinching: this.isPinching(hand),
  spreding: this.isSpreading(hand),
  fist: this.isFist(hand),
  twoFingers: this.isTwoFingers(hand),
  palmOpen: this.isPalmOpen(hand),
});
```

---

## Common Gesture Issues

### Index Up Not Detecting
- Check other fingers are curled (close to wrist)
- Verify lighting for clear hand detection
- Increase `INDEX_UP_THRESHOLD` if too strict

### Pinch Sensitivity Issues
- If too sensitive: increase `PINCH_THRESHOLD` to 0.08
- If not sensitive: decrease `PINCH_THRESHOLD` to 0.03
- Test with different lighting and hand angles

### Fist Detection Failing
- Ensure all fingers are equally curled
- Verify hand is not partially out of frame
- Adjust `FIST_THRESHOLD` for your hand size

### Rotation Snapping Too Aggressive
- Reduce snap-to-angle precision (increase increment)
- Currently: 45° increments (8 positions)
- Could reduce to: 90° increments (4 positions)

---

## Adding New Gestures

### Template

```javascript
static isNewGesture(hand) {
  if (!hand || hand.length < 21) return false;
  
  // Get relevant landmarks
  const point1 = hand[XXX];
  const point2 = hand[XXX];
  
  // Implement detection logic
  const condition1 = /* ... */;
  const condition2 = /* ... */;
  
  return condition1 && condition2;
}
```

### Then Add to analyzeGesture()
```javascript
return {
  // ... existing properties
  isNewGesture: this.isNewGesture(hand),
};
```

### Then Handle in App.jsx
```javascript
if (gestureInfo.isNewGesture) {
  // Process the gesture
}
```
