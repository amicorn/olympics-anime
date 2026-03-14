// application orchestrator that initializes the MagicScene and HandTracker, sets up the webcam feed, and manages the main animation loop. It also handles the communication between the hand tracking results and the visual effects in the scene, updating the UI accordingly.

import { MagicScene } from './magicScene.js';
import { HandTracker } from './handTracker.js';
import { CONFIG } from './state.js';

class App {
    constructor() {
        this.scene = new MagicScene('three-canvas');
        this.uiName = document.getElementById('technique-name');
        this.status = document.getElementById('status');
        
        this.tracker = new HandTracker(
            document.getElementById('webcam'),
            document.getElementById('skeleton-canvas'),
            (detected) => this.handleGesture(detected)
        );

        this.initCamera();
        this.animate();
    }

    handleGesture(type) {
        this.scene.updateTechnique(type);
        const tech = CONFIG.TECHNIQUES[type];
        this.uiName.innerText = tech.name;
        this.uiName.style.color = tech.color;
        this.status.textContent = type === 'neutral' ? "SENSING..." : "SYSTEM ACTIVE";
    }

    initCamera() {
        const video = document.getElementById('webcam');
        const camera = new Camera(video, {
            onFrame: async () => {
                this.tracker.canvas.width = video.videoWidth;
                this.tracker.canvas.height = video.videoHeight;
                await this.tracker.send();
            },
            width: 1280, height: 720
        });
        camera.start();
    }

    animate() {
        this.scene.render();
        requestAnimationFrame(() => this.animate());
    }
}

// Start the application
new App();