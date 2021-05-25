/* global THREE, createjs */

'use strict';

(function() {
  /**
   * A class that displays icon particles joined together to form a word
   *     in space.
   * @author Marc Tambara
   */
  var IconGalaxy = (function() {
    /**
     * @constructor
     */
    function IconGalaxy() {
      /**
       * The word to display.
       * @const {string}
       */
      this.WORD = 'marc@tambara.me';

      /**
       * Canvas width.
       * @const {number}
       */
      this.CANVAS_W = 160;

      /**
       * Canvas height.
       * @const {number}
       */
      this.CANVAS_H = 40;

      // ------------------------------
      // Setup
      // ------------------------------
      this.setupScene();
      this.setupCamera();
      this.addEventListeners();

      // ------------------------------
      // Scene Additions
      // ------------------------------
      this.createBackground();
      this.addLight();
      this.createSpaceParticles();
      this.createWord();

      // ------------------------------
      // Render
      // ------------------------------
      this.render();
    }

    /**
     * Event handler that adjusts the camera's aspect & renderer size
     *     when resizing the window.
     */
    IconGalaxy.prototype.handleResize = function() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    };

    /**
     * Renders the scene.
     */
    IconGalaxy.prototype.render = function() {
      requestAnimationFrame(this.render.bind(this));
      this.renderer.render(this.scene, this.camera);
    };

    /**
     * Initial setup that creates the scene and renderer.
     */
    IconGalaxy.prototype.setupScene = function() {
      // Screen dimensions.
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      // Create the scene.
      this.scene = new THREE.Scene();

      // Create the renderer.
      var performAntialias = window.devicePixelRatio == 1.0;
      this.renderer = new THREE.WebGLRenderer({antialias: performAntialias});
      this.renderer.setClearColor(0x0);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(this.width, this.height);

      // Add the renderer to the dom.
      var container = document.getElementById('container');
      container.appendChild(this.renderer.domElement);
    };

    /**
     * Creates the PerspectiveCamera and configures camera placement.
     */
    IconGalaxy.prototype.setupCamera = function() {
      // Create the camera.
      var cameraAspect = this.width / this.height;
      this.camera = new THREE.PerspectiveCamera(45, cameraAspect, 1, 200000);

      // Set the positioning.
      this.camera.far = 100000;
      this.camera.near = 1;
      this.camera.position.z = 5000;

      // Look towards the center.
      this.camera.lookAt(0, 0, 0);
    };

    /**
     * Adds event listeners to the DOM.
     */
    IconGalaxy.prototype.addEventListeners = function() {
      var _this = this;

      // Add event listener for window resizing.
      window.addEventListener('resize', function(e) {
        _this.handleResize(e);
      }, false);
    };

    /**
     * Adds a gradient background to the scene.
     */
    IconGalaxy.prototype.createBackground = function() {
      // Create the background plane.
      var plane = new THREE.PlaneBufferGeometry(50000, 50000, 1, 1);

      /**
       * Uniforms are variables that have the same value for all vertices.
       *    It can be accessed by both the vertex shader and the fragment shader.
       *    These colors apply a dark bluish gradient.
       */
      var uniforms = {
        topColor: {value: new THREE.Color(0x002256)},
        bottomColor: {value: new THREE.Color(0x000000)}
      };

      /**
       * Vertex shader GLSL code.
       * @type {string}
       */
      var vShader = vertexShader();

      /**
       * Fragment shader GLSL code.
       * @type {string}
       */
      var fShader = fragmentShader();

      // Create material rendered with custom shaders.
      var material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vShader,
        fragmentShader: fShader
      });

      // Create the background mesh.
      var background = new THREE.Mesh(plane, material);

      // Set the background positioning.
      background.position.z = -10000;

      this.scene.add(background);
    };

    /**
     * Adds DirectionalLight to the scene.
     */
    IconGalaxy.prototype.addLight = function() {
      var light = new THREE.DirectionalLight(0xffffff);
      light.position.set(0, 1, +1).normalize();
      this.scene.add(light);
    };

    /**
     * Generates floating space particles.
     */
    IconGalaxy.prototype.createSpaceParticles = function() {
      var PARTICLE_IMAGE = 'assets/images/space_particle.png';

      /**
       * Number of particles on the plane.
       * @type {number}
       */
      var NUM_PARTICLES = 20000;

      /**
       * Spread for the particles' coordinates on the plane.
       *     i.e. 10000 would apply a range of -5000 to 5000.
       * @type {number}
       */
      var SPREAD = 10000;

      // Create the geometry & set the positioning
      var geometry = new THREE.BufferGeometry();
      var vertices = [];
      for (var i = 0; i < NUM_PARTICLES; i++) {
        vertices.push(
          THREE.Math.randFloatSpread(SPREAD),
          THREE.Math.randFloatSpread(SPREAD),
          THREE.Math.randFloatSpread(SPREAD)
        );
      }
      geometry.addAttribute(
        'position',
        new THREE.Float32BufferAttribute(vertices, 3)
      );

      // Create material.
      var material = new THREE.PointsMaterial({
        size: 30,
        color: 0x444444,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        map: new THREE.TextureLoader().load(PARTICLE_IMAGE)
      });

      // Create the points & add them to the scene.
      var points = new THREE.Points(geometry, material);
      this.scene.add(points);
    };

    /**
     * Generates our word from icon particles.
     */
    IconGalaxy.prototype.createWord = function() {
      /**
       * The pixel data for our word represented in a one-dimensional array
       *     containing the data in the RGBA order, with integer values between
       *     0 and 255 (inclusive).
       * @type {Uint8ClampedArray.<number>}
       */
      // var pixelData = this.getWordPixelData();

      /**
       * An array of icon particles for our word.
       * @type {THREE.Mesh[]}
       */
      // var particles = this.createIconParticles();

      /**
       * @todo Form the word by setting the positions of the icon particles
       *     and adding them to the scene.
       */
    };

    /**
     * Uses a Canvas to stage the text of our word and returns the image data.
     * @return {Uint8ClampedArray} Canvas image data representing the rgba data.
     *     of our word in a one-dimensional array.
     */
    IconGalaxy.prototype.getWordPixelData = function() {
      // Create a canvas for staging our word.
      var canvas = document.createElement('canvas');
      canvas.setAttribute('width', this.CANVAS_W + 'px');
      canvas.setAttribute('height', this.CANVAS_H + 'px');

      // Create & stage our text.
      var FONT_NAME = 'ui-monospace';
      var stage = new createjs.Stage(canvas);
      var text = new createjs.Text(this.WORD, '20px ' + FONT_NAME, '#FFF');
      text.textAlign = 'center';
      text.x = this.CANVAS_W / 2;
      stage.addChild(text);
      stage.update();

      // Return the image rgba data.
      var ctx = canvas.getContext('2d');
      return ctx.getImageData(0, 0, this.CANVAS_W, this.CANVAS_H).data;
    };

    /**
     * Generates the icon particles within the word.
     * @return {THREE.Mesh[]} Array of icon particles.
     */
    IconGalaxy.prototype.createIconParticles = function() {
      /**
       * @todo Swap this out for the icon particle texture.
       */
      var PARTICLE_IMAGE = 'assets/images/space_particle.png';

      /**
       * Array of icon particles.
       * @type {THREE.Mesh[]}
       */
      var particles = [];

      for (var i = 0; i < this.CANVAS_W * this.CANVAS_H / 2; i++) {
        var geometry = new THREE.PlaneBufferGeometry(40, 40, 1, 1);
        var material = new THREE.MeshLambertMaterial({
          color: 0xffffff,
          map: new THREE.TextureLoader().load(PARTICLE_IMAGE),
          transparent: true,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide
        });
        var mesh = new THREE.Mesh(geometry, material);
        particles.push(mesh);
      }

      return particles;
    };

    /**
     * Setup a vertex shader.
     * The vertex shader runs first; it receives attributes,
     *     calculates/manipulates the position of each individual vertex, and
     *     passes additional data (varyings) to the fragment shader.
     * @function IconGalaxy.vertexShader
     */
    function vertexShader() {
      return `
        varying vec2 vUv;

        void main() {
          vUv = uv;

          vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * modelViewPosition;
        }
      `;
    }

    /**
     * Setup a fragment shader.
     * The fragment (or pixel) shader runs second; it sets the color of each
     *     individual "fragment" (pixel) rendered to the screen.
     * @function IconGalaxy.fragmentShader
     */
    function fragmentShader() {
      return `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        varying vec2 vUv;

        void main() {
          gl_FragColor = vec4(mix(bottomColor, topColor, vUv.y), 1.0);
        }
      `;
    }

    return IconGalaxy;
  })();

  window.addEventListener('load', function() {
    new IconGalaxy();
  });
})();
