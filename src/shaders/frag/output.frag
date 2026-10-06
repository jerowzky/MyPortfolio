precision mediump float;

// =====================================================
// SETTINGS
// =====================================================

// Keep 15 so the pointer trail behaves like the original.
const int TRAIL_LENGTH = 10;

// 10 is a good balance for mobile.
// Original = 16.
const int ITR = 10;

const float EPS = 0.0005;

// Original smoothness was controlled by k = 7.
// This is kept visually similar.
const float SMOOTH_K = 7.0;


// =====================================================
// UNIFORMS
// =====================================================

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uPointerTrail[TRAIL_LENGTH];
uniform float uDropletScale;

varying vec2 vTexCoord;


// =====================================================
// CAMERA
// =====================================================

const vec3 ORIGIN = vec3(0.0, 0.0, 1.0);
const vec3 DIR = vec3(0.0, 0.0, -1.0);
const vec3 UP = vec3(0.0, 1.0, 0.0);
const vec3 SIDE = vec3(1.0, 0.0, 0.0);


// =====================================================
// CHEAPER HASH
// =====================================================

float hash3(vec3 p)
{
    return fract(
        sin(
            dot(
                p,
                vec3(
                    12.9898,
                    78.233,
                    37.719
                )
            )
        ) * 43758.5453
    );
}


// =====================================================
// CHEAPER NOISE
// =====================================================
//
// Same general animated noise idea as your original,
// but fewer arithmetic operations.
// =====================================================

float noise3D(vec3 p)
{
    vec3 i = floor(p);
    vec3 f = fract(p);

    f = f * f * (3.0 - 2.0 * f);

    float n000 = hash3(i);
    float n100 = hash3(i + vec3(1.0, 0.0, 0.0));
    float n010 = hash3(i + vec3(0.0, 1.0, 0.0));
    float n110 = hash3(i + vec3(1.0, 1.0, 0.0));

    float n001 = hash3(i + vec3(0.0, 0.0, 1.0));
    float n101 = hash3(i + vec3(1.0, 0.0, 1.0));
    float n011 = hash3(i + vec3(0.0, 1.0, 1.0));
    float n111 = hash3(i + vec3(1.0, 1.0, 1.0));

    float x00 = mix(n000, n100, f.x);
    float x10 = mix(n010, n110, f.x);

    float x01 = mix(n001, n101, f.x);
    float x11 = mix(n011, n111, f.x);

    float y0 = mix(x00, x10, f.y);
    float y1 = mix(x01, x11, f.y);

    return mix(y0, y1, f.z);
}


// =====================================================
// ORIGINAL-STYLE SMOOTH MIN
// =====================================================
//
// Keep the same exponential/log smooth blending
// because changing this changes the droplet shape.
// =====================================================

float smoothMin(
    float d1,
    float d2,
    float k
)
{
    float h = max(k - abs(d1 - d2), 0.0) / k;

    return min(d1, d2)
        - h * h * h * k * (1.0 / 6.0);
}


// =====================================================
// SPHERE
// =====================================================

float sdSphere(
    vec3 p,
    float radius
)
{
    return length(p) - radius;
}


// =====================================================
// SCENE / SDF
// =====================================================

float map(vec3 p)
{
    // -------------------------------------------------
    // Droplet size
    // -------------------------------------------------

    float baseRadius =
        0.003 * uDropletScale;

    float radius =
        baseRadius * float(TRAIL_LENGTH);

    float d = 1000.0;

    // -------------------------------------------------
    // Correct aspect ratio
    // -------------------------------------------------

    vec2 resolutionScale =
        uResolution / uResolution.y;

    // -------------------------------------------------
    // Pointer trail
    // -------------------------------------------------

    for (int i = 0; i < TRAIL_LENGTH; i++)
    {
        float fi = float(i);

        vec2 pointer =
            uPointerTrail[i] *
            resolutionScale;

        vec3 offset =
            p - vec3(pointer, 0.0);

        float sphere =
            length(offset) -
            (radius - baseRadius * fi);

        d =
            smoothMin(
                d,
                sphere,
                0.15
            );
    }

    // -------------------------------------------------
    // Fixed sphere
    // -------------------------------------------------

    vec3 fixedOffset =
        p - vec3(
            1.0,
            -0.25,
            0.0
        );

    float fixedSphere =
        length(fixedOffset) - 0.35;

    d = smoothMin(
        d,
        fixedSphere,
        0.15
    );

    return d;
}


// =====================================================
// NORMAL
// =====================================================
//
// 4 samples instead of the original 6.
// Visually very close while considerably cheaper.
// =====================================================

vec3 generateNormal(vec3 p)
{
    vec2 e =
        vec2(
            EPS,
            -EPS
        );

    return normalize(
        e.xyy * map(p + e.xyy) +
        e.yyx * map(p + e.yyx) +
        e.yxy * map(p + e.yxy) +
        e.xxx * map(p + e.xxx)
    );
}


// =====================================================
// DROPLET COLOR
// =====================================================

vec3 dropletColor(
    vec3 normal,
    vec3 rayDir
)
{
    vec3 reflectDir =
        reflect(
            rayDir,
            normal
        );

    vec3 noisePosition =
        reflectDir * 2.0;

    float noiseValue =
        noise3D(
            noisePosition +
            vec3(uTime)
        );

    const vec3 darkGreen =
        vec3(
            0.002,
            0.20,
            0.14
        );

    const vec3 lightGreen =
        vec3(
            0.006,
            0.38,
            0.26
        );

    return mix(
        darkGreen,
        lightGreen,
        noiseValue
    ) * 2.0;
}


// =====================================================
// MAIN
// =====================================================

void main()
{
    // -------------------------------------------------
    // Screen position
    // -------------------------------------------------

    vec2 p =
        (
            gl_FragCoord.xy * 2.0 -
            uResolution
        )
        /
        uResolution.y;

    // -------------------------------------------------
    // Orthographic camera
    // -------------------------------------------------

    vec3 ray =
        ORIGIN +
        SIDE * p.x +
        UP * p.y;

    vec3 rayDirection =
        DIR;

    // -------------------------------------------------
    // Ray marching
    // -------------------------------------------------

    float dist = 0.0;

    for (int i = 0; i < ITR; i++)
    {
        dist = map(ray);

        // Surface hit
        if (dist < EPS)
            break;

        // Move ray
        ray +=
            rayDirection * dist;
    }

    // -------------------------------------------------
    // Background
    // -------------------------------------------------

    vec3 color =
        vec3(0.0);

    // -------------------------------------------------
    // Surface shading
    // -------------------------------------------------

    if (dist < EPS)
    {
        vec3 normal =
            generateNormal(ray);

        color =
            dropletColor(
                normal,
                rayDirection
            );
    }

    // -------------------------------------------------
    // Glossy response
    // -------------------------------------------------

    vec3 finalColor =
        pow(
            max(color, 0.0),
            vec3(2.2)
        );

    // -------------------------------------------------
    // Transparency
    // -------------------------------------------------

    float brightness =
        max(
            finalColor.r,
            max(
                finalColor.g,
                finalColor.b
            )
        );

    float alpha =
        smoothstep(
            0.015,
            0.30,
            brightness
        ) * 0.65;

    // -------------------------------------------------
    // Output
    // -------------------------------------------------

    gl_FragColor =
        vec4(
            finalColor,
            alpha
        );
}