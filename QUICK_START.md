# Quick Start Guide

## Installation (1 minute)

```bash
# Clone and navigate to project
cd Neon-Air-Draw-AI-Spatial-Interface

# Install dependencies
npm install
```

## Running the App (30 seconds)

```bash
# Start development server
npm run dev

# Open browser to http://localhost:3000
# Grant camera permissions when prompted
```

## First Time Setup Checklist

- [ ] Allow camera access in browser
- [ ] Ensure good lighting
- [ ] Hold hands up to camera
- [ ] See hand tracking visualization in app
- [ ] Try the gestures from the guide

## Basic Gestures (Try These First)

### Drawing
1. **Index Up** ☝️ - Point index finger up while other fingers curl
   - Your traced path visible as colored line
2. **Pinch** 🤏 - Touch thumb and index together
   - Strokes disappear where your fingers touch
3. **Fist** ✊ - Close hand into fist
   - All strokes disappear (careful!)

### Control (Use Left Hand)
1. **Two Fingers** ✌️ - Point index and middle finger up
   - Move nearest stroke by moving your hand
2. **Pinch & Spread** - Pinch fingers together or pull apart
   - Pinch = make stroke smaller
   - Spread = make stroke larger
3. **Open Palm** 🖐️ - Fully open hand
   - Rotate stroke by rotating your hand
   - Watch for snap points (every 45°)

## Next Steps

### Explore Features
- Click the **?** button (bottom right) to see gesture guide
- Try all 8 neon colors (bottom left palette)
- Combine gestures (draw with right, transform with left)

### Development
- Read [DEVELOPMENT.md](DEVELOPMENT.md) for setup and workflow
- Check [GESTURE_REFERENCE.md](GESTURE_REFERENCE.md) for technical details
- Modify [src/utils/](src/utils/) files to customize behavior

### Production Build
```bash
npm run build        # Create optimized build
npm run preview      # Test production version locally
```

## Troubleshooting

### Camera Not Working
- Check browser console (Press F12)
- Ensure you granted camera permission
- Try refreshing page
- Check that webcam works in other apps

### Gestures Not Detecting
- Ensure good lighting
- Keep hands fully visible in frame
- Move slowly and deliberately
- Read [GESTURE_REFERENCE.md](GESTURE_REFERENCE.md) for proper positions

### App Running Slowly
- Close other browser tabs
- Lower lighting might help hand detection
- Check FPS in top-left corner (should be ~60)

### Port Already in Use
```bash
npm run dev -- --port 3001
```

## Tips & Tricks

### Better Hand Detection
- Use side lighting (avoid backlighting)
- Keep hands in middle of camera view
- Wear contrasting colors to background
- Sit ~1-2 meters from camera

### Drawing Better Strokes
- Move slowly for smooth lines
- Use index finger extended fully
- Keep hand steady while drawing
- Try different hand angles

### Advanced Transforms
- Chain gestures (move → scale → rotate)
- Use both hands simultaneously
- Practice smooth hand movements
- Learn the 45° rotation snaps

## File Structure Overview

```
Neon Air Draw/
├── src/
│   ├── App.jsx                 ← Main component
│   ├── components/             ← UI components
│   └── utils/                  ← Core logic
├── package.json                ← Dependencies
├── vite.config.js              ← Build config
├── README.md                   ← Full documentation
├── DEVELOPMENT.md              ← Dev guide
├── GESTURE_REFERENCE.md        ← Gesture details
└── QUICK_START.md              ← This file
```

## Key Files to Modify

| File | Purpose | Easy Challenge |
|------|---------|------------------|
| [src/utils/colors.js](src/utils/colors.js) | Colors | Add a new neon color |
| [src/utils/GestureDetector.js](src/utils/GestureDetector.js) | Gestures | Adjust pinch sensitivity |
| [src/utils/CanvasRenderer.js](src/utils/CanvasRenderer.js) | Drawing | Change line width |
| [src/utils/StrokeManager.js](src/utils/StrokeManager.js) | Physics | Adjust friction/inertia |

## Command Reference

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Create production build
npm run preview      # Preview production build
npm run lint         # Check code quality
npm run format       # Format code
npm audit fix        # Fix vulnerabilities
```

## Performance Stats

- **Hand Detection:** 30-50ms per frame
- **Target FPS:** 60 FPS
- **Max Strokes:** 100+ (no limit, but rendering slows)
- **File Size:** ~70KB gzipped

## Browser Support

- **Chrome/Edge:** ✅ Excellent
- **Firefox:** ✅ Good
- **Safari:** ⚠️ Limited (older webkit)
- **Mobile:** ❌ Not yet (future feature)

## Common Customizations

### Change Default Color
Edit [src/App.jsx](src/App.jsx):
```javascript
const [currentColor, setCurrentColor] = useState(1); // Change index
```

### Adjust Hand Detection Sensitivity
Edit [src/utils/GestureDetector.js](src/utils/GestureDetector.js):
```javascript
static PINCH_THRESHOLD = 0.05;  // Decrease for easier pinch
```

### Change Canvas Background
Edit [src/index.css](src/index.css):
```css
body {
  background: linear-gradient(135deg, #0a0e27 0%, #16213e 100%);
  /* Modify gradient colors */
}
```

## Getting Help

1. **Check [GESTURE_REFERENCE.md](GESTURE_REFERENCE.md)** for gesture details
2. **Read [DEVELOPMENT.md](DEVELOPMENT.md)** for development guide
3. **Check browser console** (F12 → Console tab)
4. **Read code comments** in [src/utils/](src/utils/)

## What's Next?

### Learn More
- [ ] Try inverse hand usage (left hand to draw)
- [ ] Practice all gesture combinations
- [ ] Experiment with gesture timing
- [ ] Read detailed documentation

### Customize
- [ ] Add your own colors to palette
- [ ] Adjust gesture sensitivity
- [ ] Modify rendering style
- [ ] Add new visual effects

### Advanced
- [ ] Add new gestures
- [ ] Implement undo/redo
- [ ] Add export functionality
- [ ] Contribute back!

---

**Ready to draw in the air?** 🎨✨

Start the dev server and enjoy!
