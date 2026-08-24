<script setup lang="ts">
import type { Grant } from '@/sovereign/domain/Grant';
import { validateSourceUrl } from '@/sovereign/infrastructure/ui/utils/validateSourceUrl';
import { useTheme } from '@/sovereign/infrastructure/ui/composables/useTheme';
import { getAimDisplay } from '@/sovereign/infrastructure/ui/constants/AimDisplay';
import { getFundingInstrumentDisplay } from '@/sovereign/infrastructure/ui/constants/FundingInstrumentDisplay';
import { getPlatformSegments } from '@/sovereign/infrastructure/ui/constants/ProductionPlatformSegments';
import { getThemeColors } from '@/sovereign/infrastructure/ui/constants/ThemeColors';
import { formatGrantAmount } from '@/sovereign/infrastructure/ui/utils/formatGrantAmount';
import { computed, onMounted, onUnmounted, ref, useId, watch } from 'vue';

const props = defineProps<{
    open: boolean;
    grant: Grant;
    sourceUrl: string | null;
}>();

const emit = defineEmits<{
    close: [];
}>();

const { themeMode, isDark } = useTheme();

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

const title = computed(() => props.grant.projectTitle ?? 'Untitled grant');
const validatedSourceUrl = computed(() => validateSourceUrl(props.sourceUrl));
const amountLabel = computed(() => formatGrantAmount(props.grant.amountUsd));

const aimDisplay = computed(() => getAimDisplay(props.grant.aim, themeMode.value));
const instrumentDisplay = computed(() =>
    getFundingInstrumentDisplay(props.grant.fundingInstrument, themeMode.value),
);
const platformSegments = computed(() => getPlatformSegments(props.grant.productionPlatforms));

const instrumentTextColor = computed(() => {
    const colors = getThemeColors(themeMode.value);
    return isDark.value ? colors.ON_LIGHT : colors.ON_ACCENT;
});

const themeVariables = computed(() => {
    const colors = getThemeColors(themeMode.value);
    return {
        '--background-color': colors.OCEAN,
        '--text-color': colors.TEXT,
        '--border-color': colors.BORDER,
        '--link-color': colors.LINK,
    };
});

function formatList(values: readonly string[]): string {
    return values.length > 0 ? values.join(', ') : 'Not specified';
}

const details = computed(() => [
    { label: 'Country', value: props.grant.country },
    { label: 'Recipient(s)', value: props.grant.recipients ?? 'Not specified' },
    { label: 'Funding estimate', value: amountLabel.value, isAmount: true },
    { label: 'Funder name', value: props.grant.funderName ?? 'Not specified' },
    { label: 'Funder agency', value: formatList(props.grant.funderAgencies) },
    { label: 'Funding instrument', key: 'fundingInstrument' },
    { label: 'Aim', key: 'aim' },
    { label: 'Platform', key: 'platform' },
    { label: 'Years disbursed', value: formatList(props.grant.yearsDisbursed) },
]);

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
    <div v-if="open" class="grant-modal-overlay" @click="emit('close')">
        <div
            ref="dialogEl"
            class="grant-modal"
            :style="{
                ...(aimDisplay
                    ? { 'border-left-color': aimDisplay.backgroundColor }
                    : { 'border-left-color': 'transparent' }),
                ...themeVariables,
            }"
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

            <dl class="grant-modal-details">
                <div v-for="row in details" :key="row.label" class="grant-modal-row">
                    <dt>{{ row.label }}</dt>
                    <dd>
                        <template v-if="row.key === 'fundingInstrument'">
                            <span
                                class="instrument-chip"
                                :style="{
                                    backgroundColor: instrumentDisplay.color,
                                    color: instrumentTextColor,
                                }"
                            >
                                {{ instrumentDisplay.label }}
                            </span>
                        </template>

                        <template v-else-if="row.key === 'aim'">
                            <span v-if="aimDisplay" class="aim-badge">
                                <span
                                    class="aim-dot"
                                    :style="{ backgroundColor: aimDisplay.backgroundColor }"
                                ></span>
                                {{ aimDisplay.label }}
                            </span>
                            <span v-else>Not specified</span>
                        </template>

                        <template v-else-if="row.key === 'platform'">
                            <div v-if="platformSegments?.length" class="platform-container">
                                <span
                                    v-for="segment in platformSegments"
                                    :key="segment.label"
                                    class="platform-segment"
                                    :class="{ 'is-active': segment.active }"
                                >
                                    {{ segment.label }}
                                </span>
                            </div>
                            <span v-else>Not specified</span>
                        </template>

                        <template v-else>
                            <span :class="{ 'amount-highlight': row.isAmount }">{{
                                row.value
                            }}</span>
                        </template>
                    </dd>
                </div>
            </dl>

            <div class="grant-modal-section">
                <h3 class="grant-modal-section-title">Description</h3>
                <p class="grant-modal-description">
                    {{ grant.description ?? 'Not specified' }}
                </p>
            </div>

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
    background-color: var(--background-color);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    border-left: 4px solid transparent;
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
    color: var(--text-color);
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
    background-color: var(--background-color);
    color: var(--text-color);
}

.grant-modal-title {
    margin: 0 28px 0.75rem 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-color);
    line-height: 1.3;
}

.grant-modal-details {
    margin: 0 0 1rem 0;
}

.grant-modal-row {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 8px;
    padding: 0.45rem 0;
    border-bottom: 1px solid var(--border-color);
    font-size: 0.75rem;
    line-height: 1.4;
    align-items: center;
}

.grant-modal-row dt {
    color: var(--text-color);
    font-weight: 600;
}

.grant-modal-row dd {
    margin: 0;
    color: var(--text-color);
    word-break: break-word;
}

.amount-highlight {
    font-weight: 600;
    color: var(--text-color);
}

.instrument-chip {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 600;
    white-space: nowrap;
}

.aim-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.aim-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
}

.platform-container {
    display: flex;
    align-items: center;
}

.platform-segment {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 18px;
    padding: 0 4px;
    border-radius: 4px;
    background-color: var(--background-color);
    border: 1px solid var(--border-color);
    color: var(--text-color);
    font-weight: 600;
    font-size: 0.68rem;
    margin-right: 4px;

    &:last-child {
        margin-right: 0;
    }
}

.platform-segment.is-active {
    color: var(--text-color);
    background-color: var(--background-color);
    border-color: var(--border-color);
}

.grant-modal-section {
    margin-bottom: 1rem;
}

.grant-modal-section-title {
    margin: 0 0 0.35rem 0;
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--text-color);
}

.grant-modal-description {
    margin: 0;
    font-size: 0.75rem;
    line-height: 1.45;
    color: var(--text-color);
}

.grant-modal-footer {
    border-top: 1px solid var(--border-color);
    padding-top: 0.75rem;
}

.grant-modal-link {
    font-weight: 500;
    font-size: 0.75rem;
    color: var(--link-color);
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
}

.grant-modal-no-url {
    color: var(--text-color);
    font-size: 0.75rem;
}
</style>
