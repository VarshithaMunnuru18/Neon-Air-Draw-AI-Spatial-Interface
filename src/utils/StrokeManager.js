/**
 * Stroke Management System
 * Handles stroke creation, transformation, and rendering
 */

export class Stroke {
  constructor(id, color) {
    this.id = id;
    this.color = color;
    this.points = []; // Original points in normalized coordinates
    this.createdAt = Date.now();

    // Non-destructive transforms
    this.transform = {
      tx: 0,
      ty: 0,
      scale: 1,
      rotation: 0, // in radians
    };

    // Physics
    this.velocity = { x: 0, y: 0 };
    this.isMoving = false;
  }

  addPoint(x, y) {
    this.points.push({ x, y });
  }

  /**
   * Get transformed points for rendering
   */
  getTransformedPoints(canvasWidth, canvasHeight) {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    return this.points.map((point) => {
      let x = point.x;
      let y = point.y;

      // Apply scale
      x = (x - centerX) * this.transform.scale + centerX;
      y = (y - centerY) * this.transform.scale + centerY;

      // Apply rotation (around center)
      const cos = Math.cos(this.transform.rotation);
      const sin = Math.sin(this.transform.rotation);
      const rotX = (x - centerX) * cos - (y - centerY) * sin + centerX;
      const rotY = (x - centerX) * sin + (y - centerY) * cos + centerY;

      // Apply translation
      return {
        x: rotX + this.transform.tx,
        y: rotY + this.transform.ty,
      };
    });
  }

  /**
   * Apply transformation
   */
  applyTransform(tx = 0, ty = 0, scale = this.transform.scale, rotation = this.transform.rotation) {
    this.transform.tx += tx;
    this.transform.ty += ty;
    this.transform.scale = Math.max(0.1, Math.min(scale, 5)); // Clamp scale
    this.transform.rotation = rotation % (Math.PI * 2); // Wrap rotation
  }

  /**
   * Reset transforms to original state
   */
  resetTransform() {
    this.transform = {
      tx: 0,
      ty: 0,
      scale: 1,
      rotation: 0,
    };
  }

  /**
   * Set velocity for physics-based movement
   */
  setVelocity(vx, vy) {
    this.velocity = { x: vx, y: vy };
    this.isMoving = vx !== 0 || vy !== 0;
  }

  /**
   * Update with inertia decay
   */
  updatePhysics(deltaTime = 16, friction = 0.95) {
    if (!this.isMoving) return;

    this.velocity.x *= friction;
    this.velocity.y *= friction;

    this.transform.tx += this.velocity.x * (deltaTime / 1000);
    this.transform.ty += this.velocity.y * (deltaTime / 1000);

    // Stop if velocity is negligible
    if (Math.abs(this.velocity.x) < 0.01 && Math.abs(this.velocity.y) < 0.01) {
      this.isMoving = false;
      this.velocity = { x: 0, y: 0 };
    }
  }

  /**
   * Snap rotation to 45° increments
   */
  snapRotation() {
    const angle45 = Math.PI / 4;
    this.transform.rotation = Math.round(this.transform.rotation / angle45) * angle45;
  }
}

export class StrokeManager {
  constructor() {
    this.strokes = [];
    this.selectedStroke = null;
    this.nextId = 0;
  }

  /**
   * Create and add a new stroke
   */
  createStroke(color = '#00f0ff') {
    const stroke = new Stroke(this.nextId++, color);
    this.strokes.push(stroke);
    return stroke;
  }

  /**
   * Get all strokes
   */
  getAllStrokes() {
    return this.strokes;
  }

  /**
   * Find nearest stroke to a point
   */
  findNearestStroke(x, y, maxDistance = 0.1) {
    let nearest = null;
    let minDistance = maxDistance;

    this.strokes.forEach((stroke) => {
      stroke.points.forEach((point) => {
        const dx = point.x - x;
        const dy = point.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < minDistance) {
          minDistance = distance;
          nearest = stroke;
        }
      });
    });

    return nearest;
  }

  /**
   * Find stroke intersections with a path (for eraser)
   */
  findStrokesIntersectingPath(pathPoints, tolerance = 0.02) {
    const intersecting = [];

    this.strokes.forEach((stroke) => {
      stroke.points.forEach((point) => {
        // Check if point is near any path point
        const isNear = pathPoints.some((pathPoint) => {
          const dx = point.x - pathPoint.x;
          const dy = point.y - pathPoint.y;
          return Math.sqrt(dx * dx + dy * dy) < tolerance;
        });

        if (isNear && !intersecting.includes(stroke)) {
          intersecting.push(stroke);
        }
      });
    });

    return intersecting;
  }

  /**
   * Select a stroke
   */
  selectStroke(stroke) {
    this.selectedStroke = stroke;
  }

  /**
   * Clear all strokes
   */
  clearAllStrokes() {
    this.strokes = [];
    this.selectedStroke = null;
  }

  /**
   * Remove a specific stroke
   */
  removeStroke(stroke) {
    const index = this.strokes.indexOf(stroke);
    if (index > -1) {
      this.strokes.splice(index, 1);
    }
    if (this.selectedStroke === stroke) {
      this.selectedStroke = null;
    }
  }

  /**
   * Update all strokes with physics
   */
  updatePhysics(deltaTime = 16) {
    this.strokes.forEach((stroke) => stroke.updatePhysics(deltaTime));
  }
}

export default StrokeManager;
