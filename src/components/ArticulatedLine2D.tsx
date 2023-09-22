import React, { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
// @ts-ignore
import { MapControls } from "three/examples/jsm/controls/MapControls.js";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import Editor from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { GlslEditor } from "@site/src/components/GlslEditor";

import geometryCode from "./sinwaveGeometry";
import vertexShaderCode from "./shaders/ArticulatedLine2D.vert";
import fragmentShaderCode from "./shaders/ArticulatedLine2D.frag";
import docusaurusConfig from "@site/docusaurus.config";

export enum BrushType {
  Vanilla,
  Stamp,
  Airbrush,
}

export function ArticulatedLine2D({ uniforms = null }) {
  const canvasContainerRef = useRef<HTMLDivElement>();
  const renderSceneFnRef = useRef<Function>();
  const meshRef = useRef<THREE.InstancedMesh>();

  useEffect(() => {
    // Being in doubt when setting parameters? Use golden ratio!
    const gr = (1 + Math.sqrt(5)) / 2;
    const canvasWidth = canvasContainerRef.current.clientWidth;
    const canvasHeight = canvasWidth * (0.5 / gr);

    const worldWidth = 4 * gr;
    const worldHeight = worldWidth * (0.5 / gr);
    const camera = new THREE.OrthographicCamera(
      worldWidth / -2,
      worldWidth / 2,
      worldHeight / 2,
      worldHeight / -2,
      -1000,
      1000,
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(new THREE.Color(1.0, 1.0, 1.0), 0.0);
    renderer.setSize(canvasWidth, canvasHeight);
    window.addEventListener("resize", () => {
      const canvasWidth = canvasContainerRef.current.clientWidth;
      const canvasHeight = canvasWidth * (0.5 / gr);
      renderer.setSize(canvasWidth, canvasHeight); // Update size
    });
    canvasContainerRef.current.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const controls = new MapControls(camera, renderer.domElement);
    controls.enableRotate = false;
    controls.enableDamping = false;
    controls.screenSpacePanning = true;
    controls.addEventListener("change", () => {
      renderer.render(scene, camera);
    });

    const trapezoidGeometry = new THREE.BufferGeometry();
    const indices = [0, 1, 2, 2, 3, 0];
    trapezoidGeometry.setIndex(indices);
    const getGeom = new Function(geometryCode);
    const [position, radius] = getGeom();

    updateGeometry(trapezoidGeometry, position, radius);

    const defaultUniforms = {
      // common
      type: { value: BrushType.Vanilla },
      color: { value: [0.0, 0.0, 0.0, 1.0] },
      // Stamp
      footprint: { value: new THREE.Texture() },
      stampIntervalRatio: { value: 1.0 },
      noiseFactor: { value: 0.0 },
      rotationFactor: { value: 0.0 },
      // Airbrush
      gradient: { value: new THREE.DataTexture() },
    };

    const material = new THREE.RawShaderMaterial({
      uniforms: uniforms ? uniforms : defaultUniforms,
      vertexShader: vertexShaderCode,
      fragmentShader: fragmentShaderCode,
      side: THREE.DoubleSide,
      transparent: true,
      glslVersion: THREE.GLSL3,
    });

    meshRef.current = new THREE.InstancedMesh(
      trapezoidGeometry,
      material,
      position.length - 1,
    );
    meshRef.current.frustumCulled = false;
    scene.add(meshRef.current);

    renderSceneFnRef.current = () => controls.dispatchEvent({ type: "change" });
    renderSceneFnRef.current();

    return () => {
      renderer.dispose();
      // canvasContainerRef.current.removeChild(renderer.domElement);
    };
  }, []);

  function updateGeometry(
    geometry: THREE.BufferGeometry,
    position: number[],
    radius: number[],
  ) {
    const position0 = [...position];
    const position1 = [...position.slice(2)];
    const radius0 = [...radius];
    const radius1 = [...radius.slice(1)];
    geometry.setAttribute(
      "position0",
      new THREE.InstancedBufferAttribute(new Float32Array(position0), 2),
    );
    geometry.setAttribute(
      "radius0",
      new THREE.InstancedBufferAttribute(new Float32Array(radius0), 1),
    );
    geometry.setAttribute(
      "position1",
      new THREE.InstancedBufferAttribute(new Float32Array(position1), 2),
    );
    geometry.setAttribute(
      "radius1",
      new THREE.InstancedBufferAttribute(new Float32Array(radius1), 1),
    );
    //TODO: Compute the length ratio
  }

  function updateMaterial(vert: string, frag: string) {
    const material = meshRef.current.material as THREE.RawShaderMaterial;
    if (vert) {
      material.vertexShader = vert;
    }
    if (frag) {
      material.fragmentShader = frag;
    }
    material.needsUpdate = true;
    renderSceneFnRef.current();
  }

  const onJsEditorChange = useCallback(
    (value: string | undefined, ev: editor.IModelContentChangedEvent) => {
      let position: number[] = [];
      let radius: number[] = [];
      try {
        const getGeom = new Function(value);
        [position, radius] = getGeom();
      } catch (e) {
        console.log(e.toString());
        return;
      }

      function isArrayOfNumbers(value) {
        if (Array.isArray(value)) {
          for (let i = 0; i < value.length; i++) {
            if (typeof value[i] !== "number") {
              return false; // If one of the elements of the array is not a number, return false
            }
          }
          return true;
        }
        return false;
      }

      if (!isArrayOfNumbers(position) || !isArrayOfNumbers(radius)) {
        console.log("return value is not correct");
        return;
      }
      if (position.length != radius.length * 2) {
        console.log("return value is not correct");
        return;
      }

      updateGeometry(meshRef.current.geometry, position, radius);
      meshRef.current.count = position.length - 1;
      renderSceneFnRef.current();
    },
    [],
  );

  const editorHeight = "80vh";

  return (
    <>
      <Tabs>
        <TabItem value="geometry.js">
          <Editor
            height={editorHeight}
            defaultLanguage="javascript"
            defaultValue={geometryCode}
            onChange={onJsEditorChange}
          />
        </TabItem>
        <TabItem value="vertex.glsl">
          <GlslEditor
            height={editorHeight}
            defaultValue={vertexShaderCode}
            onChange={(value) => {
              updateMaterial(value, "");
            }}
          />
        </TabItem>
        <TabItem value="fragment.glsl">
          <GlslEditor
            height={editorHeight}
            defaultValue={fragmentShaderCode}
            onChange={(value) => {
              updateMaterial("", value);
            }}
          />
        </TabItem>
      </Tabs>
      <div
        ref={canvasContainerRef}
        style={{ width: "100%" }}
        onMouseDown={(e) => e.preventDefault()}
      />
    </>
  );
}

export const pencilBrushUniforms = {
  type: { value: BrushType.Stamp },
  color: { value: [0.0, 0.0, 0.0, 1.0] },
  footprint: {
    type: 't',
    value: new THREE.TextureLoader().load(
      `/${docusaurusConfig.projectName}/img/stamp2.png`,
      (texture) => {
        console.log("Texture is loaded");
      },
      undefined,
      (e: Event) => {
        console.log("Texture Load Error: " + e.target);
      },
    ),
  },
  stampIntervalRatio: { value: 0.4 },
  noiseFactor: { value: 1.2 },
  rotationFactor: { value: 0.75 },
};
