/*
 * @require Main
 * 
 * @todo Get rid of custom code and just use Three.js's vectors
 */
Evo.Vector2 = (function() {
	var self = function(x,y) {
		this.x = x || 0;
		this.y = y || 0;
	};
	
	self.is2d = true;
	self.is3d = false;
	
	self.prototype.clone = function() {
		return new Evo.Vector(this.x, this.y);
	};
	
	self.prototype.copy = function(vector) {
		this.x = vector.x;
		this.y = vector.y;
	};

    self.prototype.multiplyScalar = function(value) {
		if(typeof(value) === "number") {
			this.x *= value;
			this.y *= value;
		} else {
			this.x *= value.x;
			this.y *= value.y;
		}
		return this;
	};
	
	self.prototype.divide = function(value) {
		if(typeof(value) === "number") {
			this.x /= value;
			this.y /= value;
		} else {
			this.x /= value.x;
			this.y /= value.y;
		}
		return this;
	};
	
	
	self.prototype.add = function(value) {
		
		if(typeof(value) === "number") {
			this.x += value;
			this.y += value;
		} else {
			this.x += value.x;
			this.y += value.y;
		}
		return this;
	};
	
	self.prototype.subtract = function(value) {
		if(typeof(value) === "number") {
			this.x -= value;
			this.y -= value;
		} else {
			this.x -= value.x;
			this.y -= value.y;
		}
		return this;
	};
    
    self.prototype.abs = function() {
		Math.abs(this.x);
		Math.abs(this.y);
		return this;
	};
    
    self.prototype.dot = function(vector) {
		return (this.x * vector.x) + (this.y * vector.y);
	};
    
    self.prototype.length = function() {
		return Math.sqrt(this.dot(this));
	};
    
    self.prototype.distanceTo = function(vectorRef) {
		var vector = vectorRef.clone();
		vector.subtract(this);
		return vector.length();
	};
    
    self.prototype.lengthSqr = function() {
		return this.dot(this);
	};
	
    /*  vector linear interpolation 
        interpolate between two vectors.
        value should be in 0.0f - 1.0f space ( just to skip a clamp operation )
    */
    self.prototype.lerp = function(vector, interpolation) {  
		this.x = this.x + (vector.x - this.x) * interpolation;
		this.y = this.y + (vector.y - this.y) * interpolation;
		return this;
    };
	
    /* normalize a vector */
    self.prototype.normalize  = function() {
		if(this.x !== 0 || this.y !== 0) {
			var length   = this.length();
			this.x = this.x / length;
			this.y = this.y / length;
		}
		return this;
    };
	
	return self;
})();

Evo.Vector = (function() {

	THREE.Vector2.is2d = true;
	THREE.Vector2.is3d = false;
	THREE.Vector3.is2d = false;
	THREE.Vector3.is3d = true;
	
	//return THREE.Vector3;
	return THREE.Vector2;
})();

Evo.VMath = (function() {
	var self = {
		
		multiplyScalar : function(vector, value) {
			
			var v = vector.clone();
			v.multiply(value);
			return v;
		},
		
		divide : function(vector, value) {
			
			var v = vector.clone();
			v.divide(value);
			return v;
		},
		
		
		add : function(vector, value) {
			
			var v = vector.clone();
			v.add(value);
			return v;
		},
		
		subtract : function(vector, value) {
			
			var v = vector.clone();
			v.subtract(value);
			return v;
		},
		
		abs : function(vector) {
			
			var v = vector.clone();
			v.abs();
			return v;
		},
		
		dot : function(vector1, vector2) {
			return vector1.dot(vector2);
		},
		
		length : function(vector) {
			return Math.sqrt(vector.dot(vector));
		},
		
		distance : function(vector1, vector2) {
			var vector = vector1.clone();
			vector.subtract(vector2);
			return vector.length();
		},
		
		lengthSqr : function(vector) {
			return vector.dot(vector);
		},
		
		/*  vector linear interpolation 
			interpolate between two vectors.
			value should be in 0.0f - 1.0f space ( just to skip a clamp operation )
		*/
		lerp : function(vector1, vector2, interpolation) {
			var v = vector1.clone();
			v.lerp(vector2, interpolation);
			return v;
		},
		
		/* normalize a vector */
		normalize  : function(vector) {
			var v = vector.clone();
			v.normalize();
			return v();
		}
	};
	
	return self;
})();