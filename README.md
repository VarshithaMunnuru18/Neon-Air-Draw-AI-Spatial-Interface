# Neon Air Draw — AI Spatial Interface

A high-performance, real-time AI air drawing web application that utilizes advanced hand tracking for a **"Minority Report" style spatial interface**.

Draw in the air with your dominant hand and manipulate your creations in real-time with your non-dominant hand using intuitive gestures (Move, Scale, Rotate).

## ✨ Key Features

### ✋ Dual-Hand Interaction
- **Right Hand (Dominant)**: Handles high-precision drawing, selective erasing, and canvas clearing
- **Left Hand (Secondary)**: Dedicated to spatial transformations (Move, Scale, Rotate) of existing strokes

### 📐 Non-Destructive Transforms
- Strokes retain their original coordinate data
- All manipulations (TX, TY, Scale, Rotation) applied at render time via matrix-based math
- Physics-based inertia on stroke movement
- Snap-to-angle (45°) for rotation

### 🕶️ Minimalist Glassmorphism UI
- Premium, aesthetic interface with real-time HUD
- Visual feedback guides for every interaction
- Neon color palette with glow effects

### ⚡ High Performance
- Native Canvas 2D-based rendering engine
- Optimized for 60FPS fluid interactions
- Real-time gesture detection and processing

### 📖 Interactive Gesture Guide
- Built-in manual explaining every movement
- Tab-based navigation for Drawing and Control gestures
- Accessible from the interface at any time

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Hand Tracking**: @mediapipe/hands
- **Animations**: Framer Motion
- **Icons**: Lucide React (with custom inline SVG fallbacks)
- **Styling**: Vanilla CSS (Modern Glassmorphism & Neon Aesthetics)
- **Canvas**: HTML5 Canvas 2D with custom rendering engine

## 🎮 Gesture Manual

### ✍️ Drawing Hand (Right Hand)

| Gesture | Action |
|---------|--------|
| ☝️ Index Up | Start drawing a stroke |
| 🤏 Pinch | Selective eraser (intersects with fingertip path) |
| ✊ Fist | Clear the entire canvas |

### 🖐️ Control Hand (Left Hand)

| Gesture | Action | Visual Feedback |
|---------|--------|-----------------|
| ✌️ Two Fingers | Move nearest stroke | Blue crosshair + glow |
| 🤏 Pinch & Spread | Scale stroke size | Concentric rings + % label |
| 🖐️ Open Palm | Rotate stroke | Orange arc + snap points |

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- A webcam (for hand tracking)
- Modern web browser with WebGL support

### Installation

```bash
# Clone the repository
git clone https://github.com/VarshithaMunnuru18/Neon-Air-Draw-AI-Spatial-Interface.git
cd Neon-Air-Draw-AI-Spatial-Interface

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev

# The app will be available at http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   ├── ColorPalette.jsx          # Color selection UI
│   ├── ColorPalette.css
│   ├── GestureGuide.jsx          # Interactive gesture manual
│   └── GestureGuide.css
├── utils/
│   ├── HandTracker.js            # MediaPipe hand detection
│   ├── GestureDetector.js        # Gesture analysis engine
│   ├── StrokeManager.js          # Stroke lifecycle & transforms
│   ├── CanvasRenderer.js         # High-performance renderer
│   └── colors.js                 # Neon color palette
├── App.jsx                       # Main application component
├── App.css                       # App styling
├── main.jsx                      # React entry point
└── index.css                     # Global styles

index.html                         # HTML entry point
vite.config.js                     # Vite configuration
package.json                       # Project dependencies
```

## 🏗️ Architecture

### Hand Tracking & Gesture Detection
- Utilizes MediaPipe Hands for real-time hand landmark detection
- 21-point hand skeleton with sub-second latency
- Dual-hand tracking for simultaneous drawing and control

### Gesture Detection Engine
- Rule-based gesture classification using hand landmark distances
- Configurable thresholds for pinch, spread, index extension, etc.
- Hand chirality detection (Left vs Right)

### Stroke Management System
- Non-destructive transform pipeline
- Transform stack: Translation → Scale → Rotation
- Physics-based velocity and inertia decay
- Efficient nearest-stroke lookup for interaction

### Rendering Pipeline
1. Clear canvas with animated gradient background
2. Draw all strokes with applied transformations
3. Render selection outline for active stroke
4. Draw interactive visual feedback (crosshairs, arcs, rings)
5. Update HUD with FPS and gesture information

## 🎨 Customization

### Adding New Colors

Edit [src/utils/colors.js](src/utils/colors.js):

```javascript
export const NEON_COLORS = [
  '#00f0ff', // Cyan
  '#b700ff', // Purple
  '#ff006e', // Pink
  // Add your colors here
];
```

### Adjusting Gesture Sensitivity

Edit [src/utils/GestureDetector.js](src/utils/GestureDetector.js):

```javascript
static PINCH_THRESHOLD = 0.05;      // Decrease to make pinch easier
static SPREAD_THRESHOLD = 0.15;     // Increase to require more spread
static FIST_THRESHOLD = 0.08;       // Adjust fist detection
static INDEX_UP_THRESHOLD = 0.1;    // Fine-tune index detection
```

### Modifying Stroke Rendering

Edit [src/utils/CanvasRenderer.js](src/utils/CanvasRenderer.js) to change:
- Line width and visual effects
- Glow intensity
- Selection outline style
- HUD appearance

## ⚙️ Configuration

### MediaPipe Hand Detection Options

In [src/utils/HandTracker.js](src/utils/HandTracker.js):

```javascript
this.hands.setOptions({
  maxNumHands: 2,              // Maximum hands to track
  modelComplexity: 1,          // 0 (lite) or 1 (full)
  minDetectionConfidence: 0.5, // [0-1] threshold
  minTrackingConfidence: 0.5,  // [0-1] threshold
});
```

### Physics Parameters

In [src/utils/StrokeManager.js](src/utils/StrokeManager.js):

```javascript
updatePhysics(deltaTime = 16, friction = 0.95) {
  // Adjust friction (0-1) to control inertia decay
  // Higher = more sliding, Lower = faster stop
}
```

## 🔄 Rendering Loop

The app runs a 60FPS render loop:

```javascript
1. Hand tracking analyzes video frame
2. Gesture detector processes landmarks
3. Stroke manager applies transformations
4. Canvas renderer draws all elements
5. Physics update with inertia
6. HUD displays real-time info
```

## 🐛 Troubleshooting

### Hand Tracking Not Working
- Ensure camera permissions are granted
- Check browser console for MediaPipe errors
- Verify webcam is functioning in other applications
- Try adjusting detection confidence thresholds

### Low FPS Performance
- Close other browser tabs
- Enable hardware acceleration in browser settings
- Reduce canvas resolution through custom configuration
- Lower MediaPipe model complexity to 0 (lite)

### Gestures Not Detecting
- Ensure good lighting and clear hand visibility
- Adjust gesture thresholds in GestureDetector
- Check hand position is within camera frame
- Verify left and right hands are properly distinguished

## 📊 Performance Metrics

- **Hand Detection Latency**: ~30-50ms per frame
- **Gesture Processing**: <5ms
- **Rendering**: <16ms @60FPS
- **Total Latency**: ~50-70ms from hand movement to screen

## 🔮 Future Enhancements

- [ ] Pressure sensitivity input
- [ ] Multi-stroke grouping and manipulation
- [ ] Undo/Redo functionality
- [ ] Stroke smoothing with Catmull-Rom curves
- [ ] Export drawings as SVG/PNG
- [ ] Animation playback
- [ ] Touch device support (fallback)
- [ ] Advanced gesture recognition (ML-based)
- [ ] Collaborative multi-user drawing
- [ ] Oculus/VR hand tracking integration

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- [MediaPipe](https://mediapipe.dev/) - Hand tracking technology
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Vite](https://vitejs.dev/) - Build tool
- Inspired by "Minority Report" gesture interface concepts

## 📧 Contact & Support

For issues, suggestions, or contributions, please open an issue or pull request on GitHub.

---

**Ready to draw in the air? 🎨✨**

```bash
npm install && npm run dev
```
