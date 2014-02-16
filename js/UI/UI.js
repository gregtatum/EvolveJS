/*
 * @require Scene
 * @define UI
 * @define UI.Content
 * @description High level module to manage the user interface and DOM elements
 */

	
Evo.UI = function() {
	this.startUniform();
	this.sectionNavigator = new Evo.SectionNavigator();
	this.contentIntro = new Evo.UI.Content.Intro();
	this.$menu = $('.menu');
	window.addEventListener('shake', this.onShakeHideUI.bind(this), false);

};
	
Evo.UI.prototype = {
	startUniform : function() {
		$('input, select, textarea').uniform();
	},
	
	onShakeHideUI : function() {
		this.$menu.toggleClass('shaken');
	}
};

Evo.UI.Content = {};