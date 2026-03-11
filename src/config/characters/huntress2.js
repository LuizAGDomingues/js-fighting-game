export const huntress2 = {
    id: 'huntress2',
    name: 'Huntress II',
    spriteBasePath: './images/huntress2',
    scale: { x: 2.5, y: 2.5 },
    offset: { x: 100, y: 15 },
    stats: {
        health: 85,
        moveSpeed: 5.5,
        jumpVelocity: -21,
        weight: 0.8
    },
    attacks: {
        attack1: {
            damage: 0,
            knockback: { x: 0, y: 0 },
            hitFrames: { start: 99, end: 99 },
            attackBox: { offset: { x: 0, y: 0 }, width: 1, height: 1 },
            cooldown: 500
        },
        attack2: {
            damage: 0,
            knockback: { x: 0, y: 0 },
            hitFrames: { start: 99, end: 99 },
            attackBox: { offset: { x: 0, y: 0 }, width: 1, height: 1 },
            cooldown: 800
        }
    },
    sprites: {
        idle:    { src: 'Idle.png',    framesMax: 10 },
        run:     { src: 'Run.png',     framesMax: 8 },
        jump:    { src: 'Jump.png',    framesMax: 2 },
        fall:    { src: 'Fall.png',    framesMax: 2 },
        attack1: { src: 'Attack.png',  framesMax: 6 },
        attack2: { src: 'Attack.png',  framesMax: 6 },
        takeHit: { src: 'Get Hit.png', framesMax: 3 },
        death:   { src: 'Death.png',   framesMax: 10 }
    },
    projectile: {
        moveSprite:    { src: 'Arrow/Move.png',   framesMax: 2 },
        explodeSprite: { src: 'Arrow/Static.png', framesMax: 1 },
        speed: 10,
        damage: 18,
        knockback: { x: 4, y: -1 },
        spawnFrame: 3,
        spawnOffset: { x: 90, y: 54 },
        scale: { x: 3.0, y: 3.0 },
        collisionBox: { width: 20, height: 8 }
    },
    collisionBox: { width: 50, height: 150 },
    shieldBox: { x: -22, y: -6, width: 96, height: 145 }
};
