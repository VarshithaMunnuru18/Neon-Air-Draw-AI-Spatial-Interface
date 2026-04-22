import React, { useState } from 'react';
import './GestureGuide.css';

export default function GestureGuide({ onClose }) {
  const [selectedHand, setSelectedHand] = useState('drawing');

  const gestures = {
    drawing: [
      {
        gesture: '☝️ Index Up',
        action: 'Start drawing a stroke',
        description: 'Point your index finger up with other fingers curled to begin drawing.',
      },
      {
        gesture: '🤏 Pinch',
        action: 'Selective eraser',
        description: 'Touch your thumb and index finger together to erase strokes along your path.',
      },
      {
        gesture: '✊ Fist',
        action: 'Clear entire canvas',
        description: 'Make a closed fist to clear all strokes from the canvas.',
      },
    ],
    control: [
      {
        gesture: '✌️ Two Fingers',
        action: 'Move stroke',
        visual: 'Blue crosshair + glow',
        description: 'Point index and middle fingers to move the nearest stroke.',
      },
      {
        gesture: '🤏 Pinch & Spread',
        action: 'Scale stroke',
        visual: 'Concentric rings + %',
        description: 'Pinch to scale down, spread to scale up.',
      },
      {
        gesture: '🖐️ Open Palm',
        action: 'Rotate stroke',
        visual: 'Orange arc + snap points',
        description: 'Open your palm and rotate to spin the nearest stroke.',
      },
    ],
  };

  return (
    <div className="gesture-guide-overlay" onClick={onClose}>
      <div className="gesture-guide" onClick={(e) => e.stopPropagation()}>
        <div className="guide-header">
          <h1>✨ Gesture Manual</h1>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="guide-tabs">
          <button
            className={`tab ${selectedHand === 'drawing' ? 'active' : ''}`}
            onClick={() => setSelectedHand('drawing')}
          >
            ✍️ Drawing Hand
          </button>
          <button
            className={`tab ${selectedHand === 'control' ? 'active' : ''}`}
            onClick={() => setSelectedHand('control')}
          >
            🖐️ Control Hand
          </button>
        </div>

        <div className="guide-content">
          <div className="gestures-list">
            {gestures[selectedHand].map((item, index) => (
              <div key={index} className="gesture-card">
                <div className="gesture-header">
                  <span className="gesture-icon">{item.gesture}</span>
                  <span className="gesture-action">{item.action}</span>
                </div>
                <p className="gesture-description">{item.description}</p>
                {item.visual && <p className="gesture-visual">Visual: {item.visual}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="guide-footer">
          <p className="guide-tip">💡 Tip: The left window shows your hand position in real-time.</p>
        </div>
      </div>
    </div>
  );
}
