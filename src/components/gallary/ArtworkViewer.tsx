import React, { useEffect, useRef, useState } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useDoc } from "@docusaurus/plugin-content-docs/client";
import { RenderDocument } from "../../rendering/format";
import {
  WebGpuRenderer,
  Camera,
  RenderStats,
  BitmapInfo,
  Comparison,
  SampleCount,
} from "../../rendering/WebGpuRenderer";
import styles from "./gallary.module.css";
import { galleryMessages } from "./messages";

interface Props {
  src?: string;
  poster?: string;
  height?: string;
  label?: string;
}
interface Options {
  compare: boolean;
  edge: number;
  filter: "linear" | "nearest";
  difference: boolean;
  gain: number;
  grid: boolean;
  samples: SampleCount;
}
const number = (value: number) => value.toLocaleString("en-US");
const ms = (value?: number) =>
  value === undefined
    ? "—"
    : value < 0.01
    ? "<0.01 ms"
    : `${value.toFixed(2)} ms`;
const mib = (bytes: number) => `${(bytes / 1048576).toFixed(2)} MiB`;

export default function ArtworkViewer(props: Props) {
  const copy = galleryMessages();
  const { frontMatter: rawFrontMatter, metadata } = useDoc();
  const frontMatter = rawFrontMatter as typeof rawFrontMatter & {
    artwork: string;
    thumbnail: string;
  };
  const src = useBaseUrl(props.src ?? frontMatter.artwork),
    poster = useBaseUrl(props.poster ?? frontMatter.thumbnail);
  const frame = useRef<HTMLDivElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    rasterCanvas = useRef<HTMLCanvasElement>(null);
  const actions = useRef({
    fit: () => {},
    zoom: (_factor: number) => {},
    refresh: () => {},
    retryBitmap: () => {},
  });
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
      "loading",
    ),
    [error, setError] = useState("");
  const [zoom, setZoom] = useState(100),
    [background, setBackground] = useState("grid"),
    [pixelsPerUnit, setPixelsPerUnit] = useState(0);
  const [compare, setCompare] = useState(false),
    [edge, setEdge] = useState(1024),
    [edgeInput, setEdgeInput] = useState("1024");
  const [samples, setSamples] = useState<SampleCount>(1);
  const [filter, setFilter] = useState<"linear" | "nearest">("linear"),
    [difference, setDifference] = useState(false),
    [gain, setGain] = useState(4),
    [grid, setGrid] = useState(false);
  const [baking, setBaking] = useState(false),
    [bitmap, setBitmap] = useState<BitmapInfo>(),
    [bitmapError, setBitmapError] = useState("");
  const [document, setDocument] = useState<RenderDocument>(),
    [stats, setStats] = useState<RenderStats>(),
    [gpu, setGpu] = useState<{ vectorMs: number; bitmapMs?: number }>();
  const [gpuSupported, setGpuSupported] = useState(false),
    [segments, setSegments] = useState(0);
  const options = useRef<Options>({
    compare,
    edge,
    filter,
    difference,
    gain,
    grid,
    samples,
  });
  options.current = { compare, edge, filter, difference, gain, grid, samples };

  useEffect(() => {
    actions.current.refresh();
  }, [compare, edge, filter, difference, gain, grid, samples]);

  useEffect(() => {
    const host = frame.current!,
      surface = canvas.current!,
      raster = rasterCanvas.current!;
    const abort = new AbortController();
    let renderer: WebGpuRenderer | undefined,
      context: GPUCanvasContext | undefined;
    let disposed = false,
      raf = 0,
      ratio = 1,
      fitScale = 1,
      running = false,
      pending = false,
      bakedKey = "",
      failedKey = "",
      bakeId = 0;
    let appliedSamples: SampleCount = 1;
    const camera: Camera = { x: 0, y: 0, scale: 1 };
    let pointer:
      | { id: number; x: number; y: number; surface: HTMLCanvasElement }
      | undefined;
    const fail = (message: string) => {
      if (!disposed) {
        setError(message);
        setStatus("error");
      }
    };
    const draw = () => {
      pending = true;
      if (raf || disposed || !renderer || running) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        void renderFrame();
      });
    };
    const renderFrame = async () => {
      if (disposed || !renderer) return;
      running = true;
      pending = false;
      try {
        let o = options.current;
        const frameSamples = o.samples;
        if (frameSamples !== appliedSamples) {
          renderer.setSampleCount(frameSamples);
          appliedSamples = frameSamples;
          bakedKey = failedKey = "";
          setBitmap(undefined);
          setGpu(undefined);
        }
        const requestedKey = `${o.edge}/${frameSamples}`;
        if (
          o.compare &&
          bakedKey !== requestedKey &&
          failedKey !== requestedKey
        ) {
          setBaking(true);
          setBitmapError("");
          raster.dataset.ready = "false";
          try {
            const info = await renderer.bakeBitmap(o.edge);
            if (disposed) return;
            bakedKey = requestedKey;
            failedKey = "";
            setBitmap(info);
            raster.dataset.bake = String(++bakeId);
            raster.dataset.rasterWidth = String(info.width);
            raster.dataset.rasterHeight = String(info.height);
            raster.dataset.samples = String(frameSamples);
          } catch (e) {
            if (disposed) return;
            failedKey = requestedKey;
            setBitmapError(e instanceof Error ? e.message : String(e));
          } finally {
            if (!disposed) setBaking(false);
          }
        }
        o = options.current;
        if (o.samples !== frameSamples) {
          pending = true;
          return;
        }
        if (!o.compare && (bakedKey || failedKey)) {
          if (bakedKey) renderer.clearBitmap();
          bakedKey = "";
          failedKey = "";
          setBitmap(undefined);
          setBitmapError("");
        }
        let comparison: Comparison | undefined;
        if (o.compare && bakedKey === requestedKey) {
          context ??= renderer.attachComparison(raster);
          comparison = {
            context,
            filter: o.filter,
            difference: o.difference,
            gain: o.gain,
            grid: o.grid,
          };
        }
        const result = renderer.render(
          { ...camera, scale: camera.scale * ratio },
          comparison,
          (timing) => {
            if (!disposed) setGpu(timing);
          },
        );
        setStats(result);
        const value = JSON.stringify({ ...camera, ratio });
        surface.dataset.camera = value;
        raster.dataset.camera = value;
        setZoom((camera.scale / fitScale) * 100);
        setPixelsPerUnit(camera.scale * ratio);
        surface.dataset.ready = "true";
        surface.dataset.samples = String(frameSamples);
        raster.dataset.ready = String(!!comparison);
        setStatus("ready");
      } catch (e) {
        fail(e instanceof Error ? e.message : String(e));
      } finally {
        running = false;
        if (pending && !disposed) draw();
      }
    };
    const fit = () => {
      if (!renderer) return;
      const b = renderer.document.bounds;
      camera.x = (b[0] + b[2]) / 2;
      camera.y = (b[1] + b[3]) / 2;
      camera.scale =
        0.9 *
        Math.min(
          host.clientWidth / Math.max(b[2] - b[0], 1),
          host.clientHeight / Math.max(b[3] - b[1], 1),
        );
      fitScale = camera.scale;
      draw();
    };
    const resize = () => {
      const w = host.clientWidth,
        h = host.clientHeight;
      if (!w || !h) return;
      ratio = Math.min(window.devicePixelRatio || 1, 2, 1600 / Math.max(w, h));
      const width = Math.max(1, Math.round(w * ratio)),
        height = Math.max(1, Math.round(h * ratio));
      // Equal backing sizes and equal CSS panels give both views the same world-to-pixel transform.
      for (const c of [surface, raster]) {
        if (c.width !== width) c.width = width;
        if (c.height !== height) c.height = height;
      }
      draw();
    };
    const scaleAt = (factor: number, x: number, y: number) => {
      const next = Math.max(fitScale * 0.1, camera.scale * factor);
      // No artwork zoom ceiling. Only reject a non-finite arithmetic result.
      if (!Number.isFinite(next)) return;
      camera.x += x / camera.scale - x / next;
      camera.y += y / camera.scale - y / next;
      camera.scale = next;
      draw();
    };
    actions.current = {
      fit,
      zoom: (factor) => scaleAt(factor, 0, 0),
      refresh: () => {
        resize();
        draw();
      },
      retryBitmap: () => {
        failedKey = "";
        draw();
      },
    };
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = (
        event.currentTarget as HTMLCanvasElement
      ).getBoundingClientRect();
      const delta =
        event.deltaY *
        (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? rect.height : 1);
      scaleAt(
        Math.exp(-Math.max(-300, Math.min(300, delta)) * 0.002),
        event.clientX - rect.left - rect.width / 2,
        event.clientY - rect.top - rect.height / 2,
      );
    };
    const down = (event: PointerEvent) => {
      if (event.button !== 0 && event.button !== 1) return;
      event.preventDefault();
      const c = event.currentTarget as HTMLCanvasElement;
      c.focus({ preventScroll: true });
      c.setPointerCapture(event.pointerId);
      pointer = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        surface: c,
      };
      c.dataset.dragging = "true";
    };
    const move = (event: PointerEvent) => {
      if (!pointer || pointer.id !== event.pointerId) return;
      camera.x -= (event.clientX - pointer.x) / camera.scale;
      camera.y -= (event.clientY - pointer.y) / camera.scale;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      draw();
    };
    const up = () => {
      if (pointer) delete pointer.surface.dataset.dragging;
      pointer = undefined;
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "0" || event.key === "Home") {
        event.preventDefault();
        fit();
      } else if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        scaleAt(1.25, 0, 0);
      } else if (event.key === "-") {
        event.preventDefault();
        scaleAt(0.8, 0, 0);
      } else if (
        ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
      ) {
        event.preventDefault();
        camera.x +=
          ({ ArrowLeft: -40, ArrowRight: 40 }[event.key] ?? 0) / camera.scale;
        camera.y +=
          ({ ArrowUp: -40, ArrowDown: 40 }[event.key] ?? 0) / camera.scale;
        draw();
      }
    };
    const events = [
      ["wheel", wheel],
      ["pointerdown", down],
      ["pointermove", move],
      ["pointerup", up],
      ["pointercancel", up],
      ["lostpointercapture", up],
      ["keydown", key],
      ["dblclick", fit],
    ] as const;
    for (const c of [surface, raster])
      for (const [name, listener] of events)
        c.addEventListener(name, listener as EventListener, { passive: false });
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    setError("");
    setStatus("loading");
    setStats(undefined);
    setGpu(undefined);
    setBitmap(undefined);
    setDocument(undefined);
    setBitmapError("");
    (async () => {
      try {
        const response = await fetch(src, { signal: abort.signal });
        if (!response.ok)
          throw new Error(`Artwork could not be loaded (${response.status}).`);
        const doc = new RenderDocument(await response.arrayBuffer());
        if (disposed) return;
        const created = await WebGpuRenderer.create(surface, doc, fail);
        if (disposed) {
          created.dispose();
          return;
        }
        renderer = created;
        setDocument(doc);
        setGpuSupported(created.supportsGpuTiming);
        setSegments(created.segmentCount);
        fit();
      } catch (e) {
        if (
          !disposed &&
          !(e instanceof DOMException && e.name === "AbortError")
        )
          fail(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      disposed = true;
      abort.abort();
      observer.disconnect();
      cancelAnimationFrame(raf);
      context?.unconfigure();
      renderer?.dispose();
      for (const c of [surface, raster])
        for (const [name, listener] of events)
          c.removeEventListener(name, listener as EventListener);
    };
  }, [src]);

  const ready = status === "ready" && !error;
  const rasterScale =
    bitmap && document
      ? (pixelsPerUnit * document.artwork.width) / bitmap.width
      : 0;
  const gpuText = (value?: number) =>
    gpuSupported ? ms(value) : "Unavailable";
  return (
    <section
      className={styles.viewer}
      data-artwork-viewer
      aria-label={`${props.label ?? metadata.title}: ${copy.viewerLabel}`}
    >
      <div className={styles.toolbar}>
        <span className={styles.hint}>{copy.hint}</span>
        <div className={styles.tools}>
          <button
            aria-label={copy.zoomOut}
            onClick={() => actions.current.zoom(0.8)}
            disabled={!ready}
          >
            −
          </button>
          <output className={styles.zoom} aria-label={copy.zoomLevel}>
            {zoom < 100000
              ? `${Math.round(zoom).toLocaleString("en-US")}%`
              : `${zoom.toExponential(2)}%`}
          </output>
          <button
            aria-label={copy.zoomIn}
            onClick={() => actions.current.zoom(1.25)}
            disabled={!ready}
          >
            +
          </button>
          <button onClick={() => actions.current.fit()} disabled={!ready}>
            {copy.fit}
          </button>
          <select
            aria-label={copy.background}
            value={background}
            onChange={(e) => setBackground(e.target.value)}
          >
            <option value="grid">{copy.checkerboard}</option>
            <option value="light">{copy.light}</option>
            <option value="dark">{copy.dark}</option>
          </select>
          <label className={styles.toggle}>
            MSAA
            <select
              aria-label="MSAA"
              value={samples}
              disabled={!ready}
              onChange={(e) =>
                setSamples(Number(e.target.value) as SampleCount)
              }
            >
              <option value={1}>{copy.off}</option>
              <option value={4}>4×</option>
            </select>
          </label>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              role="switch"
              checked={compare}
              disabled={!ready}
              onChange={(e) => setCompare(e.target.checked)}
            />
            {copy.compare}
          </label>
        </div>
      </div>
      {compare && (
        <div className={styles.compareControls}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setEdge(Number(edgeInput));
              actions.current.retryBitmap();
            }}
            className={styles.resolution}
          >
            <label>
              {copy.longEdge}{" "}
              <input
                aria-label={copy.longEdge}
                type="number"
                min="64"
                max="2048"
                step="1"
                required
                value={edgeInput}
                onChange={(e) => setEdgeInput(e.target.value)}
              />{" "}
              px
            </label>
            <button type="submit" disabled={baking || !ready}>
              {copy.apply}
            </button>
          </form>
          <label>
            {copy.sampling}{" "}
            <select
              aria-label={copy.bitmapSampling}
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value as "linear" | "nearest")
              }
            >
              <option value="linear">{copy.smooth}</option>
              <option value="nearest">{copy.nearest}</option>
            </select>
          </label>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={grid}
              onChange={(e) => setGrid(e.target.checked)}
              disabled={difference}
            />
            {copy.pixelGrid}
          </label>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={difference}
              onChange={(e) => setDifference(e.target.checked)}
            />
            {copy.difference}
          </label>
          {difference && (
            <select
              aria-label={copy.differenceGain}
              value={gain}
              onChange={(e) => setGain(Number(e.target.value))}
            >
              <option value={1}>{copy.difference1}</option>
              <option value={4}>{copy.difference4}</option>
              <option value={16}>{copy.difference16}</option>
            </select>
          )}
          <span className={styles.shared}>{copy.sharedCamera}</span>
        </div>
      )}
      <div className={styles.panes} data-compare={compare}>
        <div className={styles.pane}>
          <div className={styles.paneHeader}>
            <strong>{copy.vector}</strong>
            <span title="Latest CPU command encoding time and asynchronously measured GPU frame span. No display refresh or network time.">
              CPU {ms(stats?.cpuMs)} · GPU {gpuText(gpu?.vectorMs)}
            </span>
          </div>
          <div
            ref={frame}
            className={styles.stage}
            data-background={background}
            style={props.height ? { height: props.height } : undefined}
          >
            {!ready && <img className={styles.poster} src={poster} alt="" />}
            <canvas
              ref={canvas}
              data-view="vector"
              className={styles.canvas}
              tabIndex={0}
              aria-label={copy.vectorHelp}
              style={{ visibility: ready ? "visible" : "hidden" }}
            />
            {status === "loading" && (
              <span className={styles.loading} role="status">
                {copy.loading}
              </span>
            )}
            {error && (
              <div className={styles.error} role="alert">
                <strong>{copy.unavailable}</strong>
                <p>{copy.viewerHelp}</p>
                <p>{error}</p>
                <span>{copy.staticPreview}</span>
              </div>
            )}
          </div>
        </div>
        <div className={styles.pane} hidden={!compare}>
          <div className={styles.paneHeader}>
            <strong>{difference ? copy.difference : copy.bitmap}</strong>
            <span title="Display cost only; bitmap generation is measured separately.">
              CPU {ms(stats?.bitmapCpuMs)} · GPU {gpuText(gpu?.bitmapMs)}
            </span>
          </div>
          <div
            className={styles.stage}
            data-background={background}
            style={props.height ? { height: props.height } : undefined}
          >
            <canvas
              ref={rasterCanvas}
              data-view="bitmap"
              className={styles.canvas}
              tabIndex={0}
              aria-label={copy.bitmapHelp}
              style={{
                visibility:
                  bitmap && !baking && !bitmapError ? "visible" : "hidden",
              }}
            />
            {baking && (
              <span className={styles.loading} role="status">
                {copy.baking}
              </span>
            )}
            {bitmapError && (
              <div className={styles.error} role="alert">
                <strong>{copy.bitmapFailed}</strong>
                <p>{bitmapError}</p>{" "}
              </div>
            )}
          </div>
        </div>
      </div>
      {compare && (
        <div className={styles.comparisonInfo}>
          <span>
            {bitmap
              ? `${bitmap.width} × ${bitmap.height} px · RGBA8 · ${mib(
                  bitmap.bytes,
                )} uncompressed`
              : copy.rasterDescription}
          </span>
          {bitmap && (
            <span title="Elapsed generation time through GPU completion; includes queue waiting. This is not a GPU timestamp measurement.">
              Generated in {ms(bitmap.readyMs)} · {rasterScale.toFixed(2)}{" "}
              screen px / bitmap px
            </span>
          )}
          <span>{difference ? copy.differenceHint : copy.bitmapHint}</span>
        </div>
      )}
      {document && (
        <>
          <div className={styles.statistics} aria-label={copy.statistics}>
            <span>
              <strong>{number(document.counts.strokes)}</strong> {copy.strokes}
            </span>
            <span title="Exported fill objects, each represented by a triangle mesh.">
              <strong>{number(document.counts.fills)}</strong> {copy.polygons}
            </span>
            <span>
              <strong>{number(document.counts.triangles)}</strong> fill
              triangles
            </span>
            <span>
              <strong>{number(document.artwork.brushes.length)}</strong>{" "}
              {copy.brushes}
            </span>
            <span>
              <strong>{mib(document.byteLength)}</strong> asset
            </span>
          </div>
          <details className={styles.details}>
            <summary>Rendering details</summary>
            <dl className={styles.metrics}>
              <div>
                <dt>Stroke samples / segments</dt>
                <dd>
                  {number(document.counts.points)} / {number(segments)}
                </dd>
              </div>
              <div>
                <dt>Groups / clipping stacks</dt>
                <dd>
                  {document.counts.groups} / {document.counts.clippingStacks}
                </dd>
              </div>
              <div>
                <dt>Erase strokes</dt>
                <dd>{document.counts.erasers}</dd>
              </div>
              <div>
                <dt>Vector draws / render passes</dt>
                <dd>
                  {stats?.draws ?? "—"} / {stats?.passes ?? "—"}
                </dd>
              </div>
              <div>
                <dt>Each canvas backing size</dt>
                <dd>{stats ? `${stats.width} × ${stats.height} px` : "—"}</dd>
              </div>
              <div>
                <dt>Vector target allocation</dt>
                <dd>{stats ? mib(stats.targetBytes) : "—"} (estimated)</dd>
              </div>
              <div>
                <dt>Working color / anti-aliasing</dt>
                <dd>
                  Linear sRGB · RGBA16F ·{" "}
                  {stats?.samples === 4 ? "4× MSAA" : "MSAA off"}
                </dd>
              </div>
              <div>
                <dt>Reference canvas</dt>
                <dd>
                  {document.artwork.width} × {document.artwork.height}
                </dd>
              </div>
            </dl>
            <p>
              Times update on redraw. CPU measures command encoding; GPU
              measures the span from the first vector pass to presentation, and
              the bitmap display pass separately. GPU samples arrive
              asynchronously; unavailable means the device does not expose
              timestamp queries. Idle time is not counted. The bitmap is
              generated by the same renderer and is a resolution comparison, not
              an independent correctness reference.
            </p>
          </details>
        </>
      )}
    </section>
  );
}
