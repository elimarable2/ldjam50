function World(spec, cost) {
	this.mouse = {
		x: NaN,
		y: NaN,
    pressed: false,
	};
  
  this.height = spec.length;
  this.width = spec[0].length;  
  this.spec = spec;
  this.cost = cost;
  
  this.portal = new Portal(this.width / 2,this.height / 2);
  this.player = new Player(this.portal.bounds.left,this.portal.bounds.bottom);
	this.camera = new Camera(World.MAJOR_AXIS_TILES,World.MAJOR_AXIS_TILES * 9 / 16);
  this.cameraControl = new WorldCameraController(this, this.camera);
  this.cameraControl.jumpToTarget();
  
  this.coins = [];
  this.mold = new MoldLayer(this.width, this.height);
  this.totalCoins = 0;
  this.portalTimer = 0;
  this.moldTimer = 0;
  this.fadeTimer = World.FADE_TIME;
  this.fadeDirection = -1;
  this.fadeStyle = '#000000';
  
  this.layout = toColors(spec, function (value) {
    if (value === 0) return 'black';
    return 'white';
  });
  
  this.backplane = document.createElement('canvas');
  this.backplane.width = this.width * World.TILE_SIZE;
  this.backplane.height = this.height * World.TILE_SIZE;
  var bctx = this.backplane.getContext('2d');
  
  this.minimap = document.createElement('canvas');
  this.minimap.width = this.width;
  this.minimap.height = this.height;
  var mctx = this.minimap.getContext('2d');
  
  bctx.fillStyle = '#000000';
  bctx.fillRect(0,0,this.backplane.width,this.backplane.height);
  
  for (var j = 0; j < this.height; ++j) {
    // this.mold[j] = [];
    for (var i = 0; i < this.width; ++i) {
      if (this.spec[j][i] !== 0) {
        var node = Math.floor(Math.random() * 32+32);
        var index = node.toString(16);
        while (index.length < 2) index = '0' + index;
        bctx.fillStyle = '#' + index + index + index;
      
        bctx.fillRect(i*World.TILE_SIZE,j*World.TILE_SIZE,World.TILE_SIZE,World.TILE_SIZE);
        
        mctx.fillStyle = this.layout[j][i];
        mctx.fillRect(i, j, 1, 1);
      }
      if (this.spec[j][i] === 2) {
        this.coins.push(new Coin(i,j));
      }
      if (this.spec[j][i] === 3) {
        // this.mold[j][i] = new Mold(i,j);
        this.mold.add(i,j);
      }
    }
  }
  
  this.sourceBounds = new Rectangle();
  this.destBounds = new Rectangle();
}

World.MAJOR_AXIS_TILES = 30;
World.TILE_SIZE = 96;
World.PORTAL_TIME = 1500;
World.MOLD_TIME = 3000;
World.MOLD_BLUR = 20;
World.FADE_TIME = 2000;

World.prototype.onEnter = function () {
  // MUSIC.stopAll();
  // MUSIC.play(MUSIC.main.get());
};
World.prototype.step = function (elapsed) {
  this.player.update(elapsed, this);
  this.cameraControl.step(elapsed);
  
  for (var i = 0; i < this.coins.length; ++i) {
    if (this.coins[i].active) {
      if (this.coins[i].bounds.intersect(this.player.bounds)) {
        this.coins[i].active = false;
        ++this.totalCoins;
      }
    }
  }
  
  this.mold.update(elapsed, this);
  
  var ptx = Math.floor(this.player.bounds.centerX);
  var pty = Math.floor(this.player.bounds.centerY);
  var touchingMold = this.mold.at(ptx,pty);
  
  
  
  // var touchingMold = false;
  // for (var j = 0; j < this.mold.length; ++j) {
    // for (var i = 0; i < this.mold[j].length; ++i) {
      // if (this.mold[j][i] && this.mold[j][i]) {
        // this.mold[j][i].update(elapsed, this);
        // if (!touchingMold && this.player.bounds.intersect(this.mold[j][i].bounds)) {
          // touchingMold = true;
        // }
      // }
    // }
  // }
  if (touchingMold) {
    this.moldTimer += elapsed;
    if (this.moldTimer > World.MOLD_TIME) {
      Game.setState(new TitleCard());
    }
  } else {
      this.moldTimer -= elapsed;
      if (this.moldTimer < 0) this.moldTimer = 0;
  }
  
  if (this.totalCoins >= this.cost) {
    if (this.portal.bounds.intersect(this.player.bounds)) {
      this.portalTimer += elapsed;
      if (this.portalTimer > World.PORTAL_TIME) {
        var nextState = generateLevel(this.index +1);
        nextState.totalCoins = this.totalCoins - this.cost;
        Game.setState(nextState);
      }
    } else {
      this.portalTimer -= elapsed;
      if (this.portalTimer < 0) this.portalTimer = 0;
    }
  }
  
  this.animationStep(elapsed);
};
World.prototype.animationStep = function (elapsed) {
  if (this.fadeDirection < 0) {
    if (this.fadeTimer > elapsed) {
      this.fadeTimer -= elapsed;
    } else {
      this.fadeTimer = 0;
    }
  }
};
World.prototype.draw = function (ctx) {
  if (this.moldTimer > 0) {
    ctx.filter = 'blur(' + World.MOLD_BLUR * this.moldTimer / World.MOLD_TIME + 'px)';
  } else {
    ctx.filter = 'blur(0px)';
  }
  
  ctx.fillStyle = '#000000';
  ctx.fillRect(0,0,Game.WIDTH,Game.HEIGHT);
  
  this.sourceBounds.copyFrom(this.camera.bounds);
  this.sourceBounds.moveTo(this.sourceBounds.left * World.TILE_SIZE, this.sourceBounds.top * World.TILE_SIZE);
  this.sourceBounds.resizeBy(World.TILE_SIZE);
  this.destBounds = this.camera.screenRect(this.camera.bounds,this.destBounds);
  ctx.drawImage(this.backplane, 
    this.sourceBounds.left, this.sourceBounds.top, this.sourceBounds.width, this.sourceBounds.height,
    this.destBounds.left, this.destBounds.top, this.destBounds.width, this.destBounds.height);
  
  this.mold.draw(ctx,this.camera);
  // for (var j = 0; j < this.mold.length; ++j) {
    // for (var i = 0; i < this.mold[j].length; ++i) {
      // if (this.mold[j][i]) {
        // if (this.mold[j][i].bounds.intersect(this.camera.bounds)) {
          // this.mold[j][i].draw(ctx, this.camera);
        // }
      // }
    // }
  // }
  
  // ctx.drawImage(this.backplane,0,0,Game.WIDTH,Game.HEIGHT);
    
  this.portal.draw(ctx, this.camera, this.totalCoins >= this.cost);
  this.player.draw(ctx, this.camera);
  
  var coinsLeft = 0;
  for (var i = 0; i < this.coins.length; ++i) {
    if (this.coins[i].active) {
      if (this.coins[i].bounds.intersect(this.camera.bounds)) {
        this.coins[i].draw(ctx, this.camera);
      }
      ++coinsLeft;
    }
  }
  
  ctx.lineWidth = 1;
  // this.drawMinimap(ctx);
  
  if (this.moldTimer > 0) {
    ctx.filter = 'blur(0px)';
    var vignetteSize = Game.WIDTH / 2;
    var vignetteInner = (1 - this.moldTimer / World.MOLD_TIME) * vignetteSize;
    var vignette = ctx.createRadialGradient(Game.WIDTH / 2, Game.WIDTH / 2, vignetteInner, Game.WIDTH / 2, Game.WIDTH / 2, vignetteInner + vignetteSize / 2);
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'black');
    
    ctx.scale(1, Game.HEIGHT / Game.WIDTH);
    ctx.fillStyle = vignette;
    ctx.fillRect(0,0,Game.WIDTH,Game.WIDTH);
    ctx.scale(1, Game.WIDTH / Game.HEIGHT);
  }
  
  this.drawHUD(ctx, coinsLeft);
  
  if (this.moldTimer > World.MOLD_TIME - 1000) {
    ctx.globalAlpha = (this.moldTimer - World.MOLD_TIME + 1000) / 1000;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0,0,Game.WIDTH,Game.HEIGHT);
    ctx.globalAlpha = 1;
  }
  if (this.fadeTimer > 0) {
    ctx.globalAlpha = this.fadeTimer / World.FADE_TIME;
    ctx.fillStyle = this.fadeStyle;
    ctx.fillRect(0,0,Game.WIDTH,Game.HEIGHT);
    ctx.globalAlpha = 1;
  }
  
  
  // this.cameraControl.debugDraw(ctx);
};
World.prototype.drawMinimap = function (ctx) {
  var scale_map = 160 / this.minimap.width;  
  ctx.drawImage(this.minimap, 0, 0, this.minimap.width * scale_map, this.minimap.height * scale_map);
  
  ctx.strokeStyle = 'red';
  ctx.strokeRect(
    this.camera.bounds.left * scale_map,
    this.camera.bounds.top * scale_map,
    this.camera.bounds.width * scale_map,
    this.camera.bounds.height * scale_map);
    
  var ds = Math.max(2, scale_map);
    
  ctx.fillStyle = '#0040ff';
  var dl = 80;
  var dr = 80;
  ctx.fillRect(Math.floor(dl - ds/2), Math.floor(dr - ds/2), ds, ds);
  
  ctx.fillStyle = '#b000ff';
  for (var i = 0; i < this.coins.length; ++i) {
    var coin = this.coins[i];
    if (coin.active) {
      var dl = coin.bounds.centerX * scale_map;
      var dr = coin.bounds.centerY * scale_map;
      ctx.fillRect(Math.floor(dl - ds/2), Math.floor(dr - ds/2), ds, ds);
    }
  }
  
  ctx.fillStyle = 'red';
  var dl = this.player.bounds.centerX * scale_map;
  var dr = this.player.bounds.centerY * scale_map;
  ctx.fillRect(Math.floor(dl - ds/2), Math.floor(dr - ds/2), ds, ds);
};
World.prototype.drawHUD = function (ctx, coinsLeft) {
  if (this.totalCoins < this.cost) {
    ctx.globalAlpha = 0.5;
  } else {
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = "#b000ff";  
  ctx.beginPath();
  ctx.arc(Game.WIDTH - 20, 20, 10, 0, 2*Math.PI);
  ctx.fill();
  
  ctx.globalAlpha = 1;
  
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 20px monospace';

  if (this.totalCoins < this.cost) {
    ctx.strokeStyle = "#202020";  
    ctx.fillStyle = "#606060";  
  } else if (coinsLeft > 0) {
    ctx.strokeStyle = "#606060";  
    ctx.fillStyle = "#ffffff";  
  } else { 
    ctx.strokeStyle = "#605000";  
    ctx.fillStyle = "#fff000"; 
  }
  ctx.fillText(' / ' + this.cost, Game.WIDTH - 40, 20);
  ctx.strokeText(' / ' + this.cost, Game.WIDTH - 40, 20);
  var costMetrics = ctx.measureText(' / ' + this.cost);  
  
  ctx.fillText(this.totalCoins, Game.WIDTH - 40 - costMetrics.width, 20);
  ctx.strokeText(this.totalCoins, Game.WIDTH - 40 - costMetrics.width, 20);
};
World.prototype.keydown = function (ev) {
  this.player.keydown(ev);
};
World.prototype.keyup = function (ev) {
  this.player.keyup(ev);
};
World.prototype.mousedown = function (ev) {
  this.mouse.pressed = true;
};
World.prototype.mouseup = function () {
  this.mouse.pressed = false;
};
World.prototype.mousemove = function (ev) {
  this.mouse.x = ev.pageX - canvasX;
  this.mouse.y = ev.pageY - canvasY;
};

function generateWorld(width, height, coins, cost) {
  if (width == undefined) width = 100;
  if (height == undefined) height = width;
  var minorAxis = Math.min(width, height);
  
  var noiseMap = valueNoise(whiteNoise(width,height), 4);
  
  var glowMap = glow(width, height, 5, minorAxis / 5);
  buffer_apply(glowMap, function (value) {
    return value * 0.5;
  });
  
  var outerEdgeMap = glow(width, height, 2 * minorAxis / 5, minorAxis / 2);
  buffer_invert(outerEdgeMap);
  
  buffer_add(noiseMap, glowMap);
  buffer_subtract(noiseMap, outerEdgeMap);
  
  buffer_clamp(noiseMap, 0, 1);
  
  buffer_apply(noiseMap, function (value) {
    return value >= 0.5 ? 1 : 0;
  });
  
  noiseMap = cull(noiseMap,minorAxis / 2,minorAxis / 2);
  
  // Remove pillars
  buffer_apply(noiseMap, function (value, x, y) {
    if (x > 0
      && y > 0
      && x < width - 1
      && y < height - 1
      && value === 0) {
      if (noiseMap[y][x - 1] === 1
        && noiseMap[y - 1][x] === 1
        && noiseMap[y][x + 1] === 1
        && noiseMap[y + 1][x] === 1) {
        return 1;
      }
    }
    return value;
  });
  
  // Add coins
  for (var i = 0; i < coins; ++i) {
    while (true) {
      var a = Math.random() * 2 * Math.PI;
      var d = (1 - Math.pow(Math.random(),2)) * (2 * minorAxis / 5 - 5) + 5;
      var u = Math.floor(Math.cos(a) * d + minorAxis / 2);
      var v = Math.floor(Math.sin(a) * d + minorAxis / 2);
      
      if (noiseMap[v][u] === 1
        && noiseMap[v-1][u] === 1
        && noiseMap[v][u-1] === 1
        && noiseMap[v+1][u] === 1
        && noiseMap[v][u+1] === 1) {
        noiseMap[v][u] = 2;
        break;
      }
    }
  }
  
  // Add mold
  var moldMap = buffer_copy(noiseMap);
  buffer_apply(moldMap, function (value, x, y) {
    if (x > 0
      && y > 0
      && x < width - 1
      && y < height - 1
      && value === 0) {
      if (noiseMap[y][x - 1] === 1
        || noiseMap[y - 1][x] === 1
        || noiseMap[y][x + 1] === 1
        || noiseMap[y + 1][x] === 1) {
        return Math.random() > 0.9 ? 1 : 0;
      }
    }
    return 0;
  });
  
  buffer_apply(noiseMap, function (value, x, y) {
    if (moldMap[y][x] === 1) {
      return 3;
    }
    return value;
  });
  
  return new World(noiseMap, cost);
}

function generateLevel(levelIndex) {
  var generationIndex = Math.min(levelIndex, 10);
  var COST_SCALE = 1.6;
  var BONUS_COINS = 2;
  var COIN_DECAY = 7.5;
  var BASE_SIZE = 10;
  var COIN_SIZE_FACTOR = 11;
  
  var levelCost = Math.floor(Math.pow(COST_SCALE,generationIndex));
  var coinModifier = BONUS_COINS * Math.pow(Math.E, -generationIndex / COIN_DECAY) + 1;
  var levelCoins = Math.floor(levelCost * coinModifier);
  
  var levelSize = Math.floor(BASE_SIZE + COIN_SIZE_FACTOR * Math.sqrt(levelCoins));
  
  var world = generateWorld(levelSize,levelSize,levelCoins,levelCost);
  world.index = levelIndex;
  return world;
}