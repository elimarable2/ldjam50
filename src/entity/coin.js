function Coin(x,y) {
  this.bounds = new Circle(x + 0.5,y + 0.5,0.5);
  this.drawBounds = new Rectangle(this.bounds);
  
  this.active = true;
}

Coin.DRAW_RADIUS = 0.25;

Coin.prototype.draw = function(ctx, camera) {
  this.drawBounds.copyFrom(this.bounds);
  this.drawBounds.resizeCentered(1,1);
  this.drawBounds = camera.screenRect(this.drawBounds, this.drawBounds);
  
  ctx.fillStyle = "#b000ff";
  
  ctx.beginPath();
  ctx.arc(this.drawBounds.centerX, this.drawBounds.centerY, this.drawBounds.width * Coin.DRAW_RADIUS, 0, 2*Math.PI);
  ctx.fill();
};