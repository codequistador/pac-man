import Level from './level';

export default Level.extend({
  squaresize: 60,
  layout: [
    [1, 1, 1, 2, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 3, 2, 2, 2, 1],
    [1, 2, 2, 1, 1, 1, 2, 2, 1],
    [1, 2, 2, 2 ,2, 2, 2, 2, 1],
    [1, 2, 1, 2, 1, 2, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 2, 1, 1, 1, 1, 1],
  ],
  startingPac: {
    x: 4,
    y: 4,
  },
  startingGhosts: [{
    x: 0,
    y: 0
  }, {
    x: 5,
    y: 0
  }],
  ghostRetreat: {
    x: 4,
    y: 3,
  },
  
});
