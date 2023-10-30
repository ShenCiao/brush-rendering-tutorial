precision mediump float;
precision mediump int;

const vec4 color = vec4(0.0, 0.0, 0.0, 1.0);

out vec4 outColor;

in vec2 p;

flat in vec2 p0;
flat in vec2 p1;
// Radius values given by geometry, passed from the vertex shader
flat in float r0;
flat in float r1;

void main() {
    vec2 tangent = normalize(p1 - p0);
    vec2 normal = vec2(-tangent.y, tangent.x);
    float len = distance(p1, p0);

    vec2 pLocal = vec2(dot(p-p0, tangent), dot(p-p0, normal));

    float d0 = distance(p, p0);
    float d1 = distance(p, p1);
    float d0cos = pLocal.x / d0; // cosine value of the angle between line(p0, p) and current edge
    float d1cos = (pLocal.x - len) / d1; // between line(p1, p) and current edge

    float cosTheta = (r0 - r1)/distance(p0, p1);

    // Discard corners
    if(d0cos < cosTheta && d0 > r0) discard;
    if(d1cos > cosTheta && d1 > r1) discard;

    // Deal with opactiy
    float A = color.a;
    if (d0 < r0 && d1 < r1) discard;
    if (d0 < r0 || d1 < r1) A = 1.0 - sqrt(1.0 - A);

    outColor = vec4(color.rgb, A);
}