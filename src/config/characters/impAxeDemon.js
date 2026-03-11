export const impAxeDemon = {
    id: 'impAxeDemon',
    name: 'Rhaz',
    spriteBasePath: './Characters/imp_axe_demon/demon_axe_red/generated',
    scale: { x: 2.7, y: 2.7 },
    offset: { x: 98, y: 43 },
    stats: {
        health: 82,
        moveSpeed: 6.0,
        jumpVelocity: -22,
        weight: 0.75
    },
    attacks: {
        attack1: {
            damage: 14,
            knockback: { x: 2, y: -2 },
            hitFrames: { start: 2, end: 3 },
            attackBox: { offset: { x: 58, y: 52 }, width: 110, height: 38 },
            cooldown: 0
        },
        attack2: {
            damage: 21,
            knockback: { x: 4, y: -3 },
            hitFrames: { start: 2, end: 4 },
            attackBox: { offset: { x: 52, y: 36 }, width: 130, height: 48 },
            cooldown: 180
        }
    },
    sprites: {
        idle: { src: 'Idle.png', framesMax: 6 },
        run: { src: 'Run.png', framesMax: 6 },
        jump: { src: 'Jump.png', framesMax: 5 },
        fall: { src: 'Fall.png', framesMax: 5 },
        attack1: { src: 'Attack1.png', framesMax: 6 },
        attack2: { src: 'Attack2.png', framesMax: 6 },
        takeHit: { src: 'Hit.png', framesMax: 3 },
        death: { src: 'Death.png', framesMax: 4 }
    },
    collisionBox: { width: 50, height: 150 }
};
