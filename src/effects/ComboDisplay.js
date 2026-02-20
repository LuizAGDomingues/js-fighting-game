/**
 * ComboDisplay — Shows "X HIT COMBO!" with pulsing animation
 */
export class ComboDisplay {
    constructor() {
        this.count = 0;
        this.displayTimer = 0;
        this.displayDuration = 1.5;
        this.active = false;
        this.playerId = null;
        this.pulseTimer = 0;
    }

    /**
     * @param {number} count - Current combo count
     * @param {string} playerId - 'player' or 'enemy'
     */
    show(count, playerId) {
        if (count < 2) return;
        this.count = count;
        this.playerId = playerId;
        this.displayTimer = 0;
        this.active = true;
        this.pulseTimer = 0;
    }

    update(dt) {
        if (!this.active) return;
        this.displayTimer += dt;
        this.pulseTimer += dt;
        if (this.displayTimer >= this.displayDuration) {
            this.active = false;
        }
    }

    render(ctx) {
        if (!this.active || this.count < 2) return;

        const alpha = this.displayTimer < 0.15
            ? this.displayTimer / 0.15 // Fade in
            : Math.max(0, 1 - ((this.displayTimer - this.displayDuration + 0.3) / 0.3)); // Fade out last 0.3s

        if (alpha <= 0) return;

        // Pulsing scale
        const pulse = 1 + Math.sin(this.pulseTimer * 8) * 0.08;
        const fontSize = Math.round(28 * pulse);

        const x = this.playerId === 'player' ? 200 : 824;
        const y = 120;

        ctx.save();
        ctx.globalAlpha = Math.min(1, alpha);
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        ctx.textAlign = 'center';

        // Glow effect
        ctx.shadowColor = this.count >= 5 ? '#ff4400' : '#ffaa00';
        ctx.shadowBlur = 15;

        // Outline
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.strokeText(`${this.count} HIT COMBO!`, x, y);

        // Fill with gradient based on combo count
        if (this.count >= 5) {
            ctx.fillStyle = '#ff4444';
        } else if (this.count >= 3) {
            ctx.fillStyle = '#ffd700';
        } else {
            ctx.fillStyle = '#ffaa44';
        }
        ctx.fillText(`${this.count} HIT COMBO!`, x, y);

        ctx.restore();
    }

    reset() {
        this.active = false;
        this.count = 0;
    }
}
