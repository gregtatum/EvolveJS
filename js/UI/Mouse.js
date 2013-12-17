/*
 * @require Scene
 */
Evo.Mouse = (function() {
	
	var self = function(scene, canvas) {
		this.position = new Evo.Vector(-10000, -10000);
		this.canvas = canvas;
		this.scene = scene;
		this.drawRadius = 100;
		
		document.addEventListener('mousemove', this.onMouseMove.bind(this));
		document.addEventListener('touchmove', this.onTouchMove.bind(this));
		document.addEventListener('touchend', this.onTouchEnd.bind(this));

		document.ontouchstart = function(e){ 
			e.preventDefault(); 
		};
		
		//TODO - Figure this out
		//this.scene.loop.registerDraw(this);
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
			}
        },
        
        onTouchEnd : function(e) {
            this.position.x = -100000;
            this.position.y = -100000;
        },
        
		setDrawRadius : function(radius) {
			this.drawRadius = radius;
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