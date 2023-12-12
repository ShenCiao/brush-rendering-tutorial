precision mediump float;
precision mediump int;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

// Every lines of code are the same, except for the length.
// `length` is the distance from the current vertex to the very first vertex of the polyline
// (the result of prefix sum on edge length).
in float length0;
in float length1;
in float radius0;
in float radius1;
in vec2 position0;
in vec2 position1;

out vec2 p;
flat out vec2 p0;
flat out vec2 p1;
flat out float r0;
flat out float r1;
flat out float l0;
flat out float l1;

void main(){
    p0 = position0;
    p1 = position1;
    r0 = radius0;
    r1 = radius1;
    // Pass the length values to fragment shader.
    l0 = length0;
    l1 = length1;

    float cosTheta = (r0 - r1)/distance(p0, p1);
    if(abs(cosTheta) >= 1.0) return;

    vec2 tangent = normalize(p1 - p0);
    vec2 normal = vec2(-tangent.y, tangent.x);

    vec2 offsetSign = vec2[](
        vec2(-1.0,-1.0),
        vec2(-1.0, 1.0),
        vec2( 1.0, 1.0),
        vec2( 1.0,-1.0)
    )[gl_VertexID];
    vec2 position = vec2[](position0, position0, position1, position1)[gl_VertexID];
    float radius = vec4(radius0, radius0, radius1, radius1)[gl_VertexID];

    float tanHalfTheta = sqrt((1.0+cosTheta) / (1.0-cosTheta));
    float cotHalfTheta = 1.0 / tanHalfTheta;
    float normalTanValue = vec4(tanHalfTheta, tanHalfTheta, cotHalfTheta, cotHalfTheta)[gl_VertexID];
    if(normalTanValue > 10.0 || normalTanValue < 0.1) return;

    vec2 trapzoidVertexPosition = position +
    offsetSign.x * radius * tangent +
    offsetSign.y * radius * normal * normalTanValue;
    p = trapzoidVertexPosition;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 0.0, 1.0);
}