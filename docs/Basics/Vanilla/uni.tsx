import React from "react";

import { Stroke } from "@site/src/components/Stroke";
import geomCode from "@site/src/components/trapezoidGeometry"
import vsCode from './uni.vert'
import fsCode from './uni.frag'

export default function ({showEditor = [false, false, false]}) {
  return (
    <Stroke
      geometry={geomCode}
      vertexShader={vsCode}
      fragmentShader={fsCode}
      showEditor={showEditor}
    />
  );
}