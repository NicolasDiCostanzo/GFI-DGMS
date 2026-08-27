import App from '@/App.vue';
import { defineCustomElement } from 'vue';

export const GFI_WIDGET_TAG = 'gfi-widget';

export function polyfillProcessEnv(): void {
    const globalObj = globalThis as unknown as Record<string, unknown>;
    const existingProcess = globalObj['process'];
    const proc =
        existingProcess !== null &&
        (typeof existingProcess === 'object' || typeof existingProcess === 'function')
            ? (existingProcess as Record<string, unknown>)
            : {};
    if (proc.env === null || (typeof proc.env !== 'object' && typeof proc.env !== 'function')) {
        (proc as Record<string, unknown>).env = {};
    }
    const env = (proc as Record<string, unknown>).env as Record<string, unknown>;
    if (env.NODE_ENV === undefined) {
        env.NODE_ENV = 'production';
    }
    globalObj['process'] = proc;
}

polyfillProcessEnv();

export const GfiWidgetElement = defineCustomElement(App);

export function defineGfiWidget(): void {
    if (!customElements.get(GFI_WIDGET_TAG)) {
        customElements.define(GFI_WIDGET_TAG, GfiWidgetElement);
    }
}

defineGfiWidget();

export default GfiWidgetElement;
