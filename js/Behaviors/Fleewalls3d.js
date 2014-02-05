/*
 * @require BehaviorManager
 */

Evo.Behavior.FleeWalls3d = function(actor, canvas) {
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
	
Evo.Behavior.FleeWalls3d.prototype.update = function() {

	this.distance = this.origin.distanceToSquared(this.actor.position);

	if(this.distance > this.fleeStartsSquared) {

		this.direction.copy(this.actor.position).normalize().negate();

		//this.weight = Math.max(this.fleeMargin - (this.distance - this.fleeStarts), 0) / this.fleeMargin;
		this.weight = (this.distance - this.fleeStartsSquared) / this.fleeDenominator;

		this.actor.addWeightedDirection(this.direction, this.weight * 1);
	}
};