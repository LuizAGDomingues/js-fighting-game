export const samurai = {
    id: 'samurai',
    name: 'Samurai',
    spriteBasePath: './images/samurai',
    scale: { x: 5.0, y: 5.0 },
    offset: { x: 215, y: 330 },
    stats: {
        health: 95,
        moveSpeed: 5.5,
        jumpVelocity: -20,
        weight: 0.95
    },
    attacks: {
        attack1: {
            damage: 22,
            knockback: { x: 4, y: -2 },
            hitFrames: { start: 3, end: 5 },
            attackBox: { offset: { x: 80, y: 50 }, width: 130, height: 50 },
            cooldown: 0
        },
        attack2: {
            damage: 22,
            knockback: { x: 4, y: -2 },
            hitFrames: { start: 3, end: 5 },
            attackBox: { offset: { x: 80, y: 50 }, width: 130, height: 50 },
            cooldown: 200
        }
    },
    sprites: {
        idle:    { src: 'IDLE.png',     framesMax: 10 },
        run:     { src: 'RUN.png',      framesMax: 16 },
        jump:    { src: 'IDLE.png',     framesMax: 10 },
        fall:    { src: 'IDLE.png',     framesMax: 10 },
        attack1: { src: 'ATTACK 1.png', framesMax: 7 },
        attack2: { src: 'ATTACK 1.png', framesMax: 7 },
        takeHit: { src: 'HURT.png',     framesMax: 3 },
        death:   { src: 'HURT.png',     framesMax: 3 }
    },
    collisionBox: { width: 50, height: 150 }
};
