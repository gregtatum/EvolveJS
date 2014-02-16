/*
 * @require Scene
 * @define Random
 */
// Noise possibly too intensive and not distributed enough...
Evo.Random = (function() {
	
	//A pseudo random number generator
	//Generates repeatable noise
	 
	
	function self(seed) {
		this.seed = seed || 10;
	}
	
	self.prototype = {
		
		get : function(max, min) {
			return Math.random();
			//Credit: http://indiegamr.com/generate-repeatable-random-numbers-in-js/
			/*
			max = max || 1;
			min = min || 0;

			this.seed = (this.seed * 9301 + 49297) % 233280;
			var rnd = this.seed / 233280;

			return min + rnd * (max - min);*/
		},
				
		getInt : function(max, min) {
			return parseInt(this.get(max,min), 10);
		}
	};
	
	return self;

})(); //Static object