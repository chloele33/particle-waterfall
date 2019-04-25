import {mat4, vec4, mat3} from 'gl-matrix';
import Drawable from './Drawable';
import Camera from '../../Camera';
import {gl} from '../../globals';
import ShaderProgram from './ShaderProgram';
import {ParticleCollection} from '../../Particle';


const POSITION_LOCATION = 2;
const VELOCITY_LOCATION = 3;
const COLOR_LOCATION = 4;
const TIME_LOCATION = 5;


// In this file, `gl` is accessible because it is imported above
class OpenGLRenderer {
  currentSourceIdx: number;

  constructor(public canvas: HTMLCanvasElement) {
    this.currentSourceIdx = 0;
  }

  setClearColor(r: number, g: number, b: number, a: number) {
    gl.clearColor(r, g, b, a);
  }

  setSize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  clear() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  render(camera: Camera, prog: ShaderProgram, drawables: Array<Drawable>) {
    let model = mat4.create();
    let viewProj = mat4.create();
    let color = vec4.fromValues(1, 0, 0, 1);
    // Each column of the axes matrix is an axis. Right, Up, Forward.
    let axes = mat3.fromValues(camera.right[0], camera.right[1], camera.right[2],
                               camera.up[0], camera.up[1], camera.up[2],
                               camera.forward[0], camera.forward[1], camera.forward[2]);


    prog.setEyeRefUp(camera.controls.eye, camera.controls.center, camera.controls.up);
    mat4.identity(model);
    mat4.multiply(viewProj, camera.projectionMatrix, camera.viewMatrix);
    prog.setModelMatrix(model);
    prog.setViewProjMatrix(viewProj);
    prog.setCameraAxes(axes);

    for (let drawable of drawables) {
      prog.draw(drawable);
    }
  }

  renderParticleCollection(camera: Camera, prog: ShaderProgram, drawable: Drawable, particles: Array<ParticleCollection>) {
    if(particles.length !== 0) {
      let model = mat4.create();
      let viewProj = mat4.create();
      let color = vec4.fromValues(1, 0, 0, 1);
      // Each column of the axes matrix is an axis. Right, Up, Forward.
      let axes = mat3.fromValues(camera.right[0], camera.right[1], camera.right[2],
          camera.up[0], camera.up[1], camera.up[2],
          camera.forward[0], camera.forward[1], camera.forward[2]);


     // prog.setEyeRefUp(camera.controls.eye, camera.controls.center, camera.controls.up);
      mat4.identity(model);
      mat4.multiply(viewProj, camera.projectionMatrix, camera.viewMatrix);
      prog.setModelMatrix(model);
      prog.setViewProjMatrix(viewProj);
      prog.setCameraAxes(axes);

      for (let i = 0; i < particles.length; i++) {
        var sourceVAO = particles[i].getVAO(this.currentSourceIdx);
        gl.bindVertexArray(sourceVAO);

        // Attributes per-instance when drawing sets back to 1 when drawing instances
        gl.vertexAttribDivisor(POSITION_LOCATION, 1);
        gl.vertexAttribDivisor(COLOR_LOCATION, 1);

        // draw instances
        prog.drawParticles(drawable, particles[i].numParticles);
      }
    }
  }

  transformParticles(camera: Camera, prog: ShaderProgram, particleCollection: Array<ParticleCollection>){
    if(particleCollection.length !== 0){
      let viewProj = mat4.create();
      let model = mat4.create();
      mat4.identity(model);
      mat4.multiply(viewProj, camera.projectionMatrix, camera.viewMatrix);
      prog.setModelMatrix(model);
      prog.setViewProjMatrix(viewProj);

      prog.use();

      var destinationIdx = (this.currentSourceIdx + 1) % 2;

      for(let i = 0; i < particleCollection.length; i++){
        // Toggle source and destination VBO
        var sourceVAO = particleCollection[i].getVAO(this.currentSourceIdx);
        var destinationTransformFeedback = particleCollection[i].getTransformFeedbacks(destinationIdx);

        gl.bindVertexArray(sourceVAO);
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, destinationTransformFeedback);

        // Attributes per-vertex - set to 0 for transform feedback
        gl.vertexAttribDivisor(POSITION_LOCATION, 0);
        gl.vertexAttribDivisor(VELOCITY_LOCATION, 0);
        gl.vertexAttribDivisor(COLOR_LOCATION, 0);
        gl.vertexAttribDivisor(TIME_LOCATION, 0);

        gl.enable(gl.RASTERIZER_DISCARD);

        // Update position and rotation using transform feedback
        gl.beginTransformFeedback(gl.POINTS);
        gl.drawArrays(gl.POINTS, 0, particleCollection[i].numParticles);
        gl.endTransformFeedback();

        // Restore state
        gl.disable(gl.RASTERIZER_DISCARD);
        gl.useProgram(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
      }
      this.currentSourceIdx = (this.currentSourceIdx + 1) % 2;
    }
  }
};

export default OpenGLRenderer;
