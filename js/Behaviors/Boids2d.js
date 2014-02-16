/*
 * @require BehaviorManager
 * @define Behavior.Boids2d
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
