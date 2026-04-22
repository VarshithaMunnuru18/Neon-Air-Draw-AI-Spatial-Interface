/**
 * WebGL Canvas Renderer
 * High-performance rendering engine optimized for 60FPS
 */

export class CanvasRenderer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    // Background gradient
    this.bgGradient = null;
  }

  /**
   * Initialize canvas and context
   */
  initialize() {
    this.updateCanvasSize();
    this.setupBackgroundGradient();
  }

  /**
   * Update canvas size on window resize
   */
  updateCanvasSize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  /**
   * Create background gradient
   */
  setupBackgroundGradient() {
    this.bgGradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
    this.bgGradient.addColorStop(0, 'rgba(10, 14, 39, 1)');
    this.bgGradient.addColorStop(0.5, 'rgba(22, 33, 62, 1)');
    this.bgGradient.addColorStop(1, 'rgba(10, 14, 39, 1)');
  }

  /**
   * Clear canvas with background
   */
  clear() {
    this.ctx.fillStyle = this.bgGradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * Draw a single stroke
   */
  drawStroke(stroke, lineWidth = 2) {
    if (stroke.points.length === 0) return;

    const points = stroke.getTransformedPoints(this.width, this.height);

    this.ctx.strokeStyle = stroke.color;
    this.ctx.lineWidth = lineWidth * stroke.transform.scale;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // Add glow effect
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = stroke.color;

    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }

    this.ctx.stroke();
    this.ctx.shadowBlur = 0;
  }

  /**
   * Draw all strokes with optional selection highlight
   */
  drawAllStrokes(strokes, selectedStroke = null) {
    strokes.forEach((stroke) => {
      this.drawStroke(stroke);

      // Add selection outline
      if (stroke === selectedStroke) {
        this.drawStrokeOutline(stroke);
      }
    });
  }

  /**
   * Draw selection outline for a stroke
   */
  drawStrokeOutline(stroke) {
    if (stroke.points.length === 0) return;

    const points = stroke.getTransformedPoints(this.width, this.height);
    const padding = 10;

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    points.forEach((p) => {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    });

    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([5, 5]);
    this.ctx.strokeRect(minX - padding, minY - padding, maxX - minX + padding * 2, maxY - minY + padding * 2);
    this.ctx.setLineDash([]);
  }

  /**
   * Draw crosshair guide for movement
   */
  drawCrosshair(x, y, size = 40) {
    const crosshairColor = 'rgba(0, 240, 255, 0.7)';
    this.ctx.strokeStyle = crosshairColor;
    this.ctx.lineWidth = 2;

    // Horizontal line
    this.ctx.beginPath();
    this.ctx.moveTo(x - size, y);
    this.ctx.lineTo(x + size, y);
    this.ctx.stroke();

    // Vertical line
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - size);
    this.ctx.lineTo(x, y + size);
    this.ctx.stroke();

    // Center circle
    this.ctx.strokeStyle = crosshairColor;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 5, 0, Math.PI * 2);
    this.ctx.stroke();

    // Glow
    this.ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
    this.ctx.beginPath();
    this.ctx.arc(x, y, size, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Draw scale rings showing current scale percentage
   */
  drawScaleRings(x, y, scale, maxScale = 5) {
    const percentage = Math.round((scale / maxScale) * 100);
    const ringColor = 'rgba(0, 240, 255, 0.6)';

    // Draw concentric rings
    for (let i = 1; i <= 3; i++) {
      this.ctx.strokeStyle = `rgba(0, 240, 255, ${0.6 - i * 0.15})`;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 30 * i, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    // Draw percentage text
    this.ctx.fillStyle = ringColor;
    this.ctx.font = 'bold 16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(`${percentage}%`, x, y);

    // Glow effect
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = 'rgba(0, 240, 255, 0.8)';
    this.ctx.fillText(`${percentage}%`, x, y);
    this.ctx.shadowBlur = 0;
  }

  /**
   * Draw rotation arc with snap points
   */
  drawRotationArc(x, y, rotation, radius = 50) {
    const arcColor = 'rgba(255, 107, 0, 0.7)';

    // Draw outer arc
    this.ctx.strokeStyle = arcColor;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.stroke();

    // Draw rotation indicator
    const rotX = x + Math.cos(rotation) * radius;
    const rotY = y + Math.sin(rotation) * radius;
    this.ctx.fillStyle = arcColor;
    this.ctx.beginPath();
    this.ctx.arc(rotX, rotY, 6, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw snap points (45° increments)
    this.ctx.fillStyle = 'rgba(255, 107, 0, 0.3)';
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const snapX = x + Math.cos(angle) * radius;
      const snapY = y + Math.sin(angle) * radius;
      this.ctx.beginPath();
      this.ctx.arc(snapX, snapY, 4, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  /**
   * Draw eraser cursor
   */
  drawEraserCursor(x, y, radius = 15) {
    this.ctx.strokeStyle = 'rgba(255, 0, 110, 0.7)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.stroke();

    // Crosshair
    this.ctx.beginPath();
    this.ctx.moveTo(x - 8, y);
    this.ctx.lineTo(x + 8, y);
    this.ctx.moveTo(x, y - 8);
    this.ctx.lineTo(x, y + 8);
    this.ctx.stroke();
  }

  /**
   * Render HUD with FPS and gesture info
   */
  drawHUD(fps, gestureInfo) {
    const hudColor = 'rgba(0, 240, 255, 0.8)';
    this.ctx.fillStyle = hudColor;
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';

    let y = 10;
    const x = 10;

    this.ctx.fillText(`FPS: ${Math.round(fps)}`, x, y);
    y += 16;

    if (gestureInfo.rightHand) {
      this.ctx.fillStyle = 'rgba(0, 240, 255, 0.6)';
      this.ctx.fillText(`Right: ${gestureInfo.rightHand.gesture}`, x, y);
      y += 14;
    }

    if (gestureInfo.leftHand) {
      this.ctx.fillStyle = 'rgba(255, 107, 0, 0.6)';
      this.ctx.fillText(`Left: ${gestureInfo.leftHand.gesture}`, x, y);
      y += 14;
    }

    this.ctx.fillStyle = hudColor;
    this.ctx.fillText(`Strokes: ${gestureInfo.strokeCount || 0}`, x, y);
  }
}

export default CanvasRenderer;
