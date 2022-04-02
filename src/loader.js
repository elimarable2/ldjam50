// A key to a file loader record.
function FileKey(key, loader) {
  this.key = key;
  this.loader = loader;
}
FileKey.prototype.get = function() {
  return this.loader.get(this.key);
};
FileKey.prototype.isLoaded = function () {
  return this.loader.registry[this.key].isLoaded;
};

// A single record in the file loader.
function FileRecord(src,type,onLoad) {
  this.src = src;
  this.type = type;
  this.isLoaded = false;
  this.error = null;
  this.onLoad = onLoad;
  this.content = null;
};

FileRecord.prototype.get = function () {
  if (this.isLoaded) return this.content;
};
FileRecord.prototype.send = function (loader) {
  var _this = this;
  var req = new XMLHttpRequest();
  // File Progress Event
  req.addEventListener('progress', function (ev) {
    if (ev.lengthComputable) {
      loader.onProgress(_this, ev.loaded/ev.total);
    }
  });
  // File Load Event
  req.addEventListener('load', function (ev) {
    _this.onLoad(req.response, function (content) { 
      _this.content = content; 
      _this.isLoaded = true;
      loader.onLoad(_this, req.response);
    });
  });
  // File Error Event
  req.addEventListener('error', function (ev) {
    loader.onError(_this, ev);
    _this.error = ev;
  });
  req.open('GET', this.src);
  req.responseType = this.type;
  req.send();
};

function Loader() {
  this.registry = {};
  this.queue = [];
  
  this.currentFile = null;
  this.currentProgress = 0;
  this.isLoading = false;
}

// Register a file with the loader.
Loader.prototype.register = function (src,type,onLoad) {
  this.registry[src] = new FileRecord(src,type,onLoad);
  this.queue.push(src);
  this.poll();
  
  return new FileKey(src, this);
};
// Get a file (if it's loaded)
Loader.prototype.get = function (key) {
  return this.registry[key].get();
};
// Halt until a batch of files is loaded. Returns a UI to show loading progress.
Loader.prototype.require = function () {
  var _this = this, files;
  if (arguments[0] === '*') {
    files = this.queue.slice();
    if (this.isLoading && this.currentFile) {
      files.unshift(this.currentFile);
    }
  } else {
    files = Array.prototype.concat.apply([],arguments).map(function (srcOrKey) {
      if (typeof srcOrKey === 'string') {
        return srcOrKey;
      } else {
        return srcOrKey.key;
      }
    });
    files = files.filter(function (src) {
      return !_this.registry[src].isLoaded && !_this.registry[src].error;
    });
    this.queue = files.concat(this.queue.filter(function (f) { return !files.includes(f);}));
  }  
  
  this.poll();
  return new LoaderUI(this, files);
};
// Load the next file if not currently loading anything.
Loader.prototype.poll = function () {
  if (!this.isLoading) {
    this.currentFile = this.queue.shift();
    
    if (this.currentFile) {
      this.currentProgress = 0;
      this.isLoading = true;
      this.registry[this.currentFile].send(this);
    } else {
      this.isLoading = false;
    }
  }
};

Loader.prototype.onProgress = function (file, progress) {
  this.currentProgress = progress;
};
Loader.prototype.onLoad = function (file, data) {
  this.isLoading = false;
  this.poll();
};
Loader.prototype.onError = function (file, error) {
  this.isLoading = false;
  this.poll();
};

function LoaderUI(loader, files) {
  this.loader = loader;
  this.files = files;
  
  this.currentFile = 0;
  this.isLoading = true;
  this.isComplete = false;
}

LoaderUI.prototype.step = function (elapsed) {
  var currentFileName = this.files[this.currentFile];
  // Update UI state
  if (this.loader.currentFile !== currentFileName) {
    var loadingFile = this.files.indexOf(this.loader.currentFile);
    if (loadingFile !== -1) {
      // Update the counter to point at the currently loading file
      this.currentFile = loadingFile;
      this.isLoading = true;
      this.isComplete = false;
    } else if (this.files.includes(this.loader.queue[0])) {
      // Note that the loader has not yet begun the current batch
      this.isLoading = false;
      this.isComplete = false;
    } else {
      // Note that the current batch is complete
      console.log('step', this.loader.currentFile, currentFileName, this.loader.queue);
      this.isLoading = false;
      this.isComplete = true;
      this.onComplete();
    }
  } else if (this.loader.currentFile) {
    this.isLoading = true;
    this.currentProgress = this.loader.currentProgress;
  } else {
    // Note that the current batch is complete
    this.isLoading = false;
    this.isComplete = true;
    console.log(this.files);
    this.onComplete();
  }
};
LoaderUI.prototype.draw = function (ctx) {
  var width = ctx.canvas.width;
  var height = ctx.canvas.height;
  
  var barWidth = LoaderUI.BAR_WIDTH;
  if (barWidth.indexOf('%') !== -1) {
    barWidth = parseFloat(barWidth) / 100 * width;
  }
  
  // Clear the background
  ctx.beginPath();
  ctx.fillStyle = 'black';
  ctx.rect(0,0,width,height);
  ctx.fill();
  
  // Draw overall loader
  ctx.fillStyle = LoaderUI.COLOR_SECONDARY;
  ctx.font = LoaderUI.FONT;
  
  if (this.isComplete) {
    ctx.textAlign = "center";
    ctx.textBaseline = "center";
    ctx.fillText('Complete', width / 2, height / 2);
  } else if (this.isLoading) {
    var left = (width - barWidth) / 2;
    var right = width - left;
    var upper = height / 2 - LoaderUI.BAR_HEIGHT - LoaderUI.MARGIN;
    var lower = height / 2 + LoaderUI.MARGIN;
    
    // Draw the loading bars
    ctx.beginPath();
    ctx.fillStyle = LoaderUI.COLOR_PRIMARY;
    ctx.rect(left,upper,Math.floor(barWidth * this.currentFile / this.files.length),LoaderUI.BAR_HEIGHT);
    ctx.rect(left,lower,Math.floor(barWidth * this.currentProgress),LoaderUI.BAR_HEIGHT);
    ctx.fill();
    ctx.beginPath();
    ctx.strokeStyle = LoaderUI.COLOR_SECONDARY;
    ctx.rect(left,upper,barWidth,LoaderUI.BAR_HEIGHT);
    ctx.rect(left,lower,barWidth,LoaderUI.BAR_HEIGHT);
    ctx.stroke();
    
    // Write the current file and the total number of files
    ctx.fillStyle = LoaderUI.COLOR_SECONDARY;
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText(this.files[this.currentFile], left, upper - LoaderUI.MARGIN);
    ctx.textAlign = "right";
    ctx.fillText(this.currentFile + "/" + this.files.length, right, upper - LoaderUI.MARGIN);
  } else {
    ctx.textAlign = "center";
    ctx.textBaseline = "center";
    ctx.fillText('Please Wait...', width / 2, height / 2);
  }
};

LoaderUI.prototype.onComplete = function () {
};

LoaderUI.BAR_WIDTH = '50%';
LoaderUI.BAR_HEIGHT = 8;
LoaderUI.MARGIN = 2;
LoaderUI.FONT = "12pt sans-serif";
LoaderUI.COLOR_SECONDARY = '#808080';
LoaderUI.COLOR_PRIMARY = '#606060';
