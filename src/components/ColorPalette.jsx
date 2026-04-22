import React from 'react';
import './ColorPalette.css';

export default function ColorPalette({ colors, currentColor, onColorChange }) {
  return (
    <div className="color-palette">
      {colors.map((color, index) => (
        <button
          key={color}
          className={`color-swatch ${index === currentColor ? 'active' : ''}`}
          style={{
            backgroundColor: color,
            boxShadow:
              index === currentColor ? `0 0 20px ${color}, inset 0 0 10px ${color}` : `0 0 10px ${color}`,
          }}
          onClick={() => onColorChange(index)}
          title={`Select color ${index + 1}`}
        />
      ))}
    </div>
  );
}
