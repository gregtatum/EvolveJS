Evo.CellFactory = (function() {
	
	var self = function(scene) {
			
		this.scene = scene;
		this.grid = new Evo.Grid(this.scene, 14, 13, this.scene.canvas.width, this.scene.canvas.height);
		
		this.numberOfCells = 10;
		this.cells = [];
		this.maxCells = 1500;

		this.generateCells();
		
		$(this.scene.canvas.el).click(this.restart.bind(this));
	};
	
	//Public Methods
	self.prototype = {
		
		//-------------------------------------
		// Registration Functions
		
		update : function(dt) {
		
		},
		
		draw : function(dt) {
		},
        
        generateCells : function() {
            var cell;
            
			for(var i=0; i < this.numberOfCells; i++) {
				
                cell = new Evo.Cell(
					this.scene,
					this.grid,
					this.scene.canvas.width * Math.random(),
					this.scene.canvas.height * Math.random()
				);
					
                cell.generateDna();
				this.animateCell(cell);
				this.cells.push(cell);
				cell.i = i; //for debug
			}
        },
				
		restart : function() {
			this.killCells();
			this.generateCells();
		},
        
        killCells : function() {
			
            for(var i in this.cells) {
                this.cells[i].kill();
            }
            this.cells.length = 0;
            
            this.generateCells();
        },
		
		animateCell : function(cell) {
			
			cell.stateMachine.add(new Evo.States.Roam(cell));
			cell.stateMachine.add(new Evo.States.FleeMouse(cell, this.scene.mouse, cell.dna.fleeSpeed, cell.dna.fleeDistance));
			cell.stateMachine.add(new Evo.States.GrowAndDivide(cell, this, cell.dna.growthRate, cell.dna.divideSize));
			
		},
		
        divideCell : function(cell) {
            if(this.cells.length > this.maxCells) return;
            
            //Copy the cell
            var daughterCell = new Evo.Cell(
				this.scene,
				this.grid,
				cell.position.x,
				cell.position.y
			);
            daughterCell.copyDna(cell.dna);
            
            //Revert to children
            cell.revert();
            daughterCell.revert();
			this.animateCell(daughterCell);
            
            this.cells.push(daughterCell);
        }
	};
	
	return self;
})();

Evo.Cell = (function() {
	
	var self = function(scene, grid, x, y) {
		
		this.scene = scene;
		this.grid = grid;
		
		this.stateMachine = new Evo.StateMachine();
		this.position = new Evo.Vector(x,y);
		
		this.weightedDirection = new Evo.Vector(0,0);
		
		this.weightedSpeed = {
			speed	: 0,
			weight	: 0
		};
		
		this.scene.loop.registerDraw(this);
		this.scene.loop.registerUpdate(this);
	};
	
	self.prototype = {
		kill : function() {
			this.scene.loop.removeDraw(this);
			this.scene.loop.removeUpdate(this);
			this.grid.removeItem(this);
			this.stateMachine.kill();
		},
		
		revert : function() {
			this.size = (this.dna.birthSize / 2) + (this.dna.birthSize / 2) * Math.random();
		},
		
		generateDna : function() {
			var brightness = 200,
				birthSize = 7 * Math.random() + 3;
			
			this.dna = {
				fleeSpeed       :   1000 * Math.random() + 500,
				fillStyle       :   Evo.Utilities.rgbToFillstyle(
										parseInt(Math.random() * brightness, 10),
										parseInt(Math.random() * brightness, 10),
										parseInt(Math.random() * brightness, 10)
									),
				fleeDistance    :   (150 * Math.random()) + 180,
				birthSize       :   birthSize,
				growthRate      :   .005 * Math.random(),
				divideSize      :   birthSize * 2.5
			};
			
			this.revert();
		},
		
		copyDna : function(dnaRef) {
			this.dna = $.extend({}, dnaRef);
		},
		
		addWeightedDirection : function(vector, weight) {			
			vector.multiply(weight);
			this.weightedDirection.add(vector);			
		},
		
		addWeightedSpeed : function(speed, weight) {
			this.weightedSpeed.speed  += (speed * weight);
			this.weightedSpeed.weight += weight;
		},
		
		draw : function(dt) {
			
			this.scene.canvas.context.beginPath();
			this.scene.canvas.context.fillStyle = this.dna.fillStyle;
			this.scene.canvas.context.fillRect(this.position.x, this.position.y, this.size, this.size);
			
			//Messing around
			
			//this.scene.canvas.context.arc(this.position.x,this.position.y,this.size,0,2*Math.PI); 
			//this.scene.canvas.context.font= (this.size * 5) + "px Arial";
			//this.scene.canvas.context.fillText("cell",this.position.x,this.position.y);
 
			this.scene.canvas.context.fill();
		},
		
		//Updates
		
		update : function(dt) {
			
			this.stateMachine.update(dt);
			this.update_position(dt);
			this.update_keepOnScreen(dt);
			
			this.grid.updateItem(this, this.position.x, this.position.y);
		},
		
		update_position : function(dt) {
			
			this.weightedDirection.normalize();
			
			if(this.weightedSpeed.weight > 0) {
				this.weightedSpeed.speed = this.weightedSpeed.speed / this.weightedSpeed.weight;
			}
			
			this.position.add(
				Evo.VMath.multiply(this.weightedDirection, dt * this.weightedSpeed.speed)
			);
			
			this.weightedDirection.x = 0;
			this.weightedDirection.y = 0;
			this.weightedSpeed.speed = 0;
			this.weightedSpeed.weight = 0;
			
		},
		
		update_keepOnScreen : function(dt) {
			if(this.position.x <= 0) {this.position.x += this.scene.canvas.width;}
			if(this.position.y <= 0) {this.position.y += this.scene.canvas.height;}
			if(this.position.x > this.scene.canvas.width) {this.position.x -= this.scene.canvas.width;}
			if(this.position.y > this.scene.canvas.height) {this.position.y -= this.scene.canvas.height;}
		}
	};
	
	return self;
})();