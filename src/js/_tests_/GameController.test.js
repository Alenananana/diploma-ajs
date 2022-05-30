import GameController from '../js/GameController.js';
import GamePlay from '../js/GamePlay.js';
import GameStateService from '../js/GameStateService.js';
import Bowman from '../js/Bowman.js';
import Daemon from '../js/Daemon.js';
import PositionedCharacter from '../js/PositionedCharacter.js';

let gamePlay = null;
let stateService = null;
let gameCtrl = null;

beforeEach(() => {
  const container = document.createElement('div');
  container.setAttribute('id', 'game-container');
  gamePlay = new GamePlay();
  gamePlay.bindToDOM(container);
  stateService = new GameStateService(localStorage);
  gameCtrl = new GameController(gamePlay, stateService);

  gameCtrl.init();
  gameCtrl.state.teams = [
    new PositionedCharacter(new Bowman(1), 0),
    new PositionedCharacter(new Daemon(1), 1),
  ];
  gameCtrl.gamePlay.redrawPositions(gameCtrl.state.teams);
});

test('Метод getPlayerTeam должен возвращать игровых персонажей', () => {
  const referenceObject = [
    {
      character: {
        attack: 25,
        defence: 25,
        health: 100,
        isPlayer: true,
        level: 1,
        range: 2,
        step: 2,
        type: 'bowman',
      },
      position: 0,
    },
  ];
  expect(gameCtrl.getPlayerTeam()).toEqual(referenceObject);
});

test('Метод getNPCTeam должен возвращать npc персонажей', () => {
  const referenceObject = [
    {
      character: {
        attack: 10,
        defence: 40,
        health: 100,
        isPlayer: false,
        level: 1,
        range: 4,
        step: 1,
        type: 'daemon',
      },
      position: 1,
    },
  ];
  expect(gameCtrl.getNPCTeam()).toEqual(referenceObject);
});

test('Проверяем что срабатывает метод showCellTooltip при наведении на ячейку', () => {
  gameCtrl.gamePlay.showCellTooltip = jest.fn();
  gameCtrl.onCellEnter(0);

  expect(gameCtrl.gamePlay.showCellTooltip).toBeCalled();
});

test('Проверяем что showCellTooltip не срабатывает, когда наводим на пустую ячейку', () => {
  gameCtrl.gamePlay.showCellTooltip = jest.fn();
  gameCtrl.onCellEnter(2);
  expect(gameCtrl.gamePlay.showCellTooltip).toBeCalledTimes(0);
});

test('Метод onCellEnter проверяет доступность перемещения в указанную ячейку', () => {
  gameCtrl.selectedChar = gameCtrl.state.teams[0];
  gameCtrl.gamePlay.selectCell = jest.fn();
  gameCtrl.gamePlay.setCursor = jest.fn();
  gameCtrl.onCellEnter(8);
  expect(gameCtrl.gamePlay.selectCell).toHaveBeenCalledWith(8, 'green');
  expect(gameCtrl.gamePlay.setCursor).toHaveBeenCalledWith('pointer');
});

test('Метод onCellEnter проверяет доступность перемещения в указанную ячейку, если нельзя, то методы selectCell и setCursor вызваны не будут', () => {
  gameCtrl.selectedChar = gameCtrl.state.teams[0];
  gameCtrl.gamePlay.selectCell = jest.fn();
  gameCtrl.gamePlay.setCursor = jest.fn();
  gameCtrl.onCellEnter(38);
  expect(gameCtrl.gamePlay.selectCell).toBeCalledTimes(0);
  expect(gameCtrl.gamePlay.setCursor).toBeCalledTimes(0);
});

test('Метод onCellEnter проверяет доступность атаки', () => {
  gameCtrl.selectedChar = gameCtrl.state.teams[0];
  gameCtrl.gamePlay.selectCell = jest.fn();
  gameCtrl.gamePlay.setCursor = jest.fn();
  gameCtrl.onCellEnter(1);

  expect(gameCtrl.gamePlay.selectCell).toHaveBeenCalledWith(1, 'red');
  expect(gameCtrl.gamePlay.setCursor).toHaveBeenCalledWith('crosshair');
});

test('Метод onCellEnter проверяет доступность атаки, если нельзя, то методы selectCell и setCursor вызваны не будут', () => {
  gameCtrl.selectedChar = gameCtrl.state.teams[0];
  gameCtrl.selectedChar.position = 48;
  gameCtrl.gamePlay.selectCell = jest.fn();
  gameCtrl.gamePlay.setCursor = jest.fn();
  gameCtrl.onCellEnter(1);

  expect(gameCtrl.gamePlay.selectCell).toBeCalledTimes(0);
  expect(gameCtrl.gamePlay.setCursor).toBeCalled();
});

test('Метод onCellClick проверяет, что если в ячейке есть персонаж выделяем его', () => {
  gameCtrl.gamePlay.selectCell = jest.fn();
  gameCtrl.gamePlay.setCursor = jest.fn();
  gameCtrl.onCellClick(0);
  expect(gameCtrl.gamePlay.selectCell).toHaveBeenCalledWith(0);
  expect(gameCtrl.gamePlay.setCursor).toHaveBeenCalledWith('pointer');
});

test('Метод onCellClick проверяет, возможно ли переместится в данную ячейку, если да то перемещаемся', () => {
  gameCtrl.selectedChar = gameCtrl.state.teams[0];
  gameCtrl.stepIsPossible = true;
  gameCtrl.gamePlay.showTooltip = jest.fn();
  gameCtrl.endOfTurn = jest.fn();
  gameCtrl.onCellClick(8);
  expect(gameCtrl.endOfTurn).toBeCalled();
});

test('Метод onCellClick проверяет, если ходить на данную ячейку нельзя, уведомляем пользователя об этом.', () => {
  gameCtrl.selectedChar = gameCtrl.state.teams[0];
  gameCtrl.stepIsPossible = false;
  gameCtrl.gamePlay.showTooltip = jest.fn();
  gameCtrl.onCellClick(40);
  expect(gameCtrl.gamePlay.showTooltip).toHaveBeenCalledWith(
    'Information',
    'Impossible to go here!',
    'warning',
  );
});

test('Метод onCellClick проверяет, eсли атака доступна, атакуем', () => {
  gameCtrl.selectedChar = gameCtrl.state.teams[0];
  gameCtrl.stepIsPossible = true;
  gameCtrl.attackIsPossible = true;
  gameCtrl.attackTheEnemy = jest.fn();
  gameCtrl.onCellClick(1);
  expect(gameCtrl.attackTheEnemy).toBeCalled();
});

test(
  'Метод onCellClick проверяет, ' +
    'eсли range атаки не достаточно, уведомляем о том что атаковать врага нельзя.',
  () => {
    gameCtrl.selectedChar = gameCtrl.state.teams[0];
    gameCtrl.selectedChar.character.range = 0;
    gameCtrl.stepIsPossible = true;
    gameCtrl.attackIsPossible = false;
    gameCtrl.gamePlay.showTooltip = jest.fn();
    gameCtrl.onCellClick(1);
    expect(gameCtrl.gamePlay.showTooltip).toHaveBeenCalledWith(
      'Information',
      'To far...',
      'warning',
    );
  },
);
test(
  'Метод onCellClick проверяет,' +
    ' если клик был произведен по ячейке с неигровым персонажей, уведомляем об этом пользователя',
  () => {
    gameCtrl.gamePlay.showTooltip = jest.fn();
    gameCtrl.onCellClick(1);
    expect(gameCtrl.gamePlay.showTooltip).toHaveBeenCalledWith(
      'Information',
      'This is not a playable character!',
      'danger',
    );
  },
);

test('Метод onCellLeave вызывает hideCellTooltip', () => {
  gameCtrl.gamePlay.hideCellTooltip = jest.fn();
  gameCtrl.onCellLeave(1);
  expect(gameCtrl.gamePlay.hideCellTooltip).toBeCalled();
});

test('Метод onNewGame вызывает unsubscribeAllMouseListeners, prepareGame, clickOnCells, overOnCells, leaveOnCells, renderScore, gamePlay.showTooltip', () => {
  gameCtrl.gamePlay.unsubscribeAllMouseListeners = jest.fn();
  gameCtrl.prepareGame = jest.fn();
  gameCtrl.clickOnCells = jest.fn();
  gameCtrl.overOnCells = jest.fn();
  gameCtrl.leaveOnCells = jest.fn();
  gameCtrl.renderScore = jest.fn();
  gameCtrl.gamePlay.showTooltip = jest.fn();
  gameCtrl.onNewGame();
  expect(gameCtrl.gamePlay.unsubscribeAllMouseListeners).toBeCalled();
  expect(gameCtrl.prepareGame).toBeCalled();
  expect(gameCtrl.clickOnCells).toBeCalled();
  expect(gameCtrl.overOnCells).toBeCalled();
  expect(gameCtrl.leaveOnCells).toBeCalled();
  expect(gameCtrl.renderScore).toBeCalled();
  expect(gameCtrl.gamePlay.showTooltip).toHaveBeenCalledWith(
    'Information',
    'A new game has begun',
    'info',
  );
});

test('Метод onSaveGame вызывает метод save', () => {
  gameCtrl.stateService.save = jest.fn();
  gameCtrl.gamePlay.showTooltip = jest.fn();
  gameCtrl.onSaveGame();
  expect(gameCtrl.stateService.save).toBeCalled();
  expect(gameCtrl.gamePlay.showTooltip).toHaveBeenCalledWith('Information', 'Game saved', 'info');
});

test('Метод onLoadGame вызывает метод load, gamePlay.redrawPositions, showTooltip', () => {
  gameCtrl.gamePlay.redrawPositions = jest.fn();
  gameCtrl.renderScore = jest.fn();
  gameCtrl.gamePlay.showTooltip = jest.fn();
  gameCtrl.onSaveGame();
  gameCtrl.onLoadGame();
  expect(gameCtrl.renderScore).toBeCalled();
  expect(gameCtrl.gamePlay.showTooltip).toHaveBeenCalledWith('Information', 'Game loaded', 'info');
});

test('Метод onLoadGame вызывает метод load, если метод load выпадает в ошибку, ловим ее', () => {
  gameCtrl.stateService.storage = { getItem: () => new Error() };
  expect(() => gameCtrl.onLoadGame()).toThrow();
});

test('Метод attackTheEnemy закончит работу если чары игрока и npc не были переданы', () => {
  gameCtrl.attackTheEnemy(null, null);
  expect(gameCtrl.attackTheEnemy(null, null)).toBe(undefined);
});

test('Метод attackTheEnemy запушит игрока если у него хп больше', () => {
  gameCtrl.gamePlay.showDamage = jest.fn(() => Promise.resolve('test'));
  gameCtrl.attackTheEnemy(gameCtrl.state.teams[1], gameCtrl.state.teams[0]);
  expect(gameCtrl.gamePlay.showDamage).toBeCalled();
});

test('Метод stepAI вызывает метод attackTheEnemy, если npc может атаковать игрока', () => {
  gameCtrl.attackTheEnemy = jest.fn();
  gameCtrl.stepAI();
  expect(gameCtrl.attackTheEnemy).toBeCalled();
});

test('Метод stepAI завершит работу если нет чаров', () => {
  gameCtrl.state.teams = [];
  gameCtrl.stepAI();
  expect(gameCtrl.stepAI()).toBe(undefined);
});

test('Метод stepAI вызывает метод endOfTurn, если npc не может атаковать, но он может сходить.', () => {
  gameCtrl.state.teams[1].position = 55;
  gameCtrl.endOfTurn = jest.fn();
  gameCtrl.isStepPossible = jest.fn(() => 54);
  gameCtrl.stepAI();
  expect(gameCtrl.endOfTurn).toBeCalled();
});

test('Метод endOfTurn должен вызвать redrawPositions, если npc убил игрока', () => {
  gameCtrl.selectedChar = gameCtrl.state.teams[0];
  gameCtrl.selectedChar.character.health = 0;
  gameCtrl.gamePlay.redrawPositions = jest.fn();
  gameCtrl.endOfTurn();
  expect(gameCtrl.gamePlay.redrawPositions).toBeCalled();
});

test('Метод endOfTurn должен вызвать GamePlay.showMessage, если в команде игрока не осталось чаров', () => {
  gameCtrl.selectedChar = gameCtrl.state.teams[0];
  gameCtrl.selectedChar.character.health = 0;
  gameCtrl.getPlayerTeam = jest.fn(() => []);
  GamePlay.showMessage = jest.fn();
  gameCtrl.endOfTurn();
  expect(GamePlay.showMessage).toBeCalled();
});

test('Метод endOfTurn должен вызвать nextLevel, если в команде npc не осталось чаров', () => {
  gameCtrl.selectedChar = gameCtrl.state.teams[0];
  gameCtrl.getNPCTeam = jest.fn(() => []);
  gameCtrl.nextLevel = jest.fn();
  gameCtrl.endOfTurn();
  expect(gameCtrl.nextLevel).toBeCalled();
});

test('Метод endOfTurn устанавливает playerTurn в true, если до этого был ход npc', () => {
  gameCtrl.selectedChar = gameCtrl.state.teams[0];
  gameCtrl.nextLevel = jest.fn();
  gameCtrl.state.playerTurn = false;
  gameCtrl.endOfTurn();
  expect(gameCtrl.state.playerTurn).toBeTruthy();
});

test('Метод nextLevel, должен вызывать метод unsubscribe, чтобы отписаться от кликов во время загрузки нового левела', () => {
  gameCtrl.gamePlay.showTooltip = jest.fn();
  gameCtrl.gamePlay.unsubscribe = jest.fn();
  gameCtrl.nextLevel();
  expect(gameCtrl.gamePlay.unsubscribe).toBeCalled();
});

test('Метод nextLevel, должен вызывать метод endGame, если все уровни пройдены', () => {
  gameCtrl.state.currentLevel = 5;
  gameCtrl.gamePlay.showTooltip = jest.fn();
  gameCtrl.endGame = jest.fn();
  gameCtrl.gamePlay.unsubscribe = jest.fn();
  gameCtrl.nextLevel();
  expect(gameCtrl.endGame).toBeCalled();
});

test('Метод nextLevel, должен вызывать методы, при переходе на новый уровень', () => {
  gameCtrl.clickOnCells = jest.fn();
  gameCtrl.overOnCells = jest.fn();
  gameCtrl.leaveOnCells = jest.fn();
  gameCtrl.gamePlay.redrawPositions = jest.fn();
  gameCtrl.gamePlay.showTooltip = jest.fn();
  gameCtrl.gamePlay.unsubscribe = jest.fn();
  gameCtrl.nextLevel();
  expect(gameCtrl.clickOnCells).toBeCalled();
  expect(gameCtrl.leaveOnCells).toBeCalled();
  expect(gameCtrl.overOnCells).toBeCalled();
  expect(gameCtrl.gamePlay.unsubscribe).toBeCalled();
  expect(gameCtrl.gamePlay.showTooltip).toHaveBeenCalledWith('Information', 'Next level', 'info');
});

test('Метод endGame, должен вызвать renderScore, GamePlay.showMessage и GamePlay.unsubscribeAllMouseListeners  в случае победы игрока', () => {
  gameCtrl.state.currentLevel = 5;
  gameCtrl.gamePlay.showTooltip = jest.fn();
  gameCtrl.renderScore = jest.fn();
  gameCtrl.gamePlay.unsubscribeAllMouseListeners = jest.fn();
  GamePlay.showMessage = jest.fn();
  gameCtrl.endGame();
  expect(gameCtrl.renderScore).toBeCalled();
  expect(gameCtrl.gamePlay.unsubscribeAllMouseListeners).toBeCalled();
  expect(GamePlay.showMessage).toHaveBeenCalledWith('You Won!');
});

test('Метод updateState, копирует объект', () => {
  const testObj = {
    a: 2,
  };
  const state = gameCtrl.updateState({ test: testObj });
  state.test.a = 5;
  expect(testObj.a).toBe(2);
});