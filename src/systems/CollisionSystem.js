export class CollisionSystem {
  rectangularCollision(attacker, defender) {
    return (
      attacker.attackBox.position.x + attacker.attackBox.width >= defender.position.x &&
      attacker.attackBox.position.x <= defender.position.x + defender.width &&
      attacker.attackBox.position.y + attacker.attackBox.height >= defender.position.y &&
      attacker.attackBox.position.y <= defender.position.y + defender.height
    );
  }

  checkAttackHit(attacker, defender) {
    if (!attacker.isAttacking) return false;
    if (attacker.hitRegistered) return false;
    if (!attacker.isInHitFrame) return false;
    if (!this.rectangularCollision(attacker, defender)) return false;

    attacker.hitRegistered = true;
    return true;
  }

  checkAttackMiss(attacker) {
    if (!attacker.isAttacking) return false;
    if (attacker.hitRegistered) return false;
    if (!attacker.isInHitFrame) return false;

    // If in hit frame but no collision was registered, mark as miss
    // (called after checkAttackHit fails)
    return true;
  }

  resetAttackState(fighter) {
    if (fighter.isAttacking && fighter.animationComplete) {
      fighter.isAttacking = false;
      fighter.hitRegistered = false;
    }
  }
}
