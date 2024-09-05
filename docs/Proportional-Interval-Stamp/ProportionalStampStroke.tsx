import Stroke from "./Stroke";
import geomCode from "./proportionalIntervalGeometry";
import vsCode from "./stampProportional.vert";
import fsCode from "./stampProportional.frag";

export default function ({ showEditor = [true, true, true] }) {
  return (
    <Stroke
      geometry={geomCode}
      vertexShader={vsCode}
      fragmentShader={fsCode}
      showEditor={showEditor}
    />
  );
}