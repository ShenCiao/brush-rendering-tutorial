precision mediump float;
precision mediump int;

in vec2 p;
flat in vec2 p0;
flat in vec2 p1;
flat in float r;
in vec3 color;

out vec4 outColor;

void main() {
    vec2 tangent = normalize(p1 - p0);
    vec2 normal = vec2(-tangent.y, tangent.x);

    float len = distance(p1, p0);
    vec2 pLocal = vec2(dot(p-p0, tangent), dot(p-p0, normal));

    float d0 = distance(p, p0);
    float d1 = distance(p, p1);

    // Remove corners
    if(pLocal.x < 0.0 && d0 > r) discard;
    if(pLocal.x > len && d1 > r) discard;

    outColor = vec4(color, 1.0);
}