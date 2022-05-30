import { generateTeam, generateCoordinates } from './generators.js';
import { isAttackPossible, isStepPossible } from './utils.js';
import cursors from './cursors.js';
import themes from './themes.js';
import Team from './Team.js';
import GamePlay from './GamePlay.js';
import GameState from './GameState.js';
import Character from './Character.js';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    this.state = GameState.from({});
    this.updateState({
      record: 0,
    });
    this.prepareGame();
    this.clickOnCells();
    this.overOnCells();
    this.leaveOnCells();
    this.clickOnNewGame();
    this.clickOnSaveGame();
    this.clickOnLoadGame();

    this.renderScore();
  }

  prepareGame() {
    const playerTeams = generateTeam(new Team().playerTeams, 1, 2, this.gamePlay.boardSize);
    const npcTeams = generateTeam(new Team().npcTeams, 1, 2, this.gamePlay.boardSize);
    this.updateState({
      currentLevel: 1,
      teams: [...playerTeams, ...npcTeams],
      numberOfPoints: 0,
      playerTurn: true,
    });
    this.gamePlay.drawUi(themes[this.state.currentLevel - 1]);
    this.prevSelectedCharIndex = null;
    this.selectedChar = null;
    this.gamePlay.redrawPositions(this.state.teams);
  }


  clickOnCells() {
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  overOnCells() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
  }

  leaveOnCells() {
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
  }

  clickOnNewGame() {
    this.gamePlay.addNewGameListener(this.onNewGame.bind(this));
  }

  clickOnSaveGame() {
    this.gamePlay.addSaveGameListener(this.onSaveGame.bind(this));
  }

  clickOnLoadGame() {
    this.gamePlay.addLoadGameListener(this.onLoadGame.bind(this));
  }


  getNPCTeam() {
    return this.state.teams.filter((char) => !char.character.isPlayer);
  }

  getPlayerTeam() {
    return this.state.teams.filter((char) => char.character.isPlayer);
  }

  onCellClick(index) {
    const isCharacter = this.haveACharacter(index);
    const currentChar = this.findCurrentChar(index);

    if (isCharacter) {
      if (currentChar && currentChar.character.isPlayer) {
        this.selectedChar = currentChar;
        this.gamePlay.cells.forEach((cell) => cell.classList.remove('selected-yellow'));
        this.gamePlay.selectCell(index);
        this.prevSelectedCharIndex = index;
        this.gamePlay.setCursor(cursors.pointer);
      }
    }


    if (this.selectedChar && this.stepIsPossible && !isCharacter) {
      this.state.teams = this.filterCharacter(this.selectedChar);
      this.selectedChar.position = index;
      this.updateState({
        teams: [...this.state.teams, this.selectedChar],
      });
      this.endOfTurn();
    }


    if (!this.stepIsPossible && !isCharacter && this.selectedChar) {
      this.gamePlay.showTooltip('Information', 'Impossible to go here!', 'warning');
      return;
    }


    if (this.attackIsPossible && this.selectedChar && this.selectedChar.position !== index) {
      this.attackTheEnemy(this.selectedChar, currentChar);
      return;
    }


    if (isCharacter && this.selectedChar && !currentChar.character.isPlayer) {
      this.gamePlay.showTooltip('Information', 'To far...', 'warning');
      return;
    }


    if (isCharacter && !currentChar.character.isPlayer) {
      this.gamePlay.showTooltip('Information', 'This is not a playable character!', 'danger');
    }
  }

  onCellEnter(index) {
    const isCharacter = this.haveACharacter(index);
    const currentChar = this.findCurrentChar(index);

    if (this.selectedChar && !isCharacter) {
      this.stepIsPossible = isStepPossible(
        this.selectedChar.position,
        index,
        this.selectedChar.character.step,
      );
      if (this.stepIsPossible) {
        this.gamePlay.selectCell(index, 'green');
        this.gamePlay.setCursor(cursors.pointer);
      }
    }
    if (isCharacter) {
      const message = `🎖 ${currentChar.character.level} ⚔ ${currentChar.character.attack} 🛡 ${currentChar.character.defence} ❤ ${currentChar.character.health}`;
      this.gamePlay.showCellTooltip(message, index);
      if (this.selectedChar && !currentChar.character.isPlayer) {
        this.attackIsPossible = isAttackPossible(
          this.selectedChar.position,
          currentChar.position,
          this.selectedChar.character.range,
        );
        if (this.attackIsPossible) {
          this.gamePlay.setCursor(cursors.crosshair);
          this.gamePlay.selectCell(index, 'red');
        } else {
          this.gamePlay.setCursor(cursors.notallowed);
        }
      }
    }
  }

  onCellLeave(index) {
    this.gamePlay.setCursor(cursors.pointer);
    this.gamePlay.cells.forEach((cell) => cell.classList.remove('selected-green', 'selected-red'));
    this.gamePlay.hideCellTooltip(index);
  }

  onNewGame() {
    this.gamePlay.unsubscribeAllMouseListeners();
    this.prepareGame();
    this.clickOnCells();
    this.overOnCells();
    this.leaveOnCells();
    this.renderScore();
    this.gamePlay.showTooltip('Information', 'A new game has begun', 'info');
  }

  onSaveGame() {
    this.gamePlay.showTooltip('Information', 'Game saved', 'info');
    this.stateService.save(this.state);
  }

  onLoadGame() {
    this.selectedChar = null;
    let loadState = null;
    try {
      loadState = this.stateService.load();
    } catch (e) {
      this.gamePlay.showTooltip('Information', e, 'danger');
      return;
    }
    loadState.teams = loadState.teams.reduce((acc, prev) => {
      prev.character.__proto__ = Character.prototype;
      acc.push(prev);
      return acc;
    }, []);
    this.updateState({
      currentLevel: loadState.currentLevel,
      teams: loadState.teams,
      numberOfPoints: loadState.numberOfPoints,
      playerTurn: loadState.playerTurn,
    });
    this.gamePlay.drawUi(themes[loadState.currentLevel - 1]);
    this.gamePlay.redrawPositions(this.state.teams);
    this.renderScore();
    this.gamePlay.showTooltip('Information', 'Game loaded', 'info');
  }

  attackTheEnemy(attacker, defender) {
    this.gamePlay.unsubscribe();
    if (!attacker || !defender) {
      return;
    }
    const enemy = defender;
    const attackPoints = +Math.max(
      attacker.character.attack - enemy.character.defence,
      attacker.character.attack * 0.1,
    ).toFixed();
    this.state.teams = this.filterCharacter(defender);
    enemy.character.damage(attackPoints);
    if (enemy.character.health > 0) {
      this.updateState({
        teams: [...this.state.teams, enemy],
      });
    }

    this.gamePlay
      .showDamage(defender.position, attackPoints)
      .then(() => {
        this.clickOnCells();
      })
      .then(() => this.endOfTurn());
  }

  stepAI() {
    if (!this.getNPCTeam().length || !this.getPlayerTeam().length) {
      return;
    }
    const npcTeam = this.getNPCTeam();
    const playerTeam = this.getPlayerTeam();
    const canAttackEnemies = npcTeam.reduce((acc, prev) => {
      const playerChar = [];
      playerTeam.forEach((userChar, index) => {
        const canAttack = isAttackPossible(prev.position, userChar.position, prev.character.range);
        if (canAttack) {
          playerChar.push(playerTeam[index]);
        }
      });
      if (playerChar.length > 0) {
        acc.push({
          npc: prev,
          playerChar,
        });
      }
      return acc;
    }, []);
    const attacker = canAttackEnemies[Math.floor(Math.random() * canAttackEnemies.length)];
    if (attacker) {
      const defender = attacker.playerChar[Math.floor(Math.random() * attacker.playerChar.length)];
      this.attackTheEnemy(attacker.npc, defender);
    } else {
      const npc = npcTeam[Math.floor(Math.random() * npcTeam.length)];
      const bannedPositions = this.state.teams.reduce((acc, prev) => {
        acc.push(prev.position);
        return acc;
      }, []);
      const arrayOfCell = new Array(this.gamePlay.boardSize ** 2)
        .fill(0)
        .map((e, i) => i++)
        .filter((position) => !bannedPositions.includes(position));
      const indexStep = () => {
        const idx = Math.floor(Math.random() * arrayOfCell.length);
        const isStep = isStepPossible(npc.position, arrayOfCell[idx], npc.character.step);
        if (!isStep) {
          arrayOfCell.splice(idx, 1);
          return indexStep();
        }
        return arrayOfCell[idx];
      };
      const indexSteps = indexStep();
      this.state.teams = this.filterCharacter(npc);
      npc.position = indexSteps;
      this.updateState({
        teams: [...this.state.teams, npc],
      });
      this.endOfTurn();
    }
  }


  endOfTurn() {
    if (!this.selectedChar.character.health) {
      this.selectedChar = null;
      this.gamePlay.redrawPositions(this.state.teams);
    }

    if (!this.getPlayerTeam().length) {
      this.gamePlay.redrawPositions(this.state.teams);
      GamePlay.showMessage('You Lose!');
      this.gamePlay.unsubscribeAllMouseListeners();
      return;
    }

    if (!this.getNPCTeam().length) {
      this.gamePlay.cells.forEach((cell) =>
        cell.classList.remove('selected-yellow', 'selected-green', 'selected-red'));
      this.gamePlay.setCursor(cursors.auto);
      this.updateState({
        playerTurn: false,
      });
      this.nextLevel();
      return;
    }
    this.prevSelectedCharIndex = null;
    this.gamePlay.cells.forEach((cell) => cell.classList.remove('selected-yellow'));
    this.gamePlay.redrawPositions(this.state.teams);
    if (this.selectedChar) {
      this.gamePlay.selectCell(this.selectedChar.position);
    }

    if (this.state.playerTurn) {
      this.updateState({
        playerTurn: false,
      });
      this.stepAI();
    } else {
      this.updateState({
        playerTurn: true,
      });
    }
  }


  nextLevel() {
    this.gamePlay.unsubscribe();
    this.updateState({
      currentLevel: (this.state.currentLevel += 1),
    });
    if (this.state.currentLevel > 4) {
      this.endGame();
      return;
    }
    this.gamePlay.drawUi(themes[this.state.currentLevel - 1]);
    const newPoints =
      this.state.numberOfPoints +
      this.getPlayerTeam().reduce((acc, prev) => acc + prev.character.health, 0);
    this.updateState({
      numberOfPoints: newPoints,
    });
    this.renderScore();
    const playerCoordinates = generateCoordinates('player', this.gamePlay.boardSize);
    const levelUpTeams = this.state.teams.reduce((acc, prev) => {
      prev.character.levelUp();
      acc.push(prev);
      return acc;
    }, []);
    this.updateState({
      teams: levelUpTeams,
    });
    const quantityChar = this.state.currentLevel > 3 ? 2 : 1;
    const newPlayerTeam = generateTeam(
      new Team().playerTeams,
      this.state.currentLevel - 1,
      quantityChar,
    );
    let updateTeams = [...this.state.teams, ...newPlayerTeam].reduce((acc, prev) => {
      const idx = Math.floor(Math.random() * playerCoordinates.length);
      prev.position = playerCoordinates[idx];
      playerCoordinates.splice(idx, 1);
      acc.push(prev);
      return acc;
    }, []);
    this.updateState({
      teams: updateTeams,
    });
    const newNPCTeams = generateTeam(
      new Team().npcTeams,
      this.state.currentLevel,
      this.getPlayerTeam().length,
    );
    newNPCTeams.forEach((char) => {
      for (let i = 1; i < char.character.level; i++) {
        char.character.statsUp();
      }
    });
    updateTeams = [...this.state.teams, ...newNPCTeams];
    this.updateState({
      teams: updateTeams,
    });
    this.gamePlay.redrawPositions(this.state.teams);
    this.clickOnCells();
    this.overOnCells();
    this.leaveOnCells();
    this.gamePlay.showTooltip('Information', 'Next level', 'info');
  }

  endGame() {
    this.gamePlay.redrawPositions(this.state.teams);
    const currentLevel = this.state.currentLevel - 1;
    const newPoints =
      this.state.numberOfPoints +
      this.getPlayerTeam().reduce((acc, prev) => acc + prev.character.health, 0);
    this.updateState({
      currentLevel,
      numberOfPoints: newPoints,
    });
    this.renderScore();
    GamePlay.showMessage('You Won!');
    this.gamePlay.unsubscribeAllMouseListeners();
  }

  renderScore() {
    const levelElement = this.gamePlay.container.querySelector('.level-value');
    const scoreElement = this.gamePlay.container.querySelector('.score-value');
    const recordElement = this.gamePlay.container.querySelector('.record-value');
    levelElement.textContent = this.state.currentLevel;
    scoreElement.textContent = this.state.numberOfPoints;
    const newRecord =
      this.state.record > this.state.numberOfPoints ? this.state.record : this.state.numberOfPoints;
    this.updateState({
      record: newRecord,
    });
    recordElement.textContent = this.state.record;
    scoreElement.textContent = this.state.numberOfPoints;
  }

  haveACharacter(index) {
    return this.state.teams.some((char) => char.position === index);
  }

  findCurrentChar(index) {
    return this.state.teams.find((character) => character.position === index);
  }


  filterCharacter(character) {
    return this.state.teams.filter((char) => char.position !== character.position);
  }

  updateState(object) {
    this.state = { ...this.state };
    for (const objectKey in object) {
      if (object.hasOwnProperty(objectKey)) {
        if (object[objectKey] instanceof Array) {
          object[objectKey] = [...object[objectKey]];
        } else if (object[objectKey] instanceof Object) {
          object[objectKey] = { ...object[objectKey] };
        }
        this.state[objectKey] = object[objectKey];
      }
    }
    return this.state;
  }
}