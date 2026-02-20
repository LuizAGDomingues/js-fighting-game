export const kenji = {
  id: 'kenji',
  name: 'Kenji',
  spriteBasePath: './images/kenji',
  scale: { x: 2.5, y: 2.5 },
  offset: { x: 215, y: 167 },
  stats: {
    health: 100,
    moveSpeed: 5.5,
    jumpVelocity: -20,
    weight: 0.9
  },
  attacks: {
    attack1: {
      damage: 18,
      knockback: { x: 3, y: -2 },
      hitFrames: { start: 1, end: 3 },
      attackBox: { offset: { x: 100, y: 50 }, width: 145, height: 50 },
      cooldown: 0
    },
    attack2: {
      damage: 28,
      knockback: { x: 5, y: -3 },
      hitFrames: { start: 1, end: 3 },
      attackBox: { offset: { x: 90, y: 30 }, width: 160, height: 60 },
      cooldown: 200
    }
  },
  sprites: {
    idle:    { src: 'Idle.png', framesMax: 4 },
    run:     { src: 'Run.png', framesMax: 8 },
    jump:    { src: 'Jump.png', framesMax: 2 },
    fall:    { src: 'Fall.png', framesMax: 2 },
    attack1: { src: 'Attack1.png', framesMax: 4 },
    attack2: { src: 'Attack2.png', framesMax: 4 },
    takeHit: { src: 'Take hit.png', framesMax: 3 },
    death:   { src: 'Death.png', framesMax: 7 }
  },
  collisionBox: { width: 50, height: 150 }
};
