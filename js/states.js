Evo.StateMachine = (function() {
	
	var self = function() {
		this.currentStates = [];
	};
	
	self.prototype = {
		update : function(dt) {
			for(var i in this.currentStates) {
				this.currentStates[i].update(dt);
			}
		},

		add : function(state) {
			if(this.currentStates.indexOf(state) >= 0) return; //Do not add twice
			state.onAdd();
			this.currentStates.push(state);
		},

		remove : function(state) {
			var index = this.currentStates.indexOf(state);
			if(index >= 0) {
				this.currentStates[index].onRemove();
				this.currentStates.splice(index,1);
			}
		},

		has : function(state) {
			return this.currentStates.indexOf(state) >= 0;
		},

		kill : function() {

			//Run all states "kill" method if it exists
			for(var i; i < this.currentStates.length; ++i) {
				this.currentStates[i].actor = null;
				if(typeof this.currentStates[i].kill === "function") {
					this.currentStates[i].kill();
				}
			}

			this.currentStates.length = 0;
		}
	};
	return self;
})();

Evo.States = {};

Evo.States.Roam = (function() {
	
	var self = function(actor) {
		this.actor = actor;
		
		this.speed = 0.05;
		this.direction = new THREE.Vector3(
			(Math.random() * 2) - 1,
			(Math.random() * 2) - 1,
			(Math.random() * 2) - 1
		);
		
	};
	
	self.prototype.update = function() {
		
		this.direction.x = Math.min((Math.random() - 0.5) / 10 + this.direction.x, 1);
		this.direction.y = Math.min((Math.random() - 0.5) / 10 + this.direction.y, 1);
		this.direction.z = Math.min((Math.random() - 0.5) / 10 + this.direction.z, 1);
		
		
		this.actor.addWeightedDirection(this.direction, 1);
		this.actor.addWeightedSpeed(this.speed, 1);
	};
	self.prototype.onAdd = function() {
		
	};
	self.prototype.onRemove = function() {
		
	};
	
	return self;
})();

Evo.States.FleeWalls = (function() {
	
	var self = function(actor, canvas) {
		this.actor = actor;
		this.canvas = canvas;
		
		//The margin is a quarter of the document
		this.MARGIN = 0;
		this.origin = new THREE.Vector3(0,0,0);
		this.direction = new THREE.Vector3(0,0,0);
		this.distance = 0;
		this.fleeStarts = 100;
		this.fleeEnds = 300;
		this.fleeMargin = this.fleeEnds - this.fleeStarts;
		
		this.direction = new THREE.Vector3(0,0,0);
		this.weight = 0;
	};
	
	self.prototype.update = function() {
		
		this.distance = this.origin.distanceTo(this.actor.object3d.position);
		
		//If there is a direction to go
		if(this.distance > this.fleeStarts) {
			
			//Crude/cheap weight calculator
			this.weight = Math.max(this.fleeMargin - (this.distance - this.fleeStarts), 0) / this.fleeMargin;
			
			this.direction.copy(this.actor.object3d.position).normalize().negate();

			this.actor.addWeightedDirection(this.direction, 1);
		}
	};
	self.prototype.onAdd = function() {
		
	};
	self.prototype.onRemove = function() {
		
	};
	
	return self;
})();

Evo.States.Boids = (function() {
	
	var self = function(actor) {
		this.actor = actor;
		
		this.speed = 0.05;
		this.neighborsDirection = new THREE.Vector3(0,0);
		this.neighborsPosition = new THREE.Vector3(0,0);
		this.neighborsPositionSum = new THREE.Vector3(0,0);
		
		this.direction = new THREE.Vector3(
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
			
			this.neighborsPosition.x = neighbors[i].object3d.position.x - this.actor.object3d.position.x;
			this.neighborsPosition.y = neighbors[i].object3d.position.y - this.actor.object3d.position.x;
			
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

Evo.States.FleeMouse = (function() {
	
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
		
		this.currentWeight;
		
		this.prevDirection = new THREE.Vector3(0,0);
		this.prevSpeed = 0.0;
		this.interpolationAmount = 1.0;
	};
	
	self.prototype.update = function(dt) {
		this.direction = Evo.VMath.subtract(this.actor.object3d.position, this.mouse.getPosition());
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
			//this.direction.lerp(this.prevDirection.multiply(this.distanceToMouse), this.interpolationAmount);
			
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

Evo.States.GrowAndDivide = (function() {
	
	var self = function(actor, cellFactory, growthSpeed, divideSize) {
		this.actor = actor;
		this.cellFactory = cellFactory;
		this.growthSpeed = growthSpeed;
		this.divideSize = divideSize;
	};
	
	self.prototype.update = function(dt) {
		
		this.actor.size = this.actor.size + (this.growthSpeed * dt);
		
		if(this.actor.size > this.divideSize) {
			//Make sure we don't get too big
			this.actor.size = this.divideSize;
			
			this.cellFactory.divideCell(this.actor);
		}
	};
	
	self.prototype.onAdd = function() {
		
	};
	
	self.prototype.onRemove = function() {
		
	};
	
	return self;
})();


Evo.States.DieRandomly = (function() {
	
	var self = function(actor, cellFactory) {
		this.actor = actor;
		this.cellFactory = cellFactory;
	};
	
	self.prototype.update = function(dt) {
		
		if(Math.random() < 0.0005) {
			this.cellFactory.cellIsDead(this.actor);
			this.actor.kill();
		}
	};
	
	self.prototype.onAdd = function() {
		
	};
	
	self.prototype.onRemove = function() {
		
	};
	
	return self;
})();