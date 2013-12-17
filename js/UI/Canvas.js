/*
 * @require Scene
 */
Evo.Canvas = (function() {
	
	var self = function(loop) {
		
		this.loop = loop;
		this.ratio = window.devicePixelRatio >= 1 ? window.devicePixelRatio : 1;

		this.$el = $('canvas');
		this.el = this.$el.get(0);
		
		if(!Evo.Vector.is3d) {
			this.context = this.el.getContext('2d');
			this.loop.registerDraw(this);
		}
		
		this.resize();
		$(window).on('resize', this.resize.bind(this));
	};
	
	//Public Methods
	self.prototype = {
		
		resize : function(e) {
			this.el.width = $(window).width() * this.ratio;
			this.el.height = $(window).height() * this.ratio;
			this.width = this.el.width;
			this.height = this.el.height;
			this.left = this.$el.offset().left;
			this.top = this.$el.offset().top;
			
			if(e && this.loop) {
				this.loop.runUpdateListeners(0);
				this.loop.runDrawListeners(0);
			}
		},
		
		draw : function() {
			this.context.clearRect(0,0,this.width, this.height);
		}
	};
	
	return self;
})();