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
            console.log(_position);
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

Evo.DotFactory = (function() {
	
	var _numberOfDots = 1000,
        _dots = new Array();
	
	//Public Methods
	var self = {
		
		onReady : function() {
            return;
			for(var i=0; i < _numberOfDots; i++) {
				_dots.push(new Evo.Dot(Evo.canvas.width * Math.random(), Evo.canvas.height * Math.random()));
			}
		},
		
		//-------------------------------------
		// Registration Functions
		
		update : function(dt) {
		
		},
		
		draw : function(dt) {
			
		}
	};
	
	Evo.init(self);
	return self;
})();

Evo.Dot = (function() {
	var self = function(x, y) {
		var speed = .05;
		var brightness = 150;
        
		this.position = new Evo.Vector(x,y);
		this.direction = new Evo.Vector(
			speed * Math.random() - speed / 2,
			speed * Math.random() - speed / 2
		);
		
		this.size = 10 * Math.random() + 1;
		this.fillStyle = Evo.Worker.rgbToFillstyle(
            parseInt(Math.random() * brightness),
            parseInt(Math.random() * brightness),
            parseInt(Math.random() * brightness)
        );
        console.log(this.fillStyle);
		this.fleeSpeed = 1000 * Math.random() + 500;
		this.fleeDistance = (150 * Math.random()) + 180;
		
		this.mouseVector;
		this.mouseLength;
		this.mouseVector
		
        
        console.log(this.fillStyle)
        
		var instance = this;
		Evo.Loop.registerDraw(this);
		Evo.Loop.registerUpdate(this);
        
	};
	
	self.prototype.update = function(dt) {
		this.updatePosition(dt);
		this.fleeMouse(dt);
		this.keepOnScreen(dt);
	};
	
	self.prototype.draw = function(dt) {	
		Evo.context.beginPath();
		//Evo.context.arc(this.position.x, this.position.y, this.size, 0, 2*Math.PI);
        Evo.context.fillStyle = this.fillStyle;
        Evo.context.fillRect(this.position.x, this.position.y, this.size, this.size);
		Evo.context.fill();
	};
	
	self.prototype.updatePosition = function(dt) {
		this.position.add(
			Evo.VMath.multiply(this.direction, dt)
		);
	};
	
	self.prototype.fleeMouse = function(dt) {
		this.mouseVector = Evo.VMath.subtract(this.position, Evo.Mouse.getPosition());
		this.mouseDistance = this.mouseVector.length();
		this.moveLength = (Math.max(0, this.fleeDistance - this.mouseDistance) / this.fleeSpeed) * dt;
		
		if(this.moveLength > 0) {
			
			//Normalize
			this.mouseVector.divide(this.mouseDistance);
			//Lengthen
			this.mouseVector.multiply(this.moveLength)
			
			this.position.add(
				this.mouseVector
			);
		}
	};
	
	self.prototype.keepOnScreen = function(dt) {
		if(this.position.x < this.size * -1) {this.position.x = Evo.canvas.width  + this.size;}
		if(this.position.y < this.size * -1) {this.position.y = Evo.canvas.height + this.size;}
		if(this.position.x > Evo.canvas.width + this.size) {this.position.x = 0 - this.size;}
		if(this.position.y > Evo.canvas.height + this.size) {this.position.y = 0 - this.size;}
	};
	
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
            Evo.Worker.addDoubletapListener(Evo.Canvas, self.killCells);
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
				_cells.push(cell);
			}
        },
        
        killCells : function() {
            console.log('killing cells');
            
            for(var i in _cells) {
                _cells[i].kill();
            }
            _cells.length = 0;
            
            self.generateCells();
        },
        
        divideCell : function(cell) {
            if(_cells.length > _maxCells) return;
            
            //Copy the cell
            daughterCell = new Evo.Cell(cell.position.x, cell.position.y);
            daughterCell.copyDna(cell.dna);
            
            //Revert to children
            cell.revert();
            daughterCell.revert();
            
            _cells.push(daughterCell);
        }
	};
	
	Evo.init(self);
	return self;
})();

Evo.Cell = (function() {
	var self = function(x,y) {
		var speed = .05;
		
		this.position = new Evo.Vector(x,y);
		this.direction = new Evo.Vector(
			speed * Math.random() - speed / 2,
			speed * Math.random() - speed / 2
		);
		
		this.mouseVector;
		this.mouseLength;
		this.mouseVector
		
		Evo.Loop.registerDraw(this);
		Evo.Loop.registerUpdate(this);
	};
	
    self.prototype.kill = function() {
        Evo.Loop.removeDraw(this);
		Evo.Loop.removeUpdate(this);
    }
    
    self.prototype.revert = function() {
        this.size = (this.dna.birthSize / 2) + (this.dna.birthSize / 2) * Math.random();
    }
    
    self.prototype.generateDna = function() {
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
            growthRate      :   .001 * Math.random(),
            divideSize      :   birthSize * 2.5
        }
        
        this.revert();
    }
    
    self.prototype.copyDna = function(dnaRef) {
        this.dna = $.extend({}, dnaRef);
    }
    
	self.prototype.update = function(dt) {
		this.updatePosition(dt);
		this.fleeMouse(dt);
		this.keepOnScreen(dt);
        this.updateGrowth(dt);
	};
	
	self.prototype.draw = function(dt) {	
		Evo.context.beginPath();
        Evo.context.fillStyle = this.dna.fillStyle;
        Evo.context.fillRect(this.position.x, this.position.y, this.size, this.size);
		Evo.context.fill();
	};
	
	self.prototype.updatePosition = function(dt) {
		this.position.add(
			Evo.VMath.multiply(this.direction, dt)
		);
	};
    
	self.prototype.updateGrowth = function(dt) {
        this.size += this.dna.growthRate * dt;
        
        if(this.size > this.dna.divideSize) {
            //Make sure we don't get too big
            this.size = this.dna.divideSize;
            
            Evo.CellFactory.divideCell(this);
            
            
        }
    };
    
	self.prototype.fleeMouse = function(dt) {
        
		this.mouseVector = Evo.VMath.subtract(this.position, Evo.Mouse.getPosition());
		this.mouseDistance = this.mouseVector.length();
		this.moveLength = (Math.max(0, this.dna.fleeDistance - this.mouseDistance) / this.dna.fleeSpeed) * dt;
		
		if(this.moveLength > 0) {
			
			//Normalize
			this.mouseVector.divide(this.mouseDistance);
			//Lengthen
			this.mouseVector.multiply(this.moveLength)
			
			this.position.add(
				this.mouseVector
			);
		}
	};
	
	self.prototype.keepOnScreen = function(dt) {
		if(this.position.x < this.size * -1) {this.position.x = Evo.canvas.width  + this.size;}
		if(this.position.y < this.size * -1) {this.position.y = Evo.canvas.height + this.size;}
		if(this.position.x > Evo.canvas.width + this.size) {this.position.x = 0 - this.size;}
		if(this.position.y > Evo.canvas.height + this.size) {this.position.y = 0 - this.size;}
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
		this.currentStates;
	};
	
	self.prototype.update = function() {
		for(var i in this.currentStates) {
			this.currentStates.update();
		}
	}
	
	self.prototype.add(state) {
		
		if(this.currentStates.indexOf(state) >= 0) return; //Do not add twice
		state.onAdd();
		this.currentStates.push(state);
	}
	
	self.prototype.remove(state) {
		var index = this.currentStates.indexOf(state);
		if(index >= 0) {
			this.currentStates[index].onRemove();
			this.currentStates.splice(index,1);
		}
	}
})();

Evo.States = {};

Evo.States.Roam = (function() {
	
	var self = function(actor, stateMachine, data) {
		this.actor = actor;
		this.stateMachine = stateMachine;
	};
	
	self.prototype.update = function() {
		
	}
	self.prototype.onAdd = function() {
		
	}
	self.prototype.onRemove = function() {
		
	}
})

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
		var length   = this.length();
		this.x = this.x / length;
		this.y = this.y / length;
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
