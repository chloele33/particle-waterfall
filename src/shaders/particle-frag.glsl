#version 300 es
precision highp float;


uniform float u_ParticleSize;

in vec4 fs_Col;
in vec4 fs_Pos;

float random1( vec2 p , vec2 seed) {
  return fract(sin(dot(p + seed, vec2(127.1, 311.7))) * 43758.5453);
}

float random1( vec3 p , vec3 seed) {
  return fract(sin(dot(p + seed, vec3(987.654, 123.456, 531.975))) * 85734.3545);
}

vec2 random2( vec2 p , vec2 seed) {
  return fract(sin(vec2(dot(p + seed, vec2(311.7, 127.1)), dot(p + seed, vec2(269.5, 183.3)))) * 85734.3545);
}


out vec4 out_Col;


void main()
{
//    float rand = random1(fs_Pos.xy, vec2(0.0));
//    rand = 0.1;
    float dist = 1.0 - (length(fs_Pos.xyz) * 2.0 / (u_ParticleSize) );
    out_Col = vec4(dist) * fs_Col;
}
