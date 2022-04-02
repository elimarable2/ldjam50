function Camera(width, height) {
  this.aspectRatio = [width,height];
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
Camera.prototype.worldPos = function (screenX, screenY, out) {
  var viewport = this.getViewport();
  if (!out) out = {};
  out.x = screenX / viewport.width * this.bounds.width + this.bounds.left;
  out.y = screenY / viewport.height * this.bounds.height + this.bounds.top;
  return out;
};
Camera.prototype.screenPos = function (worldX, worldY, out) {
  var viewport = this.getViewport();
  if (!out) out = {};
  out.x = Math.floor((worldX - this.bounds.left) / this.bounds.width * viewport.width);
  out.y = Math.floor((worldY - this.bounds.top) / this.bounds.height * viewport.height);
  return out;
};
Camera.prototype.worldRect = function (screenRect, out) {
  var viewport = this.getViewport();
  if (!screenRect) screenRect = this.getViewport();
  if (!out) out = new Rectangle(screenRect);
  out.left = screenRect.left / viewport.width * this.bounds.width + this.bounds.left;
  out.top = screenRect.top / viewport.height * this.bounds.height + this.bounds.top;
  out.resize(screenRect.width / viewport.width * this.bounds.width, screenRect.height / viewport.height * this.bounds.height);
  return out;
};
Camera.prototype.screenRect = function (worldRect, out) {
  var viewport = this.getViewport();
  var hScale = viewport.width / this.bounds.width;
  var vScale = viewport.height / this.bounds.height;
  if (!out) out = new Rectangle(worldRect);
  out.left = (worldRect.left - this.bounds.left) * hScale;
  out.top = (worldRect.top - this.bounds.top) * vScale;
  out.resize(worldRect.width * hScale, worldRect.height * vScale);
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