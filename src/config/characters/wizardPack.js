export const wizardPack = {
    id: 'wizardPack',
    name: 'Wizard',
    spriteBasePath: './images/wizardPack',
    scale: { x: 1.8, y: 1.8 },
    offset: { x: 173, y: 102 },
    spriteFacingRight: true,
    stats: {
        health: 90,
        moveSpeed: 4.2,
        jumpVelocity: -19,
        weight: 0.85
    },
    attacks: {
        attack1: {
            damage: 22,
            knockback: { x: 4, y: -3 },
            hitFrames: { start: 3, end: 5 },
            attackBox: { offset: { x: 80, y: 40 }, width: 130, height: 70 },
            cooldown: 0
        },
        attack2: {
            damage: 32,
            knockback: { x: 6, y: -4 },
            hitFrames: { start: 3, end: 6 },
            attackBox: { offset: { x: 90, y: 20 }, width: 150, height: 80 },
            cooldown: 300
        }
    },
    sprites: {
        idle:    { src: 'Idle.png',    framesMax: 6 },
        run:     { src: 'Run.png',     framesMax: 8 },
        jump:    { src: 'Jump.png',    framesMax: 2 },
        fall:    { src: 'Fall.png',    framesMax: 2 },
        attack1: { src: 'Attack1.png', framesMax: 8 },
        attack2: { src: 'Attack2.png', framesMax: 8 },
        takeHit: { src: 'Hit.png',     framesMax: 4 },
        death:   { src: 'Death.png',   framesMax: 7 }
    },
    collisionBox: { width: 50, height: 150 },
    shieldBox: { x: -22, y: -12, width: 96, height: 168 }
};
