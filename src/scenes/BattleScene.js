import { CANVAS_WIDTH, JUMP_VELOCITY, MATCH_DURATION } from '../config/constants.js';
import { Sprite } from '../entities/Sprite.js';
import { Fighter, AnimState } from '../entities/Fighter.js';
import { Projectile } from '../entities/Projectile.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { ScreenShake } from '../effects/ScreenShake.js';
import { ParticleSystem } from '../effects/ParticleSystem.js';
import { DamageNumbers } from '../effects/DamageNumbers.js';
import { ComboDisplay } from '../effects/ComboDisplay.js';
import { AIController } from '../ai/AIController.js';
import { createTowerAIController, isTowerComplete } from '../systems/TowerManager.js';

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

        this.gameMode = 'versus';
        this.aiController = null;
        this.towerState = null;

        this.roundsToWin = 2;
        this.roundsWon = { player: 0, enemy: 0 };
        this.currentRound = 1;
        this.roundTransition = false;
        this.roundTransitionTimer = 0;

        this.stats = {
            player: { damageDealt: 0, hits: 0, maxCombo: 0 },
            enemy: { damageDealt: 0, hits: 0, maxCombo: 0 }
        };

        this._dustTimers = { player: 0, enemy: 0 };
        this.projectiles = [];
        this.showTrainingHitboxes = false;

        this._onKeyDown = this._onKeyDown.bind(this);
    }

    enter(data = {}) {
        this.playerConfig = data.playerConfig || this.game.playerConfig;
        this.enemyConfig = data.enemyConfig || this.game.enemyConfig;
        this.gameMode = data.gameMode || 'versus';
        this.aiController = data.aiController || null;
        this.towerState = data.towerState || null;

        document.querySelector('.content').classList.remove('hud-hidden');

        this._createEntities();

        this.timer = MATCH_DURATION;
        this.timerAccumulator = 0;
        this.gameIsOver = false;
        this.isPaused = false;
        this.roundsWon = { player: 0, enemy: 0 };
        this.currentRound = 1;
        this.roundTransition = false;
        this.roundTransitionTimer = 0;
        this.stats = {
            player: { damageDealt: 0, hits: 0, maxCombo: 0 },
            enemy: { damageDealt: 0, hits: 0, maxCombo: 0 }
        };
        this._dustTimers = { player: 0, enemy: 0 };
        this.showTrainingHitboxes = false;

        this.screenShake.reset();
        this.particles.reset();
        this.damageNumbers.reset();
        this.comboDisplay.reset();

        this.game.ui.resetHealthBars();
        this.game.ui.hideResult();
        this.game.ui.updateTimer(this.timer);
        this.game.ui.setCharacterNames(this.playerConfig.name, this.enemyConfig.name);
        this._updateRoundIndicators();

        this.game.inputHandler.bind();
        window.addEventListener('keydown', this._onKeyDown);

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
        let aiController = this.aiController;
        if (this.gameMode === 'arcade' && this.aiController) {
            aiController = new AIController(this.aiController.difficulty);
        } else if (this.gameMode === 'tower' && this.towerState) {
            aiController = createTowerAIController(this.towerState);
        }

        this.enter({
            playerConfig: this.playerConfig,
            enemyConfig: this.enemyConfig,
            gameMode: this.gameMode,
            aiController,
            towerState: this.towerState
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
        if (pConfig.projectile) {
            this.player.onProjectileFire = fighter => this._spawnProjectile(fighter, pConfig);
        }

        this.enemy = new Fighter({
            position: { x: 700, y: 0 },
            velocity: { x: 0, y: 0 },
            image: enemySprites.idle.image,
            framesMax: enemySprites.idle.framesMax,
            scale: eConfig.scale,
            offset: eConfig.offset,
            sprites: enemySprites,
            attackBox: eConfig.attacks.attack1.attackBox,
            characterConfig: eConfig
        });
        this.enemy.facingRight = false;
        if (eConfig.projectile) {
            this.enemy.onProjectileFire = fighter => this._spawnProjectile(fighter, eConfig);
        }

        this.player.updateAttackBox();
        this.enemy.updateAttackBox();
    }

    update(deltaTime) {
        if (this.isPaused || this.gameIsOver) return;

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

        inputHandler.update(deltaTime);
        combatSystem.update(deltaTime);
        this.screenShake.update(deltaTime);
        this.particles.update(deltaTime);
        this.damageNumbers.update(deltaTime);
        this.comboDisplay.update(deltaTime);

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

        this._handleFighterInput(player, 'player');
        if ((this.gameMode === 'arcade' || this.gameMode === 'tower') && this.aiController) {
            this._handleAIInput(enemy, deltaTime);
        } else if (this.gameMode === 'training') {
            this._handleTrainingDummy(enemy);
        } else {
            this._handleFighterInput(enemy, 'enemy');
        }

        player.update(deltaTime);
        enemy.update(deltaTime);

        if (!player.dead && !enemy.dead) {
            player.facingRight = player.position.x < enemy.position.x;
            enemy.facingRight = enemy.position.x < player.position.x;
        }

        player.updateAttackBox();
        enemy.updateAttackBox();

        this._handleDustParticles(player, 'player', deltaTime);
        this._handleDustParticles(enemy, 'enemy', deltaTime);

        if (collision.checkAttackHit(player, enemy) && !enemy.isInvulnerable) {
            const attackData = player.characterConfig?.attacks[player.currentAttack]
                || { damage: 20, knockback: { x: 3, y: -2 } };
            const result = combatSystem.processHit(player, enemy, attackData, 'player');
            enemy.takeHit(result.damage);
            this.game.ui.updateHealth('enemy', (enemy.health / enemy.maxHealth) * 100);
            this.game.audio.playSFX('hit');

            const hitX = enemy.position.x + enemy.width / 2;
            const hitY = enemy.position.y + enemy.height / 2;
            const combo = combatSystem.getComboCount?.('player') || 0;
            const isCombo = combo >= 3;

            this.screenShake.trigger(isCombo ? 8 : 5, isCombo ? 0.3 : 0.2);
            this.particles.emit('hit', hitX, hitY, isCombo ? 15 : 10);
            this.damageNumbers.spawn(hitX, hitY - 20, result.damage, isCombo ? 'combo' : 'normal');
            if (combo >= 2) this.comboDisplay.show(combo, 'player');

            this.stats.player.damageDealt += result.damage;
            this.stats.player.hits++;
            if (combo > this.stats.player.maxCombo) this.stats.player.maxCombo = combo;
        }

        if (collision.checkAttackHit(enemy, player) && !player.isInvulnerable) {
            const attackData = enemy.characterConfig?.attacks[enemy.currentAttack]
                || { damage: 20, knockback: { x: 3, y: -2 } };
            const result = combatSystem.processHit(enemy, player, attackData, 'enemy');
            player.takeHit(result.damage);
            this.game.ui.updateHealth('player', (player.health / player.maxHealth) * 100);
            this.game.audio.playSFX('hit');

            const hitX = player.position.x + player.width / 2;
            const hitY = player.position.y + player.height / 2;
            const combo = combatSystem.getComboCount?.('enemy') || 0;
            const isCombo = combo >= 3;

            this.screenShake.trigger(isCombo ? 8 : 5, isCombo ? 0.3 : 0.2);
            this.particles.emit('hit', hitX, hitY, isCombo ? 15 : 10);
            this.damageNumbers.spawn(hitX, hitY - 20, result.damage, isCombo ? 'combo' : 'normal');
            if (combo >= 2) this.comboDisplay.show(combo, 'enemy');

            this.stats.enemy.damageDealt += result.damage;
            this.stats.enemy.hits++;
            if (combo > this.stats.enemy.maxCombo) this.stats.enemy.maxCombo = combo;
        }

        collision.resetAttackState(player);
        collision.resetAttackState(enemy);

        this._updateProjectiles(deltaTime);

        if (this.gameMode === 'training') {
            enemy.restoreFullHealth();
            this.game.ui.updateHealth('enemy', 100);
        }

        if (enemy.health <= 0 || player.health <= 0) {
            this._endRound();
        }

        inputHandler.endFrame();
    }

    _handleDustParticles(fighter, id, deltaTime) {
        if (fighter.dead) return;

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

        if (!fighter.isAttacking && !fighter.isDashing) {
            fighter.switchSprite(AnimState.IDLE);
        }
    }

    _applyAIActions(fighter, actions) {
        const moveSpeed = fighter.characterConfig?.stats?.moveSpeed || 5;
        const jumpVelocity = fighter.characterConfig?.stats?.jumpVelocity || JUMP_VELOCITY;
        const isAttacking = fighter.isAttacking;

        if (!isAttacking && !fighter.isDashing) {
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

        if (fighter.velocity.y < 0) {
            fighter.switchSprite(AnimState.JUMP);
        } else if (fighter.velocity.y > 0) {
            fighter.switchSprite(AnimState.FALL);
        }

        if (actions.jump && fighter.isGrounded) {
            fighter.velocity.y = jumpVelocity;
        }

        if (!fighter.isDashing) {
            if (actions.attack1 && !fighter.isAttacking) {
                fighter.attack('attack1');
            } else if (actions.attack2 && !fighter.isAttacking) {
                fighter.attack('attack2');
            }
        }

        if (actions.dash && !fighter.isDashing) {
            fighter.dash(actions.dashDirection || 1);
            this.game.audio.playSFX('whoosh');
        }
    }

    _spawnProjectile(fighter, config) {
        const projConfig = config.projectile;
        const loader = this.game.assetLoader;
        const moveImg = loader.get(`${config.spriteBasePath}/${projConfig.moveSprite.src}`);
        const explodeImg = loader.get(`${config.spriteBasePath}/${projConfig.explodeSprite.src}`);
        const scale = projConfig.scale || { x: 2.5, y: 2.5 };
        const projFrameW = moveImg.width / projConfig.moveSprite.framesMax;
        const projDrawW = projFrameW * scale.x;
        const projDrawH = moveImg.height * scale.y;
        const spriteFrameW = (fighter.image.width / fighter.framesMax) * fighter.scale.x;
        const spriteFrameH = fighter.image.height * fighter.scale.y;
        const spriteDrawX = fighter.position.x - fighter.offset.x;
        const spriteDrawY = fighter.position.y - fighter.offset.y;
        const spawnOffset = projConfig.spawnOffset || {
            x: spriteFrameW,
            y: spriteFrameH / 2 - projDrawH / 2
        };

        const spawnX = fighter.facingRight
            ? spriteDrawX + spawnOffset.x
            : spriteDrawX + spriteFrameW - spawnOffset.x - projDrawW;
        const spawnY = spriteDrawY + spawnOffset.y;
        const velocityX = fighter.facingRight ? projConfig.speed : -projConfig.speed;

        this.projectiles.push(new Projectile({
            position: { x: spawnX, y: spawnY },
            velocityX,
            spriteImages: { move: moveImg, explode: explodeImg },
            config: projConfig,
            owner: fighter
        }));
    }

    _updateProjectiles(deltaTime) {
        this.projectiles = this.projectiles.filter(projectile => projectile.active);

        for (const projectile of this.projectiles) {
            projectile.update(deltaTime);

            if (projectile.hasHit) continue;

            const target = projectile.owner === this.player ? this.enemy : this.player;
            if (target.dead || target.isInvulnerable) continue;

            const px = projectile.position.x;
            const py = projectile.position.y;
            const pw = projectile.width;
            const ph = projectile.height;
            const tx = target.position.x;
            const ty = target.position.y;
            const tw = target.width;
            const th = target.height;

            if (px < tx + tw && px + pw > tx && py < ty + th && py + ph > ty) {
                projectile.onHit();

                const attacker = projectile.owner;
                const isPlayer = attacker === this.player;
                const side = isPlayer ? 'player' : 'enemy';
                const result = this.combatSystem.processHit(
                    attacker,
                    target,
                    { damage: projectile.config.damage, knockback: projectile.config.knockback },
                    side
                );
                target.takeHit(result.damage);

                const healthKey = isPlayer ? 'enemy' : 'player';
                this.game.ui.updateHealth(healthKey, (target.health / target.maxHealth) * 100);
                this.game.audio.playSFX('hit');

                const hitX = target.position.x + target.width / 2;
                const hitY = target.position.y + target.height / 2;
                this.screenShake.trigger(5, 0.2);
                this.particles.emit('hit', hitX, hitY, 10);
                this.damageNumbers.spawn(hitX, hitY - 20, result.damage, 'normal');

                this.stats[side].damageDealt += result.damage;
                this.stats[side].hits++;
            }
        }
    }

    _endRound() {
        let roundWinner = null;
        if (this.player.health !== this.enemy.health) {
            roundWinner = this.player.health > this.enemy.health ? 'player' : 'enemy';
        }

        if (roundWinner) {
            this.roundsWon[roundWinner]++;
        }
        this._updateRoundIndicators();

        if (this.roundsWon.player >= this.roundsToWin || this.roundsWon.enemy >= this.roundsToWin) {
            this._endMatch();
        } else {
            this.roundTransition = true;
            this.roundTransitionTimer = 2;
            this.currentRound++;
            this.game.ui.showResult(`Round ${this.currentRound}`);
        }
    }

    _startNewRound() {
        this.player.reset();
        this.enemy.reset();
        this.player.facingRight = true;
        this.enemy.facingRight = false;
        this.player.updateAttackBox();
        this.enemy.updateAttackBox();
        this.showTrainingHitboxes = false;

        this.timer = MATCH_DURATION;
        this.timerAccumulator = 0;

        this.screenShake.reset();
        this.particles.reset();
        this.damageNumbers.reset();
        this.comboDisplay.reset();
        this.combatSystem.reset();
        this.projectiles = [];

        this.game.ui.resetHealthBars();
        this.game.ui.hideResult();
        this.game.ui.updateTimer(this.timer);
    }

    _endMatch() {
        this.gameIsOver = true;
        this.game.audio.stopMusic();
        this.game.audio.playSFX('victory');

        let winnerText;
        if (this.roundsWon.player === this.roundsWon.enemy) {
            winnerText = 'Empate';
        } else if (this.roundsWon.player > this.roundsWon.enemy) {
            winnerText = `${this.playerConfig.name} Venceu!`;
        } else {
            winnerText = `${this.enemyConfig.name} Venceu!`;
        }

        if (
            this.gameMode === 'tower'
            && this.roundsWon.player > this.roundsWon.enemy
            && this.towerState
            && isTowerComplete(this.towerState)
        ) {
            winnerText = `TORRE CONCLUIDA! ${this.playerConfig.name} Venceu!`;
        }

        setTimeout(() => {
            this.sceneManager.switchTo('postMatch', {
                winnerText,
                stats: this.stats,
                playerConfig: this.playerConfig,
                enemyConfig: this.enemyConfig,
                roundsWon: this.roundsWon,
                gameMode: this.gameMode,
                aiController: this.aiController,
                towerState: this.towerState
            });
        }, 1500);
    }

    _updateRoundIndicators() {
        const p1Rounds = document.getElementById('p1-rounds');
        const p2Rounds = document.getElementById('p2-rounds');
        if (p1Rounds) {
            p1Rounds.replaceChildren(this._renderRoundDots(this.roundsWon.player));
        }
        if (p2Rounds) {
            p2Rounds.replaceChildren(this._renderRoundDots(this.roundsWon.enemy));
        }
    }

    _renderRoundDots(won) {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < this.roundsToWin; i++) {
            const dot = document.createElement('span');
            dot.className = `round-dot${i < won ? ' won' : ''}`;
            fragment.appendChild(dot);
        }
        return fragment;
    }

    _handleFighterInput(fighter, playerId) {
        if (fighter.dead) return;

        const inputHandler = this.game.inputHandler;
        const moveSpeed = fighter.characterConfig?.stats?.moveSpeed || 5;
        const jumpVelocity = fighter.characterConfig?.stats?.jumpVelocity || JUMP_VELOCITY;
        const isAttacking = fighter.isAttacking;

        if (!fighter.isDashing) {
            const dashDir = inputHandler.consumeDash(playerId);
            if (dashDir !== 0) {
                fighter.dash(dashDir);
                this.game.audio.playSFX('whoosh');
                const dashX = fighter.position.x + fighter.width / 2;
                const dashY = fighter.position.y + fighter.height / 2;
                this.particles.emit('dash', dashX, dashY, 6, dashDir > 0 ? Math.PI : 0);
            }
        }

        if (!isAttacking && !fighter.isDashing) {
            if (inputHandler.isDirectionActive('left', playerId) && fighter.position.x >= 0) {
                fighter.velocity.x = -moveSpeed;
                fighter.switchSprite(AnimState.RUN);
            } else if (
                inputHandler.isDirectionActive('right', playerId)
                && fighter.position.x <= CANVAS_WIDTH - fighter.width
            ) {
                fighter.velocity.x = moveSpeed;
                fighter.switchSprite(AnimState.RUN);
            } else {
                fighter.velocity.x = 0;
                fighter.switchSprite(AnimState.IDLE);
            }
        } else if (!fighter.isDashing) {
            fighter.velocity.x = 0;
        }

        if (fighter.velocity.y < 0) {
            fighter.switchSprite(AnimState.JUMP);
        } else if (fighter.velocity.y > 0) {
            fighter.switchSprite(AnimState.FALL);
        }

        if (inputHandler.isPressed('jump', playerId) && fighter.isGrounded) {
            fighter.velocity.y = jumpVelocity;
        }

        if (!fighter.isDashing) {
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

        const shake = this.screenShake.getOffset();
        ctx.save();
        ctx.translate(shake.x, shake.y);

        this.background.update(ctx, this.game._lastDeltaTime || 0);
        this.shop.update(ctx, this.game._lastDeltaTime || 0);

        this.player.draw(ctx);
        this.enemy.draw(ctx);

        if (this.gameMode === 'training' && this.showTrainingHitboxes) {
            this._drawHitboxes(ctx);
        }

        for (const projectile of this.projectiles) {
            projectile.draw(ctx);
        }

        this.particles.render(ctx);
        this.damageNumbers.render(ctx);
        this.comboDisplay.render(ctx);

        ctx.restore();

        if (this.roundTransition) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    _drawHitboxes(ctx) {
        [this.player, this.enemy].forEach(fighter => {
            if (fighter.dead) return;

            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 1;
            ctx.strokeRect(fighter.position.x, fighter.position.y, fighter.width, fighter.height);

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
