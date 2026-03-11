export const medievalKing = {
    id: 'medievalKing',
    name: 'Rei Voren',
    spriteBasePath: './Characters/Medieval King Pack 2/Sprites',
    scale: { x: 2.5, y: 2.5 },
    offset: { x: 174, y: 112 },
    stats: {
        health: 116,
        moveSpeed: 4.1,
        jumpVelocity: -18,
        weight: 1.2
    },
    attacks: {
        attack1: {
            damage: 21,
            knockback: { x: 4, y: -2 },
            hitFrames: { start: 1, end: 3 },
            attackBox: { offset: { x: 100, y: 50 }, width: 150, height: 55 },
            cooldown: 0
        },
        attack2: {
            damage: 30,
            knockback: { x: 6, y: -4 },
            hitFrames: { start: 1, end: 3 },
            attackBox: { offset: { x: 90, y: 30 }, width: 170, height: 65 },
            cooldown: 250
        }
    },
    sprites: {
        idle: { src: 'Idle.png', framesMax: 8 },
        run: { src: 'Run.png', framesMax: 8 },
        jump: { src: 'Jump.png', framesMax: 2 },
        fall: { src: 'Fall.png', framesMax: 2 },
        attack1: { src: 'Attack1.png', framesMax: 4 },
        attack2: { src: 'Attack2.png', framesMax: 4 },
        takeHit: { src: 'Take Hit.png', framesMax: 4 },
        death: { src: 'Death.png', framesMax: 6 }
    },
    collisionBox: { width: 50, height: 150 }
};
