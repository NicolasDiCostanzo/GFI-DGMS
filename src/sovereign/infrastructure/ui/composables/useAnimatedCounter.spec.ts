import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { effectScope } from 'vue';
import { useAnimatedCounter } from './useAnimatedCounter';
import { CLAMPING_CASES, INTERPOLATION_CASES } from './useAnimatedCounter.spec.fixtures';

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
        vi.stubGlobal('performance', {
            now: () => 50000,
        });
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

    it.each(INTERPOLATION_CASES)(
        'with duration %s, target %s: after %sms displays %s',
        (duration, target, elapsed, expected) => {
            const { displayValue, animateTo } = useAnimatedCounter(duration);
            animateTo(target);
            flushRaf(50000 + elapsed);
            expect(displayValue.value).toBe(expected);
        },
    );

    it.each(CLAMPING_CASES)(
        'clamps to %s when target is %s after %sms',
        (target, elapsed, expected) => {
            const { displayValue, animateTo } = useAnimatedCounter(1000);
            animateTo(target);
            flushRaf(50000 + elapsed);
            expect(displayValue.value).toBe(expected);
        },
    );

    it('stops requesting frames once the target is reached', () => {
        const { animateTo } = useAnimatedCounter(1000);
        animateTo(1000);

        const rafCountBefore = rafCallbacks.length;
        flushRaf(51000);

        expect(rafCallbacks.length).toBeLessThanOrEqual(rafCountBefore);
    });

    it('can be cancelled mid-animation', () => {
        const { displayValue, animateTo, cancel } = useAnimatedCounter(1000);

        animateTo(1000);
        flushRaf(50500);
        expect(displayValue.value).toBe(500);

        cancel();
        expect(globalThis.cancelAnimationFrame).toHaveBeenCalled();

        flushRaf(52000);
        expect(displayValue.value).toBe(500);
    });

    it('cancels pending animation on scope dispose', () => {
        const scope = effectScope();
        const { animateTo } = scope.run(() => useAnimatedCounter(1000))!;

        animateTo(1000);
        flushRaf(50500);

        const cancelSpy = globalThis.cancelAnimationFrame as ReturnType<typeof vi.fn>;
        const callsBefore = cancelSpy.mock.calls.length;

        scope.stop();

        expect(cancelSpy.mock.calls.length).toBeGreaterThan(callsBefore);
    });

    it('starts a new animation from the current displayValue', () => {
        const { displayValue, animateTo } = useAnimatedCounter(1000);

        animateTo(1000);
        flushRaf(50500);
        expect(displayValue.value).toBe(500);

        animateTo(2000);
        flushRaf(51500);
        expect(displayValue.value).toBe(2000);
    });

    it('does not animate when target equals current value', () => {
        const { displayValue, animateTo } = useAnimatedCounter(1000);

        animateTo(0);
        flushRaf(50500);

        expect(displayValue.value).toBe(0);
    });

    it('exposes displayValue as a writable ref that can be set directly', () => {
        const { displayValue } = useAnimatedCounter();
        displayValue.value = 42;
        expect(displayValue.value).toBe(42);
    });
});
