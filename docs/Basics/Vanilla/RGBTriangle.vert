precision mediump float;
precision mediump int;

const float radius = 1.0/10.0;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

in vec2 position0;
in vec2 position1;
in vec3 color0;
in vec3 color1;

out vec2 p;
flat out vec2 p0;
flat out vec2 p1;
flat out float r;
out vec3 color;

void main(){
    p0 = position0;
    p1 = position1;
    r = radius;

    vec2 tangent = normalize(p1 - p0);
    vec2 normal = vec2(-tangent.y, tangent.x);

    color = vec3[](color0, color0, color1, color1)[gl_VertexID];
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