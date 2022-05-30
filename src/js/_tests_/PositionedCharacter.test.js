import PositionedCharacter from '../js/PositionedCharacter.js';
import Bowman from '../js/Bowman.js';

test('Ошибка если в PositionedCharacter передать объект, которые не наследуется от Character', () => {
  const testObject = {};
  expect(() => new PositionedCharacter(testObject, 1)).toThrow();
});

test('Ошибка если в PositionedCharacter передать в позицию не число', () => {
  const bowman = new Bowman(1);
  expect(() => new PositionedCharacter(bowman, '1')).toThrow();
});