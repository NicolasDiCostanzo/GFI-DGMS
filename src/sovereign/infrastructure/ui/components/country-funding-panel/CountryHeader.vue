<template>
    <header class="country-header summary-header">
        <span class="country-name">{{ countryName }}</span>

        <div class="total-section">
            <div class="total-value">{{ totalAmountLabel }}</div>
            <div class="total-label">total public R&I funding tracked</div>
            <div class="grant-count">{{ grantCountLabel }}</div>
        </div>
    </header>
</template>

<script setup lang="ts">
defineProps<{
    countryName?: string;
    totalAmountLabel?: string;
    grantCountLabel?: string;
}>();
</script>

<style scoped>
.summary-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 2px;
}

.country-name {
    font-size: 18px;
    font-weight: 600;
}

.total-value {
    font-size: 28px;
    font-weight: 700;
}

.total-label {
    font-size: 13px;
}

.grant-count {
    font-size: 11px;
    font-style: italic;
    margin-top: 2px;
}
</style>
