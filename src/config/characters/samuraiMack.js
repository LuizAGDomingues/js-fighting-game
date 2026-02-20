export const samuraiMack = {
  id: 'samuraiMack',
  name: 'Samurai Mack',
  spriteBasePath: './images/samuraiMack',
  scale: { x: 2.5, y: 2.5 },
  offset: { x: 215, y: 155 },
  stats: {
    health: 100,
    moveSpeed: 5,
    jumpVelocity: -20,
    weight: 1.0
  },
  attacks: {
    attack1: {
      damage: 20,
      knockback: { x: 3, y: -2 },
      hitFrames: { start: 3, end: 5 },
      attackBox: { offset: { x: 100, y: 50 }, width: 140, height: 50 },
      cooldown: 0
    },
    attack2: {
      damage: 30,
      knockback: { x: 5, y: -4 },
      hitFrames: { start: 2, end: 4 },
      attackBox: { offset: { x: 80, y: 30 }, width: 160, height: 60 },
      cooldown: 200
    }
  },
  sprites: {
    idle:    { src: 'Idle.png', framesMax: 8 },
    run:     { src: 'Run.png', framesMax: 8 },
    jump:    { src: 'Jump.png', framesMax: 2 },
    fall:    { src: 'Fall.png', framesMax: 2 },
    attack1: { src: 'Attack1.png', framesMax: 6 },
    attack2: { src: 'Attack2.png', framesMax: 6 },
    takeHit: { src: 'Take Hit.png', framesMax: 4 },
    death:   { src: 'Death.png', framesMax: 6 }
  },
  collisionBox: { width: 50, height: 150 }
};
