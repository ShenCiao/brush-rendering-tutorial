import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";

// @ts-ignore
import { MapControls } from "three/examples/jsm/controls/MapControls.js";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import Editor from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { GlslEditor } from "@site/src/components/GlslEditor";

import geometryCode from "./sinewaveGeometry";
import vertexShaderCode from "./shaders/ArticulatedLine2D.vert";
import fragmentShaderCode from "./shaders/ArticulatedLine2D.frag";
import docusaurusConfig from "@site/docusaurus.config.ts";

export enum BrushType {
  Vanilla,
  Stamp,
  Airbrush,
}

export function ArticulatedLine2D({ uniforms = null, showEditor = null }) {
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
    function resizeRenderer() {
      const canvasWidth = canvasContainerRef.current.clientWidth;
      const canvasHeight = (canvasWidth * 0.5) / gr;
      renderer.setSize(canvasWidth, canvasHeight);
    }
    window.addEventListener("resize", resizeRenderer);
    canvasContainerRef.current.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const controls = new MapControls(camera, renderer.domElement);
    controls.enableRotate = false;
    controls.enableDamping = false;
    controls.screenSpacePanning = true;
    controls.addEventListener("change", () => {
      renderer.render(scene, camera);
    });
    renderSceneFnRef.current = () => renderer.render(scene, camera);
    // @ts-ignore
    window.addEventListener("TextureLoaded", renderSceneFnRef.current);

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
      radius.length - 1,
    );

    meshRef.current.frustumCulled = false;
    scene.add(meshRef.current);
    renderSceneFnRef.current();

    return () => {
      renderer.dispose();
      window.removeEventListener("resize", resizeRenderer);
      // @ts-ignore
      window.removeEventListener("TextureLoaded", renderSceneFnRef.current);
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

    const lengthRatio: number[] = [];
    let currLengthRatio = 0.0;
    for (let i = 0; i < radius.length - 1; ++i) {
      const stride = 2 * i;
      const p0 = new THREE.Vector2(position[stride], position[stride + 1]);
      const p1 = new THREE.Vector2(position[stride + 2], position[stride + 3]);
      let r0 = radius[i];
      let r1 = radius[i + 1];

      // When radius is zero index comes to infinity, which is avoided here.
      const tolerance = 1e-5;
      if (r0 <= 0 || r0 / r1 < tolerance) {
        r0 = tolerance * r1;
        radius0[i] = r0;
      }
      if (r1 <= 0 || r1 / r0 < tolerance) {
        r1 = tolerance * r0;
        radius1[i] = r1;
      }

      let l = p0.distanceTo(p1);

      if (r0 <= 0.0 && r1 <= 0.0) currLengthRatio += 0.0;
      else if (r0 == r1) currLengthRatio += l / r0;
      else currLengthRatio += (Math.log(r0 / r1) / (r0 - r1)) * l;
      lengthRatio.push(currLengthRatio);
    }
    const lengthRatio0 = [0.0, ...lengthRatio];
    const lengthRatio1 = [...lengthRatio];

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
    geometry.setAttribute(
      "summedLength0",
      new THREE.InstancedBufferAttribute(new Float32Array(lengthRatio0), 1),
    );
    geometry.setAttribute(
      "summedLength1",
      new THREE.InstancedBufferAttribute(new Float32Array(lengthRatio1), 1),
    );
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

  const onGeometryEditorChange = useCallback(
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
      meshRef.current.count = radius.length - 1;
      renderSceneFnRef.current();
    },
    [],
  );

  const editorHeight = "40vh";
  let showGeometryEditor = true,
    showVertexEditor = true,
    showFragmentEditor = true;
  if (Array.isArray(showEditor)) {
    [showGeometryEditor, showVertexEditor, showFragmentEditor] = showEditor;
  }

  return (
    <>
      {
        <div style={{ display: showEditor ? null : "none" }}>
          <Tabs defaultValue="">
            {showGeometryEditor && (
              <TabItem value="geometry.js">
                <Editor
                  height={editorHeight}
                  defaultLanguage="javascript"
                  defaultValue={geometryCode}
                  onChange={onGeometryEditorChange}
                />
              </TabItem>
            )}
            {showVertexEditor && (
              <TabItem value="vertex.glsl">
                <GlslEditor
                  height={editorHeight}
                  defaultValue={vertexShaderCode}
                  onChange={(value) => {
                    updateMaterial(value, "");
                  }}
                />
              </TabItem>
            )}
            {showFragmentEditor && (
              <TabItem value="fragment.glsl">
                <GlslEditor
                  height={editorHeight}
                  defaultValue={fragmentShaderCode}
                  onChange={(value) => {
                    updateMaterial("", value);
                  }}
                />
              </TabItem>
            )}
          </Tabs>
        </div>
      }
      <div
        ref={canvasContainerRef}
        style={{ width: "100%" }}
        onMouseDown={(e) => e.preventDefault()}
      />
    </>
  );
}

import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";

let pencilBrushTexture = new THREE.Texture();
if (ExecutionEnvironment.canUseDOM) {
  pencilBrushTexture = new THREE.TextureLoader().load(
    `/${docusaurusConfig.projectName}/img/stamp2.png`,
    (texture) => {
      window.dispatchEvent(new CustomEvent("TextureLoaded"));
    },
    undefined,
    undefined,
  );
}

let dotBrushTexture = new THREE.Texture();
if (ExecutionEnvironment.canUseDOM) {
  dotBrushTexture = new THREE.TextureLoader().load(
    `/${docusaurusConfig.projectName}/img/dot.png`,
    (texture) => {
      window.dispatchEvent(new CustomEvent("TextureLoaded"));
    },
    undefined,
    undefined,
  );
}

// Airbrush's bezier curve
const createGradient = (point1: THREE.Vector2, point2: THREE.Vector2) => {
  let curve = new THREE.CubicBezierCurve(
    new THREE.Vector2(0.0, 1.0),
    point1,
    point2,
    new THREE.Vector2(1.0, 0.0),
  );

  const width = 256;
  const height = 1;
  const size = width * height;
  const data = new Uint8Array(4 * size);
  const points = curve.getPoints(width * 2);

  // Resample on the polyline generated from the points
  for (let i = 0; i < width; ++i) {
    let x = i / width;
    for (let j = 0; j < width * 2 - 1; ++j) {
      let p0 = points[j],
        p1 = points[j + 1];
      if (x >= p0.x && x <= p1.x) {
        let y = (p0.y * (p1.x - x) + p1.y * (x - p0.x)) / (p1.x - p0.x);
        data[i * 4] = Math.floor(y * 255);
      }
    }
  }

  const gradientTexture = new THREE.DataTexture(data, width, height);
  gradientTexture.needsUpdate = true;
  return gradientTexture;
};

export const pencilBrushUniforms = {
  type: { value: BrushType.Stamp },
  color: { value: [0.0, 0.0, 0.0, 1.0] },
  footprint: { value: pencilBrushTexture },
  stampIntervalRatio: { value: 0.4 },
  noiseFactor: { value: 1.2 },
  rotationFactor: { value: 0.75 },
};

const defaultGradient = createGradient(
  new THREE.Vector2(0.33, 1.0),
  new THREE.Vector2(0.66, 0.0),
);

export const airBrushUniforms = {
  type: { value: BrushType.Airbrush },
  color: { value: [0.0, 0.0, 0.0, 1.0] },
  gradient: { value: defaultGradient },
};

export const dotBrushUniforms = {
  type: { value: BrushType.Stamp },
  color: { value: [0.0, 0.0, 0.0, 0.5] },
  footprint: { value: dotBrushTexture },
  stampIntervalRatio: { value: 2.0 },
  noiseFactor: { value: 0.0 },
  rotationFactor: { value: 0.0 },
}

export const dotHalfBrushUniforms = {
  type: { value: BrushType.Stamp },
  color: { value: [0.0, 0.0, 0.0, 0.5] },
  footprint: { value: dotBrushTexture },
  stampIntervalRatio: { value: 1.0 },
  noiseFactor: { value: 0.0 },
  rotationFactor: { value: 0.0 },
}
