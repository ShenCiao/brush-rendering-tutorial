precision mediump float;
precision mediump int;

out vec4 outColor;

const float interval = 0.2;
uniform highp sampler2D footprint; // The stamp texture, linear filter

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

    // Solve the quadratic equation
    // Need to learn how to solve a quadratic equation? Check this talk by Cem Yuksel:
    // https://www.youtube.com/watch?v=ok0EZ0fBCMA
    float tempMathBlock = b + sign(b) * sqrt(delta);
    float x1 = -2.0 * c / tempMathBlock;
    float x2 = -tempMathBlock / (2.0*a);
    vec2 temp = vec2(min(x1, x2), max(x1, x2));
    x1 = temp.x;
    x2 = temp.y;

    // With the distance to the polyline's first vertex, we can compute a "stamp index" value.
    // which indicate the number of stamp from the first vertex to current point.
    float index0 = l0/interval; // The stamp index at vertex0.
    float startIndex, endIndex; // The stamp index's begin and end values
    float x1Index = index0 + x1/interval; // The stamp index at x1.
    startIndex = x1 < 0.0 ? ceil(index0):ceil(x1Index); // if x1 is less than zero, start the loop from vertex0.
    float index1 = l1/interval;
    float x2Index = x2/interval + index0;
    endIndex = x2 > len ? index1 : x2Index; // if x2 is larger than L, end the loop at vertex1.
    if(startIndex > endIndex) discard;

    // The main loop to sample and blend color from the footprint, from `startIndex` to `endIndex`
    int MAX_i = 128; float currIndex = startIndex; // set `MAX_i` to avoid infinite loop
    vec4 currColor = vec4(0.0,0.0,0.0,1e-10);    // set alpha as 1e-10 to avoid numerical error
    for(int i = 0; i < MAX_i; i++){
        float currStampLocalX = interval * (currIndex - index0);
        float currStampRadius = r0 - cosTheta * currStampLocalX;
        vec2 pToCurrStamp = pLocal - vec2(currStampLocalX, 0.0);
        vec2 textureCoordinate = (pToCurrStamp/currStampRadius + 1.0)/2.0; // uv coordinate
        vec4 sampledColor = texture(footprint, textureCoordinate);

        // The alpha compositing function, wiki: https://en.wikipedia.org/wiki/Alpha_compositing
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
