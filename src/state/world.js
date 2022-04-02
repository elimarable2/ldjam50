function World(spec) {
	this.mouse = {
		x: NaN,
		y: NaN,
    pressed: false,
	};
  
  this.height = spec.length;
  this.width = spec[0].length;  
  this.spec = spec;
  
  this.player = new Player(0,0);
	this.camera = new Camera();
  this.cameraControl = new WorldCameraController(this, this.camera);
  
  this.layout = toColors(spec);
  
  // this.console = new GameConsole(getWorldConsoleDefinition(this));
  
  // this.spec = toColors(smoothNoise(this.baseNoise, 2));
  
  // this.spec = generateWorld();
  
  this.cameraControl.jumpToTarget();
}
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
  
  // this.player.draw(ctx, this.camera);
  
  var scale_spec = 2;
  
  for (var j = 0; j < this.height; ++j) {
    for (var i = 0; i < this.width; ++i) {
      ctx.fillStyle = this.layout[j][i];
      ctx.fillRect(i * scale_spec, j * scale_spec, scale_spec, scale_spec);
    }
  }
};
World.prototype.keydown = function (ev) {
  // this.console.keydown(ev);
};
World.prototype.keyup = function (ev) {
  // this.console.keyup(ev);
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