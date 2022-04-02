var theme = {
  color: {
    primary: {
      highlight: '#ffffff',
      main: '#00ff00',
      shadow: '#008000',
      text: '#000000',
    }
  }
};

function getTheme() { return theme; }

function Button(x,y,text, color) {
	this.x = x;
	this.y = y;
	this.width = 128;
	this.height = 32;
	this.text = text;
  if (color) this.color = color;
  else this.color = getTheme().color.primary;
  
  this.shine = 0;
}
Button.prototype.step = function (elapsed) {
  if (this.hover) {
    this.shine = Math.min(1,this.shine + elapsed / 200);
  } else {
    this.shine = Math.max(0,this.shine - elapsed / 200);
  }
}
Button.prototype.mousemove = function (x,y) {
	if (x > this.x && x < this.x + this.width &&
		y > this.y && y < this.y + this.height) {
		this.hover = true;
	} else {
		this.hover = false;
	}	
}
Button.prototype.draw = function (ctx) {
  var halfWidth = this.width / 2;
  
  if (!this.gradient || this.shine !== this.prevShine) {
    this.gradient = ctx.createLinearGradient(
      this.x - halfWidth + this.shine * this.width,
      this.y,
      this.x + halfWidth + this.shine * this.width,
      this.y+this.height);
    this.gradient.addColorStop(0,this.color.highlight);
    this.gradient.addColorStop(0.5,this.color.main);
    this.gradient.addColorStop(1,this.color.shadow);
    this.prevShine = this.shine;
  }
    
	ctx.globalAlpha = 1;
	ctx.beginPath();
	ctx.strokeStyle = this.color.shadow;
	ctx.fillStyle = this.gradient;
  ctx.lineWidth = 1;
	ctx.rect(this.x+0.5,this.y+0.5,this.width,this.height);
	ctx.fill();
	ctx.stroke();

	ctx.fillStyle = this.color.text;
	ctx.font = "bold 12pt sans-serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(this.text, this.x+halfWidth, this.y+this.height / 2);
}