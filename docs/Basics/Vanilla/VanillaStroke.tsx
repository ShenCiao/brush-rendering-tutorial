import React from "react";

import { Stroke } from "@site/src/components/Stroke";
import geomCode from "@site/src/components/sinewaveGeometry"
import vsCode from './VanillaStroke.vert'
import fsCode from './VanillaStroke.frag'

export default function (showEditor = false) {
  return (
    <Stroke
      geometry={geomCode}
      vertexShader={vsCode}
      fragmentShader={fsCode}
      showEditor={false}
    />
  );
}