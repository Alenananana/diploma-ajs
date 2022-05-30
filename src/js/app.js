/**
 * Entry point of app: don't change this
 */
 import GamePlay from './GamePlay.js';
 import GameController from './GameController.js';
 import GameStateService from './GameStateService.js';
 
 const gamePlay = new GamePlay();
 gamePlay.bindToDOM(document.querySelector('#game-container'));
 
 const stateService = new GameStateService(localStorage);
 
 const gameCtrl = new GameController(gamePlay, stateService);
 gameCtrl.init();
 
 // don't write your code here