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

    it('creates a default process.env with NODE_ENV production when process is undefined', () => {
        delete g.process;

        polyfillProcessEnv();

        expect(g.process).toEqual({ env: { NODE_ENV: 'production' } });
    });

    it('creates an env with NODE_ENV production when process.env is undefined', () => {
        g.process = { env: undefined };

        polyfillProcessEnv();

        expect(g.process.env).toEqual({ NODE_ENV: 'production' });
    });

    it('sets NODE_ENV to production when env exists but lacks NODE_ENV', () => {
        g.process = { env: { foo: 'bar' } };

        polyfillProcessEnv();

        expect(g.process.env).toEqual({ foo: 'bar', NODE_ENV: 'production' });
    });

    it('does not overwrite an existing process, env, and NODE_ENV', () => {
        g.process = { env: { NODE_ENV: 'production' } };

        polyfillProcessEnv();

        expect(g.process).toEqual({ env: { NODE_ENV: 'production' } });
    });

    it('does not overwrite an existing NODE_ENV even if set to a different value', () => {
        g.process = { env: { NODE_ENV: 'development' } };

        polyfillProcessEnv();

        expect(g.process.env.NODE_ENV).toBe('development');
    });
    /* eslint-enable @typescript-eslint/no-explicit-any */
});
