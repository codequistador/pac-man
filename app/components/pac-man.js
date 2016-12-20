import Ember from 'ember';
import KeyboardShortcuts from 'ember-keyboard-shortcuts/mixins/component';

export default Ember.Component.extend(KeyboardShortcuts, {

  didInsertElement() {
    this.movementLoop();
  },

  // Component-level vars
  score: 0,
  levelNumber: 1,
  x: 1,
  y: 2,
  squareSize: 40,
  // 0 is a blank space
  // 1 is a wall
  // 2 is a pellet
  grid: [
    [2, 2, 2, 2, 2, 2, 2, 1],
    [2, 1, 2, 1, 2, 2, 2, 1],
    [2, 2, 1, 2, 2, 2, 2, 1],
    [2, 2, 2, 2, 2, 2, 2, 1],
    [2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1],
  ],
  screenWidth: Ember.computed(function() {
    return this.get('grid.firstObject.length');
  }),
  screenHeight: Ember.computed(function() {
    return this.get('grid.length');
  }),

  // Drawing and erasing
  drawPac(){
    let x = this.get('x');
    let y = this.get('y');
    let radiusDivisor = 2;
    this.drawCircle(x, y, radiusDivisor, this.get('direction'));
  },

  drawPellet(x, y){
    let radiusDivisor = 6;
    this.drawCircle(x, y, radiusDivisor, 'stopped');
  },

  drawCircle(x, y, radiusDivisor, direction) {
    let ctx = this.get('ctx');
    let squareSize = this.get('squareSize');

    let pixelX = (x + 1/2 + this.offsetFor('x', direction)) * squareSize;
    let pixelY = (y + 1/2 + this.offsetFor('y', direction)) * squareSize;

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(pixelX, pixelY, squareSize/radiusDivisor, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
  },

  offsetFor(coordinate, direction){
    let frameRatio = this.get('frameCycle') / this.get('framesPerMovement');
    return this.get(`directions.${direction}.${coordinate}`) * frameRatio;
  },

  drawWall(x, y) {
    let ctx = this.get('ctx');
    let squareSize = this.get('squareSize');

    ctx.fillStyle = '#000';
    ctx.fillRect(x * squareSize,
                 y * squareSize,
                 squareSize,
                 squareSize);
  },

  drawGrid() {
    let grid = this.get('grid');
    grid.forEach((row, rowIndex)=>{
      row.forEach((cell, columnIndex)=>{
        if(cell === 1){
          this.drawWall(columnIndex, rowIndex);
        } 
        if(cell === 2){
          this.drawPellet(columnIndex, rowIndex);
        }
      });
    });
  },

  clearScreen() {
    let ctx = this.get('ctx');

    ctx.clearRect(0, 0, this.get('screenPixelWidth'), this.get('screenPixelHeight'));
  },

  // Moving and collisions

  direction: 'down',
  changePacDirection(direction){
    let intent = this.get('intent');
    if(this.pathBlockedInDirection(intent)) {
      this.set('direction', 'stopped');
    } else {
      this.set('direction', intent);
    }
  },

  pathBlockedInDirection(direction) {
    let cellTypeInDirection = this.cellTypeInDirection(direction);
    return Ember.isEmpty(cellTypeInDirection) || cellTypeInDirection === 1;
  },

  cellTypeInDirection(direction) {
    let nextX = this.nextCoordinate('x', direction);
    let nextY = this.nextCoordinate('y', direction);

    return this.get(`grid.${nextY}.${nextX}`);
  },

  nextCoordinate(coordinate, direction){
    return this.get(coordinate) + this.get(`directions.${direction}.${coordinate}`);
  },

  frameCycle: 1,
  framesPerMovement: 30,
  movementLoop(){
    if(this.get('frameCycle') === this.get('framesPerMovement')){
      let direction = this.get('direction');
      this.set('x', this.nextCoordinate('x', direction));
      this.set('y', this.nextCoordinate('y', direction));

      this.set('frameCycle', 1);
      this.processAnyPellets();
      this.changePacDirection();
    } else if(this.get('direction') === 'stopped') {
      this.changePacDirection();
    } else {
      this.incrementProperty('frameCycle');
    }

    this.clearScreen();
    this.drawGrid();
    this.drawPac();

    Ember.run.later(this, this.movementLoop, 1000/60);
  },

  processAnyPellets() {
    let x = this.get('x');
    let y = this.get('y');
    let grid = this.get('grid');

    if(grid[y][x] === 2) {
      grid[y][x] = 0;
      this.incrementProperty('score');

      if(this.levelComplete()){
        this.incrementProperty('levelNumber');
        this.restartLevel();
      }
    }
  },

  // Score and Levels
  levelComplete() {
    let hasPelletsLeft = false;
    let grid = this.get('grid');

    grid.forEach((row)=>{
      row.forEach((cell)=>{
        if(cell === 2){
          hasPelletsLeft = true;
        }
      });
    });
    return !hasPelletsLeft;
  },

  restartLevel() {
    this.set('x', 0);
    this.set('y', 0);

    let grid = this.get('grid');
    grid.forEach((row, rowIndex)=>{
      row.forEach((cell, columnIndex)=>{
        if(cell === 0){
          grid[rowIndex][columnIndex] = 2;
        }
      });
    });
  },

  // Computed Properties
  ctx: Ember.computed(function(){
    let canvas = document.getElementById("myCanvas");
    let ctx = canvas.getContext("2d");
    return ctx;
  }),

  screenPixelWidth: Ember.computed(function() {
    return this.get('screenWidth') * this.get('squareSize');
  }),

  screenPixelHeight: Ember.computed(function() {
    return this.get('screenHeight') * this.get('squareSize');
  }),

  directions: {
    'up': {x: 0, y: -1},
    'down': {x: 0, y: 1},
    'left': {x: -1, y: 0},
    'right': {x: 1, y: 0},
    'stopped': {x: 0, y: 0},
  },

  intent: 'down',
  keyboardShortcuts: {
    up() { this.set('intent', 'up'); },
    down() { this.set('intent', 'down'); },
    left() { this.set('intent', 'left'); },
    right() { this.set('intent', 'right'); },
  },

});
