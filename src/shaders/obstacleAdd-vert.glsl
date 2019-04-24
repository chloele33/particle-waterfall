#version 300 es
precision highp float;

// The vertex shader used to render the background of the scene

uniform vec2 u_ObstaclePos;

in vec4 vs_Pos;
out vec4 fs_Pos;

out vec2 fromCenter;

void main() {
  fs_Pos = vs_Pos;
  //gl_Position = vs_Pos;
  fromCenter = 2.0 * vs_Pos.xy;

    vec2 c = u_ObstaclePos + 0.5 * vs_Pos.xy;
    gl_Position = vec4(2.0*c - 1.0, 0.0, 1.0);
}
