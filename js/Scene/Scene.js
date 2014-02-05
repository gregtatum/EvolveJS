/*
 * @require Main
 */
Evo.Scene = (function() {
	
	var self = function() {
			
		if(Evo.Vector.is3d) {
			//Todo - Make/use a texture loader? hook into setup3d
			this.backgroundTexture = THREE.ImageUtils.loadTexture(
				'images/tmp_background2.jpg',
				new THREE.UVMapping(),
				this.start.bind(this)
			);
		} else {
			this.start();
		}

	};
	
	self.prototype = {
		start : function() {
			this.loop = new Evo.Loop(this);
			this.canvas = new Evo.Canvas(this.loop);
			this.mouse = new Evo.Mouse(this, this.canvas);
			this.cellFactory = new Evo.CellFactory(this);

			//TODO - Make a bindings manager?
			Evo.Behavior.GrowAndDivide.prototype.setBindings();
			Evo.Binding.prototype.hashToModel();

			
			if(Evo.Vector.is3d) {
				Evo.ExtendSceneTo3d(self.prototype);
				this.setup3d();
				this.loop.registerDraw(this);
			}

			this.cellFactory.start();
			this.loop.start();
		}
				
	};
	
	return self;
})();