function Portal(x,y) {
  this.bounds = new Circle(x + 0.5,y + 0.5,0.5);
  this.drawBounds = new Rectangle(this.bounds);
  
  this.bobTime = 0;
}

Portal.DRAW_WIDTH = 1;
Portal.DRAW_HEIGHT = 2;

Portal.BOB_PERIOD = 3000;
Portal.BOB_OFFSET = 0.2;
Portal.BOB_SPEED_FACTOR = 1.5;

Portal.SHADOW_OFFSET = 1.25;
Portal.SHADOW_BOB_AMOUNT = 0.2;
Portal.SHADOW_WIDTH = Portal.DRAW_WIDTH - Portal.SHADOW_BOB_AMOUNT;
Portal.SHADOW_HEIGHT = Portal.SHADOW_WIDTH / 2;

Portal.prototype.update = function (elapsed) {
  this.animationUpdate(elapsed);
};
Portal.prototype.animationUpdate = function (elapsed) {
  this.bobTime += elapsed;
};
Portal.prototype.draw = function(ctx, camera, active) {
  var bobPosition = Math.sin(this.bobTime * 2 * Math.PI / Portal.BOB_PERIOD);
  var shadowBob = 1 + bobPosition * Portal.SHADOW_BOB_AMOUNT;
  
  // Draw shadow
  this.drawBounds.copyFrom(this.bounds);
  this.drawBounds.resizeCentered(Portal.SHADOW_WIDTH * shadowBob,Portal.SHADOW_HEIGHT * shadowBob);
  this.drawBounds = camera.screenRect(this.drawBounds, this.drawBounds);
  
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.beginPath();
  ctx.ellipse(this.drawBounds.centerX, this.drawBounds.centerY, this.drawBounds.width / 2, this.drawBounds.height / 2, 0, 0, 2*Math.PI);
  ctx.fill();
  
  // Draw character
  var bobOffset = bobPosition * Portal.BOB_OFFSET - Portal.SHADOW_OFFSET;
  
  this.drawBounds.copyFrom(this.bounds);
  this.drawBounds.resizeCentered(Portal.DRAW_WIDTH,Portal.DRAW_HEIGHT);
  this.drawBounds.moveBy(0, bobOffset);
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