Evo.BehaviorManager = (function() {
	/*
	 * @require Scene
	 * @require Vector
	 */
	
	var self = function() {
		this.currentBehaviors = [];
	};
	
	self.prototype = {
		
		update : function(dt) {
			for(var i in this.currentBehaviors) {
				this.currentBehaviors[i].update(dt);
			}
		},

		add : function(behavior) {
			if(this.currentBehaviors.indexOf(behavior) >= 0) return; //Do not add twice
			if(typeof behavior.onAdd === "function") behavior.onAdd();
			behavior.manager = this;
			this.currentBehaviors.push(behavior);
		},

		remove : function(behavior) {
			var index = this.currentBehaviors.indexOf(behavior);
			if(index >= 0) {
				if(typeof this.currentBehaviors[index] === "function") this.currentBehaviors[index].onRemove();
				this.currentBehaviors[index].manager = null;
				this.currentBehaviors.splice(index,1);
			}
		},

		has : function(behavior) {
			return this.currentBehaviors.indexOf(behavior) >= 0;
		},

		destroy : function() {

			//Run all behaviors "destroy" method if it exists
			for(var i = 0; i < this.currentBehaviors.length; ++i) {
				this.currentBehaviors[i].actor = null;
				if(typeof this.currentBehaviors[i].destroy === "function") {
					this.currentBehaviors[i].destroy();
				}
			}

			this.currentBehaviors.length = 0;
		},
				
		revert : function() {
			//Run all behaviors "destroy" method if it exists
			for(var i = 0; i < this.currentBehaviors.length; ++i) {
				if(typeof this.currentBehaviors[i].revert === "function") {
					this.currentBehaviors[i].revert();
				}
			}
		}
	};
	return self;
})();

Evo.Behavior = {};






