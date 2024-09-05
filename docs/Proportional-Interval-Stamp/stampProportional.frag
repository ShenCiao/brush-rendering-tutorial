precision mediump float;
precision mediump int;

out vec4 outColor;

uniform float intervalRatio; // The eta value, passed from the file geometry.js
uniform highp sampler2D footprint;

in vec2 p;

flat in vec2 p0;
flat in vec2 p1;
flat in float r0;
flat in float r1;
flat in float n0;
flat in float n1;

void main() {
    // Exact same code
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

    // --------------New code starts here------------------
    // Because glsl doesn't support lambda functions nor defining a new function inside a function, we have to use macros here.
    // Formula (1):
    #define X2N(x) -1.0/cosTheta/intervalRatio * log(1.0 - cosTheta*(x)/r0)
    // Formula (2):
    #define N2X(n) r0/cosTheta * (1.0-exp(-intervalRatio*cosTheta*(n)))

    // Hopefully these code are familiar to you. I intentionally minize the code changed.
    float index0 = n0; // The stamp index of vertex0.
    float startIndex, endIndex; // The stamp index's begin and end values
    float x1Index = X2N(x1) + index0; // The stamp index at x1.
    startIndex = x1 < 0.0 ? ceil(index0):ceil(x1Index); // If x1 is less than zero, start the loop from vertex0.
    float index1 = n1;
    float x2Index = X2N(x2) + index0;
    endIndex = x2 > len ? index1 : x2Index; // if x2 is larger than L, end the loop at vertex1.
    if(startIndex > endIndex) discard;

    // The loop
    int MAX_i = 128; float currIndex = startIndex;
    vec4 currColor = vec4(0.0,0.0,0.0,1e-10);
    for(int i = 0; i < MAX_i; i++){
        float currStampLocalX = N2X(currIndex - index0);
    // -------------New code ends here------------------
        float currStampRadius = r0 - cosTheta * currStampLocalX;
        vec2 pToCurrStamp = pLocal - vec2(currStampLocalX, 0.0);
        vec2 textureCoordinate = (pToCurrStamp/currStampRadius + 1.0)/2.0; // uv coordinate
        vec4 sampledColor = texture(footprint, textureCoordinate);

        vec4 color;
        color.a = sampledColor.a + currColor.a * (1.0 - sampledColor.a);
        color.rgb = (sampledColor.rgb * sampledColor.a + currColor.rgb * currColor.a * (1.0 - sampledColor.a))/color.a;

        currColor = color;
        currIndex += 1.0;
        if(currIndex > endIndex) break;
    }
    outColor = currColor;
    return;
}
