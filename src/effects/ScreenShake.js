/**
 * ScreenShake — Efeito de tremor de tela com decaimento sinusoidal
 */
export class ScreenShake {
    constructor() {
        this.intensity = 0;
        this.duration = 0;
        this.elapsed = 0;
        this.active = false;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    /**
     * @param {number} intensity - Pixels of max shake displacement
     * @param {number} duration - Duration in seconds
     */
    trigger(intensity, duration) {
        // Allow stronger shakes to override weaker ones
        if (intensity >= this.intensity) {
            this.intensity = intensity;
            this.duration = duration;
            this.elapsed = 0;
            this.active = true;
        }
    }

    update(deltaTime) {
        if (!this.active) return;

        this.elapsed += deltaTime;
        if (this.elapsed >= this.duration) {
            this.active = false;
            this.offsetX = 0;
            this.offsetY = 0;
            this.intensity = 0;
            return;
        }

        // Decaying sinusoidal shake
        const progress = this.elapsed / this.duration;
        const decay = 1 - progress;
        const frequency = 30; // Oscillations per second
        const t = this.elapsed * frequency;

        this.offsetX = Math.sin(t) * this.intensity * decay * (Math.random() * 0.4 + 0.8);
        this.offsetY = Math.cos(t * 1.3) * this.intensity * decay * (Math.random() * 0.4 + 0.8);
    }

    getOffset() {
        return { x: this.offsetX, y: this.offsetY };
    }

    reset() {
        this.active = false;
        this.intensity = 0;
        this.offsetX = 0;
        this.offsetY = 0;
    }
}
