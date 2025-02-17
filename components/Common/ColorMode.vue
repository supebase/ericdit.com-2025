<script setup lang="ts">
const colorMode = useColorMode()
const isDark = computed({
    get() {
        return colorMode.value === 'dark'
    },
    set() {
        colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
    }
})
</script>

<template>
    <ClientOnly>
        <UButton :icon="isDark ? 'hugeicons:moon-02' : 'hugeicons:sun-02'" color="white" variant="ghost" :padded="false"
            class="hover:!bg-transparent" aria-label="Theme" @click="isDark = !isDark" />
        <template #fallback>
            <div class="w-5 h-5" />
        </template>
    </ClientOnly>
</template>
