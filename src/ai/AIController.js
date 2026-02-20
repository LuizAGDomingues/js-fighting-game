import { CANVAS_WIDTH } from '../config/constants.js';

/**
 * AIController — State-machine based AI for single player mode
 *
 * States: idle, approach, attack, retreat, block
 * Difficulties: easy (500ms reaction), medium (300ms), hard (150ms)
 */

const DIFFICULTY_SETTINGS = {
    easy: {
        reactionTime: 0.5,
        blockChance: 0.25,
        attackChance: 0.4,
        jumpChance: 0.1,
        dashChance: 0.05,
        retreatHPThreshold: 0.2,
        comboMaxLength: 1,
        preferredRange: 120
    },
    medium: {
        reactionTime: 0.3,
        blockChance: 0.5,
        attackChance: 0.6,
        jumpChance: 0.15,
        dashChance: 0.12,
        retreatHPThreshold: 0.3,
        comboMaxLength: 2,
        preferredRange: 100
    },
    hard: {
        reactionTime: 0.15,
        blockChance: 0.75,
        attackChance: 0.8,
        jumpChance: 0.2,
        dashChance: 0.2,
        retreatHPThreshold: 0.35,
        comboMaxLength: 3,
        preferredRange: 90
    }
};

export class AIController {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.settings = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS.medium;

        // State machine
        this.state = 'idle';
        this.stateTimer = 0;
        this.actionCooldown = 0;

        // Decision timers
        this.decisionTimer = 0;
        this.decisionInterval = this.settings.reactionTime;

        // Internal state for smooth actions
        this._currentActions = this._emptyActions();
        this._comboCount = 0;
    }

    _emptyActions() {
        return {
            left: false,
            right: false,
            jump: false,
            attack1: false,
            attack2: false,
            block: false,
            dash: false,
            dashDirection: 0
        };
    }

    /**
     * Called each frame by BattleScene
     * @param {Fighter} self - The AI-controlled fighter
     * @param {Fighter} opponent - The opponent fighter
     * @param {number} deltaTime - Time elapsed since last frame in seconds
     * @returns {Object} actions object
     */
    decide(self, opponent, deltaTime = 1 / 60) {
        // Calculate distances and positioning
        const dx = opponent.position.x - self.position.x;
        const distance = Math.abs(dx);
        const direction = dx > 0 ? 1 : -1;
        const hpRatio = self.health / self.maxHealth;
        const oppHpRatio = opponent.health / opponent.maxHealth;
        const opponentAttacking = opponent.isAttacking;
        const inRange = distance < this.settings.preferredRange + 40;
        const tooClose = distance < 40;
        const atEdge = self.position.x < 50 || self.position.x > CANVAS_WIDTH - 100;

        // Update state machine
        this.stateTimer += deltaTime;
        if (this.actionCooldown > 0) this.actionCooldown -= deltaTime;

        // State transitions
        this._updateState(distance, hpRatio, oppHpRatio, opponentAttacking, inRange, tooClose, atEdge, direction);

        // Generate actions based on state
        const actions = this._emptyActions();

        switch (this.state) {
            case 'approach':
                actions.left = direction < 0;
                actions.right = direction > 0;
                // Random jump while approaching
                if (Math.random() < this.settings.jumpChance * deltaTime && self.isGrounded) {
                    actions.jump = true;
                }
                break;

            case 'attack':
                if (this.actionCooldown <= 0) {
                    // Choose attack type
                    if (this._comboCount < this.settings.comboMaxLength) {
                        if (Math.random() < 0.6) {
                            actions.attack1 = true;
                        } else {
                            actions.attack2 = true;
                        }
                        this._comboCount++;
                        this.actionCooldown = this.settings.reactionTime * 0.6;
                    } else {
                        // End combo, short pause
                        this._comboCount = 0;
                        this.actionCooldown = this.settings.reactionTime;
                    }
                }
                // Slight tracking during attack
                if (!inRange) {
                    actions.left = direction < 0;
                    actions.right = direction > 0;
                }
                break;

            case 'block':
                actions.block = true;
                // Counter-attack after blocking
                if (!opponentAttacking && this.stateTimer > this.settings.reactionTime) {
                    this.state = 'attack';
                    this.stateTimer = 0;
                    this._comboCount = 0;
                }
                break;

            case 'retreat':
                // Move away from opponent
                actions.left = direction > 0;
                actions.right = direction < 0;
                // Dash away occasionally
                if (Math.random() < this.settings.dashChance * deltaTime && !self.isDashing) {
                    actions.dash = true;
                    actions.dashDirection = -direction;
                }
                // Jump away
                if (Math.random() < this.settings.jumpChance * deltaTime && self.isGrounded) {
                    actions.jump = true;
                }
                break;

            case 'idle':
            default:
                // Idle — do nothing for a brief moment
                if (this.stateTimer > this.settings.reactionTime * 1.5) {
                    this.state = 'approach';
                    this.stateTimer = 0;
                }
                break;
        }

        this._currentActions = actions;
        return actions;
    }

    _updateState(distance, hpRatio, oppHpRatio, opponentAttacking, inRange, tooClose, atEdge, direction) {
        // Priority-based state transitions

        // 1. Retreat if low HP
        if (hpRatio < this.settings.retreatHPThreshold && this.state !== 'retreat') {
            if (Math.random() < 0.02) {
                this.state = 'retreat';
                this.stateTimer = 0;
                return;
            }
        }

        // 2. Block if opponent is attacking and we're in range
        if (opponentAttacking && inRange && Math.random() < this.settings.blockChance * 0.05) {
            this.state = 'block';
            this.stateTimer = 0;
            return;
        }

        // 3. Attack if in range
        if (inRange && this.state !== 'attack' && this.state !== 'block') {
            if (Math.random() < this.settings.attackChance * 0.03) {
                this.state = 'attack';
                this.stateTimer = 0;
                this._comboCount = 0;
                return;
            }
        }

        // 4. Approach if too far
        if (!inRange && this.state !== 'retreat') {
            if (this.stateTimer > this.settings.reactionTime) {
                this.state = 'approach';
                this.stateTimer = 0;
            }
        }

        // 5. Retreat timeout — go back to approach after retreating for a while
        if (this.state === 'retreat' && this.stateTimer > 1.5) {
            this.state = 'approach';
            this.stateTimer = 0;
        }

        // 6. Attack timeout — stop attacking after a while
        if (this.state === 'attack' && this.stateTimer > 2) {
            this.state = 'idle';
            this.stateTimer = 0;
            this._comboCount = 0;
        }

        // 7. If at edge, change strategy
        if (atEdge && this.state === 'retreat') {
            this.state = 'attack';
            this.stateTimer = 0;
            this._comboCount = 0;
        }
    }

    reset() {
        this.state = 'idle';
        this.stateTimer = 0;
        this.actionCooldown = 0;
        this._currentActions = this._emptyActions();
        this._comboCount = 0;
    }
}
