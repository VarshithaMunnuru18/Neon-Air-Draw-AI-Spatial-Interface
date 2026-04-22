import React, { useEffect, useRef, useState } from 'react';
import HandTracker from './utils/HandTracker';
import GestureDetector from './utils/GestureDetector';
import StrokeManager from './utils/StrokeManager';
import CanvasRenderer from './utils/CanvasRenderer';
import { NEON_COLORS, getRandomNeonColor } from './utils/colors';
import GestureGuide from './components/GestureGuide';
import ColorPalette from './components/ColorPalette';
import './App.css';

export default function App() {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const handTrackerRef = useRef(null);
  const rendererRef = useRef(null);
  const strokeManagerRef = useRef(null);
  const animationRef = useRef(null);

  const [isTracking, setIsTracking] = useState(false);
  const [currentColor, setCurrentColor] = useState(0);
  const [fps, setFps] = useState(60);
  const [showGuide, setShowGuide] = useState(true);
  const [gestureInfo, setGestureInfo] = useState({
    rightHand: null,
    leftHand: null,
    strokeCount: 0,
  });

  // Drawing state
  const drawingStateRef = useRef({
    isDrawing: false,
    currentStroke: null,
    eraserMode: false,
    lastTime: Date.now(),
    frameCount: 0,
  });

  /**
   * Initialize application
   */
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize stroke manager
        strokeManagerRef.current = new StrokeManager();

        // Initialize canvas renderer
        rendererRef.current = new CanvasRenderer(canvasRef.current);
        rendererRef.current.initialize();

        // Initialize hand tracker
        handTrackerRef.current = new HandTracker();
        await handTrackerRef.current.initialize(videoRef.current, null, handleHandTrackingResults);

        setIsTracking(true);
        startRenderLoop();
      } catch (error) {
        console.error('App initialization failed:', error);
      }
    };

    initializeApp();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (handTrackerRef.current) {
        handTrackerRef.current.dispose();
      }
    };
  }, []);

  /**
   * Handle window resize
   */
  useEffect(() => {
    const handleResize = () => {
      if (rendererRef.current) {
        rendererRef.current.updateCanvasSize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * Handle hand tracking results
   */
  const handleHandTrackingResults = (results) => {
    if (!results || !results.multiHandLandmarks) return;

    const { multiHandLandmarks, multiHandedness } = results;
    let rightHand = null;
    let leftHand = null;

    // Separate right and left hands
    multiHandLandmarks.forEach((landmarks, index) => {
      const handedness = GestureDetector.getHandedness(multiHandedness[index].label);

      if (handedness === 'Right') {
        rightHand = { landmarks, index };
      } else if (handedness === 'Left') {
        leftHand = { landmarks, index };
      }
    });

    // Process drawing (right hand)
    if (rightHand) {
      processRightHandGestures(rightHand.landmarks);
    }

    // Process control gestures (left hand)
    if (leftHand) {
      processLeftHandGestures(leftHand.landmarks);
    }

    // Update gesture info for HUD
    setGestureInfo((prev) => ({
      ...prev,
      rightHand: rightHand ? GestureDetector.analyzeGesture(rightHand.landmarks) : null,
      leftHand: leftHand ? GestureDetector.analyzeGesture(leftHand.landmarks) : null,
      strokeCount: strokeManagerRef.current.getAllStrokes().length,
    }));
  };

  /**
   * Process right hand gestures (Drawing)
   */
  const processRightHandGestures = (landmarks) => {
    const indexTip = landmarks[8];
    const thumbTip = landmarks[4];
    const center = GestureDetector.getHandCenter(landmarks);

    // Index Up - Start drawing
    if (GestureDetector.isIndexUp(landmarks)) {
      if (!drawingStateRef.current.isDrawing) {
        drawingStateRef.current.isDrawing = true;
        drawingStateRef.current.currentStroke = strokeManagerRef.current.createStroke(
          NEON_COLORS[currentColor]
        );
      }
      if (drawingStateRef.current.currentStroke) {
        drawingStateRef.current.currentStroke.addPoint(indexTip.x, indexTip.y);
      }
    } else {
      drawingStateRef.current.isDrawing = false;
      drawingStateRef.current.currentStroke = null;
    }

    // Pinch - Selective eraser
    if (GestureDetector.isPinching(landmarks)) {
      if (!drawingStateRef.current.eraserMode) {
        drawingStateRef.current.eraserMode = true;
      }
      const eraserPath = [];
      for (let i = 0; i < landmarks.length; i++) {
        eraserPath.push({ x: landmarks[i].x, y: landmarks[i].y });
      }
      const intersectingStrokes = strokeManagerRef.current.findStrokesIntersectingPath(eraserPath);
      intersectingStrokes.forEach((stroke) => strokeManagerRef.current.removeStroke(stroke));
    } else {
      drawingStateRef.current.eraserMode = false;
    }

    // Fist - Clear canvas
    if (GestureDetector.isFist(landmarks)) {
      strokeManagerRef.current.clearAllStrokes();
    }
  };

  /**
   * Process left hand gestures (Control/Transform)
   */
  const processLeftHandGestures = (landmarks) => {
    const center = GestureDetector.getHandCenter(landmarks);
    const nearestStroke = strokeManagerRef.current.findNearestStroke(center.x, center.y);

    if (!nearestStroke) return;

    strokeManagerRef.current.selectStroke(nearestStroke);

    // Two Fingers - Move
    if (GestureDetector.isTwoFingers(landmarks)) {
      const indexTip = landmarks[8];
      const middleTip = landmarks[12];

      // Calculate movement from center
      const movementX = (indexTip.x + middleTip.x) / 2 - center.x;
      const movementY = (indexTip.y + middleTip.y) / 2 - center.y;

      nearestStroke.applyTransform(movementX * 100, movementY * 100);
    }

    // Pinch & Spread - Scale
    if (GestureDetector.isPinching(landmarks)) {
      // Pinch = scale down
      nearestStroke.applyTransform(0, 0, nearestStroke.transform.scale * 0.98);
    } else if (GestureDetector.isSpreading(landmarks)) {
      // Spread = scale up
      nearestStroke.applyTransform(0, 0, nearestStroke.transform.scale * 1.02);
    }

    // Palm Open - Rotate
    if (GestureDetector.isPalmOpen(landmarks)) {
      const thumbTip = landmarks[4];
      const palmCenter = GestureDetector.getHandCenter(landmarks);

      // Calculate rotation from thumb position
      const angle = Math.atan2(thumbTip.y - palmCenter.y, thumbTip.x - palmCenter.x);
      nearestStroke.applyTransform(0, 0, nearestStroke.transform.scale, angle);

      // Snap to 45° increments
      nearestStroke.snapRotation();
    }
  };

  /**
   * Main render loop
   */
  const startRenderLoop = () => {
    const lastTimeRef = { value: Date.now() };
    let frameCount = 0;
    let fpsUpdateTime = Date.now();

    const renderFrame = () => {
      const now = Date.now();
      const deltaTime = now - lastTimeRef.value;
      lastTimeRef.value = now;

      // Clear and render
      if (rendererRef.current && strokeManagerRef.current) {
        rendererRef.current.clear();

        // Draw all strokes
        rendererRef.current.drawAllStrokes(
          strokeManagerRef.current.getAllStrokes(),
          strokeManagerRef.current.selectedStroke
        );

        // Update physics
        strokeManagerRef.current.updatePhysics(deltaTime);

        // Draw HUD
        rendererRef.current.drawHUD(fps, gestureInfo);
      }

      // Update FPS counter
      frameCount++;
      if (now - fpsUpdateTime > 1000) {
        setFps(frameCount);
        frameCount = 0;
        fpsUpdateTime = now;
      }

      animationRef.current = requestAnimationFrame(renderFrame);
    };

    animationRef.current = requestAnimationFrame(renderFrame);
  };

  return (
    <div className="app">
      {/* Hidden video feed for hand tracking */}
      <video ref={videoRef} style={{ display: 'none' }} />

      {/* Canvas for drawing */}
      <canvas ref={canvasRef} className="drawing-canvas" width={window.innerWidth} height={window.innerHeight} />

      {/* UI Components */}
      <ColorPalette colors={NEON_COLORS} currentColor={currentColor} onColorChange={setCurrentColor} />

      {showGuide && <GestureGuide onClose={() => setShowGuide(false)} />}

      {/* Guide Toggle Button */}
      <button className="guide-toggle" onClick={() => setShowGuide(!showGuide)} title="Toggle Gesture Guide">
        ?
      </button>

      {/* Status Display */}
      <div className="status-display">
        <div className="status-item">
          <span className="label">Status:</span>
          <span className="value neon-cyan">{isTracking ? 'Tracking' : 'Initializing...'}</span>
        </div>
      </div>
    </div>
  );
}
