import { ref } from 'vue';

interface TooltipState {
    visible: boolean;
    text: string;
    x: number;
    y: number;
}

export function useMapTooltip() {
    const tooltip = ref<TooltipState>({
        visible: false,
        text: '',
        x: 0,
        y: 0,
    });

    function showTooltip(
        text: string,
        { clientX, clientY }: { clientX: number; clientY: number },
    ): void {
        tooltip.value.text = text;
        tooltip.value.x = clientX;
        tooltip.value.y = clientY;
        tooltip.value.visible = true;
    }

    function hideTooltip(): void {
        tooltip.value.visible = false;
    }

    return {
        tooltip,
        showTooltip,
        hideTooltip,
    };
}
