import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Cube extends Drawable {
    buffer: ArrayBuffer;
    indices: Uint32Array;
    positions: Float32Array;
    normals: Float32Array;
    center: vec4;
    offsets: Float32Array; // Data for bufTranslate



    colors: Float32Array;

    col1: Float32Array;
    col2: Float32Array;
    col3: Float32Array;
    col4: Float32Array;

    scale: number;

    constructor(center: vec3, scale: number) {
        super(); // Call the constructor of the super class. This is required.
        this.center = vec4.fromValues(center[0], center[1], center[2], 1);
        this.scale = scale;
    }

    create() {
        this.indices = new Uint32Array([0,  1,  2,  0,  2,  3,   //front
            4,  5,  6,  4,  6,  7,   //right
            8,  9,  10, 8,  10, 11,  //back
            12, 13, 14, 12, 14, 15,  //left
            16, 17, 18, 16, 18, 19,  //upper
            20, 21, 22, 20, 22, 23]);
        this.normals = new Float32Array([
            0, 0, 1, 0,
            0, 0, 1, 0,
            0, 0, 1, 0,
            0, 0, 1, 0, // front
            1, 0, 0, 0,
            1, 0, 0, 0,
            1, 0, 0, 0,
            1, 0, 0, 0, //right
            0, 0, -1, 0,
            0, 0, -1, 0,
            0, 0, -1, 0,
            0, 0, -1, 0, //back
            -1, 0, 0, 0,
            -1, 0, 0, 0,
            -1, 0, 0, 0,
            -1, 0, 0, 0, //left
            0, 1, 0, 0,
            0, 1, 0, 0,
            0, 1, 0, 0,
            0, 1, 0, 0, //upper
            0, -1, 0, 0,
            0, -1, 0, 0,
            0, -1, 0, 0,
            0, -1, 0, 0]);
        var x = this.center[0] + this.scale;
        var y = this.center[1] + this.scale;
        var z = this.center[2] + this.scale;
        var xinv = this.center[0] - this.scale;
        var yinv = this.center[1] - this.scale;
        var zinv = this.center[2] - this.scale;
        this.positions = new Float32Array([
            xinv, yinv, z, 1,
            x, yinv, z, 1,
            x, y, z, 1,
            xinv, y, z, 1, //front
            x, y, z, 1,
            x, y, zinv, 1,
            x, yinv, zinv, 1,
            x, yinv, z, 1, //right
            xinv, yinv, zinv, 1,
            x, yinv, zinv, 1,
            x, y, zinv, 1,
            xinv, y, zinv, 1, //back
            xinv, yinv, z, 1,
            xinv, yinv, zinv, 1,
            xinv, y, zinv, 1,
            xinv, y, z, 1, //left
            x, y, z, 1,
            xinv, z, z, 1,
            xinv, z, zinv, 1,
            x, y, zinv, 1, //upper
            xinv, yinv, zinv, 1,
            x, yinv, zinv, 1,
            x, yinv, z, 1,
            xinv, zinv, 1, 1]);

        // this.generateIdx();
        // this.generatePos();
        // this.generateNor();

        this.generateIdx();
        this.generatePos();
        this.generateCol();
        this.generateTranslate();
        // this.generateTransformCol1();
        // this.generateTransformCol2();
        // this.generateTransformCol3();
        // this.generateTransformCol4();
        //this.generateCol();

        this.count = this.indices.length;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
        gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
        gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

        this.numInstances = 1;
        console.log(`Created cube`);
    }

    setInstanceVBOs2(col1: Float32Array,
                     col2: Float32Array,
                     col3: Float32Array,
                     col4: Float32Array,
                     colors: Float32Array) {
        this.col1 = col1;
        this.col2 = col2;
        this.col3 = col3;
        this.col4 = col4;
        this.colors = colors;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformCol1);
        gl.bufferData(gl.ARRAY_BUFFER, this.col1, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformCol2);
        gl.bufferData(gl.ARRAY_BUFFER, this.col2, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformCol3);
        gl.bufferData(gl.ARRAY_BUFFER, this.col3, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformCol4);
        gl.bufferData(gl.ARRAY_BUFFER, this.col4, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
        gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
    }
};

export default Cube;
