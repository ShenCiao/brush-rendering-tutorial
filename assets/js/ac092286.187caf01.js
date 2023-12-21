"use strict";(self.webpackChunkbrush_stroke_tutorial=self.webpackChunkbrush_stroke_tutorial||[]).push([[364],{5923:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>c,contentTitle:()=>s,default:()=>h,frontMatter:()=>i,metadata:()=>l,toc:()=>d});var r=t(5893),o=t(1151),a=t(5632);const i={title:"Introduction",sidebar_position:2},s=void 0,l={id:"Introduction/Introduction",title:"Introduction",description:"Vanilla",source:"@site/docs/Introduction/Introduction.mdx",sourceDirName:"Introduction",slug:"/Introduction/",permalink:"/brush-rendering-tutorial/Introduction/",draft:!1,unlisted:!1,editUrl:"https://github.com/ShenCiao/brush-rendering-tutorial/tree/main/docs/Introduction/Introduction.mdx",tags:[],version:"current",sidebarPosition:2,frontMatter:{title:"Introduction",sidebar_position:2},sidebar:"tutorialSidebar",previous:{title:"Table of Contents",permalink:"/brush-rendering-tutorial/"},next:{title:"Basics",permalink:"/brush-rendering-tutorial/category/basics"}},c={},d=[{value:"Prerequisites",id:"prerequisites",level:2},{value:"Structure",id:"structure",level:2},{value:"Content",id:"content",level:3},{value:"Live coding",id:"live-coding",level:3},{value:"Supplementary contents",id:"supplementary-contents",level:3},{value:"Citation",id:"citation",level:2}];function u(e){const n={a:"a",admonition:"admonition",code:"code",em:"em",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,o.a)(),...e.components},{Details:t}=n;return t||function(e,n){throw new Error("Expected "+(n?"component":"object")+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}("Details",!0),(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:"row row--no-gutters margin-left--xs",children:[(0,r.jsxs)("div",{className:"col col--6",children:[(0,r.jsx)(a.ij,{}),(0,r.jsx)("center",{children:(0,r.jsx)("em",{children:" Vanilla "})})]}),(0,r.jsxs)("div",{className:"col col--6",children:[(0,r.jsx)(a.ij,{uniforms:a.PQ}),(0,r.jsx)("center",{children:(0,r.jsx)("em",{children:" Pencil "})})]})]}),"\n",(0,r.jsx)("br",{}),"\n",(0,r.jsxs)(n.admonition,{type:"note",children:[(0,r.jsx)(n.p,{children:"When hovering your mouse on the canvas you can:"}),(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Pan"}),": Left-click and drag the mouse."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Zoom"}),": Scroll or drag the mouse wheel."]}),"\n"]})]}),"\n",(0,r.jsxs)(n.p,{children:["This tutorial series will teach you how to use the modern GPU graphics pipeline to render brush strokes,\ncommonly seen with a paint tool in graphics design software like Photoshop.\nThe contents mainly come from my research work ",(0,r.jsx)(n.a,{href:"https://github.com/ShenCiao/Ciallo",children:"Ciallo: The next generation vector paint program"}),',\nand a textbook "Image and Video-Based Artistic Stylisation" edited by Paul Rosin, John Collomosse.\nThe book introduces brush stroke rendering in its second chapter, authored by Stephen DiVerdi.\nSince there will be more research work on GPU brush stroke rendering,\nI will continuously update this tutorial series to teach you related techniques in (potentially) influential research works.']}),"\n",(0,r.jsx)(n.h2,{id:"prerequisites",children:"Prerequisites"}),"\n",(0,r.jsx)(n.p,{children:"Decent experience in one of the GPU graphics APIs like OpenGL and D3D is required.\nIf you were relatively new to computer graphics, you should at least have rendered your first 3D scene and practiced instanced rendering."}),"\n",(0,r.jsxs)(n.p,{children:["GPU apis have built-in line rendering functionalities.\nIt's totally fine if you never heard about ",(0,r.jsx)(n.code,{children:"LINES"}),", ",(0,r.jsx)(n.code,{children:"LINE_STRIP"}),", and ",(0,r.jsx)(n.code,{children:"LINE_LOOP"})," GPU primitives.\nWe won't use the functionalities in this tutorial series.\nIf you're interested in learning about their drawbacks, you can check out mattdesl's article titled ",(0,r.jsx)(n.a,{href:"https://mattdesl.svbtle.com/drawing-lines-is-hard",children:"Drawing Lines is Hard"}),".\nReading it isn't a prerequisite, I still recommend it."]}),"\n",(0,r.jsx)(n.p,{children:"Though I create all the demos in the web environment, you don't have to know about WebGL or WebGPU.\nWe will concentrate on high-level techniques rather than the implementation details.\nNo matter which GPU API you are familiar with, utilizing them to render a stroke will be easy after this series."}),"\n",(0,r.jsx)(n.h2,{id:"structure",children:"Structure"}),"\n",(0,r.jsx)(n.h3,{id:"content",children:"Content"}),"\n",(0,r.jsxs)(n.p,{children:["The ",(0,r.jsx)(n.a,{href:"../category/basics/",children:"Basic"})," section covers the basics of the rendering and stylization methods.\nArticles in the Basic part are organized in a progressive fashion.\nYou may miss something important if skip one of them.\nAfter learning the Basic section, you can freely select your favorite topics.\nI will list extra prerequisites at the very beginning of each article."]}),"\n",(0,r.jsx)(n.h3,{id:"live-coding",children:"Live coding"}),"\n",(0,r.jsxs)(n.p,{children:["You will find live code editors similar to the one displayed below, inspired by ",(0,r.jsx)(n.a,{href:"https://thebookofshaders.com/",children:(0,r.jsx)(n.em,{children:"The Book of Shader"})}),".\nThe rendering result is updated in real-time after modifying the code.\nGive it a try by altering the values of ",(0,r.jsx)(n.code,{children:"maxRadius"}),", and watch how the canvas below changes."]}),"\n",(0,r.jsx)(a.ij,{showEditor:[!0,!1,!1]}),"\n",(0,r.jsx)(n.admonition,{type:"note",children:(0,r.jsxs)(n.p,{children:["If there are bugs for common usages in the code editors or canvases, tell me at the ",(0,r.jsx)(n.a,{href:"https://github.com/ShenCiao/brush-rendering-tutorial/issues",children:"issue"})," page."]})}),"\n",(0,r.jsx)(n.p,{children:'Only geometry generation code "geometry.js" is demonstrated here.\nYou will find "vertex.glsl" and "fragment.glsl" for vertex and fragment shader code.\nWhether they are hidden or shown will depend on the context.'}),"\n",(0,r.jsx)(n.h3,{id:"supplementary-contents",children:"Supplementary contents"}),"\n",(0,r.jsx)(t,{open:!0,children:(0,r.jsxs)(n.p,{children:[(0,r.jsx)("summary",{children:"Dropdown tab"}),"\nSome contents are hidden inside a dropdown tab like this.\nThey are complementary to the main contents.\nFeel free to skip them."]})}),"\n",(0,r.jsx)(n.h2,{id:"citation",children:"Citation"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{children:"@inproceedings{Ciallo2023,\n    author = {Ciao, Shen and Wei, Li-Yi},\n    title = {Ciallo: The next-Generation Vector Paint Program},\n    year = {2023},\n    isbn = {9798400701436},\n    publisher = {Association for Computing Machinery},\n    address = {New York, NY, USA},\n    url = {https://doi.org/10.1145/3587421.3595418},\n    doi = {10.1145/3587421.3595418},\n    booktitle = {ACM SIGGRAPH 2023 Talks},\n    articleno = {67},\n    numpages = {2},\n    keywords = {Digital painting, stylized stroke, arrangement, vector graphics. coloring, graphics processing unit (GPU)},\n    location = {Los Angeles, CA, USA},\n    series = {SIGGRAPH '23}\n}\n"})}),"\n",(0,r.jsxs)(n.admonition,{title:"Research Tip",type:"note",children:[(0,r.jsx)(n.p,{children:"To demonstrate your research work about brush rendering, select vector drawings have variable radius or pen pressure data.\nRegular vector drawing datasets don't contain them."}),(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:["Zeyu Wang's work: ",(0,r.jsx)(n.a,{href:"https://dl.acm.org/doi/10.1145/3450626.3459819",children:"Paper"})," | ",(0,r.jsx)(n.a,{href:"https://github.com/zachzeyuwang/tracing-vs-freehand",children:"Dataset"})]}),"\n",(0,r.jsx)(n.li,{children:(0,r.jsx)(n.a,{href:"https://cloud.blender.org/p/gallery/5b642e25bf419c1042056fc6",children:"Blender Grease Pencil"})}),"\n",(0,r.jsxs)(n.li,{children:["... Tell me more in the ",(0,r.jsx)(n.a,{href:"https://github.com/ShenCiao/brush-rendering-tutorial/discussions/1",children:"discussion"}),"."]}),"\n"]})]})]})}function h(e={}){const{wrapper:n}={...(0,o.a)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(u,{...e})}):u(e)}},5632:(e,n,t)=>{t.d(n,{ij:()=>v,Sw:()=>b,rL:()=>j,PQ:()=>w});var r=t(7294),o=t(9477),a=t(5452),i=t(4866),s=t(5162),l=t(3764),c=t(5034),d=t(9279);const u="precision mediump float;\nprecision mediump int;\n\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\n\nin vec2 position0;\nin float radius0;\nin float summedLength0;\nin vec2 position1;\nin float radius1;\nin float summedLength1;\n\nout vec2 p; // position of the current pixel\nflat out vec2 p0;\nflat out float r0;\nflat out float l0;\nflat out vec2 p1;\nflat out float r1;\nflat out float l1;\n\nvoid main()\t{\n    r0 = radius0;\n    r1 = radius1;\n    p0 = position0;\n    p1 = position1;\n    l0 = summedLength0;\n    l1 = summedLength1;\n\n    vec2 tangent = normalize(position1 - position0);\n    vec2 normal = vec2(-tangent.y, tangent.x);\n    float cosTheta = (r0 - r1)/distance(p0, p1);\n    // the vertex1 with radius is fully inside the vertex0.\n    if(abs(cosTheta) >= 1.0) return;\n\n    // Each instance is a trapzoid, whose vertices' positions are determined here.\n    // Use gl_VertexID {0, 1, 2, 3} to index and get the desired parameters.\n    // Be careful with the backface culling! We are ignoring it here.\n    vec2 offsetSign = vec2[](\n        vec2(-1.0,-1.0),\n        vec2(-1.0, 1.0),\n        vec2( 1.0, 1.0),\n        vec2( 1.0,-1.0)\n    )[gl_VertexID];\n    vec2 position = vec2[](position0, position0, position1, position1)[gl_VertexID];\n    float radius = vec4(radius0, radius0, radius1, radius1)[gl_VertexID];\n\n    float tanHalfTheta = sqrt((1.0+cosTheta) / (1.0-cosTheta));\n    float cotHalfTheta = 1.0 / tanHalfTheta;\n    float normalTanValue = vec4(tanHalfTheta, tanHalfTheta, cotHalfTheta, cotHalfTheta)[gl_VertexID];\n    if(normalTanValue > 10.0 || normalTanValue < 0.1) return;\n\n    vec2 trapzoidVertexPosition = position +\n        offsetSign.x * radius * tangent +\n        offsetSign.y * radius * normal * normalTanValue;\n    p = trapzoidVertexPosition;\n\n    gl_Position = projectionMatrix * modelViewMatrix * vec4(trapzoidVertexPosition, 0.0, 1.0);\n}\n",h="precision mediump float;\nprecision mediump int;\n\nin vec2 p;\nflat in vec2 p0;\nflat in float r0;\nflat in float l0;\nflat in vec2 p1;\nflat in float r1;\nflat in float l1;\n\n// Common\nuniform int type;\nconst int Vanilla = 0, Stamp = 1, Airbrush = 2;\nuniform vec4 color;\n// Stamp\nuniform mediump sampler2D footprint;\nuniform float stampIntervalRatio;\nuniform float noiseFactor;\nuniform float rotationFactor;\nfloat x2n(float x); // from distance to stamp index.\nfloat n2x(float n); // from stamp index to distance.\nmat2 rotate(float angle);\n// Airbrush\nuniform mediump sampler2D gradient;\nfloat sampleGraident(float distance){ return texture(gradient, vec2(distance, 0.0)).r; }\n\n// Noise helper functions from _The Book of Shader_.\nfloat random (in vec2 st);\nfloat noise (in vec2 st);\nfloat fbm (in vec2 st);\n\nout vec4 outColor;\n\nvoid main() {\n    vec2 tangent = normalize(p1 - p0);\n    vec2 normal = vec2(-tangent.y, tangent.x);\n\n    // The local coordinate orgin at p0, x axis along the tangent direct.\n    float len = distance(p1, p0);\n    vec2 pLocal = vec2(dot(p-p0, tangent), dot(p-p0, normal));\n    vec2 p0Local = vec2(0, 0);\n    vec2 p1Local = vec2(len, 0);\n\n    float cosTheta = (r0 - r1)/len;\n    float d0 = distance(p, p0);\n    float d0cos = pLocal.x / d0;\n    float d1 = distance(p, p1);\n    float d1cos = (pLocal.x - len) / d1;\n\n    // Remove corners\n    if(d0cos < cosTheta && d0 > r0) discard;\n    if(d1cos > cosTheta && d1 > r1) discard;\n\n    if(type == Vanilla){\n        if(d0 < r0 && d1 < r1) discard;\n        float A = (d0 < r0 || d1 < r1) ? 1.0 - sqrt(1.0 - color.a) : color.a;\n        outColor = vec4(color.rgb, A);\n        return;\n    }\n\n    if(type == Stamp){\n        // The method here is not published yet, it should be explained in a 10min video.\n        // The footprint is a disk instead of a square.\n        // We set a quadratic polynomial to calculate the effect range, the range on polyline edge footprint can touch the current pixel.\n        // Two roots of the quadratic polynomial are the effectRangeFront and effectRangeBack.\n        // Formulas from SIGGRAPH 2022 Talk - A Fast & Robust Solution for Cubic & Higher-Order Polynomials\n        float a, b, c, delta;\n        a = 1.0 - pow(cosTheta, 2.0);\n        b = 2.0 * (r0 * cosTheta - pLocal.x);\n        c = pow(pLocal.x, 2.0) + pow(pLocal.y, 2.0) - pow(r0, 2.0);\n        delta = pow(b, 2.0) - 4.0*a*c;\n        if(delta <= 0.0) discard; // This should never happen.\n\n        float tempMathBlock = b + sign(b) * sqrt(delta);\n        float x1 = -2.0 * c / tempMathBlock;\n        float x2 = -tempMathBlock / (2.0*a);\n        float effectRangeFront = x1 <= x2 ? x1 : x2;\n        float effectRangeBack = x1 > x2 ? x1 : x2;\n\n        // We stamp on polyline every time the stamp index comes to an integer.\n        float index0 = l0/stampIntervalRatio; // The stamp index of vertex0.\n        float startIndex, endIndex;\n        if (effectRangeFront <= 0.0){\n            startIndex = ceil(index0);\n        }\n        else{\n            startIndex = ceil(index0 + x2n(effectRangeFront));\n        }\n        float index1 = l1/stampIntervalRatio;\n        float backIndex = x2n(effectRangeBack) + index0;\n        endIndex = index1 < backIndex ? index1 : backIndex;\n        if(startIndex > endIndex) discard;\n\n        // The main loop to sample and blend color from the footprint.\n        int MAX_i = 128; float currIndex = startIndex;\n        float A = 0.0;\n        for(int i = 0; i < MAX_i; i++){\n            float currStampLocalX = n2x(currIndex - index0);\n            // Apply roation and sample the footprint.\n            vec2 pToCurrStamp = pLocal - vec2(currStampLocalX, 0.0);\n            float currStampRadius = r0 - cosTheta * currStampLocalX;\n            float angle = rotationFactor*radians(360.0*fract(sin(currIndex)*1.0));\n            pToCurrStamp *= rotate(angle);\n            vec2 textureCoordinate = (pToCurrStamp/currStampRadius + 1.0)/2.0;\n            float opacity = texture(footprint, textureCoordinate).a;\n            // Blend opacity.\n            float opacityNoise = noiseFactor*fbm(textureCoordinate*50.0);\n            opacity = clamp(opacity - opacityNoise, 0.0, 1.0) * color.a;\n            A = A * (1.0-opacity) + opacity;\n\n            currIndex += 1.0;\n            if(currIndex > endIndex) break;\n        }\n        if(A < 1e-4) discard;\n        outColor = vec4(color.rgb, A);\n        return;\n    }\n\n    if(type == Airbrush){\n        // The method here is not published yet. Shen is not fully satisfied with the current solution.\n        float tanTheta = sqrt(1.0 - cosTheta*cosTheta)/cosTheta;\n        float mid = pLocal.x - abs(pLocal.y)/tanTheta;\n        float A = color.a;\n        float transparency0 = d0 > r0 ? 1.0:sqrt(1.0 - A*sampleGraident(d0/r0));\n        float transparency1 = d1 > r1 ? 1.0:sqrt(1.0 - A*sampleGraident(d1/r1));\n        float transparency;\n\n        // A bunch of math derived with the continuous form of airbrush here.\n        if(mid <= 0.0){\n            transparency = transparency0/transparency1;\n        }\n        if(mid > 0.0 && mid < len){\n            float r = (mid * r1 + (len - mid) * r0)/len;\n            float dr = distance(pLocal, vec2(mid, 0))/r;\n            transparency = (1.0 - A*sampleGraident(dr))/transparency0/transparency1;\n        }\n        if(mid >= len){\n            transparency = transparency1/transparency0;\n        }\n\n        outColor = vec4(color.rgb, 1.0 - transparency);\n    }\n}\n\nfloat x2n(float x){\n    float L = distance(p0, p1);\n    if(r0 == r1) return x/(stampIntervalRatio*r0);\n    else return -L / stampIntervalRatio / (r0 - r1) * log(1.0 - (1.0 - r1/r0)/L * x);\n}\n\nfloat n2x(float n){\n    float L = distance(p0, p1);\n    if(r0 == r1) return n * stampIntervalRatio * r0;\n    else return L * (1.0-exp(-(r0-r1)*n*stampIntervalRatio/L)) / (1.0-r1/r0);\n}\n\n// Helper functions----------------------------------------------------------------------------------\nmat2 rotate(float angle){\n    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));\n}\n\nfloat random (in vec2 st) {\n    return fract(sin(dot(st.xy,\n    vec2(12.9898,78.233)))*\n    43758.5453123);\n}\n\nfloat noise (in vec2 st) {\n    vec2 i = floor(st);\n    vec2 f = fract(st);\n\n    // Four corners in 2D of a tile\n    float a = random(i);\n    float b = random(i + vec2(1.0, 0.0));\n    float c = random(i + vec2(0.0, 1.0));\n    float d = random(i + vec2(1.0, 1.0));\n\n    vec2 u = f * f * (3.0 - 2.0 * f);\n\n    return mix(a, b, u.x) +\n    (c - a)* u.y * (1.0 - u.x) +\n    (d - b) * u.x * u.y;\n}\n\n#define OCTAVES 6\nfloat fbm (in vec2 st) {\n    // Initial values\n    float value = 0.0;\n    float amplitude = .5;\n    float frequency = 0.;\n    //\n    // Loop of octaves\n    for (int i = 0; i < OCTAVES; i++) {\n        value += amplitude * noise(st);\n        st *= 2.;\n        amplitude *= .5;\n    }\n    return value;\n}\n";var p=t(9501),f=t(412),m=t(5893);let x=function(e){return e[e.Vanilla=0]="Vanilla",e[e.Stamp=1]="Stamp",e[e.Airbrush=2]="Airbrush",e}({});function v(e){let{uniforms:n=null,showEditor:t=null}=e;const p=(0,r.useRef)(),f=(0,r.useRef)(),v=(0,r.useRef)();function g(e,n,t){const r=[...n],a=[...n.slice(2)],i=[...t],s=[...t.slice(1)],l=[];let c=0;for(let h=0;h<t.length-1;++h){const e=2*h,r=new o.FM8(n[e],n[e+1]),a=new o.FM8(n[e+2],n[e+3]);let d=t[h],u=t[h+1];const p=1e-5;(d<=0||d/u<p)&&(d=p*u,i[h]=d),(u<=0||u/d<p)&&(u=p*d,s[h]=u);let f=r.distanceTo(a);c+=d<=0&&u<=0?0:d==u?f/d:Math.log(d/u)/(d-u)*f,l.push(c)}const d=[0,...l],u=[...l];e.setAttribute("position0",new o.lb7(new Float32Array(r),2)),e.setAttribute("radius0",new o.lb7(new Float32Array(i),1)),e.setAttribute("position1",new o.lb7(new Float32Array(a),2)),e.setAttribute("radius1",new o.lb7(new Float32Array(s),1)),e.setAttribute("summedLength0",new o.lb7(new Float32Array(d),1)),e.setAttribute("summedLength1",new o.lb7(new Float32Array(u),1))}function y(e,n){const t=v.current.material;e&&(t.vertexShader=e),n&&(t.fragmentShader=n),t.needsUpdate=!0,f.current()}(0,r.useEffect)((()=>{const e=(1+Math.sqrt(5))/2,t=p.current.clientWidth,r=t*(.5/e),i=4*e,s=i*(.5/e),l=new o.iKG(i/-2,i/2,s/2,s/-2,-1e3,1e3);l.position.z=5;const c=new o.CP7({antialias:!0,alpha:!0,premultipliedAlpha:!1,powerPreference:"high-performance"});function m(){const n=p.current.clientWidth,t=.5*n/e;c.setSize(n,t)}c.setClearColor(new o.Ilk(1,1,1),0),c.setSize(t,r),window.addEventListener("resize",m),p.current.appendChild(c.domElement);const y=new o.xsS,w=new a.o(l,c.domElement);w.enableRotate=!1,w.enableDamping=!1,w.screenSpacePanning=!0,w.addEventListener("change",(()=>{c.render(y,l)})),f.current=()=>c.render(y,l),window.addEventListener("TextureLoaded",f.current);const b=new o.u9r;b.setIndex([0,1,2,2,3,0]);const j=new Function(d.Z),[I,T]=j();g(b,I,T);const S={type:{value:x.Vanilla},color:{value:[0,0,0,1]},footprint:{value:new o.xEZ},stampIntervalRatio:{value:1},noiseFactor:{value:0},rotationFactor:{value:0},gradient:{value:new o.IEO}},A=new o.FIo({uniforms:n||S,vertexShader:u,fragmentShader:h,side:o.ehD,transparent:!0,glslVersion:o.LSk});return v.current=new o.SPe(b,A,T.length-1),v.current.frustumCulled=!1,y.add(v.current),f.current(),()=>{c.dispose(),window.removeEventListener("resize",m),window.removeEventListener("TextureLoaded",f.current)}}),[]);const w=(0,r.useCallback)(((e,n)=>{let t=[],r=[];try{const n=new Function(e);[t,r]=n()}catch(a){return void console.log(a.toString())}function o(e){if(Array.isArray(e)){for(let n=0;n<e.length;n++)if("number"!=typeof e[n])return!1;return!0}return!1}o(t)&&o(r)&&t.length==2*r.length?(g(v.current.geometry,t,r),v.current.count=r.length-1,f.current()):console.log("return value is not correct")}),[]),b="40vh";let j=!0,I=!0,T=!0;return Array.isArray(t)&&([j,I,T]=t),(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)("div",{style:{display:t?null:"none"},children:(0,m.jsxs)(i.Z,{defaultValue:"",children:[j&&(0,m.jsx)(s.Z,{value:"geometry.js",children:(0,m.jsx)(l.ZP,{height:b,defaultLanguage:"javascript",defaultValue:d.Z,onChange:w})}),I&&(0,m.jsx)(s.Z,{value:"vertex.glsl",children:(0,m.jsx)(c.r,{height:b,defaultValue:u,onChange:e=>{y(e,"")}})}),T&&(0,m.jsx)(s.Z,{value:"fragment.glsl",children:(0,m.jsx)(c.r,{height:b,defaultValue:h,onChange:e=>{y("",e)}})})]})}),(0,m.jsx)("div",{ref:p,style:{width:"100%"},onMouseDown:e=>e.preventDefault()})]})}let g=new o.xEZ;f.Z.canUseDOM&&(g=(new o.dpR).load(`/${p.Z.projectName}/img/stamp2.png`,(e=>{window.dispatchEvent(new CustomEvent("TextureLoaded"))}),void 0,void 0));let y=new o.xEZ;f.Z.canUseDOM&&(y=(new o.dpR).load(`/${p.Z.projectName}/img/dot.png`,(e=>{window.dispatchEvent(new CustomEvent("TextureLoaded"))}),void 0,void 0));const w={type:{value:x.Stamp},color:{value:[0,0,0,1]},footprint:{value:g},stampIntervalRatio:{value:.4},noiseFactor:{value:1.2},rotationFactor:{value:.75}},b=(((e,n)=>{let t=new o.AXT(new o.FM8(0,1),e,n,new o.FM8(1,0));const r=256,a=new Uint8Array(1024),i=t.getPoints(512);for(let o=0;o<r;++o){let e=o/r;for(let n=0;n<511;++n){let t=i[n],r=i[n+1];if(e>=t.x&&e<=r.x){let n=(t.y*(r.x-e)+r.y*(e-t.x))/(r.x-t.x);a[4*o]=Math.floor(255*n)}}}const s=new o.IEO(a,r,1);s.needsUpdate=!0})(new o.FM8(.33,1),new o.FM8(.66,0)),x.Airbrush,{type:{value:x.Stamp},color:{value:[0,0,0,.5]},footprint:{value:y},stampIntervalRatio:{value:2},noiseFactor:{value:0},rotationFactor:{value:0}}),j={type:{value:x.Stamp},color:{value:[0,0,0,.5]},footprint:{value:y},stampIntervalRatio:{value:1},noiseFactor:{value:0},rotationFactor:{value:0}}}}]);