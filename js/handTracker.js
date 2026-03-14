// MediaPipe logic and gesture recognifition for the hand tracking. Processes the results from MediaPipe and determines which technique is being performed based on the hand landmarks. It also updates the global state with the hand position and triggers the appropriate visual effects in the magic scene.

import { CONFIG, GLOBAL } from './state.js';

export class HandTracker {
    constructor(videoElement, canvasElement, onResults) {
        this.video = videoElement;
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.onResultsCallback = onResults;
        this.lastZ = 0;
        this.init();
    }

    init() {
        this.hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});
        this.hands.setOptions({ maxNumHands: 2, modelComplexity: 1, minDetectionConfidence: 0.6 });
        this.hands.onResults(this.processResults.bind(this));
    }

    processResults(results) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let detected = 'neutral';

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            let cx = 0, cy = 0, cz = 0;
            results.multiHandLandmarks.forEach(h => {
                cx += h[9].x; cy += h[9].y; cz += h[9].z;
                this.drawSkeleton(h);
            });

            const count = results.multiHandLandmarks.length;
            const avgZ = cz / count;
            GLOBAL.handPos.x = (cx / count - 0.5) * -150;
            GLOBAL.handPos.y = (0.5 - cy / count) * 100;

            if (count === 2) {
                const h1 = results.multiHandLandmarks[0];
                const h2 = results.multiHandLandmarks[1];
                if (Math.hypot(h1[4].x - h2[4].x, h1[4].y - h2[4].y) < 0.1 && Math.hypot(h1[8].x - h2[8].x, h1[8].y - h2[8].y) < 0.1) {
                    detected = 'fangirl';
                    let zVel = Math.abs(avgZ - this.lastZ);
                    if (zVel > 0.005) GLOBAL.heartBeatScale = 1.0 + (zVel * 40);
                } else if (Math.hypot(h1[9].x - h2[9].x, h1[9].y - h2[9].y) < 0.25) {
                    detected = 'rune';
                }
            } else {
                const h = results.multiHandLandmarks[0];
                const dIM = Math.hypot(h[8].x - h[12].x, h[8].y - h[12].y);
                const d1 = Math.hypot(h[12].x - h[4].x, h[12].y - h[4].y);
                const d2 = Math.hypot(h[16].x - h[4].x, h[16].y - h[4].y);
                if (dIM < 0.025 && h[12].y < h[10].y) detected = 'gojo';
                else if (d1 < 0.06 && d2 < 0.06 && h[8].y < h[6].y && h[20].y < h[18].y) detected = 'kon';
            }
            this.lastZ = avgZ;
        }
        this.onResultsCallback(detected);
    }

    drawSkeleton(landmarks) {
        CONFIG.FINGER_MAP.forEach(finger => {
            this.ctx.beginPath();
            this.ctx.strokeStyle = finger.color;
            this.ctx.lineWidth = 3;
            for (let i = 0; i < finger.ids.length - 1; i++) {
                const s = landmarks[finger.ids[i]];
                const e = landmarks[finger.ids[i+1]];
                this.ctx.moveTo(s.x * this.canvas.width, s.y * this.canvas.height);
                this.ctx.lineTo(e.x * this.canvas.width, e.y * this.canvas.height);
            }
            this.ctx.stroke();
        });
    }

    async send() {
        await this.hands.send({ image: this.video });
    }
}