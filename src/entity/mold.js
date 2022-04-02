function Mold(x,y) {
  this.bounds = new Circle(x + 0.5,y + 0.5,0.5);
  this.drawBounds = new Rectangle(this.bounds);
}

Mold.prototype.draw = function(ctx, camera, active) {
  this.drawBounds.copyFrom(this.bounds);
  this.drawBounds = camera.screenRect(this.drawBounds, this.drawBounds);
  
  ctx.fillStyle = "#00ff00";
  
  ctx.fillRect(this.drawBounds.left, this.drawBounds.top, this.drawBounds.width, this.drawBounds.height);
};