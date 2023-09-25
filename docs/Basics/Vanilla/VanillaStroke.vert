precision mediump float;
precision mediump int;

// Take golbal const values as uniforms to modify freely.
const float radius = 1.0/2.0;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix; // orthogonal projection

in vec2 position0;
in vec2 position1;

out vec2 p;
flat out vec2 p0;
flat out vec2 p1;
flat out float r;

void main(){
    p0 = position0;
    p1 = position1;
    r = radius;

    vec2 tangent = normalize(p1 - p0);
    vec2 normal = vec2(-tangent.y, tangent.x);

    vec2 offsetSign = vec2[](
        vec2(-1.0, -1.0),
        vec2(-1.0, 1.0),
        vec2(1.0, 1.0),
        vec2(1.0, -1.0)
    )[gl_VertexID];
    vec2 position = vec2[](p0, p0, p1, p1)[gl_VertexID];
    vec2 vertexPosition = position +
        offsetSign.x * r * tangent +
        offsetSign.y * r * normal;

    p = vertexPosition;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 0.0, 1.0);
}