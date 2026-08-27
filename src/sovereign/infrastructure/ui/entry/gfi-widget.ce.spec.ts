import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
    GFI_WIDGET_TAG,
    GfiWidgetElement,
    defineGfiWidget,
    polyfillProcessEnv,
} from './gfi-widget.ce';

describe('gfi-widget custom element entry', () => {
    beforeEach(() => {
        defineGfiWidget();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('registers the custom element under the expected tag', () => {
        expect(customElements.get(GFI_WIDGET_TAG)).toBe(GfiWidgetElement);
    });

    it('leaves the existing registration untouched when already defined', () => {
        const defineSpy = vi.spyOn(customElements, 'define');

        defineGfiWidget();

        expect(defineSpy).not.toHaveBeenCalled();
        expect(customElements.get(GFI_WIDGET_TAG)).toBe(GfiWidgetElement);
    });
});

describe('polyfillProcessEnv', () => {
    const globalObj = globalThis as unknown as Record<string, unknown>;
    const hadProcess = Object.prototype.hasOwnProperty.call(globalObj, 'process');
    const originalProcess = globalObj['process'];

    afterEach(() => {
        if (hadProcess) {
            globalObj['process'] = originalProcess;
        } else {
            delete globalObj['process'];
        }
    });

    it.each([
        {
            name: 'when process is undefined',
            setup: () => {
                delete globalObj['process'];
            },
            expected: { env: { NODE_ENV: 'production' } },
        },
        {
            name: 'when process.env is undefined',
            setup: () => {
                globalObj['process'] = { env: undefined };
            },
            expected: { env: { NODE_ENV: 'production' } },
        },
    ])('polyfills missing process/env $name', ({ setup, expected }) => {
        setup();

        polyfillProcessEnv();

        expect(globalObj['process']).toEqual(expected);
    });

    it('does not overwrite an existing process and env', () => {
        globalObj['process'] = { env: { NODE_ENV: 'production' } };

        polyfillProcessEnv();

        expect(globalObj['process']).toEqual({ env: { NODE_ENV: 'production' } });
    });
});
