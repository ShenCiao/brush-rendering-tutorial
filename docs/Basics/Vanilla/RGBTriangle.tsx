import React from "react";
import * as THREE from "three";
import { Stroke } from "@site/src/components/Stroke";
import vsCode from "./RGBTriangle.vert";
import fsCode from "./RGBTriangle.frag";

function RGBTriangleGeometry() {
  let position = [
    0.0,
    1.0,
    -Math.sqrt(3) / 2,
    -1 / 2,
    Math.sqrt(3) / 2,
    -1 / 2,
  ];
  position.push(position[0], position[1]);
  const color = [1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0];
  color.push(...color.slice(0, 3));

  const position0 = [...position];
  const position1 = [...position.slice(2)];
  const color0 = [...color];
  const color1 = [...color.slice(3)];

  const geometry = new THREE.BufferGeometry();
  geometry.setIndex([0, 1, 2, 2, 3, 0]);
  geometry.setAttribute(
    "position0",
    new THREE.InstancedBufferAttribute(new Float32Array(position0), 2),
  );
  geometry.setAttribute(
    "position1",
    new THREE.InstancedBufferAttribute(new Float32Array(position1), 2),
  );
  geometry.setAttribute(
    "color0",
    new THREE.InstancedBufferAttribute(new Float32Array(color0), 3),
  );
  geometry.setAttribute(
    "color1",
    new THREE.InstancedBufferAttribute(new Float32Array(color1), 3),
  );

  return geometry;
}

export default function RGBTriangle() {
  return (
    <Stroke
      geometry={RGBTriangleGeometry()}
      vertexShader={vsCode}
      fragmentShader={fsCode}
      showEditor={[false, true, true]}
    />
  );
}
