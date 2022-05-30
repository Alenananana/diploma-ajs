import Character from './Character.js';

export default class Undead extends Character {
  constructor(level) {
    super(level, 'undead');
    this.attack = 40;
    this.defence = 10;
    this.isPlayer = false;
    this.step = 4;
    this.range = 1;
  }
}