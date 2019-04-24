#version 300 es
precision highp float;

// The vertex shader used to render the background of the scene

in vec4 vs_Pos;
out vec4 fs_Pos;

out vec2 sampleCoords;

void main() {
    sampleCoords = vs_Pos.xy;
  fs_Pos = vs_Pos;
  gl_Position = vs_Pos;
     gl_Position = vec4(2.0*vs_Pos.xy - 1.0, 0.0, 1.0);
}
