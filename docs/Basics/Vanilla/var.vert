precision mediump float;
precision mediump int;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

// Radius values are given by geometry data
in float radius0;
in float radius1;
in vec2 position0;
in vec2 position1;

out vec2 p;
flat out vec2 p0;
flat out vec2 p1;
// Output radius
flat out float r0;
flat out float r1;

void main(){
    p0 = position0;
    p1 = position1;
    r0 = radius0;
    r1 = radius1;

    float cosTheta = (r0 - r1)/distance(p0, p1);
    // Coner case: One circle is entirely inside the another, discard the edge.
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

    // Apply the half angle formula from cos(theta) to tan(theta/2)
    float tanHalfTheta = sqrt((1.0+cosTheta) / (1.0-cosTheta));
    float cotHalfTheta = 1.0 / tanHalfTheta;
    float normalTanValue = vec4(tanHalfTheta, tanHalfTheta, cotHalfTheta, cotHalfTheta)[gl_VertexID];
    // Corner case: one circle very near and small to another, discard the edge
    if(normalTanValue > 10.0 || normalTanValue < 0.1) return;

    vec2 trapzoidVertexPosition = position +
        offsetSign.x * radius * tangent +
        offsetSign.y * radius * normal * normalTanValue;
    p = trapzoidVertexPosition;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 0.0, 1.0);
}