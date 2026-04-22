/**
 * Neon Color Palette
 */

export const NEON_COLORS = [
  '#00f0ff', // Cyan
  '#b700ff', // Purple
  '#ff006e', // Pink
  '#00ff88', // Green
  '#ff6b00', // Orange
  '#ffbe0b', // Yellow
  '#3a86ff', // Blue
  '#ff006e', // Red
];

export const COLOR_NAMES = {
  '#00f0ff': 'Cyan',
  '#b700ff': 'Purple',
  '#ff006e': 'Pink',
  '#00ff88': 'Green',
  '#ff6b00': 'Orange',
  '#ffbe0b': 'Yellow',
  '#3a86ff': 'Blue',
  '#ff006e': 'Red',
};

/**
 * Get next color in the palette
 */
export function getNextColor(currentColorIndex) {
  return (currentColorIndex + 1) % NEON_COLORS.length;
}

/**
 * Get random neon color
 */
export function getRandomNeonColor() {
  return NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
}

export default NEON_COLORS;
