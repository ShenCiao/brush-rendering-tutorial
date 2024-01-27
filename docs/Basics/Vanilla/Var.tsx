import { Stroke } from "@site/src/components/Stroke";
import geomCode from "@site/src/components/sinewaveGeometry";
import vsCode from "./var.vert";
import fsCode from "./var.frag";

export default function ({ showEditor = [false, false, false] }) {
  return (
    <Stroke
      geometry={geomCode}
      vertexShader={vsCode}
      fragmentShader={fsCode}
      showEditor={showEditor}
    />
  );
}
