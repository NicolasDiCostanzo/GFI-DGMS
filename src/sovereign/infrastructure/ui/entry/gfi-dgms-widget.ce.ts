import App from '@/App.vue';
import { defineCustomElement } from 'vue';

export const GFI_DGMS_WIDGET_TAG = 'gfi-dgms-widget';

export function polyfillProcessEnv(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = globalThis as any;
    if (typeof g.process === 'undefined') {
        g.process = {};
    }
    if (typeof g.process.env === 'undefined') {
        g.process.env = {};
    }
    if (g.process.env.NODE_ENV === undefined) {
        g.process.env.NODE_ENV = 'production';
    }
}

polyfillProcessEnv();

export const GfiDgmsWidgetElement = defineCustomElement(App);

export function defineGfiDgmsWidget(): void {
    if (!customElements.get(GFI_DGMS_WIDGET_TAG)) {
        customElements.define(GFI_DGMS_WIDGET_TAG, GfiDgmsWidgetElement);
    }
}

defineGfiDgmsWidget();

export default GfiDgmsWidgetElement;
