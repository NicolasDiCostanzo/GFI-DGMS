<script setup lang="ts">
import type { CountryFunding } from '@/sovereign/domain/CountryFunding';
import type { Grant } from '@/sovereign/domain/Grant';
import { computed, ref } from 'vue';
import { EU_AMBITION_SCENARIOS } from '../constants/EuAmbitionScenarios';
import { calculateEuFundingTodayUsd } from '../utils/calculateEuFundingToday';
import { formatInvestment } from '../utils/formatInvestment';

const props = withDefaults(
    defineProps<{
        countryFundings?: readonly CountryFunding[];
        unattributedGrants?: readonly Grant[];
    }>(),
    {
        countryFundings: () => [],
        unattributedGrants: () => [],
    },
);

type StopKey = 'today' | 'moderate' | 'highAmbition';

const selectedStop = ref<StopKey>('today');

const todayFundingLabel = computed(() =>
    formatInvestment(
        calculateEuFundingTodayUsd(props.countryFundings, props.unattributedGrants) / 1_000_000,
    ),
);

const selectedScenario = computed(
    () => EU_AMBITION_SCENARIOS.find((scenario) => scenario.key === selectedStop.value) ?? null,
);

const stopKeys: readonly StopKey[] = [
    'today',
    ...EU_AMBITION_SCENARIOS.map((scenario) => scenario.key),
];

function selectStop(stop: StopKey): void {
    selectedStop.value = stop;
}

function onStopsKeydown(event: KeyboardEvent): void {
    const currentIndex = stopKeys.indexOf(selectedStop.value);
    let nextIndex: number | undefined;

    switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
            nextIndex = (currentIndex + 1) % stopKeys.length;
            break;
        case 'ArrowLeft':
        case 'ArrowUp':
            nextIndex = (currentIndex - 1 + stopKeys.length) % stopKeys.length;
            break;
        case 'Home':
            nextIndex = 0;
            break;
        case 'End':
            nextIndex = stopKeys.length - 1;
            break;
        default:
            return;
    }

    event.preventDefault();
    const nextStop = stopKeys[nextIndex];
    selectedStop.value = nextStop;
    const buttons = (event.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>(
        '.dial-stop',
    );
    buttons[nextIndex]?.focus();
}
</script>

<template>
    <div class="eu-ambition-dial">
        <div
            class="dial-stops"
            role="group"
            aria-label="EU policy ambition scenario"
            @keydown="onStopsKeydown"
        >
            <button
                type="button"
                class="dial-stop"
                :class="{ active: selectedStop === 'today' }"
                :aria-pressed="selectedStop === 'today'"
                @click="selectStop('today')"
            >
                Today
            </button>
            <button
                v-for="scenario in EU_AMBITION_SCENARIOS"
                :key="scenario.key"
                type="button"
                class="dial-stop"
                :class="{ active: selectedStop === scenario.key }"
                :aria-pressed="selectedStop === scenario.key"
                @click="selectStop(scenario.key)"
            >
                {{ scenario.label }}
            </button>
        </div>

        <div v-if="selectedStop === 'today'" class="dial-figures">
            <div class="figure-value">{{ todayFundingLabel }}</div>
            <div class="figure-label">total public R&amp;I funding tracked across the EU</div>
        </div>

        <div v-else-if="selectedScenario" class="dial-figures">
            <div class="figure-value">€{{ selectedScenario.gvaEurBillions }}bn/year GVA</div>
            <div class="figure-value">{{ selectedScenario.jobs.toLocaleString('en-US') }} jobs</div>
            <div class="figure-value">
                €{{ selectedScenario.domesticMarketEurBillions }}bn domestic market, €{{
                    selectedScenario.exportsEurBillions
                }}bn exports
            </div>
            <div class="figure-value">
                €{{ selectedScenario.publicInvestmentEurBillionsPerYear }}bn/year public investment
                needed
            </div>
            <p class="figure-source">
                Published projection for 2040 under a {{ selectedScenario.label }} scenario — not
                derived from the funding total shown under "Today". Source: Systemiq (2026),
                commissioned by GFI Europe.
            </p>
        </div>
    </div>
</template>

<style scoped>
.eu-ambition-dial {
    background: var(--sidebar-bg, rgba(255, 255, 255, 0.95));
    border-radius: 8px;
    padding: 12px 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    font-size: 13px;
}

.dial-stops {
    display: flex;
    gap: 4px;
    margin-bottom: 8px;
}

.dial-stop {
    flex: 1;
    font-size: 11px;
    padding: 4px 6px;
    border: 1px solid rgba(128, 128, 128, 0.4);
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
}

.dial-stop.active {
    background: var(--accent, #2196f3);
    color: #ffffff;
    border-color: var(--accent, #2196f3);
}

.dial-figures {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.figure-value {
    font-weight: 600;
}

.figure-label {
    font-size: 11px;
}

.figure-source {
    font-size: 11px;
    font-style: italic;
    margin: 6px 0 0;
}
</style>
