#version 300 es
precision highp float;

// The vertex shader used to render the background of the scene

uniform mat4 u_ViewProj;

in vec4 vs_Pos;
out vec4 fs_Pos;

out vec2 sampleCoords;

void main() {
    fs_Pos = vs_Pos;
    vec4 pos = u_ViewProj * vs_Pos;
    vec2 uv = vec2(0.5 * (fs_Pos.x + 1.0), 0.5 * (fs_Pos.y + 1.0));
    sampleCoords = uv;

     gl_Position =  u_ViewProj *  vec4(2.0*vs_Pos.x - 1.0, 2.0 * vs_Pos.y - 1.0, 0.0, 1.0);
     //gl_Position = u_ViewProj * vs_Pos;
}
