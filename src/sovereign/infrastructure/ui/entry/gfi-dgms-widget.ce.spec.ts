import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Element, {
    GFI_DGMS_WIDGET_TAG,
    GfiDgmsWidgetElement,
    defineGfiDgmsWidget,
    polyfillProcessEnv,
} from './gfi-dgms-widget.ce';

describe('gfi-dgms-widget custom element entry', () => {
    beforeEach(() => {
        // happy-dom resets the customElements registry between test files, so the
        // import-time auto-registration is not visible here. Register explicitly.
        defineGfiDgmsWidget();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('registers the custom element under the expected tag', () => {
        expect(customElements.get(GFI_DGMS_WIDGET_TAG)).toBe(GfiDgmsWidgetElement);
    });

    it('leaves the existing registration untouched when already defined', () => {
        const defineSpy = vi.spyOn(customElements, 'define');

        defineGfiDgmsWidget();

        expect(defineSpy).not.toHaveBeenCalled();
        expect(customElements.get(GFI_DGMS_WIDGET_TAG)).toBe(GfiDgmsWidgetElement);
    });

    it('default-exports the custom element constructor', () => {
        expect(Element).toBe(GfiDgmsWidgetElement);
    });
});

describe('polyfillProcessEnv', () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const g = globalThis as any;
    const hadProcess = 'process' in g;
    const originalProcess = g.process;

    afterEach(() => {
        if (hadProcess) {
            g.process = originalProcess;
        } else {
            delete g.process;
        }
    });

    it('creates a default process.env when process is undefined', () => {
        delete g.process;

        polyfillProcessEnv();

        expect(g.process).toEqual({ env: {} });
    });

    it('creates an empty env when process.env is undefined', () => {
        g.process = { env: undefined };

        polyfillProcessEnv();

        expect(g.process.env).toEqual({});
    });

    it('does not overwrite an existing process and env', () => {
        g.process = { env: { NODE_ENV: 'production' } };

        polyfillProcessEnv();

        expect(g.process).toEqual({ env: { NODE_ENV: 'production' } });
    });
    /* eslint-enable @typescript-eslint/no-explicit-any */
});
