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
    }

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

    return IconGalaxy;
  })();

  window.addEventListener('load', function() {
    new IconGalaxy();
  });
})();
