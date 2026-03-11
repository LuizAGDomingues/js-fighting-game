import { CANVAS_WIDTH } from '../config/constants.js';

/**
 * AIController - State-machine based AI for single player mode
 *
 * States: idle, approach, attack, retreat
 * Difficulties: easy (500ms reaction), medium (300ms), hard (150ms)
 */

const DIFFICULTY_SETTINGS = {
    easy: {
        reactionTime: 0.5,
        attackChance: 0.4,
        jumpChance: 0.1,
        dashChance: 0.05,
        retreatHPThreshold: 0.2,
        comboMaxLength: 1,
        preferredRange: 120
    },
    medium: {
        reactionTime: 0.3,
        attackChance: 0.6,
        jumpChance: 0.15,
        dashChance: 0.12,
        retreatHPThreshold: 0.3,
        comboMaxLength: 2,
        preferredRange: 100
    },
    hard: {
        reactionTime: 0.15,
        attackChance: 0.8,
        jumpChance: 0.2,
        dashChance: 0.2,
        retreatHPThreshold: 0.35,
        comboMaxLength: 3,
        preferredRange: 90
    }
};

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function buildSettings(difficulty, towerProgress = 0) {
    const base = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS.medium;
    const progress = clamp(towerProgress, 0, 1);

    return {
        reactionTime: Math.max(0.08, base.reactionTime * (1 - 0.45 * progress)),
        attackChance: clamp(base.attackChance + 0.18 * progress, 0, 0.95),
        jumpChance: clamp(base.jumpChance + 0.08 * progress, 0, 0.35),
        dashChance: clamp(base.dashChance + 0.14 * progress, 0, 0.35),
        retreatHPThreshold: clamp(base.retreatHPThreshold + 0.08 * progress, 0, 0.5),
        comboMaxLength: Math.min(4, base.comboMaxLength + Math.round(progress * 1.5)),
        preferredRange: Math.max(70, base.preferredRange - 25 * progress)
    };
}

export class AIController {
    constructor(difficulty = 'medium', options = {}) {
        this.difficulty = difficulty;
        this.towerProgress = clamp(options.towerProgress ?? 0, 0, 1);
        this.settings = buildSettings(difficulty, this.towerProgress);

        this.state = 'idle';
        this.stateTimer = 0;
        this.actionCooldown = 0;
        this._comboCount = 0;
    }

    _emptyActions() {
        return {
            left: false,
            right: false,
            jump: false,
            attack1: false,
            attack2: false,
            dash: false,
            dashDirection: 0
        };
    }

    decide(self, opponent, deltaTime = 1 / 60) {
        const dx = opponent.position.x - self.position.x;
        const distance = Math.abs(dx);
        const direction = dx > 0 ? 1 : -1;
        const hpRatio = self.health / self.maxHealth;
        const inRange = distance < this.settings.preferredRange + 40;
        const atEdge = self.position.x < 50 || self.position.x > CANVAS_WIDTH - 100;

        this.stateTimer += deltaTime;
        if (this.actionCooldown > 0) this.actionCooldown -= deltaTime;

        this._updateState(hpRatio, inRange, atEdge);

        const actions = this._emptyActions();

        switch (this.state) {
            case 'approach':
                actions.left = direction < 0;
                actions.right = direction > 0;
                if (Math.random() < this.settings.jumpChance * deltaTime && self.isGrounded) {
                    actions.jump = true;
                }
                break;

            case 'attack':
                if (this.actionCooldown <= 0) {
                    if (this._comboCount < this.settings.comboMaxLength) {
                        if (Math.random() < 0.6) {
                            actions.attack1 = true;
                        } else {
                            actions.attack2 = true;
                        }
                        this._comboCount++;
                        this.actionCooldown = this.settings.reactionTime * 0.6;
                    } else {
                        this._comboCount = 0;
                        this.actionCooldown = this.settings.reactionTime;
                    }
                }
                if (!inRange) {
                    actions.left = direction < 0;
                    actions.right = direction > 0;
                }
                break;

            case 'retreat':
                actions.left = direction > 0;
                actions.right = direction < 0;
                if (Math.random() < this.settings.dashChance * deltaTime && !self.isDashing) {
                    actions.dash = true;
                    actions.dashDirection = -direction;
                }
                if (Math.random() < this.settings.jumpChance * deltaTime && self.isGrounded) {
                    actions.jump = true;
                }
                break;

            case 'idle':
            default:
                if (this.stateTimer > this.settings.reactionTime * 1.5) {
                    this.state = 'approach';
                    this.stateTimer = 0;
                }
                break;
        }
        return actions;
    }

    _updateState(hpRatio, inRange, atEdge) {
        if (hpRatio < this.settings.retreatHPThreshold && this.state !== 'retreat') {
            if (Math.random() < 0.02) {
                this.state = 'retreat';
                this.stateTimer = 0;
                return;
            }
        }

        if (inRange && this.state !== 'attack') {
            if (Math.random() < this.settings.attackChance * 0.03) {
                this.state = 'attack';
                this.stateTimer = 0;
                this._comboCount = 0;
                return;
            }
        }

        if (!inRange && this.state !== 'retreat') {
            if (this.stateTimer > this.settings.reactionTime) {
                this.state = 'approach';
                this.stateTimer = 0;
            }
        }

        if (this.state === 'retreat' && this.stateTimer > 1.5) {
            this.state = 'approach';
            this.stateTimer = 0;
        }

        if (this.state === 'attack' && this.stateTimer > 2) {
            this.state = 'idle';
            this.stateTimer = 0;
            this._comboCount = 0;
        }

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
        this._comboCount = 0;
    }
}

