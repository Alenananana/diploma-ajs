import Character from './Character.js';

export default class Magician extends Character {
  constructor(level) {
    super(level, 'magician');
    this.attack = 10;
    this.defence = 40;
    this.isPlayer = true;
    this.step = 1;
    this.range = 4;
  }
}