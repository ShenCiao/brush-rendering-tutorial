precision mediump float;
precision mediump int;

const float alphaDensity = 2.0;

out vec4 outColor;

in vec2 p;

flat in vec2 p0;
flat in vec2 p1;
flat in float r0;
flat in float r1;

void main() {
    vec2 tangent = normalize(p1 - p0);
    vec2 normal = vec2(-tangent.y, tangent.x);
    float len = distance(p1, p0);

    vec2 pLocal = vec2(dot(p-p0, tangent), dot(p-p0, normal));
    float d0 = distance(p, p0);
    float d1 = distance(p, p1);
    float d0cos = pLocal.x / d0;
    float d1cos = (pLocal.x - len) / d1;
    float cosTheta = (r0 - r1)/len;

    if(d0cos < cosTheta && d0 > r0) discard;
    if(d1cos > cosTheta && d1 > r1) discard;

    // The quadratic equation
    float a, b, c, delta;
    a = 1.0 - pow(cosTheta, 2.0);
    b = 2.0 * (r0 * cosTheta - pLocal.x);
    c = pow(pLocal.x, 2.0) + pow(pLocal.y, 2.0) - pow(r0, 2.0);
    delta = pow(b, 2.0) - 4.0*a*c;
    if(delta <= 0.0) discard;

    float tempMathBlock = b + sign(b) * sqrt(delta);
    float x1 = -2.0 * c / tempMathBlock;
    float x2 = -tempMathBlock / (2.0*a);
    vec2 temp = vec2(min(x1, x2), max(x1, x2));
    x1 = temp.x;
    x2 = temp.y;

    // -------------------------------------------
    float rangeLength = min(len, x2) - max(x1, 0.0);// The L_r value.
    float A = 1.0 - exp(-rangeLength*alphaDensity);
    outColor = vec4(0.0, 0.0, 0.0, A);

    return;
}
