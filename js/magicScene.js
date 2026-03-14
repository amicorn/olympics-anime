// Three.js rendering engine for the magic effects, including particle system and 3D objects. It also handles the animation loop and updates based on the current technique.

import { CONFIG, GLOBAL } from './state.js';
import { getPatternData } from './patterns.js';

export class MagicScene {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.targetPositions = new Float32Array(CONFIG.COUNT * 3);
        this.targetColors = new Float32Array(CONFIG.COUNT * 3);
        this.velocities = new Float32Array(CONFIG.COUNT * 3);
        this.init();
    }

    init() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 100;

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);

        this.setupObjects();
        this.setupParticles();
    }

    setupObjects() {
        // Domain Sphere
        const sphereGeo = new THREE.SphereGeometry(15, 32, 32);
        this.domainSphere = new THREE.Group();
        this.domainSphere.add(new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({ color: 0x0066ff, transparent: true, opacity: 0.3 })));
        this.domainSphere.add(new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.5 })));
        this.domainSphere.visible = false;
        this.scene.add(this.domainSphere);

        // Dog Prism
        const prismGeo = new THREE.CylinderGeometry(12, 12, 20, 3);
        this.dogPrism = new THREE.Group();
        this.dogPrism.add(new THREE.Mesh(prismGeo, new THREE.MeshBasicMaterial({ color: 0xFF6600, transparent: true, opacity: 0.5 })));
        this.dogPrism.add(new THREE.Mesh(prismGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })));
        this.dogPrism.visible = false;
        this.scene.add(this.dogPrism);
    }

    setupParticles() {
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(CONFIG.COUNT * 3);
        const col = new Float32Array(CONFIG.COUNT * 3);

        for (let i = 0; i < CONFIG.COUNT; i++) {
            pos[i*3] = (Math.random()-0.5) * 300;
            pos[i*3+1] = (Math.random()-0.5) * 300;
            pos[i*3+2] = (Math.random()-0.5) * 300;
            this.resetVelocity(i);
        }

        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
        this.particles = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.7, vertexColors: true, blending: THREE.AdditiveBlending, transparent: true }));
        this.scene.add(this.particles);
    }

    resetVelocity(i) {
        this.velocities[i*3] = (Math.random() - 0.5) * 2;
        this.velocities[i*3+1] = (Math.random() - 0.5) * 2;
        this.velocities[i*3+2] = (Math.random() - 0.5) * 2;
    }

    triggerExplosion() {
        const pos = this.particles.geometry.attributes.position.array;
        for(let i=0; i<CONFIG.COUNT; i++) {
            const idx = i * 3;
            this.velocities[idx] = (pos[idx] - GLOBAL.handPos.x) * (Math.random() * 0.5);
            this.velocities[idx+1] = (pos[idx+1] - GLOBAL.handPos.y) * (Math.random() * 0.5);
            this.velocities[idx+2] = (pos[idx+2]) * (Math.random() * 0.5);
        }
    }

    updateTechnique(type) {
        if (GLOBAL.currentTech === type) return;
        if (GLOBAL.currentTech !== 'neutral' && type === 'neutral') this.triggerExplosion();
        
        GLOBAL.currentTech = type;
        this.domainSphere.visible = (type === 'gojo');
        this.dogPrism.visible = (type === 'kon');

        for(let i=0; i<CONFIG.COUNT; i++) {
            const data = getPatternData(type, i, GLOBAL.handPos);
            this.targetPositions[i*3] = data.pos[0];
            this.targetPositions[i*3+1] = data.pos[1];
            this.targetPositions[i*3+2] = data.pos[2];
            this.targetColors[i*3] = data.col[0];
            this.targetColors[i*3+1] = data.col[1];
            this.targetColors[i*3+2] = data.col[2];
        }
    }

    render() {
        GLOBAL.time += 0.05;
        this.domainSphere.position.set(GLOBAL.handPos.x, GLOBAL.handPos.y, 0);
        this.domainSphere.rotation.y += 0.01;
        this.dogPrism.position.set(GLOBAL.handPos.x, GLOBAL.handPos.y, 0);
        this.dogPrism.rotation.x += 0.02;

        const pos = this.particles.geometry.attributes.position.array;
        const col = this.particles.geometry.attributes.color.array;
        GLOBAL.heartBeatScale += (1.0 - GLOBAL.heartBeatScale) * 0.1;

        for (let i = 0; i < CONFIG.COUNT; i++) {
            const idx = i * 3;
            if (GLOBAL.currentTech === 'kon') {
                const angle = (i / CONFIG.COUNT) * Math.PI * 2 + GLOBAL.time;
                const h = (Math.sin(i) * 15);
                const rad = 15 + Math.cos(GLOBAL.time + i) * 5;
                pos[idx] += (GLOBAL.handPos.x + Math.cos(angle) * rad - pos[idx]) * 0.15;
                pos[idx+1] += (GLOBAL.handPos.y + h - pos[idx+1]) * 0.15;
                pos[idx+2] += (Math.sin(angle) * rad - pos[idx+2]) * 0.15;
            } else if (GLOBAL.currentTech === 'rune' || GLOBAL.currentTech === 'fangirl') {
                const s = GLOBAL.currentTech === 'fangirl' ? GLOBAL.heartBeatScale : 1.0;
                pos[idx] += (GLOBAL.handPos.x + (this.targetPositions[idx] * s) - pos[idx]) * 0.12;
                pos[idx+1] += (GLOBAL.handPos.y + (this.targetPositions[idx+1] * s) - pos[idx+1]) * 0.12;
                pos[idx+2] += (this.targetPositions[idx+2] - pos[idx+2]) * 0.12;
            } else {
                let lerp = (GLOBAL.currentTech === 'gojo') ? 0.12 : 0.01;
                if (GLOBAL.currentTech === 'neutral') {
                    pos[idx] += this.velocities[idx]; pos[idx+1] += this.velocities[idx+1]; pos[idx+2] += this.velocities[idx+2];
                    this.velocities[idx] *= 0.96; this.velocities[idx+1] *= 0.96; this.velocities[idx+2] *= 0.96;
                }
                pos[idx] += (this.targetPositions[idx] - pos[idx]) * lerp;
                pos[idx+1] += (this.targetPositions[idx+1] - pos[idx+1]) * lerp;
                pos[idx+2] += (this.targetPositions[idx+2] - pos[idx+2]) * lerp;
            }
            col[idx] += (this.targetColors[idx] - col[idx]) * 0.1;
            col[idx+1] += (this.targetColors[idx+1] - col[idx+1]) * 0.1;
            col[idx+2] += (this.targetColors[idx+2] - col[idx+2]) * 0.1;
        }
        this.particles.geometry.attributes.position.needsUpdate = true;
        this.particles.geometry.attributes.color.needsUpdate = true;
        this.renderer.render(this.scene, this.camera);
    }
}