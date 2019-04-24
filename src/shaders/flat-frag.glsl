#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec4 fs_Pos;
in vec4 fs_Col;

out vec4 out_Col;

void main() {
  out_Col = vec4(0.5 * (fs_Col + vec4(1.0)));

}
