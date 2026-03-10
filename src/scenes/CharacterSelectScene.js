import { CHARACTER_ROSTER } from '../config/characters/index.js';
import { AIController } from '../ai/AIController.js';
import { FRAME_HOLD_SECONDS } from '../config/constants.js';

/**
 * CharacterSelectScene — Seleção de personagens para P1 e P2
 * Supports: versus (2P), arcade (vs AI), training
 */
export class CharacterSelectScene {
    constructor() {
        this.game = null;
        this.sceneManager = null;
        this.overlay = document.getElementById('character-select');

        this.selections = {
            player: { index: 0, confirmed: false },
            enemy: { index: 0, confirmed: false }
        };

        this.countdown = null;
        this.countdownTimer = 0;
        this.gameMode = 'versus';
        this.aiDifficulty = 'medium';

        // Animated idle previews rendered on the character cards
        this.idleThumbnails = [];

        this._onKeyDown = this._onKeyDown.bind(this);
    }

    enter(data = {}) {
        this.gameMode = data.gameMode || 'versus';
        this.overlay.classList.add('active');
        document.querySelector('.content').classList.add('hud-hidden');

        // Reset selections
        this.selections.player = { index: 0, confirmed: false };
        this.selections.enemy = { index: Math.min(1, CHARACTER_ROSTER.length - 1), confirmed: false };
        this.countdown = null;
        this.countdownTimer = 0;

        // Build character grids
        this._buildGrids();
        this._updateSelectionUI();
        this._updateModeLabel();

        // Hide countdown
        const cdEl = this.overlay.querySelector('.cs-countdown');
        if (cdEl) { cdEl.classList.remove('visible'); cdEl.textContent = ''; }

        // Hide ready indicators
        this.overlay.querySelectorAll('.cs-ready').forEach(el => el.classList.remove('visible'));

        // Show/hide difficulty selector
        const diffSelector = this.overlay.querySelector('.cs-difficulty');
        if (diffSelector) {
            diffSelector.style.display = this.gameMode === 'arcade' ? 'flex' : 'none';
            // Set active difficulty button
            diffSelector.querySelectorAll('.diff-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.difficulty === this.aiDifficulty);
                btn.onclick = () => {
                    this.aiDifficulty = btn.dataset.difficulty;
                    diffSelector.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.game.audio.playSFX('menuNavigate');
                };
            });
        }

        // In training/arcade mode: auto-confirm enemy after player or handle differently
        const p2Panel = this.overlay.querySelector('.cs-panel.p2');
        if (p2Panel) {
            const p2Label = p2Panel.querySelector('.cs-panel-title');
            if (p2Label) {
                if (this.gameMode === 'arcade') {
                    p2Label.textContent = 'CPU';
                } else if (this.gameMode === 'training') {
                    p2Label.textContent = 'DUMMY';
                } else {
                    p2Label.textContent = 'PLAYER 2';
                }
            }
        }

        window.addEventListener('keydown', this._onKeyDown);
    }

    exit() {
        this.overlay.classList.remove('active');
        this.idleThumbnails = [];
        window.removeEventListener('keydown', this._onKeyDown);
    }

    _updateModeLabel() {
        const label = this.overlay.querySelector('.cs-mode-label');
        if (!label) return;
        const modeNames = { versus: 'VERSUS', arcade: 'ARCADE', training: 'TREINO' };
        label.textContent = modeNames[this.gameMode] || 'VERSUS';
    }

    _buildGrids() {
        const roster = CHARACTER_ROSTER;
        this.idleThumbnails = [];

        ['player', 'enemy'].forEach(playerId => {
            const panel = this.overlay.querySelector(`.cs-panel.${playerId === 'player' ? 'p1' : 'p2'}`);
            const grid = panel.querySelector('.cs-grid');
            grid.innerHTML = '';

            roster.forEach((char, i) => {
                const card = document.createElement('div');
                card.className = 'cs-char-card';
                card.dataset.index = i;

                // Animate the idle spritesheet directly inside the card thumbnail
                const idleSprite = this.game.assetLoader.get(`${char.spriteBasePath}/${char.sprites.idle.src}`);
                const thumbCanvas = document.createElement('canvas');
                const frameWidth = idleSprite.width / char.sprites.idle.framesMax;
                const frameHeight = idleSprite.height;
                const thumbCtx = thumbCanvas.getContext('2d');
                thumbCanvas.width = 96;
                thumbCanvas.height = 74;
                thumbCanvas.className = 'cs-char-thumb';
                thumbCanvas.style.imageRendering = 'pixelated';
                card.appendChild(thumbCanvas);

                this.idleThumbnails.push({
                    canvas: thumbCanvas,
                    ctx: thumbCtx,
                    image: idleSprite,
                    framesMax: char.sprites.idle.framesMax,
                    frameWidth,
                    frameHeight,
                    frameBounds: this._computeFrameBounds(idleSprite, frameWidth, frameHeight, char.sprites.idle.framesMax),
                    framesCurrent: 0,
                    frameTimer: 0,
                    frameHoldTime: FRAME_HOLD_SECONDS,
                    spriteFacingRight: char.spriteFacingRight ?? true
                });

                const nameEl = document.createElement('div');
                nameEl.className = 'cs-char-name';
                nameEl.textContent = char.name;
                card.appendChild(nameEl);

                card.onclick = () => {
                    if (!this.selections[playerId].confirmed) {
                        this.selections[playerId].index = i;
                        this._updateSelectionUI();
                    }
                };

                grid.appendChild(card);
            });
        });
    }

    _computeFrameBounds(image, frameWidth, frameHeight, framesMax) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = frameWidth;
        tempCanvas.height = frameHeight;
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
        const bounds = [];

        for (let frame = 0; frame < framesMax; frame++) {
            tempCtx.clearRect(0, 0, frameWidth, frameHeight);
            tempCtx.drawImage(
                image,
                frame * frameWidth,
                0,
                frameWidth,
                frameHeight,
                0,
                0,
                frameWidth,
                frameHeight
            );

            const { data } = tempCtx.getImageData(0, 0, frameWidth, frameHeight);
            let minX = frameWidth;
            let minY = frameHeight;
            let maxX = -1;
            let maxY = -1;

            for (let y = 0; y < frameHeight; y++) {
                for (let x = 0; x < frameWidth; x++) {
                    const alpha = data[(y * frameWidth + x) * 4 + 3];
                    if (alpha > 0) {
                        if (x < minX) minX = x;
                        if (y < minY) minY = y;
                        if (x > maxX) maxX = x;
                        if (y > maxY) maxY = y;
                    }
                }
            }

            if (maxX === -1 || maxY === -1) {
                bounds.push({ x: 0, y: 0, width: frameWidth, height: frameHeight });
            } else {
                bounds.push({
                    x: minX,
                    y: minY,
                    width: maxX - minX + 1,
                    height: maxY - minY + 1
                });
            }
        }

        return bounds;
    }

    _updateSelectionUI() {
        const roster = CHARACTER_ROSTER;

        ['player', 'enemy'].forEach(playerId => {
            const panelClass = playerId === 'player' ? 'p1' : 'p2';
            const panel = this.overlay.querySelector(`.cs-panel.${panelClass}`);
            const cards = panel.querySelectorAll('.cs-char-card');
            const sel = this.selections[playerId];
            const char = roster[sel.index];

            cards.forEach((card, i) => {
                card.classList.toggle('selected', i === sel.index);
                card.classList.toggle('confirmed', sel.confirmed && i === sel.index);
            });

            // Update stats
            const statsEl = panel.querySelector('.cs-stats');
            if (statsEl && char) {
                statsEl.innerHTML =
                    `${char.name}<br>` +
                    `HP: ${char.stats.health} | SPD: ${char.stats.moveSpeed}<br>` +
                    `ATK1: ${char.attacks.attack1.damage} | ATK2: ${char.attacks.attack2.damage}`;
            }

            // Ready indicator
            const readyEl = panel.querySelector('.cs-ready');
            if (readyEl) readyEl.classList.toggle('visible', sel.confirmed);
        });
    }

    _onKeyDown(e) {
        if (this.countdown !== null) return; // During countdown, ignore input

        const roster = CHARACTER_ROSTER;

        // P1 controls: A/D to navigate, W to confirm, S to go back
        if (!this.selections.player.confirmed) {
            switch (e.key) {
                case 'a': case 'A':
                    this.selections.player.index = (this.selections.player.index - 1 + roster.length) % roster.length;
                    this._updateSelectionUI();
                    this.game.audio.playSFX('menuNavigate');
                    break;
                case 'd': case 'D':
                    this.selections.player.index = (this.selections.player.index + 1) % roster.length;
                    this._updateSelectionUI();
                    this.game.audio.playSFX('menuNavigate');
                    break;
                case 'w': case 'W':
                    this.selections.player.confirmed = true;
                    this._updateSelectionUI();
                    this.game.audio.playSFX('menuSelect');
                    // In arcade/training, auto-confirm enemy with random selection
                    if (this.gameMode === 'arcade' || this.gameMode === 'training') {
                        if (!this.selections.enemy.confirmed) {
                            // Random enemy selection (different from player if possible)
                            let enemyIdx = Math.floor(Math.random() * roster.length);
                            if (roster.length > 1 && enemyIdx === this.selections.player.index) {
                                enemyIdx = (enemyIdx + 1) % roster.length;
                            }
                            this.selections.enemy.index = enemyIdx;
                            this.selections.enemy.confirmed = true;
                            this._updateSelectionUI();
                        }
                    }
                    this._checkBothReady();
                    break;
            }
        } else if (e.key === 's' || e.key === 'S') {
            this.selections.player.confirmed = false;
            // In arcade/training, also unconfirm enemy
            if (this.gameMode === 'arcade' || this.gameMode === 'training') {
                this.selections.enemy.confirmed = false;
            }
            this._updateSelectionUI();
        }

        // P2 controls only in versus mode
        if (this.gameMode === 'versus') {
            if (!this.selections.enemy.confirmed) {
                switch (e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.selections.enemy.index = (this.selections.enemy.index - 1 + roster.length) % roster.length;
                        this._updateSelectionUI();
                        this.game.audio.playSFX('menuNavigate');
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.selections.enemy.index = (this.selections.enemy.index + 1) % roster.length;
                        this._updateSelectionUI();
                        this.game.audio.playSFX('menuNavigate');
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        this.selections.enemy.confirmed = true;
                        this._updateSelectionUI();
                        this.game.audio.playSFX('menuSelect');
                        this._checkBothReady();
                        break;
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.selections.enemy.confirmed = false;
                this._updateSelectionUI();
            }
        }

        // ESC to go back to menu
        if (e.key === 'Escape') {
            this.sceneManager.switchTo('mainMenu');
        }
    }

    _checkBothReady() {
        if (this.selections.player.confirmed && this.selections.enemy.confirmed) {
            this.countdown = 3;
            this.countdownTimer = 0;
            const cdEl = this.overlay.querySelector('.cs-countdown');
            if (cdEl) {
                cdEl.textContent = '3';
                cdEl.classList.add('visible');
            }
        }
    }

    update(deltaTime) {
        this._updateIdleThumbnails(deltaTime);

        if (this.countdown !== null) {
            this.countdownTimer += deltaTime;
            if (this.countdownTimer >= 1) {
                this.countdownTimer -= 1;
                this.countdown--;
                const cdEl = this.overlay.querySelector('.cs-countdown');
                if (this.countdown > 0) {
                    if (cdEl) {
                        cdEl.textContent = this.countdown.toString();
                        // Re-trigger animation
                        cdEl.classList.remove('visible');
                        void cdEl.offsetWidth; // force reflow
                        cdEl.classList.add('visible');
                    }
                } else {
                    // GO!
                    const roster = CHARACTER_ROSTER;
                    const playerConfig = roster[this.selections.player.index];
                    const enemyConfig = roster[this.selections.enemy.index];

                    const battleData = {
                        playerConfig,
                        enemyConfig,
                        gameMode: this.gameMode
                    };

                    // Create AI controller for arcade mode
                    if (this.gameMode === 'arcade') {
                        battleData.aiController = new AIController(this.aiDifficulty);
                    }

                    this.sceneManager.switchTo('battle', battleData);
                }
            }
        }
    }

    _updateIdleThumbnails(deltaTime) {
        this.idleThumbnails.forEach(preview => {
            preview.frameTimer += deltaTime;
            if (preview.frameTimer >= preview.frameHoldTime) {
                preview.frameTimer -= preview.frameHoldTime;
                preview.framesCurrent = (preview.framesCurrent + 1) % preview.framesMax;
            }

            const {
                ctx,
                canvas,
                image,
                frameWidth,
                frameHeight,
                frameBounds,
                framesCurrent,
                spriteFacingRight
            } = preview;
            const bounds = frameBounds[framesCurrent] || { x: 0, y: 0, width: frameWidth, height: frameHeight };
            const paddingX = 8;
            const paddingTop = 4;
            const paddingBottom = 8;
            const availableWidth = canvas.width - paddingX * 2;
            const availableHeight = canvas.height - paddingTop - paddingBottom;
            const scale = Math.min(availableWidth / bounds.width, availableHeight / bounds.height);
            const drawWidth = bounds.width * scale;
            const drawHeight = bounds.height * scale;
            const drawX = (canvas.width - drawWidth) / 2;
            const drawY = paddingTop + (availableHeight - drawHeight) / 2;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.imageSmoothingEnabled = false;
            ctx.save();

            if (!spriteFacingRight) {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
            }

            ctx.drawImage(
                image,
                framesCurrent * frameWidth + bounds.x,
                bounds.y,
                bounds.width,
                bounds.height,
                drawX,
                drawY,
                drawWidth,
                drawHeight
            );

            ctx.restore();
        });
    }

    render(ctx) {
        const { canvas } = this.game;
        ctx.fillStyle = '#0a0520';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}
