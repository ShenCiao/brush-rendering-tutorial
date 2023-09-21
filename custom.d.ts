// Why '*.(vert|frag)' doesn't work?
declare module '*.vert' {
  let content: string;
  export default content;
}

declare module '*.frag' {
  const content: string;
  export default content;
}

declare module '*.txt' {
  const content: string;
  export default content;
}

declare module '*.glsl' {
  const content: string;
  export default content;
}