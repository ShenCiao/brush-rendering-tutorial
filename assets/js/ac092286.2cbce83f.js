"use strict";(self.webpackChunkbrush_stroke_tutorial=self.webpackChunkbrush_stroke_tutorial||[]).push([[364],{3905:(e,t,r)=>{r.d(t,{Zo:()=>p,kt:()=>m});var n=r(7294);function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){i(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function s(e,t){if(null==e)return{};var r,n,i=function(e,t){if(null==e)return{};var r,n,i={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(i[r]=e[r]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}var l=n.createContext({}),u=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},p=function(e){var t=u(e.components);return n.createElement(l.Provider,{value:t},e.children)},c="mdxType",h={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var r=e.components,i=e.mdxType,a=e.originalType,l=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),c=u(r),d=i,m=c["".concat(l,".").concat(d)]||c[d]||h[d]||a;return r?n.createElement(m,o(o({ref:t},p),{},{components:r})):n.createElement(m,o({ref:t},p))}));function m(e,t){var r=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=r.length,o=new Array(a);o[0]=d;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s[c]="string"==typeof e?e:i,o[1]=s;for(var u=2;u<a;u++)o[u]=r[u];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"},154:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>l,contentTitle:()=>o,default:()=>h,frontMatter:()=>a,metadata:()=>s,toc:()=>u});var n=r(7462),i=(r(7294),r(3905));const a={title:"Introduction",sidebar_position:2},o=void 0,s={unversionedId:"Introduction/Introduction",id:"Introduction/Introduction",title:"Introduction",description:"This tutorial series will teach you how to use the modern GPU graphics pipeline to render brush strokes on vector curves.",source:"@site/docs/Introduction/Introduction.mdx",sourceDirName:"Introduction",slug:"/Introduction/",permalink:"/brush-stroke-tutorial/Introduction/",draft:!1,editUrl:"https://github.com/ShenCiao/brush-stroke-tutorial/tree/main/docs/Introduction/Introduction.mdx",tags:[],version:"current",sidebarPosition:2,frontMatter:{title:"Introduction",sidebar_position:2},sidebar:"tutorialSidebar",previous:{title:"Table of Contents",permalink:"/brush-stroke-tutorial/"},next:{title:"Basics",permalink:"/brush-stroke-tutorial/category/basics"}},l={},u=[{value:"Modern GPU",id:"modern-gpu",level:2},{value:"Brush strokes",id:"brush-strokes",level:2},{value:"Vector curves",id:"vector-curves",level:2},{value:"Structure",id:"structure",level:2},{value:"Citation",id:"citation",level:2}],p={toc:u},c="wrapper";function h(e){let{components:t,...a}=e;return(0,i.kt)(c,(0,n.Z)({},p,a,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"This tutorial series will teach you how to use the ",(0,i.kt)("strong",{parentName:"p"},"modern GPU")," graphics pipeline to render ",(0,i.kt)("strong",{parentName:"p"},"brush strokes")," on ",(0,i.kt)("strong",{parentName:"p"},"vector curves"),".\nThe contents mainly come from my research work ",(0,i.kt)("a",{parentName:"p",href:"https://github.com/ShenCiao/Ciallo"},"Ciallo: The next generation vector paint program"),".\nI will introduce this tutorial from the three aspects above."),(0,i.kt)("h2",{id:"modern-gpu"},"Modern GPU"),(0,i.kt)("p",null,(0,i.kt)("img",{alt:"sketchpad",src:r(8138).Z,width:"480",height:"360"})),(0,i.kt)("p",null,(0,i.kt)("em",{parentName:"p"},"Draw lines in Ivan Sutherland's Sketchpad.")),(0,i.kt)("p",null,"Drawing lines or rendering strokes is one of the oldest topics in Computer Graphics.\nYou can easily find a lot of pioneering works, for example, ",(0,i.kt)("a",{parentName:"p",href:"https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm"},"Bresenham's line algorithm"),".\nThey emerged from an era with certain conditions:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"Programs ran without the benefit of parallelization."),(0,i.kt)("li",{parentName:"ul"},"Programs could access framebuffer directly without significant performance penalty.")),(0,i.kt)("p",null,"But time has changed, now we have modern GPU hardware crafted for graphics and parallel computing,\nand directly accessing a GPU framebuffer from a CPU can significantly hurt the performance.\nSo old algorithms may not satisfy your needs for real-time rendering."),(0,i.kt)("p",null,"In this tutorial, you will learn about the brush stroke rendering (or brush rendering, stroke rendering for abbreviation)\nalgorithms designed for the GPU graphics pipeline.\nWe (I and my mentor ",(0,i.kt)("a",{parentName:"p",href:"https://www.liyiwei.org/"},"Liyi-Wei"),") name these algorithms as ",(0,i.kt)("em",{parentName:"p"},"Articulated")," in our paper (mainly because they look like drawing an articulated arm).\nI assume our readers are already familiar with a graphics API like OpenGL or D3D.\nThis tutorial will concentrate more on the high-level algorithms than the implementation details."),(0,i.kt)("p",null,"Although graphics APIs provide us line primitives, including ",(0,i.kt)("inlineCode",{parentName:"p"},"LINES"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"LINE_STRIP"),", and ",(0,i.kt)("inlineCode",{parentName:"p"},"LINE_LOOP"),",\nthere are several well-known issues when using these primitives directly.\nCheck out Matt Deslauries' article ",(0,i.kt)("a",{parentName:"p",href:"https://mattdesl.svbtle.com/drawing-lines-is-hard#line-primitives_1"},(0,i.kt)("em",{parentName:"a"},"Drawing Lines is Hard"))," if you know nothing about them.\nAs for the brush rendering, the most significant issue is the limitation on the maximum line width or stroke radius.\nWe must be able to fully control the radius values when rendering brush strokes."),(0,i.kt)("h2",{id:"brush-strokes"},"Brush strokes"),(0,i.kt)("p",null,"Brush strokes refer to strokes drawn with the paint tool in graphics software such as Photoshop or Krita.\nArtists configure their digital brushes to control stroke properties like radius or stylization,\nthen stroke on the canvas with dedicated input devices: Tablet and Stylus.\nIf you're unfamiliar with tablets and styluses, you can watch the video below for more information:"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"https://www.youtube.com/watch?app=desktop&v=83BRMfjJXIk"},(0,i.kt)("img",{parentName:"a",src:"https://img.youtube.com/vi/83BRMfjJXIk/maxresdefault.jpg",alt:"Tablet"}))),(0,i.kt)("p",null,"While you may recognize a brush stroke by its stylization, another crucial property could be ignored: the mutable (varying) radius along the stroke.\n(I ignored it in my paper too.)\nThe radii are typically generated from the pressure values as a stylus presses and moves on a tablet.\nFor experienced artists after installing a painting program, one of the highest priorities is to configure the mapping function from pen pressure to brush radius."),(0,i.kt)("p",null,'In this tutorial, you will learn to render a stroke with mutable radius, and the most popular way to stylize it called "Stamp."\nMore than 90 percent of brushes in popular paint software are the stamp brushes.\nAdditionally, GPU brush stroke rendering a newly emerged topic.\nResearchers will develop more novel methods in the future.\nSo I will continuously update this tutorial series to teach them.\nMake sure to star our ',(0,i.kt)("a",{parentName:"p",href:"https://github.com/ShenCiao/BrushStrokeTutorial"},"code repository")," for easy access to the latest updates."),(0,i.kt)("h2",{id:"vector-curves"},"Vector curves"),(0,i.kt)("p",null,"Mutable radius is imperative for the most artists working on digital painting,\nbut it's not defined in public vector standards like SVG.\nThis limitation is one of the primary reasons that lots of digital artists don't use vector workflow.\n(Another one is filling color.)"),(0,i.kt)("p",null,"To support the mutable radius, we will render a unique type of vector curve:\nAn ordered list of points (polyline) with radius values assigned to each point.\nAs a stylus is pressed and moved on a tablet, the program generate a sequence of points to record the trace of movement.\nAdditionally, the pen pressure is transformed into the radius value assigned to each point."),(0,i.kt)("p",null,"We can approximate any type of curve by increasing the number of points in a polyline, whether freehand-drawn or mathematically defined."),(0,i.kt)("h2",{id:"structure"},"Structure"),(0,i.kt)("p",null,"Although the algorithms are very straightforward, I know how hard it could be to learn and replicate a research work.\nThat's why I created this tutorial, designed with a smooth learning curve and providing seamless coding environments."),(0,i.kt)("p",null,"You should start with the Basic part, which covers the basics of the rendering methods.\nRemember to read the articles in the Basic part in its original order, or you may miss something important.\nNext, select your favorite topics to learn.\nI will list the extra prerequisites at the very beginning of each article."),(0,i.kt)("p",null,"Wish you happy learning!"),(0,i.kt)("h2",{id:"citation"},"Citation"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre"},"@inproceedings{Ciallo2023,\n    author = {Ciao, Shen and Wei, Li-Yi},\n    title = {Ciallo: The next-Generation Vector Paint Program},\n    year = {2023},\n    isbn = {9798400701436},\n    publisher = {Association for Computing Machinery},\n    address = {New York, NY, USA},\n    url = {https://doi.org/10.1145/3587421.3595418},\n    doi = {10.1145/3587421.3595418},\n    booktitle = {ACM SIGGRAPH 2023 Talks},\n    articleno = {67},\n    numpages = {2},\n    keywords = {Digital painting, stylized stroke, arrangement, vector graphics. coloring, graphics processing unit (GPU)},\n    location = {Los Angeles, CA, USA},\n    series = {SIGGRAPH '23}\n}\n")),(0,i.kt)("admonition",{title:"Research Tip",type:"note"},(0,i.kt)("p",{parentName:"admonition"},"To demonstrate your research work about brush rendering, select vector drawings have mutable radius or pen pressure data.\nRegular vector drawing datasets don't contain them."),(0,i.kt)("ul",{parentName:"admonition"},(0,i.kt)("li",{parentName:"ul"},"Zeyu Wang's work: ",(0,i.kt)("a",{parentName:"li",href:"https://dl.acm.org/doi/10.1145/3450626.3459819"},"Paper")," | ",(0,i.kt)("a",{parentName:"li",href:"https://github.com/zachzeyuwang/tracing-vs-freehand"},"Dataset")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"https://cloud.blender.org/p/gallery/5b642e25bf419c1042056fc6"},"Blender Grease Pencil")),(0,i.kt)("li",{parentName:"ul"},"Tell me more..."))))}h.isMDXComponent=!0},8138:(e,t,r)=>{r.d(t,{Z:()=>n});const n=r.p+"assets/images/sketchpad-be46fe81f29f99371fdce79d1452ae85.gif"}}]);