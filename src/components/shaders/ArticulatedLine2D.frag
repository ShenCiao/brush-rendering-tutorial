precision mediump float;
precision mediump int;

in vec2 p;
flat in vec2 p0;
flat in float r0;
flat in float l0;
flat in vec2 p1;
flat in float r1;
flat in float l1;

out vec4 outColor;

void main() {
    vec2 tangent = normalize(p1 - p0);
    vec2 normal = vec2(-tangent.y, tangent.x);

    // The local coordinate orgin at p0, x axis along the tangent direction.
    float len = distance(p1, p0);
    vec2 pLocal = vec2(dot(p-p0, tangent), dot(p-p0, normal));
    vec2 p0Local = vec2(0, 0);
    vec2 p1Local = vec2(len, 0);

    float cosTheta = (r0 - r1)/len;
    float d0 = distance(p, p0);
    float d0cos = pLocal.x / d0;
    float d1 = distance(p, p1);
    float d1cos = (pLocal.x - len) / d1;

    // Remove corners
    if(d0cos < cosTheta && d0 > r0) discard;
    if(d1cos > cosTheta && d1 > r1) discard;

    outColor = vec4(0.0, 0.0, 0.0, 0.5);
}
