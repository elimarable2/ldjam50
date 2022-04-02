function Camera() {
  this.aspectRatio = [16,9];
  this.bounds = new Rectangle(0,0,this.aspectRatio[0],this.aspectRatio[1]);
}
Camera.prototype.moveBy = function () {
  this.bounds.moveBy.apply(this.bounds, arguments);
};
Camera.prototype.moveTo = function () {
  this.bounds.moveTo.apply(this.bounds, arguments);
};
Camera.prototype.moveCenterTo = function () {
  this.bounds.moveCenterTo.apply(this.bounds, arguments);
};
Camera.prototype.getScale = function () {
  return Game.TILE_SIZE * Game.WIDTH / Game.BASE_WIDTH;
};
Camera.prototype.worldPos = function (screenX, screenY, out) {
  var scale = this.getScale();
  var offsetLeft = this.bounds.left;
  var offsetTop = this.bounds.top;
  if (!out) out = {};
  out.x = screenX / scale + offsetLeft;
  out.y = screenY / scale + offsetTop;
  return out;
};
Camera.prototype.tilePos = function (screenX, screenY, out) {
  var scale = this.getScale();
  var offsetLeft = this.bounds.left;
  var offsetTop = this.bounds.top;
  if (!out) out = {};
  out.x = Math.floor(screenX / scale + offsetLeft);
  out.y = Math.floor(screenY / scale + offsetTop);
  return out;
};
Camera.prototype.screenPos = function (worldX, worldY, out) {
  var scale = this.getScale();
  var offsetLeft = this.bounds.left;
  var offsetTop = this.bounds.top;
  if (!out) out = {};
  out.x = Math.floor((worldX - offsetLeft) * scale);
  out.y = Math.floor((worldY - offsetTop) * scale);
  return out;
};
Camera.prototype.worldRect = function (screenRect, out) {
  var scale = this.getScale();
  var offsetLeft = this.bounds.left;
  var offsetTop = this.bounds.top;
  if (!screenRect) screenRect = this.getViewport();
  if (!out) out = new Rectangle(screenRect);
  out.left = screenRect.left / scale + offsetLeft;
  out.top = screenRect.top / scale + offsetTop;
  out.resize(screenRect.width / scale, screenRect.height / scale);
  return out;
};
Camera.prototype.screenRect = function (worldRect, out) {
  var scale = this.getScale();
  if (!out) out = new Rectangle(worldRect);
  out.left = (worldRect.left - this.bounds.left) * scale;
  out.top = (worldRect.top - this.bounds.top) * scale;
  out.resize(worldRect.width * scale, worldRect.height * scale);
  return out;
};
Camera.prototype.getViewport = function () {
  if (!this.viewport) {
    this.viewport = new Rectangle(0,0,Game.WIDTH, Game.HEIGHT);
    return this.viewport;
  } else {
    this.viewport.width = Game.WIDTH;
    this.viewport.height = Game.HEIGHT;
    return this.viewport;
  }
};
Camera.prototype.updateBounds = function () {
  var x = this.bounds.centerX;
  var y = this.bounds.centerY;
  if (Game.WIDTH > Game.HEIGHT && this.bounds.width < this.bounds.height) {
    this.bounds.resize(this.aspectRatio[0], this.aspectRatio[1]);
    this.bounds.moveCenterTo(x,y);
  }
  else if (Game.WIDTH < Game.HEIGHT && this.bounds.width > this.bounds.height) {
    this.bounds.resize(this.aspectRatio[1], this.aspectRatio[0]);
    this.bounds.moveCenterTo(x,y);
  }
};