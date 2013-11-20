Evo.CellFactory = (function() {
	
	var self = function(scene, mouse) {
			
		this.scene = scene;
		this.grid = new Evo.Grid(
			this.scene,
			6,
			4,
			this.scene.canvas.width,
			this.scene.canvas.height
		);
		
		
		this.cells = [];
		
		this.cellStartCount = 10;
		this.maxCells = 1500;
		this.killDistance = 100;

		this.setBindings();
		this.generateCells();
		
		//$(this.scene.canvas.el).click(this.restart.bind(this));
		$(this.scene.canvas.el).on('mousedown', this.mouseKillCells.bind(this));
		$('#CellFactory-Restart').click(this.restart.bind(this));
		$(window).on('resize', this.rebuildGrid.bind(this));
	};
	
	//Public Methods
	self.prototype = {
		
		//-------------------------------------
		// Registration Functions
		
		update : function(dt) {},
		
		draw : function(dt) {},
        
        generateCells : function() {
            var cell;
            
			for(var i=0; i < this.cellStartCount; i++) {
				
                cell = new Evo.Cell(
					this.scene,
					this.grid,
					this.scene.canvas.width * Math.random(),
					this.scene.canvas.height * Math.random()
				);
					
                cell.generatePhenotype();
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
		
		rebuildGrid : function() {
	
			console.log('rebuildGrid');
			this.grid.resize(this.scene.canvas.width, this.scene.canvas.height);
			
			for(var i=0, il = this.cells.length; i < il; i++) {
                if(this.cells[i]) this.cells[i].update(0);
            }
		},
		
        killAllCells : function() {
			
			
            for(var i=0, il = this.cells.length; i < il; i++) {
                this.cells[i].kill();
            }
            this.cells.length = 0;
            this.grid.emptyAllItems(); //TODO - This shouldn't be needed
            this.generateCells();
        },
		
		mouseKillCells : function(e) {
	
			if(e) e.preventDefault();
			
			
			var click = this.scene.mouse.position.clone();
			
			for(var i=0, il = this.cells.length; i < il; i++) {
				
				if(this.cells[i].position.distance(click) < this.killDistance) {
					this.cells[i].kill();
					this.cells.splice(i, 1);
					il--;
				}
				
				
            }
		},
		
		animateCell : function(cell) {
			
			cell.stateMachine.add(new Evo.States.Roam(cell));
			cell.stateMachine.add(new Evo.States.FleeMouse(cell, this.scene.mouse, cell.phenotype.fleeSpeed, cell.phenotype.fleeDistance));
			cell.stateMachine.add(new Evo.States.GrowAndDivide(cell, this, cell.phenotype.growthRate, cell.phenotype.divideSize));
			//cell.stateMachine.add(new Evo.States.Boids(cell));
			cell.stateMachine.add(new Evo.States.FleeWalls(cell, this.scene.canvas));
			//cell.stateMachine.add(new Evo.States.DieRandomly(cell, this));
			cell.stateMachine.add(new Evo.States.DieWhenCrowded(cell, this));
			
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
            daughterCell.copyPhenotype(cell.phenotype);
            
            
			//Mutate the cells
            //cell.mutate();
            //daughterCell.mutate();
			
			//Revert to children
            cell.revert();
            daughterCell.revert();
			
			this.animateCell(daughterCell);
            
            this.cells.push(daughterCell);
        },
				
		//----------------------------------------------------
		// Bindings
				
		setBindings : function() {
			new Evo.Binding(
				$('#CellFactory-cellStartCount'),
				this.getCellStartCount.bind(this),
				this.setCellStartCount.bind(this)
			);
				
			new Evo.Binding(
				$('#CellFactory-maxCells'),
				this.getMaxCells.bind(this),
				this.setMaxCells.bind(this)
			);
				
			new Evo.Binding(
				$('#CellFactory-killDistance'),
				this.getKillDistance.bind(this),
				this.setKillDistance.bind(this)
			);
				
				
				
		},
		
		setCellStartCount : function(value) {
			value = parseInt(value);
			value = value > 0 ? value : 1;

			this.cellStartCount = value;
		},
		
		getCellStartCount : function() {
			return this.cellStartCount;
		},
		
		setMaxCells : function(value) {
			value = parseInt(value);
			value = value > 0 ? value : 1;

			this.maxCells = value;
		},
		
		getMaxCells : function() {
			return this.maxCells;
		},
		
		setKillDistance : function(value) {
			value = parseInt(value);
			value = value > 0 ? value : 1;

			this.killDistance = value;
		},
		
		getKillDistance : function() {
			return this.killDistance;
		},
		
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
		this.age = 0;
		
		this.weightedDirection = new Evo.Vector(0,0);
		
		this.weightedSpeed = {
			speed	: 0,
			weight	: 0
		};
		
		this.scene.loop.registerDraw(this);
		this.scene.loop.registerUpdate(this);
	};
	
	self.prototype = {
		mutationRate : 0.5,
		mutationFactor : 5,
		
		kill : function() {
			this.scene.loop.removeDraw(this);
			this.scene.loop.removeUpdate(this);
			this.grid.removeItem(this);
			this.stateMachine.kill();
		},
		
		revert : function() {
			this.size = (this.phenotype.birthSize / 2) + (this.phenotype.birthSize / 2) * Math.random();
			this.phenotype.fillStyle = Evo.Utilities.rgbToFillstyle(this.phenotype.color_r, this.phenotype.color_g, this.phenotype.color_b);
		},
		
		mutate : function() {
			if(Math.random() < this.mutationRate) {
				this.phenotype.fleeSpeed *= this.getMutation();
				Math.max(0, this.phenotype.fleeSpeed);
				Math.min(3000, this.phenotype.fleeSpeed);
				
			}
			if(Math.random() < this.mutationRate) {
				this.phenotype.color_r *= this.getMutation();
				this.phenotype.color_g *= this.getMutation();
				this.phenotype.color_b *= this.getMutation();
				
				this.phenotype.color_r = Math.max(this.phenotype.color_r, 0);
				this.phenotype.color_g = Math.max(this.phenotype.color_g, 0);
				this.phenotype.color_b = Math.max(this.phenotype.color_b, 0);
				
				this.phenotype.color_r = Math.min(this.phenotype.color_r, 200);
				this.phenotype.color_g = Math.min(this.phenotype.color_g, 200);
				this.phenotype.color_b = Math.min(this.phenotype.color_b, 200);
				
				this.fillStyle = Evo.Utilities.rgbToFillstyle(this.phenotype.color_r, this.phenotype.color_g, this.phenotype.color_b);
			}
			if(Math.random() < this.mutationRate) {
				this.phenotype.fleeDistance *= this.getMutation();
				Math.max(this.phenotype.fleeDistance, 1);
			}
			if(Math.random() < this.mutationRate) {
				this.phenotype.birthSize *= this.getMutation();
				Math.max(this.phenotype.birthSize, 1);
			}
			if(Math.random() < this.mutationRate) {
				this.phenotype.growthRate *= this.getMutation();
				Math.max(this.phenotype.growthRate, 0.0001);
			}
		},
				
		getMutation : function() {
			return (0.5 - Math.random() + this.mutationFactor) / this.mutationFactor;
		},
		
		generatePhenotype : function() {
			var brightness = 200,
				birthSize = 7 * Math.random() + 3;
			
			this.phenotype = {
				fleeSpeed       :   1000 * Math.random() + 500,
				color_r			:	parseInt(Math.random() * brightness, 10),
				color_g			:	parseInt(Math.random() * brightness, 10),
				color_b			:	parseInt(Math.random() * brightness, 10),
				fillStyle       :   'rgb(0,0,0)',
				fleeDistance    :   (150 * Math.random()) + 180,
				birthSize       :   birthSize,
				growthRate      :   .005 * Math.random(),
				divideSize      :   birthSize * 2.5
			};
			
			this.revert();
		},
		
		copyPhenotype : function(phenotypeRef) {
	
			//this.phenotype = $.extend({}, phenotypeRef);
			this.phenotype = JSON.parse(JSON.stringify(phenotypeRef));
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
			this.scene.canvas.context.fillStyle = this.phenotype.fillStyle;
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
			
			this.age += dt;
			
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