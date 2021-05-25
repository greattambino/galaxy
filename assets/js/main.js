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

      // ------------------------------
      // Render
      // ------------------------------
      this.render();
    }

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

    return IconGalaxy;
  })();

  window.addEventListener('load', function() {
    new IconGalaxy();
  });
})();
