function TitleCard() {
	this.mouse = {
		x: NaN,
		y: NaN,
    pressed: false,
	};
}

TitleCard.prototype.onEnter = function () {
  // MUSIC.stopAll();
  // MUSIC.play(MUSIC.main.get());
};
TitleCard.prototype.step = function (elapsed) {
};
TitleCard.prototype.draw = function (ctx) {
};
TitleCard.prototype.keydown = function (ev) {
  // this.console.keydown(ev);
  this.player.keydown(ev);
  
  if (ev.key === 'n') {
    Game.setState(generateLevel(this.index+1));
  }
};
TitleCard.prototype.keyup = function (ev) {
  // this.console.keyup(ev);
};
TitleCard.prototype.mousedown = function (ev) {
  this.mouse.pressed = true;
};
TitleCard.prototype.mouseup = function () {
  this.mouse.pressed = false;
};
TitleCard.prototype.mousemove = function (ev) {
  this.mouse.x = ev.pageX - canvasX;
  this.mouse.y = ev.pageY - canvasY;
};
