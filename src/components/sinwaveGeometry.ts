const sinewaveString =
`const n = 32;
const maxRadius = 1/3;

const position = [];
const radius = [];

const gr = (1 + Math.sqrt(5)) / 2; // golden ratio
const pi = Math.PI;

for(let i = 0; i <= n; ++i){
  let a = i / n;
  let x =  -pi + (2 * pi * a);
  let y = Math.sin(x) / gr;
  let r = Math.cos(x / 2.0) * maxRadius;

  position.push(x, y);
  radius.push(r);
}

return [position, radius];
`

export default sinewaveString;