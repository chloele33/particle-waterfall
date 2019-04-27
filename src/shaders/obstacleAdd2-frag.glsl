#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;
uniform float u_ObstacleSize;


uniform vec2 u_ObstaclePos;
uniform sampler2D u_Texture;


in vec4 fs_Pos;
in vec2 sampleCoords;


out vec4 out_Col;


void main() {
    //vec2 uv = vec2(0.5 * (fs_Pos.x + 1.0), 0.5 * (fs_Pos.y + 1.0));
    vec2 size = vec2(u_ObstacleSize / u_Dimensions.x, u_ObstacleSize / u_Dimensions.y);
        vec2 fromCenter = 2.0 * (sampleCoords - u_ObstaclePos) / size;
        // out_Col = vec4(0.0 * (vec3(0.0) + vec3(1.0)),0.0);
         if (dot(fromCenter, fromCenter) < 1.0) {
             vec2 normal = normalize(fromCenter);
            out_Col = vec4(0.5*normal + 0.5, 0, 1);
           //out_Col = vec4(1.0);
           }
        else {
              out_Col = texture(u_Texture, sampleCoords);
           }

}
