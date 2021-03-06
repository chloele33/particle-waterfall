#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;
uniform sampler2D u_ObstacleBuffer;
uniform float u_ShowObs;


in vec4 fs_Pos;
in vec2 sampleCoords;

out vec4 out_Col;



void main() {
 // out_Col = vec4(0.0 * (vec3(0.0) + vec3(1.0)),0.0);
      // vec2 uv = vec2(0.5 * (fs_Pos.x + 1.0), 0.5 * (fs_Pos.y + 1.0));
        vec4 texel = texture(u_ObstacleBuffer, sampleCoords);
          vec2 normal = 2.0 * texel.rg - 1.0;

          if (dot(normal, normal) < 0.1)
             discard;

        if (u_ShowObs == 1.0) {
            out_Col =vec4(texel.rg, 0, 1.8);
           out_Col = vec4(vec3(0.32, 0.4, 0.8), 1.0);

        } else {
            discard;
        }
}
