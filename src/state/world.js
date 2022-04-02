function World(spec) {
	this.mouse = {
		x: NaN,
		y: NaN,
    pressed: false,
	};
  
  this.height = spec.length;
  this.width = spec[0].length;  
  this.spec = spec;
  
  this.player = new Player(this.width / 2,this.width / 2);
	this.camera = new Camera(World.MAJOR_AXIS_TILES,World.MAJOR_AXIS_TILES * 9 / 16);
  this.cameraControl = new WorldCameraController(this, this.camera);
  this.cameraControl.jumpToTarget();
  
  this.layout = toColors(spec);
  
  this.backplane = document.createElement('canvas');
  this.backplane.width = this.width * World.TILE_SIZE;
  this.backplane.height = this.height * World.TILE_SIZE;
  var bctx = this.backplane.getContext('2d');
  
  bctx.fillStyle = '#000000';
  bctx.fillRect(0,0,this.backplane.width,this.backplane.height);
  
  for (var i = 0; i < this.width; ++i) {
    for (var j = 0; j < this.height; ++j) {
      if (this.spec[j][i] !== 0) {
        var node = Math.floor(Math.random() * 32+32);
        var index = node.toString(16);
        while (index.length < 2) index = '0' + index;
        bctx.fillStyle = '#' + index + index + index;
      
        bctx.fillRect(i*World.TILE_SIZE,j*World.TILE_SIZE,World.TILE_SIZE,World.TILE_SIZE);
      }
    }
  }
  
  
  // this.console = new GameConsole(getWorldConsoleDefinition(this));
  
  // this.spec = toColors(smoothNoise(this.baseNoise, 2));
  
  // this.spec = generateWorld();
  
  this.sourceBounds = new Rectangle();
  this.destBounds = new Rectangle();
}

World.MAJOR_AXIS_TILES = 30;
World.TILE_SIZE = 96;

World.prototype.onEnter = function () {
  // MUSIC.stopAll();
  // MUSIC.play(MUSIC.main.get());
};
World.prototype.step = function (elapsed) {
  this.player.update(elapsed, this);
  this.cameraControl.step(elapsed);
};
World.prototype.draw = function (ctx) {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0,0,Game.WIDTH,Game.HEIGHT);
  
  this.sourceBounds.copyFrom(this.camera.bounds);
  this.sourceBounds.moveBy(this.sourceBounds.left * World.TILE_SIZE, this.sourceBounds.top * World.TILE_SIZE);
  this.sourceBounds.resizeBy(World.TILE_SIZE);
  this.destBounds = this.camera.screenRect(this.camera.bounds,this.destBounds);
  ctx.drawImage(this.backplane, 
    this.sourceBounds.left, this.sourceBounds.top, this.sourceBounds.width, this.sourceBounds.height,
    this.destBounds.left, this.destBounds.top, this.destBounds.width, this.destBounds.height);
  
  // ctx.drawImage(this.backplane,0,0,Game.WIDTH,Game.HEIGHT);
    
  var scale_spec = 2;
  
  for (var j = 0; j < this.height; ++j) {
    for (var i = 0; i < this.width; ++i) {
      ctx.fillStyle = this.layout[j][i];
      ctx.fillRect(i * scale_spec, j * scale_spec, scale_spec, scale_spec);
    }
  }
  
  ctx.strokeStyle = 'red';
  ctx.strokeRect(
    this.camera.bounds.left * scale_spec,
    this.camera.bounds.top * scale_spec,
    this.camera.bounds.width * scale_spec,
    this.camera.bounds.height * scale_spec);
    
  this.player.draw(ctx, this.camera);
  
};
World.prototype.keydown = function (ev) {
  // this.console.keydown(ev);
  this.player.keydown(ev);
};
World.prototype.keyup = function (ev) {
  // this.console.keyup(ev);
  this.player.keyup(ev);
};
World.prototype.mousedown = function (ev) {
  // if (!this.console.open) {
    this.mouse.pressed = true;
  // } 
  
  // ++this.blend;
  // if (this.blend >= this.interpolation.length) this.blend = 0;
  
  // this.spec = toColors(valueNoise(this.baseNoise, 4, 0.5, this.interpolation[this.blend]));
  
};
World.prototype.mouseup = function () {
  this.mouse.pressed = false;
};
World.prototype.mousemove = function (ev) {
  this.mouse.x = ev.pageX - canvasX;
  this.mouse.y = ev.pageY - canvasY;
};

function generateWorld(width, height) {
  if (width == undefined) width = 100;
  if (height == undefined) height = width;
  
  var noiseMap = valueNoise(whiteNoise(width,height), 4);
  
  var glowMap = glow(width, height, 5, 20);
  buffer_apply(glowMap, function (value) {
    return value * 0.5;
  });
  
  var outerEdgeMap = glow(width, height, 40, 50);
  buffer_invert(outerEdgeMap);
  
  buffer_add(noiseMap, glowMap);
  buffer_subtract(noiseMap, outerEdgeMap);
  
  buffer_clamp(noiseMap, 0, 1);
  
  buffer_apply(noiseMap, function (value) {
    return value >= 0.5 ? 1 : 0;
  });
  
  noiseMap = cull(noiseMap,50,50);
  
  // Remove pillars
  buffer_apply(noiseMap, function (value, x, y) {
    if (x > 0
      && y > 0
      && x < width
      && y < height
      && value === 0) {
      if (noiseMap[y][x - 1] === 1
        && noiseMap[y - 1][x] === 1
        && noiseMap[y][x + 1] === 1
        && noiseMap[y + 1][x] === 1) {
        return 1;
      }
    }
    return value;
  });
  
  return new World(noiseMap);
}