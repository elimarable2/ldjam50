function MoldLayer(width, height) {
  this.backplane = document.createElement('canvas');
  this.backplane.width = this.width * MoldLayer.TILE_SIZE;
  this.backplane.height = this.height * MoldLayer.TILE_SIZE;
  
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
  this.drawBounds = new Rectangle();
}

MoldLayer.TILE_SIZE = 96;

MoldLayer.prototype.add = function (x,y) {
  this.allMold[y][x] = 1;
  this.moldBuffer.push(new Mold(x,y,this.tickTime));
};
MoldLayer.prototype.update = function (elapsed, world) {
  this.tickTime += elapsed;
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
  
  if (this.moldBuffer.length > 0) {
    this.moldBuffer.sort(function (a,b) {
      return a.tickTime - b.tickTime;
    });
    
    var i = 0;
    while (this.moldBuffer.length > 0) {
      if (i >= this.activeMold.length) {
        this.activeMold.push(this.moldBuffer.shift());
      } else {
        if (this.moldBuffer[0].tickTime < this.activeMold[i].tickTime) {
          var swap = this.activeMold[i];
          this.activeMold[i] = this.moldBuffer.shift();
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
  this.drawBounds.moveTo(0,0);
  this.drawBounds.resize(1,1);
  this.drawBounds = camera.screenRect(this.drawBounds, this.drawBounds);
  
    ctx.fillStyle = '#00ff00';
    
  for (var i = 0; i < this.activeMold.length; ++i) {
    var m = this.activeMold[i];
    var dl = m.x * this.drawBounds.width + this.drawBounds.left;
    var dt = m.y * this.drawBounds.height + this.drawBounds.top;
    ctx.globalAlpha = 1 - i / this.activeMold.length;
    ctx.fillRect(dl,dt,this.drawBounds.width, this.drawBounds.height);
  }
  ctx.globalAlpha = 1;
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