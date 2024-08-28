"use strict";(self.webpackChunkbrush_stroke_tutorial=self.webpackChunkbrush_stroke_tutorial||[]).push([[325],{4232:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>a,default:()=>h,frontMatter:()=>i,metadata:()=>l,toc:()=>c});var o=n(4848),r=n(8453);const i={title:"Pre-introduction to Vector Fill",sidebar_label:"Vector Fill"},a=void 0,l={id:"Appendix/Vector-fill/Vector-fill",title:"Pre-introduction to Vector Fill",description:"You may have learned how to render brush strokes on polyline curves.",source:"@site/docs/Appendix/Vector-fill/Vector-fill.mdx",sourceDirName:"Appendix/Vector-fill",slug:"/Appendix/Vector-fill/",permalink:"/brush-rendering-tutorial/Appendix/Vector-fill/",draft:!1,unlisted:!1,editUrl:"https://github.com/ShenCiao/brush-rendering-tutorial/tree/main/docs/Appendix/Vector-fill/Vector-fill.mdx",tags:[],version:"current",frontMatter:{title:"Pre-introduction to Vector Fill",sidebar_label:"Vector Fill"},sidebar:"tutorialSidebar",previous:{title:"Appendix",permalink:"/brush-rendering-tutorial/category/appendix"},next:{title:"\u2192 I'm applying for a PhD",permalink:"/brush-rendering-tutorial/About/"}},s={},c=[];function d(e){const t={a:"a",em:"em",img:"img",p:"p",...(0,r.R)(),...e.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(t.p,{children:"You may have learned how to render brush strokes on polyline curves.\nIf you want to develop a basic paint program like what I did, the next logical step is to learn how to fill color."}),"\n",(0,o.jsx)(t.p,{children:(0,o.jsx)(t.img,{alt:"VectorFill",src:n(834).A+"",width:"600",height:"338"})}),"\n",(0,o.jsx)(t.p,{children:(0,o.jsx)(t.em,{children:"Vector fill demo"})}),"\n",(0,o.jsxs)(t.p,{children:["We've found that filling color is precisely the ",(0,o.jsx)(t.em,{children:"2D Arrangement"})," and ",(0,o.jsx)(t.em,{children:"Point Location"})," problem in computational geometry (plus rendering a polygon).\nBasically, all textbooks about computational geometry cover these problems and the corresponding algorithms to solve them.\nIt's very straightforward how to apply once you've learned about them.\nBut before you delve into the intricate details in a textbook, I will offer a brief overview to provide a general understanding."]}),"\n",(0,o.jsx)(t.p,{children:"We are given a set of 2D polylines (our vector drawings) and a query point,\nthe problem is to find the region enclosed by polylines and contains the query point.\nTo achieve this, we need to first construct a 2D arrangement object whose official definition is:\nA subdivision of the plane induced by the curves into vertices, edges, and faces,\nwhich is typically stored in a doubly-connected edge list (DCEL) data structure."}),"\n",(0,o.jsx)(t.p,{children:(0,o.jsx)(t.img,{alt:"Arrangement2D",src:n(7716).A+"",width:"498",height:"474"})}),"\n",(0,o.jsx)(t.p,{children:"Hopefully, it sounds familiar and reminds you of the data structure to store a 3D mesh.\nIn fact, a naive 2D arrangement is nothing more than a 2D polygon mesh (or meshes).\nAnd to locate a query point, a native solution is to iterate through all faces from the mesh and test if the query point is inside."}),"\n",(0,o.jsxs)(t.p,{children:["From an introductory-level textbook, you will learn how to construct a polygon mesh (the arrangement object) from line segments and\nalgorithms to locate a point better than the naive solution.\nTo dive deeper, you may try using the ",(0,o.jsx)(t.a,{href:"https://doc.cgal.org/latest/Arrangement_on_surface_2/index.html",children:"CGAL 2D arrangement library"}),"\nand learn the arrangement constructed from 2D polylines, which is slightly different with a naive polygon mesh."]}),"\n",(0,o.jsx)(t.p,{children:'I hope this "2D mesh metaphor" will help you better understand the problems.'})]})}function h(e={}){const{wrapper:t}={...(0,r.R)(),...e.components};return t?(0,o.jsx)(t,{...e,children:(0,o.jsx)(d,{...e})}):d(e)}},7716:(e,t,n)=>{n.d(t,{A:()=>o});const o=n.p+"assets/images/arrangement-86794167cb62dc6a7aca2d66f1df238b.png"},834:(e,t,n)=>{n.d(t,{A:()=>o});const o=n.p+"assets/images/vector-fill-2ba321a1cf94bd33c981827270373824.gif"},8453:(e,t,n)=>{n.d(t,{R:()=>a,x:()=>l});var o=n(6540);const r={},i=o.createContext(r);function a(e){const t=o.useContext(i);return o.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function l(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:a(e.components),o.createElement(i.Provider,{value:t},e.children)}}}]);