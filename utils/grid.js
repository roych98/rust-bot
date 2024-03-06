function findXGrid (mapSize, gridSize, currentPosition) {
  return Math.floor(currentPosition / gridSize);
}

function findYGrid (mapSize, gridSize, currentPosition) {
  return Math.ceil(currentPosition / gridSize);
}

const getGridDirection = (gridSize, currentPosition, type, relative) => {
  const mockCurrentPosition = currentPosition;
  switch (type) {
    case 'x': {
      return mockCurrentPosition > (relative * gridSize) + (gridSize / 2) ? 'Right' : 'Left';
    }
    case 'y': {
      return mockCurrentPosition > (relative * gridSize) - (gridSize / 2) ? 'Top' : 'Bottom';
    }
  }
};

const getGridData = (x, y, mapSize) => {
  const gridSize = 146.3;

  const relativeX = findXGrid(mapSize, gridSize, x);
  const relativeY = findYGrid(mapSize, gridSize, y);
  function calculateGrid (mapSize, gridSize) {
    const relativeX = findXGrid(mapSize, gridSize, x);
    const relativeY = findYGrid(mapSize, gridSize, y);

    const gridWidth = Math.ceil(mapSize / gridSize);
    const gridHeight = Math.ceil(mapSize / gridSize);

    const xMap = {};
    const yMap = {};
    for (let i = 0; i < gridWidth; i++) {
      let letter = String.fromCharCode(i >= 26 ? 65 - 26 + i : 65 + i);
      if (i >= 26) {
        letter = `A${letter}`;
      }
      xMap[i] = `${letter}`;
    }

    for (let i = gridHeight - 1; i >= 0; i--) {
      yMap[`${gridHeight - 1 - i}`] = i;
    }

    return `${xMap[relativeX]}${yMap[relativeY]}`;
  }
  const playerGrid = calculateGrid(mapSize, gridSize, x, y);

  const xDirection = getGridDirection(gridSize, x, 'x', relativeX);
  const yDirection = getGridDirection(gridSize, y, 'y', relativeY);

  return { playerGrid, xDirection, yDirection };
};

module.exports = {
  getGridData
};
