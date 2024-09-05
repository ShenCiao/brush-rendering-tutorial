const sinewaveString =`
const maxRadius = 1/3;
const edgeCount = 32;
const intervalRatio = 0.7; // The eta value

const position = [];
const radius = [];
const index = []; // The stamp indices (n values)

const gr = (1 + Math.sqrt(5)) / 2; // golden ratio
const pi = Math.PI;

for(let i = 0; i <= edgeCount; ++i){
  let a = i / edgeCount
  let x =  -pi + (2 * pi * a); // range from pi to -pi
  let y = Math.sin(x) / gr;
  let r = Math.cos(x / 2.0) * maxRadius + 1e-10;

  position.push(x, y);
  radius.push(r);
}

// Prefix sum on the n(L) values in formula (3)
index.push(0.0)
for(let i = 0; i < edgeCount; ++i){
  let L = Math.hypot(position[2*i+2] - position[2*i], position[2*i+3] - position[2*i+1])
  let r0 = radius[i], r1 = radius[i+1]
  let n = L/intervalRatio/(r0-r1) * Math.log(r0/r1)
  index.push(n+index.at(-1))
}
return [position, radius, index, intervalRatio];
`

export default sinewaveString;