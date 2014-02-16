/*
 * @require UI.Content
 * @define UI.Content.Intro
 * 
 * @description All of the basic UI controllers for the intro content
 * 
 */

	
Evo.UI.Content.Intro = function() {
	this.readMoreLink();
	this.start2d();
	this.start3d();
	this.doToggleAnimation = true;
	this.toggleAnimation();
};

Evo.UI.Content.Intro.prototype = {
	
	toggleAnimation : function() {
		if(this.doToggleAnimation) {
			$('.content-back1, .content-back2').toggleClass('animate');
			setTimeout(this.toggleAnimation.bind(this), 19990);
		}
	},
	
	readMoreLink : function() {
		var $link = $('#content-intro-read-more-link');
		$link.click(function() {
			$link.hide();
			$('#content-intro-read-more').slideDown();
			return false;
		});
	},
	
	start2d : function() {
		var $button = $('#content-intro-start-2d');
		
		if( ! window.CanvasRenderingContext2D ) {
			$button.attr('disabled', 'disabled');
			$button.val('No 2d mode');
			$button.uniform();
		}
		$button.click(function() {
			this.doToggleAnimation = false;
			$('.menu-logo-area').addClass('show');
			$('#ui-show-controls').removeClass('hide');
			window.evo = new Evo.Scene( THREE.Vector2 );
			$('.content').hide();
			return false;
		});

	},
	
	start3d : function() {

		var $button = $('#content-intro-start-3d');
		
		if( !( function () { try { var canvas = document.createElement( 'canvas' ); return !! window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ); } catch( e ) { return false; } } )() ) {
			$button.attr('disabled', 'disabled');
			$button.val('No 3d mode');
			$button.uniform();
		}
		
		$button.click(function() {
			this.doToggleAnimation = false;
			$('.menu-logo-area').addClass('show');
			$('#ui-show-controls').removeClass('hide');
			window.evo = new Evo.Scene( THREE.Vector3 );
			$('.content').hide();
			return false;
		});
	}
	
};