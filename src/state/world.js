function World() {
	this.mouse = {
		x: NaN,
		y: NaN,
    pressed: false,
	};
  
  this.player = new Player(0,0);
	this.camera = new Camera();
  this.cameraControl = new WorldCameraController(this, this.camera);
  
  // this.console = new GameConsole(getWorldConsoleDefinition(this));
  
  this.interpolation = [
    function (start, end, t) {
      return t * end + (1 - t) * start;
    },
    function (start, end, t) {
      var t2 = -(Math.cos(Math.PI * t) - 1) / 2;
      return t2 * end + (1 - t2) * start;
    }
  ];
  this.blend = 0;
  
  this.width = 100;
  this.height = 100;
  this.baseNoise = whiteNoise(this.width,this.height);
  
  function onOff(noiseValue) {
    var on = noiseValue > 0.5;
    return on ? 'white' : 'black';
  }
  
  // this.spec = toColors(valueNoise(this.baseNoise, 4), onOff);
  
  var noiseMap = valueNoise(this.baseNoise, 4);
  var glowMap = glow(this.width, this.height, 5, 20);
  buffer_apply(glowMap, function (value) {
    return value * 0.5;
  });
  
  var outerEdgeMap = glow(this.width, this.height, 40, 50);
  buffer_invert(outerEdgeMap);
  
  buffer_add(noiseMap, glowMap);
  buffer_subtract(noiseMap, outerEdgeMap);
  
  buffer_clamp(noiseMap, 0, 1);
  
  buffer_apply(noiseMap, function (value) {
    return value >= 0.5 ? 1 : 0;
  });
  
  noiseMap = cull(noiseMap,50,50);
  
  // this.spec = toColors(noiseMap);
  this.spec = toColors(noiseMap);
  
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
  
  for (var j = 0; j < this.spec.length; ++j) {
    for (var i = 0; i < this.spec[j].length; ++i) {
      ctx.fillStyle = this.spec[j][i];
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
