function calculateDiffPositions(objectA, objectB, boardSize) {
  const coordinates = Array(boardSize ** 2)
    .fill(0)
    .map((e, i) => ({ x: i % boardSize, y: Math.floor(i / boardSize), index: i }));
  const currentXY = coordinates[objectA];
  const nextXY = coordinates[objectB];
  const diffX = Math.abs(nextXY.x - currentXY.x);
  const diffY = Math.abs(nextXY.y - currentXY.y);
  return {
    diffX,
    diffY,
  };
}

export function calcTileType(index, boardSize) {
  const fillBoard = [
    'top-left',
    ...Array(boardSize - 2).fill('top'),
    'top-right',
    ...Array(boardSize - 2).fill(['left', ...Array(boardSize - 2).fill('center'), 'right']),
    'bottom-left',
    ...Array(boardSize - 2).fill('bottom'),
    'bottom-right',
  ].flat();
  return fillBoard[index];
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}

export function isStepPossible(curPosition, nextPosition, step, boardSize = 8) {
  const diffCoordinates = calculateDiffPositions(curPosition, nextPosition, boardSize);
  if (diffCoordinates.diffX <= step && diffCoordinates.diffY <= step) {
    if (
      diffCoordinates.diffX === 0 ||
      diffCoordinates.diffY === 0 ||
      !Math.abs(diffCoordinates.diffX - diffCoordinates.diffY)
    ) {
      return true;
    }
  }
  return false;
}

export function isAttackPossible(curPosition, enemyPosition, range, boardSize = 8) {
  const diffCoordinates = calculateDiffPositions(curPosition, enemyPosition, boardSize);
  return diffCoordinates.diffX <= range && diffCoordinates.diffY <= range;
}