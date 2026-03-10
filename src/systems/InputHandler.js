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
        attack1: 'space',
        attack2: 'e',
        block: 's'
      },
      enemy: {
        left: 'arrowleft',
        right: 'arrowright',
        jump: 'arrowup',
        attack1: 'arrowdown',
        attack2: 'enter',
        block: 'shift'
      }
    };

    // Double-tap tracking for dash
    this._doubleTap = {
      player: { key: null, timer: 0, triggered: false },
      enemy: { key: null, timer: 0, triggered: false }
    };

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onBlur = this._onBlur.bind(this);
  }

  bind() {
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('blur', this._onBlur);
  }

  unbind() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('blur', this._onBlur);
    this._clearInputs();
  }


  _clearInputs() {
    this.keyStates = {};
    this.keyJustPressed = {};
    this.lastKeys = { player: null, enemy: null };

    for (const playerId of ['player', 'enemy']) {
      this._doubleTap[playerId] = { key: null, timer: 0, triggered: false };
    }
  }

  _onBlur() {
    this._clearInputs();
  }
  _normalizeKey(event) {
    if (event.code === 'Space') return 'space';
    if (event.key === ' ') return 'space';
    if (event.key === 'Shift' || event.code === 'ShiftLeft' || event.code === 'ShiftRight') return 'shift';
    return event.key.toLowerCase();
  }

  _isBoundKey(key) {
    return Object.values(this.bindings).some(playerBindings =>
      Object.values(playerBindings).includes(key)
    );
  }

  _onKeyDown(event) {
    const key = this._normalizeKey(event);

    if (this._isBoundKey(key)) {
      event.preventDefault();
    }

    // Track "just pressed" only on the initial non-repeat press
    if (!this.keyStates[key] && !event.repeat) {
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
    const key = this._normalizeKey(event);

    if (this._isBoundKey(key)) {
      event.preventDefault();
    }

    this.keyStates[key] = false;
    this.keyJustPressed[key] = false;
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



