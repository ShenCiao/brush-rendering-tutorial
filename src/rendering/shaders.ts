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

export const fillShader = /* wgsl */ `
struct View { size:vec2f, center:vec2f, scale:f32, documentWidth:f32, documentHeight:f32, padding:f32 }
@group(0) @binding(0) var<uniform> view:View;
struct Vertex { @builtin(position) position:vec4f, @location(0) color:vec4f }
@vertex fn vertexMain(@location(0) position:vec2f,@location(1) color:vec4f)->Vertex {
 let p=(position-view.center)*view.scale;
 var out:Vertex; out.position=vec4f(p.x*2.0/view.size.x,-p.y*2.0/view.size.y,0,1); out.color=color; return out;
}
@fragment fn fragmentMain(in:Vertex)->@location(0) vec4f {
 let world=(in.position.xy-view.size*0.5)/view.scale+view.center;
 if(abs(world.x)>view.documentWidth*0.5 || abs(world.y)>view.documentHeight*0.5){discard;}
 return vec4f(in.color.rgb*in.color.a,in.color.a);
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
