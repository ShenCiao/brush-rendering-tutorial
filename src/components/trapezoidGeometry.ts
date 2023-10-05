// Generate sinewave geometry
const codeString = `const maxRadius = 1/3;
const segmentCount = 32;

const position = [-4.0, -1.0, -2.0, 1.0, 2.0, 1.0, 4.0, -1.0];
const radius = [maxRadius, maxRadius, maxRadius, maxRadius];

return [position, radius];
`

export default codeString;