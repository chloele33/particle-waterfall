import {vec2, vec3, vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import Cube from './geometry/Cube';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL, VBO, FBO} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import {Particle, ParticleCollection} from "./Particle";
import {readTextFile} from './globals';
import Mesh from './geometry/Mesh'
import Sphere from './geometry/Sphere'



'./Particle';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  'R': 0,
  'G': 72,
  'B':255.0,
  'Particle Size': 0.5
};

let square: Square;
let particles: ParticleCollection;
let screenQuad: ScreenQuad;
let time: number = 0.0;
let obsMesh: Mesh;
let cube: Cube;
let screenQuad2: ScreenQuad;
let sphere: Sphere;
let textureData: Uint8Array;


function loadScene() {
  square = new Square();
  square.create();
  cube = new Cube(vec3.fromValues(20.0, 0.0, 0.0), 5);
  cube.create();
  cube.setNumInstances(1);
  screenQuad = new ScreenQuad(0, 0, 1, 1);
  screenQuad.create();
  screenQuad2 = new ScreenQuad(-.5, -.5, +.5, +.5);
  screenQuad2.create();
  // sphere = new Sphere(vec3.fromValues(0.0, 0.0, 0.0), 10, 2);
  // sphere.create();

  let obsData = readTextFile("https://raw.githubusercontent.com/chloele33/particle-waterfall/master/src/cylinder.obj");
  obsMesh = new Mesh(obsData, vec3.fromValues(0,0,0));
  obsMesh.create();
  // let colArray: number[] = [0.484, 0.367, 0.258, 1];
  // let col1Array: number[] = [100, 0, 0, 0];
  // let col2Array: number[] = [0, 100, 0, 0];
  // let col3Array: number[] = [0, 0, 100, 0];
  // let col4Array: number[] = [10, 10, 10, 1];
  // let col1: Float32Array = new Float32Array(col1Array);
  // let col2: Float32Array = new Float32Array(col2Array);
  // let col3: Float32Array = new Float32Array(col3Array);
  // let col4: Float32Array = new Float32Array(col4Array);
  // let colorsar = new Float32Array(colArray);
  // obsMesh.setInstanceVBOs(col1, col2, col3, col4, colorsar);
  obsMesh.setNumInstances(1);



  //set up particles
  particles = new ParticleCollection(20000);
  particles.create();
  particles.setVBOs();

  // Set up instanced rendering data arrays here.
  // This example creates a set of positional
  // offsets and gradiated colors for a 100x100 grid
  // of squares, even though the VBO data for just
  // one square is actually passed to the GPU
  // let offsetsArray = [];
  // let colorsArray = [];
  // let n: number = 100.0;
  // for(let i = 0; i < n; i++) {
  //   for(let j = 0; j < n; j++) {
  //     offsetsArray.push(i);
  //     offsetsArray.push(j);
  //     offsetsArray.push(0);
  //
  //     colorsArray.push(i / n);
  //     colorsArray.push(j / n);
  //     colorsArray.push(1.0);
  //     colorsArray.push(1.0); // Alpha channel
  //   }
  // }
  // let offsets: Float32Array = new Float32Array(offsetsArray);
  // let colors: Float32Array = new Float32Array(colorsArray);
  // square.setInstanceVBOs(offsets, colors);
   square.setNumInstances(1); // grid of "particles"
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'R', 0, 255.0).step(1.0).onChange(setParticleColor);
  gui.add(controls, 'G', 0, 255.0).step(1.0).onChange(setParticleColor);
  gui.add(controls, 'B', 0, 255.0).step(1.0).onChange(setParticleColor);
  gui.add(controls, 'Particle Size', 0.1, 1.0).step(0.1).onChange(setParticleSize);

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 5, -90.0), vec3.fromValues(0.0, -10, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.canvas.width = canvas.clientWidth;
  gl.canvas.height = canvas.clientHeight;
 // gl.enable(gl.BLEND);
  gl.disable(gl.CULL_FACE);
  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.BLEND);
  gl.clearColor(0.2, 0.2, 0.2, 1.0);
  gl.blendFunc(gl.ONE, gl.ONE); // Additive blending

  const lambertShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);

  const instancedOShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-o-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-o-frag.glsl')),
  ]);

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  const obstacleShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/obstacle-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/obstacle-frag.glsl')),
  ], false, ["sampleCoords"]);

  const addObstacleAddShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/obstacleAdd-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/obstacleAdd-frag.glsl')),
  ], false, ["fromCenter"]);

  const addObstacleAdd2Shader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/obstacleAdd2-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/obstacleAdd2-frag.glsl')),
  ], false, ["sampleCoords"]);


  var particleShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/particle-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/particle-frag.glsl')),
  ]);


      // SET UP TRANSFORM FEEDBACK FOR PARTICLES
  let varyings = ["v_pos", "v_vel", "v_col", "v_time"];
  const transformFeedbackShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/particle-vert-tf.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/particle-frag-tf.glsl')),
    ], true, varyings
  );
  transformFeedbackShader.setColor(vec4.fromValues(0.0, 1.0, 1.0, 1.0));
  transformFeedbackShader.setTransformAcc(vec3.fromValues(0.0, -1.0, 0.0));
  function setParticleColor() {
    transformFeedbackShader.setParticleColor(vec3.fromValues(
        controls.R / 255.0,
        controls.G / 255.0,
        controls.B / 255.0));
  }
  setParticleColor();

  function setParticleSize() {
    particleShader.setParticleSize( controls["Particle Size"]);
  }
  setParticleSize();


  function setParticleAcceleration() {
    transformFeedbackShader.setTransformAcc(vec3.fromValues(0.0, 30.0,0.0));
  }
  setParticleAcceleration();

  function setupTexture(width: number, height: number) {
      let texelData : any= [];
      let value = [127, 127, 0, 0]
      for (let i = 0 ; i < width * height ; ++i) {
        texelData.push.apply(texelData, value);
      }

      let texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0,
          gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(texelData));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return texture;
  }


  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    instancedShader.setTime(time++);
    transformFeedbackShader.setTime(time++);
    particleShader.setTime(time++);
    flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);



    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
// bind
   // gl.uniform1i(obstacleShader.unifObstacleBuf, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    //
  //  gl.uniform1i(obstacleShader.unifObstacleBuf, 1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture);








    // renderer.render(camera, lambertShader, [
    //   obsMesh
    // ]);

    renderer.clear();
    //renderer.render(camera, flat, [cube]);




    //renderer.render(camera, addObstacleAdd2Shader, [screenQuad]);
    //renderer.render(camera, addObstacleAddShader, [screenQuad2]);
    gl.enableVertexAttribArray(obstacleShader.attrCorner);
    gl.bindBuffer(gl.ARRAY_BUFFER, cornersVBO.data);
    gl.vertexAttribPointer(obstacleShader.attrCorner, 2, gl.FLOAT, cornersVBO.normalize || false,
        cornersVBO.stride || false, cornersVBO.offset || false);
    gl.disable(gl.BLEND);

    renderer.render(camera, obstacleShader, [screenQuad]);
    //gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    gl.enable(gl.BLEND);
    //transform feedback
    renderer.transformParticles(camera, transformFeedbackShader, [
      particles
    ]);


    renderer.renderParticleCollection(camera, particleShader, square, [particles]);


    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }




  // // save texture date
  // gl.bindFramebuffer(gl.FRAMEBUFFER, tex_frameBuffer);
  // gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  // var texturePixels = new Uint8Array(width * height * 4);
  // gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, texturePixels);
  // textureData = texturePixels;
  //
  // // bind frame buffer
  // gl.bindFramebuffer(gl.FRAMEBUFFER, tex_frameBuffer);
  // gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  //
  // // // bind render buffer
  // gl.bindRenderbuffer(gl.RENDERBUFFER, tex_renderBuffer);
  // gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
  // gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, tex_renderBuffer);
  // //
  // gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
  //
  // // render to frame buffer
  // gl.bindFramebuffer(gl.FRAMEBUFFER, tex_frameBuffer);
  // gl.bindTexture(gl.TEXTURE_2D, texture);
  // // Render on the whole framebuffer, complete from the lower left corner to the upper right
  // gl.viewport(0, 0, 2000, 2000);
  // // clear screen
  // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //
  // renderer.render(camera, obstacleShader, [screenQuad]);
  //
  // // save texture date
  // gl.bindFramebuffer(gl.FRAMEBUFFER, tex_frameBuffer);
  // gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  // var texturePixels = new Uint8Array(width * height * 4);
  // gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, texturePixels);
  // textureData = texturePixels;


  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
    addObstacleAdd2Shader.setDimensions(window.innerWidth, window.innerHeight);
    addObstacleAddShader.setDimensions(window.innerWidth, window.innerHeight);
    obstacleShader.setDimensions(window.innerWidth, window.innerHeight);

    transformFeedbackShader.setDimensions(window.innerWidth, window.innerHeight);
  }, false);



  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);
  transformFeedbackShader.setDimensions(window.innerWidth, window.innerHeight);

  // -------------------for initializing texture --------------------
  gl.viewport(0, 0, window.innerWidth, window.innerHeight);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  var width = window.innerWidth;
  var height = window.innerHeight;
  width = gl.drawingBufferWidth;
  height = gl.drawingBufferHeight;
  // var tex_frameBuffer = gl.createFramebuffer();
  // var tex_renderBuffer = gl.createRenderbuffer();

  // intialize textures
  // var texture = gl.createTexture(); // texture
  // let texelData : any  = [];
  // let value = [127, 127, 0, 0]
  // for (let i = 0 ; i < width * height ; ++i) {
  //   texelData.push.apply(texelData, value);
  // }
  // //width = 2000;
  // //height = 2000;
  // // bind texture
  // gl.bindTexture(gl.TEXTURE_2D, texture);
  // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA,
  //     gl.UNSIGNED_BYTE, new Uint8Array(texelData));
  // // set texture's render settings
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  //
  //
  // var texture2 = gl.createTexture(); //texture static
  // let texelData2 : any  = [];
  // let value2 = [127, 127, 0, 0]
  // for (let i = 0 ; i < width * height ; ++i) {
  //   texelData2.push.apply(texelData2, value2);
  // }
  // //width = 2000;
  // //height = 2000;
  // // bind texture
  // gl.bindTexture(gl.TEXTURE_2D, texture2);
  // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0,
  //     gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(texelData2));
  // // set texture's render settings
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  var texture = setupTexture(width, height);
  var textureSta = setupTexture(width, height);

  const cornersVBO = VBO.createQuad(gl, 0, 0, 1, 1);
  const squareVBO = VBO.createQuad(gl, -.5, -.5, +.5, +.5);
  let _FBO = FBO.create(gl, width, height);

  obstacleShader.setDimensions( width, height);
  addObstacleAddShader.setDimensions(width, height);
  addObstacleAdd2Shader.setDimensions( width, height);


  gl.enable(gl.BLEND);

  function addObstacle(posx:number, posy: number) {

    addObstacleAddShader.setObsPos(vec2.fromValues(posx, 1.0 - posy), camera);
    _FBO.bind(gl, textureSta, null);
    gl.useProgram(addObstacleAddShader.prog);
    gl.enableVertexAttribArray(addObstacleAddShader.attrCorner);
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVBO.data);
    gl.vertexAttribPointer(addObstacleAddShader.attrCorner, 2, gl.FLOAT, squareVBO.normalize || false,
        squareVBO.stride || false, squareVBO.offset || false);

    renderer.render(camera, addObstacleAddShader, [screenQuad2]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);


    addObstacleAdd2Shader.setObsPos(vec2.fromValues(posx, 1.0 - posy), camera);
    gl.useProgram(addObstacleAdd2Shader.prog);
    _FBO.bind(gl, texture, null);
    // bind
    //gl.uniform1i(addObstacleAdd2Shader.unifObstacleTexture, 1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textureSta);
    gl.enableVertexAttribArray(addObstacleAdd2Shader.attrCorner);
    gl.bindBuffer(gl.ARRAY_BUFFER, cornersVBO.data);
    gl.vertexAttribPointer(addObstacleAdd2Shader.attrCorner, 2, gl.FLOAT, cornersVBO.normalize || false,
        cornersVBO.stride || false, cornersVBO.offset || false);
    renderer.render(camera, addObstacleAdd2Shader, [screenQuad]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  addObstacle(0.5, 0.5);
  addObstacle(0.2, 0.4);
  addObstacle(0.9, 0.5);




  var leftButton = 0;
  var rightButton = 2;
  var isMouseDragging = false;

  canvas.onmousedown = function(ev) {  //Mouse is pressed
    if(ev.button === rightButton){
      //transformFeedbackShader.setIsAttractToPoint(1.0);
      // add obstacle
      // use obstacleAdd shader to add information
    }
    transformFeedbackShader.setObsPos(vec2.fromValues((2.0 * ev.clientX / window.innerWidth) - 1.0,
        1.0 - (2.0 * ev.clientY / window.innerHeight)), camera);

    isMouseDragging = true;
  };

  canvas.onmouseup = function(ev){ //Mouse is released
    transformFeedbackShader.setIsAttractToPoint(0);
    isMouseDragging = false;
  }

  canvas.onmousemove = function(ev) { //Mouse is moved
    if(isMouseDragging){
      console.log('on mouse move!');
    }
  }
  // Start the render loop

  tick();
}

main();
