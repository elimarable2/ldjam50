function WorldCameraController(world, camera) {
  this.world = world;
  this.camera = camera;
  this.target = {
    x: camera.bounds.centerX,
    y: camera.bounds.centerY
  };
  
  this.speed = 0;
}

WorldCameraController.NEAR_DISTANCE = 3;
WorldCameraController.NEAR_ACCELERATION = 0.0001;
WorldCameraController.FAR_DISTANCE = 10;
WorldCameraController.FAR_ACCELERATION = 0.002;
WorldCameraController.MAX_SPEED = 1;

WorldCameraController.prototype.getTarget = function () {
  this.target.x = this.world.player.bounds.centerX;
  this.target.y = this.world.player.bounds.centerY;
};
WorldCameraController.prototype.step = function (elapsed) {
  this.camera.updateBounds();
  this.getTarget();
  
  var dx = this.target.x - this.camera.bounds.centerX;
  var dy = this.target.y - this.camera.bounds.centerY;
  var m = Math.sqrt(dx*dx + dy*dy);
  
  if (m <= this.speed * elapsed) {
    this.camera.moveCenterTo(this.target.x, this.target.y);
    this.speed = 0;
  } else {
    var acceleration = WorldCameraController.NEAR_ACCELERATION;
    if (m > WorldCameraController.FAR_DISTANCE) {
      acceleration = WorldCameraController.FAR_ACCELERATION;
    } else if (m > WorldCameraController.NEAR_DISTANCE) {
      acceleration = (m - WorldCameraController.NEAR_DISTANCE) / (WorldCameraController.FAR_DISTANCE - WorldCameraController.NEAR_DISTANCE)
        * (WorldCameraController.FAR_ACCELERATION - WorldCameraController.NEAR_ACCELERATION) + WorldCameraController.NEAR_ACCELERATION;
    }
    
    console.log(m, acceleration, this.speed);
    
    if (m < this.speed * this.speed / 2 / acceleration) {
      this.speed -= acceleration * elapsed;
    } else if (this.speed + acceleration * elapsed < WorldCameraController.MAX_SPEED) {
      this.speed += acceleration * elapsed;
    } else {
      this.speed = WorldCameraController.MAX_SPEED;
    }
    this.camera.moveBy(dx / m * this.speed, dy / m * this.speed);
  }
};
WorldCameraController.prototype.debugDraw = function (ctx) {  

};
WorldCameraController.prototype.jumpToTarget = function () {
  this.getTarget();
  this.camera.moveCenterTo(this.target.x, this.target.y);
};