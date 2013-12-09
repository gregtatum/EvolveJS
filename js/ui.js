var Evo = Evo || {};

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

Evo.SectionNavigator = (function() {

	/*
	 * Navigate between the UI sections 
	 */

	var self = function() {
		
		this.transitionSpeed = 500;
		
		this.$level1 = $("#level1");
		this.$level2 = $("#level2");
		this.$wrapper = $(".section-wrapper");
		
		this.$wrapper.addClass('level1-showing');
		
		//Set handlers
		$('.section-navigator input[type=button]')	.on('mouseup', this.showLevel1.bind(this));
		$('.back-button-input')						.on('mouseup', this.showLevel2.bind(this));
		$('#Binding-toHash')						.on('mouseup', Evo.Binding.prototype.modelToHash);
	};
	
	self.prototype = {
		
		showLevel1 : function(e) {
			if(e) e.preventDefault();
			
			var id = $(e.target).attr('data-id-show');
			if(id) {
				
				$("#"+id).addClass('show');
				this.$wrapper.removeClass('level1-showing');
				this.$wrapper.addClass('level2-showing');
			}
		},
				
		showLevel2 : function(e) {
			if(e) e.preventDefault();
			
			this.$level2.find('fieldset').removeClass('show');
			this.$wrapper.addClass('level1-showing');
			this.$wrapper.removeClass('level2-showing');
			
		}
	};
	
	return self;
})();

Evo.Binding = (function() {
	
	/*
	 * Model / View binding
	 * JS Object / DOM Element binding
	 */
	
	var self = function(domId, getter, setter) {
		this.domId = domId;
		this.$view = $('#'+domId);
		this.getter = getter;
		this.setter = setter;
		
		this.$view.on('change.Evo-Binding', this.updateModel.bind(this));
		this.updateView();
		
		self.prototype._allBindings.push(this);
	};
	
	//Public Methods
	self.prototype = {
		
		_allBindings : [],
		
		modelToHash : function() {
			
			var bindings = self.prototype._allBindings,
				params = [];
				
			for(var i = 0, il = bindings.length; i < il; i++) {
				params.push({
					name  : bindings[i].domId,
					value : bindings[i].getViewValue()
				});
			}
			window.location.hash = "/?" + $.param(params);
		},
				
		hashToModel : function() {
	
			//Hash to object
			var getVars = (function(a) {
				//http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
				if (a === "") return {};
				var b = [];
				for (var i = 0; i < a.length; ++i) {
					var p=a[i].split('=');
					if (p.length !== 2) continue;
					b.push({
						name : p[0],
						value : decodeURIComponent(p[1].replace(/\+/g, " "))
					});
				}
				return b;
			})(window.location.hash.substr(3).split('&'));
			
			
			var bindings = self.prototype._allBindings,
				g = 0, gl = getVars.length,
				b = 0, bl = bindings.length;
					
			
			for(; g < gl; g++) {
				for(b=0; b < bl; b++) {
					if(bindings[b].domId === getVars[g].name && getVars[g].name !== undefined) {
						bindings[b].updateView(getVars[g].value);
						bindings[b].updateModel();
					}
				}
			}
		},
		
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
			
			var requestedValue = this.getViewValue();
			
			//Send it to the setter, which should return the value actually set
			this.setter(requestedValue);
			
			//Update the input with the set value
			this.updateView();
		},
				
		updateView : function(value) {
			
			if(value === undefined) {
				value = this.getter();
			}
			
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
	
			//Remove prototype reference
			self.prototype._allBindings.splice(
				self.prototype._allBindings.indexOf(this),
				1
			);
			
			this.$view = null;
			this.getter = null;
			this.setter = null;
			this.$view.off('change.Evo-Binding', this.updateModel);
		}
	};
	
	return self;
})();