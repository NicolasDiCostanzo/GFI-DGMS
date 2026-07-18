<script setup lang="ts">
import { ref } from 'vue';

const message = ref('Hello from GFI-DGMS!');
</script>

<template>
    <div class="app">
        <h1>{{ message }}</h1>
    </div>
</template>

<style scoped>
.app {
    font-family: Arial, sans-serif;
    text-align: center;
    padding: 2rem;
}
</style>
