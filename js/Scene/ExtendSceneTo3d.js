/*
 * @require Scene
 * @define ExtendSceneTo3d
 */
Evo.ExtendSceneTo3d = function(prototypeRef) {

	$.extend(prototypeRef, {

		setup3d : function() {
			this.renderer = undefined;
			this.div = document.getElementById('evo');
			this.scene = new THREE.Scene();
			this.cameraFov = 50;
			this.camera = new THREE.PerspectiveCamera(this.cameraFov, this.canvas.width / this.canvas.height, 1, 5000); //(fov, aspect ratio, near, far frustrum)
			
			
			this.camera.position.x = (this.canvas.width + this.canvas.height) / 4;
			this.camera.position.y = (this.canvas.width + this.canvas.height) / 4;
			this.camera.position.z = (this.canvas.width + this.canvas.height) / 4;
			
			console.log(this.camera.position);
			
			this.controls = new THREE.OrbitControls( this.camera, this.canvas.el );
			this.controls.noZoom = true;

			this.addRenderer();
			this.addLights();
			this.addGrid();
			//this.addBackground();
			this.addEventListeners();
		},

		addLights : function() {
			this.lights = [];
			this.lights[0] = new THREE.AmbientLight( 0xffffff );
			this.lights[1] = new THREE.PointLight( 0xffffff, 1, 0 );
			this.lights[2] = new THREE.PointLight( 0xffffff, 1, 0 );
			this.lights[3] = new THREE.PointLight( 0xffffff, 1, 0 );

			this.lights[1].position.set(0, 200, 0);
			this.lights[2].position.set(100, 200, 100);
			this.lights[3].position.set(-100, -200, -100);

			//this.scene.add( this.lights[0] );
			this.scene.add( this.lights[1] );
			this.scene.add( this.lights[2] );
			this.scene.add( this.lights[3] );
		},

		addGrid : function() {

			var line_material = new THREE.LineBasicMaterial( { color: 0xc0c0f0 } ),
				geometry = new THREE.Geometry(),
				floor = -75, step = 25;

			for ( var i = 0; i <= 40; i ++ ) {

				geometry.vertices.push( new THREE.Vector3( - 500, floor, i * step - 500 ) );
				geometry.vertices.push( new THREE.Vector3(   500, floor, i * step - 500 ) );

				geometry.vertices.push( new THREE.Vector3( i * step - 500, floor, -500 ) );
				geometry.vertices.push( new THREE.Vector3( i * step - 500, floor,  500 ) );

			}

			this.grid = new THREE.Line( geometry, line_material, THREE.LinePieces );
			this.scene.add( this.grid );
			this.grid.scale.multiplyScalar(3);

		},

		addRenderer : function() {
			this.renderer = new THREE.WebGLRenderer({
				canvas : this.canvas.el
			});
			this.renderer.setSize( this.canvas.width, this.canvas.height );
			this.div.appendChild( this.renderer.domElement );
		},

		addEventListeners : function() {
			$(window).on('resize', this.resizeHandler.bind(this));
			
			this.canvas.el.addEventListener( 'mousewheel', this.onMouseWheel.bind(this), false );
			this.canvas.el.addEventListener( 'DOMMouseScroll', this.onMouseWheel.bind(this), false);
		},
				
		addBackground : function() {
			this.backgroundMesh = new THREE.Mesh(
				new THREE.SphereGeometry( 3000, 60, 40 ),
				new THREE.MeshBasicMaterial( { map: this.backgroundTexture } ) 
			);
			this.backgroundMesh.scale.x = -1;
			this.scene.add( this.backgroundMesh );
		},

		resizeHandler : function() {

			console.log('resizing');
			this.camera.aspect = this.canvas.width / this.canvas.height;
			this.camera.updateProjectionMatrix();

			this.renderer.setSize( this.canvas.width, this.canvas.height );

		},

		onMouseWheel : function (event) {
			event.preventDefault();
			// WebKit

			if ( event.wheelDeltaY ) {

				this.cameraFov -= event.wheelDeltaY * 0.05;

			// Opera / Explorer 9

			} else if ( event.wheelDelta ) {

				this.cameraFov -= event.wheelDelta * 0.05;

			// Firefox

			} else if ( event.detail ) {

				this.cameraFov += event.detail * 1.0;

			}
			
			this.cameraFov = Math.min(this.cameraFov, 140);
			this.cameraFov = Math.max(this.cameraFov, 20);
			
			this.camera.projectionMatrix.makePerspective(this.cameraFov, this.canvas.width / this.canvas.height, 1, 5000);

		},

		draw : function() {
			
			this.controls.rotateLeft(0.0005);
			this.controls.update();
			this.renderer.render( this.scene, this.camera );
		}
	});
};
