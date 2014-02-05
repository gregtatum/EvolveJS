/*
 * @require CellFactory
 */
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

			if(this.size === 1) debugger;

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