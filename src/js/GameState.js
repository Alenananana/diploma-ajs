export default class GameState {
  static from(object) {
    if (typeof object === 'object') {
      return {
        currentLevel: null,
        playerTurn: null,
        numberOfPoints: null,
        record: null,
      };
    }
    return null;
  }
}