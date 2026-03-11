/**
 * PostMatchScene - Resultado da partida + estatisticas + navegacao
 */
import {
    advanceTowerState,
    createTowerAIController,
    getTowerOpponentConfig,
    getTowerTotalFights,
    getTowerStage,
    isTowerComplete,
    restartTowerState
} from '../systems/TowerManager.js';

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

        const winnerEl = this.overlay.querySelector('.pm-winner');
        if (winnerEl) {
            let winnerText = data.winnerText || 'Fim de Partida';
            if (data.gameMode === 'tower' && data.towerState) {
                winnerText += ` (${getTowerStage(data.towerState)}/${getTowerTotalFights(data.towerState)})`;
            }
            winnerEl.textContent = winnerText;
        }

        this._fillStats(data.stats);

        this.buttons = Array.from(this.overlay.querySelectorAll('.menu-btn'));
        this.selectedIndex = 0;
        this._updateButtonLabels();
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
            { label: 'MAX COMBO', p1: stats.player.maxCombo, p2: stats.enemy.maxCombo }
        ];

        const fragment = document.createDocumentFragment();
        rows.forEach(row => {
            fragment.append(
                this._createStatCell('stat-p1', row.p1),
                this._createStatCell('stat-label', row.label),
                this._createStatCell('stat-p2', row.p2)
            );
        });
        container.replaceChildren(fragment);
    }

    _onKeyDown(e) {
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
    }

    _createStatCell(className, value) {
        const cell = document.createElement('div');
        cell.className = className;
        cell.textContent = String(value);
        return cell;
    }

    _didPlayerWin() {
        return (this.matchData?.roundsWon?.player || 0) > (this.matchData?.roundsWon?.enemy || 0);
    }

    _updateButtonLabels() {
        const rematchBtn = this.buttons.find(btn => btn.dataset.action === 'rematch');
        const charselectBtn = this.buttons.find(btn => btn.dataset.action === 'charselect');

        if (this.matchData?.gameMode === 'tower') {
            if (rematchBtn) {
                if (this._didPlayerWin()) {
                    rematchBtn.textContent = isTowerComplete(this.matchData.towerState)
                        ? 'NOVA TORRE'
                        : 'PROXIMA LUTA';
                } else {
                    rematchBtn.textContent = 'REINICIAR TORRE';
                }
            }
            if (charselectBtn) {
                charselectBtn.textContent = 'SELECAO DE PERSONAGEM';
            }
            return;
        }

        if (rematchBtn) rematchBtn.textContent = 'REVANCHE';
        if (charselectBtn) charselectBtn.textContent = 'SELECAO DE PERSONAGEM';
    }

    _confirm() {
        this.game.audio.playSFX('menuSelect');
        const action = this.buttons[this.selectedIndex]?.dataset.action;
        switch (action) {
            case 'rematch':
                if (this.matchData.gameMode === 'tower') {
                    this._handleTowerRematch();
                    break;
                }
                this.sceneManager.switchTo('battle', {
                    playerConfig: this.matchData.playerConfig,
                    enemyConfig: this.matchData.enemyConfig,
                    gameMode: this.matchData.gameMode || 'versus',
                    aiController: this.matchData.aiController || null
                });
                break;
            case 'charselect':
                this.sceneManager.switchTo('characterSelect', {
                    gameMode: this.matchData.gameMode || 'versus',
                    aiDifficulty: this.matchData.towerState?.initialDifficulty
                        || this.matchData.aiController?.difficulty
                        || 'medium'
                });
                break;
            case 'menu':
                this.sceneManager.switchTo('mainMenu');
                break;
        }
    }

    _handleTowerRematch() {
        const towerState = this.matchData.towerState;
        if (!towerState) {
            this.sceneManager.switchTo('characterSelect', { gameMode: 'tower' });
            return;
        }

        if (!this._didPlayerWin()) {
            const resetState = restartTowerState(towerState);
            this.sceneManager.switchTo('battle', {
                playerConfig: this.matchData.playerConfig,
                enemyConfig: getTowerOpponentConfig(resetState),
                gameMode: 'tower',
                towerState: resetState,
                aiController: createTowerAIController(resetState)
            });
            return;
        }

        if (isTowerComplete(towerState)) {
            this.sceneManager.switchTo('characterSelect', {
                gameMode: 'tower',
                aiDifficulty: towerState.initialDifficulty || 'medium'
            });
            return;
        }

        const nextState = advanceTowerState(towerState);
        this.sceneManager.switchTo('battle', {
            playerConfig: this.matchData.playerConfig,
            enemyConfig: getTowerOpponentConfig(nextState),
            gameMode: 'tower',
            towerState: nextState,
            aiController: createTowerAIController(nextState)
        });
    }

    update() {}

    render(ctx) {
        const { canvas } = this.game;
        ctx.fillStyle = '#0a0520';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}
