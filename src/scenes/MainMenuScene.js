import { Sprite } from '../entities/Sprite.js';

/**
 * MainMenuScene — Menu principal com logo, título e botões
 */
export class MainMenuScene {
    constructor() {
        this.game = null;
        this.sceneManager = null;
        this.overlay = document.getElementById('main-menu');
        this.settingsModal = document.getElementById('settings-modal');
        this.howToPlayModal = document.getElementById('howtoplay-modal');

        this.buttons = [];
        this.selectedIndex = 0;
        this.background = null;
        this.shop = null;

        this._onKeyDown = this._onKeyDown.bind(this);
    }

    enter() {
        // Show overlay
        this.overlay.classList.add('active');
        document.querySelector('.content').classList.add('hud-hidden');

        // Setup buttons
        this.buttons = Array.from(this.overlay.querySelectorAll('.menu-btn'));
        this.selectedIndex = 0;
        this.overlay.scrollTop = 0;
        this._updateSelection();

        // Button click handlers
        this.buttons.forEach((btn, i) => {
            btn.onclick = () => {
                this.selectedIndex = i;
                this._confirm();
            };
        });

        // Create background sprites for canvas rendering
        const loader = this.game.assetLoader;
        if (!this.background) {
            this.background = new Sprite({
                position: { x: 0, y: 0 },
                image: loader.get('./images/background.png')
            });
            this.shop = new Sprite({
                position: { x: 600, y: 128 },
                image: loader.get('./images/shop.png'),
                scale: { x: 2.75, y: 2.75 },
                framesMax: 6
            });
        }

        // Keyboard navigation
        window.addEventListener('keydown', this._onKeyDown);

        // Settings modal handlers
        this._setupSettings();
        this._setupHowToPlay();
    }

    _setupSettings() {
        const modal = this.settingsModal;
        if (!modal) return;

        const musicSlider = modal.querySelector('#music-volume');
        const sfxSlider = modal.querySelector('#sfx-volume');
        const musicVal = modal.querySelector('#music-vol-val');
        const sfxVal = modal.querySelector('#sfx-vol-val');
        const closeBtn = modal.querySelector('.modal-close');

        if (musicSlider) {
            musicSlider.value = Math.round(this.game.audio.musicVolume * 100);
            musicVal.textContent = musicSlider.value;
            musicSlider.oninput = () => {
                const vol = musicSlider.value / 100;
                this.game.audio.setMusicVolume(vol);
                musicVal.textContent = musicSlider.value;
            };
        }
        if (sfxSlider) {
            sfxSlider.value = Math.round(this.game.audio.sfxVolume * 100);
            sfxVal.textContent = sfxSlider.value;
            sfxSlider.oninput = () => {
                const vol = sfxSlider.value / 100;
                this.game.audio.setSFXVolume(vol);
                sfxVal.textContent = sfxSlider.value;
            };
        }
        if (closeBtn) {
            closeBtn.onclick = () => modal.classList.remove('active');
        }
    }

    _setupHowToPlay() {
        const modal = this.howToPlayModal;
        if (!modal) return;
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.onclick = () => modal.classList.remove('active');
        }
    }

    exit() {
        this.overlay.classList.remove('active');
        window.removeEventListener('keydown', this._onKeyDown);
        if (this.settingsModal) this.settingsModal.classList.remove('active');
        if (this.howToPlayModal) this.howToPlayModal.classList.remove('active');
    }

    _onKeyDown(e) {
        // If a modal is open, only ESC closes it
        if (this.settingsModal?.classList.contains('active') ||
            this.howToPlayModal?.classList.contains('active')) {
            if (e.key === 'Escape') {
                this.settingsModal?.classList.remove('active');
                this.howToPlayModal?.classList.remove('active');
            }
            return;
        }

        switch (e.key) {
            case 'w':
            case 'W':
            case 'ArrowUp':
                this.selectedIndex = (this.selectedIndex - 1 + this.buttons.length) % this.buttons.length;
                this._updateSelection();
                this.game.audio.playSFX('menuNavigate');
                break;
            case 's':
            case 'S':
            case 'ArrowDown':
                this.selectedIndex = (this.selectedIndex + 1) % this.buttons.length;
                this._updateSelection();
                this.game.audio.playSFX('menuNavigate');
                break;
            case 'Enter':
            case ' ':
                this._confirm();
                break;
        }
    }

    _updateSelection() {
        this.buttons.forEach((btn, i) => {
            btn.classList.toggle('selected', i === this.selectedIndex);
        });

        const activeButton = this.buttons[this.selectedIndex];
        activeButton?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    _confirm() {
        this.game.audio.playSFX('menuSelect');
        const action = this.buttons[this.selectedIndex]?.dataset.action;
        switch (action) {
            case 'versus':
                this.sceneManager.switchTo('characterSelect', { gameMode: 'versus' });
                break;
            case 'arcade':
                this.sceneManager.switchTo('characterSelect', { gameMode: 'arcade' });
                break;
            case 'tower':
                this.sceneManager.switchTo('characterSelect', { gameMode: 'tower' });
                break;
            case 'training':
                this.sceneManager.switchTo('characterSelect', { gameMode: 'training' });
                break;
            case 'settings':
                if (this.settingsModal) this.settingsModal.classList.add('active');
                break;
            case 'howtoplay':
                if (this.howToPlayModal) this.howToPlayModal.classList.add('active');
                break;
        }
    }

    update(deltaTime) {
        // Animate background sprites
    }

    render(ctx) {
        const { canvas } = this.game;
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (this.background) this.background.update(ctx, 0);
        if (this.shop) this.shop.update(ctx, this.game._lastDeltaTime || 0.016);

        // Dim overlay on canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}
