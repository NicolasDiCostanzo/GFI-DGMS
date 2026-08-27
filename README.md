# GFI Funding Map

**GFI Funding Map** — an interactive map and dashboard that turns public funding for
alternative proteins into a visible, understandable story: what's been funded, where,
and the environmental impact of shifting that funding toward alternative proteins.

Jump to: [For everyone](#for-everyone) · [For developers & contributors](#for-developers--contributors) · [License](#license)

## For everyone

Public funding decisions for alternative proteins are usually buried in spreadsheets and
policy reports. This widget turns that data into an interactive map: click a country and
see what's been funded, by whom, and the environmental impact of shifting that funding
toward alternative proteins (greenhouse gas, land, and water reductions versus
conventional meat). It exists to help make the case for alternative-protein funding to
the people who decide it — policymakers, treasury officials, and the public.

Research backs the approach: presenting data visually, rather than as plain numbers or
text, can make a message more persuasive and engaging.<sup>[1]</sup> That's the premise
behind this project — a crucial cause deserves to be seen, not just reported on.

The environmental impact figures are grounded in the [CE Delft Ex-Ante Lifecycle
Assessment (LCA) of cultivated
meat](https://gfieurope.org/wp-content/uploads/2022/04/CE_Delft_190107_LCA_of_cultivated_meat_Def.pdf).

**Try it live:** https://d14x0zu14sb9d5.cloudfront.net/

### Embedding it on your own site

The widget is a single self-contained file that bundles everything it needs. It renders
as a custom element (`<gfi-widget>`) with an encapsulated shadow root, so it won't
clash with your site's styles or scripts.

**1. Load the script**

```html
<script type="module" src="https://d14x0zu14sb9d5.cloudfront.net/gfi-widget.js"></script>
```

This loads the same build that powers the live demo above. It always tracks the latest
`main` build — there's no versioned or SRI-pinned release yet, so a breaking change to
the widget could affect your embed without warning. If you need a stable, pinned build,
run `npm run build` yourself and host the resulting `dist/gfi-widget.js` (or
`.umd.js` for a plain `<script>` tag without `type="module"`).

**2. Place the element**

```html
<gfi-widget></gfi-widget>
```

**3. Size it**

The widget always renders at `height: 100%` and `width: 100%` of its host element.
Size the host element with CSS:

```html
<style>
    gfi-widget {
        display: block;
        width: 100%;
        height: 600px;
    }
</style>
```

**Attributes**

| Attribute      | Type   | Description                                                            |
| -------------- | ------ | ------------------------------------------------------------------------ |
| `theme`        | string | One of `light`, `dark`, `colorblind-light`, `colorblind-dark`.         |

```html
<gfi-widget theme="light"></gfi-widget>
```

**WordPress**: add the script via a plugin or theme `functions.php`, then insert the
element in a Custom HTML block.

**Wix**: use the "Embed HTML" app, paste the `<script>` tag and the `<gfi-widget>`
element, and set a fixed height on the embed container.

---

<sup>[1]</sup> Pandey, Manivannan, Nov, Satterthwaite & Bertini, "The Persuasive Power of
Data Visualization," *IEEE Transactions on Visualization and Computer Graphics* 20(12),
2014. DOI: [10.1109/TVCG.2014.2346419](https://doi.org/10.1109/TVCG.2014.2346419).

## For developers & contributors

This project is open source and welcomes contributions. It's a Vue 3 + TypeScript web
component built with Vite, following hexagonal architecture and domain-driven design —
see [AGENTS.md](AGENTS.md) for the full architecture, coding standards, testing
requirements, and CI pipeline. Read it before contributing; it's the source of truth for
how this codebase is organized and what CI enforces.

### Getting started

```bash
npm install
npm run dev        # start Vite dev server on http://localhost:5173
npm run build      # build the library (dist/gfi-widget.js + .umd.js)
npm run check      # lint, format check, typecheck, architecture, depcruise
npm run test       # unit tests
npm run test:e2e   # Playwright e2e tests
```

Open http://localhost:5173/embed-test.html to test the widget embedded in a host page.

### Contributing

Open an issue or pull request using the templates in
[`.github/`](.github/ISSUE_TEMPLATE) — there's no separate contributing guide beyond
AGENTS.md, which covers the dependency rules, test coverage requirements, and code style
that CI checks on every PR.

### Bundle size

The build enforces a gzip size limit (default 120 kB) via `npm run check:size`,
configurable with the `MAX_GZIP_KB` environment variable. The 110m world topology is used
to keep the bundle small.

## License

This project is licensed under [AGPL-3.0-only](LICENSE).

In practice: embedding the widget as documented above, unmodified, doesn't put any
license obligation on your own site or code. If you fork this project, modify it, and run
your modified version as a service for other people, AGPL §13 requires you to offer those
users the corresponding modified source. This is a plain-language summary, not legal
advice — talk to a lawyer if your situation needs a definitive answer.
