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
