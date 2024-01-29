import { Stroke } from "@site/src/components/Stroke";
import geomCode from "@site/src/components/sinewaveGeometry";
import vsCode from "./stampSquare.vert";
import fsCode from "./stampSquare.frag";
import * as THREE from "three";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import docusaurusConfig from "@site/docusaurus.config";

let texture = new THREE.Texture();
if (ExecutionEnvironment.canUseDOM) {
  texture = new THREE.TextureLoader().load(
      `/${docusaurusConfig.projectName}/img/stamp-square.png`,
      (texture) => {
        window.dispatchEvent(new CustomEvent("TextureLoaded"));
      },
      undefined,
      undefined,
  );
}

let textureUniforms = {
  footprint: {value: texture}
};

export default function ({ showEditor = [false, false, false] }) {
  return (
    <Stroke
      geometry={geomCode}
      vertexShader={vsCode}
      fragmentShader={fsCode}
      showEditor={showEditor}
      uniforms={textureUniforms}
    />
  );
}
