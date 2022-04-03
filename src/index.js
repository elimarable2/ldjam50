var mainContainer = null;
var mainCanvas = null;
var mainContext = null;

if (!window.AudioContext) {
  window.AudioContext = window.webkitAudioContext;
  var legacyDecodeAudioData = window.AudioContext.prototype.decodeAudioData;
  window.AudioContext.prototype.decodeAudioData = function (data) {
    var onSuccess = function (result) {};
    var onError = function (error) {};
    legacyDecodeAudioData.call(this, data, function (result) {
      onSuccess(result);
    }, function (error) {
      onError(error);
    });
    return {
      then: function (callback) { onSuccess = callback; return this; },
      catch: function (callback) { onError = callback; return this; }
    }
  }
}

var canvasX = 0;
var canvasY = 0;

var Game = {
  NAMESPACE: 'jam.ldjam50',
  
	ASPECT: 9/16,
  
  BASE_WIDTH: 32 * 16,
  BASE_WIDTH_LANDSCAPE: 32 * 16,
  BASE_WIDTH_PORTRAIT: 32 * 9,
  TILE_SIZE: 32,
	
	difficulty: 0,
	currentMission: 0,
  
  loader: new Loader(),
  audioContext: new AudioContext(),

	load: function () {
    var audioContext = this.audioContext;
    mainContainer = document.getElementById('main_box');
		mainCanvas = document.getElementById('main_canvas');
		mainContext = mainCanvas.getContext('2d');
    mainContext.mozImageSmoothingEnabled = false;
    mainContext.webkitImageSmoothingEnabled = false;
    mainContext.imageSmoothingEnabled = false;
        
    SOUND.init(audioContext);
    MUSIC.init(audioContext);
        
    // SOUND.startDrag = SOUND.load(Game.loader,'assets/start_drag.wav');
    // MUSIC.main = MUSIC.load(Game.loader,'assets/music.ogg');
        
    Game.audio = {
      'coin': SOUND.load(Game.loader, 'assets/coin.wav'),
      'portal': SOUND.load(Game.loader, 'assets/portal.wav'),
      'hurt': SOUND.load(Game.loader, 'assets/hurt.wav'),
      'music': MUSIC.load(Game.loader, 'assets/music.ogg')
    };
    
    function loadImage(path) {
      return Game.loader.register(path, "blob", function (data, callback) {
        var img = new Image();
        img.src = window.URL.createObjectURL(data);
        return callback(img);
      });
    }
    
    Game.images = {
    };
    
    function loadWorld(path) {
      return Game.loader.register(path, "json", function (data, callback) {
        var world = new World();
        world.load(data);
        return callback(world);
      });
    }
    
    Game.worlds = [
    ];
    
    function loadFont(path, spriteKey) {
      return Game.loader.register(path, "json", function (data, callback) {
        var font = new Font();
        font.load(data);
        return font.awaitSprite(spriteKey, callback);
      });
    }
    
    Game.font = {
    };
    
    function loadAnimation(path) {
      return Game.loader.register(path, "json", function (data, callback) {
        return callback(Animation.deserialize(data));
      });
    }
    
    Game.animation = {
    }
        
		window.onresize();
	},
	start: function () {
		var that = this;
    var mousemove = function (ev) { that.mousemove(ev); };
    var mousedown = function (ev) { that.mousedown(ev); };
    var mouseup = function (ev) { that.mouseup(ev); };
		mainCanvas.addEventListener('mousemove',mousemove);
		mainCanvas.addEventListener('mousedown',mousedown);
		mainCanvas.addEventListener('mouseup',mouseup);
    mainCanvas.addEventListener('touchmove', function (ev) {
      ev.preventDefault();
      console.log('touchmove');
      var touch = null;
      for (var i = 0; i < ev.changedTouches.length; ++i) {
        if (ev.changedTouches[i].identifier === that.currentTouch) {
          touch = ev.changedTouches[i];
          break;
        }
      }
      if (touch) {
        that.mousemove({
          pageX: touch.pageX,
          pageY: touch.pageY,
          originalEvent: ev
        });
      }
    });
    mainCanvas.addEventListener('touchstart', function (ev) {
      ev.preventDefault();
      console.log('touchstart');
      var touch = ev.changedTouches[0];
      that.currentTouch = touch.identifier;
      that.mousemove({
        pageX: touch.pageX,
        pageY: touch.pageY,
        originalEvent: ev
      });
      that.ui.step(1);
      that.mousedown({
        pageX: touch.pageX,
        pageY: touch.pageY,
        originalEvent: ev
      });
      mainCanvas.removeEventListener('mousemove',mousemove);
      mainCanvas.removeEventListener('mousedown',mousedown);
      mainCanvas.removeEventListener('mouseup',mouseup);
    });
    mainCanvas.addEventListener('touchend', function (ev) {
      ev.preventDefault();
      console.log('touchend');
      var touch = null;
      for (var i = 0; i < ev.changedTouches.length; ++i) {
        if (ev.changedTouches[i].identifier === that.currentTouch) {
          touch = ev.changedTouches[i];
          that.currentTouch = null;
          break;
        }
      }
      if (touch) {
        that.mouseup({
          pageX: touch.pageX,
          pageY: touch.pageY,
          originalEvent: ev
        });
        mainCanvas.addEventListener('mousemove',mousemove);
        mainCanvas.addEventListener('mousedown',mousedown);
        mainCanvas.addEventListener('mouseup',mouseup);
      }
    });
		mainCanvas.addEventListener('contextmenu', function (ev) {
      that.contextmenu(ev);
    });
    document.addEventListener('keydown',function (ev) { that.keydown(ev); });
		document.addEventListener('keyup',function (ev) { that.keyup(ev); });
	
    var init = this.loader.require('*');
    init.onComplete = function () { that.setState(new TitleCard()); };
    // init.onComplete = function () { that.setState(MainMenu()); };
    // init.onComplete = function () { that.setState(new Test("CC")); };
    this.setState(init);
	
		this.loop();
	},
	loop: function (timeStamp) {
		if (this.lastTime) {
			this.elapsed = timeStamp - this.lastTime;
			this.lastTime = timeStamp;
      
      if (this.elapsed > 100) this.elapsed = 100;
		} else {
			this.elapsed = 100;
			this.lastTime = timeStamp;
		}		
		
		this.ui.step(this.elapsed);
		this.ui.draw(mainContext);
    
    // var fps = (1000 / this.elapsed).toFixed(0);
    // mainContext.lineWidth = 2;
    // mainContext.font = '24px monospace';
    // mainContext.textAlign = 'left';
    // mainContext.textBaseline = 'top';
    // mainContext.strokeStyle = "yellow";
    // mainContext.strokeText(fps, 2, 2);
    // mainContext.fillStyle = "black";
    // mainContext.fillText(fps, 2, 2);
		
		var that = this;
		window.requestAnimationFrame(function (t) {
			that.loop(t);
		});
	},
	
	difficultyMod: function (value) {
		return value * (this.difficulty+1)/2;
	},
	
	setState: function (state) {
		this.ui = state;
		if (state.onEnter) { state.onEnter(); }
	},
		
  promptDownload: function (fileContent, defaultName) {
    var file = new Blob([fileContent], {type: "application/json"});
    var a = document.createElement('a');
    var url = URL.createObjectURL(file);
    a.href = url;
    a.download = defaultName || 'file.json';
    document.body.appendChild(a);
    a.click();
    window.setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  },
  promptUpload: function (callback) {
      var input = document.createElement('input');
      input.setAttribute('type','file');
      document.body.appendChild(input);
      input.click();
      function onChange(ev) {
        input.removeEventListener('change',onChange);
        if (input.files.length > 0) {
          var r = new FileReader();
          r.onload = function (ev) { callback(ev.target.result, input.files[0]); };
          r.readAsText(input.files[0]);
        }
      }
      input.addEventListener('change', onChange);
      window.setTimeout(function () {
        document.body.removeChild(input);
      }, 0);
  },
    
	mousemove: function (ev) {
		if (this.ui.mousemove) { this.ui.mousemove(ev); }
	},
	mousedown: function (ev) {
		if (this.ui.mousedown) { this.ui.mousedown(ev); }
	},
	mouseup: function (ev) {
		if (this.ui.mouseup) { this.ui.mouseup(ev); }
	},
	contextmenu: function (ev) {
		if (this.ui.contextmenu) { this.ui.contextmenu(ev); }
	},
	keydown: function (ev) {
    if (this.ui.keydown) { this.ui.keydown(ev); }
	},
	keyup: function (ev) {
    if (this.ui.keyup) { this.ui.keyup(ev); }
	},
};

window.onresize = function () {
  if (window.innerWidth < window.innerHeight) {
    Game.BASE_WIDTH = Game.BASE_WIDTH_PORTRAIT;    
    var adjustedHeight = window.innerWidth / Game.ASPECT;
    var adjustedWidth = window.innerHeight * Game.ASPECT;
    if (adjustedHeight < window.innerHeight) {
      Game.WIDTH = window.innerWidth;
      Game.HEIGHT = adjustedHeight;
      canvasX = 0;
      canvasY = (window.innerHeight - adjustedHeight) / 2;
    } else {
      Game.WIDTH = adjustedWidth;
      Game.HEIGHT = window.innerHeight;
      canvasX = (window.innerWidth - adjustedWidth) / 2;
      canvasY = 0;
    }
  } else {
    Game.BASE_WIDTH = Game.BASE_WIDTH_LANDSCAPE;  
    var adjustedHeight = window.innerWidth * Game.ASPECT;
    var adjustedWidth = window.innerHeight / Game.ASPECT;
    if (adjustedWidth < window.innerWidth) {
      Game.WIDTH = adjustedWidth;
      Game.HEIGHT = window.innerHeight;
      canvasX = (window.innerWidth - adjustedWidth) / 2;
      canvasY = 0;
    } else {
      Game.WIDTH = window.innerWidth;
      Game.HEIGHT = adjustedHeight;
      canvasX = 0;
      canvasY = (window.innerHeight - adjustedHeight) / 2;
    }
  }
  
  mainCanvas.style.left = canvasX + 'px';
  mainCanvas.style.top = canvasY + 'px';
  mainCanvas.width = Game.WIDTH;
  mainCanvas.height = Game.HEIGHT;
  
  mainContext.mozImageSmoothingEnabled = false;
  mainContext.webkitImageSmoothingEnabled = false;
  mainContext.imageSmoothingEnabled = false;
};

window.onblur = function () {
  SOUND.mute();
  MUSIC.mute();
};
window.onfocus = function () {
  SOUND.unmute();
  MUSIC.unmute();
};


window.onload = function () {
	Game.load();
	Game.start();
};
