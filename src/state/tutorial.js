function Tutorial() {
  var spec = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 2, 1, 1, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 0, 0, 1, 1, 1, 0],
    [0, 0, 1, 1, 0, 0, 0, 1, 1, 0],
    [0, 1, 1, 1, 0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 0, 0, 1, 1, 0],
    [0, 1, 1, 1, 1, 0, 0, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 0, 0, 3, 0],
    [0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];
  this.world = new World(spec, 1);
  this.world.index = 0;
  this.world.portal.bounds.moveTo(4,4);
  this.world.player.bounds.moveTo(5,37);
  this.world.cameraControl.jumpToTarget();
  
  this.texts = [];
  this.texts.push(new TutorialText(38, "Move with arrow keys or WASD"));
  this.texts.push(new TutorialText(30, "Avoid touching the creeping mold"));
  this.texts.push(new TutorialText(16, "Collect gemstones"));
  this.texts.push(new TutorialText(7, "Enter the portal"));
}

Tutorial.prototype.onEnter = function () {
  this.world.onEnter();
};
Tutorial.prototype.step = function (elapsed) {
  this.world.step(elapsed);
  for (var i = 0; i < this.texts.length; ++i) {
    this.texts[i].update(elapsed, this.world);
  }
};
Tutorial.prototype.draw = function (ctx) {
  this.world.draw(ctx);
  
  for (var i = 0; i < this.texts.length; ++i) {
    this.texts[i].draw(ctx, this.world.camera);
  }
};
Tutorial.prototype.keydown = function (ev) {
  this.world.keydown(ev);
};
Tutorial.prototype.keyup = function (ev) {
  this.world.keyup(ev);
};
Tutorial.prototype.mousedown = function (ev) {
  this.world.mousedown(ev);
};
Tutorial.prototype.mouseup = function () {
  this.world.mouseup();
};
Tutorial.prototype.mousemove = function (ev) {
  this.world.mousemove(ev);
};

function TutorialText(y,text) {
  this.text = text;
  this.bounds = new Rectangle(0,y,10,1);
  this.drawBounds = new Rectangle(this.bounds);
  this.active = false;
  this.age = 0;
}

TutorialText.FADE_TIME = 1000;

TutorialText.prototype.update = function (elapsed, world) {
  if (this.bounds.top > world.player.bounds.bottom) {
    this.active = true;
  }
  
  if (this.active) {
    this.age += elapsed;
  }
};
TutorialText.prototype.draw = function (ctx, camera) {
  if (this.active) {
    this.drawBounds.copyFrom(this.bounds);
    this.drawBounds = camera.screenRect(this.drawBounds, this.drawBounds);
  
    var style = "#ffffff";
    if (this.age < TutorialText.FADE_TIME) {
      var t = this.age / TutorialText.FADE_TIME;
      style = "rgba(255,255,255,"+t+")";
    }
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = this.drawBounds.height+'px serif';
    
    ctx.fillStyle = style;
    ctx.fillText(this.text, this.drawBounds.centerX, this.drawBounds.top);
  }
};