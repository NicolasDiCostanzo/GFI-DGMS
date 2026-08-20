import { onMounted, onUnmounted, ref, type Ref } from 'vue';

export function useMediaQuery(query: string): Ref<boolean> {
    const matches = ref(false);
    const mediaQueryList = window.matchMedia(query);

    function update(): void {
        matches.value = mediaQueryList.matches;
    }

    onMounted(() => {
        update();
        mediaQueryList.addEventListener('change', update);
    });

    onUnmounted(() => {
        mediaQueryList.removeEventListener('change', update);
    });

    return matches;
}
