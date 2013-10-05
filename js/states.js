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
	
	self.prototype.kill = function() {
		
		//Run all states "kill" method if it exists
		for(var i; i < this.currentStates.length; ++i) {
			this.currentStates[i].actor = null;
			if(typeof this.currentStates[i].kill === "function") {
				this.currentStates[i].kill();
			}
		}
		
		this.currentStates.length = 0;
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
	};
	self.prototype.onAdd = function() {
		
	};
	self.prototype.onRemove = function() {
		
	};
	
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
		
	};
	
	self.prototype.onAdd = function() {
		
	};
	
	self.prototype.onRemove = function() {
		
	};
	
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
	};
	
	self.prototype.onAdd = function() {
		
	};
	
	self.prototype.onRemove = function() {
		
	};
	
	return self;
})();