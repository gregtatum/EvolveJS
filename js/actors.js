Evo.CellFactory = (function() {
	
	var self = function(scene) {
			
		this.scene = scene;
		this.grid = new Evo.Grid(
			this.scene,
			6,
			4,
			this.scene.canvas.width,
			this.scene.canvas.height
		);
		
		this.numberOfCells = 10;
		this.cells = [];
		this.maxCells = 1500;

		this.generateCells();
		
		//$(this.scene.canvas.el).click(this.restart.bind(this));
		$(this.scene.canvas.el).click(this.mouseKillCells.bind(this));
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
			this.killAllCells();
			this.generateCells();
		},
        
		cellIsDead : function(cell) {
			var i = this.cells.indexOf(cell);
			
			this.cells.splice(i, 1);
		},
		
        killAllCells : function() {
			
			
            for(var i=0, il = this.cells.length; i < il; i++) {
                this.cells[i].kill();
            }
            this.cells.length = 0;
            
            this.generateCells();
        },
				
		mouseKillCells : function(e) {
	
			var click = new Evo.Vector(e.pageX, e.pageY);
			
			for(var i=0, il = this.cells.length; i < il; i++) {
				
				if(this.cells[i].position.distance(click) < 100) {
					this.cells[i].kill();
					this.cells.splice(i, 1);
					il--;
				}
				
				
            }
		},
		
		animateCell : function(cell) {
			
			cell.stateMachine.add(new Evo.States.Roam(cell));
			cell.stateMachine.add(new Evo.States.FleeMouse(cell, this.scene.mouse, cell.dna.fleeSpeed, cell.dna.fleeDistance));
			cell.stateMachine.add(new Evo.States.GrowAndDivide(cell, this, cell.dna.growthRate, cell.dna.divideSize));
			//cell.stateMachine.add(new Evo.States.Boids(cell));
			cell.stateMachine.add(new Evo.States.FleeWalls(cell, this.scene.canvas));
			cell.stateMachine.add(new Evo.States.DieRandomly(cell, this));
			
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
		this.direction = new Evo.Vector(1,0);
		this.speed = new Evo.Vector(0,0);
		
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
	
			if(isNaN(this.weightedDirection.x)) debugger;
			vector.multiply(weight);
			this.weightedDirection.add(vector);
			
			if(isNaN(this.weightedDirection.x)) debugger;
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
	
			
			if(isNaN(this.weightedDirection.x)) debugger;
			
			this.weightedDirection.normalize();
			
			
			if(this.weightedSpeed.weight > 0) {
				this.weightedSpeed.speed = this.weightedSpeed.speed / this.weightedSpeed.weight;
			}
			
			this.position.add(
				Evo.VMath.multiply(this.weightedDirection, dt * this.weightedSpeed.speed)
			);
			
			if(isNaN(this.position.x)) debugger;
			
			this.direction.copy(this.weightedDirection);
			this.speed.copy(this.weightedSpeed);
			
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