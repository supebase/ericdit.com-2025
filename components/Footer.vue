<template>
    <div class="my-8">
        <div class="flex justify-center items-center space-x-5">
            <div class="relative w-5 h-5 text-gray-400 cursor-pointer" @click="toggleLocale">
                <UIcon name="hugeicons:translation" class="w-5 h-5 transition-transform duration-300 ease-in-out"
                    :class="{ 'scale-x-0': isFlipping, '-scale-x-100': currentLocale === 'en' }" />
            </div>

            <NuxtLink :to="link.url" target="_blank" class="text-gray-400 w-5 h-5" tabindex="-1" v-for="link in links">
                <UIcon :name="link.icon" class="w-5 h-5" />
            </NuxtLink>
        </div>

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
const { $directus, $readItems } = useNuxtApp();
const { public: { buildTime } } = useRuntimeConfig();
const { t, setLocale, locale } = useI18n();

const { data: links } = await useAsyncData('links', () => {
    return $directus.request(
        $readItems('links', {
            fields: ['*.*'],
            sort: ['sort'],
            filter: { status: 'published' },
        })
    )
})

const currentLocale = ref(locale.value);

const toggleLocale = () => {
    const newLocale = currentLocale.value === 'en' ? 'cn' : 'en';
    setLocale(newLocale);
    currentLocale.value = newLocale;
};

const isFlipping = ref(false);

watch(currentLocale, (newVal, oldVal) => {
    if (newVal !== oldVal) {
        isFlipping.value = true;
        setTimeout(() => {
            isFlipping.value = false;
        }, 300);
    }
});

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