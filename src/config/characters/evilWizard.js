export const evilWizard = {
    id: 'evilWizard',
    name: 'Evil Wizard',
    spriteBasePath: './Characters/EVil Wizard 2/Sprites',
    scale: { x: 2.5, y: 2.5 },
    offset: { x: 315, y: 268 },
    stats: {
        health: 90,
        moveSpeed: 4.5,
        jumpVelocity: -19,
        weight: 0.85
    },
    attacks: {
        attack1: {
            damage: 22,
            knockback: { x: 4, y: -3 },
            hitFrames: { start: 3, end: 5 },
            attackBox: { offset: { x: 100, y: 40 }, width: 150, height: 60 },
            cooldown: 0
        },
        attack2: {
            damage: 32,
            knockback: { x: 6, y: -4 },
            hitFrames: { start: 3, end: 5 },
            attackBox: { offset: { x: 90, y: 20 }, width: 170, height: 70 },
            cooldown: 250
        }
    },
    sprites: {
        idle: { src: 'Idle.png', framesMax: 8 },
        run: { src: 'Run.png', framesMax: 8 },
        jump: { src: 'Jump.png', framesMax: 2 },
        fall: { src: 'Fall.png', framesMax: 2 },
        attack1: { src: 'Attack1.png', framesMax: 8 },
        attack2: { src: 'Attack2.png', framesMax: 8 },
        takeHit: { src: 'Take hit.png', framesMax: 3 },
        death: { src: 'Death.png', framesMax: 7 }
    },
    collisionBox: { width: 50, height: 150 },
    shieldBox: { x: -10, y: 0, width: 70, height: 150 }
};
