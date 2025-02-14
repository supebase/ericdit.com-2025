<template>
    <div @click="isOpen = true">
        <UTooltip :popper="{ arrow: true, placement: 'bottom', offsetDistance: 12 }">
            <UIcon name="ri:ai-generate" class="cursor-pointer h-6 w-6 text-orange-200 mt-2" />
            <template #text>
                <span>{{ $t('ai_generator_start') }}</span>
            </template>
        </UTooltip>
    </div>

    <UModal v-model="isOpen" prevent-close :ui="{
        width: 'w-full sm:max-w-sm', base: 'absolute top-0', transition: {
            enterFrom: '-translate-y-4',
            leaveTo: '-translate-y-4'
        }
    }">
        <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-800' }">
            <template #header>
                <div class="flex items-center justify-between">
                    <UIcon name="ri:ai-generate" class="cursor-pointer h-6 w-6 text-orange-200" />
                    <UButton color="gray" variant="ghost" icon="ri:close-line" class="-my-1" tabindex="-1"
                        @click="isOpen = false" />
                </div>
            </template>

            <div class="flex flex-col items-center">
                <UInput icon="hugeicons:text-square" size="lg" color="white" :trailing="false"
                    :placeholder="$t('ai_generator_info')" type="text" class="w-full" v-model="keywords" />
            </div>

            <template #footer>
                <div class="flex justify-center">
                    <UButton :label="getButtonLabel" type="button" size="md" :color="isCompleted ? 'primary' : 'black'"
                        icon="hugeicons:magic-wand-01" class="font-semibold" @click="handleButtonClick()"
                        :loading="loading" :disabled="(loading || !keywords) && !isCompleted" />
                </div>
            </template>
        </UCard>
    </UModal>
</template>

<script setup lang="ts">
const { $directus, $content } = useNuxtApp();
const authStore = useAuthStore();
const { t } = useI18n();
const { showNotification } = useNotification();

import type { ArticleData } from '~/types/article';

const isOpen = ref(false);
const loading = ref(false);
const keywords = ref('');
const estimatedTime = ref(10); // 添加预计时间响应式变量，默认10秒
const isCompleted = ref(false); // 新增完成状态
let timerId: NodeJS.Timeout | null = null;

// 生命周期处理
onBeforeUnmount(() => {
    if (timerId) clearInterval(timerId);
});

const getButtonLabel = computed(() => {
    if (isCompleted.value) return t('ai_generator_complated')
    return loading.value ? t('ai_generator_waiting', { time: estimatedTime.value }) : t('ai_generator_start')
})

// 方法拆分
const validateKeywords = () => {
    const keywordsArray = keywords.value.split(',').map(k => k.trim());
    return keywordsArray.length > 0 && keywordsArray.every(k => k.length > 0);
}

const startTimer = () => {
    estimatedTime.value = 0;
    const startTime = Date.now();
    timerId = setInterval(() => {
        estimatedTime.value = Math.floor((Date.now() - startTime) / 1000);
    }, 1000);
}

const callGenerateAPI = async (): Promise<ArticleData> => {
    return await $fetch('/api/generate', {
        method: 'POST',
        body: { keywords: keywords.value }
    });
}

const submitArticle = async (content: ArticleData) => {
    await $directus.request(
        $content.createItem('posts', {
            title: content.title,
            summary: content.summary,
            content: content.content,
            status: "published",
            user_created: authStore.user?.id,
        })
    );
}

// 主逻辑
const handleButtonClick = () => {
    if (isCompleted.value) {
        isOpen.value = false;
        window.location.reload();
    } else {
        generateAIPost();
    }
}

const generateAIPost = async () => {
    try {
        // 验证阶段
        if (!validateKeywords()) {
            showNotification('ai-keyword', 'warning', t('ai_generator_warning_msg'));
            return;
        }

        if (!authStore.user?.token) {
            showNotification('ai-error', 'error', t('ai_generator_error_msg'));
            isOpen.value = false;
            return;
        }

        // 准备阶段
        loading.value = true;
        isCompleted.value = false;
        startTimer();

        // API调用
        const generatedContent = await callGenerateAPI();
        //console.log('Generated Content:', generatedContent);

        // 提交内容
        await submitArticle(generatedContent);

        // 完成处理
        showNotification('ai-success', 'success', t('ai_generator_success_msg'));
        keywords.value = "";
        isCompleted.value = true;
    } catch (error: any) {
        showNotification('ai-error', 'error', error.message);
    } finally {
        loading.value = false;
        if (timerId) clearInterval(timerId);
    }
}

watch(isOpen, (newVal) => {
    if (!newVal) {
        keywords.value = '';
        estimatedTime.value = 0;
        isCompleted.value = false;
        if (timerId) clearInterval(timerId);
    }
});
</script>
