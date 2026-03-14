// config and shared variables

export const CONFIG = {
    COUNT: 30000,
    FINGER_MAP: [
        { name: 'THUMB', ids: [0, 1, 2, 3, 4], color: '#00FF00' },
        { name: 'INDEX', ids: [0, 5, 6, 7, 8], color: '#00FFFF' },
        { name: 'MIDDLE', ids: [0, 9, 10, 11, 12], color: '#FF00FF' },
        { name: 'RING', ids: [0, 13, 14, 15, 16], color: '#FFFF00' },
        { name: 'PINKY', ids: [0, 17, 18, 19, 20], color: '#FF0000' }
    ],
    TECHNIQUES: {
        gojo: { name: "五条悟 GOJO INFINITE VOID", color: "#00d4ff" },
        kon: { name: "コン (KON) CHAINSAW MAN", color: "#ff6600" },
        rune: { name: "魔法少女まどか☆マギカ MADOKA MAGICA", color: "#ff0077" },
        fangirl: { name: "ドキドキ DOKI DOKI FANGIRL", color: "#ff3366" },
        neutral: { name: "GATHERING MANA...", color: "#d4af37" }
    }
};

export const GLOBAL = {
    handPos: { x: 0, y: 0, z: 0 },
    currentTech: 'neutral',
    heartBeatScale: 1.0,
    time: 0
};