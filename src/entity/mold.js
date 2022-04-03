function MoldLayer(width, height) {
  this.width = width;
  this.height = height;
  
  this.backplane = document.createElement('canvas');
  this.backplane.width = this.width * MoldLayer.TILE_SIZE;
  this.backplane.height = this.height * MoldLayer.TILE_SIZE;
  this.bctx = this.backplane.getContext('2d');
  
  this.moldBuffer = [];
  this.activeMold = [];
  this.allMold = [];
  for (var j = 0; j < height; ++j) {
    this.allMold[j] = [];
    for (var i = 0; i < width; ++i) {
      this.allMold[j][i] = 0;
    }
  }
  
  this.tickTime = 0;
  this.sourceBounds = new Rectangle();
  this.destBounds = new Rectangle();
}

MoldLayer.TILE_SIZE = 96;

MoldLayer.prototype.add = function (x,y) {
  this.allMold[y][x] = 1;
  this.moldBuffer.push(new Mold(x,y,this.tickTime));
  
  this.bctx.fillStyle = '#00ff00';
  this.bctx.fillRect(x * MoldLayer.TILE_SIZE, y * MoldLayer.TILE_SIZE, MoldLayer.TILE_SIZE, MoldLayer.TILE_SIZE);
};
MoldLayer.prototype.update = function (elapsed, world) {
  this.tickTime += elapsed;
  // Tick all molds that should update this frame
  while (this.activeMold.length > 0 && this.activeMold[0].tickTime < this.tickTime) {
    var mold = this.activeMold.shift();
    var doSpread = mold.tick();
    var active = true;
    if (doSpread) {
      active = this.spread(mold.x, mold.y, world);
    }
    if (active) {
      this.activeMold.push(mold);
    }
  }
  
  // Insert all new molds in the proper place in the array
  if (this.moldBuffer.length > 0) {
    // Sort the mold buffer low-to-high
    this.moldBuffer.sort(function (a,b) {
      return a.tickTime - b.tickTime;
    });
    
    var i = 0;
    while (this.moldBuffer.length > 0) {
      if (i >= this.activeMold.length) {
        // Add remaining mold to the end of the array
        this.activeMold.push(this.moldBuffer.shift());
      } else {
        if (this.moldBuffer[0].tickTime < this.activeMold[i].tickTime) {
          // Swap the current buffer into the active array
          var swap = this.activeMold[i];
          this.activeMold[i] = this.moldBuffer.shift();
          // Insert the active mold into the buffer, preserving the sort
          var insertionPoint = this.moldBuffer.findIndex(function (x) { return x.tickTime > swap.tickTime; });
          this.moldBuffer.splice(1,0,swap);
        }
      }
      ++i;
    }
  }
};
MoldLayer.prototype.spread = function (x,y,world) {
  var spread = [];
  if (world.spec[y][x-1] !== 0 && !this.allMold[y][x-1]) {
    spread.push([x-1,y]);
  }
  if (world.spec[y-1][x] !== 0 && !this.allMold[y-1][x]) {
    spread.push([x,y-1]);
  }
  if (world.spec[y][x+1] !== 0 && !this.allMold[y][x+1]) {
    spread.push([x+1,y]);
  }
  if (world.spec[y+1][x] !== 0 && !this.allMold[y+1][x]) {
    spread.push([x,y+1]);
  }
  if (spread.length > 0) {
    var pick = Math.floor(Math.random() * spread.length);
    this.add(spread[pick][0],spread[pick][1]);
  }
  return spread.length > 1;
};
MoldLayer.prototype.draw = function (ctx, camera) {
  this.sourceBounds.copyFrom(camera.bounds);
  this.sourceBounds.moveTo(this.sourceBounds.left * World.TILE_SIZE, this.sourceBounds.top * World.TILE_SIZE);
  this.sourceBounds.resizeBy(World.TILE_SIZE);
  this.destBounds = camera.screenRect(camera.bounds,this.destBounds);
  ctx.drawImage(this.backplane, 
    this.sourceBounds.left, this.sourceBounds.top, this.sourceBounds.width, this.sourceBounds.height,
    this.destBounds.left, this.destBounds.top, this.destBounds.width, this.destBounds.height);
};

function Mold(x,y,tickTime) {
  this.active = true;
  this.x = x;
  this.y = y;  
  this.tickTime = Math.random() * Mold.TICK_PERIOD + tickTime;
}

Mold.TICK_PERIOD = 1000;
Mold.SPREAD_CHANCE = 1;

Mold.prototype.tick = function () {
  this.tickTime += Mold.TICK_PERIOD;
  if (Math.random() < Mold.SPREAD_CHANCE) {
    return true;
  }
  return false;
};