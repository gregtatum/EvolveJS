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

Evo.Binding2 = (function() {
	
	/*
	 * Model / View binding
	 * JS Object / DOM Element binding
	 */
	
	var self = function(defaultValue, $view, validator) {
		this.value = defaultValue;
		this.$view = $view;
		this.validator = validator;
		
		this.bind();
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
		
		updateModelFromView : function() {
			
			//Get the requested value change
			var requestedValue = this.getViewValue();
			
			//Validate
			this.value = this.validate(requestedValue);
			
			//Update the input with the set value
			if(this.value !== requestedValue) {
				this.updateView();
			}
		},
		
		updateViewFromModel : function() {
			
			if(this.$view[0] === undefined) return;

			//Radio input
			if(this.$view.is("input[type='radio']")) {
				//TODO this.$view.is(':checked').val();

			//Standard input
			} else if (this.$view.is("input")) {
				this.$view.val(this.value);

			//DOM Element
			} else {
				this.$view.html(this.value);
			}
			
		},
		
		bind : function() {
			this.$view.on('change.Evo-Inputs', this.updateModelFromView.bind(this));
			this.updateView();
		},
		
		unbind : function() {
			this.$view.off('change.Evo-Inputs', this.updateModelFromView);
		}
	};
	
	return self;
})();