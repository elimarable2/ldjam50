function Coin(x,y) {
  this.bounds = new Circle(x + 0.5,y + 0.5,0.7);
  this.drawBounds = new Rectangle(this.bounds);
  
  this.active = true;
  this.bobTime = Math.random() * Coin.BOB_PERIOD;
}

Coin.DRAW_RADIUS = 0.25;

Coin.BOB_PERIOD = 1200;
Coin.BOB_OFFSET = 0.1;

Coin.SHADOW_OFFSET = 0.4;
Coin.SHADOW_BOB_AMOUNT = 0.1;
Coin.SHADOW_WIDTH = Coin.DRAW_RADIUS * 2 - Coin.SHADOW_BOB_AMOUNT;
Coin.SHADOW_HEIGHT = Coin.SHADOW_WIDTH / 2;


Coin.prototype.update = function (elapsed) {
  this.animationUpdate(elapsed);
};
Coin.prototype.animationUpdate = function (elapsed) {
  this.bobTime += elapsed;
};
Coin.prototype.draw = function(ctx, camera) {
  var bobPosition = Math.sin(this.bobTime * 2 * Math.PI / Coin.BOB_PERIOD);
  var shadowBob = 1 + bobPosition * Coin.SHADOW_BOB_AMOUNT;
  
  // Draw shadow
  this.drawBounds.copyFrom(this.bounds);
  this.drawBounds.resizeCentered(Coin.SHADOW_WIDTH * shadowBob,Coin.SHADOW_HEIGHT * shadowBob);
  this.drawBounds = camera.screenRect(this.drawBounds, this.drawBounds);
  
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.beginPath();
  ctx.ellipse(this.drawBounds.centerX, this.drawBounds.centerY, this.drawBounds.width / 2, this.drawBounds.height / 2, 0, 0, 2*Math.PI);
  ctx.fill();
  
  // Draw coin
  var bobOffset = bobPosition * Coin.BOB_OFFSET - Coin.SHADOW_OFFSET;
  
  this.drawBounds.copyFrom(this.bounds);
  this.drawBounds.resizeCentered(1,1);
  this.drawBounds.moveBy(0, bobOffset);
  this.drawBounds = camera.screenRect(this.drawBounds, this.drawBounds);
  
  ctx.fillStyle = "#b000ff";
  
  ctx.beginPath();
  ctx.arc(this.drawBounds.centerX, this.drawBounds.centerY, this.drawBounds.width * Coin.DRAW_RADIUS, 0, 2*Math.PI);
  ctx.fill();
};