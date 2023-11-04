precision mediump float;
precision mediump int;

out vec4 outColor;

const float interval = 0.2;
uniform mediump sampler2D footprint;

in vec2 p;
in float rp; // The interpolated radius value

flat in vec2 p0;
flat in vec2 p1;
flat in float l0;
flat in float l1;

void main() {
    vec2 tangent = normalize(p1 - p0);
    vec2 normal = vec2(-tangent.y, tangent.x);
    float len = distance(p1, p0);

    vec2 pLocal = vec2(dot(p-p0, tangent), dot(p-p0, normal));
    float d0 = distance(p, p0);
    float d1 = distance(p, p1);

    // Each stamp is a square, so we don't have to discard the corners.
//    if(pLocal.x < 0.0 && d0 > rp) discard;
//    if(pLocal.x > 0.0 && d1 > rp) discard;

    // Obviously, we are rendering a stroke with variable width, but we just assume it's a uni-width stroke with radius value `rp`.
    // The two furthest points, x1 and x2, can touch the current pixel is much easier to compute.
    // We don't need to solve the quadratic equation for each pixel, which is the main source of the performance benefit.
    float x1 = pLocal.x - rp;
    float x2 = pLocal.x + rp;

    float index0 = l0/interval;
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

    int MAX_i = 128; float currIndex = startIndex;
    float A = 0.0;
    for(int i = 0; i < MAX_i; i++){

        currIndex += 1.0;
        if(currIndex > endIndex) break;
    }
    outColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
}