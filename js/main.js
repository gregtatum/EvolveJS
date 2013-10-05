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
		
	}
	
	return self;
})();

new Evo.Main();

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
		mainLoop : function() {
			_animationFrame(self.mainLoop, Evo.canvas);
			
			self.updateTime();
			self.runUpdateListeners(_dt);
			Evo.context.clearRect(0,0,Evo.canvas.width,Evo.canvas.height);
			self.runDrawListeners(_dt);
		},
		
		start : function() {
			_timePast = new Date().getTime();
			self.mainLoop();	
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
			
			this.grid = new Evo.Grid(4, 3, Evo.canvas.width, Evo.canvas.height);
			
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
