function Player(x,y) {
  this.bounds = new Rectangle(x,y,1,1);
  this.drawBounds = new Rectangle(this.bounds);
  
	this.keys = {
		left: false,
		right: false,
		up: false,
		down: false,
	};
  
  this.targetVelocity = {
    x:0,
    y:0,
  };
  this.velocity = {
    x:0,
    y:0,
  };
  this.speed = 0;
}

Player.MAX_SPEED = 0.007;
Player.ACCELERATION = Player.MAX_SPEED * 0.005;
Player.ANGLE_CHANGE = Math.PI * 0.002;

Player.prototype.update = function(elapsed, world) {
  this.targetVelocity.x = 0;
  if (this.keys.left) this.targetVelocity.x -= 1;
  if (this.keys.right) this.targetVelocity.x += 1;
  
  this.targetVelocity.y = 0;
  if (this.keys.up) this.targetVelocity.y -= 1;
  if (this.keys.down) this.targetVelocity.y += 1;
  
  var speedUp = true;
  if (this.targetVelocity.x === 0 && this.targetVelocity.y === 0) {
    speedUp = false;
  } else {
    var targetAngle = Math.atan2(this.targetVelocity.y, this.targetVelocity.x);
    var currentAngle = targetAngle;
    if (this.speed > 0) {
      currentAngle = Math.atan2(this.velocity.y, this.velocity.x);
    }
    var angleDiff = targetAngle - currentAngle;
    angleDiff += angleDiff > Math.PI ? -2*Math.PI : angleDiff < -Math.PI ? 2*Math.PI : 0;
    
    var nextAngle;
    if (Math.abs(angleDiff) < Player.ANGLE_CHANGE * elapsed) {
      nextAngle = targetAngle;
    } else {
      if (Math.abs(angleDiff) > Math.PI / 2) {
        speedUp = false;
      }
      nextAngle = currentAngle + Math.sign(angleDiff) * Player.ANGLE_CHANGE * elapsed;
    }
    
    this.velocity.x = Math.cos(nextAngle);
    this.velocity.y = Math.sin(nextAngle);
  }
  
  var acceleration = Player.ACCELERATION * elapsed;
  if (speedUp) {
    if (this.speed + acceleration < Player.MAX_SPEED) {
      this.speed += acceleration;
    } else {
      this.speed = Player.MAX_SPEED;
    }
  } else {
    if (this.speed - acceleration > 0) {
      this.speed -= acceleration;
    } else {
      this.speed = 0;
    }
  }  
  
  this.bounds.moveBy(this.velocity.x * this.speed * elapsed, this.velocity.y * this.speed * elapsed);
};
Player.prototype.animationUpdate = function (elapsed) {
};
Player.prototype.draw = function(ctx, camera) {
  this.drawBounds.copyFrom(this.bounds);
  this.drawBounds = camera.screenRect(this.drawBounds, this.drawBounds);
  
  ctx.fillStyle = "#ffffff";
  // ctx.fillRect(this.drawBounds.left, this.drawBounds.top, this.drawBounds.width, this.drawBounds.height);
  
  ctx.beginPath();
  ctx.arc(this.drawBounds.centerX, this.drawBounds.centerY, this.drawBounds.width / 2, 0, 2*Math.PI);
  ctx.fill();
  
  var i = 0;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  for (var prop in this.keys) {
    ctx.fillText(prop + ': '+ this.keys[prop], 0, i * 12);
    ++i;
  }
  
  // ctx.drawImage(this.sprite, this.animFrame * this.sourceBounds.width, this.facing * this.sourceBounds.height, this.sourceBounds.width, this.sourceBounds.height, 
      // this.drawBounds.left, this.drawBounds.top, this.drawBounds.width, this.drawBounds.height);
};
Player.prototype.debugDraw = function(ctx, camera) {
};
Player.prototype.mousedown = function (x,y, camera) {  
};

Player.prototype.keydown = function (ev) {
	switch(ev.key) {
		case 'ArrowLeft': // Key Left
		case 'a':
			this.keys.left = true; break;
		case 'ArrowUp': // Key Up
		case 'w':
			this.keys.up = true; break;
		case 'ArrowRight': // Key Right
		case 'd':
			this.keys.right = true; break;
		case 'ArrowDown': // Key Down
		case 's':
			this.keys.down = true; break;
	}
};
Player.prototype.keyup = function (ev) {
	switch(ev.key) {
		case 'ArrowLeft': // Key Left
		case 'a':
			this.keys.left = false; break;
		case 'ArrowUp': // Key Up
		case 'w':
			this.keys.up = false; break;
		case 'ArrowRight': // Key Right
		case 'd':
			this.keys.right = false; break;
		case 'ArrowDown': // Key Down
		case 's':
			this.keys.down = false; break;
	}
};