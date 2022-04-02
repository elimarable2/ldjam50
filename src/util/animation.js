function AnimationLayer(imageName) {
  this.imageName = imageName;
  this.image = Game.images[imageName].get();
  this.imageBounds = new Rectangle(0, 0, this.image.width, this.image.height);
  this.frameBounds = new Rectangle(this.imageBounds);
  this.imageRows = 1;
  this.imageColumns = 1;
}
AnimationLayer.prototype.setImage = function (imageName) {
  this.imageName = imageName;
  this.image = Game.images[imageName].get();
  this.imageBounds = new Rectangle(0, 0, this.image.width, this.image.height);
  if (this.frameBounds.height !== 0) {
    this.imageRows = Math.ceil(this.imageBounds.height / this.frameBounds.height);
  }
  if (this.frameBounds.width !== 0) {
    this.imageColumns = Math.ceil(this.imageBounds.width / this.frameBounds.width);
  }
};
AnimationLayer.prototype.setFrameBounds = function (left, top, width, height) {
  this.frameBounds.moveTo(left, top);
  this.frameBounds.resize(width, height);
  this.imageRows = Math.ceil(this.imageBounds.height / this.frameBounds.height);
  this.imageColumns = Math.ceil(this.imageBounds.width / this.frameBounds.width);
};
AnimationLayer.prototype.serialize = function () {
  return {
    imageName: this.imageName,
    frameBounds: this.frameBounds.serialize()
  };
};
AnimationLayer.deserialize = function (data) {
  var layer = new AnimationLayer(data.imageName);
  layer.setFrameBounds(data.frameBounds.left, data.frameBounds.top, data.frameBounds.width, data.frameBounds.height);
  return layer;
};

function Animation() {
  this.layers = [];
  this.frames = [{
    time: 100,
    layers: []
  }];
}
Animation.serializeFrame = function (frame, cache) {
  // console.log('Animation.serializeFrame(', frame, cache, ')');
  var frameData = {};
  
  if (frame.time !== cache.time) {
    frameData.time = frame.time;
    cache.time = frame.time;
  }
  
  var dataLayers = [];
  for (var layerIndex = 0; layerIndex < frame.layers.length; ++layerIndex) {
    var cachedLayer = cache.layers[layerIndex];
    var frameLayer = frame.layers[layerIndex];
    
    if (frameLayer === null) {
      if (cachedLayer !== null) {
        dataLayers[layerIndex] = null;
        cache.layers[layerIndex] = null;
      }
    } else {      
      var anyChanges = false;
      var dataLayer = {};
      if (cachedLayer === null) {
        cachedLayer = {
          bounds: {}
        };
        cache.layers[layerIndex] = cachedLayer;
        anyChanges = true;
      }
      
      if (frameLayer.sourceFrame !== cachedLayer.sourceFrame) {
        anyChanges = true;
        dataLayer.sourceFrame = frameLayer.sourceFrame;
        cachedLayer.sourceFrame = frameLayer.sourceFrame;
      }
      
      if (frameLayer.bounds.left !== cachedLayer.bounds.left) {
        anyChanges = true;
        dataLayer.bounds = dataLayer.bounds || {};
        dataLayer.bounds.left = frameLayer.bounds.left;
        cachedLayer.bounds.left = frameLayer.bounds.left;
      }
      
      if (frameLayer.bounds.top !== cachedLayer.bounds.top) {
        anyChanges = true;
        dataLayer.bounds = dataLayer.bounds || {};
        dataLayer.bounds.top = frameLayer.bounds.top;
        cachedLayer.bounds.top = frameLayer.bounds.top;
      }
      
      if (frameLayer.bounds.width !== cachedLayer.bounds.width) {
        anyChanges = true;
        dataLayer.bounds = dataLayer.bounds || {};
        dataLayer.bounds.width = frameLayer.bounds.width;
        cachedLayer.bounds.width = frameLayer.bounds.width;
      }
      
      if (frameLayer.bounds.height !== cachedLayer.bounds.height) {
        anyChanges = true;
        dataLayer.bounds = dataLayer.bounds || {};
        dataLayer.bounds.height = frameLayer.bounds.height;
        cachedLayer.bounds.height = frameLayer.bounds.height;
      }
      
      if (anyChanges) dataLayers[layerIndex] = dataLayer;
    }
  }
  
  if (dataLayers.length > 0) frameData.layers = dataLayers;
  
  // console.log('Animation.serializeFrame ===>', frameData);
  return frameData;
};
Animation.prototype.serialize = function () {
  var layers = this.layers.map(function (layer) { return layer.serialize(); });
  var serializerCache = {
    layers: this.layers.map(function (layer) {
      return {
        bounds: layer.frameBounds.serialize()
      };
    })
  };
  var frames = this.frames.map(function (frame) { return Animation.serializeFrame(frame, serializerCache); });
    
  return {
    layers: layers,
    frames: frames
  };
};
Animation.deserializeFrame = function (frameData, cache, layers) {
  // console.log('Animation.deserializeFrame(', frameData, cache, ')');
  var frame = {};
  
  if (frameData.time) {
    frame.time = frameData.time;
    cache.time = frameData.time;
  } else {
    frame.time = cache.time;
  }
  
  if (frameData.layers) {
    frame.layers = [];
    var totalLayers = Math.max(cache.layers.length, frameData.layers.length);
    for (var layerIndex = 0; layerIndex < totalLayers; ++layerIndex) {
      var cachedLayer = cache.layers[layerIndex];
      var dataLayer = frameData.layers[layerIndex];
      
      if (dataLayer === null) {
        frame.layers[layerIndex] = null;
        cache.layers[layerIndex] = null;
      } else if (dataLayer === undefined) {
        if (cachedLayer === null) {
          frame.layers[layerIndex] = null;
        } else {
          frame.layers[layerIndex] = {
            sourceFrame: cachedLayer.sourceFrame || 0,
            bounds: Rectangle.deserialize(cachedLayer.bounds)
          }
        }
      } else if (cachedLayer === null) {
        var dataBounds = {
          left: layers[layerIndex].frameBounds.left,
          top: layers[layerIndex].frameBounds.top,
          width: layers[layerIndex].frameBounds.width,
          height: layers[layerIndex].frameBounds.height
        };
        if (dataLayer.bounds && dataLayer.bounds.left != undefined) dataBounds.left = dataLayer.bounds.left;
        if (dataLayer.bounds && dataLayer.bounds.top != undefined) dataBounds.top = dataLayer.bounds.top;
        if (dataLayer.bounds && dataLayer.bounds.width != undefined) dataBounds.width = dataLayer.bounds.width;
        if (dataLayer.bounds && dataLayer.bounds.height != undefined) dataBounds.height = dataLayer.bounds.height;
        frame.layers[layerIndex] = {
          sourceFrame: dataLayer.sourceFrame,
          bounds: Rectangle.deserialize(dataBounds)
        };
        cache.layers[layerIndex] = {
          sourceFrame: dataLayer.sourceFrame,
          bounds: dataBounds
        };
      } else {
        if (typeof dataLayer.sourceFrame === 'number') {
          cachedLayer.sourceFrame = dataLayer.sourceFrame;
        }
        
        if (typeof dataLayer.bounds === 'object') {
          cachedLayer.bounds.left = dataLayer.bounds.left || cachedLayer.bounds.left;
          cachedLayer.bounds.top = dataLayer.bounds.top || cachedLayer.bounds.top;
          cachedLayer.bounds.width = dataLayer.bounds.width || cachedLayer.bounds.width;
          cachedLayer.bounds.height = dataLayer.bounds.height || cachedLayer.bounds.height;
        }
        
        frame.layers[layerIndex] = {
          sourceFrame: cachedLayer.sourceFrame || 0,
          bounds: Rectangle.deserialize(cachedLayer.bounds)
        }
      }
    }
  } else {
    frame.layers = cache.layers.map(function (layer) {
      if (layer === null) return null;
      return {
        sourceFrame: layer.sourceFrame || 0,
        bounds: Rectangle.deserialize(layer.bounds)
      }
    });
  }
  // console.log('Animation.deserializeFrame ===>', frame);
  return frame;
};
Animation.deserialize = function (data) {
  var anim = new Animation();
  
  for (var i = 0; i < data.layers.length; ++i) {
    anim.layers.push(AnimationLayer.deserialize(data.layers[i]));
  }
  
  var deserializerCache = {
    layers: anim.layers.map(function (layer) {
      return null;
    })
  };
  anim.frames = data.frames.map(function (frame) { return Animation.deserializeFrame(frame, deserializerCache, anim.layers); });
  
  return anim;
};

Animation.prototype.addLayer = function (imageName) {
  var layer = new AnimationLayer(imageName);
  var layerIndex = this.layers.length;
  this.layers.push(layer);
  
  for (var i = 0; i < this.frames.length; ++i) {
    this.frames[i].layers[layerIndex] = {
      bounds: new Rectangle(layer.imageBounds),
      sourceFrame: 0
    };
  }
};
Animation.prototype.setLayerFrameBounds = function (layerIndex, left, top, width, height) {
  var layer = this.layers[layerIndex];
  layer.setFrameBounds(left,top,width,height);
  
  for (var i = 0; i < this.frames.length; ++i) {
    if (this.frames[i].layers[layerIndex]) {
      this.frames[i].layers[layerIndex].bounds.resize(width,height);
    }
  }
};
Animation.prototype.hideLayerForFrame = function (layerIndex, frameIndex) {
  var frame = this.frames[frameIndex];
  frame.layers[layerIndex] = null;
};
Animation.prototype.hideLayerForRange = function (layerIndex, range) {
  var self = this;
  return range.forEach(function (frameIndex) { self.hideLayerForFrame(layerIndex, frameIndex); });
};
Animation.prototype.showLayerForFrame = function (layerIndex, frameIndex) {
  var referenceBounds = this.layers[layerIndex].frameBounds;
  var referenceFrame = 0;
  for (var i = frameIndex; i >= 0; --i) {
    var frameLayer = this.frames[i].layers[layerIndex];
    if (frameLayer) {
      referenceBounds = frameLayer.bounds;
      referenceFrame = frameLayer.sourceFrame;
      break;
    }
  }
  var frame = this.frames[frameIndex];
  frame.layers[layerIndex] = {
    bounds: new Rectangle(referenceBounds),
    sourceFrame: referenceFrame
  };
};
Animation.prototype.showLayerForRange = function (layerIndex, range) {
  var self = this;
  return range.forEach(function (frameIndex) { self.showLayerForFrame(layerIndex, frameIndex); });
};
Animation.prototype.removeLayer = function (layerIndex) {
  this.layers.splice(layerIndex,1);
  
  for (var i = 0; i < this.frames.length; ++i) {
    this.frames[i].layers.splice(layerIndex,1);
  }
};
Animation.prototype.replaceLayer = function (layerIndex, imageName) {
  this.layers[layerIndex].setImage(imageName);
};

Animation.prototype.getLayerIndex = function (imageName) {
  return this.layers.findIndex(function (layer) { return layer.imageName === imageName; });
};
Animation.prototype.getFrameLayer = function (frameIndex, layerIndex) {
  return this.frames[frameIndex] && this.frames[frameIndex].layers[layerIndex];
};

Animation.prototype.addFrame = function (frameIndexToCopy) {
  var frameToCopy = this.frames[frameIndexToCopy];
  if (!frameToCopy) {
    frameToCopy = this.frames[this.frames.length - 1];
  }

  var newFrame = {
    time: frameToCopy.time || 0,
    layers: this.layers.map(function (layer, layerIndex) {
      if (!frameToCopy.layers) {
        return {
          bounds: new Rectangle(layer.frameBounds),
          sourceFrame: this.frames.length
        }
      } else if (frameToCopy.layers[layerIndex] === null) {
        return null;
      } else {
        return {
          bounds: new Rectangle(frameToCopy.layers[layerIndex].bounds),
          sourceFrame: frameToCopy.layers[layerIndex].sourceFrame
        };
      }
    })
  };
  this.frames.push(newFrame);
  return newFrame;
};
Animation.prototype.removeFrame = function (frameIndex) {
  var frameToCopy = this.frames[frameIndex];
  if (!frameToCopy) {
    frameIndex = this.frames.length - 1;
  }

  this.frames.splice(frameIndex,1);
};

Animation.prototype.drawFrame = function(ctx, destination, frameIndex, options) {
  var frame = this.frames[frameIndex];
  if (frame) {
    var hScale = destination.width / this.getSpriteWidth();
    var vScale = destination.height / this.getSpriteHeight();
    if (options.preserveAspect) {
      if (this.getSpriteHeight() * hScale > destination.height) {
        hScale = vScale;
      } else {
        vScale = hScale;
      }
    }
    
    for (var i = 0; i < this.layers.length; ++i) {
      var globalLayer = this.layers[i];
      var frameLayer = frame.layers[i];
      
      var layerOptions = (options.layers && options.layers[globalLayer.imageName]) || {};
      if (layerOptions.hidden) continue;
      
      if (frameLayer) {
        var sourceFrame = frameLayer.sourceFrame + (layerOptions.frameOffset || 0);
        var frameColumn = sourceFrame % globalLayer.imageColumns;
        var frameRow = Math.floor(sourceFrame / globalLayer.imageColumns);
        var sourceLeft = globalLayer.imageBounds.left + frameColumn * globalLayer.frameBounds.width;
        var sourceTop = globalLayer.imageBounds.top + frameRow * globalLayer.frameBounds.height;
        if (this.logOnce) console.log(frameIndex, frameLayer, frameColumn, frameRow, sourceLeft, sourceTop);
        
        var destinationLeft = destination.left + frameLayer.bounds.left * hScale;
        var destinationWidth = frameLayer.bounds.width * hScale;
        var destinationTop = destination.top + frameLayer.bounds.top * vScale;
        var destinationHeight = frameLayer.bounds.height * vScale;    
        
        ctx.drawImage(globalLayer.image, sourceLeft, sourceTop, globalLayer.frameBounds.width, globalLayer.frameBounds.height, 
          destinationLeft, destinationTop, destinationWidth, destinationHeight);
      }
    }
  }
  if (this.logOnce) this.logOnce = false;
};
Animation.prototype.getSpriteWidth = function () {
  if (this.layers[0]) return this.layers[0].frameBounds.width;
  return 1;
};
Animation.prototype.getSpriteHeight = function () {
  if (this.layers[0]) return this.layers[0].frameBounds.height;
  return 1;
};

function Animator(animation, options) {
  this.animation = animation || null;
  this.currentTime = 0;
  this.currentFrame = 0;
  this.isPlaying = true;
  this.isLooping = true;
  this.onAnimationEnd = null;
  
  this.options = Object.assign({
    preserveAspect: false,
    layers: null
  }, options);
}
Animator.prototype.step = function (elapsed) {
  if (this.animation && this.animation.frames.length > 0) {
    if (this.isPlaying) {
      this.currentTime += elapsed;
      
      var currentFrame = -1;
      while (currentFrame === -1) {
        var cumulativeTime = 0;
        for (var i = 0; i < this.animation.frames.length; ++i) {
          cumulativeTime += this.animation.frames[i].time;
          if (this.currentTime < cumulativeTime) {
            currentFrame = i; break;
          }
        }
        if (currentFrame === -1) {
          if (this.isLooping) {
            this.currentTime -= cumulativeTime;
          } else {
            this.isPlaying = false;
            currentFrame = this.animation.frames.length - 1;
          }
          if (typeof this.onAnimationEnd === 'function') {
            this.onAnimationEnd();
          }
        }
      }
      this.currentFrame = currentFrame;
    }
  }
};
Animator.prototype.draw = function (ctx, destination) {
  if (this.animation) {
    this.animation.drawFrame(ctx, destination, this.currentFrame, this.options);
  }
};
Animator.prototype.debugDraw = function (ctx, destination) {
  ctx.strokeStyle = "black";
  ctx.fillStyle = "white";
  var debugText = this.isPlaying + ", " + this.isLooping + ", "+this.currentFrame+" / "+this.currentTime.toFixed(0);
  ctx.fillText(debugText, destination.left, destination.top);
  ctx.strokeText(debugText, destination.left, destination.top);
};
Animator.prototype.setAnimation = function (animation, loop) {
  this.animation = animation;
  this.currentTime = 0;
  this.currentFrame = 0;
  if (loop != null) this.isLooping = loop;
  this.onAnimationEnd = null;
};
Animator.prototype.getAnimation = function () {
  return this.animation;
};
Animator.prototype.play = function () {
  this.isPlaying = true;
  this.onAnimationEnd = null;
};
Animator.prototype.playOnce = function (animation, onEnd) {
  this.animation = animation;
  this.currentTime = 0;
  this.currentFrame = 0;
  this.isPlaying = true;
  this.isLooping = false;
  this.onAnimationEnd = onEnd;
};
Animator.prototype.stop = function () {
  this.isPlaying = false;
  this.onAnimationEnd = null;
};
