#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;

uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
// gl_Position = center + vs_Pos.x * camRight + vs_Pos.y * camUp;
uniform vec2 u_Dimensions;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in vec3 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene
in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.
// for instance render
in vec4 vs_Transform1;
in vec4 vs_Transform2;
in vec4 vs_Transform3;
in vec4 vs_Transform4;


out vec4 fs_Col;
out vec4 fs_Pos;
out vec4 fs_Nor;



void main()
{
    fs_Col = vs_Col;
    fs_Pos = vs_Pos;


    mat4 transformation = mat4(vs_Transform1,
                                vs_Transform2,
                                vs_Transform3,
                                vs_Transform4);

    vec4 instancedPos = transformation * vs_Pos ;

    vec4 pos = vec4(100.0 * (instancedPos.x / (2000.0 / 2.0) - 1.0), 100.0 * (instancedPos.y / (2000.0 / 2.0) - 1.0), 100.0 * (instancedPos.z / (2000.0 / 2.0) - 1.0), 1.0);


    gl_Position = u_ViewProj * pos;


    //gl_Position = vec4(instancedPos.x / (2000.0 / 2.0) - 1.0, instancedPos.z / (2000.0 / 2.0) - 1.0, 0.0, 1.0);
    //gl_Position = vec4(instancedPos.x, instancedPos.z, 0.0, 1.0);

//    vec3 offset = vs_Translate;
//    offset.z = (sin((u_Time + offset.x) * 3.14159 * 0.1) + cos((u_Time + offset.y) * 3.14159 * 0.1)) * 1.5;
//
//    vec3 billboardPos = offset + vs_Pos.x * u_CameraAxes[0] + vs_Pos.y * u_CameraAxes[1];
//
//    gl_Position = u_ViewProj * vec4(billboardPos, 1.0);
}
