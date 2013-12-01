var Evo = Evo || {};

Evo.Grid = (function() {
	
	var self = function(scene, gridWidth, gridHeight, pixelWidth, pixelHeight) {
		this.scene = scene;
		this.gridWidth = gridWidth;
		this.gridHeight = gridHeight;
		this.pixelWidth = pixelWidth;
		this.pixelHeight = pixelHeight;
		
		this.nodeLength = 0;
		
		this.scene.loop.registerDraw(this);
		
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
				
		emptyAllItems : function() {
	
			var i=this.gridWidth,
				j=this.gridHeight;
			
			while(i--) {				
				
				j = this.gridHeight;
				
				while(j--) {
					this.gridNodes[i][j].empty();
				}
			}
			
			this.nodeLength = 0;
		},
		
		resize : function(pixelWidth, pixelHeight) {
			this.pixelWidth = pixelWidth;
			this.pixelHeight = pixelHeight;
			
			this.emptyAllItems();
		},
				
		removeItems : function(items) {
			var i=items.length;
			
			while(i--) {
				this.removeItem(items[i]);
				this.nodeLength--;
			}
		},
		
		removeItem : function(item) {
			if(item.gridNode) {
				item.gridNode.remove(item);
				this.nodeLength--;
			}
		},
		
		updateItem : function(item, pixelX, pixelY) {
			var gridNode = this.pixelsToGridNode(pixelX, pixelY);
			
			if(gridNode !== item.gridNode) {
				
				if(item.gridNode) {
					item.gridNode.remove(item);
					
					//TODO - After debug reduce to one call
					this.nodeLength--;
				}
				gridNode.add(item);
				
				//TODO
				this.nodeLength++;
			}
		},
		
		draw : function(dt) {
	
			var i=this.gridWidth,
				j=this.gridHeight,
				startX, startY,
				tileWidth = this.pixelWidth / this.gridWidth,
				tileHeight = this.pixelHeight / this.gridHeight;
			
			this.scene.canvas.context.strokeStyle = "rgba(0,50,0,0.2)";
			
			while(i--) {
				j = this.gridHeight;
				while(j--) {
					this.scene.canvas.context.fillStyle = "rgba(0,110,255,"+Math.min(0.2, (0.5 * this.gridNodes[i][j].length() / (this.nodeLength + 1)))+")";
					
					startX = (i / this.gridWidth) * this.pixelWidth;
					startY = (j / this.gridHeight) * this.pixelHeight;
					
					this.scene.canvas.context.fillRect(startX, startY, tileWidth, tileHeight);
					//this.scene.canvas.context.strokeRect(startX, startY, tileWidth, tileHeight);
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
			
			vector.x = Math.max(vector.x, 0);
			vector.y = Math.max(vector.y, 0);
			
			vector.x = Math.min(vector.x, this.gridWidth - 1);
			vector.y = Math.min(vector.y, this.gridWidth - 1);
			
			
			return vector;
		},
			
		pixelsToItems : function(pixelX, pixelY) {
			var gridspace = self.pixelsToGridSpace(pixelX, pixelY);
			return this.gridNodes[gridspace.x][gridspace.y].getAllItems();
		},
		
		pixelsAndGridRadiusToItems : function(pixelX, pixelY, gridRadius) {
			var gridspace = self.pixelsToGridSpace(pixelX, pixelY),
				x = gridRadius * -1,
				y = x,
				i, j,
				items = [];
			
			/*
			
			TODO - Move this to the GridNode?
			GridNodes.neighbors = []
			GridNodes.getSurroundingItems();
			
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