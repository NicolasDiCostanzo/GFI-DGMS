<script setup lang="ts">
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';
import { computed, toRef, useTemplateRef } from 'vue';
import worldAtlas from 'world-atlas/countries-50m.json';
import type { Country, CountryId } from '../../../domain/Country';
import type { SimulationResults } from '../../../domain/SimulationResults';
import { MapColors } from '../../../domain/constants/MapColors';
import { useCountryDisplay } from '../composables/useCountryDisplay';
import { useMapDrag } from '../composables/useMapDrag';
import { useMapTooltip } from '../composables/useMapTooltip';
import { useMapZoom } from '../composables/useMapZoom';
import { LEGEND_ITEMS } from '../utils/fundingProgressLegend';

const props = defineProps<{
    countries: Country[];
    resultsByCountry: Map<CountryId, SimulationResults>;
    selectedCountryId: CountryId | null;
}>();

const emit = defineEmits<{
    'country-select': [countryId: CountryId | null];
}>();

const SVG_WIDTH = 960;
const SVG_HEIGHT = 500;
const WHEEL_ZOOM_FACTOR = 1.05;

interface NamedFeatureProperties {
    name: string;
}

const geoJsonCountries = computed(() => {
    const topo = worldAtlas as unknown as Topology;
    return feature(topo, topo.objects.countries) as FeatureCollection<
        Geometry,
        NamedFeatureProperties
    >;
});

const projection = computed(() => {
    return geoNaturalEarth1().fitSize([SVG_WIDTH, SVG_HEIGHT], geoJsonCountries.value);
});

const pathGenerator = computed(() => geoPath(projection.value));

const mapGroupRef = useTemplateRef<SVGGElement>('mapGroupRef');
const svgRef = useTemplateRef<SVGSVGElement>('svgRef');

const { tooltip, showTooltip, hideTooltip } = useMapTooltip();
const { zoomState, mapTransform, isAnimated, zoomAtPoint, panTo } = useMapZoom();
const { getCountryFill, getCountryAriaLabel, getTooltipText } = useCountryDisplay(
    toRef(props, 'countries'),
    toRef(props, 'resultsByCountry'),
    geoJsonCountries,
);
const { isDragging, handleDragStart, didDragOccur, resetDidDrag } = useMapDrag(
    svgRef,
    panTo,
    () => ({ x: zoomState.value.translateX, y: zoomState.value.translateY }),
);

function getCountryPath(countryFeature: Feature<Geometry, NamedFeatureProperties>): string {
    /* istanbul ignore next -- pathGenerator only returns null for degenerate geometries; unreachable with the current world-atlas dataset */
    return pathGenerator.value(countryFeature) ?? '';
}

function handlePathClick(isoNumeric: string): void {
    if (didDragOccur()) {
        resetDidDrag();
        return;
    }
    emit('country-select', isoNumeric as CountryId);
}

function handlePathMouseEnter(isoNumeric: string, event: MouseEvent | FocusEvent): void {
    const target = event.currentTarget as SVGGraphicsElement;
    const box = target.getBoundingClientRect();
    const point =
        event instanceof MouseEvent
            ? { clientX: event.clientX, clientY: event.clientY }
            : { clientX: box.left + box.width / 2, clientY: box.top };
    showTooltip(getTooltipText(isoNumeric), point);
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
</script>

<template>
    <div class="map-container">
        <svg
            ref="svgRef"
            :viewBox="`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`"
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
            :class="{ 'is-dragging': isDragging }"
            @wheel.prevent="handleWheel"
            @mousedown="handleDragStart"
        >
            <rect
                width="100%"
                height="100%"
                :fill="MapColors.OCEAN"
                @click="didDragOccur() ? resetDidDrag() : emit('country-select', null)"
            />
            <g
                ref="mapGroupRef"
                class="map-group"
                :transform="mapTransform"
                :style="{ transition: isAnimated ? 'transform 0.3s' : 'none' }"
            >
                <g v-for="(countryFeature, index) in geoJsonCountries.features" :key="index">
                    <path
                        :d="getCountryPath(countryFeature)"
                        :data-country-id="countryFeature.id"
                        :fill="getCountryFill(String(countryFeature.id))"
                        :aria-label="getCountryAriaLabel(String(countryFeature.id))"
                        :stroke="
                            String(countryFeature.id) === selectedCountryId
                                ? MapColors.SELECTION
                                : MapColors.BORDER
                        "
                        :stroke-opacity="String(countryFeature.id) === selectedCountryId ? 1 : 0.35"
                        :stroke-width="String(countryFeature.id) === selectedCountryId ? 0.5 : 0.1"
                        role="button"
                        tabindex="0"
                        class="country-path clickable"
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
            <div v-for="(entry, idx) in LEGEND_ITEMS" :key="idx" class="legend-item">
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

.map-container svg {
    cursor: grab;
}

.map-container svg.is-dragging {
    cursor: grabbing;
}

.country-path.clickable {
    cursor: pointer;
    transition:
        fill 0.3s,
        stroke 0.3s;
}

.country-path.clickable:focus {
    outline: none;
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
