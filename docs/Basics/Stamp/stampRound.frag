precision mediump float;
precision mediump int;

out vec4 outColor;

const float interval = 0.2;
uniform mediump sampler2D footprint;

in vec2 p;

flat in vec2 p0;
flat in vec2 p1;
flat in float r0;
flat in float r1;
flat in float l0;
flat in float l1;

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

    // Remove corners
    if(d0cos < cosTheta && d0 > r0) discard;
    if(d1cos > cosTheta && d1 > r1) discard;
    // -------------------------------------------
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

    // With the distance to the polyline's first vertex, we can compute a "stamp index" value.
    float index0 = l0/interval; // The stamp index of vertex0.
    float startIndex, endIndex;
    if (x1 <= 0.0){
        startIndex = ceil(index0);
    }
    else{
        startIndex = ceil(index0 + x1/interval);
    }
    float index1 = l1/interval;
    float backIndex = x2/interval + index0;
    endIndex = index1 < backIndex ? index1 : backIndex;
    if(startIndex > endIndex) discard;

    // The main loop to sample and blend color from the footprint.
    int MAX_i = 128; float currIndex = startIndex;
    float A = 0.0;
    for(int i = 0; i < MAX_i; i++){

        currIndex += 1.0;
        if(currIndex > endIndex) break;
    }
    outColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
}