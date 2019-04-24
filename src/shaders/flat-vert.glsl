#version 300 es
precision highp float;

// The vertex shader used to render the background of the scene

uniform mat4 u_ViewProj;
uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)



in vec4 vs_Pos;
out vec4 fs_Pos;
out vec4 fs_Col;



void main() {


  fs_Col = vec4(1.0, 1.0, 1.0, 1.0);
  fs_Pos = vec4(vs_Pos.x, vs_Pos.y, vs_Pos.z, 1.0);
  gl_Position = u_ViewProj * vec4(vs_Pos.x, vs_Pos.y,  vs_Pos.z, 1.0);


}
