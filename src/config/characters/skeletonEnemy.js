export const skeletonEnemy = {
    id: 'skeletonEnemy',
    name: 'Morrow',
    spriteBasePath: './Characters/Skeleton enemy/generated',
    scale: { x: 3.3, y: 3.3 },
    offset: { x: 50, y: 5 },
    stats: {
        health: 96,
        moveSpeed: 4.8,
        jumpVelocity: -19,
        weight: 0.95
    },
    attacks: {
        attack1: {
            damage: 16,
            knockback: { x: 3, y: -2 },
            hitFrames: { start: 4, end: 8 },
            attackBox: { offset: { x: 60, y: 50 }, width: 118, height: 42 },
            cooldown: 0
        },
        attack2: {
            damage: 24,
            knockback: { x: 5, y: -3 },
            hitFrames: { start: 5, end: 10 },
            attackBox: { offset: { x: 55, y: 34 }, width: 136, height: 54 },
            cooldown: 220
        }
    },
    sprites: {
        idle: { src: 'Idle.png', framesMax: 4 },
        run: { src: 'Walk.png', framesMax: 12 },
        jump: { src: 'Idle.png', framesMax: 4 },
        fall: { src: 'Idle.png', framesMax: 4 },
        attack1: { src: 'Attack.png', framesMax: 13 },
        attack2: { src: 'Attack.png', framesMax: 13 },
        takeHit: { src: 'Hit.png', framesMax: 3 },
        death: { src: 'Death.png', framesMax: 13 }
    },
    collisionBox: { width: 50, height: 150 }
};
