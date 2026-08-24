<script setup lang="ts">
import { computed, type Component } from 'vue';
import type { EnrichedGrantRow, GrantTableColumn } from './GrantTable.types';
import GrantTableCellAmount from './cells/GrantTableCellAmount.vue';
import GrantTableCellChip from './cells/GrantTableCellChip.vue';
import GrantTableCellDescription from './cells/GrantTableCellDescription.vue';
import GrantTableCellFallback from './cells/GrantTableCellFallback.vue';
import GrantTableCellLink from './cells/GrantTableCellLink.vue';
import GrantTableCellPlatform from './cells/GrantTableCellPlatform.vue';
import GrantTableCellText from './cells/GrantTableCellText.vue';

const props = defineProps<{
    row: EnrichedGrantRow;
    columns: ReadonlyArray<GrantTableColumn>;
    instrumentTextColor: string;
}>();

const emit = defineEmits<{
    'open-details': [grantId: string];
}>();

interface CellDefinition {
    component: Component;
    props?: Record<string, unknown>;
}

function cellFor(col: GrantTableColumn): CellDefinition {
    const { row } = props;
    switch (col) {
        case 'fundingInstrument':
            return {
                component: GrantTableCellChip,
                props: { row, instrumentTextColor: props.instrumentTextColor },
            };
        case 'platform':
            return { component: GrantTableCellPlatform, props: { row } };
        case 'funderAgencies':
            return {
                component: GrantTableCellText,
                props: { text: formatList(row.grant.funderAgencies) },
            };
        case 'funderName':
            return {
                component: GrantTableCellText,
                props: { text: row.grant.funderName ?? 'Not specified' },
            };
        case 'recipients':
            return {
                component: GrantTableCellText,
                props: { text: row.grant.recipients ?? 'Not specified' },
            };
        case 'projectTitle':
            return {
                component: GrantTableCellText,
                props: {
                    text: row.grant.projectTitle ?? 'Untitled grant',
                    tdClass: 'title-cell',
                },
            };
        case 'yearsDisbursed':
            return {
                component: GrantTableCellText,
                props: { text: formatList(row.grant.yearsDisbursed) },
            };
        case 'description':
            return {
                component: GrantTableCellDescription,
                props: {
                    row,
                    onOpenDetails: (grantId: string) => emit('open-details', grantId),
                },
            };
        case 'amountUsd':
            return { component: GrantTableCellAmount, props: { row } };
        case 'url':
            return { component: GrantTableCellLink, props: { row } };
        default:
            return { component: GrantTableCellFallback };
    }
}

const cellDefinitions = computed(() => props.columns.map((col) => ({ col, ...cellFor(col) })));

const rowStyle = computed(() =>
    props.row.aim
        ? {
              backgroundColor: props.row.aim.backgroundColor,
              borderColor: props.row.aim.borderColor,
          }
        : {},
);

function formatList(values: readonly string[]): string {
    return values.length > 0 ? values.join(', ') : 'Not specified';
}
</script>

<template>
    <tr class="grant-row grant-item" :style="rowStyle">
        <component
            :is="cell.component"
            v-for="cell in cellDefinitions"
            :key="cell.col"
            v-bind="cell.props"
        />
    </tr>
</template>

<style scoped>
td {
    height: 56px;
    box-sizing: border-box;
    padding: 10px 12px;
    vertical-align: top;
    line-height: 1.4;
}

.grant-row {
    border-left: 4px solid transparent;
    transition: background-color 0.15s ease-in-out;
    box-shadow: 0 2px 4px rgba(127, 127, 127, 0.15);
}

.grant-row:last-child td {
    border-bottom: none;
}
</style>
