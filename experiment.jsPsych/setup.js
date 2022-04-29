const DIRECTIONS = {
  arrowleft: {
    code: 37,
    movement: [-1,0],
  },
  arrowup: {
    code: 38,
    movement: [0,-1],
  },
  arrowright: {
    code: 39,
    movement: [1,0],
  },
  arrowdown: {
    code: 40,
    movement: [0,1],
  }
};

const ACTIONSPACE = [[0,1],[0,-1],[1,0],[-1,0]];

const EXPSETTINGS = {
  padding: 2,
  cellSize: 35,
  matrixsize: 11
  };

const WINSETTING = {
  w: (EXPSETTINGS.cellSize + EXPSETTINGS.padding) * EXPSETTINGS.matrixsize + EXPSETTINGS.padding,
  h: (EXPSETTINGS.cellSize + EXPSETTINGS.padding) * EXPSETTINGS.matrixsize + EXPSETTINGS.padding

}

const COLORPOOL = {
  map: "white",
  line: "grey",
  obstacle: "black",
  player: "red",
  goal: "blue",
  fixation: "black"

}