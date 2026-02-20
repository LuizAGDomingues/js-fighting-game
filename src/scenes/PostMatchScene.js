/**
 * PostMatchScene — Resultado da partida + estatísticas + navegação
 */
export class PostMatchScene {
    constructor() {
        this.game = null;
        this.sceneManager = null;
        this.overlay = document.getElementById('post-match');

        this.buttons = [];
        this.selectedIndex = 0;
        this.matchData = null;

        this._onKeyDown = this._onKeyDown.bind(this);
    }

    enter(data = {}) {
        this.matchData = data;
        this.overlay.classList.add('active');
        document.querySelector('.content').classList.add('hud-hidden');

        // Set winner text
        const winnerEl = this.overlay.querySelector('.pm-winner');
        if (winnerEl) winnerEl.textContent = data.winnerText || 'Fim de Partida';

        // Fill stats
        this._fillStats(data.stats);

        // Setup buttons
        this.buttons = Array.from(this.overlay.querySelectorAll('.menu-btn'));
        this.selectedIndex = 0;
        this._updateSelection();

        this.buttons.forEach((btn, i) => {
            btn.onclick = () => {
                this.selectedIndex = i;
                this._confirm();
            };
        });

        window.addEventListener('keydown', this._onKeyDown);
    }

    exit() {
        this.overlay.classList.remove('active');
        window.removeEventListener('keydown', this._onKeyDown);
    }

    _fillStats(stats) {
        if (!stats) return;
        const container = this.overlay.querySelector('.pm-stats');
        if (!container) return;

        const rows = [
            { label: 'DANO', p1: stats.player.damageDealt, p2: stats.enemy.damageDealt },
            { label: 'HITS', p1: stats.player.hits, p2: stats.enemy.hits },
            { label: 'MAX COMBO', p1: stats.player.maxCombo, p2: stats.enemy.maxCombo },
            { label: 'BLOQUEIOS', p1: stats.player.blocks, p2: stats.enemy.blocks },
        ];

        container.innerHTML = '';
        rows.forEach(row => {
            container.innerHTML +=
                `<div class="stat-p1">${row.p1}</div>` +
                `<div class="stat-label">${row.label}</div>` +
                `<div class="stat-p2">${row.p2}</div>`;
        });
    }

    _onKeyDown(e) {
        switch (e.key) {
            case 'w': case 'W': case 'ArrowUp':
                this.selectedIndex = (this.selectedIndex - 1 + this.buttons.length) % this.buttons.length;
                this._updateSelection();
                this.game.audio.playSFX('menuNavigate');
                break;
            case 's': case 'S': case 'ArrowDown':
                this.selectedIndex = (this.selectedIndex + 1) % this.buttons.length;
                this._updateSelection();
                this.game.audio.playSFX('menuNavigate');
                break;
            case 'Enter': case ' ':
                this._confirm();
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
            case 'rematch':
                this.sceneManager.switchTo('battle', {
                    playerConfig: this.matchData.playerConfig,
                    enemyConfig: this.matchData.enemyConfig,
                    gameMode: this.matchData.gameMode || 'versus',
                    aiController: this.matchData.aiController || null
                });
                break;
            case 'charselect':
                this.sceneManager.switchTo('characterSelect');
                break;
            case 'menu':
                this.sceneManager.switchTo('mainMenu');
                break;
        }
    }

    update() { }

    render(ctx) {
        const { canvas } = this.game;
        ctx.fillStyle = '#0a0520';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}
