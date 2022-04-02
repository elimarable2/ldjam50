function EditorCameraController(camera) {
  this.BASE_SPEED = 0.1;
  this.SHIFT_SPEED_FACTOR = 5;
  
  this.camera = camera;
  
  this.move = { 
    left: 0,
    top: 0,
    right: 0,
    bottom: 0
  };
  this.speed = this.BASE_SPEED;
}
EditorCameraController.prototype.step = function (elapsed) {
  this.camera.moveBy(
    (this.move.right - this.move.left) * this.speed, 
    (this.move.bottom - this.move.top) * this.speed
  );
};
EditorCameraController.prototype.keydown = function (ev) {
  var k = ev.key.toLowerCase();
  if (k === 'shift') {
    this.speed = this.BASE_SPEED * this.SHIFT_SPEED_FACTOR;
  }
  if (k === 'a') {
    this.move.left = 1;
  }
  if (k === 'w') {
    this.move.top = 1;
  }
  if (k === 'd') {
    this.move.right = 1;
  }
  if (k === 's') {
    this.move.bottom = 1;
  }
};
EditorCameraController.prototype.keyup = function (ev) {
  var k = ev.key.toLowerCase();
  if (k === 'shift') {
    this.speed = this.BASE_SPEED;
  }
  if (k === 'a') {
    this.move.left = 0;
  }
  if (k === 'w') {
    this.move.top = 0;
  }
  if (k === 'd') {
    this.move.right = 0;
  }
  if (k === 's') {
    this.move.bottom = 0;
  }
};

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
  
  this.maxDistanceFromPlayer = 12;
  this.minDistanceFromPlayer = 3;
  this.playerWeight = 1;
  this.goalWeight = 0.5;
  this.catWeight = 0.2;
}
WorldCameraController.prototype.getTarget = function () {
  this.target.x = 0;
  this.target.y = 0;
  var totalWeight = 0;
  
  var playerX = this.world.player.bounds.centerX;
  var playerY = this.world.player.bounds.centerY;
  var dx, dy, m;
  
  this.target.x += playerX * this.playerWeight;
  this.target.y += playerY * this.playerWeight;
  totalWeight += this.playerWeight;
  
  for (var i = 0; i < this.world.cats.length; ++i) {
    var catX = this.world.cats[i].bounds.centerX;
    var catY = this.world.cats[i].bounds.centerY;
    dx = catX - playerX;
    dy = catY - playerY;
    m = Math.sqrt(dx*dx + dy*dy);
    if (m < this.maxDistanceFromPlayer) {
      var weight = this.catWeight * (1 - Math.max(0,(m - this.minDistanceFromPlayer) / (this.maxDistanceFromPlayer - this.minDistanceFromPlayer)));
      this.target.x += catX * weight;
      this.target.y += catY * weight;
      totalWeight += weight;
    }
  }
  for (var i = 0; i < this.world.goals.length; ++i) {
    var goalX = this.world.goals[i].bounds.centerX;
    var goalY = this.world.goals[i].bounds.centerY;
    dx = goalX - playerX;
    dy = goalY - playerY;
    m = Math.sqrt(dx*dx + dy*dy);
    if (m < this.maxDistanceFromPlayer) {
      var weight = this.goalWeight * (1 - Math.max(0,(m - this.minDistanceFromPlayer) / (this.maxDistanceFromPlayer - this.minDistanceFromPlayer)));
      this.target.x += goalX * weight;
      this.target.y += goalY * weight;
      totalWeight += weight;
    }
  }
  
  this.target.x /= totalWeight;
  this.target.y /= totalWeight;
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
  var playerX = this.world.player.bounds.centerX;
  var playerY = this.world.player.bounds.centerY;
  var dx, dy, m;
  
  this.debugPoint = this.camera.screenPos(playerX, playerY, this.debugPoint);
  ctx.fillStyle = "#ffff00";
  ctx.fillRect(this.debugPoint.x-2,this.debugPoint.y-2,4,4);
  
  for (var i = 0; i < this.world.cats.length; ++i) {
    var catX = this.world.cats[i].bounds.centerX;
    var catY = this.world.cats[i].bounds.centerY;
    dx = catX - playerX;
    dy = catY - playerY;
    m = Math.sqrt(dx*dx + dy*dy);
    if (m < this.maxDistanceFromPlayer) {
      ctx.fillStyle = "#0000ff";
    } else {
      ctx.fillStyle = "#ff0000";
    }
    this.debugPoint = this.camera.screenPos(catX, catY, this.debugPoint);
    ctx.fillRect(this.debugPoint.x-2,this.debugPoint.y-2,4,4);
  }
  for (var i = 0; i < this.world.goals.length; ++i) {
    var goalX = this.world.goals[i].bounds.centerX;
    var goalY = this.world.goals[i].bounds.centerY;
    dx = goalX - playerX;
    dy = goalY - playerY;
    m = Math.sqrt(dx*dx + dy*dy);
    if (m < this.maxDistanceFromPlayer) {
      ctx.fillStyle = "#0000ff";
    } else {
      ctx.fillStyle = "#ff0000";
    }
    this.debugPoint = this.camera.screenPos(goalX, goalY, this.debugPoint);
    ctx.fillRect(this.debugPoint.x-2,this.debugPoint.y-2,4,4);
  }
  
  this.debugPoint = this.camera.screenPos(this.target.x, this.target.y, this.debugPoint);
  ctx.fillStyle = "#00ff00";
  ctx.fillRect(this.debugPoint.x-2,this.debugPoint.y-2,4,4);
};
WorldCameraController.prototype.jumpToTarget = function () {
  this.getTarget();
  this.camera.moveCenterTo(this.target.x, this.target.y);
};