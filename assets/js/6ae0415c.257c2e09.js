"use strict";(self.webpackChunkbrush_stroke_tutorial=self.webpackChunkbrush_stroke_tutorial||[]).push([[613],{5663:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>c,contentTitle:()=>l,default:()=>p,frontMatter:()=>i,metadata:()=>s,toc:()=>d});var a=t(5893),r=t(1151),o=t(5632);const i={title:"Table of Contents",hide_title:!0,sidebar_position:1,slug:"/"},l=void 0,s={id:"toc",title:"Table of Contents",description:"eye-catcher",source:"@site/docs/toc.mdx",sourceDirName:".",slug:"/",permalink:"/brush-rendering-tutorial/",draft:!1,unlisted:!1,editUrl:"https://github.com/ShenCiao/brush-rendering-tutorial/tree/main/docs/toc.mdx",tags:[],version:"current",sidebarPosition:1,frontMatter:{title:"Table of Contents",hide_title:!0,sidebar_position:1,slug:"/"},sidebar:"tutorialSidebar",next:{title:"Introduction",permalink:"/brush-rendering-tutorial/Introduction/"}},c={},d=[{value:"Table of Contents",id:"table-of-contents",level:2}];function u(e){const n={a:"a",h2:"h2",img:"img",li:"li",p:"p",strong:"strong",ul:"ul",...(0,r.a)(),...e.components},{Details:i}=n;return i||function(e,n){throw new Error("Expected "+(n?"component":"object")+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}("Details",!0),(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(n.p,{children:(0,a.jsx)(n.img,{alt:"eye-catcher",src:t(3014).Z+"",width:"3840",height:"1441"})}),"\n",(0,a.jsxs)(n.p,{children:["This tutorial series will teach you how to render brush strokes with the modern GPU graphics pipeline.\nIf you like this series, please star the ",(0,a.jsx)(n.a,{href:"https://github.com/ShenCiao/brush-rendering-tutorial",children:"code repository"})," instead of bookmark this website since the domain might be changed."]}),"\n",(0,a.jsx)(n.h2,{id:"table-of-contents",children:"Table of Contents"}),"\n",(0,a.jsxs)(n.ul,{children:["\n",(0,a.jsx)(n.li,{children:(0,a.jsx)(n.a,{href:"./Introduction",children:"Introduction"})}),"\n",(0,a.jsxs)(n.li,{children:["Basics","\n",(0,a.jsxs)(n.ul,{children:["\n",(0,a.jsx)(n.li,{children:(0,a.jsx)(n.a,{href:"./Basics/Basics",children:"Problem Statement"})}),"\n",(0,a.jsx)(n.li,{children:(0,a.jsx)(n.a,{href:"./Basics/Vanilla",children:"Vanilla"})}),"\n",(0,a.jsx)(n.li,{children:(0,a.jsx)(n.a,{href:"./Basics/Stamp",children:"Stamp"})}),"\n"]}),"\n"]}),"\n",(0,a.jsx)(n.li,{children:(0,a.jsx)(n.a,{href:"./Airbrush",children:"Airbrush"})}),"\n"]}),"\n",(0,a.jsxs)(i,{children:[(0,a.jsx)("summary",{children:"Future Contents"}),(0,a.jsx)(n.p,{children:(0,a.jsx)(n.strong,{children:'Stamp density and "ratio-distance"'})}),(0,a.jsxs)("div",{className:"row row--no-gutters margin-left--xs",children:[(0,a.jsxs)("div",{className:"col col--6",children:[(0,a.jsx)(o.ij,{uniforms:o.Sw}),(0,a.jsx)("center",{children:(0,a.jsx)("em",{children:" Adjacent dots "})})]}),(0,a.jsxs)("div",{className:"col col--6",children:[(0,a.jsx)(o.ij,{uniforms:o.rL}),(0,a.jsx)("center",{children:(0,a.jsx)("em",{children:" Adjacent with one dot interleaved "})})]})]}),(0,a.jsx)("br",{}),(0,a.jsx)(n.p,{children:"You can see dots are adjacent to each other instead of equidistantly distributed.\nThe pattern is achieved by setting the intervals between dots proportional to their radii.\nYou will learn how to freely control stamp density along a stamp\nstroke. Very important for a serious project."}),(0,a.jsx)(n.p,{children:(0,a.jsx)(n.strong,{children:"3D stroke"})}),(0,a.jsx)(n.p,{children:"Learn how to extend the algorithms to 3D space."}),(0,a.jsx)(n.p,{children:"I'm integrating it into the Blender Grease Pencil:"}),(0,a.jsx)("iframe",{width:"100%",height:"500",src:"https://www.youtube.com/embed/Q7_3IhgHOZM?start=30",title:"Blender Grease Pencil Stamp Brush Demo",allow:"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",allowFullScreen:!0})]})]})}function p(e={}){const{wrapper:n}={...(0,r.a)(),...e.components};return n?(0,a.jsx)(n,{...e,children:(0,a.jsx)(u,{...e})}):u(e)}},5632:(e,n,t)=>{t.d(n,{ij:()=>v,Sw:()=>y,rL:()=>j,PQ:()=>b});var a=t(7294),r=t(9477),o=t(5452),i=t(4866),l=t(5162),s=t(3764),c=t(5034),d=t(9279);const u="precision mediump float;\nprecision mediump int;\n\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\n\nin vec2 position0;\nin float radius0;\nin float summedLength0;\nin vec2 position1;\nin float radius1;\nin float summedLength1;\n\nout vec2 p; // position of the current pixel\nflat out vec2 p0;\nflat out float r0;\nflat out float l0;\nflat out vec2 p1;\nflat out float r1;\nflat out float l1;\n\nvoid main()\t{\n    r0 = radius0;\n    r1 = radius1;\n    p0 = position0;\n    p1 = position1;\n    l0 = summedLength0;\n    l1 = summedLength1;\n\n    vec2 tangent = normalize(position1 - position0);\n    vec2 normal = vec2(-tangent.y, tangent.x);\n    float cosTheta = (r0 - r1)/distance(p0, p1);\n    // the vertex1 with radius is fully inside the vertex0.\n    if(abs(cosTheta) >= 1.0) return;\n\n    // Each instance is a trapzoid, whose vertices' positions are determined here.\n    // Use gl_VertexID {0, 1, 2, 3} to index and get the desired parameters.\n    // Be careful with the backface culling! We are ignoring it here.\n    vec2 offsetSign = vec2[](\n        vec2(-1.0,-1.0),\n        vec2(-1.0, 1.0),\n        vec2( 1.0, 1.0),\n        vec2( 1.0,-1.0)\n    )[gl_VertexID];\n    vec2 position = vec2[](position0, position0, position1, position1)[gl_VertexID];\n    float radius = vec4(radius0, radius0, radius1, radius1)[gl_VertexID];\n\n    float tanHalfTheta = sqrt((1.0+cosTheta) / (1.0-cosTheta));\n    float cotHalfTheta = 1.0 / tanHalfTheta;\n    float normalTanValue = vec4(tanHalfTheta, tanHalfTheta, cotHalfTheta, cotHalfTheta)[gl_VertexID];\n    if(normalTanValue > 10.0 || normalTanValue < 0.1) return;\n\n    vec2 trapzoidVertexPosition = position +\n        offsetSign.x * radius * tangent +\n        offsetSign.y * radius * normal * normalTanValue;\n    p = trapzoidVertexPosition;\n\n    gl_Position = projectionMatrix * modelViewMatrix * vec4(trapzoidVertexPosition, 0.0, 1.0);\n}\n",p="precision mediump float;\nprecision mediump int;\n\nin vec2 p;\nflat in vec2 p0;\nflat in float r0;\nflat in float l0;\nflat in vec2 p1;\nflat in float r1;\nflat in float l1;\n\n// Common\nuniform int type;\nconst int Vanilla = 0, Stamp = 1, Airbrush = 2;\nuniform vec4 color;\n// Stamp\nuniform mediump sampler2D footprint;\nuniform float stampIntervalRatio;\nuniform float noiseFactor;\nuniform float rotationFactor;\nfloat x2n(float x); // from distance to stamp index.\nfloat n2x(float n); // from stamp index to distance.\nmat2 rotate(float angle);\n// Airbrush\nuniform mediump sampler2D gradient;\nfloat sampleGraident(float distance){ return texture(gradient, vec2(distance, 0.0)).r; }\n\n// Noise helper functions from _The Book of Shader_.\nfloat random (in vec2 st);\nfloat noise (in vec2 st);\nfloat fbm (in vec2 st);\n\nout vec4 outColor;\n\nvoid main() {\n    vec2 tangent = normalize(p1 - p0);\n    vec2 normal = vec2(-tangent.y, tangent.x);\n\n    // The local coordinate orgin at p0, x axis along the tangent direct.\n    float len = distance(p1, p0);\n    vec2 pLocal = vec2(dot(p-p0, tangent), dot(p-p0, normal));\n    vec2 p0Local = vec2(0, 0);\n    vec2 p1Local = vec2(len, 0);\n\n    float cosTheta = (r0 - r1)/len;\n    float d0 = distance(p, p0);\n    float d0cos = pLocal.x / d0;\n    float d1 = distance(p, p1);\n    float d1cos = (pLocal.x - len) / d1;\n\n    // Remove corners\n    if(d0cos < cosTheta && d0 > r0) discard;\n    if(d1cos > cosTheta && d1 > r1) discard;\n\n    if(type == Vanilla){\n        if(d0 < r0 && d1 < r1) discard;\n        float A = (d0 < r0 || d1 < r1) ? 1.0 - sqrt(1.0 - color.a) : color.a;\n        outColor = vec4(color.rgb, A);\n        return;\n    }\n\n    if(type == Stamp){\n        // The method here is not published yet, it should be explained in a 10min video.\n        // The footprint is a disk instead of a square.\n        // We set a quadratic polynomial to calculate the effect range, the range on polyline edge footprint can touch the current pixel.\n        // Two roots of the quadratic polynomial are the effectRangeFront and effectRangeBack.\n        // Formulas from SIGGRAPH 2022 Talk - A Fast & Robust Solution for Cubic & Higher-Order Polynomials\n        float a, b, c, delta;\n        a = 1.0 - pow(cosTheta, 2.0);\n        b = 2.0 * (r0 * cosTheta - pLocal.x);\n        c = pow(pLocal.x, 2.0) + pow(pLocal.y, 2.0) - pow(r0, 2.0);\n        delta = pow(b, 2.0) - 4.0*a*c;\n        if(delta <= 0.0) discard; // This should never happen.\n\n        float tempMathBlock = b + sign(b) * sqrt(delta);\n        float x1 = -2.0 * c / tempMathBlock;\n        float x2 = -tempMathBlock / (2.0*a);\n        float effectRangeFront = x1 <= x2 ? x1 : x2;\n        float effectRangeBack = x1 > x2 ? x1 : x2;\n\n        // We stamp on polyline every time the stamp index comes to an integer.\n        float index0 = l0/stampIntervalRatio; // The stamp index of vertex0.\n        float startIndex, endIndex;\n        if (effectRangeFront <= 0.0){\n            startIndex = ceil(index0);\n        }\n        else{\n            startIndex = ceil(index0 + x2n(effectRangeFront));\n        }\n        float index1 = l1/stampIntervalRatio;\n        float backIndex = x2n(effectRangeBack) + index0;\n        endIndex = index1 < backIndex ? index1 : backIndex;\n        if(startIndex > endIndex) discard;\n\n        // The main loop to sample and blend color from the footprint.\n        int MAX_i = 128; float currIndex = startIndex;\n        float A = 0.0;\n        for(int i = 0; i < MAX_i; i++){\n            float currStampLocalX = n2x(currIndex - index0);\n            // Apply roation and sample the footprint.\n            vec2 pToCurrStamp = pLocal - vec2(currStampLocalX, 0.0);\n            float currStampRadius = r0 - cosTheta * currStampLocalX;\n            float angle = rotationFactor*radians(360.0*fract(sin(currIndex)*1.0));\n            pToCurrStamp *= rotate(angle);\n            vec2 textureCoordinate = (pToCurrStamp/currStampRadius + 1.0)/2.0;\n            float opacity = texture(footprint, textureCoordinate).a;\n            // Blend opacity.\n            float opacityNoise = noiseFactor*fbm(textureCoordinate*50.0);\n            opacity = clamp(opacity - opacityNoise, 0.0, 1.0) * color.a;\n            A = A * (1.0-opacity) + opacity;\n\n            currIndex += 1.0;\n            if(currIndex > endIndex) break;\n        }\n        if(A < 1e-4) discard;\n        outColor = vec4(color.rgb, A);\n        return;\n    }\n\n    if(type == Airbrush){\n        // The method here is not published yet. Shen is not fully satisfied with the current solution.\n        float tanTheta = sqrt(1.0 - cosTheta*cosTheta)/cosTheta;\n        float mid = pLocal.x - abs(pLocal.y)/tanTheta;\n        float A = color.a;\n        float transparency0 = d0 > r0 ? 1.0:sqrt(1.0 - A*sampleGraident(d0/r0));\n        float transparency1 = d1 > r1 ? 1.0:sqrt(1.0 - A*sampleGraident(d1/r1));\n        float transparency;\n\n        // A bunch of math derived with the continuous form of airbrush here.\n        if(mid <= 0.0){\n            transparency = transparency0/transparency1;\n        }\n        if(mid > 0.0 && mid < len){\n            float r = (mid * r1 + (len - mid) * r0)/len;\n            float dr = distance(pLocal, vec2(mid, 0))/r;\n            transparency = (1.0 - A*sampleGraident(dr))/transparency0/transparency1;\n        }\n        if(mid >= len){\n            transparency = transparency1/transparency0;\n        }\n\n        outColor = vec4(color.rgb, 1.0 - transparency);\n    }\n}\n\nfloat x2n(float x){\n    float L = distance(p0, p1);\n    if(r0 == r1) return x/(stampIntervalRatio*r0);\n    else return -L / stampIntervalRatio / (r0 - r1) * log(1.0 - (1.0 - r1/r0)/L * x);\n}\n\nfloat n2x(float n){\n    float L = distance(p0, p1);\n    if(r0 == r1) return n * stampIntervalRatio * r0;\n    else return L * (1.0-exp(-(r0-r1)*n*stampIntervalRatio/L)) / (1.0-r1/r0);\n}\n\n// Helper functions----------------------------------------------------------------------------------\nmat2 rotate(float angle){\n    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));\n}\n\nfloat random (in vec2 st) {\n    return fract(sin(dot(st.xy,\n    vec2(12.9898,78.233)))*\n    43758.5453123);\n}\n\nfloat noise (in vec2 st) {\n    vec2 i = floor(st);\n    vec2 f = fract(st);\n\n    // Four corners in 2D of a tile\n    float a = random(i);\n    float b = random(i + vec2(1.0, 0.0));\n    float c = random(i + vec2(0.0, 1.0));\n    float d = random(i + vec2(1.0, 1.0));\n\n    vec2 u = f * f * (3.0 - 2.0 * f);\n\n    return mix(a, b, u.x) +\n    (c - a)* u.y * (1.0 - u.x) +\n    (d - b) * u.x * u.y;\n}\n\n#define OCTAVES 6\nfloat fbm (in vec2 st) {\n    // Initial values\n    float value = 0.0;\n    float amplitude = .5;\n    float frequency = 0.;\n    //\n    // Loop of octaves\n    for (int i = 0; i < OCTAVES; i++) {\n        value += amplitude * noise(st);\n        st *= 2.;\n        amplitude *= .5;\n    }\n    return value;\n}\n";var f=t(9131),h=t(412),m=t(5893);let x=function(e){return e[e.Vanilla=0]="Vanilla",e[e.Stamp=1]="Stamp",e[e.Airbrush=2]="Airbrush",e}({});function v(e){let{uniforms:n=null,showEditor:t=null}=e;const f=(0,a.useRef)(),h=(0,a.useRef)(),v=(0,a.useRef)();function g(e,n,t){const a=[...n],o=[...n.slice(2)],i=[...t],l=[...t.slice(1)],s=[];let c=0;for(let p=0;p<t.length-1;++p){const e=2*p,a=new r.FM8(n[e],n[e+1]),o=new r.FM8(n[e+2],n[e+3]);let d=t[p],u=t[p+1];const f=1e-5;(d<=0||d/u<f)&&(d=f*u,i[p]=d),(u<=0||u/d<f)&&(u=f*d,l[p]=u);let h=a.distanceTo(o);c+=d<=0&&u<=0?0:d==u?h/d:Math.log(d/u)/(d-u)*h,s.push(c)}const d=[0,...s],u=[...s];e.setAttribute("position0",new r.lb7(new Float32Array(a),2)),e.setAttribute("radius0",new r.lb7(new Float32Array(i),1)),e.setAttribute("position1",new r.lb7(new Float32Array(o),2)),e.setAttribute("radius1",new r.lb7(new Float32Array(l),1)),e.setAttribute("summedLength0",new r.lb7(new Float32Array(d),1)),e.setAttribute("summedLength1",new r.lb7(new Float32Array(u),1))}function w(e,n){const t=v.current.material;e&&(t.vertexShader=e),n&&(t.fragmentShader=n),t.needsUpdate=!0,h.current()}(0,a.useEffect)((()=>{const e=(1+Math.sqrt(5))/2,t=f.current.clientWidth,a=t*(.5/e),i=4*e,l=i*(.5/e),s=new r.iKG(i/-2,i/2,l/2,l/-2,-1e3,1e3);s.position.z=5;const c=new r.CP7({antialias:!0,alpha:!0,premultipliedAlpha:!1,powerPreference:"high-performance"});function m(){const n=f.current.clientWidth,t=.5*n/e;c.setSize(n,t)}c.setClearColor(new r.Ilk(1,1,1),0),c.setSize(t,a),window.addEventListener("resize",m),f.current.appendChild(c.domElement);const w=new r.xsS,b=new o.o(s,c.domElement);b.enableRotate=!1,b.enableDamping=!1,b.screenSpacePanning=!0,b.addEventListener("change",(()=>{c.render(w,s)})),h.current=()=>c.render(w,s),window.addEventListener("TextureLoaded",h.current);const y=new r.u9r;y.setIndex([0,1,2,2,3,0]);const j=new Function(d.Z),[T,A]=j();g(y,T,A);const I={type:{value:x.Vanilla},color:{value:[0,0,0,1]},footprint:{value:new r.xEZ},stampIntervalRatio:{value:1},noiseFactor:{value:0},rotationFactor:{value:0},gradient:{value:new r.IEO}},S=new r.FIo({uniforms:n||I,vertexShader:u,fragmentShader:p,side:r.ehD,transparent:!0,glslVersion:r.LSk});return v.current=new r.SPe(y,S,A.length-1),v.current.frustumCulled=!1,w.add(v.current),h.current(),()=>{c.dispose(),window.removeEventListener("resize",m),window.removeEventListener("TextureLoaded",h.current)}}),[]);const b=(0,a.useCallback)(((e,n)=>{let t=[],a=[];try{const n=new Function(e);[t,a]=n()}catch(o){return void console.log(o.toString())}function r(e){if(Array.isArray(e)){for(let n=0;n<e.length;n++)if("number"!=typeof e[n])return!1;return!0}return!1}r(t)&&r(a)&&t.length==2*a.length?(g(v.current.geometry,t,a),v.current.count=a.length-1,h.current()):console.log("return value is not correct")}),[]),y="40vh";let j=!0,T=!0,A=!0;return Array.isArray(t)&&([j,T,A]=t),(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)("div",{style:{display:t?null:"none"},children:(0,m.jsxs)(i.Z,{defaultValue:"",children:[j&&(0,m.jsx)(l.Z,{value:"geometry.js",children:(0,m.jsx)(s.ZP,{height:y,defaultLanguage:"javascript",defaultValue:d.Z,onChange:b})}),T&&(0,m.jsx)(l.Z,{value:"vertex.glsl",children:(0,m.jsx)(c.r,{height:y,defaultValue:u,onChange:e=>{w(e,"")}})}),A&&(0,m.jsx)(l.Z,{value:"fragment.glsl",children:(0,m.jsx)(c.r,{height:y,defaultValue:p,onChange:e=>{w("",e)}})})]})}),(0,m.jsx)("div",{ref:f,style:{width:"100%"},onMouseDown:e=>e.preventDefault()})]})}let g=new r.xEZ;h.Z.canUseDOM&&(g=(new r.dpR).load(`/${f.Z.projectName}/img/stamp2.png`,(e=>{window.dispatchEvent(new CustomEvent("TextureLoaded"))}),void 0,void 0));let w=new r.xEZ;h.Z.canUseDOM&&(w=(new r.dpR).load(`/${f.Z.projectName}/img/dot.png`,(e=>{window.dispatchEvent(new CustomEvent("TextureLoaded"))}),void 0,void 0));const b={type:{value:x.Stamp},color:{value:[0,0,0,1]},footprint:{value:g},stampIntervalRatio:{value:.4},noiseFactor:{value:1.2},rotationFactor:{value:.75}},y=(((e,n)=>{let t=new r.AXT(new r.FM8(0,1),e,n,new r.FM8(1,0));const a=256,o=new Uint8Array(1024),i=t.getPoints(512);for(let r=0;r<a;++r){let e=r/a;for(let n=0;n<511;++n){let t=i[n],a=i[n+1];if(e>=t.x&&e<=a.x){let n=(t.y*(a.x-e)+a.y*(e-t.x))/(a.x-t.x);o[4*r]=Math.floor(255*n)}}}const l=new r.IEO(o,a,1);l.needsUpdate=!0})(new r.FM8(.33,1),new r.FM8(.66,0)),x.Airbrush,{type:{value:x.Stamp},color:{value:[0,0,0,.5]},footprint:{value:w},stampIntervalRatio:{value:2},noiseFactor:{value:0},rotationFactor:{value:0}}),j={type:{value:x.Stamp},color:{value:[0,0,0,.5]},footprint:{value:w},stampIntervalRatio:{value:1},noiseFactor:{value:0},rotationFactor:{value:0}}},3014:(e,n,t)=>{t.d(n,{Z:()=>a});const a=t.p+"assets/images/brushes-9e58d24a7f40847be1ad6c1cb9f1b9dc.jpg"}}]);