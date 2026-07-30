import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { effectScope } from 'vue';
import { useAnimatedCounter } from './useAnimatedCounter';

describe('useAnimatedCounter', () => {
    let rafCallbacks: ((timestamp: number) => void)[];
    let rafId: number;

    beforeEach(() => {
        rafCallbacks = [];
        rafId = 1;
        vi.stubGlobal(
            'requestAnimationFrame',
            vi.fn((cb: (timestamp: number) => void) => {
                rafCallbacks.push(cb);
                return rafId++;
            }),
        );
        vi.stubGlobal(
            'cancelAnimationFrame',
            vi.fn((id: number) => {
                rafCallbacks = rafCallbacks.filter((_, i) => i !== id - 1);
            }),
        );
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    function flushRaf(timestamp: number): void {
        const callbacks = [...rafCallbacks];
        rafCallbacks = [];
        for (const cb of callbacks) {
            cb(timestamp);
        }
    }

    it('initializes displayValue at 0', () => {
        const { displayValue } = useAnimatedCounter();
        expect(displayValue.value).toBe(0);
    });

    // [duration, target, timestamp, expected]
    const INTERPOLATION_CASES: ReadonlyArray<[number, number, number, number]> = [
        [1000, 1000, 0, 0],
        [1000, 1000, 500, 500],
        [1000, 1000, 1000, 1000],
        [2000, 1000, 1000, 500],
        [2000, 1000, 2000, 1000],
        [1000, 333, 333, 111],
        [1000, 333, 999, 333],
    ];

    it.each(INTERPOLATION_CASES)(
        'with duration %s, target %s: at t=%s displays %s',
        (duration, target, timestamp, expected) => {
            const { displayValue, animateTo } = useAnimatedCounter(duration);
            animateTo(target);
            flushRaf(timestamp);
            expect(displayValue.value).toBe(expected);
        },
    );

    // [target, timestamp, expected]
    const CLAMPING_CASES: ReadonlyArray<[number, number, number]> = [
        [1000, 1500, 1000],
        [-500, 500, 0],
    ];

    it.each(CLAMPING_CASES)(
        'clamps to %s when target is %s at t=%s',
        (target, timestamp, expected) => {
            const { displayValue, animateTo } = useAnimatedCounter(1000);
            animateTo(target);
            flushRaf(timestamp);
            expect(displayValue.value).toBe(expected);
        },
    );

    it('stops requesting frames once the target is reached', () => {
        const { animateTo } = useAnimatedCounter(1000);
        animateTo(1000);

        const rafCountBefore = rafCallbacks.length;
        flushRaf(1000);

        expect(rafCallbacks.length).toBeLessThanOrEqual(rafCountBefore);
    });

    it('can be cancelled mid-animation', () => {
        const { displayValue, animateTo, cancel } = useAnimatedCounter(1000);

        animateTo(1000);
        flushRaf(500);
        expect(displayValue.value).toBe(500);

        cancel();
        expect(globalThis.cancelAnimationFrame).toHaveBeenCalled();

        flushRaf(2000);
        expect(displayValue.value).toBe(500);
    });

    it('cancels pending animation on scope dispose', () => {
        const scope = effectScope();
        const { animateTo } = scope.run(() => useAnimatedCounter(1000))!;

        animateTo(1000);
        flushRaf(500);

        const cancelSpy = globalThis.cancelAnimationFrame as ReturnType<typeof vi.fn>;
        const callsBefore = cancelSpy.mock.calls.length;

        scope.stop();

        expect(cancelSpy.mock.calls.length).toBeGreaterThan(callsBefore);
    });

    it('starts a new animation from the current displayValue', () => {
        const { displayValue, animateTo } = useAnimatedCounter(1000);

        animateTo(1000);
        flushRaf(500);
        expect(displayValue.value).toBe(500);

        animateTo(2000);
        flushRaf(1000);
        expect(displayValue.value).toBe(2000);
    });

    it('does not animate when target equals current value', () => {
        const { displayValue, animateTo } = useAnimatedCounter(1000);

        animateTo(0);
        flushRaf(500);

        expect(displayValue.value).toBe(0);
    });

    it('exposes displayValue as a writable ref that can be set directly', () => {
        const { displayValue } = useAnimatedCounter();
        displayValue.value = 42;
        expect(displayValue.value).toBe(42);
    });
});
