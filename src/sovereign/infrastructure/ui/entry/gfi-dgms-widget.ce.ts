import App from '@/App.vue';
import { defineCustomElement } from 'vue';

export const GFI_DGMS_WIDGET_TAG = 'gfi-dgms-widget';

// Polyfill for UMD browser usage where `process` is not available.
// Vite's build.define should replace these, but the UMD bundle still contains
// raw references; this guard ensures the widget works when loaded via <script>.
export function polyfillProcessEnv(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = globalThis as any;
    if (typeof g.process === 'undefined') {
        g.process = { env: {} };
    }
    if (typeof g.process.env === 'undefined') {
        g.process.env = {};
    }
}

// Apply the polyfill at import time for browser/UMD usage.
polyfillProcessEnv();

export const GfiDgmsWidgetElement = defineCustomElement(App);

export function defineGfiDgmsWidget(): void {
    if (!customElements.get(GFI_DGMS_WIDGET_TAG)) {
        customElements.define(GFI_DGMS_WIDGET_TAG, GfiDgmsWidgetElement);
    }
}

defineGfiDgmsWidget();

export default GfiDgmsWidgetElement;
