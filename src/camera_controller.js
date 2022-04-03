function WorldCameraController(world, camera) {
  this.world = world;
  this.camera = camera;
  this.target = {
    x: camera.bounds.centerX,
    y: camera.bounds.centerY
  };
  this.velocity = {
    x: 0,
    y: 0
  };
  this.targetVelocity = {
    x: 0,
    y: 0
  };
  this.acceleration = {
    x: 0,
    y: 0
  };
}

WorldCameraController.NEAR_DISTANCE = 3;
WorldCameraController.NEAR_ACCELERATION = 0.05;
WorldCameraController.FAR_DISTANCE = 10;
WorldCameraController.FAR_ACCELERATION = 0.2;
WorldCameraController.MAX_SPEED = 1;
WorldCameraController.ANTICIPATION = 5;

WorldCameraController.prototype.getTarget = function () {
  var px = this.world.player.bounds.centerX;
  var pvx = this.world.player.velocity.x;
  
  var py = this.world.player.bounds.centerY;
  var pvy = this.world.player.velocity.y;
  
  this.target.x = px + WorldCameraController.ANTICIPATION * Math.sign(pvx) * pvx * pvx / 2 / Player.ACCELERATION_STOP * Player.MAX_SPEED;
  this.target.y = py + WorldCameraController.ANTICIPATION * Math.sign(pvy) * pvy * pvy / 2 / Player.ACCELERATION_STOP * Player.MAX_SPEED;
};
WorldCameraController.prototype.step = function (elapsed) {
  this.camera.updateBounds();
  // this.jumpToTarget();
  this.getTarget();
  
  var dx = this.target.x - this.camera.bounds.centerX;
  var dy = this.target.y - this.camera.bounds.centerY;
  var m = Math.sqrt(dx*dx + dy*dy);
    
  if (m !== 0) {
    var acceleration = WorldCameraController.NEAR_ACCELERATION;
    if (m > WorldCameraController.FAR_DISTANCE) {
      acceleration = WorldCameraController.FAR_ACCELERATION;
    } else if (m > WorldCameraController.NEAR_DISTANCE) {
      acceleration = (m - WorldCameraController.NEAR_DISTANCE) / (WorldCameraController.FAR_DISTANCE - WorldCameraController.NEAR_DISTANCE)
        * (WorldCameraController.FAR_ACCELERATION - WorldCameraController.NEAR_ACCELERATION) + WorldCameraController.NEAR_ACCELERATION;
    }
    
    // Get Target velocity
    var tv = m*acceleration / 2;
    var tvx = dx / m * tv;
    var tvy = dy / m * tv;
    
    this.targetVelocity.x = tvx;
    this.targetVelocity.y = tvy;
    
    // Get velocity difference
    var dvx = tvx - this.velocity.x;
    var dvy = tvy - this.velocity.y;
    var dvm = Math.sqrt(dvx*dvx + dvy*dvy);
    
    // Get target acceleration
    var ax = dvx;
    var ay = dvy;
    if (dvm !== 0 && dvm > acceleration * elapsed) {
      ax = dvx / dvm * acceleration * elapsed;
      ay = dvy / dvm * acceleration * elapsed;
    }
    
    // Apply target acceleration
    this.velocity.x += ax;
    this.velocity.y += ay;
    var vm = Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y);
    
    if (vm > WorldCameraController.MAX_SPEED) {
      this.velocity.x *= WorldCameraController.MAX_SPEED / vm;
      this.velocity.y *= WorldCameraController.MAX_SPEED / vm;
    }
    
    this.camera.moveBy(this.velocity.x, this.velocity.y);
    
    // if (dx < Math.abs(this.velocity.x * elapsed) && dy < Math.abs(this.velocity.y * elapsed)) {
      // this.camera.moveCenterTo(this.target.x, this.target.y);
      // this.speed = 0;
      // this.velocity.x = 0;
      // this.velocity.y = 0;
    // }
  }
};
WorldCameraController.prototype.debugDraw = function (ctx) {  
  if (!this.drawBounds) this.drawBounds = new Rectangle();
  
  var centerX = Game.WIDTH / 2;
  var centerY = Game.HEIGHT / 2;
  
  ctx.strokeStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(centerX - 5, centerY);
  ctx.lineTo(centerX + 5, centerY);
  ctx.moveTo(centerX, centerY - 5);
  ctx.lineTo(centerX, centerY + 5);
  ctx.stroke();
  
  this.drawBounds = this.camera.screenPos(this.target.x, this.target.y);
  ctx.strokeStyle = "#0000ff";
  ctx.beginPath();
  ctx.moveTo(this.drawBounds.x - 5, this.drawBounds.y);
  ctx.lineTo(this.drawBounds.x + 5, this.drawBounds.y);
  ctx.moveTo(this.drawBounds.x, this.drawBounds.y - 5);
  ctx.lineTo(this.drawBounds.x, this.drawBounds.y + 5);
  ctx.stroke();
  
  ctx.strokeStyle = "#ff0000";
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(centerX + this.velocity.x * 1000, centerY + this.velocity.y * 1000);
  ctx.stroke();
  
  ctx.strokeStyle = "#ffff00";
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(centerX + this.targetVelocity.x * 1000, centerY + this.targetVelocity.y * 1000);
  ctx.stroke();
};
WorldCameraController.prototype.jumpToTarget = function () {
  this.getTarget();
  this.camera.moveCenterTo(this.target.x, this.target.y);
};