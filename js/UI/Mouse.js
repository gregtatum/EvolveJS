/*
 * @require Scene
 * @define Mouse
 */
Evo.Mouse = (function() {
	
	var self = function(scene, canvas) {
		this.position = new Evo.Vector(-10000, -10000);
		this.canvas = canvas;
		this.scene = scene;
		this.drawRadius = 100;
		
		if(Evo.Vector.is2d) {
			document.addEventListener('mousemove', this.onMouseMove.bind(this));
			document.addEventListener('touchmove', this.onTouchMove.bind(this));
			document.addEventListener('touchend', this.onTouchEnd.bind(this));
			this.scene.loop.registerDraw(this);
		} else {
			this.mouse3D = new Evo.Vector(-100000, -100000, 0);
			this.projector = new THREE.Projector();
			this.ray = new THREE.Ray();
			
			this.ray.set(
				new Evo.Vector(-10000, -10000, 0),
				new Evo.Vector(0,0,1)
			);
			
			document.addEventListener('mousemove', this.onMouseMove3d.bind(this));
			document.addEventListener('touchmove', this.onTouchMove.bind(this));
			document.addEventListener('touchend', this.onTouchEnd.bind(this));
		}
		
		document.ontouchstart = function(e){ 
			e.preventDefault(); 
		};
	};
	
	//Public Methods
	self.prototype = {
		
		draw : function() {
			this.canvas.context.strokeStyle = "rgba(140,0,0,0.4)";
			this.canvas.context.arc(this.position.x, this.position.y, this.drawRadius, 0, 2 * Math.PI, false);
			this.canvas.context.lineWidth = 5;
			this.canvas.context.stroke();
		},
		
		onMouseMove : function(e) {
			
			if(typeof(e.pageX) === "number" && e.pageX > this.canvas.left) {
				
				this.position.x = (e.pageX - this.canvas.left) * window.devicePixelRatio;
				this.position.y = (e.pageY - this.canvas.top)  * window.devicePixelRatio;
            } else {
				this.position.x = -100000;
				this.position.y = -100000;
			}
		},
        
		onMouseMove3d : function(e) {
			
			if(typeof(e.pageX) === "number" && e.pageX > this.canvas.left) {
				this.mouse3D.x = ((e.pageX - this.canvas.left) / (this.canvas.width)) * 2 - 1;
				this.mouse3D.y = -(e.pageY / (this.canvas.height - this.canvas.top)) * 2 + 1;
				this.mouse3D.z = 0.5;
				
				this.mouse3D.multiplyScalar(window.devicePixelRatio);
				
				this.projector.unprojectVector(this.mouse3D, this.scene.camera);
				this.ray.set(
					this.scene.camera.position,
					this.mouse3D.sub(this.scene.camera.position).normalize()
				);
				//this.ray.intersectObject(plane);

				this.position.x = e.pageX - this.canvas.left;
				this.position.y = e.pageY - this.canvas.top;
            } else {
				this.position.x = -100000;
				this.position.y = -100000;
			}
		},
        
		
        onTouchMove : function(e) {
            if(e.touches) {
				this.position.x = e.touches[0].pageX - this.canvas.left;
				this.position.y = e.touches[0].pageY - this.canvas.top;
				
				this.position.multiplyScalar(window.devicePixelRatio);
			}
        },
        
        onTouchEnd : function(e) {
            this.position.x = -100000;
            this.position.y = -100000;
        },
        
		setDrawRadius : function(radius) {
			this.drawRadius = radius;
		},
				
		setPosition : function(x, y) {
			this.position.x = x;
			this.position.y = y;
			
			this.position.multiplyScalar(window.devicePixelRatio);
		},
		
		getPosition : function() {
			
			return this.position;
		},
		
		getX : function() {
			return this.position.x;
		},
		
		getY : function() {
			return this.position.y;
		}
	};
	
	return self;
})();