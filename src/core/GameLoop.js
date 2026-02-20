export class GameLoop {
  constructor(updateFn, renderFn) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;
    this.lastTimestamp = 0;
    this.rafId = null;
    this.running = false;
  }

  start() {
    this.running = true;
    this.lastTimestamp = performance.now();
    this.rafId = requestAnimationFrame(this._tick.bind(this));
  }

  stop() {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  _tick(timestamp) {
    if (!this.running) return;

    let deltaTime = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;

    // Cap deltaTime to prevent spiral of death (e.g. tab was inactive)
    if (deltaTime > 1 / 30) deltaTime = 1 / 30;

    this.updateFn(deltaTime);
    this.renderFn();

    this.rafId = requestAnimationFrame(this._tick.bind(this));
  }
}
