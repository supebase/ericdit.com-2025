<template>
    <div class="my-8">
        <div class="flex flex-col justify-center items-center h-16 text-gray-600 space-y-1.5 text-[13px]">
            <div class="uppercase space-x-2">
                <span>2001 - Present</span>
                <span>&bull;</span>
                <span>Created by Eric</span>
            </div>
            <div class="space-x-2">
                <span>项目构建于 {{ useFormatDate(buildTime) }}</span>
                <span>&bull;</span>
                <span class="tracking-wide">{{ version }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const { public: { buildTime } } = useRuntimeConfig();

const version = ref('0.0.0')

onMounted(async () => {
    try {
        const { version: v } = await $fetch<{ version: string }>('/version.json', {
            headers: { 'Cache-Control': 'no-cache' },
        });
        version.value = v;
    } catch (error) {
        console.error('Failed to fetch version:', error);
        version.value = '未知版本';
    }
});
</script>