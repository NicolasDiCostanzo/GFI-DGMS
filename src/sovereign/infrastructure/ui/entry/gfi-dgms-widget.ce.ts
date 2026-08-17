import App from '@/App.vue';
import { defineCustomElement } from 'vue';

export const GFI_DGMS_WIDGET_TAG = 'gfi-dgms-widget';

export function polyfillProcessEnv(): void {
    const globalObj = globalThis as unknown as Record<string, unknown>;
    const proc = (globalObj['process'] as Record<string, unknown> | undefined) ?? {};
    if (typeof proc.env === 'undefined') {
        (proc as Record<string, unknown>).env = {};
    }
    const env = (proc as Record<string, unknown>).env as Record<string, unknown>;
    if (env.NODE_ENV === undefined) {
        env.NODE_ENV = 'production';
    }
    globalObj['process'] = proc;
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
