var VECTOR_UP = new Vector(0,-1);
var VECTOR_RIGHT = new Vector(1,0);
var VECTOR_DOWN = new Vector(0,1);
var VECTOR_LEFT = new Vector(-1,0);

function calculateMotion(bounds, motion, colliders, out) {
  if (!out) out = new Vector();
  
  var startX = bounds.centerX;
  var startY = bounds.centerY;
  if (!calculateMotion.motionBounds) {
    calculateMotion.motionBounds = new Rectangle(bounds);
  } else {
    calculateMotion.motionBounds.copyFrom(bounds);
  }
  if (!calculateMotion.originalMotion) {
    calculateMotion.originalMotion = new Vector();
  }
  calculateMotion.originalMotion.x = motion.x;
  calculateMotion.originalMotion.y = motion.y;
  
  var motionBounds = calculateMotion.motionBounds;
  motionBounds.moveBy(motion.x, motion.y);
  var endX = motionBounds.centerX;
  var endY = motionBounds.centerY;
  var xHit = false;
  var yHit = false;
  var overlappedColliders = [];
  for (var i = 0; i < colliders.length; ++i) {
    if (motionBounds.intersect(colliders[i].bounds)) {
      if (colliders[i].bounds.normal != null) {
        overlappedColliders.push(colliders[i]);
      } else {
        console.log(colliders[i]);
        motionBounds.moveCenterTo(endX, startY);
        if (motionBounds.intersect(colliders[i].bounds)) { xHit = true; }
        motionBounds.moveCenterTo(startX, endY);
        if (motionBounds.intersect(colliders[i].bounds)) { yHit = true; }
        if (xHit && !yHit) {
          motionBounds.moveCenterTo(startX, endY);
        } else if (!xHit && yHit) {
          motionBounds.moveCenterTo(endX, startY);
        } else if (xHit && yHit) {
          motionBounds.moveCenterTo(startX, startY);
          break;
        }
      }
    }
  }
  
  var consoleOut = false;
  out.x = motionBounds.centerX - startX;
  out.y = motionBounds.centerY - startY;
  calculateMotion.debug = {
    motionBounds: motionBounds,
    collisions: []
  };
  var forces = [];  
  var plots = [];
  for (var i = 0; i < overlappedColliders.length; ++i) {
    if (!calculateMotion.temp) calculateMotion.temp = new Vector();
    var proj = calculateMotion.temp;
    var norm = new Vector(overlappedColliders[i].bounds.normal).normalize();
    
    var projectedBounds = motionBounds.getScalarProjection(norm);
    var intercept = overlappedColliders[i].bounds.intercept(motionBounds.centerX,motionBounds.centerY,norm);
    
    var penetrationDepth = intercept - Math.min.apply(null, projectedBounds);
    if (penetrationDepth > motion.magnitude() * 2) {
      // Figure out a special case
      if (motionBounds.top > overlappedColliders[i].bounds.top && motionBounds.top < overlappedColliders[i].bounds.bottom) {
        proj.x = 1;
        proj.y = 0;
        var interceptTop = overlappedColliders[i].bounds.intercept(motionBounds.left,motionBounds.top,proj);
        if (interceptTop > 0 && interceptTop < motionBounds.width) {
          if (VECTOR_UP.dot(norm) <= 0) {
            plots.push({ x: motionBounds.left + interceptTop, y: motionBounds.top, normal: VECTOR_UP });
          }
        }
      }
      if (motionBounds.right > overlappedColliders[i].bounds.left && motionBounds.right < overlappedColliders[i].bounds.right) {
        proj.x = 0;
        proj.y = 1;
        var interceptRight = overlappedColliders[i].bounds.intercept(motionBounds.right,motionBounds.top,proj);
        if (interceptRight > 0 && interceptRight < motionBounds.height) {
          if (VECTOR_RIGHT.dot(norm) <= 0) {
            plots.push({ x: motionBounds.right, y: motionBounds.top + interceptRight, normal: VECTOR_RIGHT });
          }
        }
      }
      if (motionBounds.bottom > overlappedColliders[i].bounds.top && motionBounds.bottom < overlappedColliders[i].bounds.bottom) {
        proj.x = -1;
        proj.y = 0;
        var interceptBottom = overlappedColliders[i].bounds.intercept(motionBounds.right,motionBounds.bottom,proj);
        if (interceptBottom > 0 && interceptBottom < motionBounds.width) {
          if (VECTOR_DOWN.dot(norm) <= 0) {
            plots.push({ x: motionBounds.right - interceptBottom, y: motionBounds.bottom, normal: VECTOR_DOWN });
          }
        }
      }
      if (motionBounds.left > overlappedColliders[i].bounds.left && motionBounds.left < overlappedColliders[i].bounds.right) {
        proj.x = 0;
        proj.y = -1;
        var interceptLeft = overlappedColliders[i].bounds.intercept(motionBounds.left,motionBounds.bottom,proj);
        if (interceptLeft > 0 && interceptLeft < motionBounds.height) {
          if (VECTOR_LEFT.dot(norm) <= 0) {
            plots.push({ x: motionBounds.left, y: motionBounds.bottom - interceptLeft, normal: VECTOR_LEFT });
          }
        }
      }
      
      consoleOut = true;
    } else {
      var force = new Vector(penetrationDepth * norm.x, penetrationDepth * norm.y);
      
      // Should update this to be better
      // 1. Calculate all forces from either real surfaces or 'plots'
      // 2. Sort by penetration depth
      // 3. Adjust motion using the deepest penetration vector
      // 4. Recalculate the remaining collisions
      
      for (var j = 0; j <= forces.length; ++j) {
        if (j === forces.length) {
          forces.push(force);
          break;
        } else if (penetrationDepth > forces[j].magnitude()) {
          forces.splice(j, 0, force);
          break;
        }
      }
    }
      
    calculateMotion.debug.collisions.push({
      normal: norm,
      projections: projectedBounds.concat(intercept),
      plots: plots,
      penetrationDepth: penetrationDepth
    });
  }
  
  if (forces.length === 0) {
    plots.forEach(function (p) {
      forces.push(p.normal.multiply(-out.magnitude()));
    });
  }
  
  for (var i = 0; i < forces.length; ++i) {
    out.x += forces[i].x;
    out.y += forces[i].y;
  }
  
  if (out.dot(calculateMotion.originalMotion) < 0) {
    var backtracking = out.projectOnto(calculateMotion.originalMotion);
    backtracking.multiply(-1, backtracking);
    out = out.add(backtracking, out);
    
    if (out.dot(calculateMotion.originalMotion) < 0) {
      console.log(out, backtracking, calculateMotion.originalMotion);
    }
  }
  
  return out;
}
