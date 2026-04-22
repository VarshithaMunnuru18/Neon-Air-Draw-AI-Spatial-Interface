# Development Guide - Neon Air Draw

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will open at `http://localhost:3000`

### 3. Building for Production
```bash
npm run build
npm run preview  # Test production build locally
```

## Development Workflow

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ColorPalette.jsx     # Color selection UI
│   ├── GestureGuide.jsx     # Interactive gesture manual
│
├── utils/               # Core utility classes and functions
│   ├── HandTracker.js       # MediaPipe hand detection
│   ├── GestureDetector.js   # Gesture analysis engine
│   ├── StrokeManager.js     # Stroke lifecycle & transforms
│   ├── CanvasRenderer.js    # Canvas 2D rendering
│   └── colors.js            # Color palette definitions
│
├── App.jsx              # Main application component
├── App.css              # App styling
├── main.jsx             # React entry point
└── index.css            # Global styles
```

## Core Concepts

### 1. Hand Tracking Pipeline

```
MediaPipe Hand Landmarks (21 points per hand)
    ↓
getResults() returns landmarks + handedness
    ↓
GestureDetector analyzes landmarks
    ↓
Gesture state determined (isIndexUp, isPinching, etc.)
    ↓
Mapped to drawing/control actions
```

### 2. Stroke System

**Stroke Data Structure:**
```javascript
{
  id: number,
  color: string,
  points: [{ x, y }, ...],           // Original coordinates (0-1 normalized)
  transform: {
    tx: number,                      // Translation X
    ty: number,                      // Translation Y
    scale: number,                   // Scale factor
    rotation: number,                // Rotation in radians
  },
  velocity: { x, y },                // Physics velocity
  isMoving: boolean,
}
```

**Non-Destructive Transforms:**
- All transformations are applied at render time
- Original point data never modified
- Enables unlimited undo/redo capability

### 3. Rendering Pipeline

Each frame:
1. Clear canvas with gradient background
2. Render all strokes with transformations
3. Draw interaction guides (crosshairs, arcs, rings)
4. Render selection outline
5. Update physics with inertia
6. Draw HUD (FPS, gesture info)

### 4. Gesture Detection

**Detection Methods:**
- Distance-based (e.g., thumb-index distance for pinch)
- Orientation checks (finger pointing up/down)
- Hand center calculations
- Comparative analysis of finger positions

**Adjustable Parameters** in [src/utils/GestureDetector.js](src/utils/GestureDetector.js):
```javascript
static PINCH_THRESHOLD = 0.05;
static SPREAD_THRESHOLD = 0.15;
static FIST_THRESHOLD = 0.08;
static INDEX_UP_THRESHOLD = 0.1;
```

## Common Development Tasks

### Adding a New Gesture

1. **Add detection method** in [src/utils/GestureDetector.js](src/utils/GestureDetector.js):
```javascript
static isNewGesture(hand) {
  // Analyze hand landmarks
  return /* gesture condition */;
}
```

2. **Add to analyzeGesture()** output:
```javascript
static analyzeGesture(hand, handedness) {
  return {
    // ... existing properties
    isNewGesture: this.isNewGesture(hand),
  };
}
```

3. **Handle in App.jsx** - Process in `processRightHandGestures()` or `processLeftHandGestures()`

### Adding a New Color

Edit [src/utils/colors.js](src/utils/colors.js):
```javascript
export const NEON_COLORS = [
  '#00f0ff', // Cyan
  '#ff0000', // Your new color
];
```

### Changing Stroke Rendering Style

Edit [src/utils/CanvasRenderer.js](src/utils/CanvasRenderer.js) > `drawStroke()`:
```javascript
this.ctx.lineWidth = lineWidth * stroke.transform.scale;
this.ctx.stroked = '#custom-color';
// Modify glow, shadows, etc.
```

### Adjusting Physics

Edit [src/utils/StrokeManager.js](src/utils/StrokeManager.js) > `updatePhysics()`:
```javascript
updatePhysics(deltaTime = 16, friction = 0.95) {
  // Lower friction = more sliding
  // Higher friction = quicker stop
  this.velocity.x *= friction;
}
```

### Adding UI Elements

Create new component files:
```bash
src/components/NewComponent.jsx
src/components/NewComponent.css
```

Import in [src/App.jsx](src/App.jsx):
```jsx
import NewComponent from './components/NewComponent';

// Add to JSX:
<NewComponent {...props} />
```

## Debugging Tips

### Hand Tracking Issues
1. **Check camera permissions** - Browser console shows errors
2. **Verify lighting** - Good lighting critical for hand detection
3. **Inspect landmarks** - Add to HUD:
```javascript
console.log('Hand landmarks:', results.multiHandLandmarks);
```

### Gesture Detection Issues
1. **Log gesture states** in `processRightHandGestures()`:
```javascript
console.log('Index up:', GestureDetector.isIndexUp(landmarks));
console.log('Pinching:', GestureDetector.isPinching(landmarks));
```

2. **Adjust thresholds** and test different sensitivity values

### Performance Issues
1. **Check FPS** displayed in HUD - target 60FPS
2. **Profile with DevTools** - Performance tab
3. **Optimize rendering**: reduce stroke point count, cache calculations
4. **Lower MediaPipe complexity**: change `modelComplexity: 0` (lite mode)

## Testing Gestures

### Manual Testing Checklist
- [ ] Index Up - Draw strokes smoothly
- [ ] Pinch - Erase strokes on path
- [ ] Fist - Clear all strokes
- [ ] Two Fingers - Move strokes
- [ ] Pinch & Spread - Scale strokes
- [ ] Open Palm - Rotate strokes with snap

### Edge Cases
- Hand outside frame
- Multiple hands simultaneously
- Rapid gesture transitions
- Very quick movements

## Performance Optimization

### Rendering Optimization
- Limit point density per stroke
- Cache transformed point calculations
- Use `requestAnimationFrame` batching
- Consider WebGL for 1000+ strokes

### Hand Tracking Optimization
- Adjust detection/tracking confidence thresholds
- Use lite model for lower-end devices
- Skip frames if needed (process every other frame)

### Memory Management
- Regular cleanup of old strokes
- Limit stroke history for undo
- Profile memory usage regularly

## Deployment

### Build Process
```bash
npm run build
```

Outputs optimized files to `dist/` directory

### Hosting Requirements
- HTTPS required (camera access needs secure context)
- WebGL support
- ~70KB gzipped size

### Environment Setup
No environment variables currently required. Update as needed in `.env.local` if adding backend APIs.

## Code Style

### Formatting
```bash
npm run format    # Format with Prettier
npm run lint      # Check with ESLint
```

Configuration in `.prettierrc` and `.eslintrc.json`

## Troubleshooting Build Issues

### Dependencies Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Vite Issues
```bash
# Clear Vite cache
rm -rf dist .vite
npm run build
```

### Port Already in Use
```bash
npm run dev -- --port 3001
```

## Resources

- [MediaPipe Hands Documentation](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Canvas 2D API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

## Contributing

1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and test thoroughly
3. Commit with clear messages
4. Push and create pull request

## Future Development Ideas

- [ ] Gesture recording and playback
- [ ] Multi-color strokes
- [ ] Stroke filter effects (blur, glow, fade)
- [ ] Collaborative drawing with WebSockets
- [ ] Export functionality (SVG, PNG, video)
- [ ] Animation timeline
- [ ] Sound effects for interactions
- [ ] Dark/light theme toggle
- [ ] Accessibility improvements
- [ ] Mobile/touch support fallback
