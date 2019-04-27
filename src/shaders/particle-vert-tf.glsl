#version 300 es

#define POSITION_LOCATION 2
#define VELOCITY_LOCATION 3
#define COLOR_LOCATION 4
#define TIME_LOCATION 5
#define ID_LOCATION 6


uniform mat4 u_ViewProj;
uniform float u_Time;
uniform vec3  u_Acceleration;
uniform vec3 u_ParticleColor;
uniform vec2 u_Dimensions;
uniform sampler2D u_ObstacleBuffer;
uniform int   u_IsAttract;
uniform vec3  u_ObstaclePos;



uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
// gl_Position = center + vs_Pos.x * camRight + vs_Pos.y * camUp;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in vec3 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene
in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.


layout(location = POSITION_LOCATION) in vec3 a_position;
layout(location = COLOR_LOCATION) in vec3 a_color;
layout(location = VELOCITY_LOCATION) in vec3 a_velocity;
layout(location = TIME_LOCATION) in vec2 a_time;
layout(location = ID_LOCATION) in float a_ID;


out vec4 fs_Col;
out vec4 fs_Pos;

out vec3 v_pos;
out vec3 v_vel;
out vec3 v_col;
out vec2 v_time;

float random1( vec2 p , vec2 seed) {
  return fract(sin(dot(p + seed, vec2(127.1, 311.7))) * 43758.5453);
}

float random1( vec3 p , vec3 seed) {
  return fract(sin(dot(p + seed, vec3(987.654, 123.456, 531.975))) * 85734.3545);
}

vec2 random2( vec2 p , vec2 seed) {
  return fract(sin(vec2(dot(p + seed, vec2(311.7, 127.1)), dot(p + seed, vec2(269.5, 183.3)))) * 85734.3545);
}

// randomly distributed in a cube
vec3 getParticlePos(float spaceSize){
    vec3 position = vec3(random1(vec2(a_ID, 1.5 * a_ID), vec2(0.0, 0.0)) * spaceSize * 2.0 - spaceSize,
                    random1(vec2(a_ID, 2.5 * a_ID), vec2(0.0, 0.0)) * spaceSize - spaceSize/2.0,
                    random1(vec2(a_ID, 0.5 * a_ID), vec2(0.0, 0.0)) * spaceSize /4.0 - spaceSize/8.0);

    return position;
}

const float MAX_SPEED = 60.0;

void main()
{
//    fs_Col = vs_Col;
//    fs_Pos = vs_Pos;
//
//    vec3 offset = vs_Translate;
//    offset.z = (sin((u_Time + offset.x) * 3.14159 * 0.1) + cos((u_Time + offset.y) * 3.14159 * 0.1)) * 1.5;
//
//    vec3 billboardPos = offset + vs_Pos.x * u_CameraAxes[0] + vs_Pos.y * u_CameraAxes[1];
//
//    gl_Position = u_ViewProj * vec4(billboardPos, 1.0);
//    v_col = u_ParticleColor;

        float spaceSize = 80.0;
        float distToCenter = length(a_position);
        vec3 nextVel = vec3(0.0);
        vec3 nextPos = vec3(0.0);
        // a new particle
        if(a_time.x == 0.0){
            v_pos = getParticlePos(spaceSize);

            v_vel = vec3(random1(vec2(a_ID, 0.0), vec2(0.0, 0.0)) - 0.5, random1(vec2(a_ID, a_ID), vec2(0.0, 0.0)) - 0.5, random1(vec2(2.0 * a_ID, 2.0 * a_ID), vec2(0.0, 0.0)) - 0.5);
            v_vel = normalize(v_vel);


            v_col = u_ParticleColor;

            v_time.x = u_Time;
            v_time.y = 1000.0;
        }
        else{
            float rotationSpeed = 0.1;
            float deltaTime = 0.01;
            vec3 vel = a_velocity;
            vec3 pos = a_position;
            v_col = u_ParticleColor + (1.0 / pow((-(pos.y / 1.2) + spaceSize / 2.0) / 10.0, 5.0));


//                 vec3 tmp = normalize(a_position);
//                tmp = cross(vec3(0, 1, 0), tmp);
//                vel += vel + 0.7 * tmp;

            vel = a_velocity + deltaTime * u_Acceleration;


            if (pos.y < -spaceSize/2.0 ) {
                vel.x = 0.1 * MAX_SPEED * (2.0 * random1(100.0 * pos, vec3(0.0)) - 1.0);
                vel.y = random1(pos + a_velocity, vec3(0.0));
            }

            vec2 position_next = vec2(-pos.x/(spaceSize*2.0) + 0.5, pos.y/(spaceSize/1.0) + 0.6);
            vec4 tex = texture(u_ObstacleBuffer, position_next);
            vec2 obstacleNormal = 2.0 * tex.rg - 1.0;
            if (length(obstacleNormal) > 0.1) {
                 if (length(vel) < 0.5) {
                    vel.xy = obstacleNormal * 0.5;

                 } else {
                //if (dot(vel.xy, obstacleNormal) > 0.0) {
                    vel = reflect(vec3(-vel.x, vel.y, vel.z), vec3(obstacleNormal,0.0)) * 2.0;
                    vel *= min(1.0, 0.5*  MAX_SPEED/length(vel));
                     v_col = vec3(1.0);
                }
            }
            vel *= min(1.0,  MAX_SPEED / length(vel));

            v_vel = vel;

            // POSITION

            vec3 nextPos = pos - deltaTime * vel;
               // push out of obstacle
            vec4 texel = texture(u_ObstacleBuffer, vec2(-v_pos.x/(spaceSize*2.0) + 0.5, v_pos.y/(spaceSize/1.0) + 0.6));
            vec2 on = 2.0 * texel.rg - 1.0;
            nextPos.y += 10.0 * deltaTime * on.y;

            if (pos.y < -spaceSize/2.0 ) {
                 nextPos.x = (random1(pos + v_vel, vec3(0.0)) - 0.5) * spaceSize * 2.0;
                // nextPos.x = random1(vec2(a_ID, 1.5 * a_ID), vec2(0.0, 0.0)) * spaceSize * 2.0 - spaceSize;
                 nextPos.y += spaceSize + 0.5 * random1(v_pos, vec3(0.0)) * (spaceSize + 1.0 - spaceSize);
                 nextPos.z = random1(vec2(a_ID, 0.5 * a_ID), vec2(0.0, 0.0)) * spaceSize/ 4.0 - spaceSize/8.0;

            }
            nextPos.y += 10.0* deltaTime * obstacleNormal.y;
           // nextPos.x -= 10.0* deltaTime * obstacleNormal.x;
            v_pos = nextPos;



//            // update position
//            float rotationSpeed = 0.1;
//            float deltaTime = 0.01;
//            // update velocity
//
//            //vec3 vel = vec3(0.0, 0.0, 0.0);
//            vec3 vel = a_velocity;
//            vel  = vel  + deltaTime * 30.0 * u_Acceleration;
//
//
//            // tangent direction rotating velcoity
//            vec3 tmp = normalize(a_position);
//            tmp = cross(vec3(0, 1, 0), tmp);
//            vel += vel + 0.7 * tmp;
//
////            if(u_IsAttract != 0){
////                vec3 dirVec = u_ObstaclePos - a_position;
////                float dist = length(dirVec);
////                dirVec = normalize(dirVec);
////
////                vel = vel + float(u_IsAttract) * deltaTime * 5000.0 * 1.0 / dist * dirVec;
////            }
//
//                v_pos = a_position - deltaTime * rotationSpeed * vel;
//
//               vec4 texel = texture(u_ObstacleBuffer, vec2(-v_pos.x/(spaceSize*2.0) + 0.5, v_pos.y/(spaceSize/1.0) + 0.6));
//               vec2 on = 2.0 * texel.rg - 1.0;
//               v_pos.y += MAX_SPEED* deltaTime * on.y;
//               v_pos.x -= MAX_SPEED* deltaTime * on.x;
//
//
//            // bring back to top if out of view and reset
//            if (v_pos.y < -spaceSize/2.0 ) {
//                nextVel.x = 0.1 * MAX_SPEED * (2.0 * random1(100.0 * v_pos, vec3(0.0)) - 1.0);
//                nextVel.y = random1(v_pos + vel, vec3(0.0));
//                nextVel *= min(1.0, MAX_SPEED / length(nextVel));
//                v_vel = nextVel;
//
//
//                 nextPos.x = (random1(v_pos + vel, vec3(0.0)) - 0.5) * spaceSize * 2.0;
//                // nextPos.x = random1(vec2(a_ID, 1.5 * a_ID), vec2(0.0, 0.0)) * spaceSize * 2.0 - spaceSize;
//
//                 nextPos.y += spaceSize/2.0 + 0.5 * random1(v_pos, vec3(0.0)) * (spaceSize + 1.0 - spaceSize);
//                 nextPos.z = random1(vec2(a_ID, 0.5 * a_ID), vec2(0.0, 0.0)) * spaceSize/ 4.0 - spaceSize/8.0;
//
//                v_pos = nextPos;
//             //   v_pos.z = 0.0;
//                //v_pos.y = spaceSize/2.0;
//               // v_pos.z = 0.0;
////                v_vel = vec3(random1(vec2(a_ID, 0.0), vec2(0.0, 0.0)) - 0.5, random1(vec2(a_ID, a_ID), vec2(0.0, 0.0)) - 0.5, random1(vec2(2.0 * a_ID, 2.0 * a_ID), vec2(0.0, 0.0)) - 0.5);
////                v_vel = normalize(v_vel);
//                v_col = u_ParticleColor;
//                v_time.x = u_Time;
//                v_time.y = 1000.0;
//            } else {
//                 nextVel = a_velocity + deltaTime * u_Acceleration;
//                 v_col = u_ParticleColor + (1.0 / pow((-(v_pos.y / 1.2) + spaceSize / 2.0) / 10.0, 5.0));
//
//                //vec3 testVel = v_vel + deltaTime * u_Acceleration;
//                //vec2 uv = vec2(0.5 * (v_pos.x + 1.0), 0.5 * (v_pos.y + 1.0));
//                vec2 position_next = vec2(-v_pos.x/(spaceSize*2.0) + 0.5, v_pos.y/(spaceSize/1.0) + 0.6);
//                vec4 tex = texture(u_ObstacleBuffer, position_next);
//                vec2 obstacleNormal = 2.0 * tex.rg - 1.0;
//                //v_pos += deltaTime * vec3(obstacleNormal.x, obstacleNormal.y, 0.0);
//                //vec4 texel = texture(u_ObstacleBuffer, position_next);
//                //vec2 val = 2.0 * texel.rg - 1.0;
//                if (dot(obstacleNormal, obstacleNormal) > 1.0) {
//                   // if (dot(vel.xy, obstacleNormal) > 0.0) {
//                        nextVel = reflect(a_velocity, vec3(obstacleNormal,0.0));
//                        nextVel *= min(30.0, MAX_SPEED/length(nextVel));
//                        v_vel = nextVel;
//                       // nextVel = vec3(100.0, -100.0, 0.0);
//                        v_col = vec3(1.0);
//                    //    }
//                   // } else {
//                     //v_vel = a_velocity + deltaTime * u_Acceleration;
//                     //v_col = u_ParticleColor + (1.0 / pow((-(v_pos.y / 1.2) + spaceSize / 2.0) / 10.0, 5.0));
//
//                  // }
//                   // v_col = vec3(tex.rgb);
////                   v_vel = a_velocity + deltaTime * u_Acceleration;
////                   v_col = u_ParticleColor + (1.0 / pow((-(v_pos.y / 1.2) + spaceSize / 2.0) / 10.0, 5.0));
//                }
////               if(u_IsAttract != 0){
//////                    vec3 dirVec = u_AttractPos - a_position;
//////                    float dist = length(dirVec);
//////                    dirVec = normalize(dirVec);
//////
//////                    v_vel = a_velocity + float(u_IsAttract) * deltaTime * 5000.0 * 1.0 / dist * dirVec;
////                    float t = length(a_position - u_ObstaclePos);
////                    if (t < 10.0) {
////                         v_vel = -a_velocity;
////;
////                      }
////                }
//                else {
//               // v_vel = nextVel;
//                   v_vel = a_velocity + deltaTime * u_Acceleration;
//                   }

           // }





            v_time = a_time;
        }
}
