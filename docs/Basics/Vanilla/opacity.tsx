import React from "react";

import { Stroke } from "@site/src/components/Stroke";
import geomCode from "@site/src/components/sinewaveGeometry"
import vsCode from './uni.vert'
import fsCode from './opacity.frag'

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