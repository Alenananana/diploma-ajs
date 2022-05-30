import Character from './Character.js';

export default class MathCharacterAttack extends Character {
  get attack() {
    let attack = this._attack * (11 - this.distance) / 10;
    if (this._stoned) {
      attack -= Math.log2(this.distance) * 5;
    }
    return (attack > 0) ? Math.round(attack) : 0;
  }

  set attack(value) {
    this._attack = value;
  }

  get stoned() {
    return this._stoned;
  }

  set stoned(value) {
    this._stoned = value;
  }
}