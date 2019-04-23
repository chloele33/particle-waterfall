import {gl} from '../../globals';

abstract class Drawable {
  count: number = 0;

  bufIdx: WebGLBuffer;
  bufPos: WebGLBuffer;
  bufNor: WebGLBuffer;
  bufTranslate: WebGLBuffer;
  bufCol: WebGLBuffer;
  bufUV: WebGLBuffer;

  idxGenerated: boolean = false;
  posGenerated: boolean = false;
  norGenerated: boolean = false;
  colGenerated: boolean = false;
  translateGenerated: boolean = false;
  uvGenerated: boolean = false;

  // for instance rendering
  bufTransformCol1: WebGLBuffer;
  bufTransformCol2: WebGLBuffer;
  bufTransformCol3: WebGLBuffer;
  bufTransformCol4: WebGLBuffer;
  // for instance rendering
  transformCol1Generated: boolean = false;
  transformCol2Generated: boolean = false;
  transformCol3Generated: boolean = false;
  transformCol4Generated: boolean = false;

  numInstances: number = 0; // How many instances of this Drawable the shader program should draw

  abstract create() : void;

  destory() {
    gl.deleteBuffer(this.bufIdx);
    gl.deleteBuffer(this.bufPos);
    gl.deleteBuffer(this.bufNor);
    gl.deleteBuffer(this.bufCol);
    gl.deleteBuffer(this.bufTranslate);
    gl.deleteBuffer(this.bufUV);
    // for instance rendering
    gl.deleteBuffer(this.bufTransformCol1);
    gl.deleteBuffer(this.bufTransformCol2);
    gl.deleteBuffer(this.bufTransformCol3);
    gl.deleteBuffer(this.bufTransformCol4);
  }

  // generateTransformCol_'s are for instanced rendering
  generateTransformCol1() {
    this.transformCol1Generated = true;
    this.bufTransformCol1 = gl.createBuffer();
  }

  generateTransformCol2() {
    this.transformCol2Generated = true;
    this.bufTransformCol2 = gl.createBuffer();
  }

  generateTransformCol3() {
    this.transformCol3Generated = true;
    this.bufTransformCol3 = gl.createBuffer();
  }

  generateTransformCol4() {
    this.transformCol4Generated = true;
    this.bufTransformCol4 = gl.createBuffer();
  }

  generateIdx() {
    this.idxGenerated = true;
    this.bufIdx = gl.createBuffer();
  }

  generatePos() {
    this.posGenerated = true;
    this.bufPos = gl.createBuffer();
  }

  generateNor() {
    this.norGenerated = true;
    this.bufNor = gl.createBuffer();
  }

  generateCol() {
    this.colGenerated = true;
    this.bufCol = gl.createBuffer();
  }

  generateTranslate() {
    this.translateGenerated = true;
    this.bufTranslate = gl.createBuffer();
  }

  generateUV() {
    this.uvGenerated = true;
    this.bufUV = gl.createBuffer();
  }

  // bindTransformCol_'s are for instanced rendering
  bindTransformCol1(): boolean {
    if (this.transformCol1Generated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformCol1);
    }

    return this.transformCol1Generated;
  }


  bindTransformCol2(): boolean {
    if (this.transformCol2Generated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformCol2);
    }
    return this.transformCol2Generated;
  }

  bindTransformCol3(): boolean {
    if (this.transformCol3Generated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformCol3);
    }
    return this.transformCol3Generated;
  }

  bindTransformCol4(): boolean {
    if (this.transformCol4Generated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformCol4);
    }
    return this.transformCol4Generated;
  }

  bindIdx(): boolean {
    if (this.idxGenerated) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    }
    return this.idxGenerated;
  }

  bindPos(): boolean {
    if (this.posGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    }
    return this.posGenerated;
  }

  bindNor(): boolean {
    if (this.norGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    }
    return this.norGenerated;
  }

  bindCol(): boolean {
    if (this.colGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    }
    return this.colGenerated;
  }

  bindTranslate(): boolean {
    if (this.translateGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTranslate);
    }
    return this.translateGenerated;
  }

  bindUV(): boolean {
    if (this.uvGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufUV);
    }
    return this.uvGenerated;
  }

  elemCount(): number {
    return this.count;
  }

  drawMode(): GLenum {
    return gl.TRIANGLES;
  }

  setNumInstances(num: number) {
    this.numInstances = num;
  }
};

export default Drawable;
