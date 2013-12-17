/*
 * @require CellFactory
 */
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