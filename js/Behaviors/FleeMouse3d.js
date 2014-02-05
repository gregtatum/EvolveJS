/*
 * @require BehaviorManager
 */
Evo.Behavior.FleeMouse3d = (function() {
	
	var self = function(actor, mouse, fleeSpeed, fleeDistance) {
		this.actor = actor;
		this.mouse = mouse; //Evo.Mouse instance
		
		this.closestPointToMouseRay = new Evo.Vector(0,0,0);
		this.direction = new Evo.Vector(0,0,0);
		this.distanceToMouse = 0;
		this.speed = 0;
		this.maxWeight = 2;
		this.weight = 0;
		this.fleeSpeed = fleeSpeed;
		this.fleeDistance = fleeDistance;
		
		this.prevDirection = new Evo.Vector(0,0,0);
		this.prevSpeed = 0;
		this.interpolationAmount = 1;
	};
	
	self.prototype.update = function(dt) {
		
		this.mouse.ray.closestPointToPoint(this.actor.position, this.closestPointToMouseRay);
		this.direction.subVectors(this.actor.position, this.closestPointToMouseRay);
		this.distanceToMouse = this.direction.length();
		
		this.speed = Math.max(0, this.fleeDistance - this.distanceToMouse) / this.fleeSpeed;
		this.weight = (Math.max(0, this.fleeDistance - this.distanceToMouse) / this.fleeDistance) * this.maxWeight;
		
		//Interpolate the speed
		this.interpolationAmount = Math.min(1, 1 - dt / 500);
		this.speed = this.speed + (this.prevSpeed - this.speed) * this.interpolationAmount;
		
		if(this.speed > 0) {
			
			this.direction.normalize();
			
			this.actor.addWeightedDirection(this.direction, this.weight);
			this.actor.addWeightedSpeed(this.speed, this.weight);
		} else {
			this.speed = 0;
		}
		
		this.prevDirection.copy(this.direction);
		this.prevSpeed = this.speed;
		
	};
	
	return self;
})();