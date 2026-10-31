// Brush equations follow Ciallo/Rendering/Stroke.gdshader (Gaussian Airbrush model).
export const strokeShader = /* wgsl */ `
struct View { size: vec2f, center: vec2f, scale: f32, documentWidth: f32, documentHeight: f32, padding: f32 }
struct Segment { start: vec2f, end: vec2f, radii: vec2f, pressure: vec2f, brush: u32, p0: u32, p1: u32, p2: u32 }
struct Brush { color: vec4f, density: f32, pressureFlow: u32, erase: u32, p0: u32 }
@group(0) @binding(0) var<uniform> view: View;
@group(0) @binding(1) var<storage, read> segments: array<Segment>;
@group(0) @binding(2) var<storage, read> brushes: array<Brush>;
@group(0) @binding(3) var<storage, read> curves: array<f32>;
struct Vertex { @builtin(position) position: vec4f, @location(0) @interpolate(flat) segment: u32 }
@vertex fn vertexMain(@builtin(vertex_index) vertex: u32, @builtin(instance_index) instance: u32) -> Vertex {
  let s = segments[instance];
  let r = max(s.radii, vec2f(1e-7));
  let length = distance(s.start, s.end);
  let tangent = (s.end - s.start) / length;
  let normal = vec2f(-tangent.y, tangent.x);
  let c = (r.x-r.y) / length;
  let ratio = sqrt((1.0+c)/(1.0-c));
  let corners = array<vec2f, 6>(vec2f(-1,-1),vec2f(-1,1),vec2f(1,-1),vec2f(1,-1),vec2f(-1,1),vec2f(1,1));
  let corner = corners[vertex];
  let start = corner.x < 0.0;
  let extent = select(1.0 / ratio, ratio, start);
  let radius = select(r.y,r.x,start) + 2.0/view.scale;
  var relative = select(s.end,s.start,start)-view.center + corner.x*radius*tangent + corner.y*radius*normal*extent;
  if (extent > 10.0 || extent < 0.1 || max(r.x,r.y)*2.0*view.scale < 0.01) { relative = vec2f(1e12); }
  let pixel = relative*view.scale;
  var out: Vertex;
  out.position = vec4f(pixel.x*2.0/view.size.x, -pixel.y*2.0/view.size.y, 0, 1);
  out.segment = instance;
  return out;
}
fn normalCDF(x:f32)->f32 {
 let t = 1.0/(1.0+0.2316419*abs(x));
 let tail=0.3989422804*exp(-0.5*x*x)*t*(0.319381530+t*(-0.356563782+t*(1.781477937+t*(-1.821255978+t*1.330274429))));
 return select(tail,1.0-tail,x>=0.0);
}
const tail=0.0004290603;
const mass=1.0-2.0*tail;
fn cdf(z:f32,u:f32)->f32 {
 if(z<=-2.0*u){return 0.0;} if(z>=2.0*u){return 1.0;}
 return clamp((normalCDF(z/(0.6*u))-tail)/mass,0.0,1.0);
}
fn integral(z:f32,u:f32)->f32 {
 if(z<=-2.0*u){return 0.0;} if(z>=2.0*u){return z;}
 let sigma=0.6*u; let x=z/sigma;
 return (z*(normalCDF(x)-tail)+sigma*(0.3989422804*exp(-0.5*x*x)-0.001542278996))/mass;
}
fn quantile(w:f32,u:f32)->f32 {
 let e=2.0*(tail+mass*w)-1.0; let l=log(1.0-e*e); let a=2.0/(3.14159265359*0.147)+0.5*l;
 return sqrt(2.0)*0.6*u*sign(e)*sqrt((-l/0.147)/(sqrt(a*a-l/0.147)+a));
}
fn curve(brush:u32, which:u32, t:f32)->f32 {
 let x=clamp(t*512.0-0.5,0.0,511.0); let i=u32(x); let offset=brush*1024u+which*512u;
 return mix(curves[offset+i],curves[offset+min(i+1u,511u)],fract(x));
}
@fragment fn fragmentMain(in:Vertex)->@location(0) vec4f {
 let s=segments[in.segment]; let b=brushes[s.brush]; let r=max(s.radii,vec2f(1e-7));
 let length=distance(s.start,s.end); let tangent=(s.end-s.start)/length; let normal=vec2f(-tangent.y,tangent.x);
 let world=(in.position.xy-view.size*0.5)/view.scale+view.center;
 if(abs(world.x)>view.documentWidth*0.5 || abs(world.y)>view.documentHeight*0.5){discard;}
 let delta=(in.position.xy-view.size*0.5)/view.scale-(s.start-view.center); let p=vec2f(dot(delta,tangent),dot(delta,normal));
 let c=(r.x-r.y)/length; let a=1.0-c*c; let sinTheta=sqrt(a); let u=1.0/view.scale;
 let radius=max(r.x-c*p.x,1e-7); let halfWidth=radius/sinTheta;
 let begin=cdf(-halfWidth-p.y,u); let end=cdf(halfWidth-p.y,u); let weight=end-begin;
 if(weight<=0.0){discard;}
 let y=clamp(p.y+quantile(0.5*(begin+end),u),-halfWidth,halfWidth);
 let extent=sqrt(max(radius*radius-a*y*y,0.0))/a;
 let midpoint=p.x-c*radius/a; let left=midpoint-extent; let right=midpoint+extent;
 if(right<=-2.0*u || left>=length+2.0*u){discard;}
 let fullLength=2.0*extent;
 let before=integral(-left,u)-integral(-right,u);
 let after=integral(right-length,u)-integral(left-length,u);
 let fraction=clamp((fullLength-before-after)/max(fullLength,1e-7),0.0,1.0);
 var fullN=fullLength/radius;
 if(abs(c)>=1e-3){
   let leftR=radius-c*(-c*radius/a-extent); let rightR=radius-c*(-c*radius/a+extent);
   fullN=log(leftR/rightR)/c;
 }
 var flow=b.color.a;
 if(b.pressureFlow!=0u){flow*=curve(s.brush,0u,clamp(mix(s.pressure.x,s.pressure.y,clamp(p.x,0.0,length)/length),0.0,1.0));}
 let depth=fullN*b.density*flow*curve(s.brush,1u,abs(y)/halfWidth);
 var keep=exp(-depth*fraction);
 if(weight<1.0){keep=pow(mix(1.0,exp(-depth),weight),fraction);}
 let alpha=1.0-keep;
 return vec4f(b.color.rgb*alpha,alpha);
}
`;

// Matches Ciallo/Rendering/PolygonFillAA.gdshaderinc: bounded screen-space
// expansion, triangle/pixel intersection area, and exponential source-over alpha.
export const fillShader = /* wgsl */ `
struct View { size:vec2f, center:vec2f, scale:f32, documentWidth:f32, documentHeight:f32, padding:f32 }
struct PolygonAA { enabled:u32, epsilon:f32, maxVertexOffsetPixels:f32, padding:f32 }
@group(0) @binding(0) var<uniform> view:View;
@group(0) @binding(4) var<uniform> aa:PolygonAA;
struct Vertex {
 @builtin(position) position:vec4f,
 @location(0) @interpolate(flat) color:vec4f,
 @location(1) @interpolate(flat) a:vec2f,
 @location(2) @interpolate(flat) b:vec2f,
 @location(3) @interpolate(flat) c:vec2f,
}
fn cross2(a:vec2f,b:vec2f)->f32 { return a.x*b.y-a.y*b.x; }
fn vertexOffset(previous:vec2f,current:vec2f,next:vec2f,winding:f32)->vec2f {
 let incoming=current-previous;
 let outgoing=next-current;
 let incomingLength=length(incoming);
 let outgoingLength=length(outgoing);
 if(incomingLength==0.0 || outgoingLength==0.0 || winding==0.0){return vec2f(0);}
 let n0=winding*vec2f(incoming.y,-incoming.x)/incomingLength;
 let n1=winding*vec2f(outgoing.y,-outgoing.x)/outgoingLength;
 // Half-pixel square support, including Ciallo's rasterizer rounding allowance.
 let h0=0.501*(abs(n0.x)+abs(n0.y));
 let h1=0.501*(abs(n1.x)+abs(n1.y));
 let numerator=vec2f(h0*n1.y-h1*n0.y,n0.x*h1-n1.x*h0)*winding;
 let numeratorLength=length(numerator);
 if(numeratorLength==0.0 || aa.maxVertexOffsetPixels<=0.0){return vec2f(0);}
 let denominator=max(abs(cross2(n0,n1)),numeratorLength/aa.maxVertexOffsetPixels);
 return numerator/denominator;
}
@vertex fn vertexMain(
 @builtin(vertex_index) corner:u32,
 @location(0) a:vec2f,@location(1) b:vec2f,@location(2) c:vec2f,
 @location(3) color:vec4f,
)->Vertex {
 let triangle=array<vec2f,3>(
   (a-view.center)*view.scale+view.size*0.5,
   (b-view.center)*view.scale+view.size*0.5,
   (c-view.center)*view.scale+view.size*0.5);
 var pixel=triangle[corner];
 if(aa.enabled!=0u && view.scale!=0.0){
   let winding=sign(cross2(triangle[1]-triangle[0],triangle[2]-triangle[0]));
   pixel+=vertexOffset(triangle[(corner+2u)%3u],pixel,triangle[(corner+1u)%3u],winding);
 }
 var out:Vertex;
 out.position=vec4f(pixel.x*2.0/view.size.x-1.0,1.0-pixel.y*2.0/view.size.y,0,1);
 out.color=color;out.a=triangle[0];out.b=triangle[1];out.c=triangle[2];
 return out;
}
fn coverage(in:Vertex)->f32 {
 let triangle=array<vec2f,3>(in.a-in.position.xy,in.b-in.position.xy,in.c-in.position.xy);
 let winding=sign(cross2(triangle[1]-triangle[0],triangle[2]-triangle[0]));
 if(winding==0.0){return 0.0;}
 var normals:array<vec2f,3>;
 var distances:array<f32,3>;
 var fullyInside=true;
 for(var edge=0u;edge<3u;edge++){
   let delta=triangle[(edge+1u)%3u]-triangle[edge];
   let normal=winding*vec2f(-delta.y,delta.x);
   let distance=-dot(normal,triangle[edge]);
   let radius=0.5*(abs(normal.x)+abs(normal.y));
   if(distance+radius<=0.0){return 0.0;}
   fullyInside=fullyInside && distance>=radius;
   normals[edge]=normal;distances[edge]=distance;
 }
 if(fullyInside){return 1.0;}
 // Clip the unit pixel against the triangle. The intersection has <= 7 vertices.
 var polygon:array<vec2f,8>;
 var clipped:array<vec2f,8>;
 polygon[0]=vec2f(-0.5,-0.5);polygon[1]=vec2f(0.5,-0.5);
 polygon[2]=vec2f(0.5,0.5);polygon[3]=vec2f(-0.5,0.5);
 var count=4u;
 for(var edge=0u;edge<3u;edge++){
   var outputCount=0u;
   var previous=polygon[count-1u];
   var previousDistance=dot(normals[edge],previous)+distances[edge];
   for(var i=0u;i<count;i++){
     let current=polygon[i];
     let distance=dot(normals[edge],current)+distances[edge];
     // Strict crossings avoid duplicating vertices on the clipping plane.
     if((distance>0.0 && previousDistance<0.0) || (distance<0.0 && previousDistance>0.0)){
       let t=previousDistance/(previousDistance-distance);
       clipped[outputCount]=mix(previous,current,t);outputCount++;
     }
     if(distance>=0.0){clipped[outputCount]=current;outputCount++;}
     previous=current;previousDistance=distance;
   }
   if(outputCount<3u){return 0.0;}
   count=outputCount;
   for(var i=0u;i<count;i++){polygon[i]=clipped[i];}
 }
 var twiceArea=0.0;
 var previous=polygon[count-1u];
 for(var i=0u;i<count;i++){
   twiceArea+=cross2(previous,polygon[i]);previous=polygon[i];
 }
 return clamp(abs(twiceArea)*0.5,0.0,1.0);
}
fn fillAlpha(in:Vertex)->f32 {
 if(aa.enabled==0u){return in.color.a;}
 let depth=-log2(max(1.0-clamp(in.color.a,0.0,1.0),aa.epsilon));
 let x=coverage(in)*depth;
 // Preserve very small contributions from subpixel triangles.
 if(x<0.001){
   let y=x*0.69314718056;
   return y*(1.0-0.5*y+y*y/6.0);
 }
 return 1.0-exp2(-x);
}
@fragment fn fragmentMain(in:Vertex)->@location(0) vec4f {
 let world=(in.position.xy-view.size*0.5)/view.scale+view.center;
 if(abs(world.x)>view.documentWidth*0.5 || abs(world.y)>view.documentHeight*0.5){discard;}
 let alpha=fillAlpha(in);
 return vec4f(in.color.rgb*alpha,alpha);
}
`;

export const compositeShader = /* wgsl */ `
struct Params { opacity:f32, mode:u32, clipped:u32, unused:u32 }
@group(0) @binding(0) var source:texture_2d<f32>;
@group(0) @binding(1) var destination:texture_2d<f32>;
@group(0) @binding(2) var<uniform> params:Params;
@vertex fn vertexMain(@builtin(vertex_index) i:u32)->@builtin(position) vec4f {
 let p=array<vec2f,3>(vec2f(-1,-1),vec2f(3,-1),vec2f(-1,3)); return vec4f(p[i],0,1);
}
@fragment fn fragmentMain(@builtin(position) pixel:vec4f)->@location(0) vec4f {
 let p=vec2i(pixel.xy); let s=textureLoad(source,p,0)*params.opacity; let d=textureLoad(destination,p,0);
 var rgb:vec3f; var alpha=s.a+d.a*(1.0-s.a);
 if(params.clipped!=0u){
   alpha=d.a;
   if(params.mode==2u){rgb=d.rgb*(s.rgb+vec3f(1.0-s.a));}
   else if(params.mode==1u){rgb=d.rgb+s.rgb*d.a;}
   else {rgb=s.rgb*d.a+d.rgb*(1.0-s.a);}
 } else {
   if(params.mode==2u){rgb=s.rgb*(1.0-d.a)+d.rgb*(s.rgb+vec3f(1.0-s.a));}
   else if(params.mode==1u){rgb=s.rgb+d.rgb;}
   else {rgb=s.rgb+d.rgb*(1.0-s.a);}
 }
 return vec4f(rgb,alpha);
}
`;

export const presentShader = /* wgsl */ `
@group(0) @binding(0) var image:texture_2d<f32>;
@vertex fn vertexMain(@builtin(vertex_index) i:u32)->@builtin(position) vec4f {
 let p=array<vec2f,3>(vec2f(-1,-1),vec2f(3,-1),vec2f(-1,3)); return vec4f(p[i],0,1);
}
fn srgb(c:vec3f)->vec3f {
 let v=clamp(c,vec3f(0),vec3f(1));
 return select(1.055*pow(v,vec3f(1.0/2.4))-0.055,12.92*v,v<=vec3f(0.0031308));
}
@fragment fn fragmentMain(@builtin(position) pixel:vec4f)->@location(0) vec4f {
 let c=textureLoad(image,vec2i(pixel.xy),0);
 return vec4f(srgb(c.rgb/max(c.a,1e-8))*c.a,c.a);
}
`;

export const bitmapShader = /* wgsl */ `
struct View { size:vec2f, center:vec2f, scale:f32, documentWidth:f32, documentHeight:f32, padding:f32 }
struct Options { difference:u32, grid:u32, gain:f32, padding:f32 }
@group(0) @binding(0) var bitmap:texture_2d<f32>;
@group(0) @binding(1) var bitmapSampler:sampler;
@group(0) @binding(2) var<uniform> view:View;
@group(0) @binding(3) var<uniform> options:Options;
@group(0) @binding(4) var vectorImage:texture_2d<f32>;
@vertex fn vertexMain(@builtin(vertex_index) i:u32)->@builtin(position) vec4f {
 let p=array<vec2f,3>(vec2f(-1,-1),vec2f(3,-1),vec2f(-1,3)); return vec4f(p[i],0,1);
}
fn srgb(c:vec3f)->vec3f {
 let v=clamp(c,vec3f(0),vec3f(1));
 return select(1.055*pow(v,vec3f(1.0/2.4))-0.055,12.92*v,v<=vec3f(0.0031308));
}
@fragment fn fragmentMain(@builtin(position) pixel:vec4f)->@location(0) vec4f {
 let world=(pixel.xy-view.size*0.5)/view.scale+view.center;
 let size=vec2f(view.documentWidth,view.documentHeight);
 let uv=world/size+vec2f(0.5);
 let inside=all(uv>=vec2f(0)) && all(uv<=vec2f(1));
 var color=textureSampleLevel(bitmap,bitmapSampler,uv,0.0);
 if(!inside){color=vec4f(0);}
 if(options.difference!=0u){
   let raw=textureLoad(vectorImage,vec2i(pixel.xy),0);
   let live=vec4f(srgb(raw.rgb/max(raw.a,1e-8))*raw.a,raw.a);
   // Associated-color and alpha difference, independent of the CSS backdrop.
   let difference=max(abs(live.rgb-color.rgb),vec3f(abs(live.a-color.a)));
   return vec4f(clamp(difference*options.gain,vec3f(0),vec3f(1)),1);
 }
 if(options.grid!=0u && inside){
   let dimensions=vec2f(textureDimensions(bitmap));
   let pixelSize=size/dimensions*view.scale;
   if(min(pixelSize.x,pixelSize.y)>=6.0){
     let f=fract(uv*dimensions);let edge=min(f,1.0-f)*pixelSize;
     let line=1.0-smoothstep(0.0,0.8,min(edge.x,edge.y));
     color=mix(color,vec4f(0.12,0.3,0.45,1),line*0.65);
   }
 }
 return color;
}
`;
