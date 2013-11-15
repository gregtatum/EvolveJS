var Evo = (function () {

	var self = {
		
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
	};
	return self;
})();

Evo.Main = (function() {
	var self = function() {
		$('document').ready(this.onReady.bind(this));
	}
	
	self.prototype.onReady = function() {
		//this.loop = new Evo.Loop();
	}
	
	return self;
})();

new Evo.Main();

Evo.canvas;
Evo.context;


Evo.LoopInstanced = (function() {
	
	var self = function() {
		//Create animation frame
		this._animationFrame = 
			window.requestAnimationFrame				||
			window.webkitRequestAnimationFrame			||
			window.mozRequestAnimationFrame   			||
			window.oRequestAnimationFrame				||
			window.msRequestAnimationFrame				||
			function( callback ){
				window.setInterval(callback, 1000/60);
			};
		
		this._isPlaying = false;
		
		//Listeners
		this._updateListeners = [];
		this._drawListeners = [];
		this._updateLength = 0;
		this._drawLength = 0;
		this._uI = 0; //Iterators
		this._dI = 0;
		
		//Timing
		this._timePresent = 0;
		this._timePast = 0;
		this._dt = 0;
	}
	
	//Public Methods
	self.prototype = {
		
		onInit : function() {

		},
		
		onReady : function() {
			Evo.Browser.Canvas.init();
			this.start();
			this.stop();
		},
		
		//-------------------------------------
		// Registration Functions
		
		registerUpdate : function(listener) {
			this._updateListeners.push(listener);
			this._updateLength = this._updateListeners.length;
		},
		
		registerDraw : function(listener) {
			this._drawListeners.push(listener);
			this._drawLength = this._drawListeners.length;
		},
        
        removeUpdate : function(listener) {
            var index = this._updateListeners.indexOf(listener);
            if(index >= 0) {
                this._updateListeners.splice(index,1);
            }
        },
        
        removeDraw : function(listener) {
            var index = this._drawListeners.indexOf(listener);
            if(index >= 0) {
                this._drawListeners.splice(index,1);
            }
        },
		
		//-------------------------------------
		// Looping functions
		
		updateTime : function() {
			this._timePresent = new Date().getTime();
			this._dt = this._timePresent - this._timePast;
			this._timePast = this._timePresent;
		},
		
		runUpdateListeners : function() {
			for(this._uI = 0; this._uI < this._updateLength; ++this._uI) {
				this._updateListeners[this._uI].update(this._dt);
			}
		},
		
		runDrawListeners : function() {
			for(this._dI = 0; this._dI < this._drawLength; ++this._dI) {
				this._drawListeners[this._dI].draw(this._dt);
			}
		},
		
		//Looping logic
		mainLoop : function() {
			if(this._isPlaying)
				this._animationFrame(this.mainLoop, Evo.canvas);
			
			this.updateTime();
			this.runUpdateListeners(this._dt);
			Evo.context.clearRect(0,0,Evo.canvas.width,Evo.canvas.height);
			this.runDrawListeners(this._dt);
		},
		
		start : function() {
			this._isPlaying = true;
			this._timePast = new Date().getTime();
			this.mainLoop();
		},
		
		stop : function() {
			this._isPlaying = false;
		}
	};
	
	return self;
})();

Evo.Loop = (function() {
	
	//Private Variables
	var _animationFrame,
		_isPlaying = false,
		
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
			Evo.Browser.Canvas.init();
			self.start();
			//self.stop();
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
		mainLoop : function() {
			if(_isPlaying)
				_animationFrame(self.mainLoop, Evo.canvas);
			
			self.updateTime();
			self.runUpdateListeners(_dt);
			Evo.context.clearRect(0,0,Evo.canvas.width,Evo.canvas.height);
			self.runDrawListeners(_dt);
		},
		
		start : function() {
			_isPlaying = true;
			_timePast = new Date().getTime();
			self.mainLoop();
		},
		
		stop : function() {
			_isPlaying = false;
		}
	};
	
	Evo.init(self);
	return self;
})();

Evo.Browser = {};

Evo.Browser.Canvas = (function() {
	
	//Public Methods
	var self = {
		
		init : function() {
		
			var ratio = window['devicePixelRatio'] >= 1 ? window.devicePixelRatio : 1;
          
			Evo.canvas = $('canvas').get(0);
			Evo.canvas.width = $(window).width() * ratio;
			Evo.canvas.height = $(window).height() * ratio;
			Evo.context = Evo.canvas.getContext('2d');
			
			this.grid = new Evo.Grid(14, 13, Evo.canvas.width, Evo.canvas.height);
			
			$(window).on('resize', self.resize);
		},
		
		resize : function() {
			Evo.canvas.width = $(window).width();
			Evo.canvas.height = $(window).height();	
		}
	};
	
	return self;
})();

Evo.Browser.Mouse = (function() {
	
	var _position;
	
	//Public Methods
	var self = {
		
		onReady : function() {
			_position = new Evo.Vector(-10000, -10000);
			 
            document.addEventListener('mousemove', self.onMouseMove);
            document.addEventListener('touchmove', self.onTouchMove);
            document.addEventListener('touchend', self.onTouchEnd);
            
            document.ontouchstart = function(e){ 
                e.preventDefault(); 
            };
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

//Collection of worker functions
Evo.Worker = (function() {
	
	//Public Methods
	var self = {
		
		extend : function(child, parent) {
			$().extend(child.prototype, child.prototype, parent.prototype);
			child.prototype.parent = parent;
		},
		
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

Evo.Worker.Examples = {};

//Subclassing example
Evo.Worker.Examples.Parent = (function() {
	console.log('defining parent');
	var self = function(name) {
		this.name = name;
		console.log(this.name + ' creating parent');
	}
	self.prototype = {
		scold : function() {
			console.log(this.name + ' parent is scolding');
		}
	}
	return self;
})();
	
//Subclassing example	
Evo.Worker.Examples.Child = (function() { //Subclasses Evo.Example.Parent
	
	console.log('defining child');
	
	var self = function(name) {
		this.parent.call(this, name);
		console.log(this.name + ' creating child');
	}
	
	self.prototype = {
		whine : function() {
			console.log(this.name + ' child is whining');
		}
	}
	
	Evo.Worker.extend(self, Evo.Worker.Examples.Parent);
	
	return self;
})();