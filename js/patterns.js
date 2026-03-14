// mathematical definitions for the magic effects :)

import { CONFIG } from './state.js';

export function getPatternData(type, i, handPos) {
    const idx = i * 3;
    let res = { pos: [0,0,0], col: [0,0,0] };

    if (type === 'gojo') {
        const phi = Math.acos(-1 + (2 * i) / CONFIG.COUNT);
        const theta = Math.sqrt(CONFIG.COUNT * Math.PI) * phi;
        const radius = 14 + Math.random() * 2;
        res.pos = [
            handPos.x + radius * Math.cos(theta) * Math.sin(phi),
            handPos.y + radius * Math.sin(theta) * Math.sin(phi),
            radius * Math.cos(phi)
        ];
        res.col = [0, 0.5, 1];
    } else if (type === 'kon') {
        res.col = [1.0, 0.4, 0.0];
    } else if (type === 'rune') {
        if (i < CONFIG.COUNT * 0.4) {
            const angle = (i / (CONFIG.COUNT * 0.4)) * Math.PI * 2;
            res.pos = [Math.cos(angle) * 30, 25, Math.sin(angle) * 30];
            res.col = [1.0, 0.8, 0.2];
        } else {
            const offsets = [{x:18, z:18}, {x:-18, z:18}, {x:18, z:-18}, {x:-18, z:-18}];
            const p = offsets[i % 4];
            res.pos = [p.x + (Math.random()-0.5)*4, (Math.random()-0.5)*-70, p.z + (Math.random()-0.5)*4];
            res.col = [1.0, 0.1, 0.5];
        }
    } else if (type === 'fangirl') {
        const t = (i / CONFIG.COUNT) * Math.PI * 2;
        res.pos = [
            (16 * Math.pow(Math.sin(t), 3)) * 1.8,
            (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) * 1.8,
            (Math.random() - 0.5) * 10
        ];
        res.col = [1.0, 0.1, 0.3];
    } else {
        const angle = (i / CONFIG.COUNT) * Math.PI * 2;
        const rad = 20 + Math.random() * 10;
        res.pos = [Math.cos(angle) * rad, Math.sin(angle) * rad, (Math.random()-0.5)*20];
        res.col = [0.8, 0.7, 0.3];
    }
    return res;
}