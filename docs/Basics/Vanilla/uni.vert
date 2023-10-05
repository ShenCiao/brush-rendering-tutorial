precision mediump float;
precision mediump int;

// Take golbal const values like the `radius` here as uniforms. You can modify them freely.
const float radius = 1.0/2.0;

uniform mat4 modelViewMatrix;
// The `projectionMatrix` is a orthogonal projection matrix here, which is the default setting when rendering 2D stuff.
uniform mat4 projectionMatrix;

// The position of polyline vertices v_i and v_{i+1}
in vec2 position0;
in vec2 position1;

// Output values to the fragment shader, `p` will be the current world position of a pixel. The others are shown in the diagram.
// If you don't know about the `flat` qualifier here, you should jump right into the description below and come back later.
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

    /* Each instance is a rectangle, whose vertices' positions are determined here.
    * The built-in variable `gl_VertexID` records the vertex index, whose value is one of the {0, 1, 2, 3}
    * We use `gl_VertexID` to index values we need for.
    * Here, 0 is the vertex on the lowerleft corner, 1 upperleft, 2 upperright, 3 lowerright
    */
    vec2 position = vec2[](p0, p0, p1, p1)[gl_VertexID];
    vec2 offsetSign = vec2[](
        vec2(-1.0, -1.0),
        vec2(-1.0, 1.0),
        vec2(1.0, 1.0),
        vec2(1.0, -1.0)
    )[gl_VertexID];

    vec2 vertexPosition = position +
        offsetSign.x * r * tangent +
        offsetSign.y * r * normal;

    // Output positions are interpolated by the graphics pipeline to give us the world poisition of a pixel in fragement shader.
    p = vertexPosition;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 0.0, 1.0);
}