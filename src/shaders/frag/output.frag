precision mediump float;

const int TRAIL_LENGTH = 15;
const float EPS = 1e-4;
const int ITR = 16;
const float PI = acos(-1.0);

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uPointerTrail[TRAIL_LENGTH];

varying vec2 vTexCoord;

float rnd3D(vec3 p) {
    return fract(
        sin(dot(p, vec3(12.9898, 78.233, 37.719)))
        * 43758.5453123
    );
}

float noise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);

    float a000 = rnd3D(i);
    float a100 = rnd3D(i + vec3(1.0, 0.0, 0.0));
    float a010 = rnd3D(i + vec3(0.0, 1.0, 0.0));
    float a110 = rnd3D(i + vec3(1.0, 1.0, 0.0));
    float a001 = rnd3D(i + vec3(0.0, 0.0, 1.0));
    float a101 = rnd3D(i + vec3(1.0, 0.0, 1.0));
    float a011 = rnd3D(i + vec3(0.0, 1.0, 1.0));
    float a111 = rnd3D(i + vec3(1.0, 1.0, 1.0));

    vec3 u = f * f * (3.0 - 2.0 * f);

    float k0 = a000;
    float k1 = a100 - a000;
    float k2 = a010 - a000;
    float k3 = a001 - a000;
    float k4 = a000 - a100 - a010 + a110;
    float k5 = a000 - a010 - a001 + a011;
    float k6 = a000 - a100 - a001 + a101;

    float k7 =
        -a000 + a100 + a010 - a110
        + a001 - a101 - a011 + a111;

    return k0
        + k1 * u.x
        + k2 * u.y
        + k3 * u.z
        + k4 * u.x * u.y
        + k5 * u.y * u.z
        + k6 * u.z * u.x
        + k7 * u.x * u.y * u.z;
}


// =========================
// Camera
// =========================

vec3 origin = vec3(0.0, 0.0, 1.0);
vec3 lookAt = vec3(0.0, 0.0, 0.0);

vec3 cDir = normalize(lookAt - origin);
vec3 cUp = vec3(0.0, 1.0, 0.0);
vec3 cSide = cross(cDir, cUp);


// =========================
// SDF
// =========================

float smoothMin(float d1, float d2, float k) {

    float h =
        exp(-k * d1) +
        exp(-k * d2);

    return -log(h) / k;
}

vec3 translate(vec3 p, vec3 t) {
    return p - t;
}

float sdSphere(vec3 p, float s) {
    return length(p) - s;
}

float map(vec3 p) {

    // =========================
    // Droplet Size
    // =========================

    float DROPLET_SCALE = 0.4;

    float baseRadius =
        3e-3 * DROPLET_SCALE;

    float radius =
        baseRadius * float(TRAIL_LENGTH);

    float k = 7.0;
    float d = 1e5;


    // =========================
    // Pointer Trail
    // =========================

    for (int i = 0; i < TRAIL_LENGTH; i++) {

        float fi = float(i);

        vec2 pointerTrail =
            uPointerTrail[i] *
            uResolution /
            uResolution.y;

        float sphere =
            sdSphere(
                translate(
                    p,
                    vec3(pointerTrail, 0.0)
                ),
                radius - baseRadius * fi
            );

        d = smoothMin(
            d,
            sphere,
            k
        );
    }


    // =========================
    // Fixed Sphere
    // =========================

    float sphere =
        sdSphere(
            translate(
                p,
                vec3(1.0, -0.25, 0.0)
            ),
            0.55
        );

    d = smoothMin(
        d,
        sphere,
        k
    );

    return d;
}


// =========================
// Normal
// =========================

vec3 generateNormal(vec3 p) {

    return normalize(
        vec3(

            map(
                p + vec3(EPS, 0.0, 0.0)
            )
            -
            map(
                p - vec3(EPS, 0.0, 0.0)
            ),

            map(
                p + vec3(0.0, EPS, 0.0)
            )
            -
            map(
                p - vec3(0.0, EPS, 0.0)
            ),

            map(
                p + vec3(0.0, 0.0, EPS)
            )
            -
            map(
                p - vec3(0.0, 0.0, EPS)
            )

        )
    );
}


// =========================
// Droplet Color
// =========================

vec3 dropletColor(
    vec3 normal,
    vec3 rayDir
) {

    vec3 reflectDir =
        reflect(
            rayDir,
            normal
        );

    float noisePosTime =
        noise3D(
            reflectDir * 2.0 +
            uTime
        );

    float noiseNegTime =
        noise3D(
            reflectDir * 2.0 -
            uTime
        );


    // =========================
    // Dark Emerald Colors
    // =========================

    // Dark emerald
    vec3 darkGreen =
        vec3(
            0.002,
            0.20,
            0.14
        );

    // Slightly brighter emerald
    vec3 lightGreen =
        vec3(
            0.006,
            0.38,
            0.26
        );


    vec3 color0 =
        darkGreen *
        noisePosTime;

    vec3 color1 =
        lightGreen *
        noiseNegTime;


    // Lower intensity
    float intensity = 2.0;

    return (color0 + color1) * intensity;
}


// =========================
// Main
// =========================

void main() {

    vec2 p =
        (
            gl_FragCoord.xy * 2.0 -
            uResolution
        )
        /
        uResolution.y;


    // =========================
    // Orthographic Camera
    // =========================

    vec3 ray =
        origin +
        cSide * p.x +
        cUp * p.y;

    vec3 rayDirection =
        cDir;


    float dist = 0.0;


    // =========================
    // Ray Marching
    // =========================

    for (int i = 0; i < ITR; ++i) {

        dist = map(ray);

        ray +=
            rayDirection *
            dist;

        if (dist < EPS) {
            break;
        }
    }


    // =========================
    // Color
    // =========================

    vec3 color =
        vec3(0.0);


    if (dist < EPS) {

        vec3 normal =
            generateNormal(ray);

        color =
            dropletColor(
                normal,
                rayDirection
            );
    }


    // =========================
    // Glossy Response
    // =========================

    vec3 finalColor =
        pow(
            max(color, 0.0),
            vec3(2.2)
        );


    // =========================
    // Transparency
    // =========================

    float brightness =
        max(
            finalColor.r,
            max(
                finalColor.g,
                finalColor.b
            )
        );


    // More transparent green.
    // Bright areas remain visible.

    float alpha =
        smoothstep(
            0.015,
            0.30,
            brightness
        ) * 0.65;


    // =========================
    // Final Output
    // =========================

    gl_FragColor =
        vec4(
            finalColor,
            alpha
        );
}

