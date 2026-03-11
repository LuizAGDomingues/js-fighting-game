export const huntress = {
    id: 'huntress',
    name: 'Sylvara',
    spriteBasePath: './Characters/Huntress/Sprites',
    scale: { x: 2.5, y: 2.5 },
    offset: { x: 168, y: 92 },
    stats: {
        health: 88,
        moveSpeed: 5.9,
        jumpVelocity: -21,
        weight: 0.8
    },
    attacks: {
        attack1: {
            damage: 15,
            knockback: { x: 2, y: -2 },
            hitFrames: { start: 2, end: 3 },
            attackBox: { offset: { x: 80, y: 50 }, width: 130, height: 50 },
            cooldown: 0
        },
        attack2: {
            damage: 22,
            knockback: { x: 4, y: -3 },
            hitFrames: { start: 2, end: 3 },
            attackBox: { offset: { x: 70, y: 30 }, width: 150, height: 60 },
            cooldown: 150
        }
    },
    sprites: {
        idle: { src: 'Idle.png', framesMax: 8 },
        run: { src: 'Run.png', framesMax: 8 },
        jump: { src: 'Jump.png', framesMax: 2 },
        fall: { src: 'Fall.png', framesMax: 2 },
        attack1: { src: 'Attack1.png', framesMax: 5 },
        attack2: { src: 'Attack2.png', framesMax: 5 },
        takeHit: { src: 'Take hit.png', framesMax: 3 },
        death: { src: 'Death.png', framesMax: 8 }
    },
    collisionBox: { width: 50, height: 150 }
};
