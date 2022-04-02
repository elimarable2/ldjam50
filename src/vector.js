function Vector(x,y) {
  if (x instanceof Vector) {
    this.copyFrom(x);
  } else {
    this.x = x || 0;
    this.y = y || 0;
  }
}
Vector.prototype.copyFrom = function (other) {
  this.x = other.x;
  this.y = other.y;
};
Vector.prototype.add = function (other, out) {
  if (!out) out = new Vector();
  out.x = this.x + other.x;
  out.y = this.y + other.y;
  return out;
};
Vector.prototype.multiply = function (scalar, out) {
  if (!out) out = new Vector();
  out.x = this.x * scalar;
  out.y = this.y * scalar;
  return out;
};
Vector.prototype.projectOnto = function (other, out) {
  if (!out) out = new Vector();
  var scale = this.dot(other) / other.dot(other);
  out.x = scale * other.x;
  out.y = scale * other.y;
  return out;
};
Vector.prototype.getScalarProjection = function (other) {
  var scale = this.dot(other) / other.dot(other);
  var squareDistance = scale * scale * other.dot(other);
  var signPositive = scale > 0;
  return Math.sqrt(squareDistance) * (signPositive ? 1 : -1);
};
Vector.prototype.normalize = function (out) {
  if (!out) out = this;
  var scale = 1 / this.magnitude();
  out.x = scale * this.x;
  out.y = scale * this.y;
  return out;
};
Vector.prototype.magnitude = function () {
  return Math.sqrt(this.dot(this));
};
Vector.prototype.dot = function (other) {
  return this.x * other.x + this.y * other.y;
}

function Surface(x1,y1,x2,y2) {
  this.startX = x1;
  this.startY = y1;
  this.endX = x2;
  this.endY = y2;
  var dx = this.endX - this.startX;
  var dy = this.endY - this.startY;
  var m = Math.sqrt(dx*dx+dy*dy);  
  this.normal = new Vector(-(this.endY - this.startY) / m, (this.endX - this.startX) / m);
  
  if (this.startX !== this.endX) {
    this.fSlope = (this.endY - this.startY) / (this.endX - this.startX);
    this.fIntercept = this.startY - this.fSlope * this.startX;
  }  
  
  this.left = Math.min(this.startX, this.endX);
  this.right = Math.max(this.startX, this.endX);
  this.top = Math.min(this.startY, this.endY);
  this.bottom = Math.max(this.startY, this.endY);
}
Surface.prototype.isPointAbove = function (x,y) {
  var pivot = this.fSlope * x + this.fIntercept;
  return y > pivot;
};
Surface.prototype.intersect = function (other) {
  if (other instanceof Circle) {
    // return other.intersect(this);
    return false;
  }
  if (other instanceof Rectangle) {
    if (this.left <= other.right &&
        this.right >= other.left &&
        this.top <= other.bottom &&
        this.bottom >= other.top) {
      // Vertical and horizontal lines can be simply checked by AABB
      if (this.top === this.bottom || this.left === this.right) return true;
      // We know the bounding boxes intersect, how can we find out if the lines themselves intersect?
      var above = this.isPointAbove(other.left, other.top);
      if (this.isPointAbove(other.right, other.top) !== above) return true;
      if (this.isPointAbove(other.left, other.bottom) !== above) return true;
      if (this.isPointAbove(other.right, other.bottom) !== above) return true;
    }
  }
  return false;
};
Surface.prototype.intercept = function (originX,originY,vector) {
  if (this.fSlope != null) {
    if (vector.x === 0) {
      return (this.fSlope * originX + this.fIntercept - originY) / vector.y;
    } else {
      var m = vector.y / vector.x;
      var ix = (originY - this.fIntercept - m * originX) / (this.fSlope - m);
      return (ix - originX) / vector.x;
    }
  } else {
    if (vector.x === 0) {
      return null;
    } else {
      return (this.left - originX) / vector.x;
    }
  }
};