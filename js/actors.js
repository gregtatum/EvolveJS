Evo.CellFactory = (function() {
	
	var _numberOfCells = 10,
        _cells = [],
        _maxCells = 1500;
	
	//Public Methods
	var self = {
		
		onReady : function() {
            self.generateCells();
            $(Evo.canvas).click(self.killCells);
		},
		
		//-------------------------------------
		// Registration Functions
		
		update : function(dt) {
		
		},
		
		draw : function(dt) {
		},
        
        generateCells : function() {
            var cell;
            
			for(var i=0; i < _numberOfCells; i++) {
                cell = new Evo.Cell(Evo.canvas.width * Math.random(), Evo.canvas.height * Math.random());
                cell.generateDna();
				self.animateCell(cell);
				_cells.push(cell);
				cell.i = i; //for debug
			}
        },
        
        killCells : function() {
            for(var i in _cells) {
                _cells[i].kill();
            }
            _cells.length = 0;
            
            self.generateCells();
        },
		
		animateCell : function(cell) {
			
			cell.stateMachine.add(new Evo.States.Roam(cell));
			//cell.stateMachine.add(new Evo.States.FleeMouse(cell, cell.dna.fleeSpeed, cell.dna.fleeDistance));
			cell.stateMachine.add(new Evo.States.GrowAndDivide(cell, cell.dna.growthRate, cell.dna.divideSize));
			
		},
		
        divideCell : function(cell) {
            if(_cells.length > _maxCells) return;
            
            //Copy the cell
            daughterCell = new Evo.Cell(cell.position.x, cell.position.y);
            daughterCell.copyDna(cell.dna);
            
            //Revert to children
            cell.revert();
            daughterCell.revert();
			self.animateCell(daughterCell);
            
            _cells.push(daughterCell);
        }
	};
	
	Evo.init(self);
	return self;
})();

Evo.Cell = (function() {
	
	var self = function(x,y) {
		
		this.position = new Evo.Vector(x,y);
		
		this.weightedDirection = new Evo.Vector(0,0);
		
		this.weightedSpeed = {
			speed	: 0,
			weight	: 0,
		};
		
		this.stateMachine = new Evo.StateMachine();
		
		Evo.Loop.registerDraw(this);
		Evo.Loop.registerUpdate(this);
	};
	
	self.prototype = {
		kill : function() {
			Evo.Loop.removeDraw(this);
			Evo.Loop.removeUpdate(this);
			
			this.stateMachine.kill();
		},
		
		revert : function() {
			this.size = (this.dna.birthSize / 2) + (this.dna.birthSize / 2) * Math.random();
		},
		
		generateDna : function() {
			var brightness = 200,
				birthSize = 7 * Math.random() + 3;
			
			this.dna = {
				fleeSpeed       :   1000 * Math.random() + 500,
				fillStyle       :   Evo.Worker.rgbToFillstyle(
										parseInt(Math.random() * brightness, 10),
										parseInt(Math.random() * brightness, 10),
										parseInt(Math.random() * brightness, 10)
									),
				fleeSpeed       :   1000 * Math.random() + 500,
				fleeDistance    :   (150 * Math.random()) + 180,
				birthSize       :   birthSize,
				growthRate      :   .005 * Math.random(),
				divideSize      :   birthSize * 2.5
			}
			
			this.revert();
		},
		
		copyDna : function(dnaRef) {
			this.dna = $.extend({}, dnaRef);
		},
		
		addWeightedDirection : function(vector, weight) {			
			vector.multiply(weight);
			this.weightedDirection.add(vector);			
		},
		
		addWeightedSpeed : function(speed, weight) {
			this.weightedSpeed.speed  += (speed * weight);
			this.weightedSpeed.weight += weight;
		},
		
		draw : function(dt) {
			Evo.context.beginPath();
			Evo.context.fillStyle = this.dna.fillStyle;
			Evo.context.fillRect(this.position.x, this.position.y, this.size, this.size);
			
			//Messing around
			
			//Evo.context.arc(this.position.x,this.position.y,this.size,0,2*Math.PI); 
			
			//Evo.context.font= (this.size * 5) + "px Arial";
			//Evo.context.fillText("cell",this.position.x,this.position.y);
 
			Evo.context.fill();
		},
		
		//Updates
		
		update : function(dt) {
			
			this.stateMachine.update(dt);
			this.update_position(dt);
			this.update_keepOnScreen(dt);
			
			Evo.Browser.Canvas.grid.updateItem(this, this.position.x, this.position.y);
		},
		
		update_position : function(dt) {
			
			this.weightedDirection.normalize();
			
			if(this.weightedSpeed.weight > 0) {
				this.weightedSpeed.speed = this.weightedSpeed.speed / this.weightedSpeed.weight;
			}
			
			this.position.add(
				Evo.VMath.multiply(this.weightedDirection, dt * this.weightedSpeed.speed)
			);
			
			this.weightedDirection.x = 0;
			this.weightedDirection.y = 0;
			this.weightedSpeed.speed = 0;
			this.weightedSpeed.weight = 0;
			
		},
		
		update_keepOnScreen : function(dt) {
			if(this.position.x <= 0) {this.position.x += Evo.canvas.width;}
			if(this.position.y <= 0) {this.position.y += Evo.canvas.height;}
			if(this.position.x > Evo.canvas.width) {this.position.x -= Evo.canvas.width;}
			if(this.position.y > Evo.canvas.height) {this.position.y -= Evo.canvas.height;}
		}
	};
	
	return self;
})();