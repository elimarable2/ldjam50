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
  
  this.player.draw(ctx, this.camera);
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
};
World.prototype.mouseup = function () {
  this.mouse.pressed = false;
};
World.prototype.mousemove = function (ev) {
  this.mouse.x = ev.pageX - canvasX;
  this.mouse.y = ev.pageY - canvasY;
};