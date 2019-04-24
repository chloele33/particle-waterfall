#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;
uniform sampler2D u_ObstacleBuffer;

in vec4 fs_Pos;
in vec2 sampleCoords;

out vec4 out_Col;



void main() {
 // out_Col = vec4(0.0 * (vec3(0.0) + vec3(1.0)),0.0);
        vec4 texel = texture(u_ObstacleBuffer, sampleCoords);
          vec2 normal = 2.0 * texel.rg - 1.0;

          if (dot(normal, normal) < 0.1)
              discard;

          out_Col = vec4(0.1, 0.1, 0.1, 1.0);
}
