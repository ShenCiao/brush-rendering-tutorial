import React from "react";
import { conf, language } from "./glslLanguageConfiguration";
import { Editor } from "@monaco-editor/react";
import type { EditorProps } from "@monaco-editor/react";

export function GlslEditor(
  props: Omit<EditorProps, "defaultLanguage" | "language">,
) {
  const handleEditorDidMount = (editor, monaco) => {
    monaco.languages.register({ id: "glsl" });
    monaco.languages.setMonarchTokensProvider("glsl", language);
    monaco.languages.setLanguageConfiguration("glsl", conf);
    if (typeof props.onMount === "function") {
      props.onMount(editor, monaco);
    }
  };
  return (
    <Editor {...props} defaultLanguage="glsl" onMount={handleEditorDidMount} />
  );
}
