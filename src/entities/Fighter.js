import { Sprite } from './Sprite.js';
import {
  GRAVITY, CANVAS_WIDTH, CANVAS_HEIGHT,
  FIGHTER_WIDTH, FIGHTER_HEIGHT,
  FLOOR_Y, FLOOR_OFFSET, MAX_HEALTH, BASE_DAMAGE,
  DASH_SPEED, DASH_DURATION, DASH_COOLDOWN, DASH_IFRAMES
} from '../config/constants.js';

export const AnimState = {
  IDLE: 'idle',
  RUN: 'run',
  JUMP: 'jump',
  FALL: 'fall',
  ATTACK1: 'attack1',
  ATTACK2: 'attack2',
  TAKE_HIT: 'takeHit',
  DEATH: 'death',
  BLOCK: 'block'
};

export class Fighter extends Sprite {
  constructor({
    position,
    velocity,
    color = 'red',
    image,
    scale = { x: 1, y: 1 },
    framesMax = 1,
    offset = { x: 0, y: 0 },
    sprites,
    attackBox = { offset: {}, width: 0, height: 0 },
    characterConfig = null
  }) {
    super({ position, image, scale, framesMax, offset });

    this.velocity = velocity;
    this.width = FIGHTER_WIDTH;
    this.height = FIGHTER_HEIGHT;
    this.lastKey = null;
    this.attackBox = {
      position: { x: this.position.x, y: this.position.y },
      offset: attackBox.offset,
      width: attackBox.width,
      height: attackBox.height
    };
    this.color = color;
    this.isAttacking = false;
    this.currentAttack = null;
    this.health = characterConfig?.stats?.health || MAX_HEALTH;
    this.maxHealth = this.health;
    this.currentState = AnimState.IDLE;
    this.animationComplete = false;
    this.sprites = sprites;
    this.dead = false;
    this.hitRegistered = false;
    this.characterConfig = characterConfig;
    this.weight = characterConfig?.stats?.weight || 1.0;

    // Block state
    this.isBlocking = false;

    // Dash state
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashCooldownTimer = 0;
    this.dashDirection = 0;
    this.iFrameTimer = 0;

    // Attack cooldown
    this.attackCooldownTimer = 0;

    // Facing direction (true = right, false = left)
    this.facingRight = true;

    // Initial position for reset
    this._initialPosition = { x: position.x, y: position.y };
    this._initialVelocity = { x: velocity.x, y: velocity.y };
  }

  draw(ctx) {
    if (!this.image || !this.image.complete) return;

    // Dash visual: semi-transparent during i-frames
    if (this.iFrameTimer > 0) {
      ctx.globalAlpha = 0.4;
    }

    // Block visual: slight tint
    if (this.isBlocking) {
      ctx.globalAlpha = 0.7;
    }

    const frameWidth = this.image.width / this.framesMax;
    const drawX = this.position.x - this.offset.x;
    const drawY = this.position.y - this.offset.y;
    const drawW = frameWidth * this.scale.x;
    const drawH = this.image.height * this.scale.y;

    ctx.save();
    if (!this.facingRight) {
      // Flip horizontally around the fighter's center
      ctx.translate(this.position.x + this.width / 2, 0);
      ctx.scale(-1, 1);
      ctx.translate(-(this.position.x + this.width / 2), 0);
    }

    ctx.drawImage(
      this.image,
      this.framesCurrent * frameWidth,
      0,
      frameWidth,
      this.image.height,
      drawX,
      drawY,
      drawW,
      drawH
    );
    ctx.restore();

    // Draw block shield indicator
    if (this.isBlocking) {
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#4488ff';
      ctx.fillRect(
        this.position.x - 5,
        this.position.y,
        this.width + 10,
        this.height
      );
    }

    ctx.globalAlpha = 1.0;
  }

  animateFrames(deltaTime) {
    this.frameTimer += deltaTime;
    if (this.frameTimer >= this.frameHoldTime) {
      this.frameTimer -= this.frameHoldTime;
      if (this.framesCurrent < this.framesMax - 1) {
        this.framesCurrent++;
        this.animationComplete = false;
      } else {
        this.animationComplete = true;
        if (this.currentState !== AnimState.DEATH) {
          this.framesCurrent = 0;
        }
      }
    }
  }

  update(deltaTime) {
    if (!this.dead) this.animateFrames(deltaTime);

    // Update attack box position
    const atkData = this._getCurrentAttackData();
    if (atkData) {
      this.attackBox.offset = { ...atkData.attackBox.offset };
      this.attackBox.width = atkData.attackBox.width;
      this.attackBox.height = atkData.attackBox.height;
    }
    // Flip attack box when facing left
    if (this.facingRight) {
      this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
    } else {
      this.attackBox.position.x = this.position.x + this.width - this.attackBox.offset.x - this.attackBox.width;
    }
    this.attackBox.position.y = this.position.y + this.attackBox.offset.y;

    // Dash logic
    if (this.isDashing) {
      this.dashTimer -= deltaTime;
      this.velocity.x = DASH_SPEED * this.dashDirection;
      if (this.dashTimer <= 0) {
        this.isDashing = false;
        this.velocity.x = 0;
      }
    }

    // Cooldown timers
    if (this.dashCooldownTimer > 0) this.dashCooldownTimer -= deltaTime;
    if (this.iFrameTimer > 0) this.iFrameTimer -= deltaTime;
    if (this.attackCooldownTimer > 0) this.attackCooldownTimer -= deltaTime;

    // Apply velocity
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Gravity
    if (this.position.y + this.height + this.velocity.y >= CANVAS_HEIGHT - FLOOR_OFFSET) {
      this.velocity.y = 0;
      this.position.y = FLOOR_Y;
    } else {
      this.velocity.y += GRAVITY;
    }

    // Enforce boundaries
    if (this.position.x < 0) this.position.x = 0;
    if (this.position.x > CANVAS_WIDTH - this.width) {
      this.position.x = CANVAS_WIDTH - this.width;
    }
  }

  get isGrounded() {
    return this.position.y >= FLOOR_Y;
  }

  get isInvulnerable() {
    return this.iFrameTimer > 0;
  }

  get isInHitFrame() {
    const atkData = this._getCurrentAttackData();
    if (!atkData || !atkData.hitFrames) return false;
    return this.framesCurrent >= atkData.hitFrames.start &&
      this.framesCurrent <= atkData.hitFrames.end;
  }

  _getCurrentAttackData() {
    if (!this.characterConfig) {
      // Fallback to sprite-embedded hitFrames
      const spriteData = this.sprites[this.currentState];
      if (spriteData?.hitFrames) return { hitFrames: spriteData.hitFrames, attackBox: this.attackBox };
      return null;
    }
    if (this.currentState === AnimState.ATTACK1) return this.characterConfig.attacks.attack1;
    if (this.currentState === AnimState.ATTACK2) return this.characterConfig.attacks.attack2;
    return null;
  }

  attack(type = 'attack1') {
    if (this.currentState === AnimState.TAKE_HIT ||
      this.currentState === AnimState.DEATH ||
      this.isBlocking || this.isDashing) {
      return;
    }
    if (this.attackCooldownTimer > 0) return;

    const animState = type === 'attack2' ? AnimState.ATTACK2 : AnimState.ATTACK1;

    // Check if we have the sprite for this attack
    if (!this.sprites[animState]) {
      // Fallback to attack1 if attack2 not available
      if (type === 'attack2') return this.attack('attack1');
      return;
    }

    this.switchSprite(animState);
    this.isAttacking = true;
    this.hitRegistered = false;
    this.currentAttack = type;

    // Set cooldown from character config
    if (this.characterConfig?.attacks[type]?.cooldown) {
      this.attackCooldownTimer = this.characterConfig.attacks[type].cooldown / 1000;
    }
  }

  block(active) {
    if (this.dead) return;
    if (active && !this.isAttacking && !this.isDashing) {
      this.isBlocking = true;
    } else {
      this.isBlocking = false;
    }
  }

  dash(direction) {
    if (this.dead || this.isDashing || this.dashCooldownTimer > 0) return;
    if (this.isAttacking || this.isBlocking) return;

    this.isDashing = true;
    this.dashTimer = DASH_DURATION;
    this.dashCooldownTimer = DASH_COOLDOWN;
    this.dashDirection = direction;
    this.iFrameTimer = DASH_IFRAMES;
  }

  takeHit(damage = BASE_DAMAGE) {
    // i-frames protect from damage
    if (this.isInvulnerable) return;

    this.health -= damage;
    this.isBlocking = false;
    this.isDashing = false;

    if (this.health <= 0) {
      this.health = 0;
      this.switchSprite(AnimState.DEATH);
    } else {
      this.switchSprite(AnimState.TAKE_HIT);
    }
  }

  switchSprite(sprite) {
    // Death animation can't be interrupted
    if (this.currentState === AnimState.DEATH) {
      if (this.animationComplete) this.dead = true;
      return;
    }

    // Attack animations play fully before switching
    if ((this.currentState === AnimState.ATTACK1 || this.currentState === AnimState.ATTACK2) &&
      !this.animationComplete) return;

    // TakeHit animation plays fully before switching
    if (this.currentState === AnimState.TAKE_HIT && !this.animationComplete) return;

    // Switch to new sprite if different
    if (this.currentState !== sprite) {
      const spriteData = this.sprites[sprite];
      if (!spriteData) return;

      this.currentState = sprite;
      this.image = spriteData.image;
      this.framesMax = spriteData.framesMax;
      this.framesCurrent = 0;
      this.frameTimer = 0;
      this.animationComplete = false;
    }
  }

  reset() {
    this.position.x = this._initialPosition.x;
    this.position.y = this._initialPosition.y;
    this.velocity.x = this._initialVelocity.x;
    this.velocity.y = this._initialVelocity.y;
    this.health = this.maxHealth;
    this.dead = false;
    this.isAttacking = false;
    this.hitRegistered = false;
    this.animationComplete = false;
    this.isBlocking = false;
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashCooldownTimer = 0;
    this.iFrameTimer = 0;
    this.attackCooldownTimer = 0;
    this.currentAttack = null;
    this.currentState = '';
    this.switchSprite(AnimState.IDLE);
  }
}
