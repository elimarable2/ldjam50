
function toColors(noiseBuffer, colorizer) {
  var height = noiseBuffer.length;
  var width = noiseBuffer[0].length;
  var buffer = [];
  
  if (!colorizer) {
    colorizer = function (noiseValue) {
      var node = Math.floor(noiseValue * 256);
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