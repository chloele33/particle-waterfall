import {vec3, mat4} from 'gl-matrix';
import {gl} from './globals';


class Particle{
    pos: vec3; // position
    vel: vec3; // velocity
    acc: vec3; // acceleration
    size: number;

    constructor(pos: vec3, vel: vec3, acc: vec3, size: number){
        this.pos = pos;
        this.vel = vel;
        this.acc = acc;
        this.size = size;

    }

    update(time: number) {
        // update position: applying velocity
        let deltaPos = vec3.create();
        vec3.scale(deltaPos, this.vel, time);
        vec3.add(this.pos, this.pos, deltaPos);

        // update velocity: applying acceleration
        let deltaVel = vec3.create();
        vec3.scale(deltaVel, this.acc, time);
        vec3.add(this.vel, this.vel, deltaVel);
    }

}

const POSITION_LOCATION = 2;
const VELOCITY_LOCATION = 3;
const COLOR_LOCATION = 4;
const TIME_LOCATION = 5;
const ID_LOCATION = 6;

const NUM_LOCATIONS = 7;

class ParticleCollection{
    numParticles: number;
    velocityArray: Float32Array;
    positionArray: Float32Array;
    timeArray: Float32Array;
    particleIDs: Float32Array;


    colorsArray: Float32Array;
    offsetsArray: Float32Array;

    particleVAOs: WebGLVertexArrayObject[];
    particleTransformFeedbacks: WebGLTransformFeedback[];
    particleVBOs: WebGLBuffer[][];


    constructor(numParticles: number) {
        this.numParticles = numParticles;


        this.velocityArray  = new Float32Array(this.numParticles * 3);
        this.positionArray = new Float32Array(this.numParticles * 3);
        this.colorsArray = new Float32Array(this.numParticles * 3);
        this.timeArray = new Float32Array(this.numParticles * 2);
        this.particleIDs  = new Float32Array(this.numParticles);

        this.particleVAOs = [gl.createVertexArray(), gl.createVertexArray()];
        this.particleTransformFeedbacks = [gl.createTransformFeedback(), gl.createTransformFeedback()];

    }

    create() {
        // Initialize
        for (let i = 0; i < this.numParticles; i++) {
            this.positionArray[i * 3] = 0.0;
            this.positionArray[i * 3 + 1] = 0.0;
            this.positionArray[i * 3 + 2] = 0.0;

            this.velocityArray[i * 3] = 0.0;
            this.velocityArray[i * 3 + 1] = 0.0;
            this.velocityArray[i * 3 + 2] = 0.0;

            this.colorsArray[i * 3] = 0.0;
            this.colorsArray[i * 3 + 1] = 0.0;
            this.colorsArray[i * 3 + 2] = 0.0;

            this.timeArray[i * 2] = 0.0;
            this.timeArray[i * 2 + 1] = 0.0;

            this.particleIDs[i] = i;
        }
    }

    setVBOs() {
        this.particleVBOs = new Array(this.particleVAOs.length);

        for (let i = 0; i < this.particleVAOs.length; ++i) {
            this.particleVBOs[i] = new Array(NUM_LOCATIONS);

            gl.bindVertexArray(this.particleVAOs[i]);

            this.particleVBOs[i][POSITION_LOCATION] = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.particleVBOs[i][POSITION_LOCATION]);
            gl.bufferData(gl.ARRAY_BUFFER, this.positionArray, gl.STREAM_COPY);
            gl.vertexAttribPointer(POSITION_LOCATION, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(POSITION_LOCATION);

            this.particleVBOs[i][VELOCITY_LOCATION] = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.particleVBOs[i][VELOCITY_LOCATION]);
            gl.bufferData(gl.ARRAY_BUFFER, this.velocityArray, gl.STREAM_COPY);
            gl.vertexAttribPointer(VELOCITY_LOCATION, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(VELOCITY_LOCATION);

            this.particleVBOs[i][COLOR_LOCATION] = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.particleVBOs[i][COLOR_LOCATION]);
            gl.bufferData(gl.ARRAY_BUFFER, this.colorsArray, gl.STREAM_COPY);
            gl.vertexAttribPointer(COLOR_LOCATION, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(COLOR_LOCATION);

            this.particleVBOs[i][TIME_LOCATION] = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.particleVBOs[i][TIME_LOCATION]);
            gl.bufferData(gl.ARRAY_BUFFER, this.timeArray, gl.STREAM_COPY);
            gl.vertexAttribPointer(TIME_LOCATION, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(TIME_LOCATION);

            this.particleVBOs[i][ID_LOCATION] = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.particleVBOs[i][ID_LOCATION]);
            gl.bufferData(gl.ARRAY_BUFFER, this.particleIDs, gl.STATIC_READ);
            gl.vertexAttribPointer(ID_LOCATION, 1, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(ID_LOCATION);


            gl.bindBuffer(gl.ARRAY_BUFFER, null);

            gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.particleTransformFeedbacks[i]);
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.particleVBOs[i][POSITION_LOCATION]);
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, this.particleVBOs[i][VELOCITY_LOCATION]);
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 2, this.particleVBOs[i][COLOR_LOCATION]);
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 3, this.particleVBOs[i][TIME_LOCATION]);
            gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
        }
    }


    getVAO(i: number): WebGLVertexArrayObject{
        return this.particleVAOs[i];
    }

    getTransformFeedbacks(i: number): WebGLTransformFeedback{
        return this.particleTransformFeedbacks[i];
    }

    getColors(): Float32Array {
        return this.colorsArray;
    }

    getVBO(i: number): WebGLBuffer[]{
        return this.particleVBOs[i];
    }
}

export {Particle, ParticleCollection};
