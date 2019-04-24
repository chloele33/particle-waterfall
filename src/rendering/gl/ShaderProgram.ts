import {vec3, vec4, mat4, mat3, vec2} from 'gl-matrix';
import Drawable from './Drawable';
import {gl} from '../../globals';
import Camera from '../../Camera';


var activeProgram: WebGLProgram = null;

export class Shader {
  shader: WebGLShader;

  constructor(type: number, source: string) {
    this.shader = gl.createShader(type);
    gl.shaderSource(this.shader, source);
    gl.compileShader(this.shader);

    if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
      throw gl.getShaderInfoLog(this.shader);
    }
  }
};

class ShaderProgram {
  prog: WebGLProgram;

  attrPos: number;
  attrNor: number;
  attrCol: number; // This time, it's an instanced rendering attribute, so each particle can have a unique color. Not per-vertex, but per-instance.
  attrTranslate: number; // Used in the vertex shader during instanced rendering to offset the vertex positions to the particle's drawn position.
  attrUV: number;


  // for instanced rendering
  attrTransformCol1: number; // Col1 of transformation mat for translate, rotate, scale
  attrTransformCol2: number; // Col2 of transformation mat for translate, rotate, scale
  attrTransformCol3: number; // Col3 of transformation mat for translate, rotate, scale
  attrTransformCol4: number; // Col4 of transformation mat for translate, rotate, scale

  unifModel: WebGLUniformLocation;
  unifModelInvTr: WebGLUniformLocation;
  unifViewProj: WebGLUniformLocation;
  unifCameraAxes: WebGLUniformLocation;
  unifTime: WebGLUniformLocation;
  unifRef: WebGLUniformLocation;
  unifEye: WebGLUniformLocation;
  unifUp: WebGLUniformLocation;
  unifDimensions: WebGLUniformLocation;

  unifAcceleration: WebGLUniformLocation;
  unifColor: WebGLUniformLocation;
  unifParticleCol: WebGLUniformLocation;
  unifParticleSize: WebGLUniformLocation;

  unifSampler2D: WebGLUniformLocation;
  unifIsAttractToPoint: WebGLUniformLocation;
  unifAttractPos: WebGLUniformLocation;

  unifObstacleBuf: WebGLUniformLocation;





  constructor(shaders: Array<Shader>, transformFeedbackBool: boolean = false, varyings: string[] = []) {
    this.prog = gl.createProgram();

    for (let shader of shaders) {
      gl.attachShader(this.prog, shader.shader);
    }

    if(transformFeedbackBool == true){
      gl.transformFeedbackVaryings(this.prog, varyings, gl.SEPARATE_ATTRIBS);
    }

    gl.linkProgram(this.prog);
    if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
      throw gl.getProgramInfoLog(this.prog);
    }

    this.attrPos = gl.getAttribLocation(this.prog, "vs_Pos");
    this.attrCol = gl.getAttribLocation(this.prog, "vs_Col");
    this.attrTranslate = gl.getAttribLocation(this.prog, "vs_Translate");
    this.attrUV = gl.getAttribLocation(this.prog, "vs_UV");
    this.unifModel   = gl.getUniformLocation(this.prog, "u_Model");
    this.unifModelInvTr = gl.getUniformLocation(this.prog, "u_ModelInvTr");
    this.unifViewProj   = gl.getUniformLocation(this.prog, "u_ViewProj");
    this.unifCameraAxes   = gl.getUniformLocation(this.prog, "u_CameraAxes");
    this.unifTime   = gl.getUniformLocation(this.prog, "u_Time");
    this.unifEye   = gl.getUniformLocation(this.prog, "u_Eye");
    this.unifRef  = gl.getUniformLocation(this.prog, "u_Ref");
    this.unifUp  = gl.getUniformLocation(this.prog, "u_Up");

    this.unifAcceleration = gl.getUniformLocation(this.prog, 'u_Acceleration');
    this.unifColor = gl.getUniformLocation(this.prog, "u_Color");
    this.unifParticleCol = gl.getUniformLocation(this.prog, "u_ParticleColor");
    this.unifParticleSize = gl.getUniformLocation(this.prog, "u_ParticleSize");

    // for instanced rendering
    this.attrTransformCol1 = gl.getAttribLocation(this.prog, "vs_Transform1");
    this.attrTransformCol2 = gl.getAttribLocation(this.prog, "vs_Transform2");
    this.attrTransformCol3 = gl.getAttribLocation(this.prog, "vs_Transform3");
    this.attrTransformCol4 = gl.getAttribLocation(this.prog, "vs_Transform4");

    this.unifIsAttractToPoint = gl.getUniformLocation(this.prog, "u_IsAttract");
    this.unifAttractPos = gl.getUniformLocation(this.prog, "u_ObstaclePos");
    this.unifObstacleBuf = gl.getUniformLocation(this.prog, "u_ObstacleBuffer")



  }


  use() {
    if (activeProgram !== this.prog) {
      gl.useProgram(this.prog);
      activeProgram = this.prog;
    }
  }

  setEyeRefUp(eye: vec3, ref: vec3, up: vec3) {
    this.use();
    if(this.unifEye !== -1) {
      gl.uniform3f(this.unifEye, eye[0], eye[1], eye[2]);
    }
    if(this.unifRef !== -1) {
      gl.uniform3f(this.unifRef, ref[0], ref[1], ref[2]);
    }
    if(this.unifUp !== -1) {
      gl.uniform3f(this.unifUp, up[0], up[1], up[2]);
    }
  }

  setDimensions(width: number, height: number) {
    this.use();
    if(this.unifDimensions !== -1) {
      gl.uniform2f(this.unifDimensions, width, height);
    }
  }

  setModelMatrix(model: mat4) {
    this.use();
    if (this.unifModel !== -1) {
      gl.uniformMatrix4fv(this.unifModel, false, model);
    }

    if (this.unifModelInvTr !== -1) {
      let modelinvtr: mat4 = mat4.create();
      mat4.transpose(modelinvtr, model);
      mat4.invert(modelinvtr, modelinvtr);
      gl.uniformMatrix4fv(this.unifModelInvTr, false, modelinvtr);
    }
  }

  setViewProjMatrix(vp: mat4) {
    this.use();
    if (this.unifViewProj !== -1) {
      gl.uniformMatrix4fv(this.unifViewProj, false, vp);
    }
  }

  setCameraAxes(axes: mat3) {
    this.use();
    if (this.unifCameraAxes !== -1) {
      gl.uniformMatrix3fv(this.unifCameraAxes, false, axes);
    }
  }

  setTime(t: number) {
    this.use();
    if (this.unifTime !== -1) {
      gl.uniform1f(this.unifTime, t);
    }
  }


  // Transform Feedback
  setTransformAcc(accel: vec3) {
    this.use();
    if (this.unifAcceleration !== -1) {
      let scale = 5.0;
      gl.uniform3f(this.unifAcceleration, scale * accel[0], scale * accel[1], scale * accel[2]);
    }
  }

  setParticleColor(color1: vec3){
    this.use();
    if(this.unifParticleCol !== -1){
      gl.uniform3fv(this.unifParticleCol, color1);
    }
  }

  setColor(color: vec4) {
    this.use();
    if (this.unifColor !== -1) {
      gl.uniform4fv(this.unifColor, color);
    }
  }

  setParticleSize(particleSize: number){
    this.use();
    if(this.unifParticleSize !== -1){
      gl.uniform1f(this.unifParticleSize, particleSize);
    }
  }

  setIsAttractToPoint(isAttract: number){
    this.use();
    if(this.unifIsAttractToPoint !== -1){
      gl.uniform1i(this.unifIsAttractToPoint, isAttract);
    }
  }

  setObsPos(ndcPos: vec2, cam: Camera){
    this.use();
    if(this.unifAttractPos !== -1){
      let len_vec = vec3.create();
      vec3.subtract(len_vec, cam.target, cam.position);
      let len = 1.35 * vec3.length(len_vec);

      let tanFovByTwo = Math.tan(0.5 * cam.fovy * 3.1415926 / 180.0);

      let v = vec3.fromValues(cam.up[0] * len * tanFovByTwo,
          cam.up[1] * len * tanFovByTwo,
          cam.up[2] * len * tanFovByTwo);

      let h = vec3.fromValues(cam.right[0] * len * cam.aspectRatio * tanFovByTwo,
          cam.right[1] * len * cam.aspectRatio * tanFovByTwo,
          cam.right[2] * len * cam.aspectRatio * tanFovByTwo);

      let world_pos = vec3.fromValues(cam.target[0] + ndcPos[0] * h[0] + ndcPos[1] * v[0],
          cam.target[1] + ndcPos[0] * h[1] + ndcPos[1] * v[1],
          cam.target[2] + ndcPos[0] * h[2] + ndcPos[1] * v[2]);

      gl.uniform3fv(this.unifAttractPos, world_pos);
    }
  }

  drawParticles(d: Drawable, numInstances: number) {
    this.use();

    if (this.attrPos != -1 && d.bindPos()) {
      gl.enableVertexAttribArray(this.attrPos);
      gl.vertexAttribPointer(this.attrPos, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrPos, 0); // Advance 1 index in pos VBO for each vertex
    }

    if (this.attrNor != -1 && d.bindNor()) {
      gl.enableVertexAttribArray(this.attrNor);
      gl.vertexAttribPointer(this.attrNor, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrNor, 0); // Advance 1 index in nor VBO for each vertex
    }

    if (this.attrCol != -1 && d.bindCol()) {
      gl.enableVertexAttribArray(this.attrCol);
      gl.vertexAttribPointer(this.attrCol, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrCol, 1); // Advance 1 index in col VBO for each drawn instance
    }

    if (this.attrTranslate != -1 && d.bindTranslate()) {
      gl.enableVertexAttribArray(this.attrTranslate);
      gl.vertexAttribPointer(this.attrTranslate, 3, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrTranslate, 1); // Advance 1 index in translate VBO for each drawn instance
    }

    if (this.attrUV != -1 && d.bindUV()) {
      gl.enableVertexAttribArray(this.attrUV);
      gl.vertexAttribPointer(this.attrUV, 2, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrUV, 0); // Advance 1 index in pos VBO for each vertex
    }

    // TODO: Set up attribute data for additional instanced rendering data as needed

    d.bindIdx();
    // drawElementsInstanced uses the vertexAttribDivisor for each "in" variable to
    // determine how to link it to each drawn instance of the bound VBO.
    // For example, the index used to look in the VBO associated with
    // vs_Pos (attrPos) is advanced by 1 for each thread of the GPU running the
    // vertex shader since its divisor is 0.
    // On the other hand, the index used to look in the VBO associated with
    // vs_Translate (attrTranslate) is advanced by 1 only when the next instance
    // of our drawn object (in the base code example, the square) is processed
    // by the GPU, thus being the same value for the first set of four vertices,
    // then advancing to a new value for the next four, then the next four, and
    // so on.
    gl.drawElementsInstanced(d.drawMode(), d.elemCount(), gl.UNSIGNED_INT, 0, numInstances);

    if (this.attrPos != -1) gl.disableVertexAttribArray(this.attrPos);
    if (this.attrNor != -1) gl.disableVertexAttribArray(this.attrNor);
    if (this.attrCol != -1) gl.disableVertexAttribArray(this.attrCol);
    if (this.attrTranslate != -1) gl.disableVertexAttribArray(this.attrTranslate);
    if (this.attrUV != -1) gl.disableVertexAttribArray(this.attrUV);
  }

  draw(d: Drawable) {
    this.use();

    if (this.attrPos != -1 && d.bindPos()) {
      gl.enableVertexAttribArray(this.attrPos);
      gl.vertexAttribPointer(this.attrPos, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrPos, 0); // Advance 1 index in pos VBO for each vertex
    }

    if (this.attrNor != -1 && d.bindNor()) {
      gl.enableVertexAttribArray(this.attrNor);
      gl.vertexAttribPointer(this.attrNor, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrNor, 0); // Advance 1 index in nor VBO for each vertex
    }

    if (this.attrCol != -1 && d.bindCol()) {
      gl.enableVertexAttribArray(this.attrCol);
      gl.vertexAttribPointer(this.attrCol, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrCol, 1); // Advance 1 index in col VBO for each drawn instance
    }

    if (this.attrTranslate != -1 && d.bindTranslate()) {
      gl.enableVertexAttribArray(this.attrTranslate);
      gl.vertexAttribPointer(this.attrTranslate, 3, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrTranslate, 1); // Advance 1 index in translate VBO for each drawn instance
    }

    if (this.attrUV != -1 && d.bindUV()) {
      gl.enableVertexAttribArray(this.attrUV);
      gl.vertexAttribPointer(this.attrUV, 2, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrUV, 0); // Advance 1 index in pos VBO for each vertex
    }

    // TODO: Set up attribute data for additional instanced rendering data as needed
    // TODO: Set up attribute data for additional instanced rendering data as needed
    if (this.attrTransformCol1 != -1 && d.bindTransformCol1()) {
      gl.enableVertexAttribArray(this.attrTransformCol1);
      gl.vertexAttribPointer(this.attrTransformCol1, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrTransformCol1, 1); // Advance 1 index in transformation VBO for each drawn instance
    }


    if (this.attrTransformCol2 != -1 && d.bindTransformCol2()) {
      gl.enableVertexAttribArray(this.attrTransformCol2);
      gl.vertexAttribPointer(this.attrTransformCol2, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrTransformCol2, 1); // Advance 1 index in transformation VBO for each drawn instance
    }

    if (this.attrTransformCol3 != -1 && d.bindTransformCol3()) {
      gl.enableVertexAttribArray(this.attrTransformCol3);
      gl.vertexAttribPointer(this.attrTransformCol3, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrTransformCol3, 1); // Advance 1 index in transformation VBO for each drawn instance
    }

    if (this.attrTransformCol4 != -1 && d.bindTransformCol4()) {
      gl.enableVertexAttribArray(this.attrTransformCol4);
      gl.vertexAttribPointer(this.attrTransformCol4, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrTransformCol4, 1); // Advance 1 index in transformation VBO for each drawn instance
    }
    d.bindIdx();
    // drawElementsInstanced uses the vertexAttribDivisor for each "in" variable to
    // determine how to link it to each drawn instance of the bound VBO.
    // For example, the index used to look in the VBO associated with
    // vs_Pos (attrPos) is advanced by 1 for each thread of the GPU running the
    // vertex shader since its divisor is 0.
    // On the other hand, the index used to look in the VBO associated with
    // vs_Translate (attrTranslate) is advanced by 1 only when the next instance
    // of our drawn object (in the base code example, the square) is processed
    // by the GPU, thus being the same value for the first set of four vertices,
    // then advancing to a new value for the next four, then the next four, and
    // so on.
    gl.drawElementsInstanced(d.drawMode(), d.elemCount(), gl.UNSIGNED_INT, 0, d.numInstances);

    if (this.attrPos != -1) gl.disableVertexAttribArray(this.attrPos);
    if (this.attrNor != -1) gl.disableVertexAttribArray(this.attrNor);
    if (this.attrCol != -1) gl.disableVertexAttribArray(this.attrCol);
    if (this.attrTranslate != -1) gl.disableVertexAttribArray(this.attrTranslate);
    if (this.attrUV != -1) gl.disableVertexAttribArray(this.attrUV);

    // for instanced rendering
    if (this.attrTransformCol1 != -1) gl.disableVertexAttribArray(this.attrTransformCol1);
    if (this.attrTransformCol2 != -1) gl.disableVertexAttribArray(this.attrTransformCol2);
    if (this.attrTransformCol3 != -1) gl.disableVertexAttribArray(this.attrTransformCol3);
    if (this.attrTransformCol4 != -1) gl.disableVertexAttribArray(this.attrTransformCol4);

    gl.uniform1i(this.unifSampler2D, 0);
  }
};

export default ShaderProgram;
