<script setup lang="ts">
import { toPercentage } from '@/shared/utils/toPercentage';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import GeoJSON from 'geojson';
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';
import { computed, useTemplateRef, watch } from 'vue';
import worldAtlas from 'world-atlas/countries-50m.json';
import type { Country, CountryId } from '../../../domain/Country';
import type { SimulationResults } from '../../../domain/SimulationResults';
import {
    FUNDING_PROGRESS_COLORS,
    FUNDING_PROGRESS_THRESHOLDS,
    MapColors,
} from '../../../domain/constants/MapColors';
import { useMapTooltip } from '../composables/useMapTooltip';
import { useMapZoom } from '../composables/useMapZoom';

const props = defineProps<{
    countries: Country[];
    resultsByCountry: Map<CountryId, SimulationResults>;
    selectedCountryId: CountryId | null;
}>();

const emit = defineEmits<{
    'country-select': [countryId: CountryId];
}>();

const SVG_WIDTH = 960;
const SVG_HEIGHT = 500;
const WHEEL_ZOOM_FACTOR = 1.1;

interface NamedFeatureProperties {
    name: string;
}

const geoJsonCountries = computed(() => {
    const topo = worldAtlas as unknown as Topology;
    return feature(topo, topo.objects.countries) as GeoJSON.FeatureCollection<
        GeoJSON.Geometry,
        NamedFeatureProperties
    >;
});

const countryNameMap = computed(() => {
    const map = new Map<string, string>();
    for (const country of props.countries) {
        map.set(country.id, country.name);
    }
    return map;
});

const projection = computed(() => {
    return geoNaturalEarth1().fitSize([SVG_WIDTH, SVG_HEIGHT], geoJsonCountries.value);
});

const pathGenerator = computed(() => geoPath(projection.value));

const { tooltip, showTooltip, hideTooltip } = useMapTooltip();
const { mapTransform, computeZoom, resetZoom, zoomAtPoint } = useMapZoom(SVG_WIDTH, SVG_HEIGHT);
const mapGroupRef = useTemplateRef<SVGGElement>('mapGroupRef');

watch(
    () => props.selectedCountryId,
    (id) => {
        if (id) {
            const match = geoJsonCountries.value.features.find((f) => f.id === id);
            if (match) {
                const bounds = pathGenerator.value.bounds(match);
                computeZoom(bounds);
            } else {
                resetZoom();
            }
        } else {
            resetZoom();
        }
    },
    { immediate: true },
);

function getCountryPath(
    countryFeature: GeoJSON.Feature<GeoJSON.Geometry, NamedFeatureProperties>,
): string {
    /* istanbul ignore next -- pathGenerator only returns null for degenerate geometries; unreachable with the current world-atlas dataset */
    return pathGenerator.value(countryFeature) ?? '';
}

function getCountryFill(isoNumeric: string): string {
    const results = props.resultsByCountry.get(isoNumeric as CountryId);
    return results ? results.colorHex : MapColors.INACTIVE;
}

function getCountryAriaLabel(isoNumeric: string): string {
    const name = countryNameMap.value.get(isoNumeric) ?? 'Unknown';
    const results = props.resultsByCountry.get(isoNumeric as CountryId);
    if (results) {
        return `${name} — ${toPercentage(results.fundingProgress)}% funded`;
    }
    return `${name} — no data`;
}

function getTooltipText(isoNumeric: string): string {
    const name = countryNameMap.value.get(isoNumeric) ?? 'Unknown';
    const results = props.resultsByCountry.get(isoNumeric as CountryId);
    if (results) {
        return `${name} — ${toPercentage(results.fundingProgress)}%`;
    }
    return `${name} — no data`;
}

function handlePathClick(isoNumeric: string): void {
    emit('country-select', isoNumeric as CountryId);
}

function handlePathMouseEnter(isoNumeric: string, event: FocusEvent): void {
    showTooltip(getTooltipText(isoNumeric), event as MouseEvent);
}

function handlePathMouseLeave(): void {
    hideTooltip();
}

function handleWheel(event: WheelEvent): void {
    const ctm = mapGroupRef.value?.getScreenCTM();
    if (!ctm) {
        return;
    }
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse());
    const factor = event.deltaY < 0 ? WHEEL_ZOOM_FACTOR : 1 / WHEEL_ZOOM_FACTOR;
    zoomAtPoint({ x: point.x, y: point.y }, factor);
}

function formatFundingProgressLabel(colorIndex: number): string {
    if (colorIndex === 0) {
        return `< ${toPercentage(FUNDING_PROGRESS_THRESHOLDS[0])}%`;
    }
    if (colorIndex === FUNDING_PROGRESS_THRESHOLDS.length) {
        return `> ${toPercentage(FUNDING_PROGRESS_THRESHOLDS[colorIndex - 1])}%`;
    }
    return `${toPercentage(FUNDING_PROGRESS_THRESHOLDS[colorIndex - 1])}-${toPercentage(FUNDING_PROGRESS_THRESHOLDS[colorIndex])}%`;
}

const LEGEND_COLORS = FUNDING_PROGRESS_COLORS.map((color, index) => ({
    color,
    label: formatFundingProgressLabel(index),
}));
</script>

<template>
    <div class="map-container">
        <svg
            :viewBox="`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`"
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
            @wheel.prevent="handleWheel"
        >
            <rect width="100%" height="100%" fill="#e8f4f8" />
            <g
                ref="mapGroupRef"
                class="map-group"
                :transform="mapTransform"
                style="transition: transform 0.3s"
            >
                <g v-for="(countryFeature, index) in geoJsonCountries.features" :key="index">
                    <path
                        :d="getCountryPath(countryFeature)"
                        :data-country-id="countryFeature.id"
                        :fill="getCountryFill(String(countryFeature.id))"
                        :aria-label="getCountryAriaLabel(String(countryFeature.id))"
                        role="button"
                        tabindex="0"
                        class="country-path clickable"
                        stroke="#ffffff"
                        stroke-opacity="0.3"
                        @click="handlePathClick(String(countryFeature.id))"
                        @keydown.enter="handlePathClick(String(countryFeature.id))"
                        @keydown.space.prevent="handlePathClick(String(countryFeature.id))"
                        @mouseenter="handlePathMouseEnter(String(countryFeature.id), $event)"
                        @focus="handlePathMouseEnter(String(countryFeature.id), $event)"
                        @mouseleave="handlePathMouseLeave"
                        @blur="handlePathMouseLeave"
                    />
                </g>
            </g>
        </svg>
        <div
            v-if="tooltip.visible"
            class="map-tooltip"
            :style="{
                left: `${tooltip.x + 10}px`,
                top: `${tooltip.y - 10}px`,
            }"
        >
            {{ tooltip.text }}
        </div>
        <div class="map-legend">
            <div v-for="(entry, idx) in LEGEND_COLORS" :key="idx" class="legend-item">
                <span class="legend-swatch" :style="{ backgroundColor: entry.color }" />
                <span class="legend-label">{{ entry.label }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.map-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.country-path.clickable {
    cursor: pointer;
    transition: fill 0.3s;
}

.country-path.clickable:hover {
    opacity: 0.8;
}

.map-tooltip {
    position: fixed;
    z-index: 1000;
    padding: 6px 10px;
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    font-size: 13px;
    border-radius: 4px;
    pointer-events: none;
    white-space: nowrap;
}

.map-legend {
    position: absolute;
    bottom: 16px;
    right: 16px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 6px;
    padding: 8px 12px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
}

.legend-swatch {
    display: inline-block;
    width: 14px;
    height: 14px;
    border-radius: 2px;
    flex-shrink: 0;
}

.legend-label {
    font-size: 12px;
    color: #333;
}
</style>
