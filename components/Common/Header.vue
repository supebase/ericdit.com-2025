<template>
    <div class="flex justify-between items-center">
        <div class="flex items-center select-none h-10 z-50">
            <div class="text-gray-400 mt-[1px]" tabindex="-1">
                <Transition name="fade" mode="out-in">
                    <div v-if="$route.path === '/'" key="title" class="eric">
                        <svg width="197" height="150" viewBox="0 0 197 150" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M119.5 52L129.5 42C138.167 32.1667 149.5 10.7 125.5 3.5C101.5 -3.7 53.1667 30.5 32 48.5L21 59.5C16.8333 64.1667 7.6 75.5 4 83.5C0.399999 91.5 2.5 99.8333 4 103C8.33333 106.5 19.2266 111.709 28.5 112C37.7262 112.289 64.1353 114.248 73.5 112C82.8647 109.752 39.4251 148.249 43.5 148L105 112C99.435 123.661 97.0568 129.774 94 140L105 121.5L116 108C112.766 115.129 112.189 118.365 119.5 119L131.5 117L139.5 112C136.33 115.548 134.549 117.471 131.5 124C129.858 128.386 129.487 130.788 129.5 135C133.269 136.189 135.695 135.984 141.5 131.5L157.5 117C163.167 111.435 166.209 109.177 171.5 106C156.91 119.34 153.776 125.508 154 135C156.803 137.203 158.71 137.861 163 137.5C174.053 129.518 179.604 123.877 188.5 112"
                                stroke="#FED7AA" stroke-width="6.5" stroke-linejoin="round" />
                            <path d="M143.5 93.5C141.905 96.4507 141.957 98.0915 143.5 101" stroke="#FED7AA"
                                stroke-width="4.5" stroke-linejoin="round" />
                            <path d="M194.5 130C193.193 132.929 193.074 134.571 194.5 137.5" stroke="#FED7AA"
                                stroke-width="4.5" stroke-linejoin="round" />
                        </svg>
                    </div>
                    <div v-else key="icon" @click="$router.back()" class="cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
                            <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="1.2">
                                <!-- 圆形路径 -->
                                <path class="circle" stroke-dasharray="64" stroke-dashoffset="64"
                                    d="M21 12c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9c4.97 0 9 4.03 9 9Z" />
                                <!-- 对勾路径 -->
                                <path class="check" stroke-dasharray="6" stroke-dashoffset="6"
                                    d="M10 12l3 -3M10 12l3 3" />
                            </g>
                        </svg>
                    </div>
                </Transition>
            </div>
        </div>

        <div class="flex items-center space-x-6">
            <UBadge :ui="{ rounded: 'rounded-lg', icon: { base: 'flex-shrink-0 mr-0.5' } }" :label="$t('swipe_cards')" color="gray"
                icon="hugeicons:touchpad-04" size="md" variant="soft"
                class="transform transition-all duration-500 ease-in-out select-none"
                :class="$route.path !== '/' ? 'translate-x-6 opacity-0' : 'translate-x-0 opacity-100'" />

            <AIGenerator />
            <UserAuth />
        </div>
    </div>
</template>

<script setup lang="ts">
const { $directus, $content } = useNuxtApp();

interface GlobalData {
    title?: string
    description?: string
}

const { data: global } = await useAsyncData<GlobalData>('global', async () => {
    const items = await $directus.request($content.readItems('global'))
    return items as GlobalData
})

useHead({
    meta: [
        { name: 'description', content: global.value?.description },
        { property: 'og:title', content: global.value?.title },
        { property: 'og:description', content: global.value?.description },
    ],
})
</script>