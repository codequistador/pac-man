import Ember from 'ember';
import KeyboardShortcuts from 'ember-keyboard-shortcuts/mixins/component';

export default Ember.Component.extend(KeyboardShortcuts, {

  didInsertElement() {
    this.drawGrid();
    this.drawPac();
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
  drawPac() {
    let x = this.get('x');
    let y = this.get('y');
    let radiusDivisor = 2;
    this.drawCircle(x, y, radiusDivisor);
  },

  drawPellet(x, y) {
    let radiusDivisor = 6;
    this.drawCircle(x, y, radiusDivisor);
  },

  drawCircle(x, y, radiusDivisor) {
    let ctx = this.get('ctx');
    let squareSize = this.get('squareSize');

    let pixelX = (x+1/2) * squareSize;
    let pixelY = (y+1/2) * squareSize;

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(pixelX, pixelY, squareSize/radiusDivisor, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
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
  movePacMan(direction, amount) {
    this.incrementProperty(direction, amount);

    if (this.collidedWithBorder() || this.collidedWithWall()) {
      this.decrementProperty(direction, amount);
    }

    this.processAnyPellets();

    this.clearScreen();
    this.drawGrid();
    this.drawPac();
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

  collidedWithBorder() {
    let x = this.get('x');
    let y = this.get('y');
    let screenHeight = this.get('screenHeight');
    let screenWidth = this.get('screenWidth');

    let pacOutOfBounds = x < 0 ||
                         y < 0 ||
                         x >= screenWidth ||
                         y >= screenHeight;
    return pacOutOfBounds;
  },

  collidedWithWall() {
    let x = this.get('x');
    let y = this.get('y');
    let grid = this.get('grid');

    return grid[y][x] === 1;
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

  keyboardShortcuts: {
    up() { this.movePacMan('y', -1); },
    down() { this.movePacMan('y', 1); },
    left() { this.movePacMan('x', -1); },
    right() { this.movePacMan('x', 1); },
  },

});
