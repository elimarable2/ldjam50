function WorldCameraController(world, camera) {
  this.world = world;
  this.camera = camera;
  this.target = {
    x: camera.bounds.centerX,
    y: camera.bounds.centerY
  };
  
  this.maxSpeed = 0.05;
  this.speed = 0;
  this.acceleration = 0.001;
}
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
  if (m < this.acceleration) {
    this.camera.moveCenterTo(this.target.x, this.target.y);
    this.speed = 0;
  } else {
    if (m < this.speed * this.speed / 2 / this.acceleration) {
      this.speed -= this.acceleration;
    } else if (this.speed + this.acceleration < this.maxSpeed) {
      this.speed += this.acceleration;
    } else {
      this.speed = this.maxSpeed;
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