/**
 * ParticleSystem - Pool-based particle system for hit sparks, dust, and dash trails
 */

const POOL_SIZE = 150;

const PARTICLE_PRESETS = {
    hit: {
        colors: ['#ffcc00', '#ff8800', '#ffee44', '#ff6600'],
        speedMin: 80, speedMax: 250,
        sizeMin: 2, sizeMax: 5,
        lifetimeMin: 0.15, lifetimeMax: 0.4,
        gravity: 300,
        spread: Math.PI * 2
    },
    dust: {
        colors: ['#8B7355', '#A0926B', '#C4B899', '#7A6A53'],
        speedMin: 20, speedMax: 60,
        sizeMin: 2, sizeMax: 4,
        lifetimeMin: 0.2, lifetimeMax: 0.5,
        gravity: -30,
        spread: Math.PI * 0.5
    },
    dash: {
        colors: ['#ffffff', '#ccddff', '#aabbee', '#ddeeff'],
        speedMin: 10, speedMax: 40,
        sizeMin: 2, sizeMax: 6,
        lifetimeMin: 0.1, lifetimeMax: 0.25,
        gravity: 0,
        spread: Math.PI * 0.3
    }
};

class Particle {
    constructor() {
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.size = 3;
        this.color = '#fff';
        this.lifetime = 0;
        this.maxLifetime = 0.3;
        this.gravity = 0;
        this.alpha = 1;
    }

    init(x, y, vx, vy, size, color, lifetime, gravity) {
        this.active = true;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.color = color;
        this.lifetime = 0;
        this.maxLifetime = lifetime;
        this.gravity = gravity;
        this.alpha = 1;
    }

    update(dt) {
        if (!this.active) return;
        this.lifetime += dt;
        if (this.lifetime >= this.maxLifetime) {
            this.active = false;
            return;
        }
        this.vy += this.gravity * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.alpha = 1 - (this.lifetime / this.maxLifetime);
        this.size *= (1 - dt * 2);
        if (this.size < 0.5) this.size = 0.5;
    }

    draw(ctx) {
        if (!this.active) return;
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    }
}

export class ParticleSystem {
    constructor() {
        this.pool = [];
        for (let i = 0; i < POOL_SIZE; i++) {
            this.pool.push(new Particle());
        }
    }

    _getInactive() {
        for (let i = 0; i < this.pool.length; i++) {
            if (!this.pool[i].active) return this.pool[i];
        }
        return null;
    }

    /**
     * @param {'hit'|'dust'|'dash'} type
     * @param {number} x
     * @param {number} y
     * @param {number} count
     * @param {number} [baseAngle] - Center angle for directional emission (radians)
     */
    emit(type, x, y, count, baseAngle = -Math.PI / 2) {
        const preset = PARTICLE_PRESETS[type];
        if (!preset) return;

        for (let i = 0; i < count; i++) {
            const p = this._getInactive();
            if (!p) return;

            const angle = baseAngle + (Math.random() - 0.5) * preset.spread;
            const speed = preset.speedMin + Math.random() * (preset.speedMax - preset.speedMin);
            const size = preset.sizeMin + Math.random() * (preset.sizeMax - preset.sizeMin);
            const lifetime = preset.lifetimeMin + Math.random() * (preset.lifetimeMax - preset.lifetimeMin);
            const color = preset.colors[Math.floor(Math.random() * preset.colors.length)];

            p.init(
                x + (Math.random() - 0.5) * 10,
                y + (Math.random() - 0.5) * 10,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                size,
                color,
                lifetime,
                preset.gravity
            );
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
    }

    reset() {
        for (let i = 0; i < this.pool.length; i++) {
            this.pool[i].active = false;
        }
    }
}
