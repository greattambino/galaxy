/* global THREE */

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
      // ------------------------------
      // Setup
      // ------------------------------
      this.setupScene();
      this.setupCamera();
      this.addEventListeners();

      // ------------------------------
      // Scene
      // ------------------------------
      this.createBackground();

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
