function ParticleSystem() {
  this.emitters = [];
  this.particles = [];
}
ParticleSystem.prototype.step = function (elapsed) {
  this.emitters.forEach(function (emitter) { emitter.step(elapsed); });
  this.particles.forEach(function (particle) { particle.step(elapsed); });
};
ParticleSystem.prototype.draw = function (ctx, camera) {
  this.particles.forEach(function (particle) { particle.draw(ctx, camera); });
};

ParticleSystem.prototype.addEmitter = function () {
  var emitter = new ParticleEmitter(this);
  this.emitters.push(emitter);
  return emitter;
};
ParticleSystem.prototype.addParticle = function (particle) {
  this.particles.push(particle);
};

function ParticleEmitter(parentSystem) {
  this.parentSystem = parentSystem;
  
  this.particles = [];
  this.bounds = new Rectangle();
  
  this.currentTime = 0;
}
ParticleEmitter.prototype.step = function (elapsed) {  
  for (var i = 0; i < this.particles.length; ++i) {
    var particleType = this.particles[i];
    if (this.currentTime < particleType.endTime) {
      if (this.currentTime >= particleType.startTime) {
        var emitTime = particleType.endTime - particleType.startTime;
        var start = Math.ceil((this.currentTime - particleType.startTime) * particleType.amount / emitTime);
        var end = Math.min(this.currentTime - particleType.startTime + elapsed, emitTime) * particleType.amount / emitTime;
        
        for (var p = start; p < end; ++p) {
          this.parentSystem.addParticle(this.emit(particleType));
        }
      }
      
      this.currentTime += elapsed;
    } else {
      this.particles.splice(i,1);
      --i;
    }
  }
};

ParticleEmitter.prototype.addParticles = function (spec, startTime, endTime, amount) {
  this.particles.push({
    spec: spec,
    startTime: startTime,
    endTime: endTime,
    amount: amount,
  });
};
ParticleEmitter.prototype.setBounds = function (left, top, width, height) {
  this.bounds.moveTo(left,top);
  this.bounds.resize(width,height);
};
ParticleEmitter.prototype.debug = function (number) {
  this.debug = number;
};

ParticleEmitter.prototype.emit = function (particleType) {
  var particle = new Particle(particleType.spec);
  particle.moveTo(this.bounds.left + this.bounds.width * Math.random(), this.bounds.top + this.bounds.height * Math.random());
  if (this.debug > 0) {
    --this.debug;
    particle.debug = true;
    console.log(particle);
  }
  return particle;
};



function normalizedRandom(samples) {
  var r = 0;
  for (var i = 0; i < samples; ++i) {
    r += Math.random();
  }
  return r / samples;
}

function pick(options) {
  if (Array.isArray(options)) {
    return options[Math.floor(Math.random()*options.length)];
  }
}

function Particle(spec) {
  this.gravity = 0;  
  this.airResistance = 0;  
  this.direction = 0;
  this.speed = 0;
  this.size = 1;
  
  this.mutators = [];
  
  for (var prop in spec) {
    if (spec.hasOwnProperty(prop)) {
      if (spec[prop].generation) {
        this[prop] = this.generate(spec[prop]);
      }
      if (spec[prop].mutators) {
        this.addMutators(prop, spec[prop].mutators);
      }
    }
  }
  
  if (spec.draw) {
    this._drawFunction = spec.draw;
  }
  
  this.velocity = new Vector(Math.cos(this.direction) * this.speed, -Math.sin(this.direction) * this.speed);
  this.airResistanceForce = new Vector();
  
  this.bounds = new Rectangle(0,0, this.size, this.size);
  this.drawBounds = new Rectangle();
  
  this.age = 0;
}
Particle.prototype.step = function (elapsed) {
  this.bounds.moveBy(this.velocity.x * elapsed, this.velocity.y * elapsed);
  
  for (var i = 0; i < this.mutators.length; ++i) {
    var mutator = this.mutators[i].options;
    if (this.age < mutator.endTime) {
      if (this.age > mutator.startTime) {
        if (this.age + elapsed >= mutator.endTime) {
          this[this.mutators[i].prop] = mutator.endValue;
        } else {
          var t = (this.age - mutator.startTime) / (mutator.endTime - mutator.startTime);
          this[this.mutators[i].prop] = t * mutator.startValue + (1 - t) * mutator.endValue;
        }
      }
    }
  }
  this.age += elapsed;
  
  this.velocity.y += this.gravity * elapsed;

  if (this.airResistance > 0) {
    this.airResistanceForce = this.velocity.normalize(this.airResistanceForce);
    var ar = Math.min(this.velocity.dot(this.velocity) * this.airResistance, this.velocity.magnitude());
    this.airResistanceForce.multiply(-ar, this.airResistanceForce);
    this.velocity.add(this.airResistanceForce, this.velocity);
  }
};
Particle.prototype.draw = function (ctx, camera) {
  this.drawBounds.copyFrom(this.bounds);
  this.drawBounds = camera.screenRect(this.drawBounds, this.drawBounds);
  
  if (this.debug) console.log(this.drawBounds);
  
  if (this._drawFunction) {
    this._drawFunction.call(this, ctx, this.drawBounds);
  }
};

Particle.prototype.generate = function (generator) {
  if (generator.generation === 'const') {
    return generator.value;
  }
  else if (generator.generation === 'select') {
    return pick(generator.options);
  }
  else if (generator.generation === 'random') {
    return generator.minimum + Math.random() * (generator.maximum - generator.minimum);
  }
  else if (generator.generation === 'normalized') {
    return generator.minimum + normalizedRandom(generator.randomSamples) * (generator.maximum - generator.minimum);    
  }
};
Particle.prototype.addMutators = function (prop, mutators) {
  for (var i = 0; i < mutators.length; ++i) {
    this.mutators.push({
      prop: prop,
      options: mutators[i]
    });
  }
};
Particle.prototype.moveTo = function (x,y) {
  this.bounds.moveTo(x,y);
};