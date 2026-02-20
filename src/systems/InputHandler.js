import { DOUBLE_TAP_WINDOW } from '../config/constants.js';

export class InputHandler {
  constructor() {
    this.keyStates = {};
    this.keyJustPressed = {};
    this.lastKeys = { player: null, enemy: null };

    this.bindings = {
      player: {
        left: 'a',
        right: 'd',
        jump: 'w',
        attack1: ' ',
        attack2: 'e',
        block: 's'
      },
      enemy: {
        left: 'ArrowLeft',
        right: 'ArrowRight',
        jump: 'ArrowUp',
        attack1: 'ArrowDown',
        attack2: 'Enter',
        block: 'Shift'
      }
    };

    // Double-tap tracking for dash
    this._doubleTap = {
      player: { key: null, timer: 0, triggered: false },
      enemy: { key: null, timer: 0, triggered: false }
    };

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
  }

  bind() {
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  unbind() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
  }

  _onKeyDown(event) {
    const key = event.key;

    // Track "just pressed" (only on initial press, not repeat)
    if (!this.keyStates[key]) {
      this.keyJustPressed[key] = true;
    }

    this.keyStates[key] = true;

    // Track last direction key for each player
    for (const playerId of ['player', 'enemy']) {
      const bindings = this.bindings[playerId];
      if (key === bindings.left || key === bindings.right) {
        this.lastKeys[playerId] = key;

        // Double-tap detection for dash
        if (!event.repeat) {
          const dt = this._doubleTap[playerId];
          if (dt.key === key && dt.timer > 0) {
            dt.triggered = true;
          } else {
            dt.key = key;
            dt.timer = DOUBLE_TAP_WINDOW;
            dt.triggered = false;
          }
        }
      }
    }
  }

  _onKeyUp(event) {
    this.keyStates[event.key] = false;
  }

  update(deltaTime) {
    // Update double-tap timers
    for (const playerId of ['player', 'enemy']) {
      const dt = this._doubleTap[playerId];
      if (dt.timer > 0) {
        dt.timer -= deltaTime;
        if (dt.timer <= 0) {
          dt.key = null;
          dt.timer = 0;
          dt.triggered = false;
        }
      }
    }
  }

  endFrame() {
    // Clear "just pressed" flags AFTER all systems have read them
    this.keyJustPressed = {};
  }

  isPressed(action, playerId) {
    const key = this.bindings[playerId][action];
    return !!this.keyStates[key];
  }

  wasJustPressed(action, playerId) {
    const key = this.bindings[playerId][action];
    return !!this.keyJustPressed[key];
  }

  isDirectionActive(direction, playerId) {
    const key = this.bindings[playerId][direction];
    return this.keyStates[key] && this.lastKeys[playerId] === key;
  }

  consumeDash(playerId) {
    const dt = this._doubleTap[playerId];
    if (dt.triggered) {
      const key = dt.key;
      dt.triggered = false;
      dt.key = null;
      dt.timer = 0;
      // Return direction: -1 for left, 1 for right
      const bindings = this.bindings[playerId];
      if (key === bindings.left) return -1;
      if (key === bindings.right) return 1;
    }
    return 0;
  }

  getLastDirection(playerId) {
    return this.lastKeys[playerId];
  }
}
