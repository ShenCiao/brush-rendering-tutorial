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
import vertexShaderCode from './shaders/ArticulatedLine2D.vert';
import fragmentShaderCode from './shaders/ArticulatedLine2D.frag';

export function ArticulatedLine2D() {
  const canvasContainerRef = useRef<HTMLDivElement>();
  const materialRef = useRef<THREE.MeshBasicMaterial>();
  const renderSceneFnRef = useRef<Function>();
  const meshRef = useRef<THREE.InstancedMesh>();

  useEffect(() => {
    // In doubt when setting parameters? Use golden ratio!
    const gr = (1 + Math.sqrt(5)) / 2, pi = Math.PI;
    const canvasWidth = canvasContainerRef.current.clientWidth;
    const canvasHeight = canvasWidth * (0.5/gr);

    const worldWidth = 4*gr;
    const worldHeight = worldWidth * (0.5/gr);
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
      premultipliedAlpha:false,
    });
    renderer.setSize(canvasWidth, canvasHeight);
    window.addEventListener("resize", () => {
      const canvasWidth = canvasContainerRef.current.clientWidth;
      const canvasHeight = canvasWidth * (0.5/gr);
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
    const indices = [
      0, 1, 2,
      2, 3, 0,
    ];
    trapezoidGeometry.setIndex(indices);
    const getGeom = new Function(geometryCode);
    const [position, radius]: [number[], number[]] = getGeom();
    const position0 = [...position], position1 = [...position.slice(2)];
    const radius0 = [...radius], radius1 = [...radius.slice(1)];

    trapezoidGeometry.setAttribute("position0", new THREE.InstancedBufferAttribute(new Float32Array(position0), 2));
    trapezoidGeometry.setAttribute("radius0", new THREE.InstancedBufferAttribute(new Float32Array(radius0), 1));
    trapezoidGeometry.setAttribute("position1", new THREE.InstancedBufferAttribute(new Float32Array(position1), 2));
    trapezoidGeometry.setAttribute("radius1", new THREE.InstancedBufferAttribute(new Float32Array(radius1), 1));

    const material = new THREE.RawShaderMaterial({
      vertexShader: vertexShaderCode,
      fragmentShader: fragmentShaderCode,
      side: THREE.DoubleSide,
      transparent: true,
      glslVersion: THREE.GLSL3
    });
    meshRef.current = new THREE.InstancedMesh(trapezoidGeometry, material, radius1.length,);
    meshRef.current.frustumCulled = false;
    scene.add(meshRef.current);

    renderSceneFnRef.current = () => controls.dispatchEvent({ type: "change" });
    renderSceneFnRef.current();
    //
    return () => {
      renderer.dispose();
      // canvasContainerRef.current.removeChild(renderer.domElement);
    };
  }, []);

  const onEditorChange = useCallback(
    (value: String | undefined, ev: editor.IModelContentChangedEvent) => {
      console.log(value);
    },
    [],
  );

  return (
    <>
      <Tabs>
        <TabItem value="geometry">
          <Editor
            height="30vh"
            defaultLanguage="javascript"
            defaultValue={geometryCode}
            onChange={onEditorChange}
          />
        </TabItem>
        <TabItem value="vertex">
          <GlslEditor height="30vh" defaultValue={"uniform int x;"} />
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
