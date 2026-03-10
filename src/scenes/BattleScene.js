import { CANVAS_WIDTH, CANVAS_HEIGHT, JUMP_VELOCITY, MATCH_DURATION } from '../config/constants.js';
import { Sprite } from '../entities/Sprite.js';
import { Fighter, AnimState } from '../entities/Fighter.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { ScreenShake } from '../effects/ScreenShake.js';
import { ParticleSystem } from '../effects/ParticleSystem.js';
import { DamageNumbers } from '../effects/DamageNumbers.js';
import { ComboDisplay } from '../effects/ComboDisplay.js';

/**
 * BattleScene â€” ContÃ©m toda a lÃ³gica de batalha
 */
export class BattleScene {
    constructor() {
        this.game = null;
        this.sceneManager = null;

        this.background = null;
        this.shop = null;
        this.player = null;
        this.enemy = null;
        this.collision = new CollisionSystem();
        this.combatSystem = new CombatSystem();

        // Effects
        this.screenShake = new ScreenShake();
        this.particles = new ParticleSystem();
        this.damageNumbers = new DamageNumbers();
        this.comboDisplay = new ComboDisplay();

        this.timer = MATCH_DURATION;
        this.timerAccumulator = 0;
        this.gameIsOver = false;
        this.isPaused = false;

        this.playerConfig = null;
        this.enemyConfig = null;

        // Game mode: 'versus', 'arcade', 'training'
        this.gameMode = 'versus';
        this.aiController = null;

        // Round system
        this.roundsToWin = 2;
        this.roundsWon = { player: 0, enemy: 0 };
        this.currentRound = 1;
        this.roundTransition = false;
        this.roundTransitionTimer = 0;

        // Stats tracking for post-match
        this.stats = {
            player: { damageDealt: 0, hits: 0, maxCombo: 0, blocks: 0 },
            enemy: { damageDealt: 0, hits: 0, maxCombo: 0, blocks: 0 }
        };

        // Dust emission tracking
        this._dustTimers = { player: 0, enemy: 0 };

        // Background cache (off-screen canvas)
        this._bgCache = null;

        this.showTrainingHitboxes = false;

        this._onKeyDown = this._onKeyDown.bind(this);
    }

    enter(data = {}) {
        this.playerConfig = data.playerConfig || this.game.playerConfig;
        this.enemyConfig = data.enemyConfig || this.game.enemyConfig;
        this.gameMode = data.gameMode || 'versus';
        this.aiController = data.aiController || null;

        document.querySelector('.content').classList.remove('hud-hidden');

        // Create entities
        this._createEntities();

        // Reset state
        this.timer = MATCH_DURATION;
        this.timerAccumulator = 0;
        this.gameIsOver = false;
        this.isPaused = false;
        this.roundsWon = { player: 0, enemy: 0 };
        this.currentRound = 1;
        this.roundTransition = false;
        this.roundTransitionTimer = 0;
        this.stats = {
            player: { damageDealt: 0, hits: 0, maxCombo: 0, blocks: 0 },
            enemy: { damageDealt: 0, hits: 0, maxCombo: 0, blocks: 0 }
        };
        this._dustTimers = { player: 0, enemy: 0 };
        this.showTrainingHitboxes = false;

        // Reset effects
        this.screenShake.reset();
        this.particles.reset();
        this.damageNumbers.reset();
        this.comboDisplay.reset();

        // Reset UI
        this.game.ui.resetHealthBars();
        this.game.ui.hideResult();
        this.game.ui.updateTimer(this.timer);
        this._updateRoundIndicators();

        // Bind input
        this.game.inputHandler.bind();
        window.addEventListener('keydown', this._onKeyDown);

        // Start music
        if (this.game._audioInitialized) {
            this.game.audio.playMusic('./audio/Perimore.mp3');
        }
    }

    exit() {
        window.removeEventListener('keydown', this._onKeyDown);
        this.game.inputHandler.unbind();
        document.querySelector('.content').classList.add('hud-hidden');
    }

    _onKeyDown(e) {
        if (e.key === 'Escape' && !this.gameIsOver) {
            this._togglePause();
        }

        if ((e.key === 'h' || e.key === 'H') && this.gameMode === 'training') {
            this.showTrainingHitboxes = !this.showTrainingHitboxes;
        }

        // Audio init on first keypress
        if (!this.game._audioInitialized) {
            this.game.audio.initContext();
            this.game.audio.playMusic('./audio/Perimore.mp3');
            this.game._audioInitialized = true;
        }
    }

    _togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.sceneManager.scenes.pause?.show(this);
        } else {
            this.sceneManager.scenes.pause?.hide();
        }
    }

    resume() {
        this.isPaused = false;
        this.sceneManager.scenes.pause?.hide();
    }

    restart() {
        this.enter({
            playerConfig: this.playerConfig,
            enemyConfig: this.enemyConfig,
            gameMode: this.gameMode,
            aiController: this.aiController
        });
        this.sceneManager.scenes.pause?.hide();
    }

    _buildFighterSprites(config) {
        const loader = this.game.assetLoader;
        const sprites = {};
        for (const [key, spriteInfo] of Object.entries(config.sprites)) {
            const path = `${config.spriteBasePath}/${spriteInfo.src}`;
            sprites[key] = {
                image: loader.get(path),
                framesMax: spriteInfo.framesMax
            };
        }
        return sprites;
    }

    _createEntities() {
        const loader = this.game.assetLoader;

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

        const pConfig = this.playerConfig;
        const eConfig = this.enemyConfig;
        const playerSprites = this._buildFighterSprites(pConfig);
        const enemySprites = this._buildFighterSprites(eConfig);

        this.player = new Fighter({
            position: { x: 200, y: 0 },
            velocity: { x: 0, y: 0 },
            image: playerSprites.idle.image,
            framesMax: playerSprites.idle.framesMax,
            scale: pConfig.scale,
            offset: pConfig.offset,
            sprites: playerSprites,
            attackBox: pConfig.attacks.attack1.attackBox,
            characterConfig: pConfig
        });
        this.player.facingRight = true;

        this.enemy = new Fighter({
            position: { x: 700, y: 0 },
            velocity: { x: 0, y: 0 },
            color: 'blue',
            image: enemySprites.idle.image,
            framesMax: enemySprites.idle.framesMax,
            scale: eConfig.scale,
            offset: eConfig.offset,
            sprites: enemySprites,
            attackBox: eConfig.attacks.attack1.attackBox,
            characterConfig: eConfig
        });
        this.enemy.facingRight = false;
        this.player.updateAttackBox();
        this.enemy.updateAttackBox();
    }

    update(deltaTime) {
        if (this.isPaused || this.gameIsOver) return;

        // Round transition pause
        if (this.roundTransition) {
            this.roundTransitionTimer -= deltaTime;
            if (this.roundTransitionTimer <= 0) {
                this.roundTransition = false;
                this._startNewRound();
            }
            return;
        }

        const { player, enemy, collision, combatSystem } = this;
        const inputHandler = this.game.inputHandler;

        // Update input system
        inputHandler.update(deltaTime);

        // Update combat system
        combatSystem.update(deltaTime);

        // Update effects
        this.screenShake.update(deltaTime);
        this.particles.update(deltaTime);
        this.damageNumbers.update(deltaTime);
        this.comboDisplay.update(deltaTime);

        // Timer
        this.timerAccumulator += deltaTime;
        if (this.timerAccumulator >= 1) {
            this.timerAccumulator -= 1;
            this.timer--;
            this.game.ui.updateTimer(this.timer);
            if (this.timer <= 0) {
                this._endRound();
                return;
            }
        }

        // Process fighter inputs
        this._handleFighterInput(player, 'player');
        if (this.gameMode === 'arcade' && this.aiController) {
            this._handleAIInput(enemy, deltaTime);
        } else if (this.gameMode === 'training') {
            this._handleTrainingDummy(enemy);
        } else {
            this._handleFighterInput(enemy, 'enemy');
        }

        // Update entities before resolving hits so collision matches the rendered frame
        player.update(deltaTime);
        enemy.update(deltaTime);

        // Auto-face opponents toward each other
        if (!player.dead && !enemy.dead) {
            player.facingRight = player.position.x < enemy.position.x;
            enemy.facingRight = enemy.position.x < player.position.x;
        }

        player.updateAttackBox();
        enemy.updateAttackBox();

        // Dust particles when running on ground
        this._handleDustParticles(player, 'player', deltaTime);
        this._handleDustParticles(enemy, 'enemy', deltaTime);

        // Player hits enemy
        if (collision.checkAttackHit(player, enemy)) {
            if (!enemy.isInvulnerable) {
                const attackData = player.characterConfig?.attacks[player.currentAttack]
                    || { damage: 20, knockback: { x: 3, y: -2 } };
                const result = combatSystem.processHit(player, enemy, attackData, 'player');
                enemy.takeHit(result.damage);
                this.game.ui.updateHealth('enemy', (enemy.health / enemy.maxHealth) * 100);
                this.game.audio.playSFX(result.type === 'blocked' ? 'block' : 'hit');

                // Visual effects
                const hitX = enemy.position.x + enemy.width / 2;
                const hitY = enemy.position.y + enemy.height / 2;

                if (result.type === 'blocked') {
                    this.screenShake.trigger(3, 0.15);
                    enemy.triggerShieldHit();
                    this.particles.emit('shieldHit', hitX, hitY, 12);
                    this.damageNumbers.spawn(hitX, hitY - 20, result.damage, 'blocked');
                } else {
                    const combo = combatSystem.getComboCount?.('player') || 0;
                    const isCombo = combo >= 3;
                    this.screenShake.trigger(isCombo ? 8 : 5, isCombo ? 0.3 : 0.2);
                    this.particles.emit('hit', hitX, hitY, isCombo ? 15 : 10);
                    this.damageNumbers.spawn(hitX, hitY - 20, result.damage, isCombo ? 'combo' : 'normal');
                    if (combo >= 2) this.comboDisplay.show(combo, 'player');
                }

                // Track stats
                this.stats.player.damageDealt += result.damage;
                this.stats.player.hits++;
                if (result.type === 'blocked') this.stats.enemy.blocks++;
                const combo = combatSystem.getComboCount?.('player') || 0;
                if (combo > this.stats.player.maxCombo) this.stats.player.maxCombo = combo;
            }
        }

        // Enemy hits player
        if (collision.checkAttackHit(enemy, player)) {
            if (!player.isInvulnerable) {
                const attackData = enemy.characterConfig?.attacks[enemy.currentAttack]
                    || { damage: 20, knockback: { x: 3, y: -2 } };
                const result = combatSystem.processHit(enemy, player, attackData, 'enemy');
                player.takeHit(result.damage);
                this.game.ui.updateHealth('player', (player.health / player.maxHealth) * 100);
                this.game.audio.playSFX(result.type === 'blocked' ? 'block' : 'hit');

                // Visual effects
                const hitX = player.position.x + player.width / 2;
                const hitY = player.position.y + player.height / 2;

                if (result.type === 'blocked') {
                    this.screenShake.trigger(3, 0.15);
                    player.triggerShieldHit();
                    this.particles.emit('shieldHit', hitX, hitY, 12);
                    this.damageNumbers.spawn(hitX, hitY - 20, result.damage, 'blocked');
                } else {
                    const combo = combatSystem.getComboCount?.('enemy') || 0;
                    const isCombo = combo >= 3;
                    this.screenShake.trigger(isCombo ? 8 : 5, isCombo ? 0.3 : 0.2);
                    this.particles.emit('hit', hitX, hitY, isCombo ? 15 : 10);
                    this.damageNumbers.spawn(hitX, hitY - 20, result.damage, isCombo ? 'combo' : 'normal');
                    if (combo >= 2) this.comboDisplay.show(combo, 'enemy');
                }

                // Track stats
                this.stats.enemy.damageDealt += result.damage;
                this.stats.enemy.hits++;
                if (result.type === 'blocked') this.stats.player.blocks++;
                const combo = combatSystem.getComboCount?.('enemy') || 0;
                if (combo > this.stats.enemy.maxCombo) this.stats.enemy.maxCombo = combo;
            }
        }

        // Reset attack states
        collision.resetAttackState(player);
        collision.resetAttackState(enemy);

        // Training mode: health regen
        if (this.gameMode === 'training') {
            enemy.health = enemy.maxHealth;
            this.game.ui.updateHealth('enemy', 100);
        }

        // Win conditions
        if (enemy.health <= 0 || player.health <= 0) {
            this._endRound();
        }

        // Clear just-pressed flags after all input has been consumed
        inputHandler.endFrame();
    }

    _handleDustParticles(fighter, id, deltaTime) {
        if (fighter.dead) return;
        // Running dust
        if (fighter.isGrounded && Math.abs(fighter.velocity.x) > 2) {
            this._dustTimers[id] += deltaTime;
            if (this._dustTimers[id] > 0.08) {
                this._dustTimers[id] = 0;
                if (Math.random() < 0.4) {
                    const footX = fighter.position.x + fighter.width / 2;
                    const footY = fighter.position.y + fighter.height;
                    this.particles.emit('dust', footX, footY, 2, -Math.PI / 2);
                }
            }
        } else {
            this._dustTimers[id] = 0;
        }
    }

    _handleAIInput(fighter, deltaTime) {
        if (!this.aiController || fighter.dead) return;
        const actions = this.aiController.decide(fighter, this.player, deltaTime);
        this._applyAIActions(fighter, actions);
    }

    _handleTrainingDummy(fighter) {
        if (fighter.dead) return;

        fighter.block(false);

        if (!fighter.isDashing && fighter.currentState !== AnimState.TAKE_HIT) {
            fighter.velocity.x = 0;
        }

        if (fighter.velocity.y < 0) {
            fighter.switchSprite(AnimState.JUMP);
            return;
        }

        if (fighter.velocity.y > 0) {
            fighter.switchSprite(AnimState.FALL);
            return;
        }

        if (!fighter.isAttacking && !fighter.isBlocking && !fighter.isDashing) {
            fighter.switchSprite(AnimState.IDLE);
        }
    }
    _applyAIActions(fighter, actions) {
        const moveSpeed = fighter.characterConfig?.stats?.moveSpeed || 5;
        const jumpVelocity = fighter.characterConfig?.stats?.jumpVelocity || JUMP_VELOCITY;
        const isAttacking = fighter.isAttacking;

        // Block
        fighter.block(actions.block);

        // Movement
        if (!isAttacking && !fighter.isBlocking && !fighter.isDashing) {
            if (actions.left && fighter.position.x >= 0) {
                fighter.velocity.x = -moveSpeed;
                fighter.switchSprite(AnimState.RUN);
            } else if (actions.right && fighter.position.x <= CANVAS_WIDTH - fighter.width) {
                fighter.velocity.x = moveSpeed;
                fighter.switchSprite(AnimState.RUN);
            } else {
                fighter.velocity.x = 0;
                fighter.switchSprite(AnimState.IDLE);
            }
        } else if (!fighter.isDashing) {
            fighter.velocity.x = 0;
        }

        // Jump/Fall
        if (fighter.velocity.y < 0) {
            fighter.switchSprite(AnimState.JUMP);
        } else if (fighter.velocity.y > 0) {
            fighter.switchSprite(AnimState.FALL);
        }

        // Jump
        if (actions.jump && fighter.isGrounded && !fighter.isBlocking) {
            fighter.velocity.y = jumpVelocity;
        }

        // Attacks
        if (!fighter.isBlocking && !fighter.isDashing) {
            if (actions.attack1 && !fighter.isAttacking) {
                fighter.attack('attack1');
            } else if (actions.attack2 && !fighter.isAttacking) {
                fighter.attack('attack2');
            }
        }

        // Dash
        if (actions.dash && !fighter.isBlocking && !fighter.isDashing) {
            fighter.dash(actions.dashDirection || 1);
            this.game.audio.playSFX('whoosh');
        }
    }

    _endRound() {
        // Determine round winner
        let roundWinner = null;
        if (this.player.health === this.enemy.health) {
            // Draw â€” no one wins the round
        } else if (this.player.health > this.enemy.health) {
            roundWinner = 'player';
        } else {
            roundWinner = 'enemy';
        }

        if (roundWinner) {
            this.roundsWon[roundWinner]++;
        }
        this._updateRoundIndicators();

        // Check if match is over
        if (this.roundsWon.player >= this.roundsToWin ||
            this.roundsWon.enemy >= this.roundsToWin) {
            this._endMatch();
        } else {
            // Transition to next round
            this.roundTransition = true;
            this.roundTransitionTimer = 2;
            this.currentRound++;

            // Show round text
            this.game.ui.showResult(`Round ${this.currentRound}`);
        }
    }

    _startNewRound() {
        // Reset fighters
        this.player.reset();
        this.enemy.reset();
        this.player.facingRight = true;
        this.enemy.facingRight = false;
        this.player.updateAttackBox();
        this.enemy.updateAttackBox();
        this.showTrainingHitboxes = false;

        // Reset timer
        this.timer = MATCH_DURATION;
        this.timerAccumulator = 0;

        // Reset effects
        this.screenShake.reset();
        this.particles.reset();
        this.damageNumbers.reset();
        this.comboDisplay.reset();
        this.combatSystem.reset();

        // Reset UI
        this.game.ui.resetHealthBars();
        this.game.ui.hideResult();
        this.game.ui.updateTimer(this.timer);
    }

    _endMatch() {
        this.gameIsOver = true;
        this.game.audio.stopMusic();
        this.game.audio.playSFX('victory');

        // Determine winner text
        let winnerText;
        if (this.roundsWon.player === this.roundsWon.enemy) {
            winnerText = 'Empate';
        } else if (this.roundsWon.player > this.roundsWon.enemy) {
            winnerText = `${this.playerConfig.name} Venceu!`;
        } else {
            winnerText = `${this.enemyConfig.name} Venceu!`;
        }

        // Go to post-match after short delay
        setTimeout(() => {
            this.sceneManager.switchTo('postMatch', {
                winnerText,
                stats: this.stats,
                playerConfig: this.playerConfig,
                enemyConfig: this.enemyConfig,
                roundsWon: this.roundsWon,
                gameMode: this.gameMode,
                aiController: this.aiController
            });
        }, 1500);
    }

    _updateRoundIndicators() {
        // Update HUD round dots
        const p1Rounds = document.getElementById('p1-rounds');
        const p2Rounds = document.getElementById('p2-rounds');
        if (p1Rounds) {
            p1Rounds.innerHTML = this._renderRoundDots(this.roundsWon.player);
        }
        if (p2Rounds) {
            p2Rounds.innerHTML = this._renderRoundDots(this.roundsWon.enemy);
        }
    }

    _renderRoundDots(won) {
        let html = '';
        for (let i = 0; i < this.roundsToWin; i++) {
            html += `<span class="round-dot ${i < won ? 'won' : ''}"></span>`;
        }
        return html;
    }

    _handleFighterInput(fighter, playerId) {
        if (fighter.dead) return;

        const inputHandler = this.game.inputHandler;
        const moveSpeed = fighter.characterConfig?.stats?.moveSpeed || 5;
        const jumpVelocity = fighter.characterConfig?.stats?.jumpVelocity || JUMP_VELOCITY;
        const isAttacking = fighter.isAttacking;

        // Block
        fighter.block(inputHandler.isPressed('block', playerId));

        // Dash
        if (!fighter.isBlocking && !fighter.isDashing) {
            const dashDir = inputHandler.consumeDash(playerId);
            if (dashDir !== 0) {
                fighter.dash(dashDir);
                this.game.audio.playSFX('whoosh');
                // Dash particles
                const dashX = fighter.position.x + fighter.width / 2;
                const dashY = fighter.position.y + fighter.height / 2;
                this.particles.emit('dash', dashX, dashY, 6, dashDir > 0 ? Math.PI : 0);
            }
        }

        // Movement
        if (!isAttacking && !fighter.isBlocking && !fighter.isDashing) {
            if (inputHandler.isDirectionActive('left', playerId) && fighter.position.x >= 0) {
                fighter.velocity.x = -moveSpeed;
                fighter.switchSprite(AnimState.RUN);
            } else if (inputHandler.isDirectionActive('right', playerId) &&
                fighter.position.x <= CANVAS_WIDTH - fighter.width) {
                fighter.velocity.x = moveSpeed;
                fighter.switchSprite(AnimState.RUN);
            } else {
                fighter.velocity.x = 0;
                fighter.switchSprite(AnimState.IDLE);
            }
        } else if (!fighter.isDashing) {
            fighter.velocity.x = 0;
        }

        // Jump/Fall
        if (fighter.velocity.y < 0) {
            fighter.switchSprite(AnimState.JUMP);
        } else if (fighter.velocity.y > 0) {
            fighter.switchSprite(AnimState.FALL);
        }

        // Jump input
        if (inputHandler.isPressed('jump', playerId) &&
            fighter.isGrounded &&
            !fighter.isBlocking) {
            fighter.velocity.y = jumpVelocity;
        }

        // Attack inputs
        if (!fighter.isBlocking && !fighter.isDashing) {
            if (inputHandler.wasJustPressed('attack1', playerId) && !fighter.isAttacking) {
                fighter.attack('attack1');
            } else if (inputHandler.wasJustPressed('attack2', playerId) && !fighter.isAttacking) {
                fighter.attack('attack2');
            }
        }
    }

    render(ctx) {
        const { canvas } = this.game;

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Apply screen shake
        const shake = this.screenShake.getOffset();
        ctx.save();
        ctx.translate(shake.x, shake.y);

        // Background
        this.background.update(ctx, this.game._lastDeltaTime || 0);

        // Animated shop
        this.shop.update(ctx, this.game._lastDeltaTime || 0);

        // Fighters
        this.player.draw(ctx);
        this.enemy.draw(ctx);

        // Training mode: show hitboxes
        if (this.gameMode === 'training' && this.showTrainingHitboxes) {
            this._drawHitboxes(ctx);
        }

        // Particles
        this.particles.render(ctx);

        // Damage numbers
        this.damageNumbers.render(ctx);

        // Combo display
        this.comboDisplay.render(ctx);

        ctx.restore(); // Undo shake translation

        // Round transition overlay
        if (this.roundTransition) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    _drawHitboxes(ctx) {
        // Draw collision boxes
        [this.player, this.enemy].forEach(fighter => {
            if (fighter.dead) return;

            // Body hitbox
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 1;
            ctx.strokeRect(fighter.position.x, fighter.position.y, fighter.width, fighter.height);

            // Attack box
            if (fighter.isAttacking && fighter.isInHitFrame) {
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 2;
                ctx.strokeRect(
                    fighter.attackBox.position.x,
                    fighter.attackBox.position.y,
                    fighter.attackBox.width,
                    fighter.attackBox.height
                );
            }
        });
    }
}





