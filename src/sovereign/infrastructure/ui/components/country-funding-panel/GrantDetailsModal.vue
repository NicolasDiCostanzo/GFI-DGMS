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

onMounted(() => {
    window.addEventListener('keydown', handleEscape);
    if (props.open) {
        previouslyFocused.value = document.activeElement as HTMLElement | null;
        dialogEl.value?.focus();
    }
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleEscape);
    if (props.open) {
        previouslyFocused.value?.focus?.();
        previouslyFocused.value = null;
    }
});
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
                    ✕
                </button>
                <h2 :id="dialogTitleId" class="grant-modal-title">{{ title }}</h2>
                <div class="grant-modal-funder">{{ funderName ?? 'Not specified' }}</div>
                <div class="grant-modal-description">{{ description ?? 'Not specified' }}</div>
                <div class="grant-modal-footer">
                    <a
                        v-if="validatedSourceUrl"
                        class="grant-modal-link"
                        :href="validatedSourceUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        View announcement →
                    </a>
                    <span v-else class="grant-modal-no-url">—</span>
                </div>
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
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(2px);
}

.grant-modal {
    position: relative;
    max-width: 440px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    background-color: #1a1a1a;
    color: #cccccc;
    border: 1px solid #2a2a2a;
    border-radius: 8px;
    padding: 1.25rem;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
}

.grant-modal-close-button {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: #aaaaaa;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition:
        background-color 0.15s ease,
        color 0.15s ease;
}

.grant-modal-close-button:hover {
    background-color: #262626;
    color: #ffffff;
}

.grant-modal-title {
    margin: 0 28px 0.5rem 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: #ffffff;
    line-height: 1.3;
}

.grant-modal-funder {
    margin-bottom: 0.85rem;
    font-weight: 600;
    font-size: 0.78rem;
    color: #aaaaaa;
}

.grant-modal-description {
    margin-bottom: 1rem;
    font-size: 0.75rem;
    line-height: 1.45;
    color: #cccccc;
}

.grant-modal-footer {
    border-top: 1px solid #262626;
    padding-top: 0.75rem;
}

.grant-modal-link {
    font-weight: 500;
    font-size: 0.75rem;
    color: #1c92ff;
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
}

.grant-modal-no-url {
    color: #666666;
    font-size: 0.75rem;
}
</style>
