function Mold(x,y) {
  this.bounds = new Circle(x + 0.5,y + 0.5,0.5);
  this.drawBounds = new Rectangle(this.bounds);
  
  this.active = true;
  this.tickTime = Math.random() * Mold.TICK_PERIOD - Mold.TICK_PERIOD;
}

Mold.TICK_PERIOD = 1000;
Mold.SPREAD_CHANCE = 0.3;

Mold.prototype.update = function(elapsed, world) {
  if (this.active) {
    this.tickTime += elapsed;
    if (this.tickTime > Mold.TICK_PERIOD) {
      this.tickTime -= Mold.TICK_PERIOD;
      if (Math.random() < Mold.SPREAD_CHANCE) {
        this.spread(world);
      }
    }
  }
};
Mold.prototype.spread = function (world) {
  var x = Math.floor(this.bounds.centerX);
  var y = Math.floor(this.bounds.centerY);
  var spread = [];
  if (world.spec[y][x-1] !== 0 && !world.mold[y][x-1]) {
    spread.push([x-1,y]);
  }
  if (world.spec[y-1][x] !== 0 && !world.mold[y-1][x]) {
    spread.push([x,y-1]);
  }
  if (world.spec[y][x+1] !== 0 && !world.mold[y][x+1]) {
    spread.push([x+1,y]);
  }
  if (world.spec[y+1][x] !== 0 && !world.mold[y+1][x]) {
    spread.push([x,y+1]);
  }
  if (spread.length > 0) {
    var pick = Math.floor(Math.random() & spread.length);
    var nextX = spread[pick][0];
    var nextY = spread[pick][1];
    world.mold[nextY][nextX] = new Mold(nextX, nextY);
  }
  if (spread.length <= 1) {
    this.active = false;
  }
};
Mold.prototype.draw = function(ctx, camera, active) {
  this.drawBounds.copyFrom(this.bounds);
  this.drawBounds = camera.screenRect(this.drawBounds, this.drawBounds);
  
  if (this.active) {
    ctx.fillStyle = "#00ff00";
  } else {
    ctx.fillStyle = "#008000";
  }
  
  ctx.fillRect(this.drawBounds.left, this.drawBounds.top, this.drawBounds.width, this.drawBounds.height);
};