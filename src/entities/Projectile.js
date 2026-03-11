import { CANVAS_WIDTH, FRAME_HOLD_SECONDS } from '../config/constants.js';

export class Projectile {
    constructor({ position, velocityX, spriteImages, config, owner }) {
        this.position = { x: position.x, y: position.y };
        this.velocityX = velocityX;
        this.moveImage = spriteImages.move;
        this.explodeImage = spriteImages.explode;
        this.config = config;
        this.owner = owner;

        this.active = true;
        this.hasHit = false;
        this.isExploding = false;

        this.framesCurrent = 0;
        this.frameTimer = 0;
        this.frameHoldTime = FRAME_HOLD_SECONDS;

        const scale = config.scale || { x: 2.5, y: 2.5 };
        this.scaleX = scale.x;
        this.scaleY = scale.y;
        this.width = config.collisionBox.width * scale.x;
        this.height = config.collisionBox.height * scale.y;
    }

    update(deltaTime) {
        if (!this.active) return;

        if (this.isExploding) {
            this.frameTimer += deltaTime;
            if (this.frameTimer >= this.frameHoldTime) {
                this.frameTimer -= this.frameHoldTime;
                this.framesCurrent++;
                if (this.framesCurrent >= this.config.explodeSprite.framesMax) {
                    this.active = false;
                }
            }
            return;
        }

        this.position.x += this.velocityX;

        this.frameTimer += deltaTime;
        if (this.frameTimer >= this.frameHoldTime) {
            this.frameTimer -= this.frameHoldTime;
            this.framesCurrent = (this.framesCurrent + 1) % this.config.moveSprite.framesMax;
        }

        if (this.position.x < -300 || this.position.x > CANVAS_WIDTH + 300) {
            this.active = false;
        }
    }

    onHit() {
        if (this.hasHit) return;
        this.hasHit = true;
        this.isExploding = true;
        this.framesCurrent = 0;
        this.frameTimer = 0;
        this.velocityX = 0;
    }

    draw(ctx) {
        if (!this.active) return;

        const img = this.isExploding ? this.explodeImage : this.moveImage;
        if (!img || !img.complete) return;

        const framesMax = this.isExploding
            ? this.config.explodeSprite.framesMax
            : this.config.moveSprite.framesMax;

        const frameW = img.width / framesMax;
        const drawW = frameW * this.scaleX;
        const drawH = img.height * this.scaleY;

        ctx.save();
        ctx.imageSmoothingEnabled = false;

        if (this.velocityX < 0) {
            ctx.translate(this.position.x + this.width / 2, 0);
            ctx.scale(-1, 1);
            ctx.translate(-(this.position.x + this.width / 2), 0);
        }

        ctx.drawImage(
            img,
            this.framesCurrent * frameW, 0,
            frameW, img.height,
            this.position.x, this.position.y,
            drawW, drawH
        );

        ctx.restore();
    }
}
