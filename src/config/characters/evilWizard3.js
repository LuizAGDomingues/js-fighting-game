export const evilWizard3 = {
    id: 'evilWizard3',
    name: 'Morvaine',
    spriteBasePath: './images/evilWizard3',
    scale: { x: 2.5, y: 2.5 },
    offset: { x: 160, y: 90 },
    stats: {
        health: 84,
        moveSpeed: 4.2,
        jumpVelocity: -20,
        weight: 0.8
    },
    attacks: {
        attack1: {
            damage: 0,
            knockback: { x: 0, y: 0 },
            hitFrames: { start: 99, end: 99 },
            attackBox: { offset: { x: 0, y: 0 }, width: 1, height: 1 },
            cooldown: 400
        },
        attack2: {
            damage: 0,
            knockback: { x: 0, y: 0 },
            hitFrames: { start: 99, end: 99 },
            attackBox: { offset: { x: 0, y: 0 }, width: 1, height: 1 },
            cooldown: 700
        }
    },
    sprites: {
        idle:    { src: 'Idle.png',    framesMax: 10 },
        run:     { src: 'Walk.png',    framesMax: 8 },
        jump:    { src: 'Jump.png',    framesMax: 3 },
        fall:    { src: 'Fall.png',    framesMax: 3 },
        attack1: { src: 'Attack.png',  framesMax: 13 },
        attack2: { src: 'Attack.png',  framesMax: 13 },
        takeHit: { src: 'Get hit.png', framesMax: 3 },
        death:   { src: 'Death.png',   framesMax: 19 }
    },
    projectile: {
        moveSprite:    { src: 'Projectile/Moving.png',  framesMax: 4 },
        explodeSprite: { src: 'Projectile/Explode.png', framesMax: 5 },
        speed: 6.5,
        damage: 21,
        knockback: { x: 6, y: -3 },
        spawnFrame: 8,
        spawnOffset: { x: 240, y: 70 },
        scale: { x: 2.5, y: 2.5 },
        collisionBox: { width: 30, height: 30 }
    },
    collisionBox: { width: 50, height: 150 }
};

