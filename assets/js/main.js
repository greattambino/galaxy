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
     * Sets the scene's background color.
     */
    IconGalaxy.prototype.createBackground = function() {
      this.scene.background = new THREE.Color(0x002256);
    };

    return IconGalaxy;
  })();

  window.addEventListener('load', function() {
    new IconGalaxy();
  });
})();
