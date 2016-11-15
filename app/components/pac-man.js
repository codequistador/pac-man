import Ember from 'ember';
import KeyboardShortcuts from 'ember-keyboard-shortcuts/mixins/component';

export default Ember.Component.extend(KeyboardShortcuts, {

  didInsertElement: function() {
    this.drawWalls();
    this.drawCircle();
  },

  // Component-level vars
  x: 1,
  y: 2,
  squareSize: 40,
  walls: [
    {x: 1, y: 1},
    {x: 8, y: 5}
  ],
  screenWidth: 20, // bound to html5 canvas
  screenHeight: 15, // bound to html5 canvas

  // Drawing and erasing
  drawCircle: function() {
    let ctx = this.get('ctx');
    let x = this.get('x');
    let y = this.get('y');
    let squareSize = this.get('squareSize');

    let pixelX = (x+1/2) * squareSize;
    let pixelY = (y+1/2) * squareSize;

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(pixelX, pixelY, squareSize/2, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
  },

  drawWalls: function() {
    let squareSize = this.get('squareSize');
    let ctx = this.get('ctx');
    ctx.fillStyle = '#000';

    let walls = this.get('walls');
    walls.forEach(function(wall){
      ctx.fillRect(wall.x * squareSize,
                   wall.y * squareSize,
                   squareSize,
                   squareSize);
    });
  },

  clearScreen: function() {
    let ctx = this.get('ctx');

    ctx.clearRect(0, 0, this.get('screenPixelWidth'), this.get('screenPixelHeight'));
  },

  // Moving and collisions
  movePacMan: function(direction, amount) {
    this.incrementProperty(direction, amount);

    if (this.collidedWithBorder() || this.collidedWithWall()) {
      this.decrementProperty(direction, amount);
    }

    this.clearScreen();
    this.drawWalls();
    this.drawCircle();
  },

  collidedWithBorder: function() {
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

  collidedWithWall: function() {
    let x = this.get('x');
    let y = this.get('y');
    let walls = this.get('walls');

    return walls.any(function(wall){
      return x === wall.x && 
             y === wall.y;
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
    up: function() { this.movePacMan('y', -1); },
    down: function() { this.movePacMan('y', 1); },
    left: function() { this.movePacMan('x', -1); },
    right: function() { this.movePacMan('x', 1); },
  },

});
