<script setup lang="ts">
import type { ThemeMode } from '@/sovereign/domain/constants/MapColors';
import { validateSourceUrl } from '@/sovereign/domain/services/validateSourceUrl';
import { getThemeColors } from '@/sovereign/infrastructure/ui/constants/ThemeColors';
import { computed, onMounted, onUnmounted, ref, useId, watch } from 'vue';

const props = defineProps<{
    open: boolean;
    title: string;
    funderName: string | null;
    description: string | null;
    sourceUrl: string | null;
    themeMode: ThemeMode;
}>();

const emit = defineEmits<{
    close: [];
}>();

const previouslyFocused = ref<HTMLElement | null>(null);
const dialogEl = ref<HTMLElement | null>(null);
const dialogTitleId = useId();

watch(
    () => props.open,
    (open) => {
        if (open) {
            previouslyFocused.value = document.activeElement as HTMLElement | null;
            dialogEl.value?.focus();
        } else {
            previouslyFocused.value?.focus?.();
            previouslyFocused.value = null;
        }
    },
    { flush: 'post' },
);

const cssVars = computed(() => {
    const colors = getThemeColors(props.themeMode);
    return {
        '--sidebar-bg': colors.SIDEBAR_BG,
        '--text': colors.TEXT,
        '--border': colors.BORDER,
        '--link': colors.LINK,
        '--muted-light': colors.MUTED_LIGHT,
        '--panel-shadow-strong': colors.PANEL_SHADOW_STRONG,
    };
});

const validatedSourceUrl = computed(() => validateSourceUrl(props.sourceUrl));

function handleEscape(event: KeyboardEvent): void {
    if (props.open && event.key === 'Escape') {
        emit('close');
    }
}

onMounted(() => window.addEventListener('keydown', handleEscape));
onUnmounted(() => window.removeEventListener('keydown', handleEscape));
</script>

<template>
    <Teleport to="body">
        <div v-if="open" class="grant-modal-overlay" :style="cssVars" @click="emit('close')">
            <div
                ref="dialogEl"
                class="grant-modal"
                role="dialog"
                aria-modal="true"
                tabindex="-1"
                :aria-labelledby="dialogTitleId"
                @click.stop
            >
                <button
                    class="grant-modal-close-button"
                    type="button"
                    aria-label="Close details"
                    @click="emit('close')"
                >
                    ×
                </button>
                <h2 :id="dialogTitleId" class="grant-modal-title">{{ title }}</h2>
                <p class="grant-modal-funder">{{ funderName ?? 'Not specified' }}</p>
                <p class="grant-modal-description">{{ description ?? 'Not specified' }}</p>
                <a
                    v-if="validatedSourceUrl"
                    class="grant-modal-link"
                    :href="validatedSourceUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    View announcement
                </a>
                <span v-else class="grant-modal-no-url">Not specified</span>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.grant-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
}

.grant-modal {
    position: relative;
    max-width: 420px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    background: var(--sidebar-bg);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 4px 24px var(--panel-shadow-strong);
}

.grant-modal-close-button {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--text);
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
}

.grant-modal-close-button:hover {
    background: var(--muted-light);
}

.grant-modal-title {
    margin: 0 32px 8px 0;
    font-size: 16px;
    font-weight: 600;
}

.grant-modal-funder {
    margin: 0 0 12px 0;
    font-weight: 600;
    font-size: 13px;
}

.grant-modal-description {
    margin: 0 0 16px 0;
    font-size: 13px;
    line-height: 1.5;
}

.grant-modal-link {
    color: var(--link);
    font-weight: 500;
    font-size: 13px;
}

.grant-modal-no-url {
    color: var(--text);
    font-size: 13px;
}
</style>
