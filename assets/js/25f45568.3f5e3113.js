"use strict";(self.webpackChunkbrush_stroke_tutorial=self.webpackChunkbrush_stroke_tutorial||[]).push([[210],{5982:(e,s,t)=>{t.r(s),t.d(s,{assets:()=>l,contentTitle:()=>i,default:()=>m,frontMatter:()=>r,metadata:()=>o,toc:()=>h});var a=t(4848),n=t(8453);const r={sidebar_position:4,sidebar_label:"Proportional Interval Stamp",title:"Proportional Interval Stamp"},i=void 0,o={id:"Proportional-Interval-Stamp/Proportional-Interval-Stamp",title:"Proportional Interval Stamp",description:"This content is under construction and not peer-reviewed. Learn it under your own risk!",source:"@site/docs/Proportional-Interval-Stamp/Proportional-Interval-Stamp.mdx",sourceDirName:"Proportional-Interval-Stamp",slug:"/Proportional-Interval-Stamp/",permalink:"/brush-rendering-tutorial/Proportional-Interval-Stamp/",draft:!1,unlisted:!1,editUrl:"https://github.com/ShenCiao/brush-rendering-tutorial/tree/main/docs/Proportional-Interval-Stamp/Proportional-Interval-Stamp.mdx",tags:[],version:"current",sidebarPosition:4,frontMatter:{sidebar_position:4,sidebar_label:"Proportional Interval Stamp",title:"Proportional Interval Stamp"},sidebar:"tutorialSidebar",previous:{title:"Stamp",permalink:"/brush-rendering-tutorial/Basics/Stamp/"},next:{title:"Airbrush",permalink:"/brush-rendering-tutorial/Airbrush/"}},l={},h=[{value:"Introduction to stamp patterns",id:"introduction-to-stamp-patterns",level:2},{value:"Fixed interval",id:"fixed-interval",level:3},{value:"Proportional interval",id:"proportional-interval",level:3}];function c(e){const s={a:"a",admonition:"admonition",annotation:"annotation",blockquote:"blockquote",code:"code",h2:"h2",h3:"h3",img:"img",math:"math",mfrac:"mfrac",mi:"mi",mo:"mo",mrow:"mrow",p:"p",pre:"pre",semantics:"semantics",span:"span",strong:"strong",...(0,n.R)(),...e.components},{Details:r}=s;return r||function(e,s){throw new Error("Expected "+(s?"component":"object")+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}("Details",!0),(0,a.jsxs)(a.Fragment,{children:[(0,a.jsxs)(s.admonition,{type:"warning",children:[(0,a.jsx)(s.p,{children:"This content is under construction and not peer-reviewed. Learn it under your own risk!"}),(0,a.jsxs)(r,{children:[(0,a.jsx)("summary",{children:"I'm kidding!"}),(0,a.jsx)(s.p,{children:"There\u2019s no risk in learning something incorrectly.\nI'm 100% sure that all the theories are logically correct."}),(0,a.jsx)(s.p,{children:"The only risk is that I might change the terminology or math symbols to use.\nHopefully this won't confuse you in the future."})]})]}),"\n",(0,a.jsx)(s.h2,{id:"introduction-to-stamp-patterns",children:"Introduction to stamp patterns"}),"\n",(0,a.jsx)(s.h3,{id:"fixed-interval",children:"Fixed interval"}),"\n",(0,a.jsxs)(s.p,{children:["In the ",(0,a.jsx)(s.a,{href:"../Basics/Stamp",children:"Stamp"})," section, I introduced stamp brush and methods to render it.\nWe assumed the interval between stamp is a fixed value along a stroke."]}),"\n",(0,a.jsxs)(s.blockquote,{children:["\n",(0,a.jsxs)(s.p,{children:["While a user paints on a canvas, we render the texture onto the canvas ",(0,a.jsx)(s.strong,{children:"equidistantly"})," along the drawing trace.\nWhen the textures are close enough, they seem continuous and form a stroke."]}),"\n"]}),"\n",(0,a.jsx)(s.p,{children:'But this "fixed interval" pattern is not always the case in practice and may cause a potential rendering problem.\nLet\'s take a look at this problem.'}),"\n",(0,a.jsx)(s.p,{children:"Assume we draw two strokes on a canvas.\nThe first is a stamp stroke with dot footprint, and the second is a basic solid stroke, as the figure below shows.\nI want to copy the first stroke's brush and apply the brush to the second stroke."}),"\n",(0,a.jsx)(s.p,{children:(0,a.jsx)(s.img,{alt:"copy",src:t(435).A+"",width:"1024",height:"628"})}),"\n",(0,a.jsx)(s.p,{children:"You may notice the resulting stroke has denser dots and appearance.\nThis is because the interval between stamps in the first stroke is equal to the radius of each dot.\nIn contrast, the interval in the resulting stroke is smaller than its radius.\nSo, the result stroke's dots are aligned more densely than those in the first stroke."}),"\n",(0,a.jsx)(s.p,{children:'As we change the stroke radius, the interval between the dots has not been adjusted accordingly.\nThe change in interval leads to the change in appearance.\nThis is unintuitive since artists expect the concept of "brush" controls the stroke appearance.\nCopying and pasting a brush imply the source and target stroke have the same appearance.'}),"\n",(0,a.jsx)(s.p,{children:"Expect for copying brush, the issue also happens when resizing a stroke.\nFor example, imagine a case that we export vector drawings from a paint program to a game engine.\nWhen rendering the drawings,\nthe game engine may need to scale the strokes' position and radius to translate them from local space to world space.\nUnluckily, a careless programmer like me forgets to scale the stamp interval accordingly.\nIn the worst case, the interval is larger than the length of strokes.\nSo, nothing shows the canvas and I would spend a whole day to debug it."}),"\n",(0,a.jsxs)(s.p,{children:["To avoid the issue, we rarely use a fixed length value as a brush parameter for artist to adjust.\nInstead, we make the stamp interval be proportional to the stroke radius,\nand use their ratio as the brush parameter.\nHere, I call this value ",(0,a.jsx)(s.strong,{children:"interval ratio"}),", and denote it with the symbol ",(0,a.jsxs)(s.span,{className:"katex",children:[(0,a.jsx)(s.span,{className:"katex-mathml",children:(0,a.jsx)(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:(0,a.jsxs)(s.semantics,{children:[(0,a.jsx)(s.mrow,{children:(0,a.jsx)(s.mi,{children:"\u03b7"})}),(0,a.jsx)(s.annotation,{encoding:"application/x-tex",children:"\\eta"})]})})}),(0,a.jsx)(s.span,{className:"katex-html","aria-hidden":"true",children:(0,a.jsxs)(s.span,{className:"base",children:[(0,a.jsx)(s.span,{className:"strut",style:{height:"0.625em",verticalAlign:"-0.1944em"}}),(0,a.jsx)(s.span,{className:"mord mathnormal",style:{marginRight:"0.03588em"},children:"\u03b7"})]})})]}),"."]}),"\n",(0,a.jsx)(s.span,{className:"katex-display",children:(0,a.jsxs)(s.span,{className:"katex",children:[(0,a.jsx)(s.span,{className:"katex-mathml",children:(0,a.jsx)(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",display:"block",children:(0,a.jsxs)(s.semantics,{children:[(0,a.jsxs)(s.mrow,{children:[(0,a.jsx)(s.mi,{children:"\u03b7"}),(0,a.jsx)(s.mo,{children:"="}),(0,a.jsxs)(s.mfrac,{children:[(0,a.jsxs)(s.mrow,{children:[(0,a.jsx)(s.mi,{children:"I"}),(0,a.jsx)(s.mi,{children:"n"}),(0,a.jsx)(s.mi,{children:"t"}),(0,a.jsx)(s.mi,{children:"e"}),(0,a.jsx)(s.mi,{children:"r"}),(0,a.jsx)(s.mi,{children:"v"}),(0,a.jsx)(s.mi,{children:"a"}),(0,a.jsx)(s.mi,{children:"l"})]}),(0,a.jsxs)(s.mrow,{children:[(0,a.jsx)(s.mi,{children:"R"}),(0,a.jsx)(s.mi,{children:"a"}),(0,a.jsx)(s.mi,{children:"d"}),(0,a.jsx)(s.mi,{children:"i"}),(0,a.jsx)(s.mi,{children:"u"}),(0,a.jsx)(s.mi,{children:"s"})]})]})]}),(0,a.jsx)(s.annotation,{encoding:"application/x-tex",children:"\\eta = \\frac{Interval}{Radius}"})]})})}),(0,a.jsxs)(s.span,{className:"katex-html","aria-hidden":"true",children:[(0,a.jsxs)(s.span,{className:"base",children:[(0,a.jsx)(s.span,{className:"strut",style:{height:"0.625em",verticalAlign:"-0.1944em"}}),(0,a.jsx)(s.span,{className:"mord mathnormal",style:{marginRight:"0.03588em"},children:"\u03b7"}),(0,a.jsx)(s.span,{className:"mspace",style:{marginRight:"0.2778em"}}),(0,a.jsx)(s.span,{className:"mrel",children:"="}),(0,a.jsx)(s.span,{className:"mspace",style:{marginRight:"0.2778em"}})]}),(0,a.jsxs)(s.span,{className:"base",children:[(0,a.jsx)(s.span,{className:"strut",style:{height:"2.0574em",verticalAlign:"-0.686em"}}),(0,a.jsxs)(s.span,{className:"mord",children:[(0,a.jsx)(s.span,{className:"mopen nulldelimiter"}),(0,a.jsx)(s.span,{className:"mfrac",children:(0,a.jsxs)(s.span,{className:"vlist-t vlist-t2",children:[(0,a.jsxs)(s.span,{className:"vlist-r",children:[(0,a.jsxs)(s.span,{className:"vlist",style:{height:"1.3714em"},children:[(0,a.jsxs)(s.span,{style:{top:"-2.314em"},children:[(0,a.jsx)(s.span,{className:"pstrut",style:{height:"3em"}}),(0,a.jsxs)(s.span,{className:"mord",children:[(0,a.jsx)(s.span,{className:"mord mathnormal",style:{marginRight:"0.00773em"},children:"R"}),(0,a.jsx)(s.span,{className:"mord mathnormal",children:"a"}),(0,a.jsx)(s.span,{className:"mord mathnormal",children:"d"}),(0,a.jsx)(s.span,{className:"mord mathnormal",children:"i"}),(0,a.jsx)(s.span,{className:"mord mathnormal",children:"u"}),(0,a.jsx)(s.span,{className:"mord mathnormal",children:"s"})]})]}),(0,a.jsxs)(s.span,{style:{top:"-3.23em"},children:[(0,a.jsx)(s.span,{className:"pstrut",style:{height:"3em"}}),(0,a.jsx)(s.span,{className:"frac-line",style:{borderBottomWidth:"0.04em"}})]}),(0,a.jsxs)(s.span,{style:{top:"-3.677em"},children:[(0,a.jsx)(s.span,{className:"pstrut",style:{height:"3em"}}),(0,a.jsxs)(s.span,{className:"mord",children:[(0,a.jsx)(s.span,{className:"mord mathnormal",style:{marginRight:"0.07847em"},children:"I"}),(0,a.jsx)(s.span,{className:"mord mathnormal",children:"n"}),(0,a.jsx)(s.span,{className:"mord mathnormal",children:"t"}),(0,a.jsx)(s.span,{className:"mord mathnormal",style:{marginRight:"0.02778em"},children:"er"}),(0,a.jsx)(s.span,{className:"mord mathnormal",style:{marginRight:"0.03588em"},children:"v"}),(0,a.jsx)(s.span,{className:"mord mathnormal",children:"a"}),(0,a.jsx)(s.span,{className:"mord mathnormal",style:{marginRight:"0.01968em"},children:"l"})]})]})]}),(0,a.jsx)(s.span,{className:"vlist-s",children:"\u200b"})]}),(0,a.jsx)(s.span,{className:"vlist-r",children:(0,a.jsx)(s.span,{className:"vlist",style:{height:"0.686em"},children:(0,a.jsx)(s.span,{})})})]})}),(0,a.jsx)(s.span,{className:"mclose nulldelimiter"})]})]})]})]})}),"\n",(0,a.jsx)(s.p,{children:"For a paint program on the market like Krita, you can definitely find this parameter in its brush editor.\nThe parameter might be half of the value as defined in our system, because the program uses width value rather than radius value."}),"\n",(0,a.jsx)(s.p,{children:(0,a.jsx)(s.img,{alt:"krita-interval",src:t(325).A+"",width:"1920",height:"1026"})}),"\n",(0,a.jsx)(s.p,{children:(0,a.jsx)(s.img,{alt:"krita-stroke",src:t(1250).A+"",width:"1576",height:"340"})}),"\n",(0,a.jsx)(s.p,{children:'The "spacing: 1.0" means the stamp interval is the stroke width, or 2x radius.\nSo the footprints connect to each other in a row, even though the stroke radius is changed.'}),"\n",(0,a.jsx)(s.p,{children:"To implement this feature with our GPU rendering method, I would set the interval ratio as a uniform in shader.\nIt is pretty straightforward as the pseudocode below shows."}),"\n",(0,a.jsx)(s.pre,{children:(0,a.jsx)(s.code,{className:"language-glsl",children:"// Get the `interval_ratio` value instead of `interval` from CPU.\nuniform float interval_ratio;\nfloat interval = interval_ratio * radius; // The stroke without variable width has only one radius value.\n// Everything else remains the same......\n"})}),"\n",(0,a.jsx)(s.p,{children:"However, things are tricky when rendering variable width strokes.\nWe have varying radius value, so which radius value should be used to calculate the interval?\nIn a paint program like Krita, user-specified brush size in the figure above is a prefect choice.\nBut we cannot easily get a user-specified radius value except in a paint program.\nThere is a better solution, we let the stamp interval vary together with the stroke radius."}),"\n",(0,a.jsx)(s.h3,{id:"proportional-interval",children:"Proportional interval"})]})}function m(e={}){const{wrapper:s}={...(0,n.R)(),...e.components};return s?(0,a.jsx)(s,{...e,children:(0,a.jsx)(c,{...e})}):c(e)}},325:(e,s,t)=>{t.d(s,{A:()=>a});const a=t.p+"assets/images/krita-interval-9c844a9a01f80895e0243268f598d3dc.png"},1250:(e,s,t)=>{t.d(s,{A:()=>a});const a=t.p+"assets/images/krita-stroke-e4c8aaf5ef1b5fd5bfeba928078ea015.png"},435:(e,s,t)=>{t.d(s,{A:()=>a});const a=t.p+"assets/images/wrong-copy-f679a0ab3c948b6be7564dd57b5f5c45.png"},8453:(e,s,t)=>{t.d(s,{R:()=>i,x:()=>o});var a=t(6540);const n={},r=a.createContext(n);function i(e){const s=a.useContext(r);return a.useMemo((function(){return"function"==typeof e?e(s):{...s,...e}}),[s,e])}function o(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(n):e.components||n:i(e.components),a.createElement(r.Provider,{value:s},e.children)}}}]);