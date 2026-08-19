<script setup lang="ts">
import type { Grant } from '@/sovereign/domain/Grant';
import type { ThemeMode } from '@/sovereign/domain/constants/MapColors';
import type { AimDisplay } from '@/sovereign/infrastructure/ui/constants/AimDisplay';
import type { FundingInstrumentDisplay } from '@/sovereign/infrastructure/ui/constants/FundingInstrumentDisplay';
import type { PlatformSegment } from '@/sovereign/infrastructure/ui/constants/ProductionPlatformSegments';
import { formatGrantAmount } from '@/sovereign/infrastructure/ui/utils/formatGrantAmount';
import { computed, ref } from 'vue';
import GrantDetailsModal from './GrantDetailsModal.vue';

const props = defineProps<{
    grant: Grant;
    sourceUrl: string | null;
    aim: AimDisplay | null;
    instrument: FundingInstrumentDisplay;
    segments: readonly PlatformSegment[] | null;
    instrumentTextColor: string;
    themeMode: ThemeMode;
}>();

const isModalOpen = ref(false);

const cardStyle = computed(() =>
    props.aim
        ? { borderLeftColor: props.aim.borderColor, backgroundColor: props.aim.backgroundColor }
        : {},
);

const amountLabel = computed(() => formatGrantAmount(props.grant.amountUsd));
</script>

<template>
    <div class="grant-card" :style="cardStyle">
        <div class="grant-card-header">
            <span class="grant-card-title">{{ grant.projectTitle ?? 'Untitled grant' }}</span>
            <span class="grant-card-amount">{{ amountLabel }}</span>
        </div>
        <div class="grant-card-subheader">{{ grant.recipients ?? 'Not specified' }}</div>
        <div class="grant-card-badges">
            <span
                class="instrument-chip"
                :style="{ backgroundColor: instrument.color, color: instrumentTextColor }"
            >
                {{ instrument.label }}
            </span>
            <span
                v-for="segment in segments ?? []"
                :key="segment.label"
                class="platform-segment"
                :class="{ 'is-active': segment.active }"
            >
                {{ segment.label }}
            </span>
        </div>
        <button
            class="grant-card-details-trigger"
            type="button"
            :aria-label="`View details for ${grant.projectTitle ?? 'Untitled grant'}`"
            @click="isModalOpen = true"
        >
            View details
        </button>
        <GrantDetailsModal
            :open="isModalOpen"
            :title="grant.projectTitle ?? 'Untitled grant'"
            :funder-name="grant.funderName"
            :description="grant.description"
            :source-url="sourceUrl"
            :theme-mode="themeMode"
            @close="isModalOpen = false"
        />
    </div>
</template>

<style scoped>
.grant-card {
    border-left: 4px solid transparent;
    border-radius: 8px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    color: var(--text);
    box-shadow: 0 2px 4px rgba(127, 127, 127, 0.6);
}

.grant-card-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    font-weight: 600;
}

.grant-card-title {
    font-size: 0.85rem;
}

.grant-card-amount {
    white-space: nowrap;
}

.grant-card-subheader {
    font-size: 0.75rem;
}

.grant-card-badges {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
}

.instrument-chip {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 600;
    white-space: nowrap;
}

.platform-segment {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 18px;
    padding: 0 4px;
    border-radius: 4px;
    border: 1px solid var(--border);
    font-weight: 600;
    font-size: 0.68rem;
}

.platform-segment.is-active {
    background-color: var(--accent);
    border-color: var(--accent);
}

.grant-card-details-trigger {
    align-self: flex-start;
    background: none;
    border: none;
    padding: 0;
    color: var(--link);
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
}

.grant-card-details-trigger:hover {
    text-decoration: underline;
}
</style>
