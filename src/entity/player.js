function Player(x,y) {
  this.bounds = new Circle(x + 0.5,y + 0.5,0.05);
  this.drawBounds = new Rectangle(this.bounds);
  this.predictedBounds = new Circle(this.bounds);
  this.colliderBounds = new Rectangle(0,0,1,1);
  
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
  
  this.nearby = [];
  
  this.bobTime = 0;
  this.blinkTime = 0;
  this.blinkAmount = 0;
}

Player.DRAW_RADIUS = 0.4;
Player.GLOW_RADIUS = 0.6;
Player.MAX_SPEED = 0.007;
Player.ACCELERATION_START = 0.003;
Player.ACCELERATION_STOP = 0.01;
Player.ANGLE_CHANGE = Math.PI * 0.002;

Player.BOB_PERIOD = 2000;
Player.BOB_OFFSET = 0.2;
Player.BOB_SPEED_FACTOR = 1.5;

Player.SHADOW_OFFSET = 0.6;
Player.SHADOW_BOB_AMOUNT = 0.2;
Player.SHADOW_WIDTH = 2 * Player.DRAW_RADIUS - Player.SHADOW_BOB_AMOUNT;
Player.SHADOW_HEIGHT = Player.SHADOW_WIDTH / 2;

Player.EYE_OFFSET_X = 0.125;
Player.EYE_WIDTH = 0.1;
Player.EYE_HEIGHT = 0.4;
Player.EYE_VELOCITY_FACTOR = 0.2;

Player.BLINK_PERIOD = 2000;
Player.BLINK_LENGTH = 400;
Player.BLINK_HURT = 150;

Player.prototype.update = function(elapsed, world) {
  this.targetVelocity.x = 0;
  if (this.keys.left) this.targetVelocity.x -= 1;
  if (this.keys.right) this.targetVelocity.x += 1;
  
  this.targetVelocity.y = 0;
  if (this.keys.up) this.targetVelocity.y -= 1;
  if (this.keys.down) this.targetVelocity.y += 1;
  
  if (this.targetVelocity.x !== 0 && this.targetVelocity.y !== 0) {
    this.targetVelocity.x /= Math.SQRT2;
    this.targetVelocity.y /= Math.SQRT2;
  }
  
  var vdx = this.targetVelocity.x - this.velocity.x;
  var vdy = this.targetVelocity.y - this.velocity.y;
  var vm = Math.sqrt(vdx*vdx+vdy*vdy);
  var isStopping = vm > Math.SQRT2 || (this.targetVelocity.x === 0 && this.targetVelocity.y === 0);
  var acceleration = isStopping ? Player.ACCELERATION_STOP : Player.ACCELERATION_START;
  
  if (vm < acceleration * elapsed) {
    this.velocity.x = this.targetVelocity.x;
    this.velocity.y = this.targetVelocity.y;
  } else {
    this.velocity.x += vdx * acceleration / vm * elapsed;
    this.velocity.y += vdy * acceleration / vm * elapsed;
  }
  
  this.predictedBounds.copyFrom(this.bounds);
  this.predictedBounds.moveBy(this.velocity.x * Player.MAX_SPEED * elapsed, this.velocity.y * Player.MAX_SPEED * elapsed);
  var predictedX = this.predictedBounds.left;
  var predictedY = this.predictedBounds.top; 
  var closestX = Math.floor(this.predictedBounds.centerX);
  var closestY = Math.floor(this.predictedBounds.centerY);
  
  for (var i = 0; i <= 2; ++i) {
    for (var j = 0; j <= 2; ++j) {
      var globalX = closestX - 1 + i;
      var globalY = closestY - 1 + j;
      
      if (globalX < 0
        || globalY < 0
        || globalX >= world.width
        || globalY >= world.height) {
        continue;  
      }
      
      var isWall = world.spec[globalY][globalX] === 0;
      
      if (isWall) {
        this.colliderBounds.moveTo(globalX, globalY);
        if (this.predictedBounds.intersect(this.colliderBounds)) {
          this.predictedBounds.moveTo(this.bounds.left, predictedY);
          var collideX = this.predictedBounds.intersect(this.colliderBounds);
          this.predictedBounds.moveTo(predictedX, this.bounds.top);
          var collideY = this.predictedBounds.intersect(this.colliderBounds);
          
          if (collideX) {
            predictedY = this.bounds.top;
          } 
          if (collideY) {
            predictedX = this.bounds.left;
          }
          
          this.predictedBounds.moveTo(predictedX, predictedY);
        }
      }
    }
  }
  
  this.bounds.moveTo(this.predictedBounds.left, this.predictedBounds.top);
  
  this.animationUpdate(elapsed, world);
};
Player.prototype.animationUpdate = function (elapsed, world) {
  var vm = Math.sqrt(this.velocity.x*this.velocity.x+this.velocity.y*this.velocity.y);
  
  this.bobTime += elapsed * (1 + vm * Player.BOB_SPEED_FACTOR);
  
  if (world.moldTimer > 0) {
    this.blinkTime = Player.BLINK_PERIOD;
  }
  
  if (this.blinkTime < Player.BLINK_PERIOD) {
    this.blinkTime += elapsed;
  } else if (this.blinkAmount + elapsed < Player.BLINK_LENGTH) {
    this.blinkAmount += elapsed;
    if (world.moldTimer > 0 && this.blinkAmount > Player.BLINK_HURT) {
      this.blinkAmount = Player.BLINK_HURT;
    }
  } else {
    this.blinkTime -= Player.BLINK_PERIOD;
    this.blinkAmount = 0;
  }
};
Player.prototype.draw = function(ctx, camera) {
  var bobPosition = Math.sin(this.bobTime * 2 * Math.PI / Player.BOB_PERIOD);
  var shadowBob = 1 + bobPosition * Player.SHADOW_BOB_AMOUNT;
  
  // Draw shadow
  this.drawBounds.copyFrom(this.bounds);
  this.drawBounds.resizeCentered(Player.SHADOW_WIDTH * shadowBob,Player.SHADOW_HEIGHT * shadowBob);
  this.drawBounds = camera.screenRect(this.drawBounds, this.drawBounds);
  
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.beginPath();
  ctx.ellipse(this.drawBounds.centerX, this.drawBounds.centerY, this.drawBounds.width / 2, this.drawBounds.height / 2, 0, 0, 2*Math.PI);
  ctx.fill();
  
  // Draw character
  var bobOffset = bobPosition * Player.BOB_OFFSET - Player.SHADOW_OFFSET;
  
  this.drawBounds.copyFrom(this.bounds);
  this.drawBounds.resizeCentered(1,1);
  this.drawBounds.moveBy(0, bobOffset);
  this.drawBounds = camera.screenRect(this.drawBounds, this.drawBounds);
  
  // ctx.fillStyle = "#ffffff";
  // ctx.beginPath();
  // ctx.arc(this.drawBounds.centerX, this.drawBounds.centerY, this.drawBounds.width * Player.DRAW_RADIUS, 0, 2*Math.PI);
  // ctx.fill();
  
  var glow = ctx.createRadialGradient(
    this.drawBounds.centerX, this.drawBounds.centerY, this.drawBounds.width * Player.DRAW_RADIUS, 
    this.drawBounds.centerX, this.drawBounds.centerY, this.drawBounds.width * Player.GLOW_RADIUS);
  glow.addColorStop(0, 'white');
  glow.addColorStop(0, 'rgba(255,255,255,0.5)');
  glow.addColorStop(1, 'transparent');
    
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(this.drawBounds.centerX, this.drawBounds.centerY, this.drawBounds.width * Player.GLOW_RADIUS, 0, 2*Math.PI);
  ctx.fill();
  
  // Draw face
  var ex = this.velocity.x * Player.EYE_VELOCITY_FACTOR;
  var ey = this.velocity.y * Player.EYE_VELOCITY_FACTOR + bobOffset;
  var blink = 1;
  
  if (this.blinkAmount > 0) {
    blink = Math.cos(this.blinkAmount * 2 * Math.PI / Player.BLINK_LENGTH) / 2 + 0.5;
  }
  
  this.drawBounds.copyFrom(this.bounds);
  this.drawBounds.resizeCentered(Player.EYE_WIDTH,Player.EYE_HEIGHT * blink);
  this.drawBounds.moveBy(ex-Player.EYE_OFFSET_X, ey);
  this.drawBounds = camera.screenRect(this.drawBounds, this.drawBounds);
  
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.ellipse(this.drawBounds.centerX, this.drawBounds.centerY, this.drawBounds.width / 2, this.drawBounds.height / 2, 0, 0, 2*Math.PI);
  ctx.fill();
  
  this.drawBounds.copyFrom(this.bounds);
  this.drawBounds.resizeCentered(Player.EYE_WIDTH,Player.EYE_HEIGHT * blink);
  this.drawBounds.moveBy(ex+Player.EYE_OFFSET_X, ey);
  this.drawBounds = camera.screenRect(this.drawBounds, this.drawBounds);
  
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.ellipse(this.drawBounds.centerX, this.drawBounds.centerY, this.drawBounds.width / 2, this.drawBounds.height / 2, 0, 0, 2*Math.PI);
  ctx.fill();
  
  
  // ctx.beginPath();
  // ctx.arc(this.drawBounds.centerX, this.drawBounds.centerY, this.drawBounds.width * this.bounds.radius, 0, 2*Math.PI);
  // ctx.stroke();
  
  // ctx.strokeStyle = "#ffffff";
  
  // var closestX = Math.floor(this.bounds.centerX);
  // var closestY = Math.floor(this.bounds.centerY);
  // this.drawBounds.moveTo(closestX, closestY);
  // this.drawBounds.resize(1,1);
  // this.drawBounds = camera.screenRect(this.drawBounds, this.drawBounds);
  // ctx.strokeRect(this.drawBounds.left, this.drawBounds.top, this.drawBounds.width, this.drawBounds.height);
  
  // ctx.strokeStyle = "#ff0000";
  // for (var i = 0; i < this.nearby.length; ++i) {
    // if (this.nearby[i]) {
      // var offsetX = (i % 3) - 1;
      // var offsetY = Math.floor(i / 3) - 1;
      
      // this.drawBounds.moveTo(closestX + offsetX, closestY + offsetY);
      // this.drawBounds.resize(1,1);
      // this.drawBounds = camera.screenRect(this.drawBounds, this.drawBounds);
      // ctx.strokeRect(this.drawBounds.left, this.drawBounds.top, this.drawBounds.width, this.drawBounds.height);
    // }
  // }
  
  // var i = 0;
  // ctx.textAlign = 'left';
  // ctx.textBaseline = 'top';
  // for (var prop in this.keys) {
    // ctx.fillText(prop + ': '+ this.keys[prop], 0, i * 12);
    // ++i;
  // }
  
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