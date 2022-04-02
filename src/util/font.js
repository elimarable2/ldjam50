function Font() {
  console.log("new Font");
  this.baseCharWidth = 100;
  this.baseCharHeight = 100;
  this.range = 33;
  this.charWidths = [];
  this.spaceWidth = 100;
  this.debug = {
    background: false
  };
}
Font.prototype.load = function (data) {
  console.log("Font.prototype.load", data);
  this.baseCharWidth = data.baseCharWidth;
  this.baseCharHeight = data.baseCharHeight;
  this.range = data.range;
  for (var i = 0; i < data.charWidths.length; ++i) {
    this.charWidths[i + this.range] = data.charWidths[i];
  }
  if (data.spaceWidth) this.spaceWidth = data.spaceWidth;
};
Font.prototype.awaitSprite = function (spriteKey, callback) {
  console.log("Font.prototype.awaitSprite", spriteKey);
  return callback(this);
};
Font.prototype.serialize = function () {
  return {
    baseCharWidth: this.baseCharWidth,
    baseCharHeight: this.baseCharHeight,
    range: this.range,
    charWidths: this.charWidths.slice(this.range),
    spaceWidth: this.spaceWidth,
  };
};

Font.prototype.draw = function (ctx, x, y, text, scale) {  
  if (scale == undefined) scale = 1;

  var xOffset = 0;
  var yOffset = 0;
  for (var i = 0; i < text.length; ++i) {
    var code = text.charCodeAt(i);
    if (code === 10) {
      xOffset = 0;
      yOffset += this.baseCharHeight * scale;
    } else {
      var frame = code - this.range;
      var sx = Math.floor(frame % 13) * this.baseCharWidth;
      var sy = Math.floor(frame / 13) * this.baseCharHeight;
      var charWidth = code === 32 ? this.spaceWidth : (this.charWidths[code] || this.baseCharWidth);
      
      if (this.debug.background) {
        if (i % 2 === 0) {
          ctx.fillStyle = 'rgba(255,0,0,0.33)';
        } else {
          ctx.fillStyle = 'rgba(0,0,255,0.33)';
        }
        ctx.fillRect(x + xOffset, y, charWidth, this.baseCharHeight);
      }
      
      ctx.drawImage(Game.images.font.get(), sx, sy, this.baseCharWidth, this.baseCharHeight, x + xOffset, y + yOffset, this.baseCharWidth * scale, this.baseCharHeight * scale);
      xOffset += charWidth * scale;
    }
  }
};
Font.prototype.measureWidth = function (text, scale) {
  if (scale == undefined) scale = 1;
  
  var xOffset = 0;
  var totalWidth = 0;
  for (var i = 0; i < text.length; ++i) {
    var code = text.charCodeAt(i);
    if (code === 10) {
      xOffset = 0;
    } else {
      var charWidth = code === 32 ? this.spaceWidth : (this.charWidths[code] || this.baseCharWidth);
            
      xOffset += charWidth * scale;
      totalWidth = Math.max(totalWidth, xOffset);
    }
  }
  return totalWidth;
};
Font.prototype.measureHeight = function (text, scale) {
  if (scale == undefined) scale = 1;
  
  var totalHeight = this.baseCharHeight * scale;
  for (var i = 0; i < text.length; ++i) {
    var code = text.charCodeAt(i);
    if (code === 10) {
      totalHeight += this.baseCharHeight * scale;
    }
  }
  return totalHeight;
};
