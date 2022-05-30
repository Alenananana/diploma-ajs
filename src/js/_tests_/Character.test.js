import Character from '../js/Character.js';
import Bowman from '../js/Bowman.js';

test('Charcter-first-test', () => {
  const bowman = new Bowman(1);
  expect(bowman).toBeDefined();
});

test('Character-Error', () => {
  function instanceNotCreated() {
    try {
      return new Character(1);
    } catch (e) {
      throw new Error(e);
    }
  }

  expect(instanceNotCreated).toThrow();
});

test('levelUp-first_test', () => {
  const bowman = new Bowman(1);
  bowman.levelUp();
  const referenceObject = {
    attack: 45,
    defence: 45,
    health: 100,
    isPlayer: true,
    level: 2,
    range: 2,
    step: 2,
    type: 'bowman',
  };
  expect(bowman).toEqual(referenceObject);
});

test('levelUp-second_test', () => {
  const bowman = new Bowman(1);
  bowman.health = 0;

  function levelUpThrowError() {
    try {
      return bowman.levelUp();
    } catch (e) {
      throw new Error(e);
    }
  }

  expect(levelUpThrowError).toThrow();
});

test('Метод levelUp() должен устанавливать health равный 100, если во время повышения уровня чара хп превысило 100', () => {
  const bowman = new Bowman(1);
  bowman.health = 120;
  bowman.levelUp();
  expect(bowman.health).toBe(100);
});

test('Метод levelUp() должен устанавливать health равный 100, если во время повышения уровня чара хп равно 20', () => {
  const bowman = new Bowman(1);
  bowman.health = 20;
  bowman.levelUp();
  expect(bowman.health).toBe(100);
});

test('Метод damage() должен корректно уменьшать хп, если хп больше 0', () => {
  const bowman = new Bowman(1);
  bowman.damage(50);
  expect(bowman.health).toBe(50);
});

test('Метод damage() должен корректно уменьшать хп, если хп меньше 0', () => {
  const bowman = new Bowman(1);
  bowman.health = -10;
  bowman.damage(50);
  expect(bowman.health).toBe(0);
});