import {
  BLOCK_DAMAGE_MULTIPLIER,
  COMBO_WINDOW,
  COMBO_DAMAGE_SCALING,
  COMBO_DAMAGE_CAP
} from '../config/constants.js';

export class CombatSystem {
  constructor() {
    this.combos = {
      player: { count: 0, timer: 0 },
      enemy: { count: 0, timer: 0 }
    };
  }

  processHit(attacker, defender, attackData, attackerId) {
    let damage = attackData.damage;

    // Combo scaling
    const combo = this.combos[attackerId];
    combo.count++;
    combo.timer = COMBO_WINDOW;
    const multiplier = Math.min(
      1 + (combo.count - 1) * COMBO_DAMAGE_SCALING,
      COMBO_DAMAGE_CAP
    );
    damage = Math.round(damage * multiplier);

    // Block check
    if (defender.isBlocking && this._isFacingAttacker(defender, attacker)) {
      damage = Math.round(damage * BLOCK_DAMAGE_MULTIPLIER);
      // Attacker gets slight pushback on block
      const pushDir = attacker.position.x < defender.position.x ? -1 : 1;
      attacker.velocity.x = (attackData.knockback?.x || 3) * 0.5 * pushDir;
      return { type: 'blocked', damage, combo: combo.count };
    }

    // Apply knockback to defender
    if (attackData.knockback) {
      this._applyKnockback(defender, attacker, attackData.knockback);
    }

    return { type: 'hit', damage, combo: combo.count };
  }

  _isFacingAttacker(defender, attacker) {
    const defenderCenter = defender.position.x + defender.width / 2;
    const attackerCenter = attacker.position.x + attacker.width / 2;

    if (defender.facingRight) {
      return attackerCenter >= defenderCenter;
    }

    return attackerCenter <= defenderCenter;
  }

  _applyKnockback(defender, attacker, knockback) {
    const direction = defender.position.x > attacker.position.x ? 1 : -1;
    const weight = defender.weight || 1.0;
    defender.velocity.x = (knockback.x / weight) * direction;
    defender.velocity.y = knockback.y / weight;
  }

  update(deltaTime) {
    for (const id of ['player', 'enemy']) {
      const combo = this.combos[id];
      if (combo.timer > 0) {
        combo.timer -= deltaTime;
        if (combo.timer <= 0) {
          combo.count = 0;
          combo.timer = 0;
        }
      }
    }
  }

  getComboCount(playerId) {
    return this.combos[playerId].count;
  }

  reset() {
    for (const id of ['player', 'enemy']) {
      this.combos[id].count = 0;
      this.combos[id].timer = 0;
    }
  }
}
