export const kobold = {
    id: 'kobold',
    name: 'Grix',
    spriteBasePath: './images/kobold',
    scale: { x: 2.5, y: 2.5 },
    offset: { x: 160, y: 90 },
    stats: {
        health: 90,
        moveSpeed: 5.8,
        jumpVelocity: -20,
        weight: 0.9
    },
    attacks: {
        attack1: {
            damage: 18,
            knockback: { x: 3, y: -2 },
            hitFrames: { start: 2, end: 4 },
            attackBox: { offset: { x: 70, y: 50 }, width: 120, height: 50 },
            cooldown: 0
        },
        attack2: {
            damage: 18,
            knockback: { x: 3, y: -2 },
            hitFrames: { start: 2, end: 4 },
            attackBox: { offset: { x: 70, y: 50 }, width: 120, height: 50 },
            cooldown: 150
        }
    },
    sprites: {
        idle:    { src: 'IDLE.png',     framesMax: 6 },
        run:     { src: 'RUN.png',      framesMax: 8 },
        jump:    { src: 'IDLE.png',     framesMax: 6 },
        fall:    { src: 'IDLE.png',     framesMax: 6 },
        attack1: { src: 'ATTACK 1.png', framesMax: 5 },
        attack2: { src: 'ATTACK 1.png', framesMax: 5 },
        takeHit: { src: 'IDLE.png',     framesMax: 6 },
        death:   { src: 'ATTACK 1.png', framesMax: 5 }
    },
    collisionBox: { width: 50, height: 150 }
};
