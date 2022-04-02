function Portal(x,y) {
  this.bounds = new Circle(x + 0.5,y + 0.5,0.5);
  this.drawBounds = new Rectangle(this.bounds);
}

Portal.prototype.draw = function(ctx, camera, active) {
  this.drawBounds.copyFrom(this.bounds);
  this.drawBounds.resizeCentered(1,2);
  this.drawBounds.moveBy(0,-0.5);
  this.drawBounds = camera.screenRect(this.drawBounds, this.drawBounds);
  
  ctx.fillStyle = "#0000ff";
  ctx.strokeStyle = "#0000ff";
  
  ctx.beginPath();
  ctx.ellipse(this.drawBounds.centerX, this.drawBounds.centerY, this.drawBounds.width / 2, this.drawBounds.height / 2, 0, 0, 2*Math.PI);
  if (active) {
    ctx.fill();
  } else {
    ctx.lineWidth = 3;
    ctx.stroke();
  }
};