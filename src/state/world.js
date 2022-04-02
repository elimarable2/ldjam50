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
  
  this.player = new Player(this.width / 2,this.width / 2);
	this.camera = new Camera(World.MAJOR_AXIS_TILES,World.MAJOR_AXIS_TILES * 9 / 16);
  this.cameraControl = new WorldCameraController(this, this.camera);
  this.cameraControl.jumpToTarget();
  
  this.coins = [];
  this.totalCoins = 0;
  
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
  
  for (var i = 0; i < this.width; ++i) {
    for (var j = 0; j < this.height; ++j) {
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
    }
  }
  
  // this.console = new GameConsole(getWorldConsoleDefinition(this));
  
  // this.spec = toColors(smoothNoise(this.baseNoise, 2));
  
  // this.spec = generateWorld();
  
  this.sourceBounds = new Rectangle();
  this.destBounds = new Rectangle();
}

World.MAJOR_AXIS_TILES = 30;
World.TILE_SIZE = 96;

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
};
World.prototype.draw = function (ctx) {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0,0,Game.WIDTH,Game.HEIGHT);
  
  this.sourceBounds.copyFrom(this.camera.bounds);
  this.sourceBounds.moveTo(this.sourceBounds.left * World.TILE_SIZE, this.sourceBounds.top * World.TILE_SIZE);
  this.sourceBounds.resizeBy(World.TILE_SIZE);
  this.destBounds = this.camera.screenRect(this.camera.bounds,this.destBounds);
  ctx.drawImage(this.backplane, 
    this.sourceBounds.left, this.sourceBounds.top, this.sourceBounds.width, this.sourceBounds.height,
    this.destBounds.left, this.destBounds.top, this.destBounds.width, this.destBounds.height);
  
  // ctx.drawImage(this.backplane,0,0,Game.WIDTH,Game.HEIGHT);
    
  var scale_map = 160 / this.minimap.width;  
  ctx.drawImage(this.minimap, 0, 0, this.minimap.width * scale_map, this.minimap.height * scale_map);
  
  ctx.strokeStyle = 'red';
  ctx.strokeRect(
    this.camera.bounds.left * scale_map,
    this.camera.bounds.top * scale_map,
    this.camera.bounds.width * scale_map,
    this.camera.bounds.height * scale_map);
    
  var ds = Math.max(2, scale_map);
    
  ctx.fillStyle = 'blue';
  for (var i = 0; i < this.coins.length; ++i) {
    var coin = this.coins[i];
    var dl = coin.bounds.left * scale_map;
    var dr = coin.bounds.top * scale_map;
    ctx.fillRect(Math.floor(dl - ds/2), Math.floor(dr - ds/2), ds, ds);
  }
  
  ctx.fillStyle = 'red';
  var dl = this.player.bounds.left * scale_map;
  var dr = this.player.bounds.top * scale_map;
  ctx.fillRect(Math.floor(dl - ds/2), Math.floor(dr - ds/2), ds, ds);
    
  this.player.draw(ctx, this.camera);
  
  for (var i = 0; i < this.coins.length; ++i) {
    if (this.coins[i].active) {
      this.coins[i].draw(ctx, this.camera);
    }
  }
  
  // if (this.index) {
    // ctx.textAlign = 'left';
    // ctx.textBaseline = 'top';
    // ctx.fillText(this.index, 0, 0);
  // }
  
};
World.prototype.keydown = function (ev) {
  // this.console.keydown(ev);
  this.player.keydown(ev);
  
  if (ev.key === 'n') {
    Game.setState(generateLevel(this.index+1));
  }
};
World.prototype.keyup = function (ev) {
  // this.console.keyup(ev);
  this.player.keyup(ev);
};
World.prototype.mousedown = function (ev) {
  // if (!this.console.open) {
    this.mouse.pressed = true;
  // } 
  
  // ++this.blend;
  // if (this.blend >= this.interpolation.length) this.blend = 0;
  
  // this.spec = toColors(valueNoise(this.baseNoise, 4, 0.5, this.interpolation[this.blend]));
  
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
      && x < width
      && y < height
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
      var d = Math.random() * (2 * minorAxis / 5 - 5) + 5;
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
  
  return new World(noiseMap, cost);
}

function generateLevel(levelIndex) {
  if (levelIndex > 10) levelIndex = 10;
  var COST_SCALE = 1.5;
  var BONUS_COINS = 4;
  var COIN_DECAY = 5.5;
  var BASE_SIZE = 7.5;
  var COIN_SIZE_FACTOR = 15;
  
  var levelCost = Math.floor(Math.pow(COST_SCALE,levelIndex));
  var coinModifier = BONUS_COINS * Math.pow(Math.E, -levelIndex / COIN_DECAY) + 1;
  var levelCoins = levelCost * coinModifier;
  
  var levelSize = Math.floor(BASE_SIZE + COIN_SIZE_FACTOR * Math.sqrt(levelCoins));
  
  var world = generateWorld(levelSize,levelSize,levelCoins,levelCost);
  world.index = levelIndex;
  return world;
}