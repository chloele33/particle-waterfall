#version 300 es
precision highp float;

// The vertex shader used to render the background of the scene
uniform mat4 u_ViewProj;

uniform vec2 u_ObstaclePos;


in vec4 vs_Pos;
out vec4 fs_Pos;

out vec2 fromCenter;

void main() {
  fs_Pos = vs_Pos;
  //gl_Position = vs_Pos;
  fromCenter = 2.0 * vec2(vs_Pos.x, vs_Pos.y);


    vec2 c = u_ObstaclePos + 0.9 * vec2(vs_Pos.x, vs_Pos.y);
    gl_Position =  vec4(2.0*c, 0.0, 1.0);
}
