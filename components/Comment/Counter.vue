<template>
    <div v-if="props.isHome" class="flex items-center space-x-2">
        <UIcon :name="props.allowComment ? `hugeicons:comment-02` : `hugeicons:comment-block-02`"
            class="w-5 h-5 text-gray-500" />
        <span class="text-sm text-gray-500 git-nums">{{ props.allowComment ? comments?.length || 0 : '' }}</span>
    </div>
    <div v-else class="mt-4">
        <UDivider
            :label="!comments?.length ? $t('comment_is_empty') : $t('comment_counter', { counter: comments?.length || 0 })"
            :ui="{ label: 'text-gray-500' }" type="dashed" class="py-1" />
    </div>
</template>

<script setup lang="ts">
const { $directus, $content } = useNuxtApp();

// 定义 props
const props = defineProps({
    post_id: {
        type: String,
        required: true,
    },
    isHome: {
        type: Boolean,
        default: false,
    },
    allowComment: {
        type: Boolean,
        default: true,
    },
});

// 获取评论数据
const { data: comments, error } = await useAsyncData(`comments-${props.post_id}`, () => {
    return $directus.request(
        $content.readItems('comments', {
            fields: ['post_id'], // 获取所有字段及其关联字段
            filter: {
                post_id: {
                    _eq: props.post_id, // 过滤当前文章的评论
                },
            },
        })
    );
});

// 处理错误
if (error.value) {
    console.error(error.value);
}
</script>