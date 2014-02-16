/*
 * @require BehaviorManager
 * @define Behavior.GrowAndDivide
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
