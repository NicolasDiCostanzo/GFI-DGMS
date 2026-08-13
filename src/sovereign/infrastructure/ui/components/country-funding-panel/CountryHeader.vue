<template>
    <header class="country-header">
        <span class="country-name">{{ countryName }}</span>

        <div class="total-section">
            <div class="total-value">{{ totalAmountLabel }}</div>
            <div class="total-label">total public R&I funding tracked</div>
            <div class="disclosure-note">{{ disclosureLabel }}</div>
        </div>
    </header>
</template>

<script setup lang="ts">
defineProps<{
    countryName?: string;
    totalAmountLabel?: string;
    disclosureLabel?: string;
}>();
</script>

<style scoped>
.country-header {
    font-size: 18px;
    font-weight: 600;
}

.total-section {
    text-align: center;
}

.total-value {
    font-size: 28px;
    font-weight: 700;
}

.total-label {
    font-size: 13px;
}

.disclosure-note {
    font-size: 11px;
    font-style: italic;
    margin-top: 4px;
}
</style>
