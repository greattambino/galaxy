/* global THREE, createjs, WebFont, TimelineMax, Expo */

'use strict';

(function() {
  /**
   * A class that preloads the necessary fonts.
   * Once loaded, it then instantiates the IconGalaxy class.
   */
  var WebFontPreload = (function() {
    WebFont.load({
      custom: {
        families: ['FontAwesome'],
        urls: [
          'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css'
        ],
        testStrings: {
          'FontAwesome': '\uf270'
        }
      },
      // Instantiate the IconGalaxy class when fonts are loaded.
      active: function() {
        new IconGalaxy();
      }
    });
    return WebFontPreload;
  })();

  /**
   * A class that displays animated 3D graphics of icon particles joining
   *     together to form a word in space.
   * @author Marc Tambara
   */
  var IconGalaxy = (function() {
    /**
     * @constructor
     */
    function IconGalaxy() {
      /**
       * The word to animate and display.
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

      /**
       * Matrix length for icons texture atlas.
       * @const {number}
       */
      this.MATRIX_LENGTH = 8;

      /**
       * Background hue color.
       * @const {float}
       */
      this.HUE = 0.6;

      /**
       * Array of icon particles.
       * @type {THREE.Mesh[]}
       */
      this.particles = [];

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

      // ------------------------------
      // Timeline
      // ------------------------------
      this.createTimeline();
      this.createWordAnimation();

      // ------------------------------
      // Render
      // ------------------------------
      this.animate();
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
     * Animate function that executes on every frame.
     */
    IconGalaxy.prototype.animate = function() {
      requestAnimationFrame(this.animate.bind(this));
      this.render();
    };

    /**
     * Renders the scene.
     */
    IconGalaxy.prototype.render = function() {
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
     * Creates the animation timeline.
     */
    IconGalaxy.prototype.createTimeline = function() {
      this.timeline = new TimelineMax({autoRemoveChildren: true});
    };

    /**
     * Generates our word from animated icon particles.
     */
    IconGalaxy.prototype.createWordAnimation = function() {
      // ------------------------------
      // Icon Particles
      // ------------------------------
      /**
       * The pixel data for our word represented in a one-dimensional array
       *     containing the data in the RGBA order, with integer values between
       *     0 and 255 (inclusive).
       * @type {Uint8ClampedArray.<number>}
       */
      var pixelData = this.getWordPixelData();

      // Create the particles for our word
      this.createIconParticles(pixelData);

      // ------------------------------
      // Word Formation Timeline
      // ------------------------------
      var particleIdx = 0;

      for (var i = 0; i < this.CANVAS_W; i++) {
        for (var j = 0; j < (this.CANVAS_H/2); j++) {
          // Continue to next iteration if pixel is black (transparent).
          if (pixelData[(this.CANVAS_W * j + i) * 4 + 3] == 0)
            continue;

          var icon = this.particles[particleIdx];

          // Icon color & blending.
          icon.material.color.setHSL(
            this.HUE + ((i / this.CANVAS_W) - 0.5) * 0.2,
            0.5,
            0.6 + 0.4 * Math.random()
          );
          icon.material.blending = THREE.AdditiveBlending;

          // Icon positions (start & end).
          var iconStartPosition = {
            x: 2000 * (Math.random() - 0.5) - 500,
            y: 1000 * (Math.random() - 0.5),
            z: 10000
          };
          var iconEndPosition = {
            x: (i - this.CANVAS_W / 2) * 30,
            y: (this.CANVAS_H / 2 - j) * 30,
            z: 0
          };
          icon.position.x = iconStartPosition.x;
          icon.position.y = iconStartPosition.y;
          icon.position.z = iconStartPosition.z;

          // Icon timeline.
          this.timeline.to(icon.position, 4.0, {
            bezier: [
              iconStartPosition, {
                x: (0 + iconEndPosition.x) / 2 + 300,
                y: (iconStartPosition.y + iconEndPosition.y) /
                    2 + 500 * Math.random(),
                z: (iconStartPosition.z + iconEndPosition.z) / 2
              },
              iconEndPosition
            ],
            ease: Expo.easeInOut
          }, 0);

          particleIdx++;
        }
      }
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
     * @param {Uint8ClampedArray} pixelData Canvas image data representing the
     *     rgba data of our word in a one-dimensional array.
     */
    IconGalaxy.prototype.createIconParticles = function(pixelData) {
      /**
       * A texture atlas of icons.
       * @type {THREE.Texture}
       */
      var texture = this.createIconTextureAtlas();

      /**
       * Number of particles needed based on pixel data.
       * @type {number}
       */
      var totalParticlesNeeded = this.getParticleCount(pixelData);

      var unitRatio = 1 / this.MATRIX_LENGTH;
      for (var i = 0; i < totalParticlesNeeded; i++) {
        // Random number within the matrix range for X offset.
        var offsetx = (this.MATRIX_LENGTH * Math.random()) >> 0;
        // Random number within the matrix range for Y offset.
        var offsety = (this.MATRIX_LENGTH * Math.random()) >> 0;
        var geometry = new THREE.PlaneBufferGeometry(40, 40, 1, 1);
        var material = new THREE.MeshLambertMaterial({
          color: 0xffffff,
          map: texture,
          transparent: true,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide
        });
        var mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);
        this.particles.push(mesh);

        // Changes the UVs to isolate a random icon from the texture atlas.
        this.randomizeUVs(mesh.geometry, unitRatio, offsetx, offsety);
      }
    };

    /**
     * Generates an icon texture atlas.
     * @return {THREE.Texture} A texture atlas of icons.
     */
    IconGalaxy.prototype.createIconTextureAtlas = function() {
      /**
       * Array of FontAwesome Unicode strings for icon particles.
       * @type {String[]}
       */
      var ICONS = [
        '\uf270', // amazon
        '\uf179', // apple
        '\uf209', // angellist
        '\uf1b4', // behance
        '\uf171', // bitbucket
        '\uf15a', // bitcoin
        '\uf1cb', // codepen
        '\uf1bd', // deviantart
        '\uf1a6', // digg
        '\uf16b', // dropbox
        '\uf2d7', // etsy
        '\uf09a', // facebook
        '\uf16e', // flickr
        '\uf180', // foursquare
        '\uf265', // get-pocket
        '\uf09b', // github
        '\uf296', // gitlab
        '\uf1a0', // google
        '\uf1d4', // hacker-news
        '\uf27c', // houzz
        '\uf13b', // html5
        '\uf2d8', // imdb
        '\uf16d', // instagram
        '\uf1aa', // joomla
        '\uf1cc', // jsfiddle
        '\uf08c', // linkedin
        '\uf23a', // medium
        '\uf2e0', // meetup
        '\uf289', // mixcloud
        '\uf23d', // opencart
        '\uf1ed', // paypal
        '\uf0d2', // pinterest
        '\uf288', // producthunt
        '\uf2c4', // quora
        '\uf1a1', // reddit
        '\uf28a', // scribd
        '\uf2da', // sellcast
        '\uf17e', // skype
        '\uf198', // slack
        '\uf1e7', // slideshare
        '\uf2ab', // snapchat
        '\uf1be', // soundcloud
        '\uf1bc', // spotify
        '\uf18d', // stack-exchange
        '\uf16c', // stackoverflow
        '\uf1b6', // steam
        '\uf1a4', // stumbleupon
        '\uf2c6', // telegram
        '\uf1d5', // tencent
        '\uf181', // trello
        '\uf262', // tripadvisor
        '\uf173', // tumblr
        '\uf1e8', // twitch
        '\uf099', // twitter
        '\uf27d', // vimeo
        '\uf1ca', // vine
        '\uf1d7', // weixin/wechat
        '\uf232', // whatsapp
        '\uf266', // wikipedia
        '\uf17a', // windows
        '\uf19a', // wordpress
        '\uf19e', // yahoo
        '\uf1e9', // yelp
        '\uf167' // youtube
      ];
      var SIZE = 256;

      // Create a container for our texture atlas.
      var container = new createjs.Container();

      // Add each icon to the container at the specified coordinates.
      for (var i = 0, len = ICONS.length; i < len; i++) {
        var char = ICONS[i];
        var text = new createjs.Text(char, '200px FontAwesome', '#FFF');
        text.textBaseline = 'middle';
        text.textAlign = 'center';
        text.x = SIZE * (i % this.MATRIX_LENGTH) + SIZE / 2;
        text.y = SIZE * Math.floor(i / this.MATRIX_LENGTH) + SIZE / 2;
        container.addChild(text);
      }

      // Cache the display object.
      var atlasLength = SIZE * this.MATRIX_LENGTH;
      container.cache(0, 0, atlasLength, atlasLength);

      // Get the image data url for the cache.
      var cacheUrl = container.getCacheDataURL();

      // Create & return the texture.
      var textureAtlas = new THREE.TextureLoader().load(cacheUrl);
      return textureAtlas;
    };

    /**
     * Returns the number of particles needed based on the amount of
     *     opaque pixels in the given pixelData.
     * @param {Uint8ClampedArray} pixelData Canvas image data representing the
     *     rgba data of our word in a one-dimensional array.
     * @return {number} Number of particles needed.
     */
    IconGalaxy.prototype.getParticleCount = function(pixelData) {
      var canvasArea = this.CANVAS_W * this.CANVAS_H;
      var textArea = canvasArea / 2;

      // After this index in pixelData, the rest represents irrelevant pixels
      var maxPixelIndex = textArea * 4;
      var totalParticlesNeeded = 0;

      // Since pixelData includes RGBA data and all we care about is A,
      // we start at the 3rd index and iterate by 4.
      for (var idx = 3; idx < maxPixelIndex; idx += 4) {
        if (pixelData[idx] > 0)
          totalParticlesNeeded++;
      }

      return totalParticlesNeeded;
    };

    /**
     * Changes the UVs in the geometry to isolate a random icon's coordinates.
     * @param {THREE.PlaneBufferGeometry} geometry
     * @param {number}                    unitRatio
     * @param {number}                    offsetx
     * @param {number}                    offsety
     */
    IconGalaxy.prototype.randomizeUVs = function(
        geometry, unitRatio, offsetx, offsety) {
      /**
       * Data for the UV attribute in the associated BufferGeometry.
       * @typedef {Object} UVAttribute
       * @property {integer}  count - The array's length divided by the itemSize.
       * @property {function} getX - Returns the x component of the vector at
       *     the given index.
       * @property {function} getY - Returns the y component of the vector at
       *     the given index.
       * @property {function} setXY - Sets the x and y components of the vector
       *     at the given index.
       * @property {boolean}  needsUpdate - Flag to indicate that this attribute
       *     has changed and should be re-sent to the GPU.
       */

      /**
       * @type {UVAttribute}
       */
      var uvs = geometry.attributes.uv;

      for (var i = 0; i < uvs.count; i++) {
        var uvx = (uvs.getX(i) + offsetx) * unitRatio;
        var uvy = (uvs.getY(i) + offsety) * unitRatio;
        uvs.setXY(i, uvx, uvy);
      }

      uvs.needsUpdate = true;
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
})();
