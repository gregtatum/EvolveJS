/*
 * @require Phenotype
 * @define Phenome
 */
Evo.Phenome = (function() {
	var self = function() {
		this.phenotype = {};
	};
	
	self.prototype = {
		
		mutate : function() {
			
			this.phenotype.fleeSpeed		.mutate(1, 400);
			this.phenotype.fleeDistance		.mutate(1, 400);
			this.phenotype.birthSize		.mutate(5, 15);
			this.phenotype.growthRate		.mutate(0.000001, 0.005);
			this.phenotype.color_r		.mutate(90, 200, true);
			this.phenotype.color_g		.mutate(90, 200, true);
			this.phenotype.color_b		.mutate(90, 200, true);
		},
		
		generate : function() {
			
			var brightness = 200,
				birthSize = 10 * Math.random() + 5;
			
			this.phenotype.fleeSpeed	= new Evo.Phenotype( 1000 * Math.random() + 500 );
			this.phenotype.color_r		= new Evo.Phenotype( parseInt(Math.random() * brightness, 10) );
			this.phenotype.color_g		= new Evo.Phenotype( parseInt(Math.random() * brightness, 10) );
			this.phenotype.color_b		= new Evo.Phenotype( parseInt(Math.random() * brightness, 10) );
			this.phenotype.fleeDistance = new Evo.Phenotype( (150 * Math.random()) + 180);
			this.phenotype.birthSize	= new Evo.Phenotype( birthSize);
			this.phenotype.growthRate	= new Evo.Phenotype( 0.005 * Math.random() );
			//this.phenotype.divideSize	= new Evo.Phenotype( birthSize * 2.5 );

		},
				
		get : function(name) {
			return this.phenotype[name].value;
		},
		
		copy : function(phenome) {
	
			for(var key in phenome.phenotype) {
				if(phenome.phenotype.hasOwnProperty(key)) {
					this.phenotype[key].value = phenome.phenotype[key].value;
				}
			}
		}
	};
	
	return self;
})();
