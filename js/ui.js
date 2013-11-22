Evo.UI = (function() {

	var self = function() {
		
		this.$sectionNavigator = $('.section-navigator');
		this.$backButton = $('.back-button');
		this.$sectionNavigator.find('input[type=button]').on('mouseup', this.sectionNavigatorHandler.bind(this));
		$('.back-button-input').on('mouseup', this.exitSectionHandler.bind(this));
	};
	
	self.prototype = {
		sectionNavigatorHandler : function(e) {
			
			
			if(e) e.preventDefault();
			
			var id = $(e.target).attr('data-id-show');
			if(id) {
				$("#"+id).addClass('show');
				this.$backButton.addClass('show');
				this.$sectionNavigator.addClass('hide');
			}
		},
				
		exitSectionHandler : function(e) {
			console.log('hiding section');
			if(e) e.preventDefault();
			$('fieldset').removeClass('show');
			this.$backButton.removeClass('show');
			this.$sectionNavigator.removeClass('hide');
		}
	};
	
	return self;
})();

Evo.Binding = (function() {
	
	/*
	 * Model / View binding
	 * JS Object / DOM Element binding
	 */
	
	var self = function($view, getter, setter) {
		this.$view = $view;
		this.getter = getter;
		this.setter = setter;
		
		this.$view.on('change.Evo-Inputs', this.updateModel.bind(this));
		this.updateView();
	};
	
	//Public Methods
	self.prototype = {
		
		getViewValue : function() {
			
			if(this.$view[0] === undefined) return;

			//Radio input
			if(this.$view.is("input[type='radio']")) {
				return this.$view.is(':checked').val();

			//Standard input
			} else if (this.$view.is("input")) {
				return this.$view.val();

			//DOM Element
			} else {
				return this.$view.html();
			}
			
		},
		
		updateModel : function() {
			
			var requestedValue, setValue;
			
			
			//Get the requested value change
			requestedValue = this.getViewValue();
			
			//Send it to the setter, which should return the value actually set
			this.setter(requestedValue);
			
			//Update the input with the set value
			this.updateView();
		},
				
		updateView : function() {
			
			var value = this.getter();
			
			if(this.$view[0] === undefined) return;

			//Radio input
			if(this.$view.is("input[type='radio']")) {
				//TODO this.$view.is(':checked').val();

			//Standard input
			} else if (this.$view.is("input")) {
				this.$view.val(value);

			//DOM Element
			} else {
				this.$view.html(value);
			}
			
		},
				
		remove : function() {
			this.$view = null;
			this.getter = null;
			this.setter = null;
			this.$view.off('change.Evo-Inputs', this.updateModel);
		}
	};
	
	return self;
})();