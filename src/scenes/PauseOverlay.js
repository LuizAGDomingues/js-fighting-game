/**
 * PauseOverlay — Overlay de pausa sobre a BattleScene
 * Não é uma cena completa, funciona como overlay controlado pela BattleScene
 */
export class PauseOverlay {
    constructor() {
        this.game = null;
        this.sceneManager = null;
        this.overlay = document.getElementById('pause-overlay');
        this.battleScene = null;

        this.buttons = [];
        this.selectedIndex = 0;

        this._onKeyDown = this._onKeyDown.bind(this);
    }

    // Called by BattleScene when pausing
    show(battleScene) {
        this.battleScene = battleScene;
        this.overlay.classList.add('active');
        this.buttons = Array.from(this.overlay.querySelectorAll('.menu-btn'));
        this.selectedIndex = 0;
        this._updateSelection();

        // Button click handlers
        this.buttons.forEach((btn, i) => {
            btn.onclick = () => {
                this.selectedIndex = i;
                this._confirm();
            };
        });

        window.addEventListener('keydown', this._onKeyDown);
    }

    hide() {
        this.overlay.classList.remove('active');
        window.removeEventListener('keydown', this._onKeyDown);
    }

    _onKeyDown(e) {
        switch (e.key) {
            case 'w': case 'W': case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = (this.selectedIndex - 1 + this.buttons.length) % this.buttons.length;
                this._updateSelection();
                this.game.audio.playSFX('menuNavigate');
                break;
            case 's': case 'S': case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = (this.selectedIndex + 1) % this.buttons.length;
                this._updateSelection();
                this.game.audio.playSFX('menuNavigate');
                break;
            case 'Enter': case ' ':
                e.preventDefault();
                this._confirm();
                break;
            case 'Escape':
                e.preventDefault();
                this.battleScene?.resume();
                break;
        }
    }

    _updateSelection() {
        this.buttons.forEach((btn, i) => {
            btn.classList.toggle('selected', i === this.selectedIndex);
        });
    }

    _confirm() {
        this.game.audio.playSFX('menuSelect');
        const action = this.buttons[this.selectedIndex]?.dataset.action;
        switch (action) {
            case 'resume':
                this.battleScene?.resume();
                break;
            case 'restart':
                this.battleScene?.restart();
                break;
            case 'menu':
                this.hide();
                this.sceneManager.switchTo('mainMenu');
                break;
        }
    }

    // Required scene interface methods (PauseOverlay is registered but not a full scene)
    enter() { }
    exit() { this.hide(); }
    update() { }
    render() { }
}
