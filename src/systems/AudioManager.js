import { SFXGenerator } from './SFXGenerator.js';

export class AudioManager {
  constructor() {
    this.audioContext = null;
    this.sfx = null;
    this.music = null;
    this.initialized = false;

    this.volume = {
      master: 1.0,
      music: 0.5,
      sfx: 0.7
    };
    this.muted = false;
  }

  initContext() {
    if (this.initialized) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.sfx = new SFXGenerator(this.audioContext);
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  playMusic(path) {
    if (!this.initialized) return;

    this.stopMusic();

    this.music = new Audio(path);
    this.music.loop = true;
    this.music.volume = this._getMusicVolume();
    this.music.play().catch(() => {
      // Autoplay blocked, will retry on next user interaction
    });
  }

  stopMusic() {
    if (this.music) {
      this.music.pause();
      this.music.currentTime = 0;
      this.music = null;
    }
  }

  playSFX(name) {
    if (!this.initialized || this.muted) return;
    if (!this.sfx[name]) return;

    // Resume context if suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    this.sfx[name]();
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.music) {
      this.music.volume = this.muted ? 0 : this._getMusicVolume();
    }
    return this.muted;
  }

  setMasterVolume(value) {
    this.volume.master = Math.max(0, Math.min(1, value));
    this._updateMusicVolume();
  }

  setMusicVolume(value) {
    this.volume.music = Math.max(0, Math.min(1, value));
    this._updateMusicVolume();
  }

  setSFXVolume(value) {
    this.volume.sfx = Math.max(0, Math.min(1, value));
  }

  get musicVolume() { return this.volume.music; }
  get sfxVolume() { return this.volume.sfx; }

  _getMusicVolume() {
    return this.volume.master * this.volume.music;
  }

  _updateMusicVolume() {
    if (this.music && !this.muted) {
      this.music.volume = this._getMusicVolume();
    }
  }
}
