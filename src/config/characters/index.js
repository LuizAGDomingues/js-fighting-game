import { samuraiMack } from './samuraiMack.js';
import { kenji } from './kenji.js';
import { evilWizard } from './evilWizard.js';
import { fantasyWarrior } from './fantasyWarrior.js';
import { huntress } from './huntress.js';
import { martialHero } from './martialHero.js';
import { medievalKing } from './medievalKing.js';
import { evilWizard3 } from './evilWizard3.js';
import { huntress2 } from './huntress2.js';
import { wizardPack } from './wizardPack.js';
import { arcaneArcher } from './arcaneArcher.js';
import { impAxeDemon } from './impAxeDemon.js';
import { skeletonEnemy } from './skeletonEnemy.js';
import { deepFreeze } from '../../utils/deepFreeze.js';

export const CHARACTER_ROSTER = deepFreeze([
  samuraiMack,
  kenji,
  evilWizard,
  fantasyWarrior,
  huntress,
  martialHero,
  medievalKing,
  evilWizard3,
  huntress2,
  wizardPack,
  arcaneArcher,
  impAxeDemon,
  skeletonEnemy
]);

export function getCharacterById(id) {
  return CHARACTER_ROSTER.find(c => c.id === id);
}
