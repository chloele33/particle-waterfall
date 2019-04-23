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
    vec3 position = vec3(random1(vec2(a_ID, 1.5 * a_ID), vec2(0.0, 0.0)) * spaceSize - spaceSize/2.0,
                    random1(vec2(a_ID, 2.5 * a_ID), vec2(0.0, 0.0)) * spaceSize - spaceSize/2.0,
                    random1(vec2(a_ID, 0.5 * a_ID), vec2(0.0, 0.0)) * spaceSize - spaceSize/2.0);

    return position;
}

const float MAX_SPEED = 10.0;

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
            // update position
            float rotationSpeed = 0.1;
            float deltaTime = 0.01;
            // update velocity

            //vec3 vel = vec3(0.0, 0.0, 0.0);
            vec3 vel = a_velocity;
            vel  = vel  + deltaTime * 30.0 * u_Acceleration;


            // tangent direction rotating velcoity
            vec3 tmp = normalize(a_position);
            tmp = cross(vec3(0, 1, 0), tmp);
            vel += vel + 0.7 * tmp;

            v_pos = a_position - deltaTime * rotationSpeed * vel;

            // bring back to top if out of view and reset
            if (v_pos.y < -spaceSize/2.0 ) {
                nextVel.x = 0.1 * MAX_SPEED * (2.0 * random1(100.0 * v_pos, vec3(0.0)) - 1.0);
                nextVel.y = random1(v_pos + vel, vec3(0.0));
                nextVel *= min(1.0, MAX_SPEED / length(nextVel));

                 nextPos.x = (random1(v_pos + vel, vec3(0.0)) - 0.5) * spaceSize;
                 nextPos.y += spaceSize + 0.5 * random1(v_pos, vec3(0.0)) * (spaceSize + 64.0 - spaceSize);

                v_pos.y = spaceSize/2.0;
//                v_vel = vec3(random1(vec2(a_ID, 0.0), vec2(0.0, 0.0)) - 0.5, random1(vec2(a_ID, a_ID), vec2(0.0, 0.0)) - 0.5, random1(vec2(2.0 * a_ID, 2.0 * a_ID), vec2(0.0, 0.0)) - 0.5);
//                v_vel = normalize(v_vel);
                v_vel = nextVel;
                v_col = u_ParticleColor;
                v_time.x = u_Time;
                v_time.y = 1000.0;
            } else {
                v_vel = a_velocity + deltaTime * u_Acceleration;
                v_col = u_ParticleColor + (1.0 / pow((-(v_pos.y) + spaceSize / 2.0) / 10.0, 5.0));

            }


            v_time = a_time;
        }
}
