/*
 * @require CellFactory
 */
Evo.Phenotype = (function() {
	var self = function(defaultValue) {
		this.value = defaultValue;
	};
	
	self.prototype = {
		
		mutationRate : 0.5,
		mutationFactor : 5,
				
		mutate : function(min, max, isInt) {
			
			if(Math.random() < this.mutationRate) {
				this.value *= (0.5 - Math.random() + this.mutationFactor) / this.mutationFactor;
				
				if(min !== undefined) this.value = Math.max(this.value, min);
				if(max !== undefined) this.value = Math.min(this.value, max);
				if(isInt) this.value = parseInt(this.value, 10);
			}
		},
				
		setBindings : function() {
	
			new Evo.Binding(
				'mutationrate',
				function() { return self.prototype.mutationRate; },
				function(value) {
			
					value = parseFloat(value);
					value = Math.max(value, 0);
					value = Math.min(value, 1);
					
					self.prototype.mutationRate = value;
				}
			);
			
			new Evo.Binding(
				'mutationfactor',
				function() { return 1 / self.prototype.mutationFactor; },
				function(value) {
			
					value = 1 / value;
					value = parseFloat(value);
					value = Math.max(value, 0.00001);
					value = Math.min(value, 1000);
					
					self.prototype.mutationFactor = value;
				}
			);
		}
	};
	
	return self;
})();