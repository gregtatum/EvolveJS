/*
* @require Scene
* @define CellFactory
*/

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
		this.killDistanceSq = Math.pow(this.killDistance, 2);
		
		this.scene.mouse.setDrawRadius(this.killDistance);
		this.energyGenerator = new Evo.EnergyGenerator(this.scene, this);
		
		this.cells = [];
		this.deadCells = [];
		this.lastTapTimestamp = 0;
		
		this.setBindings();
		Evo.Cell.prototype.setBindings();
		Evo.Phenotype.prototype.setBindings();
		
		//$(this.scene.canvas.el).click(this.restart.bind(this));
		if(Evo.Vector.is2d) {
			$(this.scene.canvas.el).on('mousedown', this.mouseKillCells2d.bind(this));
			$(this.scene.canvas.el).on('touchstart', this.doubleTap.bind(this));
		} else {
			$(this.scene.canvas.el).on('mousedown', this.mouseKillCells3d.bind(this));
		}
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
				
		doubleTap : function(event) {
			
			//Skip the double, just do it on tap
			if(true || event.timeStamp - this.lastTapTimestamp <= 500) {
				
				this.scene.mouse.setPosition(
					event.originalEvent.touches[0].pageX,
					event.originalEvent.touches[0].pageY
				);
				
				if(Evo.Vector.is2d) {
					this.mouseKillCells2d(event);
				} else {
					this.mouseKillCells3d(event);
				}
			}
			this.lastTapTimestamp = event.timeStamp;
		},
		
		mouseKillCells2d : function(e) {
	
			if(e) e.preventDefault();
			var click = this.scene.mouse.position.clone();
			
			for(var i=0, il = this.cells.length; i < il; i++) {
				
				if(this.cells[i].position.distanceTo(click) < this.killDistance) {
					this.cellIsDead(this.cells[i]);
				}
            }
		},
		
		mouseKillCells3d : function(e) {
	
			if(e) e.preventDefault();
			
			for(var i=0, il = this.cells.length; i < il; i++) {
				
				if(this.scene.mouse.ray.distanceToPoint(this.cells[i].position) < this.killDistance) {
					this.cellIsDead(this.cells[i]);
				}
            }
		},
		
		addBehaviors : function(cell) {
			
			cell.behaviorManager.add(new Evo.Behavior.Roam(cell));
			cell.behaviorManager.add(new Evo.Behavior.GrowAndDivide(cell, this, cell.phenome.get('growthRate'), 1.5));
			//cell.behaviorManager.add(new Evo.Behavior.DieRandomly(cell, this));
			cell.behaviorManager.add(new Evo.Behavior.DieWhenCrowdedOrSmall(cell, this));
			cell.behaviorManager.add(new Evo.Behavior.FleeWalls(cell, this.scene.canvas));
			
			if(Evo.Vector.is2d) {
				//cell.behaviorManager.add(new Evo.Behavior.Boids2d(cell));
				cell.behaviorManager.add(new Evo.Behavior.FleeMouse2d(cell, this.scene.mouse, cell.phenome.get('fleeSpeed'), cell.phenome.get('fleeDistance')));	
			} else {
				cell.behaviorManager.add(new Evo.Behavior.FleeMouse3d(cell, this.scene.mouse, cell.phenome.get('fleeSpeed'), cell.phenome.get('fleeDistance')));
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
					value = parseInt(value, 10);
					value = value > 0 ? value : 1;

					this.cellStartCount = value;
				}.bind(this)
			);
				
			new Evo.Binding(
				'maxcells',
				function() { return this.maxCells; }.bind(this),
				function(value) {
					value = parseInt(value, 10);
					value = value > 0 ? value : 1;
					value = Math.min(value, 10000);
					this.setMaxCells(value);
				}.bind(this)
			);
				
			new Evo.Binding(
				'killdistance',
				function() { return this.killDistance; }.bind(this),
				function(value) {
					value = parseInt(value, 10);
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
