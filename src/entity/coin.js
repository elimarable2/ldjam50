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

function CoinParticle(x,y,index) {
  this.bounds = new Circle(x,y,0.1);
  this.drawBounds = new Rectangle(this.bounds);
  if (index === undefined) {
    var dir = Math.random() * 2 * Math.PI;
  } else {
    var slice = 2 * Math.PI / CoinParticle.SPAWN_COUNT;
    var dir = Math.random() * slice + index * slice;
  }
  
  this.xSpeed = Math.cos(dir) * CoinParticle.INITIAL_SPEED;
  this.ySpeed = Math.sin(dir) * CoinParticle.INITIAL_SPEED;
  
  this.age = 0;
  this.active = true;
  
  this.drawPos = {};
}

CoinParticle.SPAWN_COUNT = 5;
CoinParticle.INITIAL_SPEED = 0.3;
CoinParticle.HOMING_DELAY = 150;
CoinParticle.ACCELERATION = 0.005

CoinParticle.prototype.update = function (elapsed, world) {
  this.age += elapsed;
  if (this.age > CoinParticle.HOMING_DELAY) {
    var dx = world.player.bounds.centerX - this.bounds.centerX;
    var dy = world.player.bounds.centerY - this.bounds.centerY;
    var m = Math.sqrt(dx*dx+dy*dy);
    
    this.xSpeed += dx/m * CoinParticle.ACCELERATION * elapsed;
    this.ySpeed += dy/m * CoinParticle.ACCELERATION * elapsed;
    var vm = Math.sqrt(this.xSpeed*this.xSpeed+this.ySpeed*this.ySpeed);
    if (vm > m) {
      this.active = false;
      world.particles.push(new CoinSparkle(this.bounds.centerX, this.bounds.centerY));
    }
  }
  
  this.bounds.moveBy(this.xSpeed, this.ySpeed);
};
CoinParticle.prototype.draw = function (ctx, camera) {
  this.drawBounds.copyFrom(this.bounds);
  this.drawBounds = camera.screenRect(this.drawBounds, this.drawBounds);
  
  ctx.fillStyle = "#ffffff";
  
  ctx.beginPath();
  ctx.arc(this.drawBounds.centerX, this.drawBounds.centerY, this.drawBounds.width / 2, 0, 2*Math.PI);
  ctx.fill();
};

function CoinSparkle(x,y) {
  this.bounds = new Circle(x,y,CoinSparkle.SIZE_START / 2);
  this.drawBounds = new Rectangle(this.bounds);
  
  this.active = true;
  this.age = 0;
}

CoinSparkle.LIFE = 250;
CoinSparkle.SIZE_START = 1;
CoinSparkle.SIZE_END = 0.2;

CoinSparkle.prototype.update = function (elapsed, world) {
  this.age += elapsed;
  if (this.age > CoinSparkle.LIFE) {
    this.active = false;
  } else {
    var t = this.age / CoinSparkle.LIFE;
    var s = (1 - t) * CoinSparkle.SIZE_START + t * CoinSparkle.SIZE_END;
    this.bounds.resizeCentered(s,s);
  }
};
CoinSparkle.prototype.draw = function (ctx, camera) {
  this.drawBounds.copyFrom(this.bounds);
  this.drawBounds = camera.screenRect(this.drawBounds, this.drawBounds);
  
  var glow = ctx.createRadialGradient(
    this.drawBounds.centerX, this.drawBounds.centerY, 0, 
    this.drawBounds.centerX, this.drawBounds.centerY, this.drawBounds.width / 2);
  glow.addColorStop(0, 'white');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  
  ctx.fillStyle = glow;
  
  ctx.beginPath();
  ctx.arc(this.drawBounds.centerX, this.drawBounds.centerY, this.drawBounds.width / 2, 0, 2*Math.PI);
  ctx.fill();
};