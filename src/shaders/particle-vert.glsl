#version 300 es

#define POSITION_LOCATION 2
#define VELOCITY_LOCATION 3
#define COLOR_LOCATION 4
#define TIME_LOCATION 5
#define ID_LOCATION 6

uniform mat4 u_ViewProj;
uniform float u_Time;
uniform mat4 u_Model;


uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
// gl_Position = center + vs_Pos.x * camRight + vs_Pos.y * camUp;
layout(location = POSITION_LOCATION) in vec3 a_position;
layout(location = COLOR_LOCATION) in vec3 a_color;


in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in vec3 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene
in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.

out vec4 fs_Col;
out vec4 fs_Pos;

void main()
{
    fs_Col = vec4(a_color, 1.0);
    fs_Pos = vs_Pos;

    vec3 offset = a_position;

    vec4 modelPos = u_Model * vs_Pos;

//    vec3 offset = vs_Translate;
//    offset.z = (sin((u_Time + offset.x) * 3.14159 * 0.1) + cos((u_Time + offset.y) * 3.14159 * 0.1)) * 1.5;

    vec3 billboardPos = offset + modelPos.x * u_CameraAxes[0] + modelPos.y * u_CameraAxes[1];

    gl_Position = u_ViewProj * vec4(billboardPos, 1.0);
}
