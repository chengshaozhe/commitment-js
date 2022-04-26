const DIRECTIONS = {
  ArrowLeft: {
    code: 37,
    movement: [-1,0],
  },
  ArrowUp: {
    code: 38,
    movement: [0,-1],
  },
  ArrowRight: {
    code: 39,
    movement: [1,0],
  },
  ArrowDown: {
    code: 40,
    movement: [0,1],
  }
};

const ACTIONSPACE = [[0,1],[0,-1],[1,0],[-1,0]];

const EXPSETTINGS = {
  padding: 2,
  cellSize: 60,
  matrixsize: 11
  };

const WINSETTING = {
  w: (EXPSETTINGS.cellSize + EXPSETTINGS.padding) * EXPSETTINGS.matrixsize + EXPSETTINGS.padding,
  h: (EXPSETTINGS.cellSize + EXPSETTINGS.padding) * EXPSETTINGS.matrixsize + EXPSETTINGS.padding

}
test