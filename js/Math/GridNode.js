/*
 * @require Grid
 * @define GridNode
 */
Evo.GridNode = (function() {
	
	var self = function() {
		this._nodeStack = [];
	};
	
	self.prototype = {
		add : function(item) {
			//If in the stack
			if(this._nodeStack.indexOf(item) === -1) {
				
				this._nodeStack.push(item);
				item.gridNode = this;
				
				return true;
			} else {
				return false;
			}
		},
		
		remove : function(item) {
			this._nodeStack.splice(
				this._nodeStack.indexOf(item), 1
			);
			item.gridNode = null;
		},
		
		getAllItems : function() {
			return this._nodeStack.slice(0);
		},
		
		length : function() {
			return this._nodeStack.length;
		},
		
		destroy : function() {
			this._nodeStack.length = 0;
		},
		
		empty : function() {
			this.destroy();
		}
	};
	
	return self;
})();