export const fantasyWarrior = {
    id: 'fantasyWarrior',
    name: 'Fantasy Warrior',
    spriteBasePath: './Characters/Fantasy Warrior/Sprites',
    scale: { x: 2.5, y: 2.5 },
    offset: { x: 190, y: 102 },
    stats: {
        health: 110,
        moveSpeed: 4.8,
        jumpVelocity: -19,
        weight: 1.1
    },
    attacks: {
        attack1: {
            damage: 18,
            knockback: { x: 3, y: -2 },
            hitFrames: { start: 2, end: 4 },
            attackBox: { offset: { x: 90, y: 50 }, width: 140, height: 50 },
            cooldown: 0
        },
        attack2: {
            damage: 28,
            knockback: { x: 5, y: -3 },
            hitFrames: { start: 2, end: 4 },
            attackBox: { offset: { x: 80, y: 30 }, width: 160, height: 60 },
            cooldown: 200
        }
    },
    sprites: {
        idle: { src: 'Idle.png', framesMax: 10 },
        run: { src: 'Run.png', framesMax: 8 },
        jump: { src: 'Jump.png', framesMax: 3 },
        fall: { src: 'Fall.png', framesMax: 3 },
        attack1: { src: 'Attack1.png', framesMax: 7 },
        attack2: { src: 'Attack2.png', framesMax: 7 },
        takeHit: { src: 'Take hit.png', framesMax: 3 },
        death: { src: 'Death.png', framesMax: 7 }
    },
    collisionBox: { width: 50, height: 150 }
};
