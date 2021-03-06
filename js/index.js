		if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

		var renderer, scene, camera, stats;

		var params, amplitude = 1.0;

		var mesh, uniforms;

		var WIDTH = window.innerWidth,
			HEIGHT = window.innerHeight;

		var loader = new THREE.FontLoader();
		loader.load( 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/655010/helvetiker_bold.typeface.json', function ( font ) {

			init( font );
			animate();

		} );

		function init( font ) {

			params = {
				amplitude: 2.0,
				afterimages: false,
			};

			renderer = new THREE.WebGLRenderer( { antialias: true, preserveDrawingBuffer: true } );
			renderer.setClearColor( 0x0F0F0F );
			renderer.setPixelRatio( window.devicePixelRatio );
			renderer.setSize( WIDTH, HEIGHT );
			//renderer.autoClearColor = false;

			camera = new THREE.PerspectiveCamera( 40, WIDTH / HEIGHT, 1, 10000 );
			camera.position.set( -200, 100, 300 );

			controls = new THREE.OrbitControls( camera, renderer.domElement );

			scene = new THREE.Scene();

			//

			var geometry = new THREE.TextGeometry( "KAKUYA", {

				font: font,

				size: 40,
				height: 5,
				curveSegments: 3,

				bevelThickness: 2,
				bevelSize: 2,
				bevelEnabled: true

			});

			geometry.center();

			var tessellateModifier = new THREE.TessellateModifier( 8 );

			for ( var i = 0; i < 6; i ++ ) {

				tessellateModifier.modify( geometry );

			}

			var explodeModifier = new THREE.ExplodeModifier();
			explodeModifier.modify( geometry );

			var numFaces = geometry.faces.length;

			//

			geometry = new THREE.BufferGeometry().fromGeometry( geometry );

			var colors = new Float32Array( numFaces * 3 * 3 );
			var displacement = new Float32Array( numFaces * 3 * 3 );

			var color = new THREE.Color();

			for ( var f = 0; f < numFaces; f ++ ) {

				var index = 9 * f;

				var h = 1.2 * Math.random();
				var s = 8.5 + Math.random();
				var l = 0.5 + Math.random();

				color.setHSL( h, s, l );

				var d = 10 * ( 0.5 - Math.random() );

				for ( var i = 0; i < 3; i ++ ) {

					colors[ index + ( 3 * i )     ] = color.r;
					colors[ index + ( 3 * i ) + 1 ] = color.g;
					colors[ index + ( 3 * i ) + 2 ] = color.b;

					displacement[ index + ( 3 * i )     ] = d;
					displacement[ index + ( 3 * i ) + 1 ] = d;
					displacement[ index + ( 3 * i ) + 2 ] = d;

				}

			}

			geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
			geometry.addAttribute( 'displacement', new THREE.BufferAttribute( displacement, 3 ) );

			//

			uniforms = {

				amplitude: { value: 0.0 }

			};

			var shaderMaterial = new THREE.ShaderMaterial( {

				uniforms:       uniforms,
				vertexShader:   document.getElementById( 'vertexshader' ).textContent,
				fragmentShader: document.getElementById( 'fragmentshader' ).textContent

			});

			//

			mesh = new THREE.Mesh( geometry, shaderMaterial );

			scene.add( mesh );

			var container = document.getElementById( 'container' );
			container.appendChild( renderer.domElement );

			stats = new Stats();
			container.appendChild( stats.dom );

			var gui = new dat.GUI();
			gui.add(params, 'amplitude', 0.0, 20.0).onChange(function(value){
				amplitude = value;
			});
			gui.add(params, 'afterimages').onChange(function(value){
				renderer.autoClearColor = !value;
			});
			gui.open();
			//

			window.addEventListener( 'resize', onWindowResize, false );

		}

		function onWindowResize() {

			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();

			renderer.setSize( window.innerWidth, window.innerHeight );

		}

		function animate() {

			requestAnimationFrame( animate );

			render();

			stats.update();

		}

		function render() {

			var time = Date.now() * 0.001;

			if (amplitude > 0.0)
			uniforms.amplitude.value = 1.0 + Math.sin( time ) * amplitude;
			else uniforms.amplitude.value = 0.0;

			controls.update();

			renderer.render( scene, camera );

		}