/*
 * @require BehaviorManager
 * @define Behavior.DieWhenCrowdedOrSmall
 */
Evo.Behavior.DieWhenCrowdedOrSmall = (function() {
	
	var self = function(actor, cellFactory) {
		this.actor = actor;
		this.cellFactory = cellFactory;
	};
	
	self.prototype.update = function(dt) {
		
		if(this.actor.size === 1) {
			
			this.cellFactory.cellIsDead(this.actor);
			
		} else {
			
			if(Math.random() < 0.2 * (this.cellFactory.getLiveCellCount() / this.cellFactory.maxCells)) {

				if(Math.random() < 0.05 * (this.actor.age / 10000)) {

					this.cellFactory.cellIsDead(this.actor);

				}
			}
		}
		
	};
	
	return self;
})();