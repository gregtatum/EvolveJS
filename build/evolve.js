/*
 * Evo.Main = //code to tell concatenator that this is the main package
 */

var Evo = {};
/*
 * @require Main
 * 
 * @todo Get rid of custom code and just use Three.js's vectors
 */
Evo.Vector2 = (function() {
	var self = function(x,y) {
		this.x = x || 0;
		this.y = y || 0;
	};
	
	self.is2d = true;
	self.is3d = false;
	
	self.prototype.clone = function() {
		return new Evo.Vector(this.x, this.y);
	};
	
	self.prototype.copy = function(vector) {
		this.x = vector.x;
		this.y = vector.y;
	};

    self.prototype.multiplyScalar = function(value) {
		if(typeof(value) === "number") {
			this.x *= value;
			this.y *= value;
		} else {
			this.x *= value.x;
			this.y *= value.y;
		}
		return this;
	};
	
	self.prototype.divide = function(value) {
		if(typeof(value) === "number") {
			this.x /= value;
			this.y /= value;
		} else {
			this.x /= value.x;
			this.y /= value.y;
		}
		return this;
	};
	
	
	self.prototype.add = function(value) {
		
		if(typeof(value) === "number") {
			this.x += value;
			this.y += value;
		} else {
			this.x += value.x;
			this.y += value.y;
		}
		return this;
	};
	
	self.prototype.subtract = function(value) {
		if(typeof(value) === "number") {
			this.x -= value;
			this.y -= value;
		} else {
			this.x -= value.x;
			this.y -= value.y;
		}
		return this;
	};
    
    self.prototype.abs = function() {
		Math.abs(this.x);
		Math.abs(this.y);
		return this;
	};
    
    self.prototype.dot = function(vector) {
		return (this.x * vector.x) + (this.y * vector.y);
	};
    
    self.prototype.length = function() {
		return Math.sqrt(this.dot(this));
	};
    
    self.prototype.distanceTo = function(vectorRef) {
		var vector = vectorRef.clone();
		vector.subtract(this);
		return vector.length();
	};
    
    self.prototype.lengthSqr = function() {
		return this.dot(this);
	};
	
    /*  vector linear interpolation 
        interpolate between two vectors.
        value should be in 0.0f - 1.0f space ( just to skip a clamp operation )
    */
    self.prototype.lerp = function(vector, interpolation) {  
		this.x = this.x + (vector.x - this.x) * interpolation;
		this.y = this.y + (vector.y - this.y) * interpolation;
		return this;
    };
	
    /* normalize a vector */
    self.prototype.normalize  = function() {
		if(this.x !== 0 || this.y !== 0) {
			var length   = this.length();
			this.x = this.x / length;
			this.y = this.y / length;
		}
		return this;
    };
	
	return self;
})();

Evo.Vector = (function() {

	THREE.Vector3.is2d = false;
	THREE.Vector3.is3d = true;
	
	return THREE.Vector3;
	//return Evo.Vector2;
})();

Evo.VMath = (function() {
	var self = {
		
		multiplyScalar : function(vector, value) {
			
			var v = vector.clone();
			v.multiply(value);
			return v;
		},
		
		divide : function(vector, value) {
			
			var v = vector.clone();
			v.divide(value);
			return v;
		},
		
		
		add : function(vector, value) {
			
			var v = vector.clone();
			v.add(value);
			return v;
		},
		
		subtract : function(vector, value) {
			
			var v = vector.clone();
			v.subtract(value);
			return v;
		},
		
		abs : function(vector) {
			
			var v = vector.clone();
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
			var vector = vector1.clone();
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
			var v = vector1.clone();
			v.lerp(vector2, interpolation);
			return v;
		},
		
		/* normalize a vector */
		normalize  : function(vector) {
			var v = vector.clone();
			v.normalize();
			return v();
		}
	};
	
	return self;
})();
/*
 * @require Main
 */
Evo.Scene = (function() {
	
	var self = function() {
			
		if(Evo.Vector.is3d) {
			//Todo - Make/use a texture loader? hook into setup3d
			this.backgroundTexture = THREE.ImageUtils.loadTexture(
				'images/tmp_background2.jpg',
				new THREE.UVMapping(),
				this.start.bind(this)
			);
		} else {
			this.start();
		}

	};
	
	self.prototype = {
		start : function() {
			this.ui = new Evo.UI();
			this.loop = new Evo.Loop(this);
			this.canvas = new Evo.Canvas(this.loop);
			this.mouse = new Evo.Mouse(this, this.canvas);
			this.cellFactory = new Evo.CellFactory(this);

			//TODO - Make a bindings manager?
			Evo.Behavior.GrowAndDivide.prototype.setBindings();
			Evo.Binding.prototype.hashToModel();

			
			if(Evo.Vector.is3d) {
				Evo.ExtendSceneTo3d(self.prototype);
				this.setup3d();
				this.loop.registerDraw(this);
			}

			this.cellFactory.start();
			this.loop.start();
		}
				
	};
	
	return self;
})();
var Evo = Evo || {};
Evo.AIThoughts = (function() {
	/*
	 * @require Scene
	 */
	var self = function() {
		this.id;
		this.recencyScore = 0; //0-1
		this.bayesianScore = 0; //0-1
		this.operation = function() {};
		this.input;
		this.output;
		this.callsTimestamp = [new Date().getTime()];
	};
	
	self.prototype = {
		
	};
	
	return self;
})();

Evo.AIGraph = (function() {
	var self = function() {
		
	};
	
	self.prototype = {
	};
	
	return self;
})();
/*
 * @require Main
 */
Evo.Binding = (function() {
	
	/*
	 * Model / View binding
	 * JS Object / DOM Element binding
	 */
	
	var self = function(domId, getter, setter) {
		this.domId = domId;
		this.$view = $('#'+domId);
		this.getter = getter;
		this.setter = setter;
		
		this.$view.on('change.Evo-Binding', this.updateModel.bind(this));
		this.updateView();
		
		self.prototype._allBindings.push(this);
	};
	
	//Public Methods
	self.prototype = {
		
		_allBindings : [],
		
		modelToHash : function() {
			
			var bindings = self.prototype._allBindings,
				params = [];
				
			for(var i = 0, il = bindings.length; i < il; i++) {
				params.push({
					name  : bindings[i].domId,
					value : bindings[i].getViewValue()
				});
			}
			window.location.hash = "/?" + $.param(params);
		},
				
		hashToModel : function() {
	
			//Hash to object
			var getVars = (function(a) {
				//http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
				if (a === "") return {};
				var b = [];
				for (var i = 0; i < a.length; ++i) {
					var p=a[i].split('=');
					if (p.length !== 2) continue;
					b.push({
						name : p[0],
						value : decodeURIComponent(p[1].replace(/\+/g, " "))
					});
				}
				return b;
			})(window.location.hash.substr(3).split('&'));
			
			
			var bindings = self.prototype._allBindings,
				g = 0, gl = getVars.length,
				b = 0, bl = bindings.length;
					
			
			for(; g < gl; g++) {
				for(b=0; b < bl; b++) {
					if(bindings[b].domId === getVars[g].name && getVars[g].name !== undefined) {
						bindings[b].updateView(getVars[g].value);
						bindings[b].updateModel();
					}
				}
			}
		},
		
		getViewValue : function() {
			
			if(this.$view[0] === undefined) return;

			//Radio input
			if(this.$view.is("input[type='radio']")) {
				return this.$view.is(':checked').val();

			//Standard input
			} else if (this.$view.is("input")) {
				return this.$view.val();

			//DOM Element
			} else {
				return this.$view.html();
			}
			
		},
		
		updateModel : function() {
			
			var requestedValue = this.getViewValue();
			
			//Send it to the setter, which should return the value actually set
			this.setter(requestedValue);
			
			//Update the input with the set value
			this.updateView();
		},
				
		updateView : function(value) {
			
			if(value === undefined) {
				value = this.getter();
			}
			
			if(this.$view[0] === undefined) return;

			//Radio input
			if(this.$view.is("input[type='radio']")) {
				//TODO this.$view.is(':checked').val();

			//Standard input
			} else if (this.$view.is("input")) {
				this.$view.val(value);

			//DOM Element
			} else {
				this.$view.html(value);
			}
			
		},
				
		remove : function() {
	
			//Remove prototype reference
			self.prototype._allBindings.splice(
				self.prototype._allBindings.indexOf(this),
				1
			);
			
			this.$view = null;
			this.getter = null;
			this.setter = null;
			this.$view.off('change.Evo-Binding', this.updateModel);
		}
	};
	
	return self;
})();
/*
 * @require Scene
 */
Evo.Canvas = (function() {
	
	var self = function(loop) {
		
		this.loop = loop;
		this.ratio = window.devicePixelRatio >= 1 ? window.devicePixelRatio : 1;

		this.$el = $('canvas');
		this.el = this.$el.get(0);
		
		if(!Evo.Vector.is3d) {
			this.context = this.el.getContext('2d');
			this.loop.registerDraw(this);
		}
		
		this.resize();
		$(window).on('resize', this.resize.bind(this));
	};
	
	//Public Methods
	self.prototype = {
		
		resize : function(e) {
			this.el.width = $(window).width() * this.ratio;
			this.el.height = $(window).height() * this.ratio;
			this.width = this.el.width;
			this.height = this.el.height;
			this.left = this.$el.offset().left;
			this.top = this.$el.offset().top;
			
			if(e && this.loop) {
				this.loop.runUpdateListeners(0);
				this.loop.runDrawListeners(0);
			}
		},
		
		draw : function() {
			this.context.clearRect(0,0,this.width, this.height);
		}
	};
	
	return self;
})();
/*
 * @require Scene
 */
Evo.Mouse = (function() {
	
	var self = function(scene, canvas) {
		this.position = new Evo.Vector(-10000, -10000);
		this.canvas = canvas;
		this.scene = scene;
		this.drawRadius = 100;
		
		document.addEventListener('mousemove', this.onMouseMove.bind(this));
		document.addEventListener('touchmove', this.onTouchMove.bind(this));
		document.addEventListener('touchend', this.onTouchEnd.bind(this));

		document.ontouchstart = function(e){ 
			e.preventDefault(); 
		};
		
		//TODO - Figure this out
		//this.scene.loop.registerDraw(this);
	};
	
	//Public Methods
	self.prototype = {
		
		draw : function() {
			this.canvas.context.strokeStyle = "rgba(140,0,0,0.4)";
			this.canvas.context.arc(this.position.x, this.position.y, this.drawRadius, 0, 2 * Math.PI, false);
			this.canvas.context.lineWidth = 5;
			this.canvas.context.stroke();
		},
		
		onMouseMove : function(e) {
			
			if(typeof(e.pageX) === "number" && e.pageX > this.canvas.left) {
				
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
        
		setDrawRadius : function(radius) {
			this.drawRadius = radius;
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
/*
 * @require Scene
 */
Evo.UI = (function() {
	
	/*
	 * High level module to manage the user interface and DOM elements
	 */
	
	var self = function() {
		this.startUniform();
		this.sectionNavigator = new Evo.SectionNavigator();
	};
	
	self.prototype = {
		startUniform : function() {
			$('input, select, textarea').uniform();
		}
	};
	
	return self;
})();
/*
 * @require Main
 */
Evo.Utilities = { //Collection of worker functions
		
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
Evo.BehaviorManager = (function() {
	/*
	 * @require Scene
	 * @require Vector
	 */
	
	var self = function() {
		this.currentBehaviors = [];
	};
	
	self.prototype = {
		
		update : function(dt) {
			for(var i in this.currentBehaviors) {
				this.currentBehaviors[i].update(dt);
			}
		},

		add : function(behavior) {
			if(this.currentBehaviors.indexOf(behavior) >= 0) return; //Do not add twice
			if(typeof behavior.onAdd === "function") behavior.onAdd();
			behavior.manager = this;
			this.currentBehaviors.push(behavior);
		},

		remove : function(behavior) {
			var index = this.currentBehaviors.indexOf(behavior);
			if(index >= 0) {
				if(typeof this.currentBehaviors[index] === "function") this.currentBehaviors[index].onRemove();
				this.currentBehaviors[index].manager = null;
				this.currentBehaviors.splice(index,1);
			}
		},

		has : function(behavior) {
			return this.currentBehaviors.indexOf(behavior) >= 0;
		},

		destroy : function() {

			//Run all behaviors "destroy" method if it exists
			for(var i = 0; i < this.currentBehaviors.length; ++i) {
				this.currentBehaviors[i].actor = null;
				if(typeof this.currentBehaviors[i].destroy === "function") {
					this.currentBehaviors[i].destroy();
				}
			}

			this.currentBehaviors.length = 0;
		},
				
		revert : function() {
			//Run all behaviors "destroy" method if it exists
			for(var i = 0; i < this.currentBehaviors.length; ++i) {
				if(typeof this.currentBehaviors[i].revert === "function") {
					this.currentBehaviors[i].revert();
				}
			}
		}
	};
	return self;
})();

Evo.Behavior = {};







/*
 * @require BehaviorManager
 */
Evo.Behavior.Boids2d = (function() {
	
	var self = function(actor) {
		
		if(Evo.Vector.is3d) console.warn ("Boids are not 3d capable");
		
		this.actor = actor;
		this.speed = 0.05;
		this.neighborsDirection = new Evo.Vector(0,0);
		this.neighborsPosition = new Evo.Vector(0,0);
		this.neighborsPositionSum = new Evo.Vector(0,0);
		
		this.direction = new Evo.Vector(
			(Math.random() * 2) - 1,
			(Math.random() * 2) - 1
		);
		
	};
	
	self.prototype.update = function() {
		
		if(!this.actor.gridNode) return;
		
		var	neighbors = this.actor.gridNode._nodeStack,
			i = 0,
			il = neighbors.length;
	
		this.neighborsDirection.x = 0;
		this.neighborsDirection.y = 0;
		
		for(; i < il; i++) {
			this.neighborsDirection.x += neighbors[i].direction.x;
			this.neighborsDirection.y += neighbors[i].direction.y;
			
			this.neighborsPosition.x = neighbors[i].position.x - this.actor.position.x;
			this.neighborsPosition.y = neighbors[i].position.y - this.actor.position.x;
			
			this.neighborsPosition.normalize();
			
			this.neighborsPositionSum.add(this.neighborsPosition);
		}
		
		if(il > 0) this.neighborsPositionSum.divide(il);
		
		if(this.neighborsDirection.x > 0 || this.neighborsDirection.y > 0) {
			this.neighborsDirection.normalize();
		}
		
		this.actor.addWeightedDirection(this.neighborsDirection, 0.01);
		this.actor.addWeightedDirection(this.neighborsPositionSum, 1);
		//this.actor.addWeightedSpeed(this.speed, 1);
	};
	self.prototype.onAdd = function() {
		
	};
	self.prototype.onRemove = function() {
		
	};
	
	return self;
})();

/*
 * @require BehaviorManager
 */
Evo.Behavior.DieRandomly = (function() {
	
	var self = function(actor, cellFactory) {
		this.actor = actor;
		this.cellFactory = cellFactory;
	};
	
	self.prototype.update = function(dt) {
		
		if(Math.random() < 0.001) {
			this.cellFactory.cellIsDead(this.actor);
		}
	};
	
	self.prototype.onAdd = function() {};
	self.prototype.onRemove = function() {};
	
	return self;
})();

/*
 * @require BehaviorManager
 */
Evo.Behavior.DieWhenCrowded = (function() {
	
	var self = function(actor, cellFactory) {
		this.actor = actor;
		this.cellFactory = cellFactory;
	};
	
	self.prototype.update = function(dt) {
		
		if(Math.random() < 0.2 * (this.cellFactory.getLiveCellCount() / this.cellFactory.maxCells)) {
			
			if(Math.random() < 0.05 * (this.actor.age / 10000)) {
				
				this.cellFactory.cellIsDead(this.actor);
				
			}
		}
	};
	
	self.prototype.onAdd = function() {};
	self.prototype.onRemove = function() {};
	
	return self;
})();
/*
 * @require BehaviorManager
 */
Evo.Behavior.FleeMouse2d = (function() {
	
	var self = function(actor, mouse, fleeSpeed, fleeDistance) {
		this.actor = actor;
		this.mouse = mouse; //Evo.Mouse instance
		
		this.direction = undefined;
		this.distanceToMouse = 0.0;
		this.speed = 0.0;
		this.maxWeight = 2;
		this.weight = 0;
		this.fleeSpeed = fleeSpeed;
		this.fleeDistance = fleeDistance;
		
		this.prevDirection = new Evo.Vector(0,0,0);
		this.prevSpeed = 0.0;
		this.interpolationAmount = 1.0;
	};
	
	self.prototype.update = function(dt) {
		this.direction = Evo.VMath.subtract(this.actor.position, this.mouse.getPosition());
		this.distanceToMouse = this.direction.length();
		
		this.speed = Math.max(0, this.fleeDistance - this.distanceToMouse) / this.fleeSpeed;
		this.weight = (Math.max(0, this.fleeDistance - this.distanceToMouse) / this.fleeDistance) * this.maxWeight;
		
		//Interpolate the speed
		this.interpolationAmount = Math.min(1, 1 - dt / 500);
		this.speed = this.speed + (this.prevSpeed - this.speed) * this.interpolationAmount;
		
		if(this.speed > 0) {
			
			//Normalize direction
			//this.direction.divide(this.distanceToMouse);
			
			//Interpolate the direction
			//this.direction.lerp(this.prevDirection.multiplyScalar(this.distanceToMouse), this.interpolationAmount);
			
			this.direction.normalize();
			
			
			this.actor.addWeightedDirection(this.direction, this.weight);
			this.actor.addWeightedSpeed(this.speed, this.weight);
		} else {
			this.speed = 0;
		}
		
		this.prevDirection = this.direction;
		this.prevSpeed = this.speed;
		
	};
	
	self.prototype.onAdd = function() {
		
	};
	
	self.prototype.onRemove = function() {
		
	};
	
	return self;
})();
/*
 * @require BehaviorManager
 */
Evo.Behavior.FleeWalls = function(actor, canvas) {
	if(Evo.Vector.is2d) {
		return new Evo.Behavior.FleeWalls2d(actor, canvas);
	} else {	
		return new Evo.Behavior.FleeWalls3d(actor, canvas);
	}
};

/*
 * @require BehaviorManager
 */
Evo.Behavior.FleeWalls2d = (function() {
	
	var self = function(actor, canvas) {
		this.actor = actor;
		this.canvas = canvas;
		
		//The margin is a quarter of the document
		this.MARGIN = (this.canvas.width + this.canvas.height) / 4;
		this.direction = new Evo.Vector();
		this.weight = 0;
	};
	
	self.prototype.update = function() {
		
		this.direction.multiplyScalar(0);
		
		if(this.actor.position.x < this.MARGIN) {
			this.direction.x = ((this.MARGIN - this.actor.position.x) / this.MARGIN);
		}
		if(this.actor.position.y < this.MARGIN) {
			this.direction.y = ((this.MARGIN - this.actor.position.y) / this.MARGIN);
		}
		if(this.actor.position.x > this.canvas.width - this.MARGIN) {
			this.direction.x = -1 * ((this.MARGIN - (this.canvas.width - this.actor.position.x)) / this.MARGIN);
		}
		if(this.actor.position.y > this.canvas.height - this.MARGIN) {
			this.direction.y = -1 * ((this.MARGIN - (this.canvas.height - this.actor.position.y)) / this.MARGIN);
		}
		
		//If there is a direction to go
		if(this.direction.x !== 0 || this.direction.y !== 0) {
			
			//Crude/cheap weight calculator
			this.weight = this.direction.x * this.direction.x + this.direction.y * this.direction.y;
			this.direction.normalize();

			this.actor.addWeightedDirection(this.direction, this.weight * 2);
		}
	};
	
	return self;
})();
/*
 * @require BehaviorManager
 */

Evo.Behavior.FleeWalls3d = (function() {
	
	var self = function(actor, canvas) {
		this.actor = actor;
		this.canvas = canvas;
		
		//The margin is a quarter of the document
		this.MARGIN = 0;
		this.origin = new THREE.Vector3(0,75,0);
		this.direction = new THREE.Vector3(0,0,0);
		this.distance = 0;
		this.fleeStarts = 100;
		this.fleeStartsSquared = Math.pow(this.fleeStarts, 2);
		this.fleeEnds = 250;
		this.fleeEnds = Math.pow(this.fleeEnds, 2);
		this.fleeDenominator = this.fleeEnds - this.fleeStarts;
		
		this.direction = new THREE.Vector3(0,0,0);
		this.weight = 0;
	};
	
	self.prototype.update = function() {
		
		this.distance = this.origin.distanceToSquared(this.actor.position);
		
		if(this.distance > this.fleeStartsSquared) {
			
			this.direction.copy(this.actor.position).normalize().negate();

			//this.weight = Math.max(this.fleeMargin - (this.distance - this.fleeStarts), 0) / this.fleeMargin;
			this.weight = (this.distance - this.fleeStartsSquared) / this.fleeDenominator;

			this.actor.addWeightedDirection(this.direction, this.weight * 1);
		}
	};
	self.prototype.onAdd = function() {
		
	};
	self.prototype.onRemove = function() {
		
	};
	
	return self;
})();
/*
 * @require BehaviorManager
 */

Evo.Behavior.GrowAndDivide = (function() {
	
	var self = function(actor, cellFactory, growthSpeed, dividingFactor) {
		this.actor = actor;
		this.cellFactory = cellFactory;
		this.growthSpeed = growthSpeed;
		this.dividingFactor = dividingFactor;
		this.divideSize = 0;
		this.revert();
	};
	
	self.prototype.GROWTHFACTOR = 0.005;
	
	self.prototype.update = function(dt) {
		this.actor.size = this.actor.size + (this.actor.energy * this.GROWTHFACTOR * this.birthSize);
		this.actor.energy = 0;
		
		if(this.actor.size > this.divideSize) {
			//Make sure we don't get too big
			this.actor.size = this.divideSize;
			this.cellFactory.divideCell(this.actor);
		}
	};
	
	self.prototype.revert = function() {
		this.birthSize = this.actor.phenome.get('birthSize');
		this.divideSize = this.birthSize * this.dividingFactor;
		
	};
	
	self.prototype.setBindings = function() {

		//Energy per second
		new Evo.Binding(
			'growthfactor',
			function() { return self.prototype.GROWTHFACTOR; },
			function(value) {

				value = parseFloat(value, 10);
				self.prototype.GROWTHFACTOR = value;
			}.bind(this)
		);
	};
	
	return self;
})();

/*
 * @require BehaviorManager
 */

Evo.Behavior.Roam = (function() {
	
	var self = function(actor) {
		this.actor = actor;
		
		this.speed = 0.05;
		this.direction = new Evo.Vector();
		
		this.direction.x = (Math.random() * 2) - 1;
		this.direction.y = (Math.random() * 2) - 1;
		if(Evo.Vector.is3d) this.direction.z = (Math.random() * 2) - 1;
		
		this.elapsedTime = 0;
	};
	
	self.prototype.update = function(dt) {
		
		this.direction.x = Math.min((Math.random() - 0.5) / 10 + this.direction.x, 1);
		this.direction.y = Math.min((Math.random() - 0.5) / 10 + this.direction.y, 1);
		if(Evo.Vector.is3d) this.direction.z = Math.min((Math.random() - 0.5) / 10 + this.direction.z, 1);
		
		this.actor.addWeightedDirection(this.direction, 1);
		this.actor.addWeightedSpeed(this.speed, 1);
		
		this.elapsedTime += dt;
		
	};
	
	return self;
})();
/*
* @require Scene
*/

Evo.CellFactory = (function() {
	
	var self = function(scene, mouse) {
			
		this.scene = scene;
		/*this.grid = new Evo.Grid(
			this.scene,
			6,
			4,
			this.scene.canvas.width,
			this.scene.canvas.height
		);*/
		this.grid = null;
		this.oldestGeneration = 1;
		
		this.maxCells = Evo.Vector.is2d ? 1500 : 400;
		this.cellStartCount = parseInt(this.maxCells / 15, 10);
		this.killDistance = 100;
		this.scene.mouse.setDrawRadius(this.killDistance);
		this.energyGenerator = new Evo.EnergyGenerator(this.scene, this);
		
		this.cells = [];
		this.deadCells = [];
		
		this.setBindings();
		Evo.Cell.prototype.setBindings();
		Evo.Phenotype.prototype.setBindings();
		
		//$(this.scene.canvas.el).click(this.restart.bind(this));
		$(this.scene.canvas.el).on('mousedown', this.mouseKillCells.bind(this));
		$('#CellFactory-Restart').click(this.restart.bind(this));
		$(window).on('resize', this.rebuildGrid.bind(this));
	};
	
	//Public Methods
	self.prototype = {
		
		//-------------------------------------
		// Registration Functions
		
		update : function(dt) {},
		
		draw : function(dt) {},
        
		start : function() {
			this.generateCells(this.maxCells);
			
			var cell;
			for(var i=0; i < this.cellStartCount; i++) {
				cell = this.deadCells.pop();
				cell.setToAlive();
			}
		},
		
        generateCells : function(amount) {
            var cell, i;
            
			//Generate new cells for those that don't exist already in the cells array
			for(i = (this.maxCells - amount); i < amount; i++) {
				
                cell = new Evo.Cell(
					this.scene,
					this.grid,
					this.energyGenerator,
					this.getStartingVector(),
					Math.random()
				);
				
				this.deadCells.push(cell);
				this.addBehaviors(cell);
				cell.i = i; //for debug
				this.cells[i] = cell;
			}
        },
				
		getStartingVector : function(vector) {
	
			if(!vector) { vector = new Evo.Vector(); }
			
			if(Evo.Vector.is2d) {
				vector.set(
					this.scene.canvas.width * Math.random(),
					this.scene.canvas.height * Math.random()
				);
				return vector;
			} else {
				var spread = 500;
				new vector.set(
					(spread / 2) - (spread * Math.random()),
					(spread / 2) - (spread * Math.random()),
					(spread / 2) - (spread * Math.random())
				);
					
				return vector;
			}
		},
		
		restart : function() {
			this.killAllCells();
			this.start();
			this.oldestGeneration = 0;
		},
        
		cellIsDead : function(cell) {
			
			var i = this.deadCells.indexOf(cell);
			
			if(i === -1) {
				this.deadCells.push(cell);
			}
			
			cell.setToDead();
		},
		
		rebuildGrid : function() {
	
			/*
			console.log('rebuildGrid');
			this.grid.resize(this.scene.canvas.width, this.scene.canvas.height);
			
			for(var i=0, il = this.cells.length; i < il; i++) {
                if(this.cells[i]) this.cells[i].update(0);
            }*/
		},
		
        killAllCells : function() {
			
            for(var i=0, il = this.cells.length; i < il; i++) {
				if(this.cells[i].alive) {
					this.deadCells.push(this.cells[i]);
				}
                this.cells[i].setToDead();
            }
            //this.grid.emptyAllItems(); //TODO - This shouldn't be needed
            
        },
		
		mouseKillCells : function(e) {
	
			if(e) e.preventDefault();
			
			var click = this.scene.mouse.position.clone();
			
			for(var i=0, il = this.cells.length; i < il; i++) {
				
				if(this.cells[i].position.distanceTo(click) < this.killDistance) {
					this.cells[i].setToDead();
					this.deadCells.push(this.cells[i]);
				}
            }
		},
		
		addBehaviors : function(cell) {
			
			cell.behaviorManager.add(new Evo.Behavior.Roam(cell));
			cell.behaviorManager.add(new Evo.Behavior.GrowAndDivide(cell, this, cell.phenome.get('growthRate'), 1.5));
			//cell.behaviorManager.add(new Evo.Behavior.DieRandomly(cell, this));
			cell.behaviorManager.add(new Evo.Behavior.DieWhenCrowded(cell, this));
			cell.behaviorManager.add(new Evo.Behavior.FleeWalls(cell, this.scene.canvas));
			
			if(Evo.Vector.is2d) {
				//cell.behaviorManager.add(new Evo.Behavior.Boids2d(cell));
				cell.behaviorManager.add(new Evo.Behavior.FleeMouse2d(cell, this.scene.mouse, cell.phenome.get('fleeSpeed'), cell.phenome.get('fleeDistance')));	
			}
		},
		
        divideCell : function(parentCell) {
	
			if(this.deadCells.length === 0) return;
            
            //Grab a dead cell
            var daughterCell = this.deadCells.pop();
			
			daughterCell.copy(parentCell);
            
			//Mutate the cells
            parentCell.phenome.mutate();
            daughterCell.phenome.mutate();
			
			//Revert to children
            parentCell.revert();
            daughterCell.revert();
			daughterCell.setToAlive();
			
			this.oldestGeneration = Math.max(parentCell.generation, this.oldestGeneration);
        },
		
		getLiveCells : function() {
			return this.cells.filter(function(cell) {
				return cell.alive;
			});
		},
				
		getLiveCellCount : function() {
			return this.maxCells - this.deadCells.length;
		},
		
		getAveragePositions : function() {
	
			var v1 = new THREE.Vector3();
			
			return function(optionalTarget) {
				var averagePosition = optionalTarget || new THREE.Vector3();

				averagePosition.set(0,0,0);

				return this.cells.filter(function(cell) {
					return cell.alive;
				}).reduce(function(previousValue, currentValue, index, array ) {
					v1.copy(currentValue.position);
					return averagePosition.add(v1.divideScalar(array.length));
				});
			};
		}(),
		
		setMaxCells : function(value) {
			
			if(value > this.maxCells) {
				this.generateCells(value);
			}
			if(value < this.maxCells) {
				
				var i = this.cells.length - 1;
				
				while(i >= value) {
					this.cells[i].destroy();
					this.cells.pop();
					i--;
				}
			}
			
			this.maxCells = value;
		},
		
		setBindings : function() {
			
			new Evo.Binding(
				'startcount',
				function() { return this.cellStartCount; }.bind(this),
				function(value) {
					value = parseInt(value, 10);
					value = value > 0 ? value : 1;

					this.cellStartCount = value;
				}.bind(this)
			);
				
			new Evo.Binding(
				'maxcells',
				function() { return this.maxCells; }.bind(this),
				function(value) {
					value = parseInt(value, 10);
					value = value > 0 ? value : 1;
					value = Math.min(value, 10000);
					this.setMaxCells(value);
				}.bind(this)
			);
				
			new Evo.Binding(
				'killdistance',
				function() { return this.killDistance; }.bind(this),
				function(value) {
					value = parseInt(value, 10);
					value = value > 0 ? value : 1;
					this.scene.mouse.setDrawRadius(value);
					this.killDistance = value;
				}.bind(this)
			);
			
			/*	
			new Evo.Binding(
				'CellFactory-behaviors',
				function() {
					var behaviors = [];
					
					behaviors.push({
						
					});
					
					return behaviors;
				
				}.bind(this),
				function(value) {
			
				}.bind(this)
			);*/
			
		}
	};
	
	return self;
})();

/*
 * @require CellFactory
 */
Evo.EnergyGenerator = (function() {
	
	var self = function(scene, cellFactory) {
		
		this.energyPerMillisecond = 0.005 * cellFactory.maxCells;
		this.energy = 0;
		this.energyPerActor = 0;
		this.cellFactory = cellFactory;
		
		console.log(this.energyPerMillisecond);
		
		this.scene = scene;
		this.scene.loop.registerUpdate(this);
		
		this.setBindings();
	};
	
	self.prototype = {
		
		update : function(dt) {
			this.energy = this.energyPerMillisecond * dt;
			this.energyPerActor = this.energy / this.cellFactory.getLiveCellCount();
		},
				
		get : function() {
			return this.energyPerActor;
		},
		
		setBindings : function() {

			//Energy per second
			new Evo.Binding(
				'energypersecond',
				function() { return this.energyPerMillisecond; }.bind(this),
				function(value) {
			
					value = parseFloat(value, 10);
					value = Math.max(value, 0);
					
					this.energyPerMillisecond = value;
				}.bind(this)
			);	
		}
	};
	
	return self;
	
})();
/*
 * @require CellFactory
 */
Evo.Phenotype = (function() {
	var self = function(defaultValue) {
		this.value = defaultValue;
	};
	
	self.prototype = {
		
		mutationRate : 0.5,
		mutationFactor : 5,
				
		mutate : function(min, max, isInt) {
			
			if(Math.random() < this.mutationRate) {
				this.value *= (0.5 - Math.random() + this.mutationFactor) / this.mutationFactor;
				
				if(min !== undefined) this.value = Math.max(this.value, min);
				if(max !== undefined) this.value = Math.min(this.value, max);
				if(isInt) this.value = parseInt(this.value, 10);
			}
		},
				
		setBindings : function() {
	
			new Evo.Binding(
				'mutationrate',
				function() { return self.prototype.mutationRate; },
				function(value) {
			
					value = parseFloat(value);
					value = Math.max(value, 0);
					value = Math.min(value, 1);
					
					self.prototype.mutationRate = value;
				}
			);
			
			new Evo.Binding(
				'mutationfactor',
				function() { return 1 / self.prototype.mutationFactor; },
				function(value) {
			
					value = 1 / value;
					value = parseFloat(value);
					value = Math.max(value, 0.00001);
					value = Math.min(value, 1000);
					
					self.prototype.mutationFactor = value;
				}
			);
		}
	};
	
	return self;
})();
/*
 * @require Scene
 */

Evo.Grid = (function() {
	var self = function(scene, gridWidth, gridHeight, pixelWidth, pixelHeight) {
		this.scene = scene;
		this.gridWidth = gridWidth;
		this.gridHeight = gridHeight;
		this.pixelWidth = pixelWidth;
		this.pixelHeight = pixelHeight;
		
		this.nodeLength = 0;
		
		this.scene.loop.registerDraw(this);
		
		this.create();
	};
	
	self.prototype = {
		create : function() {
			
			var i=this.gridWidth,
				j=this.gridHeight;
			
			this.gridNodes = [];
			
			while(i--) {				
				this.gridNodes[i] = new Array(this.gridHeight);
				j = this.gridHeight;
				
				while(j--) {
					this.gridNodes[i][j] = new Evo.GridNode();
				}
			}
		},
		
		destroy : function() {
			var i=this.gridWidth,
				j=this.gridHeight;
			
			//Destroy this.gridNodes plus all GridNodes on it
			while(i--) {				
				
				j = this.gridHeight;
				
				while(j--) {
					this.gridNodes[i][j].destroy();
				}
				this.gridNodes[i].length = 0;
			}
			this.gridNodes.length = 0;
			this.gridNodes = null;
		},
				
		emptyAllItems : function() {
	
			var i=this.gridWidth,
				j=this.gridHeight;
			
			while(i--) {				
				
				j = this.gridHeight;
				
				while(j--) {
					this.gridNodes[i][j].empty();
				}
			}
			
			this.nodeLength = 0;
		},
		
		resize : function(pixelWidth, pixelHeight) {
			this.pixelWidth = pixelWidth;
			this.pixelHeight = pixelHeight;
			
			this.emptyAllItems();
		},
				
		removeItems : function(items) {
			var i=items.length;
			
			while(i--) {
				this.removeItem(items[i]);
				this.nodeLength--;
			}
		},
		
		removeItem : function(item) {
			if(item.gridNode) {
				item.gridNode.remove(item);
				this.nodeLength--;
			}
		},
		
		updateItem : function(item, pixelX, pixelY) {
			var gridNode = this.pixelsToGridNode(pixelX, pixelY);
			
			if(gridNode !== item.gridNode) {
				
				if(item.gridNode) {
					item.gridNode.remove(item);
					
					//TODO - After debug reduce to one call
					this.nodeLength--;
				}
				gridNode.add(item);
				
				//TODO
				this.nodeLength++;
			}
		},
		
		draw : function(dt) {
	
			var i=this.gridWidth,
				j=this.gridHeight,
				startX, startY,
				tileWidth = this.pixelWidth / this.gridWidth,
				tileHeight = this.pixelHeight / this.gridHeight;
			
			this.scene.canvas.context.strokeStyle = "rgba(0,50,0,0.2)";
			
			while(i--) {
				j = this.gridHeight;
				while(j--) {
					this.scene.canvas.context.fillStyle = "rgba(0,110,255,"+Math.min(0.2, (0.5 * this.gridNodes[i][j].length() / (this.nodeLength + 1)))+")";
					
					startX = (i / this.gridWidth) * this.pixelWidth;
					startY = (j / this.gridHeight) * this.pixelHeight;
					
					this.scene.canvas.context.fillRect(startX, startY, tileWidth, tileHeight);
					//this.scene.canvas.context.strokeRect(startX, startY, tileWidth, tileHeight);
				}
			}
					
		},
		
		pixelsToGridNode : function(pixelX, pixelY) {
			var gridspace = this.pixelsToGridSpace(pixelX, pixelY);
			return this.gridNodes[gridspace.x][gridspace.y];
		},
		
		pixelsToGridSpace : function(pixelX, pixelY) {
			var vector = new Evo.Vector();
			
			vector.x = Math.floor((this.gridWidth) * (pixelX / this.pixelWidth));
			vector.y = Math.floor((this.gridHeight) * (pixelY / this.pixelHeight));
			
			vector.x = Math.max(vector.x, 0);
			vector.y = Math.max(vector.y, 0);
			
			vector.x = Math.min(vector.x, this.gridWidth - 1);
			vector.y = Math.min(vector.y, this.gridWidth - 1);
			
			
			return vector;
		},
			
		pixelsToItems : function(pixelX, pixelY) {
			var gridspace = self.pixelsToGridSpace(pixelX, pixelY);
			return this.gridNodes[gridspace.x][gridspace.y].getAllItems();
		},
		
		pixelsAndGridRadiusToItems : function(pixelX, pixelY, gridRadius) {
			var gridspace = self.pixelsToGridSpace(pixelX, pixelY),
				x = gridRadius * -1,
				y = x,
				i, j,
				items = [];
			
			/*
			
			TODO - Move this to the GridNode?
			GridNodes.neighbors = []
			GridNodes.getSurroundingItems();
			
			Matches like this, where o is the node found at the pixel point.
			This is a gridRadius 1
			
			[ ][ ][ ][ ][ ][ ]
			[ ][x][x][x][ ][ ]
			[ ][x][o][x][ ][ ]
			[ ][x][x][x][ ][ ]
			[ ][ ][ ][ ][ ][ ]
			[ ][ ][ ][ ][ ][ ]
			 */
			
			//Go through grid radius;
			while(x <= gridRadius) {
				
				i = (gridspace.x + x) % this.gridWidth;
				
				while(y <= gridRadius) {
					
					j = (gridspace.y + y) % this.gridHeight;
					
					//Build up the return array
					items.concat(this.gridNodes[x][y].getAllItems());
					
					y++;
				}
				x++;
			}
			
			return items;
		}
	};
	
	return self;
})();

/*
 * @require Grid
 */
Evo.GridNode = (function() {
	
	var self = function() {
		this._nodeStack = [];
	};
	
	self.prototype = {
		add : function(item) {
			//If in the stack
			if(this._nodeStack.indexOf(item) === -1) {
				
				this._nodeStack.push(item);
				item.gridNode = this;
				
				return true;
			} else {
				return false;
			}
		},
		
		remove : function(item) {
			this._nodeStack.splice(
				this._nodeStack.indexOf(item), 1
			);
			item.gridNode = null;
		},
		
		getAllItems : function() {
			return this._nodeStack.slice(0);
		},
		
		length : function() {
			return this._nodeStack.length;
		},
		
		destroy : function() {
			this._nodeStack.length = 0;
		},
		
		empty : function() {
			this.destroy();
		}
	};
	
	return self;
})();
/*
 * @require Scene
 */
// Noise possibly too intensive and not distributed enough...
Evo.Random = (function() {
	
	//A pseudo random number generator
	//Generates repeatable noise
	 
	
	function self(seed) {
		this.seed = seed || 10;
	}
	
	self.prototype = {
		
		get : function(max, min) {
			return Math.random();
			//Credit: http://indiegamr.com/generate-repeatable-random-numbers-in-js/
			/*
			max = max || 1;
			min = min || 0;

			this.seed = (this.seed * 9301 + 49297) % 233280;
			var rnd = this.seed / 233280;

			return min + rnd * (max - min);*/
		},
				
		getInt : function(max, min) {
			return parseInt(this.get(max,min), 10);
		}
	};
	
	return self;

})(); //Static object
/*
 * @require Scene
 */
Evo.ExtendSceneTo3d = function(prototypeRef) {

	$.extend(prototypeRef, {

		setup3d : function() {
			this.renderer = undefined;
			this.div = document.getElementById('evo');
			this.scene = new THREE.Scene();
			this.cameraFov = 50;
			this.camera = new THREE.PerspectiveCamera(this.cameraFov, this.canvas.width / this.canvas.height, 1, 5000); //(fov, aspect ratio, near, far frustrum)
			
			
			this.camera.position.x = (this.canvas.width + this.canvas.height) / 4;
			this.camera.position.y = (this.canvas.width + this.canvas.height) / 4;
			this.camera.position.z = (this.canvas.width + this.canvas.height) / 4;
			
			console.log(this.camera.position);
			
			this.controls = new THREE.OrbitControls( this.camera, this.canvas.el );
			this.controls.noZoom = true;

			this.addRenderer();
			this.addLights();
			this.addGrid();
			//this.addBackground();
			this.addEventListeners();
		},

		addLights : function() {
			this.lights = [];
			this.lights[0] = new THREE.AmbientLight( 0xffffff );
			this.lights[1] = new THREE.PointLight( 0xffffff, 1, 0 );
			this.lights[2] = new THREE.PointLight( 0xffffff, 1, 0 );
			this.lights[3] = new THREE.PointLight( 0xffffff, 1, 0 );

			this.lights[1].position.set(0, 200, 0);
			this.lights[2].position.set(100, 200, 100);
			this.lights[3].position.set(-100, -200, -100);

			//this.scene.add( this.lights[0] );
			this.scene.add( this.lights[1] );
			this.scene.add( this.lights[2] );
			this.scene.add( this.lights[3] );
		},

		addGrid : function() {

			var line_material = new THREE.LineBasicMaterial( { color: 0xc0c0f0 } ),
				geometry = new THREE.Geometry(),
				floor = -75, step = 25;

			for ( var i = 0; i <= 40; i ++ ) {

				geometry.vertices.push( new THREE.Vector3( - 500, floor, i * step - 500 ) );
				geometry.vertices.push( new THREE.Vector3(   500, floor, i * step - 500 ) );

				geometry.vertices.push( new THREE.Vector3( i * step - 500, floor, -500 ) );
				geometry.vertices.push( new THREE.Vector3( i * step - 500, floor,  500 ) );

			}

			this.grid = new THREE.Line( geometry, line_material, THREE.LinePieces );
			this.scene.add( this.grid );
			this.grid.scale.multiplyScalar(3);

		},

		addRenderer : function() {
			this.renderer = new THREE.WebGLRenderer({
				canvas : this.canvas.el
			});
			this.renderer.setSize( this.canvas.width, this.canvas.height );
			this.div.appendChild( this.renderer.domElement );
		},

		addEventListeners : function() {
			$(window).on('resize', this.resizeHandler.bind(this));
			
			this.canvas.el.addEventListener( 'mousewheel', this.onMouseWheel.bind(this), false );
			this.canvas.el.addEventListener( 'DOMMouseScroll', this.onMouseWheel.bind(this), false);
		},
				
		addBackground : function() {
			this.backgroundMesh = new THREE.Mesh(
				new THREE.SphereGeometry( 3000, 60, 40 ),
				new THREE.MeshBasicMaterial( { map: this.backgroundTexture } ) 
			);
			this.backgroundMesh.scale.x = -1;
			this.scene.add( this.backgroundMesh );
		},

		resizeHandler : function() {

			console.log('resizing');
			this.camera.aspect = this.canvas.width / this.canvas.height;
			this.camera.updateProjectionMatrix();

			this.renderer.setSize( this.canvas.width, this.canvas.height );

		},

		onMouseWheel : function (event) {
			event.preventDefault();
			// WebKit

			if ( event.wheelDeltaY ) {

				this.cameraFov -= event.wheelDeltaY * 0.05;

			// Opera / Explorer 9

			} else if ( event.wheelDelta ) {

				this.cameraFov -= event.wheelDelta * 0.05;

			// Firefox

			} else if ( event.detail ) {

				this.cameraFov += event.detail * 1.0;

			}
			
			this.cameraFov = Math.min(this.cameraFov, 140);
			this.cameraFov = Math.max(this.cameraFov, 20);
			
			this.camera.projectionMatrix.makePerspective(this.cameraFov, this.canvas.width / this.canvas.height, 1, 5000);

		},

		draw : function() {
			
			this.controls.rotateLeft(0.0005);
			this.controls.update();
			this.renderer.render( this.scene, this.camera );
		}
	});
};

/*
 * @require Scene
 */
Evo.Loop = (function() {
	
	var self = function(scene) {
		
		this.scene = scene;
		
		//Create animation frame
		this._animationFrame = window.requestAnimationFrame	||
			window.webkitRequestAnimationFrame			||
			window.mozRequestAnimationFrame				||
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
		
		runUpdateListeners : function(dt) {
			for(this._uI = 0; this._uI < this._updateLength; ++this._uI) {
				this._updateListeners[this._uI].update(dt);
			}
		},
		
		runDrawListeners : function(dt) {
			for(this._dI = 0; this._dI < this._drawLength; ++this._dI) {
				this._drawListeners[this._dI].draw(dt);
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
/*
 * 
 * @require UI
 */
Evo.SectionNavigator = (function() {

	/*
	 * Navigate between the UI sections 
	 */

	var self = function() {
		
		this.transitionSpeed = 500;
		
		this.$level1 = $("#level1");
		this.$level2 = $("#level2");
		this.$wrapper = $(".section-wrapper");
		
		this.$wrapper.addClass('level1-showing');
		
		//Set handlers
		$('.section-navigator input[type=button]')	.on('mouseup', this.showLevel1.bind(this));
		$('.back-button-input')						.on('mouseup', this.showLevel2.bind(this));
		$('#Binding-toHash')						.on('mouseup', Evo.Binding.prototype.modelToHash);
	};
	
	self.prototype = {
		
		showLevel1 : function(e) {
			if(e) e.preventDefault();
			
			var id = $(e.target).attr('data-id-show');
			if(id) {
				
				$("#"+id).addClass('show');
				this.$wrapper.removeClass('level1-showing');
				this.$wrapper.addClass('level2-showing');
			}
		},
				
		showLevel2 : function(e) {
			if(e) e.preventDefault();
			
			this.$level2.find('fieldset').removeClass('show');
			this.$wrapper.addClass('level1-showing');
			this.$wrapper.removeClass('level2-showing');
			
		}
	};
	
	return self;
})();
/*
 * @require CellFactory
 */
Evo.Cell = (function() {
	
	var self = function(scene, grid, energyGenerator, position) {
		
		this.scene = scene;
		this.grid = grid;
		this.energyGenerator = energyGenerator;
		this.behaviorManager = new Evo.BehaviorManager();
		
		this.position = position;
		this.direction = new Evo.Vector(1,0,0); //Z variable is ignored in 2d mode
		this.bounds = new Evo.Vector(this.scene.canvas.width, this.scene.canvas.height, 1);
		this.speed = 0;
		this.age = 0;
		this.energy = 100;
		this.alive = false;
		this.generation = 1;
		
		this.weightedDirection = new Evo.Vector(0,0,0);
		
		this.weightedSpeed = {
			speed	: 0,
			weight	: 0
		};
		
		if(Evo.Vector.is3d) this.setup3d();
		
		this.phenome = new Evo.Phenome();
		this.phenome.generate();
		this.revert();
		
	};
	
	self.prototype = {
		
		SPEEDCOST : 0.05,
		
		setToAlive : function() {
			if(!this.alive) {
				this.alive = true;
				if(Evo.Vector.is2d) {
					this.scene.loop.registerDraw(this);
				} else {
					this.scene.scene.add(this.object3d);
				}
				this.scene.loop.registerUpdate(this);
			}
		},
				
		setToDead : function() {
			if(this.alive) {
				this.alive = false;
				this.scene.loop.removeDraw(this);
				this.scene.loop.removeUpdate(this);
				if(Evo.Vector.is3d) {
					this.scene.scene.remove(this.object3d);
				}
			}
		},
		
		setup3d : function() {
	
			var boundsSize = (this.scene.canvas.width + this.scene.canvas.height) / 2;
			
			this.bounds = new Evo.Vector(boundsSize, boundsSize, boundsSize);
	
			this.geometry = new THREE.CubeGeometry(5, 5, 5);
		
			this.material = new THREE.MeshPhongMaterial( {
				color: 0x000000,
				specular : new THREE.Color( 0xffffff ),
				shininess : Math.pow(10, 2),
				emissive : new THREE.Color(), //Color set by phenome in this.revert()
				shading : THREE.NoShading,
				wireframe : false,
				wireframeLinewidth : 3
			});
			this.object3d = new THREE.Mesh( this.geometry, this.material );
			
			this.object3d.position = this.position;
		},
		
		destroy : function() {
			this.setToDead();
			//this.grid.removeItem(this);
			this.behaviorManager.destroy();
		},
		
		revert : function() {
			this.size = this.phenome.get('birthSize');
			this.generation++;
			this.fillStyle = Evo.Utilities.rgbToFillstyle(
				this.phenome.get('color_r'),
				this.phenome.get('color_g'),
				this.phenome.get('color_b')
			);
			if(Evo.Vector.is3d) {
				this.material.emissive.setRGB(
					this.phenome.get('color_r') / 255,
					this.phenome.get('color_g') / 255,
					this.phenome.get('color_b') / 255
				);
			}
			this.behaviorManager.revert();
		},
		
		copy : function(parentCell) {
            this.phenome.copy(parentCell.phenome);
			this.position.copy(parentCell.position);
			this.generation = parentCell.generation;
		},
		
		addWeightedDirection : function(vector, weight) {		
	
			if(isNaN(this.weightedDirection.x)) debugger;
			vector.multiplyScalar(weight);
			this.weightedDirection.add(vector);
			
			if(isNaN(this.weightedDirection.x)) debugger;
		},
		
		addWeightedSpeed : function(speed, weight) {
			this.weightedSpeed.speed  += (speed * weight);
			this.weightedSpeed.weight += weight;
		},
		
		draw : function(dt) {
			this.scene.canvas.context.beginPath();
			this.scene.canvas.context.fillStyle = this.fillStyle;
			this.scene.canvas.context.fillRect(this.position.x, this.position.y, this.size, this.size);

			//Messing around

			//this.scene.canvas.context.arc(this.position.x,this.position.y,this.size,0,2*Math.PI); 
			//this.scene.canvas.context.font= (this.size * 5) + "px Arial";
			//this.scene.canvas.context.fillText("cell",this.position.x,this.position.y);

			this.scene.canvas.context.fill();
		},
		
		//Updates
		
		update : function(dt) {
			
			this.energy += this.energyGenerator.get();
			
			this.behaviorManager.update(dt);
			this.update_position(dt);
			//this.update_keepOnScreen(dt);
			
			this.age += dt;
			
			//this.grid.updateItem(this, this.position.x, this.position.y);
		},
		
		update_position : function(dt) {

			var scale3d = 0.0,
				positionOffset;

			if(isNaN(this.weightedDirection.x)) debugger;

			//Calculate weighted speed
			if(this.weightedSpeed.weight > 0) {
				this.speed = this.weightedSpeed.speed / this.weightedSpeed.weight;
			} else {
				this.speed = 0;
			}

			this.size -= this.speed * this.SPEEDCOST;

			this.size = Math.max(this.size, 1);


			//Calculate the position based on the weighted direction
			this.weightedDirection.normalize();
			this.direction.lerp(this.weightedDirection, Math.min(0.0005 * dt, 1));
			
			positionOffset = this.weightedDirection;

			positionOffset.copy(this.direction).multiplyScalar(dt * this.speed);
			this.position.add( positionOffset );

			//Reset weighted values
			this.weightedDirection.multiplyScalar(0);
			this.weightedSpeed.speed = 0;
			this.weightedSpeed.weight = 0;

			if(isNaN(this.position.x)) debugger;
			
			
			if(Evo.Vector.is3d) {
				scale3d = this.size / 10;
				this.object3d.scale.set( scale3d * 2, scale3d * 0.5, scale3d * 0.5 );
				
				this.object3d.rotation.y = Math.atan2( - this.direction.z, this.direction.x );
				this.object3d.rotation.z = Math.asin( this.direction.y );

			}
		},
		
		update_keepOnScreen : function(dt) {
			this.position.x %= this.bounds.x;
			this.position.y %= this.bounds.y;
			this.position.z %= this.bounds.z;
		},
				
		setBindings : function() {

			
			//Energy per second
			new Evo.Binding(
				'speedcost',
				function() { return self.prototype.SPEEDCOST; },
				function(value) {

					value = parseFloat(value, 10);
					self.prototype.SPEEDCOST = value;
				}.bind(this)
			);
		}
	};
	
	return self;
})();
/*
 * @require Phenotype
 */
Evo.Phenome = (function() {
	var self = function() {
		this.phenotype = {};
	};
	
	self.prototype = {
		
		mutate : function() {
			
			this.phenotype.fleeSpeed		.mutate(1, 400);
			this.phenotype.fleeDistance		.mutate(1, 400);
			this.phenotype.birthSize		.mutate(5, 15);
			this.phenotype.growthRate		.mutate(0.000001, 0.005);
			this.phenotype.color_r		.mutate(90, 200, true);
			this.phenotype.color_g		.mutate(90, 200, true);
			this.phenotype.color_b		.mutate(90, 200, true);
		},
		
		generate : function() {
			
			var brightness = 200,
				birthSize = 10 * Math.random() + 5;
			
			this.phenotype.fleeSpeed	= new Evo.Phenotype( 1000 * Math.random() + 500 );
			this.phenotype.color_r		= new Evo.Phenotype( parseInt(Math.random() * brightness, 10) );
			this.phenotype.color_g		= new Evo.Phenotype( parseInt(Math.random() * brightness, 10) );
			this.phenotype.color_b		= new Evo.Phenotype( parseInt(Math.random() * brightness, 10) );
			this.phenotype.fleeDistance = new Evo.Phenotype( (150 * Math.random()) + 180);
			this.phenotype.birthSize	= new Evo.Phenotype( birthSize);
			this.phenotype.growthRate	= new Evo.Phenotype( 0.005 * Math.random() );
			//this.phenotype.divideSize	= new Evo.Phenotype( birthSize * 2.5 );

		},
				
		get : function(name) {
			return this.phenotype[name].value;
		},
		
		copy : function(phenome) {
	
			for(var key in phenome.phenotype) {
				if(phenome.phenotype.hasOwnProperty(key)) {
					this.phenotype[key].value = phenome.phenotype[key].value;
				}
			}
		}
	};
	
	return self;
})();
