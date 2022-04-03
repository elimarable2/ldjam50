function TitleCard() {
	this.mouse = {
		x: NaN,
		y: NaN,
    pressed: false,
	};
  
  this.transition = false;
  this.fadeTime = 0;
  this.animTime = 0;
}

TitleCard.TOTAL_FADE_TIME = 2000;

TitleCard.prototype.onEnter = function () {
  // MUSIC.stopAll();
  // MUSIC.play(MUSIC.main.get());
};
TitleCard.prototype.step = function (elapsed) {
  if (this.transition) {
    this.fadeTime += elapsed;
    if (this.fadeTime > TitleCard.TOTAL_FADE_TIME) {
      Game.setState(generateLevel(1));
    }
  }
  
  this.animTime += elapsed;
};
TitleCard.prototype.draw = function (ctx) {
  ctx.globalAlpha = 1;
  
  ctx.fillStyle = '#000000';
  ctx.fillRect(0,0,Game.WIDTH,Game.HEIGHT);
  
  var minorAxis = Math.min(Game.WIDTH, Game.HEIGHT);
  var textSize = Math.min(40, minorAxis / 8);
  var dx = Game.WIDTH / 2;
  var dy = Math.max(Game.HEIGHT - 3 * textSize, 4 * Game.HEIGHT / 5) + textSize / 6 * Math.sin(this.animTime / 1000);
  var dw = 4 * Game.WIDTH / 5;
  
  ctx.lineWidth = 1;
  
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = 'bold '+textSize+'px monospace';

  var gradient = ctx.createLinearGradient(0, dy, 0, dy - textSize);
  gradient.addColorStop(0, "#808080");
  gradient.addColorStop(1, "white");
  ctx.strokeStyle = gradient;  
  ctx.fillStyle = "#202020"; 
  
  ctx.fillText("Press any key to begin", dx, dy, dw);
  ctx.strokeText("Press any key to begin", dx, dy, dw);
  
  if (this.transition) {
    ctx.globalAlpha = this.fadeTime / TitleCard.TOTAL_FADE_TIME;
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0,0,Game.WIDTH,Game.HEIGHT);
  }
};
TitleCard.prototype.keydown = function (ev) {
};
TitleCard.prototype.keyup = function (ev) {
  this.transition = true;
};
TitleCard.prototype.mousedown = function (ev) {
  this.mouse.pressed = true;
};
TitleCard.prototype.mouseup = function () {
  this.mouse.pressed = false;
  this.transition = true;
};
TitleCard.prototype.mousemove = function (ev) {
  this.mouse.x = ev.pageX - canvasX;
  this.mouse.y = ev.pageY - canvasY;
};
