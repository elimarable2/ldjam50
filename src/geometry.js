function Rectangle(left,top,width,height) {
  if (left instanceof Rectangle) {
    this.copyFrom(left);
  } else {
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
    this.right = left + width;
    this.bottom = top + height;
    this.centerX = left + width / 2;
    this.centerY = top + height / 2;
  }
}
Rectangle.prototype.copyFrom = function (other) {
  this.left = other.left;
  this.top = other.top;
  this.width = other.width;
  this.height = other.height;
  this.right = other.right;
  this.bottom = other.bottom;
  this.centerX = other.centerX;
  this.centerY = other.centerY;
};
Rectangle.prototype.union = function(other) {
  this.left = Math.min(this.left, other.left);
  this.top = Math.min(this.top, other.top);
  this.right = Math.max(this.right, other.right);
  this.bottom = Math.max(this.bottom, other.bottom);
  this.width = this.right - this.left;
  this.height = this.bottom - this.top;
  this.centerX = (this.left + this.right) / 2;
  this.centerY = (this.top + this.bottom) / 2;
};
Rectangle.prototype.moveTo = function (left, top) {
  this.left = left;
  this.top = top;
  this.right = left + this.width;
  this.bottom = top + this.height;
  this.centerX = left + this.width / 2;
  this.centerY = top + this.height / 2;
};
Rectangle.prototype.moveCenterTo = function (x, y) {
  this.centerX = x;
  this.centerY = y;
  this.left = x - this.width / 2;
  this.top = y - this.height / 2;
  this.right = this.left + this.width;
  this.bottom = this.top + this.height;
};
Rectangle.prototype.moveBy = function (x, y) {
  this.left += x;
  this.top += y;
  this.right += x;
  this.bottom += y;
  this.centerX += x;
  this.centerY += y;
};
Rectangle.prototype.resize = function (width, height) {
  this.width = width;
  this.height = height;
  this.right = this.left + width;
  this.bottom = this.top + height;
  this.centerX = this.left + width / 2;
  this.centerY = this.top + height / 2;
};
Rectangle.prototype.resizeCentered = function (width, height) {
  this.width = width;
  this.height = height;
  this.left = this.centerX - width / 2;
  this.top = this.centerY - height / 2;
  this.right = this.left + width;
  this.bottom = this.top + height;
};
Rectangle.prototype.resizeBy = function (x, y) {
  if (y == null) y = x;
  this.width = x * this.width;
  this.height = y * this.height;
  this.right = this.left + this.width;
  this.bottom = this.top + this.height;
  this.centerX = this.left + this.width / 2;
  this.centerY = this.top + this.height / 2;
};
Rectangle.prototype.intersect = function (other) {
  if (other instanceof Circle) {
    return other.intersect(this);
  }
  if (other instanceof Surface) {
    return other.intersect(this);
  }
  if (other instanceof Rectangle) {
    return this.left <= other.right &&
        this.right >= other.left &&
        this.top <= other.bottom &&
        this.bottom >= other.top;
  }
  return false;
};
Rectangle.prototype.contains = function (x,y) {
  return this.left <= x &&
      this.right > x &&
      this.top <= y &&
      this.bottom > y;
};
Rectangle.prototype.getScalarProjection = function (vector) {
  if (!this.temp) this.temp = new Vector();
    this.temp.x = this.left - this.centerX;
    this.temp.y = this.top - this.centerY;
    var corner1 = this.temp.getScalarProjection(vector);
    this.temp.x = this.right - this.centerX;
    this.temp.y = this.top - this.centerY;
    var corner2 = this.temp.getScalarProjection(vector);
    this.temp.x = this.left - this.centerX;
    this.temp.y = this.bottom - this.centerY;
    var corner3 = this.temp.getScalarProjection(vector);
    this.temp.x = this.right - this.centerX;
    this.temp.y = this.bottom - this.centerY;
    var corner4 = this.temp.getScalarProjection(vector);
    return [corner1, corner2, corner3, corner4];
};
Rectangle.prototype.serialize = function () {
  return {
    left: this.left,
    top: this.top,
    width: this.width,
    height: this.height
  };
};
Rectangle.deserialize = function (data) {
  return new Rectangle(data.left, data.top, data.width, data.height);
};

function Circle(x,y,radius) {
  if (x instanceof Circle) {
    this.copyFrom(x);
    this.radius = x.radius;
  } else {
    Rectangle.call(this,x - radius, y - radius, radius * 2, radius * 2);
    this.radius = radius;
  }
}
Circle.prototype = new Rectangle;
Circle.prototype.resize = function (radius) {
  this.radius = radius;
  this.width = 2 * radius;
  this.height = 2 * radius;
  this.left = this.centerX - radius;
  this.top = this.centerY - radius;
  this.right = this.centerX + radius;
  this.bottom = this.centerY + radius;
}
Circle.prototype.intersect = function (other) {
  if (other instanceof Circle) {
    var totalRadius = this.radius + other.radius;
    var dx = other.centerX - this.centerX;
    var dy = other.centerY - this.centerY;
    return dx*dx + dy*dy <= totalRadius * totalRadius;
  }
  if (other instanceof Rectangle) {
    var radiusSquared = this.radius * this.radius;
    var dx, dy;
    // INSIDE
    if (other.contains(this.centerX, this.centerY)) return true;
    // LEFT EDGE
    dx = other.left - this.centerX;
    dy = Math.min(Math.max(this.centerY, other.top), other.bottom) - this.centerY;
    if (dx*dx + dy*dy <= radiusSquared) return true;
    // TOP EDGE
    dx = Math.min(Math.max(this.centerX, other.left), other.right) - this.centerX;
    dy = other.top - this.centerY;
    if (dx*dx + dy*dy <= radiusSquared) return true;
    // RIGHT EDGE
    dx = other.right - this.centerX;
    dy = Math.min(Math.max(this.centerY, other.top), other.bottom) - this.centerY;
    if (dx*dx + dy*dy <= radiusSquared) return true;
    // BOTTOM EDGE
    dx = Math.min(Math.max(this.centerX, other.left), other.right) - this.centerX;
    dy = other.bottom - this.centerY;
    if (dx*dx + dy*dy <= radiusSquared) return true;
    return false;
  }
  return false;
};
