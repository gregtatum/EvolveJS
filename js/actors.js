Evo.CellFactory = (function() {
	
	var self = function(scene) {
			
		this.scene = scene;
		
		this.numberOfCells = 10;
		this.cells = [];
		this.maxCells = 1500;
		this.distributionDistance = 50;
		this.generateCells();
		
		//$(this.scene.canvas.el).click(this.restart.bind(this));
		//$(this.scene.canvas.el).click(this.mouseKillCells.bind(this));
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
					this.distributionDistance * Math.random(),
					this.distributionDistance * Math.random(),
					this.distributionDistance * Math.random()
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
		
		/*
		mouseKillCells : function(e) {
	
			var click = new THREE.Vector3(e.pageX, e.pageY, 0);
			
			for(var i=0, il = this.cells.length; i < il; i++) {
				
				if(this.cells[i].position.distance(click) < 100) {
					this.cells[i].kill();
					this.cells.splice(i, 1);
					il--;
				}
				
				
            }
		},
		*/
		
		animateCell : function(cell) {
			
			cell.stateMachine.add(new Evo.States.Roam(cell));
			//cell.stateMachine.add(new Evo.States.FleeMouse(cell, this.scene.mouse, cell.dna.fleeSpeed, cell.dna.fleeDistance));
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
				cell.object3d.position.x,
				cell.object3d.position.y,
				cell.object3d.position.z
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
	
	var self = function(scene, x, y, z) {
		
		this.scene = scene;
		
		this.stateMachine = new Evo.StateMachine();
		this.direction = new THREE.Vector3(1,0,0);
		this.speed = new THREE.Vector3(0,0,0);
		
		this.weightedDirection = new THREE.Vector3(0,0,0);
		
		this.weightedSpeed = {
			speed	: 0,
			weight	: 0
		};
		
		this.geometry = new THREE.CubeGeometry(5, 5, 5);
		
		this.material = new THREE.MeshPhongMaterial( {
			color: 0x000000,
			specular : new THREE.Color( 0xffffff ),
			shininess : Math.pow(10, 2),
			emissive : new THREE.Color( 0x666686 ),
			shading : THREE.NoShading,
			wireframe : false,
			wireframeLinewidth : 3
		});
		this.object3d = new THREE.Mesh( this.geometry, this.material );
		this.object3d.position.set(x,y,z);
		this.scene.scene.add(this.object3d);
		
		this.scene.loop.registerDraw(this);
		this.scene.loop.registerUpdate(this);
	};
	
	self.prototype = {
		kill : function() {
			this.scene.loop.removeDraw(this);
			this.scene.loop.removeUpdate(this);
			this.scene.scene.remove(this.object3d);
			this.stateMachine.kill();
		},
		
		revert : function() {
			this.material.color = new THREE.Color(this.dna.color);
			this.size = (this.dna.birthSize / 2) + (this.dna.birthSize / 2) * Math.random();
			this.object3d.scale.set(this.size, this.size, this.size);
		},
		
		generateDna : function() {
			var brightness = 200,
				birthSize = 7 * Math.random() + 3;
			
			this.dna = {
				fleeSpeed       :   1000 * Math.random() + 500,
				color2			:   16777215 * Math.random(),
				color			:	Evo.Utilities.rgbToFillstyle(
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
	
			vector.multiplyScalar(weight);
			this.weightedDirection.add(vector);
			
		},
		
		addWeightedSpeed : function(speed, weight) {
			this.weightedSpeed.speed  += (speed * weight);
			this.weightedSpeed.weight += weight;
		},
		
		//Updates
		
		update : function(dt) {
			
			this.stateMachine.update(dt);
			this.update_position(dt);
			//this.update_keepOnScreen(dt);
		},
		
		update_position : function(dt) {
	
			
			this.weightedDirection.normalize();
			
			if(this.weightedSpeed.weight > 0) {
				this.weightedSpeed.speed = this.weightedSpeed.speed / this.weightedSpeed.weight;
			}
			
			var weightedVector = this.weightedDirection.clone();
			weightedVector.multiplyScalar(dt * this.weightedSpeed.speed);
			
			this.object3d.position.add(weightedVector);
			
			this.direction.copy(this.weightedDirection);
			this.speed.copy(this.weightedSpeed);
			
			this.weightedDirection.set(0,0,0);
			this.weightedSpeed.speed = 0;
			this.weightedSpeed.weight = 0;
			
		}
		/*
		update_keepOnScreen : function(dt) {
			if(this.object3d.position.x <= 0) {this.object3d.position.x += this.scene.canvas.width;}
			if(this.object3d.position.y <= 0) {this.object3d.position.y += this.scene.canvas.height;}
			if(this.object3d.position.x > this.scene.canvas.width) {this.object3d.position.x -= this.scene.canvas.width;}
			if(this.object3d.position.y > this.scene.canvas.height) {this.object3d.position.y -= this.scene.canvas.height;}
		}
		*/
	};
	
	return self;
})();