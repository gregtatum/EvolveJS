var Evo = Evo || {};

setTimeout(function() {
	//evo.loop.stop();
}, 2000);

Evo.SceneGraph = (function() {
	var self = function() {
		$('document').ready(this.onReady.bind(this));
	};
	
	self.prototype.onReady = function() {
		this.page = new Evo.Page();
		this.loop = new Evo.Loop(this);
		this.canvas = new Evo.Canvas();
		this.mouse = new Evo.Mouse(this.canvas);
		this.cellFactory = new Evo.CellFactory(this);
		
		this.loop.start();
	};
	
	return self;
})();

var evo = new Evo.SceneGraph();

Evo.Page = (function() {
	var self = function() {
		this.startUniform();
	};
	
	self.prototype = {
		startUniform : function() {
			$('input, select, textarea').uniform();
		}
	};
	
	return self;
})();


Evo.Loop = (function() {
	
	var self = function(scene) {
		
		this.scene = scene;
		
		//Create animation frame
		this._animationFrame = window.requestAnimationFrame	||
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
		
		$('#Loop-Pause').on('mouseup', this.pauseHandler.bind(this));
	};
	
	//Public Methods
	self.prototype = {
		
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
				this._updateLength--;
            }
        },
        
        removeDraw : function(listener) {
            var index = this._drawListeners.indexOf(listener);
            if(index >= 0) {
                this._drawListeners.splice(index,1);
				this._drawLength--;
            }
        },
		
		//-------------------------------------
		// Looping functions
		
		updateTime : function() {
			this._timePresent = new Date().getTime();
			this._dt = Math.min(this._timePresent - this._timePast, 500);
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
			if(this._isPlaying) {
				
				//Calls the animation frame in the context of the window
				this._animationFrame.call(window, this.mainLoop.bind(this), this.scene.canvas.el);
			}
			
			this.updateTime();
			this.runUpdateListeners(this._dt);
			this.scene.canvas.context.clearRect(0,0,this.scene.canvas.width, this.scene.canvas.height);
			this.runDrawListeners(this._dt);
		},
				
		pauseHandler : function(e) {
			if(e) e.preventDefault();
			
			if(this._isPlaying) {
				$('#Loop-Pause').val('Play');
				this.stop();
			} else {
				$('#Loop-Pause').val('Pause');
				this.start();
			}
			$.uniform.update("#Loop-Pause");
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

Evo.Canvas = (function() {
	
	var self = function() {
		
		this.ratio = window['devicePixelRatio'] >= 1 ? window.devicePixelRatio : 1;

		this.$el = $('canvas');
		this.el = this.$el.get(0);
		
		this.resize();
		this.context = this.el.getContext('2d');
		
		$(window).on('resize', this.resize.bind(this));
	};
	
	//Public Methods
	self.prototype = {
		
		resize : function() {
			this.el.width = ($(window).width() - $('.menu').outerWidth()) * this.ratio;
			this.el.height = $(window).height() * this.ratio;
			this.width = this.el.width;
			this.height = this.el.height;
			this.left = this.$el.offset().left;
			this.top = this.$el.offset().top;
			
		}
	};
	
	return self;
})();

Evo.Mouse = (function() {
	
	var self = function(canvas) {
		this.position = new Evo.Vector(-10000, -10000);
		this.canvas = canvas;
		
		document.addEventListener('mousemove', this.onMouseMove.bind(this));
		document.addEventListener('touchmove', this.onTouchMove.bind(this));
		document.addEventListener('touchend', this.onTouchEnd.bind(this));

		document.ontouchstart = function(e){ 
			e.preventDefault(); 
		};
	};
	
	//Public Methods
	self.prototype = {
		
		onMouseMove : function(e) {
			
			if(typeof(e.pageX) === "number") {
				this.position.x = e.pageX - this.canvas.left;
				this.position.y = e.pageY - this.canvas.top;
            } else {
				this.position.x = -100000;
				this.position.y = -100000;
			}
		},
        
        onTouchMove : function(e) {
            if(e.touches) {
				this.position.x = e.touches[0].pageX - this.canvas.left;
				this.position.y = e.touches[0].pageY - this.canvas.top;
			}
        },
        
        onTouchEnd : function(e) {
            this.position.x = -100000;
            this.position.y = -100000;
        },
        
		getPosition : function() {
			return this.position;
		},
		
		getX : function() {
			return this.position.x;
		},
		
		getY : function() {
			return this.position.y;
		}
	};
	
	return self;
})();

//Collection of worker functions
Evo.Utilities = {
		
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

Evo.Utilities.Examples = {};

//Subclassing example
Evo.Utilities.Examples.Parent = (function() {
	
	var self = function(name) {
		this.name = name;
		console.log(this.name + ' creating parent');
	};
	self.prototype = {
		scold : function() {
			console.log(this.name + ' parent is scolding');
		}
	};
	return self;
})();
	
//Subclassing example	
Evo.Utilities.Examples.Child = (function() { //Subclasses Evo.Example.Parent
	
	var self = function(name) {
		this.parent.call(this, name);
		console.log(this.name + ' creating child');
	}
	
	self.prototype = {
		whine : function() {
			console.log(this.name + ' child is whining');
		}
	}
	
	Evo.Utilities.extend(self, Evo.Utilities.Examples.Parent);
	
	return self;
})();