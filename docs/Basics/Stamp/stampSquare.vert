precision mediump float;
precision mediump int;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

in float length0;
in float length1;
in float radius0;
in float radius1;
in vec2 position0;
in vec2 position1;

out vec2 p;
out float rp; // The interpolated radius value
flat out vec2 p0;
flat out vec2 p1;
flat out float l0;
flat out float l1;


void main(){
    p0 = position0;
    p1 = position1;
    l0 = length0;
    l1 = length1;
    // Put r0 into left two vertices, r1 into right two vertices.
    rp = vec4(radius0, radius0, radius1, radius1)[gl_VertexID];

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

    // Place four vertices as the figure shows.
    // We don't have to calculate trigonometric values of theta, so many lines of code are saved.
    vec2 trapzoidVertexPosition = position +
        offsetSign.x * radius * tangent +
        offsetSign.y * radius * normal;
    p = trapzoidVertexPosition;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 0.0, 1.0);
}