Evo.Vector = (function() {
	var self = function(x,y) {
		this.x = x;
		this.y = y;
	}
	
	self.prototype.copy = function() {
		return new Evo.Vector(this.x, this.y);
	}

    self.prototype.multiply = function(value) {
		if(typeof(value) === "number") {
			this.x *= value;
			this.y *= value;
		} else {
			this.x *= value.x;
			this.y *= value.y;
		}
		return this;
	}
    
	self.prototype.divide = function(value) {
		if(typeof(value) === "number") {
			this.x /= value;
			this.y /= value;
		} else {
			this.x /= value.x;
			this.y /= value.y;
		}
		return this;
	}
	
	
	self.prototype.add = function(value) {
		
		if(typeof(value) === "number") {
			this.x += value;
			this.y += value;
		} else {
			this.x += value.x;
			this.y += value.y;
		}
		return this;
	}
	
	self.prototype.subtract = function(value) {
		if(typeof(value) === "number") {
			this.x -= value;
			this.y -= value;
		} else {
			this.x -= value.x;
			this.y -= value.y;
		}
		return this;
	}
    
    self.prototype.abs = function() {
		Math.abs(this.x);
		Math.abs(this.y);
		return this;
	}
    
    self.prototype.dot = function(vector) {
		return (this.x * vector.x) + (this.y * vector.y);
	}
    
    self.prototype.length = function() {
		return Math.sqrt(this.dot(this));
	}
    
    self.prototype.distance = function(vectorRef) {
		var vector = vectorRef.copy();
		vector.subtract(this);
		return vector.length();
	}
    
    self.prototype.lengthSqr = function() {
		return this.dot(this);
	}
	
    /*  vector linear interpolation 
        interpolate between two vectors.
        value should be in 0.0f - 1.0f space ( just to skip a clamp operation )
    */
    self.prototype.lerp = function(vector, interpolation) {  
		this.x = this.x + (vector.x - this.x) * interpolation;
		this.y = this.y + (vector.y - this.y) * interpolation;
		return this;
    }
	
    /* normalize a vector */
    self.prototype.normalize  = function() {
		if(this.x !== 0 || this.y !== 0) {
			var length   = this.length();
			this.x = this.x / length;
			this.y = this.y / length;
		}
		return this;
    }
	
	return self;
})();

Evo.VMath = (function() {
	var self = {
		
		multiply : function(vector, value) {
			
			var v = vector.copy();
			v.multiply(value);
			return v;
		},
		
		divide : function(vector, value) {
			
			var v = vector.copy();
			v.divide(value);
			return v;
		},
		
		
		add : function(vector, value) {
			
			var v = vector.copy();
			v.add(value);
			return v;
		},
		
		subtract : function(vector, value) {
			
			var v = vector.copy();
			v.subtract(value);
			return v;
		},
		
		abs : function(vector) {
			
			var v = vector.copy();
			v.abs();
			return v;
		},
		
		dot : function(vector1, vector2) {
			return vector.dot(vector2);
		},
		
		length : function(vector) {
			return Math.sqrt(vector.dot(vector));
		},
		
		distance : function(vector1, vector2) {
			var vector = vector1.copy();
			vector.subtract(vector2);
			return vector.length();
		},
		
		lengthSqr : function(vector) {
			return vector.dot(vector);
		},
		
		/*  vector linear interpolation 
			interpolate between two vectors.
			value should be in 0.0f - 1.0f space ( just to skip a clamp operation )
		*/
		lerp : function(vector1, vector2, interpolation) {
			var v = vector1.copy();
			v.lerp(vector2, interpolation);
			return v;
		},
		
		/* normalize a vector */
		normalize  : function(vector) {
			var v = vector.copy();
			v.normalize();
			return v();
		}
	};
	
	return self;
})();

Evo.Grid = (function() {
	
	var self = function(gridWidth, gridHeight, pixelWidth, pixelHeight) {
		this.gridWidth = gridWidth;
		this.gridHeight = gridHeight;
		this.pixelWidth = pixelWidth;
		this.pixelHeight = pixelHeight;
		
		Evo.Loop.registerDraw(this);
		
		this.create();
	};
	
	self.prototype = {
		create : function() {
			
			var i=this.gridWidth,
				j=this.gridHeight;
			
			this.gridNodes = [];
			
			while(i--) {				
				this.gridNodes[i] = new Array(this.gridHeight);
				j = this.gridHeight;
				
				while(j--) {
					this.gridNodes[i][j] = new Evo.GridNode();
				}
			}
		},
		
		destroy : function() {
			var i=this.gridWidth,
				j=this.gridHeight;
			
			//Destroy this.gridNodes plus all GridNodes on it
			while(i--) {				
				
				j = this.gridHeight;
				
				while(j--) {
					this.gridNodes[i][j].destroy();
				}
				this.gridNodes[i].length = 0;
			}
			this.gridNodes.length = 0;
			this.gridNodes = null;
		},
		
		updateItem : function(item, pixelX, pixelY) {
			var gridNode = this.pixelsToGridNode(pixelX, pixelY);
			
			if(gridNode !== item.gridNode) {
				
				if(item.gridNode) {
					item.gridNode.remove(item)
				}
				gridNode.add(item);
			}
		},
		
		draw : function(dt) {
			var i=this.gridWidth,
				j=this.gridHeight,
				startX, startY,
				tileWidth = this.pixelWidth / this.gridWidth,
				tileHeight = this.pixelHeight / this.gridHeight;
			
			Evo.context.strokeStyle = "rgba(0,50,0,0.2)"
			
			while(i--) {
				j = this.gridHeight;
				while(j--) {
					Evo.context.fillStyle = "rgba(0,0,0,"+(0.05 * this.gridNodes[i][j].length())+")";
					
					startX = (i / this.gridWidth) * this.pixelWidth;
					startY = (j / this.gridHeight) * this.pixelHeight;
					
					Evo.context.fillRect(startX, startY, tileWidth, tileHeight);
					Evo.context.strokeRect(startX, startY, tileWidth, tileHeight);
				}
			}
					
		},
		
		pixelsToGridNode : function(pixelX, pixelY) {
			var gridspace = this.pixelsToGridSpace(pixelX, pixelY);
			return this.gridNodes[gridspace.x][gridspace.y];
		},
		
		pixelsToGridSpace : function(pixelX, pixelY) {
			var vector = new Evo.Vector();
			
			vector.x = Math.floor((this.gridWidth) * (pixelX / this.pixelWidth));
			vector.y = Math.floor((this.gridHeight) * (pixelY / this.pixelHeight));
			
			
			
			return vector;
		},
			
		pixelsToItems : function(pixelX, pixelY) {
			var gridspace = self.pixelsToGridSpace(x, y);
			return this.gridNodes[x][y].getAllItems();
		},
		
		pixelsAndGridRadiusToItems : function(pixelX, pixelY, gridRadius) {
			var gridspace = self.pixelsToGridSpace(x, y),
				x = gridRadius * -1,
				y = x,
				i, j,
				items = [];
			
			/*
			
			Matches like this, where o is the node found at the pixel point.
			This is a gridRadius 1
			
			[ ][ ][ ][ ][ ][ ]
			[ ][x][x][x][ ][ ]
			[ ][x][o][x][ ][ ]
			[ ][x][x][x][ ][ ]
			[ ][ ][ ][ ][ ][ ]
			[ ][ ][ ][ ][ ][ ]
			 */
			
			//Go through grid radius;
			while(x <= gridRadius) {
				
				i = (gridspace.x + x) % this.gridWidth;
				
				while(y <= gridRadius) {
					
					j = (gridspace.y + y) % this.gridHeight;
					
					//Build up the return array
					items.concat(this.gridNodes[x][y].getAllItems());
					
					y++;
				}
				x++;
			}
			
			return items;
		}
	};
	
	return self;
})();

Evo.GridNode = (function() {
	
	var self = function() {
		this._nodeStack = [];
	};
	
	self.prototype = {
		add : function(item) {
			//If in the stack
			if(this._nodeStack.indexOf(item) == -1) {
				
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
			return this._nodeStack.length
		},
		
		destroy : function() {
			this._nodeStack.length = 0;
		}
	}
	
	return self;
})();