<template>
    <div class="my-8">
        <div class="flex flex-col justify-center items-center h-16 text-gray-600 space-y-1.5 text-[13px]">
            <div class="uppercase space-x-2">
                <span>{{ $t('build') }}</span>
                <span>&bull;</span>
                <span>{{ $t('build_author_info') }}</span>
            </div>
            <div class="space-x-2">
                <span>{{ $t('build_datetime') }} {{ useFormatDate(buildTime) }}</span>
                <span>&bull;</span>
                <span class="tracking-wide">{{ version }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const { public: { buildTime } } = useRuntimeConfig();
const { t } = useI18n();

const version = ref('0.0.0')

onMounted(async () => {
    try {
        const { version: v } = await $fetch<{ version: string }>('/version.json', {
            headers: { 'Cache-Control': 'no-cache' },
        });
        version.value = v;
    } catch (error) {
        console.error('Failed to fetch version:', error);
        version.value = t('build_version_unknow');
    }
});
</script>