/*
 * @require BehaviorManager
 * @define Behavior.DieWhenCrowded
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