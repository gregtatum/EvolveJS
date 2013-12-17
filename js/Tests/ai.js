var Evo = Evo || {};
Evo.AIThoughts = (function() {
	/*
	 * @require Scene
	 */
	var self = function() {
		this.id;
		this.recencyScore = 0; //0-1
		this.bayesianScore = 0; //0-1
		this.operation = function() {};
		this.input;
		this.output;
		this.callsTimestamp = [new Date().getTime()];
	};
	
	self.prototype = {
		
	};
	
	return self;
})();

Evo.AIGraph = (function() {
	var self = function() {
		
	};
	
	self.prototype = {
	};
	
	return self;
})();