import Bowman from './Bowman.js';
import Swordsman from './Swordsman.js';
import Magician from './Magician.js';
import Daemon from './Daemon.js';
import Vampire from './Vampire.js';
import Undead from './Undead.js';

export default class Team {
  constructor() {
    this.playerTeams = [Bowman, Swordsman, Magician];
    this.npcTeams = [Daemon, Vampire, Undead];
  }
}