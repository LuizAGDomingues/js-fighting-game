export const arcaneArcher = {
    id: 'arcaneArcher',
    name: 'Lyra',
    spriteBasePath: './Characters/Arcane archer/generated',
    scale: { x: 3.6, y: 3.6 },
    offset: { x: 129, y: 16 },
    stats: {
        health: 84,
        moveSpeed: 5.3,
        jumpVelocity: -20,
        weight: 0.8
    },
    attacks: {
        attack1: {
            damage: 0,
            knockback: { x: 0, y: 0 },
            hitFrames: { start: 99, end: 99 },
            attackBox: { offset: { x: 0, y: 0 }, width: 1, height: 1 },
            cooldown: 450
        },
        attack2: {
            damage: 0,
            knockback: { x: 0, y: 0 },
            hitFrames: { start: 99, end: 99 },
            attackBox: { offset: { x: 0, y: 0 }, width: 1, height: 1 },
            cooldown: 750
        }
    },
    sprites: {
        idle: { src: 'Idle.png', framesMax: 4 },
        run: { src: 'Run.png', framesMax: 8 },
        jump: { src: 'Jump.png', framesMax: 4 },
        fall: { src: 'Fall.png', framesMax: 4 },
        attack1: { src: 'Attack1.png', framesMax: 7 },
        attack2: { src: 'Attack2.png', framesMax: 7 },
        takeHit: { src: 'Hit.png', framesMax: 2 },
        death: { src: 'Death.png', framesMax: 8 }
    },
    projectile: {
        moveSprite: { src: 'ProjectileMove.png', framesMax: 1 },
        explodeSprite: { src: 'ProjectileExplode.png', framesMax: 8 },
        speed: 10.5,
        damage: 18,
        knockback: { x: 4, y: -2 },
        spawnFrame: 4,
        spawnOffset: { x: 162, y: 84 },
        scale: { x: 1.0, y: 1.0 },
        collisionBox: { width: 62, height: 8 }
    },
    collisionBox: { width: 50, height: 150 }
};
