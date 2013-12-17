/*
 * @require Scene
 */
Evo.UI = (function() {
	
	/*
	 * High level module to manage the user interface and DOM elements
	 */
	
	var self = function() {
		this.startUniform();
		this.sectionNavigator = new Evo.SectionNavigator();
	};
	
	self.prototype = {
		startUniform : function() {
			$('input, select, textarea').uniform();
		}
	};
	
	return self;
})();