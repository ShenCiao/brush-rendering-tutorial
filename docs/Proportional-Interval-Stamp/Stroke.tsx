import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
// @ts-ignore
import { MapControls } from "three/examples/jsm/controls/MapControls.js";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import Editor from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { GlslEditor } from "@site/src/components//GlslEditor";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import docusaurusConfig from "@site/docusaurus.config";

export default function ({
                         geometry,
                         vertexShader,
                         fragmentShader,
                         showEditor = null,
                         uniforms = null,
                       }) {
  const canvasContainerRef = useRef<HTMLDivElement>();
  const renderSceneFnRef = useRef<Function>();
  const meshRef = useRef<THREE.InstancedMesh>();
  const rendererRef = useRef<THREE.WebGLRenderer>();

  useEffect(() => {
    // Being in doubt when setting parameters? Use golden ratio!
    const gr = (1 + Math.sqrt(5)) / 2;
    const canvasWidth = canvasContainerRef.current.clientWidth;
    const canvasHeight = canvasWidth * (0.5 / gr);

    const worldWidth = 5 * gr;
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
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
    });
    renderer.setClearColor(new THREE.Color(1.0, 1.0, 1.0), 0.0);
    renderer.setSize(canvasWidth, canvasHeight);
    rendererRef.current = renderer;

    function resizeRenderer() {
      const canvasWidth = canvasContainerRef.current.clientWidth;
      const canvasHeight = (canvasWidth * 0.5) / gr;
      renderer.setSize(canvasWidth, canvasHeight);
    }

    window.addEventListener("resize", resizeRenderer);
    canvasContainerRef.current.appendChild(renderer.domElement);

    let texture = new THREE.Texture();
    if (ExecutionEnvironment.canUseDOM) {
      texture = new THREE.TextureLoader().load(
        `/${docusaurusConfig.projectName}/img/dot-transparent.png`,
        (texture) => {
          window.dispatchEvent(new CustomEvent("TextureLoaded"));
        },
        undefined,
        undefined,
      );
    }

    let textureUniforms = {
      footprint: {value: texture},
      intervalRatio: {value: 1.0}
    };

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

    let trapezoidGeometry = new THREE.BufferGeometry();
    if (typeof geometry == "string") {
      // automatically create buffers from position and radius
      const indices = [0, 1, 2, 2, 3, 0];
      trapezoidGeometry.setIndex(indices);
      const getGeom = new Function(geometry);
      const [position, radius, index, intervalRatio] = getGeom();
      textureUniforms.intervalRatio.value = intervalRatio;
      updateGeometry(trapezoidGeometry, position, radius, index);

    } else {
      console.error("Unrecognized geometry input: " + typeof geometry);
      return;
    }

    if(uniforms){
      textureUniforms = uniforms;
    }

    const material = new THREE.RawShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide,
      transparent: true,
      glslVersion: THREE.GLSL3,
      uniforms: textureUniforms,
    });

    meshRef.current = new THREE.InstancedMesh(
      trapezoidGeometry,
      material,
      trapezoidGeometry.getAttribute("radius0").count - 1,
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
    index: number[],
  ) {
    const position0 = [...position];
    const position1 = [...position.slice(2)];
    const radius0 = [...radius];
    const radius1 = [...radius.slice(1)];
    const index0 = [...index];
    const index1 = [...index.slice(1)];

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
      "index0",
      new THREE.InstancedBufferAttribute(new Float32Array(index0), 1),
    );
    geometry.setAttribute(
      "index1",
      new THREE.InstancedBufferAttribute(new Float32Array(index1), 1),
    );
  }

  function updateMaterial(vert: string, frag: string, intervalRatio: number = NaN) {
    const material = meshRef.current.material as THREE.RawShaderMaterial;
    if (vert) {
      material.vertexShader = vert;
    }
    if (frag) {
      material.fragmentShader = frag;
    }
    if (!isNaN(intervalRatio)){
      material.uniforms.intervalRatio.value = intervalRatio;
    }
    material.needsUpdate = true;
  }

  const onGeometryEditorChange = useCallback(
    (value: string | undefined, ev: editor.IModelContentChangedEvent) => {
      let position: number[] = [];
      let radius: number[] = [];
      let index: number[] = [];
      let intervalRatio:number = 1.0;
      try {
        const getGeom = new Function(value);
        [position, radius, index, intervalRatio] = getGeom();
      } catch (e) {
        console.log(e.toString());
        return;
      }

      // Validation
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
        console.error("return value is not correct");
        return;
      }
      if (position.length != radius.length * 2) {
        console.error("return value is not correct");
        return;
      }

      updateGeometry(meshRef.current.geometry, position, radius, index);
      updateMaterial("", "", intervalRatio);
      meshRef.current.count = radius.length - 1;
      renderSceneFnRef.current();
    },
    [],
  );

  const editorHeight = "60vh";
  let showGeometryEditor = true,
    showVertexEditor = true,
    showFragmentEditor = true;
  if (Array.isArray(showEditor)) {
    [showGeometryEditor, showVertexEditor, showFragmentEditor] = showEditor;
    showEditor = showGeometryEditor || showVertexEditor || showFragmentEditor;
  }

  if (geometry instanceof THREE.BufferGeometry) {
    showGeometryEditor = false;
  }

  return (
    <>
      {showEditor && (
        <div>
          <Tabs defaultValue="">
            {showGeometryEditor && (
              <TabItem value="geometry.js">
                <Editor
                  height={editorHeight}
                  defaultLanguage="javascript"
                  defaultValue={geometry}
                  onChange={onGeometryEditorChange}
                />
              </TabItem>
            )}
            {showVertexEditor && (
              <TabItem value="vertex.glsl">
                <GlslEditor
                  height={editorHeight}
                  defaultValue={vertexShader}
                  onChange={(value) => {
                    updateMaterial(value, "");
                    renderSceneFnRef.current();
                  }}
                />
              </TabItem>
            )}
            {showFragmentEditor && (
              <TabItem value="fragment.glsl">
                <GlslEditor
                  height={editorHeight}
                  defaultValue={fragmentShader}
                  onChange={(value) => {
                    updateMaterial("", value);
                    renderSceneFnRef.current();
                  }}
                />
              </TabItem>
            )}
          </Tabs>
        </div>
      )}
      <div
        ref={canvasContainerRef}
        style={{ width: "100%" }}
        onMouseDown={(e) => {
          e.preventDefault();
          if (e.button == 2) {
            console.log(rendererRef.current.domElement.toDataURL());
          }
        }}
      />
    </>
  );
}
