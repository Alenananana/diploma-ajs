import GameState from '../js/GameState.js';

test('Тест GameState вернет null, если ничего не передать в класс', () => {
  expect(GameState.from()).toBe(null);
});