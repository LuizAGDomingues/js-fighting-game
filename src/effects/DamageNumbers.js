/**
 * DamageNumbers — Floating damage indicators
 */

const MAX_NUMBERS = 20;

const STYLES = {
    normal: { color: '#ff4444', outline: '#880000', scale: 1.0 },
    combo: { color: '#ffd700', outline: '#996600', scale: 1.3 },
    blocked: { color: '#88bbff', outline: '#334466', scale: 0.8 }
};

class DamageNumber {
    constructor() {
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.value = 0;
        this.type = 'normal';
        this.lifetime = 0;
        this.maxLifetime = 0.8;
        this.vy = -80;
        this.alpha = 1;
        this.scale = 1;
    }

    init(x, y, value, type = 'normal') {
        this.active = true;
        this.x = x + (Math.random() - 0.5) * 30;
        this.y = y;
        this.value = Math.round(value);
        this.type = type;
        this.lifetime = 0;
        this.maxLifetime = 0.8;
        this.vy = -80;
        this.alpha = 1;
        this.scale = STYLES[type]?.scale || 1;
    }

    update(dt) {
        if (!this.active) return;
        this.lifetime += dt;
        if (this.lifetime >= this.maxLifetime) {
            this.active = false;
            return;
        }
        this.y += this.vy * dt;
        this.vy += 30 * dt; // Slight deceleration
        this.alpha = 1 - (this.lifetime / this.maxLifetime);
        // Scale pop effect: starts larger, settles
        if (this.lifetime < 0.1) {
            this.scale = (STYLES[this.type]?.scale || 1) * (1 + (0.1 - this.lifetime) * 5);
        }
    }

    draw(ctx) {
        if (!this.active) return;
        const style = STYLES[this.type] || STYLES.normal;
        const fontSize = Math.round(20 * this.scale);

        ctx.globalAlpha = this.alpha;
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        ctx.textAlign = 'center';

        // Outline
        ctx.strokeStyle = style.outline;
        ctx.lineWidth = 3;
        ctx.strokeText(this.value, this.x, this.y);

        // Fill
        ctx.fillStyle = style.color;
        ctx.fillText(this.value, this.x, this.y);
    }
}

export class DamageNumbers {
    constructor() {
        this.pool = [];
        for (let i = 0; i < MAX_NUMBERS; i++) {
            this.pool.push(new DamageNumber());
        }
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} value - Damage amount
     * @param {'normal'|'combo'|'blocked'} type
     */
    spawn(x, y, value, type = 'normal') {
        for (let i = 0; i < this.pool.length; i++) {
            if (!this.pool[i].active) {
                this.pool[i].init(x, y, value, type);
                return;
            }
        }
    }

    update(dt) {
        for (let i = 0; i < this.pool.length; i++) {
            this.pool[i].update(dt);
        }
    }

    render(ctx) {
        for (let i = 0; i < this.pool.length; i++) {
            this.pool[i].draw(ctx);
        }
        ctx.globalAlpha = 1;
        ctx.textAlign = 'left'; // Reset
    }

    reset() {
        for (let i = 0; i < this.pool.length; i++) {
            this.pool[i].active = false;
        }
    }
}
