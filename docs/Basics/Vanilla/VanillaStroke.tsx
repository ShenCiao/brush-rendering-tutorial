import React from "react";

import { Stroke } from "@site/src/components/Stroke";
import geomCode from "@site/src/components/sinewaveGeometry"
import vertCode from './VanillaStroke.vert'
import fragCode from './VanillaStroke.frag'

export default function () {
  return (
    <Stroke
      geometry={geomCode}
      vertexShader={vertCode}
      fragmentShader={fragCode}
      showEditor={[false, true, true]}
    />
  );
}
