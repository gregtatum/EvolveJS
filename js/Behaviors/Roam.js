/*
 * @require BehaviorManager
 * @define Behavior.Roam
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