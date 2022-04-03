function AudioObject(audioBuffer, parentCollection) {
  this.parentCollection = parentCollection;
  this.buffer = audioBuffer;
  this.sources = [];
}
AudioObject.prototype.play = function (options) {
  var _self = this;
  if (this.buffer && this.sources.length < 4) {
    var source = this.parentCollection.audioContext.createBufferSource();
    var playOptions = Object.assign({},this.parentCollection.defaults,options);
    source.buffer = this.buffer;
    source.connect(this.parentCollection.gainNode);
    source.connect(this.parentCollection.audioContext.destination);
    source.loop = playOptions.loop;
    if (options.detune !== undefined) {
      source.detune.value = options.detune;
    }
    source.addEventListener('ended', function () {
      _self.sources.splice(_self.sources.indexOf(source), 1);
      if (_self.sources.length <= 0) _self.isPlaying = false;
    });
    this.sources.push(source);
    source.start(0);
    
    this.isPlaying = true;
  }
};
AudioObject.prototype.stop = function () {
  if (this.sources.length > 0) {
    this.isPlaying = false;
    this.sources.forEach(function (s) { s.stop(); });
    this.sources = [];
  }
};

function AudioCollection(options) {
  this.isMuted = false;
  this.__buffers = [];
  this.defaults = options.defaults;
  this.name = options.collectionName;
}
AudioCollection.prototype.init = function (audioContext) {
  this.audioContext = audioContext;
  
  this.gainNode = audioContext.createGain();
  this.gainNode.connect(audioContext.destination);
  this.gainNode.gain.value = 0;
  
  this.muteSettingName = Game.NAMESPACE + '.' + this.name + '.mute';
  
  try {
    if (localStorage.getItem(this.muteSettingName) === 'true') this.mute();
    else this.unmute();
  } catch (ex) {
    this.unmute();
  }
};
AudioCollection.prototype.load = function (loader, path) {
  var _self = this;
  return loader.register(path, "arraybuffer", function (data, callback) {
    _self.audioContext.decodeAudioData(data)
      .then(function (audioBuffer) {    
        console.log(audioBuffer);
        var audioObject = new AudioObject(audioBuffer, _self);          
        _self.__buffers.push(audioObject);
        callback(audioObject);
      })
      .catch(function (error) {
        console.error("Could not decode audio data: ", error);
        var audioObject = new AudioObject(null, _self);             
        _self.__buffers.push(audioObject);
        callback(audioObject);
      });
  });
};
AudioCollection.prototype.play = function (audioObject, options) {
  console.log(audioObject);
  audioObject.play(options);
};
AudioCollection.prototype.stop = function (audioObject) {
  audioObject.stop();
};
AudioCollection.prototype.stopAll = function () {
  this.__buffers.forEach(function (buffer) { buffer.stop(); });
};
AudioCollection.prototype.mute = function () {
    this.isMuted = true;
    this.gainNode.gain.linearRampToValueAtTime(-1,this.audioContext.currentTime + 0.25);
    try {
      localStorage.setItem(this.muteSettingName, true);
    } catch (ex) {
      console.error('Error saving mute status: ',ex);
    }
};
AudioCollection.prototype.unmute = function () {
    this.isMuted = false;
    this.gainNode.gain.linearRampToValueAtTime(0,Game.audioContext.currentTime + 0.25);
    try {
      localStorage.setItem(this.muteSettingName, false);
    } catch (ex) {
      console.error('Error saving mute status: ',ex);
    }
    this.audioContext.resume();
};

var SOUND = new AudioCollection({
  defaults: { loop: false },
  collectionName: 'sound',
});
var MUSIC = new AudioCollection({
  defaults: { loop: true },
  collectionName: 'music',
});