<script setup lang="ts">
import type { CountryFunding } from '@/sovereign/domain/CountryFunding';
import { useCountryDisplay } from '@/sovereign/infrastructure/ui/composables/useCountryDisplay';
import { useMapDrag } from '@/sovereign/infrastructure/ui/composables/useMapDrag';
import { useMapTooltip } from '@/sovereign/infrastructure/ui/composables/useMapTooltip';
import { useMapZoom } from '@/sovereign/infrastructure/ui/composables/useMapZoom';
import { useMediaQuery } from '@/sovereign/infrastructure/ui/composables/useMediaQuery';
import { useTheme } from '@/sovereign/infrastructure/ui/composables/useTheme';
import { MapColors } from '@/sovereign/infrastructure/ui/constants/MapColors';
import { getThemeColors } from '@/sovereign/infrastructure/ui/constants/ThemeColors';
import { calculateFundingColorThresholds } from '@/sovereign/infrastructure/ui/utils/calculateFundingColorThresholds';
import { createFundingAmountLegendItems } from '@/sovereign/infrastructure/ui/utils/fundingAmountLegend';
import MapLegend from './MapLegend.vue';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';
import { computed, toRef, useTemplateRef } from 'vue';
import worldAtlas from 'world-atlas/countries-110m.json';

const props = defineProps<{
    countryFundings: readonly CountryFunding[];
    selectedCountryName: string | null;
}>();

const emit = defineEmits<{
    'country-select': [countryName: string | null];
}>();

const { themeMode } = useTheme();

const SVG_WIDTH = 960;
const SVG_HEIGHT = 500;
const WHEEL_ZOOM_FACTOR = 1.25;

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

const PRESERVE_ASPECT_RATIO = 'xMidYMid slice';

const { tooltip, showTooltip, hideTooltip } = useMapTooltip();
const { zoomState, mapTransform, isAnimated, zoomAtPoint, panTo } = useMapZoom();
const { getCountryFill, getCountryAriaLabel, getTooltipText, hasCountryData } = useCountryDisplay(
    toRef(props, 'countryFundings'),
);

const themeColors = computed(() => getThemeColors(themeMode.value));
const isMobile = useMediaQuery('(max-width: 768px)');
const legendItems = computed(() => {
    const thresholds = calculateFundingColorThresholds(
        props.countryFundings.map((funding) => funding.totalAmountUsd),
    );
    return createFundingAmountLegendItems(thresholds, themeMode.value);
});

const { isDragging, handleDragStart, didDragOccur, resetDidDrag } = useMapDrag(
    svgRef,
    mapGroupRef,
    panTo,
    () => ({ x: zoomState.value.translateX, y: zoomState.value.translateY }),
    zoomAtPoint,
);

function getCountryPath(countryFeature: Feature<Geometry, NamedFeatureProperties>): string {
    /* istanbul ignore next -- pathGenerator only returns null for degenerate geometries; unreachable with the current world-atlas dataset */
    return pathGenerator.value(countryFeature) ?? '';
}

function isSelectedCountry(countryName: string): boolean {
    return !isMobile.value && countryName === props.selectedCountryName;
}

function handlePathClick(countryName: string): void {
    if (didDragOccur()) {
        resetDidDrag();
        return;
    }
    if (!hasCountryData(countryName)) {
        return;
    }
    hideTooltip();
    emit('country-select', countryName);
}

function handleBackgroundClick(): void {
    if (didDragOccur()) {
        resetDidDrag();
        return;
    }
    emit('country-select', null);
}

function handlePathMouseEnter(countryName: string, event: MouseEvent | FocusEvent): void {
    const target = event.currentTarget as SVGGraphicsElement;
    const box = target.getBoundingClientRect();
    const point =
        event instanceof MouseEvent
            ? { clientX: event.clientX, clientY: event.clientY }
            : { clientX: box.left + box.width / 2, clientY: box.top };
    showTooltip(getTooltipText(countryName), point);
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
            :preserveAspectRatio="PRESERVE_ASPECT_RATIO"
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
            :class="{ 'is-dragging': isDragging }"
            @wheel.prevent="handleWheel"
            @pointerdown="handleDragStart"
        >
            <rect
                :width="SVG_WIDTH"
                :height="SVG_HEIGHT"
                :fill="themeColors.OCEAN"
                @click="handleBackgroundClick"
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
                        :fill="getCountryFill(countryFeature.properties.name)"
                        :aria-label="getCountryAriaLabel(countryFeature.properties.name)"
                        :stroke="
                            isSelectedCountry(countryFeature.properties.name)
                                ? MapColors.BLUE
                                : themeColors.BORDER
                        "
                        :stroke-opacity="
                            isSelectedCountry(countryFeature.properties.name) ? 1 : 0.35
                        "
                        :stroke-width="
                            isSelectedCountry(countryFeature.properties.name) ? 0.5 : 0.1
                        "
                        :role="hasCountryData(countryFeature.properties.name) ? 'button' : 'img'"
                        :tabindex="hasCountryData(countryFeature.properties.name) ? 0 : -1"
                        :class="{
                            'country-path': true,
                            clickable: hasCountryData(countryFeature.properties.name),
                        }"
                        @click="handlePathClick(countryFeature.properties.name)"
                        @keydown.enter="handlePathClick(countryFeature.properties.name)"
                        @keydown.space.prevent="handlePathClick(countryFeature.properties.name)"
                        @mouseenter="handlePathMouseEnter(countryFeature.properties.name, $event)"
                        @focus="handlePathMouseEnter(countryFeature.properties.name, $event)"
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
        <MapLegend :items="legendItems" />
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
    touch-action: none;
    -webkit-tap-highlight-color: transparent;
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

.country-path.clickable:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
}

@media (max-width: 768px) {
    .country-path:focus,
    .country-path:focus-visible {
        outline: none;
    }
}

.country-path.clickable:hover {
    opacity: 0.8;
}

.map-tooltip {
    position: fixed;
    z-index: 1000;
    padding: 6px 10px;
    background: var(--tooltip-bg);
    color: var(--tooltip-text);
    font-size: 13px;
    border-radius: 4px;
    pointer-events: none;
    white-space: nowrap;
}
</style>
