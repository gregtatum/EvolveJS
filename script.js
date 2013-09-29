var Evo = (function () {

	var self = {
		
		onInit : function () {
			self.defineConsole();
		},
		
		//Make sure console is defined
		defineConsole : function() {
			if (typeof window.console === 'undefined') window.console = {};
			if (typeof window.console.log === 'undefined') window.console.log = function() {};
			if (typeof window.console.debug === 'undefined') window.console.debug = function() {};
			if (typeof window.console.info === 'undefined') window.console.info = function() {};
			if (typeof window.console.warn === 'undefined') window.console.warn = function() {};
			if (typeof window.console.error === 'undefined') window.console.error = function() {};
		},
		
		//Run onInit and default handlers on passed object
		init : function(object) {
			
			if(typeof object === "object") {
				
				if(typeof object.onInit === 'function') {
					object.onInit();
				}
				
				if(typeof object.onReady === 'function') {
					$(document).ready(object.onReady);
				}
				
				if(typeof object.onPageShow === 'function') {
					$(document).on('pageshow.Evo', object.onPageShow);
				}
			}
			
		}
	}
	self.init(self);
	return self;
})();

Evo.canvas;
Evo.context;

Evo.Loop = (function() {
	
	//Private Variables
	var _$canvas,
		_animationFrame,
		
		//Listeners
		_updateListeners = [],
		_drawListeners = [],
		_updateLength,
		_drawLength,
		_uI = 0, //Iterators
		_dI = 0,
		
		//Timing
		_timePresent = 0,
		_timePast = 0,
		_dt = 0;
	
	//Public Methods
	var self = {
		
		onInit : function() {
			_animationFrame = window.requestAnimationFrame	||
				window.webkitRequestAnimationFrame			||
				window.mozRequestAnimationFrame   			||
				window.oRequestAnimationFrame				||
				window.msRequestAnimationFrame				||
				function( callback ){
					window.setInterval(callback, 1000.0/60.0);
				};
		},
		
		onReady : function() {
			Evo.Canvas.init();
			self.start();
		},
		
		//-------------------------------------
		// Registration Functions
		
		registerUpdate : function(listener) {
			_updateListeners.push(listener);
			_updateLength = _updateListeners.length;
		},
		
		registerDraw : function(listener) {
			_drawListeners.push(listener);
			_drawLength = _drawListeners.length;
		},
        
        removeUpdate : function(listener) {
            var index = _updateListeners.indexOf(listener);
            if(index >= 0) {
                _updateListeners.splice(index,1);
            }
        },
        
        removeDraw : function(listener) {
            var index = _drawListeners.indexOf(listener);
            if(index >= 0) {
                _drawListeners.splice(index,1);
            }
        },
		
		//-------------------------------------
		// Looping functions
		
		updateTime : function() {
			_timePresent = new Date().getTime();
			_dt = _timePresent - _timePast;
			_timePast = _timePresent;
		},
		
		runUpdateListeners : function() {
			for(_uI = 0; _uI < _updateLength; ++_uI) {
				_updateListeners[_uI].update(_dt);
			}
		},
		
		runDrawListeners : function() {
			for(_dI = 0; _dI < _drawLength; ++_dI) {
				_drawListeners[_dI].draw(_dt);
			}
		},
		
		//Looping logic
		run : function() {
			_animationFrame(self.run, Evo.canvas);
			
			self.updateTime();
			self.runUpdateListeners(_dt);
			Evo.context.clearRect(0,0,Evo.canvas.width,Evo.canvas.height);
			self.runDrawListeners(_dt);
		},
		
		start : function() {
			_timePast = new Date().getTime();
			self.run();	
		}
	};
	
	Evo.init(self);
	return self;
})();

Evo.Canvas = (function() {
	
	//Public Methods
	var self = {
		
		init : function() {
			
			Evo.canvas = $('canvas').get(0);
			Evo.canvas.width = $(window).width();
			Evo.canvas.height = $(window).height();
			Evo.context = Evo.canvas.getContext('2d');
			
			$(window).on('resize', self.resize);
		},
		
		resize : function() {
			Evo.canvas.width = $(window).width();
			Evo.canvas.height = $(window).height();	
		}
	};
	
	return self;
})();

Evo.Mouse = (function() {
	
	var _position;
	
	//Public Methods
	var self = {
		
		onReady : function() {
			 _position = new Evo.Vector(-10000, -10000)
			 
            document.addEventListener('mousemove', self.onMouseMove);
            document.addEventListener('touchmove', self.onTouchMove);
            document.addEventListener('touchend', self.onTouchEnd);
            
            document.ontouchstart = function(e){ 
                e.preventDefault(); 
            }
		},
		
		onMouseMove : function(e) {
			if(typeof(e.pageX) == "number") {
				_position.x = e.pageX;
				_position.y = e.pageY;
            } else {
				_position.x = -100000;
				_position.y = -100000;
			}
		},
        
        onTouchMove : function(e) {
            if(e.touches) {
                _position.x = e.touches[0].pageX;
				_position.y = e.touches[0].pageY;                
            }
        },
        
        onTouchEnd : function(e) {
            _position.x = -100000;
            _position.y = -100000;
        },
        
		getPosition : function() {
			return _position;
		},
		
		getX : function() {
			return _position.x;
		},
		
		getY : function() {
			return _position.y;
		}
	};
	
	Evo.init(self);
	return self;
})();

Evo.CellFactory = (function() {
	
	var _numberOfCells = 10,
        _cells = new Array(),
        _maxCells = 1500;
	
	//Public Methods
	var self = {
		
		onReady : function() {
            self.generateCells();
            $(Evo.canvas).click(self.killCells);
		},
		
		//-------------------------------------
		// Registration Functions
		
		update : function(dt) {
		
		},
		
		draw : function(dt) {
			
		},
        
        generateCells : function() {
            var cell;
            
			for(var i=0; i < _numberOfCells; i++) {
                cell = new Evo.Cell(Evo.canvas.width * Math.random(), Evo.canvas.height * Math.random());
                cell.generateDna();
				self.animateCell(cell);
				_cells.push(cell);
				cell.i = i; //for debug
			}
        },
        
        killCells : function() {
            for(var i in _cells) {
                _cells[i].kill();
            }
            _cells.length = 0;
            
            self.generateCells();
        },
		
		animateCell : function(cell) {
			
			cell.stateMachine.add(new Evo.States.Roam(cell));
			cell.stateMachine.add(new Evo.States.FleeMouse(cell, cell.dna.fleeSpeed, cell.dna.fleeDistance));
			cell.stateMachine.add(new Evo.States.GrowAndDivide(cell, cell.dna.growthRate, cell.dna.divideSize));
			
		},
		
        divideCell : function(cell) {
            if(_cells.length > _maxCells) return;
            
            //Copy the cell
            daughterCell = new Evo.Cell(cell.position.x, cell.position.y);
            daughterCell.copyDna(cell.dna);
            
            //Revert to children
            cell.revert();
            daughterCell.revert();
			self.animateCell(daughterCell);
            
            _cells.push(daughterCell);
        }
	};
	
	Evo.init(self);
	return self;
})();

Evo.Cell = (function() {
	
	var self = function(x,y) {
		
		this.position = new Evo.Vector(x,y);
		
		this.weightedDirection = new Evo.Vector(0,0);
		
		this.weightedSpeed = {
			speed 	: 0,
			weight	: 0,
		};
		
		this.stateMachine = new Evo.StateMachine();
		
		Evo.Loop.registerDraw(this);
		Evo.Loop.registerUpdate(this);
	};
	
	self.prototype = {
		kill : function() {
			Evo.Loop.removeDraw(this);
			Evo.Loop.removeUpdate(this);
		},
		
		revert : function() {
			this.size = (this.dna.birthSize / 2) + (this.dna.birthSize / 2) * Math.random();
		},
		
		generateDna : function() {
			var brightness = 200,
				birthSize = 7 * Math.random() + 3;
			
			this.dna = {
				fleeSpeed       :   1000 * Math.random() + 500,
				fillStyle       :   Evo.Worker.rgbToFillstyle(
										parseInt(Math.random() * brightness),
										parseInt(Math.random() * brightness),
										parseInt(Math.random() * brightness)
									),
				fleeSpeed       :   1000 * Math.random() + 500,
				fleeDistance    :   (150 * Math.random()) + 180,
				birthSize       :   birthSize,
				growthRate      :   .005 * Math.random(),
				divideSize      :   birthSize * 2.5
			}
			
			this.revert();
		},
		
		copyDna : function(dnaRef) {
			this.dna = $.extend({}, dnaRef);
		},
		
		addWeightedDirection : function(vector, weight) {			
			vector.multiply(weight);
			this.weightedDirection.add(vector);			
		},
		
		addWeightedSpeed : function(speed, weight) {
			this.weightedSpeed.speed  += (speed * weight);
			this.weightedSpeed.weight += weight;
		},
		
		draw : function(dt) {
			Evo.context.beginPath();
			Evo.context.fillStyle = this.dna.fillStyle;
			Evo.context.fillRect(this.position.x, this.position.y, this.size, this.size);
			Evo.context.fill();
		},
		
		//Updates
		
		update : function(dt) {
			
			this.stateMachine.update(dt);
			this.update_position(dt);
			this.update_keepOnScreen(dt);
		},
		
		update_position : function(dt) {
			
			this.weightedDirection.normalize();
			
			if(this.weightedSpeed.weight > 0) {
				this.weightedSpeed.speed = this.weightedSpeed.speed / this.weightedSpeed.weight;
			}
			
			this.position.add(
				Evo.VMath.multiply(this.weightedDirection, dt * this.weightedSpeed.speed)
			);
			
			this.weightedDirection.x = 0;
			this.weightedDirection.y = 0;
			this.weightedSpeed.speed = 0;
			this.weightedSpeed.weight = 0;
			
		},
		
		update_keepOnScreen : function(dt) {
			if(this.position.x < this.size * -1) {this.position.x = Evo.canvas.width  + this.size;}
			if(this.position.y < this.size * -1) {this.position.y = Evo.canvas.height + this.size;}
			if(this.position.x > Evo.canvas.width + this.size) {this.position.x = 0 - this.size;}
			if(this.position.y > Evo.canvas.height + this.size) {this.position.y = 0 - this.size;}
		}
	};
	
	return self;
})();

//Collection of worker functions
Evo.Worker = (function() {
	
	//Public Methods
	var self = {
		
		rgbToFillstyle : function(r, g, b, a) {
            if(a === undefined) {
                return ["rgb(",r,",",g,",",b,")"].join('');
            } else {
                return ["rgba(",r,",",g,",",b,",",a,")"].join('');
            }
		}
 
	};
	
	return self;
})();

Evo.StateMachine = (function() {
	
	var self = function() {
		this.currentStates = [];
	};
	
	self.prototype.update = function(dt) {
		for(var i in this.currentStates) {
			this.currentStates[i].update(dt);
		}
	};
	
	self.prototype.add = function(state) {
		if(this.currentStates.indexOf(state) >= 0) return; //Do not add twice
		state.onAdd();
		this.currentStates.push(state);
	};
	
	self.prototype.remove = function(state) {
		var index = this.currentStates.indexOf(state);
		if(index >= 0) {
			this.currentStates[index].onRemove();
			this.currentStates.splice(index,1);
		}
	};
	
	self.prototype.has = function(state) {
		return this.currentStates.indexOf(state) >= 0;
	};
	
	return self;
})();

Evo.States = {};

Evo.States.Roam = (function() {
	
	var self = function(actor) {
		this.actor = actor;
		
		this.speed = 0.05;
		this.direction = new Evo.Vector(
			(Math.random() * 2) - 1,
			(Math.random() * 2) - 1
		);
		
	};
	
	self.prototype.update = function() {
		this.actor.addWeightedDirection(this.direction, 1);
		this.actor.addWeightedSpeed(this.speed, 1);
	}
	self.prototype.onAdd = function() {
		
	}
	self.prototype.onRemove = function() {
		
	}
	
	return self;
})();

Evo.States.FleeMouse = (function() {
	
	var self = function(actor, fleeSpeed, fleeDistance) {
		this.actor = actor;
		
		this.direction;
		this.distanceToMouse = 0.0;
		this.speed = 0.0;
		this.weight = 2;
		this.fleeSpeed = fleeSpeed;
		this.fleeDistance = fleeDistance;
		
		this.currentWeight;
		
		this.prevDirection = new Evo.Vector(0,0);
		this.prevSpeed = 0.0;
		this.interpolationAmount = 1.0;
	};
	
	self.prototype.update = function(dt) {
		this.direction = Evo.VMath.subtract(this.actor.position, Evo.Mouse.getPosition());
		this.distanceToMouse = this.direction.length();
		this.speed = (Math.max(0, this.fleeDistance - this.distanceToMouse) / this.fleeSpeed);
		
		//Interpolate the speed
		this.interpolationAmount = Math.min(1, 1 - dt / 500);
		this.speed = this.speed + (this.prevSpeed - this.speed) * this.interpolationAmount;
		
		if(this.speed > 0) {
			
			//Normalize direction
			//this.direction.divide(this.distanceToMouse);
			
			//Interpolate the direction
			//this.direction.lerp(this.prevDirection.multiply(this.distanceToMouse), this.interpolationAmount);
			
			this.direction.normalize();
			
			
			this.actor.addWeightedDirection(this.direction, this.weight);
			this.actor.addWeightedSpeed(this.speed, this.weight);
		} else {
			this.speed = 0;
		}
		
		this.prevDirection = this.direction;
		this.prevSpeed = this.speed;
		
	}
	
	self.prototype.onAdd = function() {
		
	}
	
	self.prototype.onRemove = function() {
		
	}
	
	return self;
})();

Evo.States.GrowAndDivide = (function() {
	
	var self = function(actor, growthSpeed, divideSize) {
		this.actor = actor;
		this.growthSpeed = growthSpeed;
		this.divideSize = divideSize;
	};
	
	self.prototype.update = function(dt) {
		
		this.actor.size = this.actor.size + (this.growthSpeed * dt);
		
		if(this.actor.size > this.divideSize) {
			//Make sure we don't get too big
			this.actor.size = this.divideSize;
			
			Evo.CellFactory.divideCell(this.actor);
		}
	}
	
	self.prototype.onAdd = function() {
		
	}
	
	self.prototype.onRemove = function() {
		
	}
	
	return self;
})();

Evo.Vector = (function() {
	var self = function(x,y) {
		this.x = x;
		this.y = y;
	}
	
	self.prototype.copy = function() {
		return new Evo.Vector(this.x, this.y);
	}

    self.prototype.multiply = function(value) {
		if(typeof(value) === "number") {
			this.x *= value;
			this.y *= value;
		} else {
			this.x *= value.x;
			this.y *= value.y;
		}
		return this;
	}
    
	self.prototype.divide = function(value) {
		if(typeof(value) === "number") {
			this.x /= value;
			this.y /= value;
		} else {
			this.x /= value.x;
			this.y /= value.y;
		}
		return this;
	}
	
	
	self.prototype.add = function(value) {
		
		if(typeof(value) === "number") {
			this.x += value;
			this.y += value;
		} else {
			this.x += value.x;
			this.y += value.y;
		}
		return this;
	}
	
	self.prototype.subtract = function(value) {
		if(typeof(value) === "number") {
			this.x -= value;
			this.y -= value;
		} else {
			this.x -= value.x;
			this.y -= value.y;
		}
		return this;
	}
    
    self.prototype.abs = function() {
		Math.abs(this.x);
		Math.abs(this.y);
		return this;
	}
    
    self.prototype.dot = function(vector) {
		return (this.x * vector.x) + (this.y * vector.y);
	}
    
    self.prototype.length = function() {
		return Math.sqrt(this.dot(this));
	}
    
    self.prototype.distance = function(vectorRef) {
		var vector = vectorRef.copy();
		vector.subtract(this);
		return vector.length();
	}
    
    self.prototype.lengthSqr = function() {
		return this.dot(this);
	}
	
    /*  vector linear interpolation 
        interpolate between two vectors.
        value should be in 0.0f - 1.0f space ( just to skip a clamp operation )
    */
    self.prototype.lerp = function(vector, interpolation) {  
		this.x = this.x + (vector.x - this.x) * interpolation;
		this.y = this.y + (vector.y - this.y) * interpolation;
		return this;
    }
	
    /* normalize a vector */
    self.prototype.normalize  = function() {
		if(this.x !== 0 || this.y !== 0) {
			var length   = this.length();
			this.x = this.x / length;
			this.y = this.y / length;
		}
		return this;
    }
	
	return self;
})();

Evo.VMath = (function() {
	var self = {
		
		multiply : function(vector, value) {
			
			var v = vector.copy();
			v.multiply(value);
			return v;
		},
		
		divide : function(vector, value) {
			
			var v = vector.copy();
			v.divide(value);
			return v;
		},
		
		
		add : function(vector, value) {
			
			var v = vector.copy();
			v.add(value);
			return v;
		},
		
		subtract : function(vector, value) {
			
			var v = vector.copy();
			v.subtract(value);
			return v;
		},
		
		abs : function(vector) {
			
			var v = vector.copy();
			v.abs();
			return v;
		},
		
		dot : function(vector1, vector2) {
			return vector.dot(vector2);
		},
		
		length : function(vector) {
			return Math.sqrt(vector.dot(vector));
		},
		
		distance : function(vector1, vector2) {
			var vector = vector1.copy();
			vector.subtract(vector2);
			return vector.length();
		},
		
		lengthSqr : function(vector) {
			return vector.dot(vector);
		},
		
		/*  vector linear interpolation 
			interpolate between two vectors.
			value should be in 0.0f - 1.0f space ( just to skip a clamp operation )
		*/
		lerp : function(vector1, vector2, interpolation) {
			var v = vector1.copy();
			v.lerp(vector2, interpolation);
			return v;
		},
		
		/* normalize a vector */
		normalize  : function(vector) {
			var v = vector.copy();
			v.normalize();
			return v();
		}
	};
	
	return self;
})();
