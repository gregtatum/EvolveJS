Evo.UI = (function() {

	var self = function() {
		
		this.$sectionNavigator = $('.section-navigator');
		this.$sectionNavigator.find('input[type=button]').on('mouseup', this.sectionNavigatorHandler.bind(this));
		$('.section-go-back').on('mouseup', this.exitSectionHandler.bind(this));
	};
	
	self.prototype = {
		sectionNavigatorHandler : function(e) {
			
			
			if(e) e.preventDefault();
			
			var id = $(e.target).attr('data-id-show');
			if(id) {
				$("#"+id).addClass('show');
				this.$sectionNavigator.addClass('hide');
			}
		},
				
		exitSectionHandler : function(e) {
			console.log('hiding section');
			if(e) e.preventDefault();
			$(e.target).parents('fieldset').removeClass('show');
			this.$sectionNavigator.removeClass('hide');
		}
	};
	
	return self;
})();