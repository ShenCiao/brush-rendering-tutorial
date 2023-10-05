precision mediump float;
precision mediump int;

// Set alpha value to 0.5
const vec4 color = vec4(0.0, 0.0, 0.0, 0.5);

out vec4 outColor;

in vec2 p;
flat in vec2 p0;
flat in vec2 p1;
flat in float r;

void main() {
    vec2 tangent = normalize(p1 - p0);
    vec2 normal = vec2(-tangent.y, tangent.x);
    float len = distance(p1, p0);

    vec2 pLocal = vec2(dot(p-p0, tangent), dot(p-p0, normal));

    float d0 = distance(p, p0);
    float d1 = distance(p, p1);

    if(pLocal.x < 0.0 && d0 > r) discard;
    if(pLocal.x > len && d1 > r) discard;

    // ------------------------------------------------
    float A = color.a;
    // If pixel is inside one of the joint areas
    if (d0 < r || d1 < r) A = 1.0 - sqrt(1.0 - A);
    // If pixel is inside both joint areas, opacity is zero, discard it
    if (d0 < r && d1 < r) discard;

    outColor = vec4(color.rgb, A);
}