var GameConsole = function (options) {
  this.options = options;
  
  this.baseFontSize = 12;
  this.open = false;
  
  this.contents = '';
  this.candidates = [];
  this.candidatePointer = 0;
  this.arguments = [];
  this.history = [];
  this.historyPointer = -1;
};
GameConsole.prototype.keydown = function (ev) {
  if (!this.open && ev.key === '`') {
    this.open = true;
  }
  else if (this.open) {
    if (ev.key === 'Enter') {
      this.execute();
    }
    else if (ev.key === 'Tab') {
      ev.preventDefault();
      this.autocomplete();
    }
    else if (ev.key === 'Backspace') {
      this.contents = this.contents.slice(0, -1);
      this.filter();
    }
    else if (ev.key === 'Escape') {
      this.contents = '';
      this.open = false;
      this.filter();
    }
    else if (ev.key === 'ArrowUp') {
      if (this.historyPointer < this.history.length - 1) ++this.historyPointer;
      this.contents = this.history[this.historyPointer];
      this.filter();
    }
    else if (ev.key === 'ArrowDown') {
      if (this.historyPointer > 0) --this.historyPointer;
      this.contents = this.history[this.historyPointer];
      this.filter();
    }
    else if (ev.key === 'PageUp') {
      if (this.candidatePointer < this.candidates.length - 1) ++this.candidatePointer;
    }
    else if (ev.key === 'PageDown') {
      if (this.candidatePointer > 0) --this.candidatePointer;
    }
    else if (ev.key.length === 1) {
      this.contents += ev.key;
      this.filter();
    }
  }
};
GameConsole.prototype.keyup = function (ev) {
  
};
GameConsole.prototype.draw = function (ctx) {
  if (this.open) {
    var scale = Math.ceil(Math.max(this.baseFontSize, this.baseFontSize * Game.WIDTH / Game.BASE_WIDTH));
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0,Game.HEIGHT - scale,Game.WIDTH, scale);
    ctx.font = "bold " + scale + "px monospace";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1.5;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(this.contents, 4, Game.HEIGHT - scale);
    ctx.strokeText(this.contents, 4, Game.HEIGHT - scale);
    
    if (this.arguments.length > 0 && this.candidates.length > 0) {
      var prefix = this.arguments.slice(0, -1).join(' ');
      var prefixMetrics = { width: 0 };
      if (prefix.length > 0) {
        prefix += ' ';
        prefixMetrics = ctx.measureText(prefix);
      }
      var head = this.arguments[this.arguments.length - 1];
      var headMetrics = ctx.measureText(head);
      
      for (var i = 0; i < this.candidates.length; ++i) {
        ctx.fillStyle = "white";
        ctx.fillText(prefix + head, 4, Game.HEIGHT - scale * (i + 2));
        if (i === this.candidatePointer) {
          ctx.fillStyle = "#00cc00";
        } else {
          ctx.fillStyle = "#666666";
        }
        ctx.fillText(this.candidates[i].slice(head.length), 4 + prefixMetrics.width + headMetrics.width, Game.HEIGHT - scale * (i + 2));
        ctx.strokeText(prefix + this.candidates[i], 4, Game.HEIGHT - scale * (i + 2));
      }
    }
  }
};
GameConsole.prototype.execute = function () {
  var func = this.options.commands[this.arguments[0]];
  var funcArguments = this.arguments.slice(1);
  if (func) func.execute.apply(null, funcArguments);
  this.history.unshift(this.contents);
  this.historyPointer = -1;
  this.contents = '';
  this.open = false;
  this.filter();
};
GameConsole.prototype.autocomplete = function () {
  if (this.candidates.length > 0) {
    if (this.arguments.length > 1) {
      this.contents = this.arguments.slice(0,-1).join(' ')+ ' ' + this.candidates[this.candidatePointer] + ' ';
    } else {
      this.contents = this.candidates[this.candidatePointer] + ' ';
    }
    this.filter();
  }
};
GameConsole.prototype.clearFilter = function () {
  this.candidates = [];
  this.arguments = [];
  this.candidatePointer = 0;
};
GameConsole.prototype.getFilteredCommands = function () {
  var filterText = this.arguments[0];
  var commandList = Object.keys(this.options.commands);
  return runFilterOnOptionsList(commandList, filterText);
};
GameConsole.prototype.runFilterOnOptionsList = function (options, filterText) {
  if (filterText.length > 0) {
    return options.filter(function (command) {
      return command.toLowerCase().startsWith(filterText.toLowerCase());
    });
  } else {
    return options;
  }
};
GameConsole.prototype.getOptionsForArgument = function (argumentOption, filterText) {
  var computedOptions = [];
  if (Array.isArray(argumentOption)) {
    computedOptions = argumentOption;
  } else if (typeof argumentOption === 'function') {
    computedOptions = argumentOption(this.arguments, filterText);
  }
  return computedOptions;
};
GameConsole.prototype.getArgumentOptionsForCommand = function (command, argumentIndex, filterText) {
  if (command) {
    if (Array.isArray(command.argumentOptions)) {
      var indexArgumentOptions = command.argumentOptions[argumentIndex];
      return this.getOptionsForArgument(indexArgumentOptions, filterText);
    } else if (typeof command.argumentOptions === 'function') {
      return command.argumentOptions(this.arguments, filterText) || [];
    }
  }
  return [];
};
GameConsole.prototype.getArgumentIndex = function () {
  return this.arguments.length - 1;
};
GameConsole.prototype.getFilterText = function () {
  return this.arguments[this.getArgumentIndex()];
};
GameConsole.prototype.getSelectedCommand = function () {
  return this.options.commands[this.arguments[0]];
};
GameConsole.prototype.getAllCommandNames = function () {
  return Object.keys(this.options.commands);
};
GameConsole.prototype.filter = function () {
  var filterText = '';
  if (this.contents.length < 1) {
    this.clearFilter();
  } else {
    this.arguments = this.contents.split(' ');
    var commandIndex = this.getArgumentIndex();
    var currentCandidate = this.candidates[this.candidatePointer];
    filterText = this.getFilterText();
    if (commandIndex === 0) {
      this.candidates = this.runFilterOnOptionsList(this.getAllCommandNames(), filterText);
    } else {
      var argumentOptions = this.getArgumentOptionsForCommand(this.getSelectedCommand(), commandIndex - 1, filterText);
      this.candidates = this.runFilterOnOptionsList(argumentOptions, filterText);
    }
    
    this.candidatePointer = this.candidates.findIndex(function (candidate) {
      return candidate === currentCandidate;
    });
    if (this.candidatePointer < 0) this.candidatePointer = 0;
  }
  if (this.options.onFilter) this.options.onFilter(this.arguments, filterText);
};
GameConsole.prototype.process = function (commandString) {
  this.contents = commandString;
  this.filter();
  this.execute();
};
