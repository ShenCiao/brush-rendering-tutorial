# Gallary authoring and local development

The **Gallary** navbar item opens `/gallary/`. Each published entry in `gallary/`
is an MD or MDX document. The listing is generated from these documents at build
time; no separate artwork registry needs to be edited.

## Add a work

1. In Ciallo, choose the frame and use **File → Export current frame for web**.
   Save the `.glb2dim` file in `static/gallary/<slug>/`.
2. Put a preview image in the same directory. This is used for the list and for
   an explicitly labelled static preview if interactive viewing is unavailable.
3. Create `gallary/<slug>.mdx` using this example:

```mdx
---
title: Artwork title
slug: artwork-slug
thumbnail: /gallary/artwork-slug/preview.webp
artwork: /gallary/artwork-slug/artwork.glb2dim
order: 2
hide_table_of_contents: true
pagination_prev: null
pagination_next: null
---

import ArtworkViewer from "@site/src/components/gallary/ArtworkViewer";

<ArtworkViewer />

## About this work

Write Markdown, add images, or use other MDX components here.
```

Paths in front matter are relative to the site's base URL. Docusaurus adds
`/brush-rendering-tutorial/` in this deployment. Do not put that prefix in the
front matter. `order` sorts entries ascending, then by title. Docusaurus's
`draft: true` and `unlisted: true` control publication/list visibility.

`ArtworkViewer` defaults to the containing document's `artwork` and `thumbnail`.
To show another canvas within a document, pass `src`, `poster`, and optionally
`label`. Its default height is responsive (360–820 CSS pixels); override it with
`height="60vh"` or another CSS height. Artwork coordinates do not determine its
CSS size. Initial framing fits the visible geometry.

Left/middle mouse drag pans; the wheel zooms around the pointer. Fit, double-click,
Home, or 0 resets framing. A focused canvas supports arrow keys and +/−. Single
pointer touch dragging is supported. Canvas backgrounds can be changed without
changing the artwork. Rendering happens on demand, including after zoom/resize.
There is no maximum zoom setting; extreme magnification is subject to GPU
floating-point precision.

**MSAA** offers **Off** (the default) and **4×**, the sample counts supported by
WebGPU. Changing it preserves the camera, switches the paint targets and pipelines,
and regenerates any comparison bitmap at the same setting. Off uses a single
sample without a separate resolve target; brush shader anti-aliasing still applies.

## Bitmap comparison and measurements

Enable **Compare bitmap** to show a second canvas. It uses the same camera;
dragging or zooming either canvas updates both. Set **Bitmap long edge** and
press **Apply** to rasterize the full reference canvas at 64–2048 pixels on its
longest side, preserving its aspect ratio. The bitmap stays at that resolution
while the live vector view is redrawn for the current camera. Disabling comparison
releases the bitmap; enabling it again regenerates it.

**Smooth** filters the bitmap; **Nearest pixel** exposes individual texels. The
optional pixel grid appears once a texel spans at least six canvas backing pixels.
**Difference** shows the amplified absolute difference in premultiplied sRGB and
alpha, with black indicating agreement. It ignores the background and pixel grid.
This compares resolution and sampling: both views use the same renderer, so the
bitmap is not an independent correctness reference or the artwork's preview PNG.

CPU time measures command preparation and encoding. GPU time uses optional
WebGPU timestamp queries, asynchronously, from the first vector pass through
presentation, with the bitmap display pass timed separately. Devices without
timestamp queries show **Unavailable** for GPU time. Measurements update on redraw;
idle time, browser compositing, display refresh, and downloads are excluded.
The bitmap generation time separately includes CPU work and waiting for the GPU.

**Active GPU**, above the canvas, identifies the WebGPU adapter used to create the
rendering device. It shows the adapter description when the browser exposes it,
otherwise the vendor and architecture (for example, `NVIDIA · ampere`). Browsers
may hide the exact model or all identifying fields; the viewer labels that case
without guessing a model. A fallback adapter is marked when reported. This uses
the renderer's existing adapter, without requesting another device or querying
WebGL, which could select a different GPU.

The statistics distinguish stroke count, polygon fill objects, and fill triangles.
Expanded details include stroke samples/segments, clipping stacks, draw/pass counts,
actual canvas backing resolution, and an estimate of vector render-target storage
(excluding geometry, swapchain textures, and driver overhead). Both canvases have
the same backing resolution, capped at 1600 pixels on the longest side and 2× CSS
resolution. The screen-pixel/bitmap-pixel ratio uses this backing resolution.

## Edit the listing introduction

Change `gallaryDescription` in `src/pages/gallary/index.tsx` to replace the sentence
under the **Gallary** heading. The shared `Card` component in that file controls
the artwork cards in every language. Cards show the preview, badge, and title;
they do not display descriptions or automatic document excerpts.

## Localization

English is the source and default language. The site also supports French (`fr`),
German (`de`), Japanese (`ja`), Korean (`ko`), Simplified Chinese (`zh-Hans`), and
Traditional Chinese (`zh-Hant`), matching Ciallo's supported languages. The navbar
language menu opens the corresponding page in another locale. This reloads the
viewer; camera and comparison settings are not carried across locale changes.

Translate navigation, artwork descriptions, interaction instructions, ordinary
controls, and user-facing status messages. Rendering metrics, GPU diagnostics, and
engineering explanations remain in English. English UI messages live in
`src/components/gallary/messages.ts`; translations use Docusaurus's
`i18n/<locale>/code.json`. Navbar labels use the locale's
`docusaurus-theme-classic/navbar.json`.

For each artwork, keep the English MDX in `gallary/` and translated MDX files in
`i18n/<locale>/docusaurus-plugin-content-docs-gallary/current/`, with the same filename
and slug. Translate titles and body text as needed; retain artwork asset paths.
Write links to related works within the MDX prose, using relative Markdown links
such as `[line art](./inaba-meguru-lineart.mdx)` so Docusaurus resolves the correct
page in the current language. The artwork index reads the translated front matter through
the docs plugin. Untranslated technical tutorial documents use their English source.

Run `yarn start --locale zh-Hans` to develop one translated locale. A normal
`yarn build` produces every locale for the static site; non-default locales use
their locale prefix after `/brush-rendering-tutorial/`. Use the full build to check
the language menu. `yarn write-translations --locale <locale>` extracts new UI keys;
review and translate their messages before publishing.

## Renderer requirements and supported content

The interactive viewer uses native WebGPU on HTTPS or localhost. It requires an
available WebGPU adapter; it does not include a WebGL fallback. Ordinary gallery
navigation and the preview remain usable without WebGPU. Existing Three.js
tutorial examples are separate from this renderer.

The `ciallo-airbrush-1` profile supports one exported frame, variable-radius and
pressure Airbrush strokes, erasing, triangulated solid fills, whole-group opacity,
Normal/Add/Multiply layers, and resolved clipping stacks. Unsupported brushes,
image layers, and other drawing types are rejected by Ciallo's exporter. A clip
does not contain editable Ciallo entities or editor state.

The finished illustration and line art were exported from `Inaba Meguru.ciallo`
and `Inaba Meguru Lineart.ciallo` by Ciallo's in-app exporter. Hidden layers and
descendants of hidden folders are excluded. The line art contains 555 strokes and
no polygon fills. The supplied PNGs provide the static previews, not the interactive
rendering. Each artwork's MDX links to the other version.

The authoritative binary/semantic contract is
[`RenderExchangeFormatRequirements.md`](https://github.com/ShenCiao/Ciallo/blob/dev/Ciallo/docs/helper/RenderExchangeFormatRequirements.md)
in the Ciallo repository. `.glb2dim` is a RIFF draft with GLB-style JSON/binary
organization; it is not a glTF/GLB file. Its version and profile are checked before
rendering.

Compositing follows the custom Godot engine's `Layer2D`:
`renderer_canvas_cull.cpp` defines clipping stacks and automatic isolation;
`renderer_canvas_render_rd.cpp` defines the layer blend equations. The renderer
uses linear-sRGB premultiplied RGBA16F targets, optional 4× MSAA, and converts the finished
image to premultiplied sRGB for browser presentation. Brush equations follow
Ciallo's Gaussian Airbrush shader. GPU target allocation and draw batching are
runtime choices, not serialized commands.

## Develop and verify

Docusaurus 3.10.2 requires Node.js 20 or newer; CI uses Node.js 24.

```sh
yarn install --frozen-lockfile
yarn start
yarn typecheck
yarn build
```

The production build is static and works under the configured GitHub Pages base
URL. Adding or editing an MDX entry requires rebuilding the site for publication.

Focused GPU regressions cover transparency-sensitive group opacity, clipping,
Multiply, and the shared-camera/bitmap-regeneration lifecycle across MSAA changes. They require a
WebGPU-capable browser:

```sh
yarn playwright install chromium
yarn test:rendering
```

To use installed Chrome instead, set `PLAYWRIGHT_CHANNEL=chrome`. The tests start
the dev server if it is not already running. GPU availability is required; a
missing adapter fails the tests instead of silently skipping them.
