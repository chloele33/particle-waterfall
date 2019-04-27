#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec4 fs_Pos;
in vec2 fromCenter;


out vec4 out_Col;


void main() {
 // out_Col = vec4(0.0 * (vec3(0.0) + vec3(1.0)),0.0);
            if (dot(fromCenter, fromCenter) < 2.0) {
               discard;
           }

           vec2 normal = normalize(fromCenter);
           out_Col = vec4(0.5*normal + 0.5, 0, 1);

}
