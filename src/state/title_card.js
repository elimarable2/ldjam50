function TitleCard() {
	this.mouse = {
		x: NaN,
		y: NaN,
    pressed: false,
	};
  this.keyPressed = false;
  
  this.backplane = document.createElement('canvas');
  this.bctx = this.backplane.getContext('2d');

  this.transition = false;
  this.fadeTime = TitleCard.TOTAL_FADE_TIME;
  this.animTime = 0;
  
  this.particles = [];
  this.particleTime = 0;
}

TitleCard.TOTAL_FADE_TIME = 2000;
TitleCard.PARTICLE_COVERAGE = 0.002;

TitleCard.prototype.onEnter = function () {
  if (!Game.audio.music.get().isPlaying) {
    MUSIC.stopAll();
    MUSIC.play(Game.audio.music.get());
  }
};
TitleCard.prototype.step = function (elapsed) {
  if (this.transition) {
    this.fadeTime += elapsed;
    if (this.fadeTime > TitleCard.TOTAL_FADE_TIME) {
      Game.setState(generateLevel(1));
    }
  } else {
    if (this.fadeTime > elapsed) {
      this.fadeTime -= elapsed;
    } else {
      this.fadeTime = 0;
    }
  }
  
  this.animTime += elapsed;
  
  for (var i = 0; i < this.particles.length; ++i) {
    this.particles[i].update(elapsed);
  }
  while (this.particles.length > 0 && this.particles[0].age > TitleParticle.LIFE) {
    this.particles.shift();
  }
  console.log(this.particles.length);
  
  this.particleTime += elapsed;
  var spawnArea = Game.WIDTH / 2;
  var spawnTime = 1 / spawnArea / TitleCard.PARTICLE_COVERAGE;
  while (this.particleTime > spawnTime) {
    this.particleTime -= spawnTime;
    var px = Math.random() * spawnArea + (Game.WIDTH - spawnArea) / 2;
    this.particles.push(new TitleParticle(px, Game.HEIGHT / 2));
  }
};
TitleCard.prototype.draw = function (ctx) {
  ctx.filter = 'none';
  ctx.globalAlpha = 1;
  
  ctx.fillStyle = '#000000';
  ctx.fillRect(0,0,Game.WIDTH,Game.HEIGHT);
  
  var minorAxis = Math.min(Game.WIDTH, Game.HEIGHT);
  var textSize = Math.min(120, minorAxis / 4);
  var dx = Game.WIDTH / 2;
  var dy = Game.HEIGHT / 2;
  var dw = Game.WIDTH / 2;
  
  if (this.backplane.width !== Game.WIDTH) {
    this.backplane.width = Game.WIDTH;
  }
  if (this.backplane.height !== Game.HEIGHT) {
    this.backplane.height = Game.HEIGHT;
  }
  this.bctx.globalCompositeOperation = 'destination-out';
  this.bctx.fillStyle = '#000000';
  this.bctx.fillRect(0,0,Game.WIDTH,Game.HEIGHT);
  
  this.bctx.globalCompositeOperation = 'source-over';
  
  for (var i = 0; i < this.particles.length; ++i) {
    this.particles[i].draw(this.bctx);
  }
  
  this.bctx.globalCompositeOperation = 'destination-in';
  this.bctx.textAlign = 'center';
  this.bctx.textBaseline = 'bottom';
  this.bctx.font = 'bold '+textSize+'px sans-serif';
  this.bctx.fillText("Extinguished", dx, dy, dw);
  
  this.bctx.globalCompositeOperation = 'source-over';
  this.bctx.lineWidth = 2;
  this.bctx.strokeStyle = '#404040';
  this.bctx.strokeText("Extinguished", dx, dy, dw);
  
  ctx.drawImage(this.backplane,0,0);
  
  
  textSize = Math.min(40, minorAxis / 8);
  dx = Game.WIDTH / 2;
  dy = Math.max(Game.HEIGHT - 3 * textSize, 4 * Game.HEIGHT / 5) + textSize / 6 * Math.sin(this.animTime / 1000);
  dw = 4 * Game.WIDTH / 5;
  
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.lineWidth = 1;
  ctx.font = 'bold '+textSize+'px monospace';
  
  var gradient = ctx.createLinearGradient(0, dy, 0, dy - textSize);
  gradient.addColorStop(0, "#808080");
  gradient.addColorStop(1, "white");
  ctx.strokeStyle = gradient;  
  ctx.fillStyle = "#202020"; 
  
  ctx.fillText("Press any key to begin", dx, dy, dw);
  ctx.strokeText("Press any key to begin", dx, dy, dw);
  
  if (this.fadeTime > 0) {
    ctx.globalAlpha = this.fadeTime / TitleCard.TOTAL_FADE_TIME;
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0,0,Game.WIDTH,Game.HEIGHT);
  }
};
TitleCard.prototype.keydown = function (ev) {
  this.keyPressed = true;
};
TitleCard.prototype.keyup = function (ev) {
  if (this.keyPressed) {
    this.transition = true;
  }
  this.keyPressed = false;
};
TitleCard.prototype.mousedown = function (ev) {
  this.mouse.pressed = true;
};
TitleCard.prototype.mouseup = function () {
  if (this.mouse.pressed) {
    this.transition = true;
  }
  this.mouse.pressed = false;
};
TitleCard.prototype.mousemove = function (ev) {
  this.mouse.x = ev.pageX - canvasX;
  this.mouse.y = ev.pageY - canvasY;
};

function TitleParticle(x,y) {
  this.x = x;
  this.xSpeed = 0;
  this.y = y;
  this.ySpeed = TitleParticle.SPEED + (Math.random() - 0.5) * TitleParticle.SPEED_VAR;
  this.age = 0;
}

TitleParticle.FADE_TIME = 1000;
TitleParticle.LIFE = 1400;
TitleParticle.SPEED = -0.08;
TitleParticle.SPEED_VAR = 0.02;
TitleParticle.SPEED_WOBBLE = 0.0005;

TitleParticle.prototype.update = function (elapsed) {
  this.xSpeed += (Math.random() - 0.5) * 2 * TitleParticle.SPEED_WOBBLE * elapsed;
  this.x += this.xSpeed * elapsed;
  this.y += this.ySpeed * elapsed;
  this.age += elapsed;
};
TitleParticle.prototype.draw = function (ctx) {
  if (this.age < TitleParticle.LIFE - TitleParticle.FADE_TIME) {
    ctx.fillStyle = '#ffffff';
  } else {
    var alpha = 1 - (this.age - TitleParticle.LIFE + TitleParticle.FADE_TIME) / TitleParticle.FADE_TIME;
    ctx.fillStyle = 'rgba(255,255,255,'+alpha.toFixed(3)+')';
  }
  ctx.beginPath();
  ctx.arc(this.x, this.y, 5, 0, 2*Math.PI);
  ctx.fill();
};