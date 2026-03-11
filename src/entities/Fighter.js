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
  DEATH: 'death'
};

export class Fighter extends Sprite {
  #health;
  #maxHealth;

  constructor({
    position,
    velocity,
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
    this.width = characterConfig?.collisionBox?.width || FIGHTER_WIDTH;
    this.height = characterConfig?.collisionBox?.height || FIGHTER_HEIGHT;
    this.baseAttackBox = {
      offset: { ...attackBox.offset },
      width: attackBox.width,
      height: attackBox.height
    };
    this.attackBox = {
      position: { x: this.position.x, y: this.position.y },
      offset: { ...attackBox.offset },
      width: attackBox.width,
      height: attackBox.height
    };
    this.isAttacking = false;
    this.currentAttack = null;
    this.#health = characterConfig?.stats?.health || MAX_HEALTH;
    this.#maxHealth = this.#health;
    this.currentState = AnimState.IDLE;
    this.animationComplete = false;
    this.sprites = sprites;
    this.dead = false;
    this.hitRegistered = false;
    this.characterConfig = characterConfig;
    this.weight = characterConfig?.stats?.weight || 1.0;
    this.spriteFacingRight = characterConfig?.spriteFacingRight ?? true;

    this.isDashing = false;
    this.dashTimer = 0;
    this.dashCooldownTimer = 0;
    this.dashDirection = 0;
    this.iFrameTimer = 0;

    this.attackCooldownTimer = 0;
    this.facingRight = true;
    this.onProjectileFire = null;

    this._initialPosition = { x: position.x, y: position.y };
    this._initialVelocity = { x: velocity.x, y: velocity.y };

    this.updateAttackBox();
  }

  get health() {
    return this.#health;
  }

  get maxHealth() {
    return this.#maxHealth;
  }

  draw(ctx) {
    if (!this.image || !this.image.complete) return;

    if (this.iFrameTimer > 0) {
      ctx.globalAlpha = 0.4;
    }

    const frameWidth = this.image.width / this.framesMax;
    const drawX = this.position.x - this.offset.x;
    const drawY = this.position.y - this.offset.y;
    const drawW = frameWidth * this.scale.x;
    const drawH = this.image.height * this.scale.y;

    const shouldFlip = this.facingRight !== this.spriteFacingRight;

    ctx.save();
    if (shouldFlip) {
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

      const projConfig = this.characterConfig?.projectile;
      if (projConfig && this.isAttacking && !this.hitRegistered &&
          this.framesCurrent === projConfig.spawnFrame && this.onProjectileFire) {
        this.hitRegistered = true;
        this.onProjectileFire(this);
      }
    }
  }

  update(deltaTime) {
    if (!this.dead) this.animateFrames(deltaTime);

    if (this.isDashing) {
      this.dashTimer -= deltaTime;
      this.velocity.x = DASH_SPEED * this.dashDirection;
      if (this.dashTimer <= 0) {
        this.isDashing = false;
        this.velocity.x = 0;
      }
    }

    if (this.dashCooldownTimer > 0) this.dashCooldownTimer -= deltaTime;
    if (this.iFrameTimer > 0) this.iFrameTimer -= deltaTime;
    if (this.attackCooldownTimer > 0) this.attackCooldownTimer -= deltaTime;

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.y + this.height + this.velocity.y >= CANVAS_HEIGHT - FLOOR_OFFSET) {
      this.velocity.y = 0;
      this.position.y = FLOOR_Y;
    } else {
      this.velocity.y += GRAVITY;
    }

    if (this.position.y < 0) {
      this.position.y = 0;
      if (this.velocity.y < 0) {
        this.velocity.y = 0;
      }
    }

    if (this.position.x < 0) this.position.x = 0;
    if (this.position.x > CANVAS_WIDTH - this.width) {
      this.position.x = CANVAS_WIDTH - this.width;
    }

    this.updateAttackBox();
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
      const spriteData = this.sprites[this.currentState];
      if (spriteData?.hitFrames) return { hitFrames: spriteData.hitFrames, attackBox: this.attackBox };
      return null;
    }
    if (this.currentState === AnimState.ATTACK1) return this.characterConfig.attacks.attack1;
    if (this.currentState === AnimState.ATTACK2) return this.characterConfig.attacks.attack2;
    return null;
  }

  updateAttackBox() {
    const attackConfig = this._getCurrentAttackData()?.attackBox || this.baseAttackBox;
    const contactPadding = Math.max(
      0,
      attackConfig.contactPadding ?? (attackConfig.offset.x - 10)
    );

    this.attackBox.offset = { ...attackConfig.offset };
    this.attackBox.width = attackConfig.width + contactPadding;
    this.attackBox.height = attackConfig.height;

    if (this.facingRight) {
      this.attackBox.position.x =
        this.position.x + this.attackBox.offset.x - contactPadding;
    } else {
      this.attackBox.position.x =
        this.position.x + this.width - this.attackBox.offset.x - attackConfig.width;
    }
    this.attackBox.position.y = this.position.y + this.attackBox.offset.y;
  }

  attack(type = 'attack1') {
    if (this.currentState === AnimState.TAKE_HIT ||
      this.currentState === AnimState.DEATH ||
      this.isDashing) {
      return;
    }
    if (this.attackCooldownTimer > 0) return;

    const animState = type === 'attack2' ? AnimState.ATTACK2 : AnimState.ATTACK1;

    if (!this.sprites[animState]) {
      if (type === 'attack2') return this.attack('attack1');
      return;
    }

    this.switchSprite(animState);
    this.isAttacking = true;
    this.hitRegistered = false;
    this.currentAttack = type;

    if (this.characterConfig?.attacks[type]?.cooldown) {
      this.attackCooldownTimer = this.characterConfig.attacks[type].cooldown / 1000;
    }
  }

  dash(direction) {
    if (this.dead || this.isDashing || this.dashCooldownTimer > 0) return;
    if (this.isAttacking) return;

    this.isDashing = true;
    this.dashTimer = DASH_DURATION;
    this.dashCooldownTimer = DASH_COOLDOWN;
    this.dashDirection = direction;
    this.iFrameTimer = DASH_IFRAMES;
  }

  takeHit(damage = BASE_DAMAGE) {
    if (this.isInvulnerable) return;

    this.#health = Math.max(0, this.#health - damage);
    this.isDashing = false;

    if (this.#health <= 0) {
      this.switchSprite(AnimState.DEATH);
    } else {
      this.switchSprite(AnimState.TAKE_HIT);
    }
  }

  restoreFullHealth() {
    this.#health = this.#maxHealth;
  }

  switchSprite(sprite) {
    if (this.currentState === AnimState.DEATH) {
      if (this.animationComplete) this.dead = true;
      return;
    }

    if ((this.currentState === AnimState.ATTACK1 || this.currentState === AnimState.ATTACK2) &&
      !this.animationComplete) return;

    if (this.currentState === AnimState.TAKE_HIT && !this.animationComplete) return;

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
    this.restoreFullHealth();
    this.dead = false;
    this.isAttacking = false;
    this.hitRegistered = false;
    this.animationComplete = false;
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashCooldownTimer = 0;
    this.iFrameTimer = 0;
    this.attackCooldownTimer = 0;
    this.currentAttack = null;
    this.currentState = '';
    this.switchSprite(AnimState.IDLE);
    this.updateAttackBox();
  }
}
