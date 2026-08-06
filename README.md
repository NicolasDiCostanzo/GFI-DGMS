# GFI-DGMS

GFI ROI Simulator — a self-contained web component for visualizing and calculating Return on Investment data. It renders as a custom element (`<gfi-dgms-widget>`) with an encapsulated shadow root, so it can be embedded on any website (WordPress, Wix, plain HTML, etc.) without style or script conflicts.

## Embedding

The widget is built as a single self-contained file (`dist/gfi-dgms-widget.umd.js`) that bundles Vue and all data. No other script or stylesheet is required.

### 1. Load the script

The UMD bundle is self-contained (Vue is bundled in), but it references `process.env.NODE_ENV` at runtime. Add a tiny polyfill before the script tag so the widget works in any browser:

```html
<!-- Polyfill `process.env` for the UMD bundle (Vue references it at runtime). -->
<script>
    window.process ??= { env: {} };
    window.process.env ??= {};
</script>

<!-- Load the self-contained UMD bundle from the CDN. -->
<script src="https://cdn.jsdelivr.net/gh/NicolasDiCostanzo/GFI-DGMS@latest/dist/gfi-dgms-widget.umd.js"></script>
```

### 2. Place the element

```html
<gfi-dgms-widget></gfi-dgms-widget>
```

### 3. Size it

The widget always renders at `height: 100%` and `width: 100%` of its host element, regardless of any attributes. Size the host element with CSS:

```html
<style>
    gfi-dgms-widget {
        display: block;
        width: 100%;
        height: 600px;
    }
</style>
```

### Attributes

| Attribute      | Type   | Description                                                         |
| -------------- | ------ | ------------------------------------------------------------------- |
| `theme`        | string | One of `light`, `dark`, `colorblind-light`, `colorblind-dark`.      |
| `api-endpoint` | string | Reserved for future dynamic data loading; does not affect widget size. |

Example with all attributes:

```html
<gfi-dgms-widget
    theme="light"
    api-endpoint="https://api.example.com/countries"
></gfi-dgms-widget>
```

### WordPress

Add the script via a plugin or theme `functions.php`, then insert the element in a Custom HTML block.

### Wix

Use the "Embed HTML" app, paste the `<script>` tag and the `<gfi-dgms-widget>` element, and set a fixed height on the embed container.

## Development

```bash
npm install
npm run dev        # start Vite dev server (index.html)
npm run build      # build the library (dist/gfi-dgms-widget.js + .umd.js)
npm run check:size # verify gzip size stays under the configured limit
```

Open `dev-ce.html` in the dev server for a focused custom-element demo.

## Bundle Size

The build enforces a gzip size limit (default 120 kB) via `npm run check:size`. The limit is configurable with the `MAX_GZIP_KB` environment variable. The 110m world topology is used to keep the bundle small.
