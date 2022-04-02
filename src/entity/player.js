function Player(x,y) {
  this.bounds = new Rectangle(x,y,1,1);
  this.drawBounds = new Rectangle(this.bounds);
  
	this.keys = {
		left: false,
		right: false,
		up: false,
		down: false,
	};
}
Player.prototype.update = function(elapsed, world) {
  if (this.keys.left) {
    this.bounds.moveBy(-0.003 * elapsed, 0);
  }
  if (this.keys.right) {
    this.bounds.moveBy(0.003 * elapsed, 0);
  }
  if (this.keys.up) {
    this.bounds.moveBy(0, -0.003 * elapsed);
  }
  if (this.keys.down) {
    this.bounds.moveBy(0, 0.003 * elapsed);
  }
};
Player.prototype.animationUpdate = function (elapsed) {
};
Player.prototype.draw = function(ctx, camera) {
  this.drawBounds.copyFrom(this.bounds);
  this.drawBounds = camera.screenRect(this.drawBounds, this.drawBounds);
  
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(this.drawBounds.left, this.drawBounds.top, this.drawBounds.width, this.drawBounds.height);
  
  var i = 0;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  for (var prop in this.keys) {
    ctx.fillText(prop + ': '+ this.keys[prop], 0, i * 12);
    ++i;
  }
  
  // ctx.drawImage(this.sprite, this.animFrame * this.sourceBounds.width, this.facing * this.sourceBounds.height, this.sourceBounds.width, this.sourceBounds.height, 
      // this.drawBounds.left, this.drawBounds.top, this.drawBounds.width, this.drawBounds.height);
};
Player.prototype.debugDraw = function(ctx, camera) {
};
Player.prototype.mousedown = function (x,y, camera) {  
};

Player.prototype.keydown = function (ev) {
	switch(ev.key) {
		case 'ArrowLeft': // Key Left
		case 'a':
			this.keys.left = true; break;
		case 'ArrowUp': // Key Up
		case 'w':
			this.keys.up = true; break;
		case 'ArrowRight': // Key Right
		case 'd':
			this.keys.right = true; break;
		case 'ArrowDown': // Key Down
		case 's':
			this.keys.down = true; break;
	}
};
Player.prototype.keyup = function (ev) {
	switch(ev.key) {
		case 'ArrowLeft': // Key Left
		case 'a':
			this.keys.left = false; break;
		case 'ArrowUp': // Key Up
		case 'w':
			this.keys.up = false; break;
		case 'ArrowRight': // Key Right
		case 'd':
			this.keys.right = false; break;
		case 'ArrowDown': // Key Down
		case 's':
			this.keys.down = false; break;
	}
};