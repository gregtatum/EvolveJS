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