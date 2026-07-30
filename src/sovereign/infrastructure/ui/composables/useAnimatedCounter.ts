import { onScopeDispose, ref } from 'vue';

const DEFAULT_DURATION = 1000;

export function useAnimatedCounter(duration = DEFAULT_DURATION) {
    const displayValue = ref(0);
    let rafId: number | null = null;
    let startValue = 0;
    let targetValue = 0;

    function cancel(): void {
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    function step(timestamp: number): void {
        if (rafId === null) return;

        const clampedTarget = Math.max(0, targetValue);
        const progress = Math.min(timestamp / duration, 1);
        const current = startValue + (clampedTarget - startValue) * progress;
        displayValue.value = Math.round(current);

        if (progress < 1) {
            rafId = requestAnimationFrame(step);
        } else {
            rafId = null;
        }
    }

    function animateTo(target: number): void {
        cancel();
        targetValue = target;
        startValue = displayValue.value;

        if (target === startValue) {
            return;
        }

        rafId = requestAnimationFrame(step);
    }

    onScopeDispose(() => {
        cancel();
    });

    return { displayValue, animateTo, cancel };
}
