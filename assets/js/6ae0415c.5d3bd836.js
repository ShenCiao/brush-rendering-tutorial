(self.webpackChunkbrush_stroke_tutorial=self.webpackChunkbrush_stroke_tutorial||[]).push([[613],{1410:(e,t,n)=>{const a=n(7694),o=n(3618),r={title:"Brush Stroke Tutorial",tagline:"Learn brush stroke rendering.",url:"https://shenciao.github.io",baseUrl:"/brush-stroke-tutorial/",organizationName:"ShenCiao",projectName:"brush-stroke-tutorial",onBrokenLinks:"throw",onBrokenMarkdownLinks:"warn",i18n:{defaultLocale:"en",locales:["en"]},presets:[["classic",{docs:{routeBasePath:"/",sidebarPath:6679,editUrl:"https://github.com/ShenCiao/brush-stroke-tutorial/tree/main"},blog:!1,theme:{customCss:2295}}]],themeConfig:{colorMode:{disableSwitch:!0},image:"img/vanilla-stroke.png",navbar:{title:"Brush Stroke Tutorial",logo:{alt:"logo",src:"img/vanilla-stroke.png"},items:[{type:"docSidebar",sidebarId:"tutorialSidebar",position:"right",label:"Tutorial"},{href:"https://github.com/ShenCiao/brush-stroke-tutorial",label:"GitHub",position:"right"}]},footer:{style:"light",copyright:`Copyright \xa9 ${(new Date).getFullYear()} Brush Stroke Tutorial, under CC BY-SA 4.0 License`},prism:{theme:a,darkTheme:o},docs:{sidebar:{hideable:!0}}},plugins:["raw-loaders"],trailingSlash:!0};e.exports=r},6679:e=>{e.exports={tutorialSidebar:[{type:"autogenerated",dirName:"."}]}},5632:(e,t,n)=>{"use strict";n.d(t,{ij:()=>v,en:()=>w,Sw:()=>T,rL:()=>L,PQ:()=>y});var a=n(7294),o=n(9477),r=n(5452),i=n(4866),l=n(5162),s=n(3764),c=n(5034),u=n(9279);const d="precision mediump float;\nprecision mediump int;\n\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\n\nin vec2 position0;\nin float radius0;\nin float summedLength0;\nin vec2 position1;\nin float radius1;\nin float summedLength1;\n\nout vec2 p; // position of the current pixel\nflat out vec2 p0;\nflat out float r0;\nflat out float l0;\nflat out vec2 p1;\nflat out float r1;\nflat out float l1;\n\nvoid main()\t{\n    r0 = radius0;\n    r1 = radius1;\n    p0 = position0;\n    p1 = position1;\n    l0 = summedLength0;\n    l1 = summedLength1;\n\n    vec2 tangent = normalize(position1 - position0);\n    vec2 normal = vec2(-tangent.y, tangent.x);\n    float cosTheta = (r0 - r1)/distance(p0, p1); // theta is the angle stroke tilt, there is a diagram in README to explain this.\n    // the vertex1 with radius is fully inside the vertex0.\n    if(abs(cosTheta) >= 1.0) return;\n\n    // Each instance is a trapzoid, whose vertices' positions are determined here.\n    // Use gl_VertexID {0, 1, 2, 3} to index and get the desired parameters.\n    // Be careful with the backface culling! We are ignoring it here.\n    vec2 offsetSign = vec2[](\n        vec2(-1.0,-1.0),\n        vec2(-1.0, 1.0),\n        vec2( 1.0, 1.0),\n        vec2( 1.0,-1.0)\n    )[gl_VertexID];\n    vec2 position = vec2[](position0, position0, position1, position1)[gl_VertexID];\n    float radius = vec4(radius0, radius0, radius1, radius1)[gl_VertexID];\n\n    float tanHalfTheta = sqrt((1.0+cosTheta) / (1.0-cosTheta));\n    float cotHalfTheta = 1.0 / tanHalfTheta;\n    float normalTanValue = vec4(tanHalfTheta, tanHalfTheta, cotHalfTheta, cotHalfTheta)[gl_VertexID];\n    if(normalTanValue > 10.0 || normalTanValue < 0.1) return;\n\n    vec2 trapzoidVertexPosition = position +\n        offsetSign.x * radius * tangent +\n        offsetSign.y * radius * normal * normalTanValue;\n    p = trapzoidVertexPosition;\n\n    gl_Position = projectionMatrix * modelViewMatrix * vec4(trapzoidVertexPosition, 0.0, 1.0);\n}\n",p="precision mediump float;\nprecision mediump int;\n\nin vec2 p;\nflat in vec2 p0;\nflat in float r0;\nflat in float l0;\nflat in vec2 p1;\nflat in float r1;\nflat in float l1;\n\n// Common\nuniform int type;\nconst int Vanilla = 0, Stamp = 1, Airbrush = 2;\nuniform vec4 color;\n// Stamp\nuniform mediump sampler2D footprint;\nuniform float stampIntervalRatio;\nuniform float noiseFactor;\nuniform float rotationFactor;\nfloat x2n(float x); // from distance to stamp index.\nfloat n2x(float n); // from stamp index to distance.\nmat2 rotate(float angle);\n// Airbrush\nuniform mediump sampler2D gradient;\nfloat sampleGraident(float distance){ return texture(gradient, vec2(distance, 0.0)).r; }\n\n// Noise helper functions from _The Book of Shader_.\nfloat random (in vec2 st);\nfloat noise (in vec2 st);\nfloat fbm (in vec2 st);\n\nout vec4 outColor;\n\nvoid main() {\n    vec2 tangent = normalize(p1 - p0);\n    vec2 normal = vec2(-tangent.y, tangent.x);\n\n    // The local coordinate orgin at p0, x axis along the tangent direct.\n    float len = distance(p1, p0);\n    vec2 pLocal = vec2(dot(p-p0, tangent), dot(p-p0, normal));\n    vec2 p0Local = vec2(0, 0);\n    vec2 p1Local = vec2(len, 0);\n\n    float cosTheta = (r0 - r1)/len;\n    float d0 = distance(p, p0);\n    float d0cos = pLocal.x / d0;\n    float d1 = distance(p, p1);\n    float d1cos = (pLocal.x - len) / d1;\n\n    // Remove corners\n    if(d0cos < cosTheta && d0 > r0) discard;\n    if(d1cos > cosTheta && d1 > r1) discard;\n\n    if(type == Vanilla){\n        if(d0 < r0 && d1 < r1) discard;\n        float A = (d0 < r0 || d1 < r1) ? 1.0 - sqrt(1.0 - color.a) : color.a;\n        outColor = vec4(color.rgb, A);\n        return;\n    }\n\n    if(type == Stamp){\n        // The method here is not published yet, it should be explained in a 10min video.\n        // The footprint is a disk instead of a square.\n        // We set a quadratic polynomial to calculate the effect range, the range on polyline edge footprint can touch the current pixel.\n        // Two roots of the quadratic polynomial are the effectRangeFront and effectRangeBack.\n        // Formulas from SIGGRAPH 2022 Talk - A Fast & Robust Solution for Cubic & Higher-Order Polynomials\n        float a, b, c, delta;\n        a = 1.0 - pow(cosTheta, 2.0);\n        b = 2.0 * (r0 * cosTheta - pLocal.x);\n        c = pow(pLocal.x, 2.0) + pow(pLocal.y, 2.0) - pow(r0, 2.0);\n        delta = pow(b, 2.0) - 4.0*a*c;\n        if(delta <= 0.0) discard; // This should never happen.\n\n        float tempMathBlock = b + sign(b) * sqrt(delta);\n        float x1 = -2.0 * c / tempMathBlock;\n        float x2 = -tempMathBlock / (2.0*a);\n        float effectRangeFront = x1 <= x2 ? x1 : x2;\n        float effectRangeBack = x1 > x2 ? x1 : x2;\n\n        // We stamp on polyline every time the stamp index comes to an integer.\n        float index0 = l0/stampIntervalRatio; // The stamp index of vertex0.\n        float startIndex, endIndex;\n        if (effectRangeFront <= 0.0){\n            startIndex = ceil(index0);\n        }\n        else{\n            startIndex = ceil(index0 + x2n(effectRangeFront));\n        }\n        float index1 = l1/stampIntervalRatio;\n        float backIndex = x2n(effectRangeBack) + index0;\n        endIndex = index1 < backIndex ? index1 : backIndex;\n        if(startIndex > endIndex) discard;\n\n        // The main loop to sample and blend color from the footprint.\n        int MAX_i = 128; float currIndex = startIndex;\n        float A = 0.0;\n        for(int i = 0; i < MAX_i; i++){\n            float currStampLocalX = n2x(currIndex - index0);\n            // Apply roation and sample the footprint.\n            vec2 pToCurrStamp = pLocal - vec2(currStampLocalX, 0.0);\n            float currStampRadius = r0 - cosTheta * currStampLocalX;\n            float angle = rotationFactor*radians(360.0*fract(sin(currIndex)*1.0));\n            pToCurrStamp *= rotate(angle);\n            vec2 textureCoordinate = (pToCurrStamp/currStampRadius + 1.0)/2.0;\n            float opacity = texture(footprint, textureCoordinate).a;\n            // Blend opacity.\n            float opacityNoise = noiseFactor*fbm(textureCoordinate*50.0);\n            opacity = clamp(opacity - opacityNoise, 0.0, 1.0) * color.a;\n            A = A * (1.0-opacity) + opacity;\n\n            currIndex += 1.0;\n            if(currIndex > endIndex) break;\n        }\n        if(A < 1e-4) discard;\n        outColor = vec4(color.rgb, A);\n        return;\n    }\n\n    if(type == Airbrush){\n        // The method here is not published yet. Shen is not fully satisfied with the current solution.\n        float tanTheta = sqrt(1.0 - cosTheta*cosTheta)/cosTheta;\n        float mid = pLocal.x - abs(pLocal.y)/tanTheta;\n        float A = color.a;\n        float transparency0 = d0 > r0 ? 1.0:sqrt(1.0 - A*sampleGraident(d0/r0));\n        float transparency1 = d1 > r1 ? 1.0:sqrt(1.0 - A*sampleGraident(d1/r1));\n        float transparency;\n\n        // A bunch of math derived with the continuous form of airbrush here.\n        if(mid <= 0.0){\n            transparency = transparency0/transparency1;\n        }\n        if(mid > 0.0 && mid < len){\n            float r = (mid * r1 + (len - mid) * r0)/len;\n            float dr = distance(pLocal, vec2(mid, 0))/r;\n            transparency = (1.0 - A*sampleGraident(dr))/transparency0/transparency1;\n        }\n        if(mid >= len){\n            transparency = transparency1/transparency0;\n        }\n\n        outColor = vec4(color.rgb, 1.0 - transparency);\n    }\n}\n\nfloat x2n(float x){\n    float L = distance(p0, p1);\n    if(r0 == r1) return x/(stampIntervalRatio*r0);\n    else return -L / stampIntervalRatio / (r0 - r1) * log(1.0 - (1.0 - r1/r0)/L * x);\n}\n\nfloat n2x(float n){\n    float L = distance(p0, p1);\n    if(r0 == r1) return n * stampIntervalRatio * r0;\n    else return L * (1.0-exp(-(r0-r1)*n*stampIntervalRatio/L)) / (1.0-r1/r0);\n}\n\n// Helper functions----------------------------------------------------------------------------------\nmat2 rotate(float angle){\n    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));\n}\n\nfloat random (in vec2 st) {\n    return fract(sin(dot(st.xy,\n    vec2(12.9898,78.233)))*\n    43758.5453123);\n}\n\nfloat noise (in vec2 st) {\n    vec2 i = floor(st);\n    vec2 f = fract(st);\n\n    // Four corners in 2D of a tile\n    float a = random(i);\n    float b = random(i + vec2(1.0, 0.0));\n    float c = random(i + vec2(0.0, 1.0));\n    float d = random(i + vec2(1.0, 1.0));\n\n    vec2 u = f * f * (3.0 - 2.0 * f);\n\n    return mix(a, b, u.x) +\n    (c - a)* u.y * (1.0 - u.x) +\n    (d - b) * u.x * u.y;\n}\n\n#define OCTAVES 6\nfloat fbm (in vec2 st) {\n    // Initial values\n    float value = 0.0;\n    float amplitude = .5;\n    float frequency = 0.;\n    //\n    // Loop of octaves\n    for (int i = 0; i < OCTAVES; i++) {\n        value += amplitude * noise(st);\n        st *= 2.;\n        amplitude *= .5;\n    }\n    return value;\n}\n";var m=n(1410),f=n.n(m),h=n(412);let g=function(e){return e[e.Vanilla=0]="Vanilla",e[e.Stamp=1]="Stamp",e[e.Airbrush=2]="Airbrush",e}({});function v(e){let{uniforms:t=null,showEditor:n=null}=e;const m=(0,a.useRef)(),f=(0,a.useRef)(),h=(0,a.useRef)();function v(e,t,n){const a=[...t],r=[...t.slice(2)],i=[...n],l=[...n.slice(1)],s=[];let c=0;for(let p=0;p<n.length-1;++p){const e=2*p,a=new o.FM8(t[e],t[e+1]),r=new o.FM8(t[e+2],t[e+3]);let u=n[p],d=n[p+1];const m=1e-5;(u<=0||u/d<m)&&(u=m*d,i[p]=u),(d<=0||d/u<m)&&(d=m*u,l[p]=d);let f=a.distanceTo(r);c+=u<=0&&d<=0?0:u==d?f/u:Math.log(u/d)/(u-d)*f,s.push(c)}const u=[0,...s],d=[...s];e.setAttribute("position0",new o.lb7(new Float32Array(a),2)),e.setAttribute("radius0",new o.lb7(new Float32Array(i),1)),e.setAttribute("position1",new o.lb7(new Float32Array(r),2)),e.setAttribute("radius1",new o.lb7(new Float32Array(l),1)),e.setAttribute("summedLength0",new o.lb7(new Float32Array(u),1)),e.setAttribute("summedLength1",new o.lb7(new Float32Array(d),1))}function x(e,t){const n=h.current.material;e&&(n.vertexShader=e),t&&(n.fragmentShader=t),n.needsUpdate=!0,f.current()}(0,a.useEffect)((()=>{const e=(1+Math.sqrt(5))/2,n=m.current.clientWidth,a=n*(.5/e),i=4*e,l=i*(.5/e),s=new o.iKG(i/-2,i/2,l/2,l/-2,-1e3,1e3);s.position.z=5;const c=new o.CP7({antialias:!0,alpha:!0,premultipliedAlpha:!1,powerPreference:"high-performance"});function x(){const t=m.current.clientWidth,n=.5*t/e;c.setSize(t,n)}c.setClearColor(new o.Ilk(1,1,1),0),c.setSize(n,a),window.addEventListener("resize",x),m.current.appendChild(c.domElement);const b=new o.xsS,y=new r.o(s,c.domElement);y.enableRotate=!1,y.enableDamping=!1,y.screenSpacePanning=!0,y.addEventListener("change",(()=>{c.render(b,s)})),f.current=()=>c.render(b,s),window.addEventListener("TextureLoaded",f.current);const k=new o.u9r;k.setIndex([0,1,2,2,3,0]);const w=new Function(u.Z),[T,L]=w();v(k,T,L);const A={type:{value:g.Vanilla},color:{value:[0,0,0,1]},footprint:{value:new o.xEZ},stampIntervalRatio:{value:1},noiseFactor:{value:0},rotationFactor:{value:0},gradient:{value:new o.IEO}},S=new o.FIo({uniforms:t||A,vertexShader:d,fragmentShader:p,side:o.ehD,transparent:!0,glslVersion:o.LSk});return h.current=new o.SPe(k,S,T.length-1),h.current.frustumCulled=!1,b.add(h.current),f.current(),()=>{c.dispose(),window.removeEventListener("resize",x),window.removeEventListener("TextureLoaded",f.current)}}),[]);const b=(0,a.useCallback)(((e,t)=>{let n=[],a=[];try{const t=new Function(e);[n,a]=t()}catch(r){return void console.log(r.toString())}function o(e){if(Array.isArray(e)){for(let t=0;t<e.length;t++)if("number"!=typeof e[t])return!1;return!0}return!1}o(n)&&o(a)&&n.length==2*a.length?(v(h.current.geometry,n,a),h.current.count=n.length-1,f.current()):console.log("return value is not correct")}),[]),y="40vh";let k=!0,w=!0,T=!0;return Array.isArray(n)&&([k,w,T]=n),a.createElement(a.Fragment,null,a.createElement("div",{style:{display:n?null:"none"}},a.createElement(i.Z,{defaultValue:""},k&&a.createElement(l.Z,{value:"geometry.js"},a.createElement(s.ZP,{height:y,defaultLanguage:"javascript",defaultValue:u.Z,onChange:b})),w&&a.createElement(l.Z,{value:"vertex.glsl"},a.createElement(c.r,{height:y,defaultValue:d,onChange:e=>{x(e,"")}})),T&&a.createElement(l.Z,{value:"fragment.glsl"},a.createElement(c.r,{height:y,defaultValue:p,onChange:e=>{x("",e)}})))),a.createElement("div",{ref:m,style:{width:"100%"},onMouseDown:e=>e.preventDefault()}))}let x=new o.xEZ;h.Z.canUseDOM&&(x=(new o.dpR).load(`/${f().projectName}/img/stamp2.png`,(e=>{window.dispatchEvent(new CustomEvent("TextureLoaded"))}),void 0,void 0));let b=new o.xEZ;h.Z.canUseDOM&&(b=(new o.dpR).load(`/${f().projectName}/img/dot.png`,(e=>{window.dispatchEvent(new CustomEvent("TextureLoaded"))}),void 0,void 0));const y={type:{value:g.Stamp},color:{value:[0,0,0,1]},footprint:{value:x},stampIntervalRatio:{value:.4},noiseFactor:{value:1.2},rotationFactor:{value:.75}},k=((e,t)=>{let n=new o.AXT(new o.FM8(0,1),e,t,new o.FM8(1,0));const a=256,r=new Uint8Array(1024),i=n.getPoints(512);for(let o=0;o<a;++o){let e=o/a;for(let t=0;t<511;++t){let n=i[t],a=i[t+1];if(e>=n.x&&e<=a.x){let t=(n.y*(a.x-e)+a.y*(e-n.x))/(a.x-n.x);r[4*o]=Math.floor(255*t)}}}const l=new o.IEO(r,a,1);return l.needsUpdate=!0,l})(new o.FM8(.33,1),new o.FM8(.66,0)),w={type:{value:g.Airbrush},color:{value:[0,0,0,1]},gradient:{value:k}},T={type:{value:g.Stamp},color:{value:[0,0,0,.5]},footprint:{value:b},stampIntervalRatio:{value:2},noiseFactor:{value:0},rotationFactor:{value:0}},L={type:{value:g.Stamp},color:{value:[0,0,0,.5]},footprint:{value:b},stampIntervalRatio:{value:1},noiseFactor:{value:0},rotationFactor:{value:0}}},5034:(e,t,n)=>{"use strict";n.d(t,{r:()=>s});var a=n(7462),o=n(7294);const r={comments:{lineComment:"//",blockComment:["/*","*/"]},brackets:[["{","}"],["[","]"],["(",")"]],autoClosingPairs:[{open:"[",close:"]"},{open:"{",close:"}"},{open:"(",close:")"},{open:"'",close:"'",notIn:["string","comment"]},{open:'"',close:'"',notIn:["string"]}],surroundingPairs:[{open:"{",close:"}"},{open:"[",close:"]"},{open:"(",close:")"},{open:'"',close:'"'},{open:"'",close:"'"}]},i={tokenPostfix:".glsl",defaultToken:"invalid",keywords:["const","uniform","break","continue","do","for","while","if","else","switch","case","in","out","inout","true","false","invariant","discard","return","sampler2D","samplerCube","sampler3D","struct","radians","degrees","sin","cos","tan","asin","acos","atan","pow","sinh","cosh","tanh","asinh","acosh","atanh","exp","log","exp2","log2","sqrt","inversesqrt","abs","sign","floor","ceil","round","roundEven","trunc","fract","mod","modf","min","max","clamp","mix","step","smoothstep","length","distance","dot","cross ","determinant","inverse","normalize","faceforward","reflect","refract","matrixCompMult","outerProduct","transpose","lessThan ","lessThanEqual","greaterThan","greaterThanEqual","equal","notEqual","any","all","not","packUnorm2x16","unpackUnorm2x16","packSnorm2x16","unpackSnorm2x16","packHalf2x16","unpackHalf2x16","dFdx","dFdy","fwidth","textureSize","texture","textureProj","textureLod","textureGrad","texelFetch","texelFetchOffset","textureProjLod","textureLodOffset","textureGradOffset","textureProjLodOffset","textureProjGrad","intBitsToFloat","uintBitsToFloat","floatBitsToInt","floatBitsToUint","isnan","isinf","vec2","vec3","vec4","ivec2","ivec3","ivec4","uvec2","uvec3","uvec4","bvec2","bvec3","bvec4","mat2","mat3","mat2x2","mat2x3","mat2x4","mat3x2","mat3x3","mat3x4","mat4x2","mat4x3","mat4x4","mat4","float","int","uint","void","bool"],operators:["=",">","<","!","~","?",":","==","<=",">=","!=","&&","||","++","--","+","-","*","/","&","|","^","%","<<",">>",">>>","+=","-=","*=","/=","&=","|=","^=","%=","<<=",">>=",">>>="],symbols:/[=><!~?:&|+\-*\/\^%]+/,escapes:/\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,integersuffix:/([uU](ll|LL|l|L)|(ll|LL|l|L)?[uU]?)/,floatsuffix:/[fFlL]?/,encoding:/u|u8|U|L/,tokenizer:{root:[[/[a-zA-Z_]\w*/,{cases:{"@keywords":{token:"keyword.$0"},"@default":"identifier"}}],[/^\s*#\s*\w+/,"keyword.directive"],{include:"@whitespace"},[/[{}()\[\]]/,"@brackets"],[/@symbols/,{cases:{"@operators":"operator","@default":""}}],[/\d*\d+[eE]([\-+]?\d+)?(@floatsuffix)/,"number.float"],[/\d*\.\d+([eE][\-+]?\d+)?(@floatsuffix)/,"number.float"],[/0[xX][0-9a-fA-F']*[0-9a-fA-F](@integersuffix)/,"number.hex"],[/0[0-7']*[0-7](@integersuffix)/,"number.octal"],[/0[bB][0-1']*[0-1](@integersuffix)/,"number.binary"],[/\d[\d']*\d(@integersuffix)/,"number"],[/\d(@integersuffix)/,"number"],[/[;,.]/,"delimiter"]],comment:[[/[^\/*]+/,"comment"],[/\/\*/,"comment","@push"],["\\*/","comment","@pop"],[/[\/*]/,"comment"]],string:[[/[^\\"]+/,"string"],[/@escapes/,"string.escape"],[/\\./,"string.escape.invalid"],[/"/,{token:"string.quote",bracket:"@close",next:"@pop"}]],whitespace:[[/[ \t\r\n]+/,"white"],[/\/\*/,"comment","@comment"],[/\/\/.*$/,"comment"]]}};var l=n(3764);function s(e){return o.createElement(l.ML,(0,a.Z)({},e,{defaultLanguage:"glsl",onMount:(t,n)=>{n.languages.register({id:"glsl"}),n.languages.setMonarchTokensProvider("glsl",i),n.languages.setLanguageConfiguration("glsl",r),"function"==typeof e.onMount&&e.onMount(t,n)}}))}},9279:(e,t,n)=>{"use strict";n.d(t,{Z:()=>a});const a="// Generate sinewave geometry \nconst maxRadius = 1/3;\nconst segmentCount = 32;\n\nconst position = [];\nconst radius = [];\n\nconst gr = (1 + Math.sqrt(5)) / 2; // golden ratio\nconst pi = Math.PI;\n\nfor(let i = 0; i <= segmentCount; ++i){\n  let a = i / segmentCount\n  let x =  -pi + (2 * pi * a);\n  let y = Math.sin(x) / gr;\n  let r = Math.cos(x / 2.0) * maxRadius;\n\n  position.push(x, y);\n  radius.push(r);\n}\n\nreturn [position, radius];\n"},2919:(e,t,n)=>{"use strict";n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>l,default:()=>m,frontMatter:()=>i,metadata:()=>s,toc:()=>u});var a=n(7462),o=(n(7294),n(3905)),r=n(5632);const i={title:"Table of Contents",hide_title:!0,sidebar_position:1,slug:"/"},l=void 0,s={unversionedId:"toc",id:"toc",title:"Table of Contents",description:"Vanilla",source:"@site/docs/toc.mdx",sourceDirName:".",slug:"/",permalink:"/brush-stroke-tutorial/",draft:!1,editUrl:"https://github.com/ShenCiao/brush-stroke-tutorial/tree/main/docs/toc.mdx",tags:[],version:"current",sidebarPosition:1,frontMatter:{title:"Table of Contents",hide_title:!0,sidebar_position:1,slug:"/"},sidebar:"tutorialSidebar",next:{title:"Introduction",permalink:"/brush-stroke-tutorial/Introduction/"}},c={},u=[{value:"Table of Contents",id:"table-of-contents",level:2},{value:"Future Contents",id:"future-contents",level:2},{value:"Airbrush",id:"airbrush",level:3},{value:"Stamp density and &quot;ratio-distance&quot;",id:"stamp-density-and-ratio-distance",level:3},{value:"3D stroke",id:"3d-stroke",level:3}],d={toc:u},p="wrapper";function m(e){let{components:t,...n}=e;return(0,o.kt)(p,(0,a.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("div",{className:"row row--no-gutters margin-left--xs"},(0,o.kt)("div",{className:"col col--6"},(0,o.kt)(r.ij,{mdxType:"ArticulatedLine2D"}),(0,o.kt)("center",null,(0,o.kt)("em",null," Vanilla "))),(0,o.kt)("div",{className:"col col--6"},(0,o.kt)(r.ij,{uniforms:r.PQ,mdxType:"ArticulatedLine2D"}),(0,o.kt)("center",null,(0,o.kt)("em",null," Pencil ")))),(0,o.kt)("br",null),(0,o.kt)("p",null,"This tutorial series will teach you how to render brush strokes with the modern GPU graphics pipeline."),(0,o.kt)("p",null,"If you like this series, please star the ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/ShenCiao/BrushStrokeTutorial"},"code repository")," instead of bookmark this website since the domain might be changed."),(0,o.kt)("h2",{id:"table-of-contents"},"Table of Contents"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"./introduction"},"Introduction")),(0,o.kt)("li",{parentName:"ul"},"Basics",(0,o.kt)("ul",{parentName:"li"},(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"./Basics/Vanilla"},"Vanilla")),(0,o.kt)("li",{parentName:"ul"},"Vanilla with variable radius"),(0,o.kt)("li",{parentName:"ul"},"Stamp"),(0,o.kt)("li",{parentName:"ul"},"Stamp with variable radius 1"),(0,o.kt)("li",{parentName:"ul"},"Stamp with variable radius 2"))),(0,o.kt)("li",{parentName:"ul"},"An interleave")),(0,o.kt)("h2",{id:"future-contents"},"Future Contents"),(0,o.kt)("h3",{id:"airbrush"},"Airbrush"),(0,o.kt)(r.ij,{uniforms:r.en,mdxType:"ArticulatedLine2D"}),(0,o.kt)("p",null,'Airbrush is a special type of stamp brush.\nHere I\'m demonstrating a "continuous airbrush", which is mathematically continuous and needs a little bit of calculus to develop.\nYou will learn how to generalize a stamp brush into a continuous form.'),(0,o.kt)("h3",{id:"stamp-density-and-ratio-distance"},'Stamp density and "ratio-distance"'),(0,o.kt)("div",{className:"row row--no-gutters margin-left--xs"},(0,o.kt)("div",{className:"col col--6"},(0,o.kt)(r.ij,{uniforms:r.Sw,mdxType:"ArticulatedLine2D"}),(0,o.kt)("center",null,(0,o.kt)("em",null," Adjacent Dots "))),(0,o.kt)("div",{className:"col col--6"},(0,o.kt)(r.ij,{uniforms:r.rL,mdxType:"ArticulatedLine2D"}),(0,o.kt)("center",null,(0,o.kt)("em",null," Adjacent with one dot interleaved ")))),(0,o.kt)("br",null),(0,o.kt)("p",null,"You can see dots are adjacent to each other instead of equidistantly distributed.\nThe pattern is achieved by setting the intervals between dots proportional to their radii.\nYou will learn how to freely control stamp density along a stamp\nstroke. Very important for a serious project."),(0,o.kt)("h3",{id:"3d-stroke"},"3D stroke"),(0,o.kt)("p",null,"Learn how to extend the algorithms to 3D space."),(0,o.kt)("p",null,"I'm integrating it into the Blender Grease Pencil:"),(0,o.kt)("iframe",{width:"100%",height:"500",src:"https://www.youtube.com/embed/Q7_3IhgHOZM?start=30",title:"Blender Grease Pencil Stamp Brush Demo",allow:"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",allowFullScreen:!0}))}m.isMDXComponent=!0},3618:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>a});const a={plain:{color:"#F8F8F2",backgroundColor:"#282A36"},styles:[{types:["prolog","constant","builtin"],style:{color:"rgb(189, 147, 249)"}},{types:["inserted","function"],style:{color:"rgb(80, 250, 123)"}},{types:["deleted"],style:{color:"rgb(255, 85, 85)"}},{types:["changed"],style:{color:"rgb(255, 184, 108)"}},{types:["punctuation","symbol"],style:{color:"rgb(248, 248, 242)"}},{types:["string","char","tag","selector"],style:{color:"rgb(255, 121, 198)"}},{types:["keyword","variable"],style:{color:"rgb(189, 147, 249)",fontStyle:"italic"}},{types:["comment"],style:{color:"rgb(98, 114, 164)"}},{types:["attr-name"],style:{color:"rgb(241, 250, 140)"}}]}},7694:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>a});const a={plain:{color:"#393A34",backgroundColor:"#f6f8fa"},styles:[{types:["comment","prolog","doctype","cdata"],style:{color:"#999988",fontStyle:"italic"}},{types:["namespace"],style:{opacity:.7}},{types:["string","attr-value"],style:{color:"#e3116c"}},{types:["punctuation","operator"],style:{color:"#393A34"}},{types:["entity","url","symbol","number","boolean","variable","constant","property","regex","inserted"],style:{color:"#36acaa"}},{types:["atrule","keyword","attr-name","selector"],style:{color:"#00a4db"}},{types:["function","deleted","tag"],style:{color:"#d73a49"}},{types:["function-variable"],style:{color:"#6f42c1"}},{types:["tag","selector","keyword"],style:{color:"#00009f"}}]}}}]);