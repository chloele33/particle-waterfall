#version 300 es
precision highp float;

// The vertex shader used to render the background of the scene
uniform mat4 u_ViewProj;
uniform vec2 u_Dimensions;

uniform vec2 u_ObstaclePos;
uniform float u_ObstacleSize;


in vec4 vs_Pos;
in vec2 a_Corner;
out vec4 fs_Pos;

out vec2 fromCenter;

void main() {
 // fs_Pos = vs_Pos;
  //gl_Position = vs_Pos;
  fromCenter = 2.0 * vs_Pos.xy;
   // vec2 pos = vec2(u_ObstaclePos.x, 1.0 - u_ObstaclePos.y);

    vec2 size = vec2(u_ObstacleSize / u_Dimensions.x, u_ObstacleSize / u_Dimensions.y);
    vec2 c = u_ObstaclePos + size * vs_Pos.xy;
    gl_Position =   vec4(2.0*c - 1.0, 0.0, 1.0);
}
