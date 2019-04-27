#version 300 es
precision highp float;

// The vertex shader used to render the background of the scene
uniform mat4 u_ViewProj;

uniform vec2 u_ObstaclePos;


in vec4 vs_Pos;
in vec2 a_Corner;
out vec4 fs_Pos;

out vec2 sampleCoords;

void main() {
  //fs_Pos = vs_Pos;
  //gl_Position = vs_Pos;2
  sampleCoords = vs_Pos.xy;
  gl_Position =    vec4(2.0*vs_Pos.xy- 1.0, 0.0, 1.0);
}
