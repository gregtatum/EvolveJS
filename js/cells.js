var Evo = Evo || {};

Evo.CellFactory = (function() {
	
	var self = function(scene, mouse) {
			
		this.scene = scene;
		/*this.grid = new Evo.Grid(
			this.scene,
			6,
			4,
			this.scene.canvas.width,
			this.scene.canvas.height
		);*/
		this.grid = null;
		this.oldestGeneration = 1;
		
		this.maxCells = Evo.Vector.is2d ? 1500 : 400;
		this.cellStartCount = parseInt(this.maxCells / 15, 10);
		this.killDistance = 100;
		this.scene.mouse.setDrawRadius(this.killDistance);
		this.energyGenerator = new Evo.EnergyGenerator(this.scene, this);
		
		this.cells = [];
		this.deadCells = [];
		
		this.setBindings();
		Evo.Cell.prototype.setBindings();
		Evo.Phenotype.prototype.setBindings();
		
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
        
		start : function() {
			this.generateCells(this.maxCells);
			
			var cell;
			for(var i=0; i < this.cellStartCount; i++) {
				cell = this.deadCells.pop();
				cell.setToAlive();
			}
		},
		
        generateCells : function(amount) {
            var cell, i;
            
			//Generate new cells for those that don't exist already in the cells array
			for(i = (this.maxCells - amount); i < amount; i++) {
				
                cell = new Evo.Cell(
					this.scene,
					this.grid,
					this.energyGenerator,
					this.getStartingVector(),
					Math.random()
				);
				
				this.deadCells.push(cell);
				this.addBehaviors(cell);
				cell.i = i; //for debug
				this.cells[i] = cell;
			}
        },
				
		getStartingVector : function(vector) {
	
			if(!vector) { vector = new Evo.Vector(); }
			
			if(Evo.Vector.is2d) {
				vector.set(
					this.scene.canvas.width * Math.random(),
					this.scene.canvas.height * Math.random()
				);
				return vector;
			} else {
				var spread = 500;
				new vector.set(
					(spread / 2) - (spread * Math.random()),
					(spread / 2) - (spread * Math.random()),
					(spread / 2) - (spread * Math.random())
				);
					
				return vector;
			}
		},
		
		restart : function() {
			this.killAllCells();
			this.start();
			this.oldestGeneration = 0;
		},
        
		cellIsDead : function(cell) {
			
			var i = this.deadCells.indexOf(cell);
			
			if(i === -1) {
				this.deadCells.push(cell);
			}
			
			cell.setToDead();
		},
		
		rebuildGrid : function() {
	
			/*
			console.log('rebuildGrid');
			this.grid.resize(this.scene.canvas.width, this.scene.canvas.height);
			
			for(var i=0, il = this.cells.length; i < il; i++) {
                if(this.cells[i]) this.cells[i].update(0);
            }*/
		},
		
        killAllCells : function() {
			
            for(var i=0, il = this.cells.length; i < il; i++) {
				if(this.cells[i].alive) {
					this.deadCells.push(this.cells[i]);
				}
                this.cells[i].setToDead();
            }
            //this.grid.emptyAllItems(); //TODO - This shouldn't be needed
            
        },
		
		mouseKillCells : function(e) {
	
			if(e) e.preventDefault();
			
			var click = this.scene.mouse.position.clone();
			
			for(var i=0, il = this.cells.length; i < il; i++) {
				
				if(this.cells[i].position.distanceTo(click) < this.killDistance) {
					this.cells[i].setToDead();
					this.deadCells.push(this.cells[i]);
				}
            }
		},
		
		addBehaviors : function(cell) {
			
			cell.behaviorManager.add(new Evo.Behavior.Roam(cell));
			cell.behaviorManager.add(new Evo.Behavior.GrowAndDivide(cell, this, cell.phenome.get('growthRate'), 1.5));
			//cell.behaviorManager.add(new Evo.Behavior.DieRandomly(cell, this));
			cell.behaviorManager.add(new Evo.Behavior.DieWhenCrowded(cell, this));
			cell.behaviorManager.add(new Evo.Behavior.FleeWalls(cell, this.scene.canvas));
			
			if(Evo.Vector.is2d) {
				//cell.behaviorManager.add(new Evo.Behavior.Boids2d(cell));
				cell.behaviorManager.add(new Evo.Behavior.FleeMouse2d(cell, this.scene.mouse, cell.phenome.get('fleeSpeed'), cell.phenome.get('fleeDistance')));	
			}
		},
		
        divideCell : function(parentCell) {
	
			if(this.deadCells.length === 0) return;
            
            //Grab a dead cell
            var daughterCell = this.deadCells.pop();
			
			daughterCell.copy(parentCell);
            
			//Mutate the cells
            parentCell.phenome.mutate();
            daughterCell.phenome.mutate();
			
			//Revert to children
            parentCell.revert();
            daughterCell.revert();
			daughterCell.setToAlive();
			
			this.oldestGeneration = Math.max(parentCell.generation, this.oldestGeneration);
        },
		
		getLiveCells : function() {
			return this.cells.filter(function(cell) {
				return cell.alive;
			});
		},
				
		getLiveCellCount : function() {
			return this.maxCells - this.deadCells.length;
		},
		
		getAveragePositions : function() {
	
			var v1 = new THREE.Vector3();
			
			return function(optionalTarget) {
				var averagePosition = optionalTarget || new THREE.Vector3();

				averagePosition.set(0,0,0);

				return this.cells.filter(function(cell) {
					return cell.alive;
				}).reduce(function(previousValue, currentValue, index, array ) {
					v1.copy(currentValue.position);
					return averagePosition.add(v1.divideScalar(array.length));
				});
			};
		}(),
		
		setMaxCells : function(value) {
			
			if(value > this.maxCells) {
				this.generateCells(value);
			}
			if(value < this.maxCells) {
				
				var i = this.cells.length - 1;
				
				while(i >= value) {
					this.cells[i].destroy();
					this.cells.pop();
					i--;
				}
			}
			
			this.maxCells = value;
		},
		
		setBindings : function() {
			
			new Evo.Binding(
				'startcount',
				function() { return this.cellStartCount; }.bind(this),
				function(value) {
					value = parseInt(value);
					value = value > 0 ? value : 1;

					this.cellStartCount = value;
				}.bind(this)
			);
				
			new Evo.Binding(
				'maxcells',
				function() { return this.maxCells; }.bind(this),
				function(value) {
					value = parseInt(value);
					value = value > 0 ? value : 1;
					value = Math.min(value, 10000);
					this.setMaxCells(value);
				}.bind(this)
			);
				
			new Evo.Binding(
				'killdistance',
				function() { return this.killDistance; }.bind(this),
				function(value) {
					value = parseInt(value);
					value = value > 0 ? value : 1;
					this.scene.mouse.setDrawRadius(value);
					this.killDistance = value;
				}.bind(this)
			);
			
			/*	
			new Evo.Binding(
				'CellFactory-behaviors',
				function() {
					var behaviors = [];
					
					behaviors.push({
						
					});
					
					return behaviors;
				
				}.bind(this),
				function(value) {
			
				}.bind(this)
			);*/
			
		}
	};
	
	return self;
})();

Evo.Cell = (function() {
	
	var self = function(scene, grid, energyGenerator, position) {
		
		this.scene = scene;
		this.grid = grid;
		this.energyGenerator = energyGenerator;
		this.behaviorManager = new Evo.BehaviorManager();
		
		this.position = position;
		this.direction = new Evo.Vector(1,0,0); //Z variable is ignored in 2d mode
		this.bounds = new Evo.Vector(this.scene.canvas.width, this.scene.canvas.height, 1);
		this.speed = 0;
		this.age = 0;
		this.energy = 100;
		this.alive = false;
		this.generation = 1;
		
		this.weightedDirection = new Evo.Vector(0,0,0);
		
		this.weightedSpeed = {
			speed	: 0,
			weight	: 0
		};
		
		if(Evo.Vector.is3d) this.setup3d();
		
		this.phenome = new Evo.Phenome();
		this.phenome.generate();
		this.revert();
		
	};
	
	self.prototype = {
		
		SPEEDCOST : 0.05,
		
		setToAlive : function() {
			if(!this.alive) {
				this.alive = true;
				if(Evo.Vector.is2d) {
					this.scene.loop.registerDraw(this);
				} else {
					this.scene.scene.add(this.object3d);
				}
				this.scene.loop.registerUpdate(this);
			}
		},
				
		setToDead : function() {
			if(this.alive) {
				this.alive = false;
				this.scene.loop.removeDraw(this);
				this.scene.loop.removeUpdate(this);
				if(Evo.Vector.is3d) {
					this.scene.scene.remove(this.object3d);
				}
			}
		},
		
		setup3d : function() {
	
			var boundsSize = (this.scene.canvas.width + this.scene.canvas.height) / 2;
			
			this.bounds = new Evo.Vector(boundsSize, boundsSize, boundsSize);
	
			this.geometry = new THREE.CubeGeometry(5, 5, 5);
		
			this.material = new THREE.MeshPhongMaterial( {
				color: 0x000000,
				specular : new THREE.Color( 0xffffff ),
				shininess : Math.pow(10, 2),
				emissive : new THREE.Color(), //Color set by phenome in this.revert()
				shading : THREE.NoShading,
				wireframe : false,
				wireframeLinewidth : 3
			});
			this.object3d = new THREE.Mesh( this.geometry, this.material );
			
			this.object3d.position = this.position;
		},
		
		destroy : function() {
			this.setToDead();
			//this.grid.removeItem(this);
			this.behaviorManager.destroy();
		},
		
		revert : function() {
			this.size = this.phenome.get('birthSize');
			this.generation++;
			this.fillStyle = Evo.Utilities.rgbToFillstyle(
				this.phenome.get('color_r'),
				this.phenome.get('color_g'),
				this.phenome.get('color_b')
			);
			if(Evo.Vector.is3d) {
				this.material.emissive.setRGB(
					this.phenome.get('color_r') / 255,
					this.phenome.get('color_g') / 255,
					this.phenome.get('color_b') / 255
				);
			}
			this.behaviorManager.revert();
		},
		
		copy : function(parentCell) {
            this.phenome.copy(parentCell.phenome);
			this.position.copy(parentCell.position);
			this.generation = parentCell.generation;
		},
		
		addWeightedDirection : function(vector, weight) {		
	
			if(isNaN(this.weightedDirection.x)) debugger;
			vector.multiplyScalar(weight);
			this.weightedDirection.add(vector);
			
			if(isNaN(this.weightedDirection.x)) debugger;
		},
		
		addWeightedSpeed : function(speed, weight) {
			this.weightedSpeed.speed  += (speed * weight);
			this.weightedSpeed.weight += weight;
		},
		
		draw : function(dt) {
			this.scene.canvas.context.beginPath();
			this.scene.canvas.context.fillStyle = this.fillStyle;
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
			
			this.behaviorManager.update(dt);
			this.update_position(dt);
			//this.update_keepOnScreen(dt);
			
			this.age += dt;
			
			//this.grid.updateItem(this, this.position.x, this.position.y);
		},
		
		update_position : function(dt) {

			var scale3d = 0.0,
				positionOffset;

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
			this.direction.lerp(this.weightedDirection, Math.min(0.0005 * dt, 1));
			
			positionOffset = this.weightedDirection;

			positionOffset.copy(this.direction).multiplyScalar(dt * this.speed);
			this.position.add( positionOffset );

			//Reset weighted values
			this.weightedDirection.multiplyScalar(0);
			this.weightedSpeed.speed = 0;
			this.weightedSpeed.weight = 0;

			if(isNaN(this.position.x)) debugger;
			
			
			if(Evo.Vector.is3d) {
				scale3d = this.size / 10;
				this.object3d.scale.set( scale3d * 2, scale3d * 0.5, scale3d * 0.5 );
				
				this.object3d.rotation.y = Math.atan2( - this.direction.z, this.direction.x );
				this.object3d.rotation.z = Math.asin( this.direction.y );

			}
		},
		
		update_keepOnScreen : function(dt) {
			this.position.x %= this.bounds.x;
			this.position.y %= this.bounds.y;
			this.position.z %= this.bounds.z;
		},
				
		setBindings : function() {

			
			//Energy per second
			new Evo.Binding(
				'speedcost',
				function() { return self.prototype.SPEEDCOST; },
				function(value) {

					value = parseFloat(value, 10);
					self.prototype.SPEEDCOST = value;
				}.bind(this)
			);
		}
	};
	
	return self;
})();

Evo.Phenome = (function() {
	var self = function() {
		this.phenotype = {};
	};
	
	self.prototype = {
		
		mutate : function() {
			
			this.phenotype.fleeSpeed		.mutate(1, 400);
			this.phenotype.fleeDistance		.mutate(1, 400);
			this.phenotype.birthSize		.mutate(5, 15);
			this.phenotype.growthRate		.mutate(0.000001, 0.005);
			this.phenotype.color_r		.mutate(90, 200, true);
			this.phenotype.color_g		.mutate(90, 200, true);
			this.phenotype.color_b		.mutate(90, 200, true);
		},
		
		generate : function() {
			
			var brightness = 200,
				birthSize = 10 * Math.random() + 5;
			
			this.phenotype.fleeSpeed	= new Evo.Phenotype( 1000 * Math.random() + 500 );
			this.phenotype.color_r		= new Evo.Phenotype( parseInt(Math.random() * brightness, 10) );
			this.phenotype.color_g		= new Evo.Phenotype( parseInt(Math.random() * brightness, 10) );
			this.phenotype.color_b		= new Evo.Phenotype( parseInt(Math.random() * brightness, 10) );
			this.phenotype.fleeDistance = new Evo.Phenotype( (150 * Math.random()) + 180);
			this.phenotype.birthSize	= new Evo.Phenotype( birthSize);
			this.phenotype.growthRate	= new Evo.Phenotype( 0.005 * Math.random() );
			//this.phenotype.divideSize	= new Evo.Phenotype( birthSize * 2.5 );

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
	var self = function(defaultValue) {
		this.value = defaultValue;
	};
	
	self.prototype = {
		
		mutationRate : 0.5,
		mutationFactor : 5,
				
		mutate : function(min, max, isInt) {
			
			if(Math.random() < this.mutationRate) {
				this.value *= (0.5 - Math.random() + this.mutationFactor) / this.mutationFactor;
				
				if(min !== undefined) this.value = Math.max(this.value, min);
				if(max !== undefined) this.value = Math.min(this.value, max);
				if(isInt) this.value = parseInt(this.value, 10);
			}
		},
				
		setBindings : function() {
	
			new Evo.Binding(
				'mutationrate',
				function() { return self.prototype.mutationRate; },
				function(value) {
			
					value = parseFloat(value);
					value = Math.max(value, 0);
					value = Math.min(value, 1);
					
					self.prototype.mutationRate = value;
				}
			);
			
			new Evo.Binding(
				'mutationfactor',
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
	
	return self;
})();

Evo.EnergyGenerator = (function() {
	
	var self = function(scene, cellFactory) {
		
		this.energyPerMillisecond = 0.005 * cellFactory.maxCells;
		this.energy = 0;
		this.energyPerActor = 0;
		this.cellFactory = cellFactory;
		
		console.log(this.energyPerMillisecond);
		
		this.scene = scene;
		this.scene.loop.registerUpdate(this);
		
		this.setBindings();
	};
	
	self.prototype = {
		
		update : function(dt) {
			this.energy = this.energyPerMillisecond * dt;
			this.energyPerActor = this.energy / this.cellFactory.getLiveCellCount();
		},
				
		get : function() {
			return this.energyPerActor;
		},
		
		setBindings : function() {

			//Energy per second
			new Evo.Binding(
				'energypersecond',
				function() { return this.energyPerMillisecond; }.bind(this),
				function(value) {
			
					value = parseFloat(value, 10);
					value = Math.max(value, 0);
					
					this.energyPerMillisecond = value;
				}.bind(this)
			);	
		}
	};
	
	return self;
	
})();