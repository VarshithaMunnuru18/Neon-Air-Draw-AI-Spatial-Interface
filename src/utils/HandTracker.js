import { Hands } from '@mediapipe/hands';

export class HandTracker {
  constructor() {
    this.hands = null;
    this.videoElement = null;
    this.canvasElement = null;
    this.results = null;
    this.isInitialized = false;
    this.isRunning = false;
  }

  async initialize(videoElement, canvasElement, onResults) {
    try {
      this.videoElement = videoElement;
      this.canvasElement = canvasElement;

      this.hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      this.hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.hands.onResults((results) => {
        this.results = results;
        onResults(results);
      });

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      });

      this.videoElement.srcObject = stream;

      // Wait for video to load
      await new Promise((resolve) => {
        this.videoElement.onloadedmetadata = () => {
          this.videoElement.play();
          resolve();
        };
      });

      this.isInitialized = true;
      this.start();
    } catch (error) {
      console.error('Failed to initialize hand tracker:', error);
      throw error;
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.processFrame();
  }

  processFrame = async () => {
    if (!this.isRunning) return;

    if (this.hands && this.videoElement) {
      try {
        await this.hands.send({ image: this.videoElement });
      } catch (error) {
        console.error('Hand tracking error:', error);
      }
    }

    requestAnimationFrame(this.processFrame);
  };

  getResults() {
    return this.results;
  }

  dispose() {
    this.isRunning = false;
    if (this.videoElement && this.videoElement.srcObject) {
      this.videoElement.srcObject.getTracks().forEach((track) => track.stop());
    }
  }
}

export default HandTracker;
