import { samuraiMack } from './samuraiMack.js';
import { kenji } from './kenji.js';
import { evilWizard } from './evilWizard.js';
import { fantasyWarrior } from './fantasyWarrior.js';
import { huntress } from './huntress.js';
import { martialHero } from './martialHero.js';
import { medievalKing } from './medievalKing.js';

export const CHARACTER_ROSTER = [
  samuraiMack,
  kenji,
  evilWizard,
  fantasyWarrior,
  huntress,
  martialHero,
  medievalKing
];

export function getCharacterById(id) {
  return CHARACTER_ROSTER.find(c => c.id === id);
}
