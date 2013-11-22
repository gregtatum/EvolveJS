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
		this.energyGenerator = new Evo.EnergyGenerator(this.scene, this);
		
		this.random = new Evo.Random(3365);
		
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
					this.energyGenerator,
					this.scene.canvas.width * this.random.get(),
					this.scene.canvas.height * this.random.get(),
					this.random.get()
				);
				
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
			cell.stateMachine.add(new Evo.States.FleeMouse(cell, this.scene.mouse, cell.phenome.get('fleeSpeed'), cell.phenome.get('fleeDistance')));
			cell.stateMachine.add(new Evo.States.GrowAndDivide(cell, this, cell.phenome.get('growthRate'), cell.phenome.get('birthSize') * 2.5));
			//cell.stateMachine.add(new Evo.States.Boids(cell));
			cell.stateMachine.add(new Evo.States.FleeWalls2d(cell, this.scene.canvas));
			//cell.stateMachine.add(new Evo.States.DieRandomly(cell, this));
			cell.stateMachine.add(new Evo.States.DieWhenCrowded(cell, this));
			
		},
		
        divideCell : function(cell) {
            if(this.cells.length > this.maxCells) return;
            
            //Copy the cell
            var daughterCell = new Evo.Cell(
				this.scene,
				this.grid,
				this.energyGenerator,
				cell.position.x,
				cell.position.y,
				this.random.get()
			);
            daughterCell.phenome.copy(cell.phenome);
            
            
			//Mutate the cells
            cell.phenome.mutate();
            daughterCell.phenome.mutate();
			
			//Revert to children
            cell.revert();
            daughterCell.revert();
			
			this.animateCell(daughterCell);
            
            this.cells.push(daughterCell);
        },
				
		getCellCount : function() {
			return this.cells.length;
		},
				
		//----------------------------------------------------
		// Bindings
				
		setBindings : function() {
			
			new Evo.Binding(
				$('#CellFactory-cellStartCount'),
				function() { return this.cellStartCount; }.bind(this),
				function(value) {
					value = parseInt(value);
					value = value > 0 ? value : 1;

					this.cellStartCount = value;
				}.bind(this)
			);
				
			new Evo.Binding(
				$('#CellFactory-maxCells'),
				function() { return this.maxCells; }.bind(this),
				function(value) {
					value = parseInt(value);
					value = value > 0 ? value : 1;
					value = Math.min(value, 10000);
					this.maxCells = value;
				}.bind(this)
			);
				
			new Evo.Binding(
				$('#CellFactory-killDistance'),
				function() { return this.killDistance }.bind(this),
				function(value) {
					value = parseInt(value);
					value = value > 0 ? value : 1;

					this.killDistance = value;
				}.bind(this)
			);
				
			new Evo.Binding(
				$('#CellFactory-behaviors'),
				function() {
					var behaviors = [];
					
					behaviors.push({
						
					});
					
					return behaviors;
				
				}.bind(this),
				function(value) {
					value = parseInt(value);
					value = value > 0 ? value : 1;

					this.killDistance = value;
				}.bind(this)
			);
			
		}		
	};
	
	return self;
})();

Evo.Cell = (function() {
	
	var self = function(scene, grid, energyGenerator, x, y, seed) {
		
		this.scene = scene;
		this.grid = grid;
		this.energyGenerator = energyGenerator;
		
		this.random = new Evo.Random(seed);
		
		this.stateMachine = new Evo.StateMachine(seed + 2065);
		
		this.phenome = new Evo.Phenome(seed + 6399);
		this.phenome.generate();
		this.revert();
		
		this.position = new Evo.Vector(x,y);
		this.direction = new Evo.Vector(1,0);
		
		this.speed = 0;
		this.age = 0;
		this.energy = 100;
		
		this.weightedDirection = new Evo.Vector(0,0);
		
		this.weightedSpeed = {
			speed	: 0,
			weight	: 0
		};
		
		this.scene.loop.registerDraw(this);
		this.scene.loop.registerUpdate(this);
	};
	
	self.prototype = {
		
		SPEEDCOST : 1,
				
		kill : function() {
			this.scene.loop.removeDraw(this);
			this.scene.loop.removeUpdate(this);
			this.grid.removeItem(this);
			this.stateMachine.kill();
		},
		
		revert : function() {
			this.size = (this.phenome.get('birthSize') / 2) + (this.phenome.get('birthSize') / 2) * this.random.get();
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
			this.scene.canvas.context.fillStyle = Evo.Utilities.rgbToFillstyle(
					this.phenome.get('color_r'),
					this.phenome.get('color_g'),
					this.phenome.get('color_b')
				);
			this.scene.canvas.context.fillRect(this.position.x, this.position.y, this.size, this.size);
			
			//Messing around
			
			//this.scene.canvas.context.arc(this.position.x,this.position.y,this.size,0,2*Math.PI); 
			//this.scene.canvas.context.font= (this.size * 5) + "px Arial";
			//this.scene.canvas.context.fillText("cell",this.position.x,this.position.y);
 
			this.scene.canvas.context.fill();
		},
		
		//Updates
		
		update : function(dt) {
			
			this.energy += this.energyGenerator.get();
			
			this.stateMachine.update(dt);
			this.update_position(dt);
			this.update_keepOnScreen(dt);
			
			this.age += dt;
			
			this.grid.updateItem(this, this.position.x, this.position.y);
		},
		
		update_position : function(dt) {
	
			if(isNaN(this.weightedDirection.x)) debugger;
			
			//Calculate weighted speed
			if(this.weightedSpeed.weight > 0) {
				this.speed = this.weightedSpeed.speed / this.weightedSpeed.weight;
			} else {
				this.speed = 0;
			}
			
			this.size -= this.speed * this.SPEEDCOST;
			
			this.size = Math.max(this.size, 1);
			
			//Calculate the position based on the weighted direction
			this.weightedDirection.normalize();
			this.direction.copy(this.weightedDirection);
			this.weightedDirection.multiplyScalar(dt * this.speed);
			this.position.add( this.weightedDirection );
			
			//Reset weighted values
			this.weightedDirection.multiplyScalar(0);
			this.weightedSpeed.speed = 0;
			this.weightedSpeed.weight = 0;
			
			if(isNaN(this.position.x)) debugger;
		},
		
		update_keepOnScreen : function(dt) {
			if(this.position.x <= 0) {this.position.x += this.scene.canvas.width;}
			if(this.position.y <= 0) {this.position.y += this.scene.canvas.height;}
			if(this.position.x > this.scene.canvas.width) {this.position.x -= this.scene.canvas.width;}
			if(this.position.y > this.scene.canvas.height) {this.position.y -= this.scene.canvas.height;}
		},
				
		setBindings : function() {

			
			//Energy per second
			new Evo.Binding(
				$('#Cell-SpeedCost'),
				function() { return self.prototype.SPEEDCOST },
				function(value) {

					value = parseFloat(value, 10);
					self.prototype.SPEEDCOST = value;
				}.bind(this)
			);
		}
	};
	
	$(document).ready(self.prototype.setBindings);
	return self;
})();

Evo.Phenome = (function() {
	var self = function(seed) {
		this.random = new Evo.Random(seed);
		this.phenotype = {};
	};
	
	self.prototype = {
		
		mutate : function() {
			
			this.phenotype.fleeSpeed		.mutate(1, 400);
			this.phenotype.fleeDistance		.mutate(1, 400);
			this.phenotype.birthSize		.mutate(5, 15);
			this.phenotype.growthRate		.mutate(.000001, .005);
			this.phenotype.color_r		.mutate(0, 200, true);
			this.phenotype.color_g		.mutate(0, 200, true);
			this.phenotype.color_b		.mutate(0, 200, true);
		},
		
		generate : function() {
			
			var seed = this.random.get(),
				brightness = 200,
				birthSize = 10 * this.random.get() + 5;
			
			this.phenotype.fleeSpeed	= new Evo.Phenotype( 1000 * this.random.get() + 500, (seed + 2945) );
			this.phenotype.color_r		= new Evo.Phenotype( parseInt(this.random.get() * brightness, 10), (seed + 9574) );
			this.phenotype.color_g		= new Evo.Phenotype( parseInt(this.random.get() * brightness, 10), (seed + 2348) );
			this.phenotype.color_b		= new Evo.Phenotype( parseInt(this.random.get() * brightness, 10), (seed + 8975) );
			this.phenotype.fleeDistance = new Evo.Phenotype( (150 * this.random.get()) + 180, (seed + 2875));
			this.phenotype.birthSize	= new Evo.Phenotype( birthSize, (seed + 9587) );
			this.phenotype.growthRate	= new Evo.Phenotype( .005 * this.random.get(), (seed + 1857) );
			//this.phenotype.divideSize	= new Evo.Phenotype( birthSize * 2.5, (seed + 1141) );

		},
				
		get : function(name) {
			return this.phenotype[name].value;
		},
		
		copy : function(phenome) {
	
			for(var key in phenome.phenotype) {
				if(phenome.phenotype.hasOwnProperty(key)) {
					this.phenotype[key].value = phenome.phenotype[key].value;
				}
			}
		}
	};
	
	return self;
})();

Evo.Phenotype = (function() {
	var self = function(defaultValue, seed) {
		this.value = defaultValue;
		this.random = new Evo.Random(seed);
	};
	
	self.prototype = {
		
		mutationRate : 0.5,
		mutationFactor : 5,
				
		mutate : function(min, max, isInt) {
			
			if(this.random.get() < this.mutationRate) {
				this.value *= (0.5 - this.random.get() + this.mutationFactor) / this.mutationFactor;
				
				if(min !== undefined) this.value = Math.max(this.value, min);
				if(max !== undefined) this.value = Math.min(this.value, max);
				if(isInt) this.value = parseInt(this.value, 10);
			}
		},
				
		setBindings : function() {
	
			new Evo.Binding(
				$('#CellFactory-mutationRate'),
				function() { return self.prototype.mutationRate; },
				function(value) {
			
					value = parseFloat(value);
					value = Math.max(value, 0);
					value = Math.min(value, 1);
					
					self.prototype.mutationRate = value;
				}
			);
			
			new Evo.Binding(
				$('#CellFactory-mutationFactor'),
				function() { return 1 / self.prototype.mutationFactor; },
				function(value) {
			
					value = 1 / value;
					value = parseFloat(value);
					value = Math.max(value, 0.00001);
					value = Math.min(value, 1000);
					
					self.prototype.mutationFactor = value;
				}
			);
		}
	};
	
	$(document).ready(self.prototype.setBindings);
	
	return self;
})();

Evo.EnergyGenerator = (function() {
	
	var self = function(scene, cellFactory) {
		
		this.energyPerMillisecond = 10;
		this.energy = 0;
		this.energyPerActor = 0;
		this.cellFactory = cellFactory;
		
		this.scene = scene;
		this.scene.loop.registerUpdate(this);
		
		this.setBindings();
	};
	
	self.prototype = {
		
		update : function(dt) {
			this.energy = this.energyPerMillisecond * dt;
			this.energyPerActor = this.energy / this.cellFactory.getCellCount();
		},
				
		get : function() {
			return this.energyPerActor;
		},
		
		setBindings : function() {

			//Energy per second
			new Evo.Binding(
				$('#EnergyGenerator-energyPerSecond'),
				function() { return this.energyPerMillisecond * 1000; }.bind(this),
				function(value) {
			
					value = parseFloat(value, 10);
					value /= 1000;
					value = Math.max(value, 0);
					
					this.energyPerMillisecond = value;
				}.bind(this)
			);	
		}
	};
	
	return self;
	
})();