import { translate } from "@docusaurus/Translate";

export function galleryMessages() {
  return {
    galleryTitle: translate({ id: "gallary.galleryTitle", message: "Gallary" }),
    pageDescription: translate({
      id: "gallary.pageDescription",
      message: "Explore illustrations drawn with Ciallo's vector brushes.",
    }),
    eyebrow: translate({
      id: "gallary.eyebrow",
      message: "Ciallo · In the browser",
    }),
    artworkBadge: translate({
      id: "gallary.artworkBadge",
      message: "Interactive artwork",
    }),
    viewerLabel: translate({
      id: "gallary.viewerLabel",
      message: "Interactive viewer",
    }),
    hint: translate({
      id: "gallary.hint",
      message: "Drag to explore · Scroll to zoom · Double-click to fit",
    }),
    zoomOut: translate({ id: "gallary.zoomOut", message: "Zoom out" }),
    zoomIn: translate({ id: "gallary.zoomIn", message: "Zoom in" }),
    zoomLevel: translate({ id: "gallary.zoomLevel", message: "Zoom level" }),
    fit: translate({ id: "gallary.fit", message: "Fit" }),
    background: translate({
      id: "gallary.background",
      message: "Canvas background",
    }),
    checkerboard: translate({
      id: "gallary.checkerboard",
      message: "Checkerboard",
    }),
    light: translate({ id: "gallary.light", message: "Light" }),
    dark: translate({ id: "gallary.dark", message: "Dark" }),
    off: translate({ id: "gallary.off", message: "Off" }),
    compare: translate({ id: "gallary.compare", message: "Compare bitmap" }),
    longEdge: translate({
      id: "gallary.longEdge",
      message: "Bitmap long edge",
    }),
    apply: translate({ id: "gallary.apply", message: "Apply" }),
    sampling: translate({ id: "gallary.sampling", message: "Sampling" }),
    bitmapSampling: translate({
      id: "gallary.bitmapSampling",
      message: "Bitmap sampling",
    }),
    smooth: translate({ id: "gallary.smooth", message: "Smooth" }),
    nearest: translate({ id: "gallary.nearest", message: "Nearest pixel" }),
    pixelGrid: translate({ id: "gallary.pixelGrid", message: "Pixel grid" }),
    difference: translate({ id: "gallary.difference", message: "Difference" }),
    differenceGain: translate({
      id: "gallary.differenceGain",
      message: "Difference amplification",
    }),
    difference1: translate({
      id: "gallary.difference1",
      message: "1× difference",
    }),
    difference4: translate({
      id: "gallary.difference4",
      message: "4× difference",
    }),
    difference16: translate({
      id: "gallary.difference16",
      message: "16× difference",
    }),
    sharedCamera: translate({
      id: "gallary.sharedCamera",
      message: "Shared camera",
    }),
    vector: translate({ id: "gallary.vector", message: "Vector" }),
    bitmap: translate({ id: "gallary.bitmap", message: "Bitmap" }),
    vectorHelp: translate({
      id: "gallary.vectorHelp",
      message: "Vector artwork. Drag to pan, scroll to zoom, Home to fit.",
    }),
    bitmapHelp: translate({
      id: "gallary.bitmapHelp",
      message: "Bitmap comparison. Drag or zoom either view to move both.",
    }),
    loading: translate({ id: "gallary.loading", message: "Loading artwork…" }),
    baking: translate({ id: "gallary.baking", message: "Generating bitmap…" }),
    unavailable: translate({
      id: "gallary.unavailable",
      message: "Viewer unavailable",
    }),
    viewerHelp: translate({
      id: "gallary.viewerHelp",
      message:
        "Try a current Chrome or Edge with hardware acceleration enabled.",
    }),
    staticPreview: translate({
      id: "gallary.staticPreview",
      message: "The image shown is a static preview.",
    }),
    bitmapFailed: translate({
      id: "gallary.bitmapFailed",
      message: "Could not generate the bitmap. Try a smaller size.",
    }),
    rasterDescription: translate({
      id: "gallary.rasterDescription",
      message: "The full artwork is rasterized at the selected resolution.",
    }),
    differenceHint: translate({
      id: "gallary.differenceHint",
      message:
        "Black means matching pixels. Brighter colors show larger differences.",
    }),
    bitmapHint: translate({
      id: "gallary.bitmapHint",
      message:
        "The bitmap keeps its resolution as you zoom. The grid appears when pixels are large enough.",
    }),
    statistics: translate({
      id: "gallary.statistics",
      message: "Artwork statistics",
    }),
    strokes: translate({ id: "gallary.strokes", message: "strokes" }),
    polygons: translate({ id: "gallary.polygons", message: "polygons" }),
    brushes: translate({ id: "gallary.brushes", message: "brushes" }),
  };
}
