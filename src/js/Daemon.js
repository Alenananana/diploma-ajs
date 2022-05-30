import Character from './Character.js';

export default class Daemon extends Character {
  constructor(level) {
    super(level, 'daemon');
    this.attack = 10;
    this.defence = 40;
    this.isPlayer = false;
    this.step = 1;
    this.range = 4;
  }
}