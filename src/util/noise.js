
function toColors(noiseBuffer, colorizer) {
  var height = noiseBuffer.length;
  var width = noiseBuffer[0].length;
  var buffer = [];
  
  if (!colorizer) {
    colorizer = function (noiseValue) {
      var node = Math.floor(noiseValue * 255);
      var index = node.toString(16);
      while (index.length < 2) index = '0' + index;
      return '#' + index + index + index;
    };
  }
  
  for (var j = 0; j < height; ++j) {
    buffer[j] = [];
    for (var i = 0; i < width; ++i) {
      buffer[j][i] = colorizer(noiseBuffer[j][i]);
    }
  }
  
  return buffer;
}

function whiteNoise(width, height) {
  var buffer = [];
  
  for (var j = 0; j < height; ++j) {
    buffer[j] = [];
    for (var i = 0; i < width; ++i) {
      buffer[j][i] = Math.random();
    }
  }
  
  return buffer;
}

function smoothNoise(noiseBuffer, octave, interpolate) {  
  var height = noiseBuffer.length;
  var width = noiseBuffer[0].length;
  
  var buffer = [];
  
  var period = Math.pow(2, octave);
  
  if (!interpolate) {
    interpolate = function (start, end, t) {
      return t * end + (1 - t) * start;
    }
  }
  
  for (var j = 0; j < height; ++j) {
    var sample_top = Math.floor(j / period) * period;
    var sample_bottom = (sample_top + period) % height;
    var sample_v_blend = (j - sample_top) / period;
    
    buffer[j] = [];
    for (var i = 0; i < width; ++i) {
      var sample_left = Math.floor(i / period) * period;
      var sample_right = (sample_left + period) % width;
      var sample_h_blend = (i - sample_left) / period;
      
      var corner_top_left = noiseBuffer[sample_top][sample_left];
      var corner_top_right = noiseBuffer[sample_top][sample_right];
      var corner_bottom_left = noiseBuffer[sample_bottom][sample_left];
      var corner_bottom_right = noiseBuffer[sample_bottom][sample_right];
      
      var top_smooth = interpolate(corner_top_left, corner_top_right, sample_h_blend);
      var bottom_smooth = interpolate(corner_bottom_left, corner_bottom_right, sample_h_blend);
      var overall_smooth = interpolate(top_smooth, bottom_smooth, sample_v_blend);
      
      buffer[j][i] = overall_smooth;
    }
  }
  
  return buffer;
}

function valueNoise(noiseBuffer, octaves, persistance, interpolate) {
  if (octaves < 2) return noiseBuffer;
  
  var height = noiseBuffer.length;
  var width = noiseBuffer[0].length;
  
  var buffer = [];
  
  if (persistance === undefined) persistance = 0.5;
  var amplitude = 1;
  var totalAmplitude = 0;
    
  for (var octaveIndex = octaves - 1; octaveIndex >= 0; --octaveIndex) {
    var octaveBuffer = smoothNoise(noiseBuffer, octaveIndex, interpolate);
    amplitude *= persistance;
    totalAmplitude += amplitude;
    
    for (var j = 0; j < height; ++j) {
      if (!buffer[j]) buffer[j] = [];
      
      for (var i = 0; i < width; ++i) {
        if (buffer[j][i] === undefined) buffer[j][i] = 0;
        buffer[j][i] += octaveBuffer[j][i] * amplitude;
      }
    }
  }
  
  for (var j = 0; j < height; ++j) {
    for (var i = 0; i < width; ++i) {
      buffer[j][i] /= totalAmplitude;
    }
  }
  
  return buffer;
}

function glow(width, height, inner_radius, outer_radius) {
  var v_center = height / 2;
  var h_center = width / 2;
  
  var buffer = [];
  
  for (var j = 0; j < height; ++j) {
    buffer[j] = [];
    for (var i = 0; i < width; ++i) {
      var d = Math.sqrt(Math.pow(i - h_center, 2) + Math.pow(j - v_center, 2));
      
      if (d < inner_radius) {
        buffer[j][i] = 1;
      } else if (d > outer_radius) {
        buffer[j][i] = 0;
      } else {
        buffer[j][i] = (outer_radius - d) / (outer_radius - inner_radius);
      }
    }
  }
  
  return buffer;
}

function buffer_add(dest, src) {
  var height = dest.length;
  var width = dest[0].length;
  
  for (var j = 0; j < height; ++j) {
    for (var i = 0; i < width; ++i) {
      dest[j][i] += src[j][i];
    }
  }
    
  return dest;
}

function buffer_subtract(dest, src) {
  var height = dest.length;
  var width = dest[0].length;
  
  for (var j = 0; j < height; ++j) {
    for (var i = 0; i < width; ++i) {
      dest[j][i] -= src[j][i];
    }
  }
  
  return dest;
}

function buffer_clamp(buffer, min, max) {
  return buffer_apply(buffer, function (value) {
    return Math.min(1, Math.max(0, value));
  });
}

function buffer_invert(buffer) {
  return buffer_apply(buffer, function (value) {
    return 1 - value;
  });
}

function buffer_apply(buffer, fn) {
  var height = buffer.length;
  var width = buffer[0].length;
  
  for (var j = 0; j < height; ++j) {
    for (var i = 0; i < width; ++i) {
      buffer[j][i] = fn(buffer[j][i], i, j);
    }
  }
  
  return buffer;
}

function cull(input, startX, startY) {
  var height = input.length;
  var width = input[0].length;
  
  var buffer = [];
  for (var j = 0; j < height; ++j) {
    buffer[j] = [];
    for (var i = 0; i < width; ++i) {
      buffer[j][i] = 0;
    }
  }
  
  var next = [];
  var checked = {};
  
  function check(x,y) {
    if (x < 0) return;
    if (y < 0) return;
    if (x >= width) return;
    if (y >= height) return;
    var cell = y*width + x;
    if (!checked[cell]) {
      next.push(cell);
      checked[cell] = true;
    }
  }
  check(startX,startY);
    
  while (next.length > 0) {
    var nextCell = next.shift();
    var nextX = nextCell % width;
    var nextY = Math.floor(nextCell / width);
    
    if (input[nextY][nextX] === 1) {
      buffer[nextY][nextX] = 1;
      
      check(nextX - 1,nextY);
      check(nextX,nextY - 1);
      check(nextX + 1,nextY);
      check(nextX,nextY + 1);
    }
  }
  
  return buffer;
}