import { FRAME_HOLD_SECONDS } from '../config/constants.js';

export class Sprite {
  constructor({ position, image, scale = { x: 1, y: 1 }, framesMax = 1, offset = { x: 0, y: 0 } }) {
    this.position = position;
    this.image = image;
    this.scale = scale;
    this.framesMax = framesMax;
    this.framesCurrent = 0;
    this.frameTimer = 0;
    this.frameHoldTime = FRAME_HOLD_SECONDS;
    this.offset = offset;
  }

  draw(ctx) {
    if (!this.image || !this.image.complete) return;

    const frameWidth = this.image.width / this.framesMax;
    ctx.drawImage(
      this.image,
      this.framesCurrent * frameWidth,
      0,
      frameWidth,
      this.image.height,
      this.position.x - this.offset.x,
      this.position.y - this.offset.y,
      frameWidth * this.scale.x,
      this.image.height * this.scale.y
    );
  }

  animateFrames(deltaTime) {
    this.frameTimer += deltaTime;
    if (this.frameTimer >= this.frameHoldTime) {
      this.frameTimer -= this.frameHoldTime;
      if (this.framesCurrent < this.framesMax - 1) {
        this.framesCurrent++;
      } else {
        this.framesCurrent = 0;
      }
    }
  }

  update(ctx, deltaTime) {
    this.draw(ctx);
    this.animateFrames(deltaTime);
  }
}
