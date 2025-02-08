<template>
    <div v-if="props.isHome" class="flex items-center space-x-2">
        <UIcon name="hugeicons:comment-02" class="w-4 h-4 text-gray-500" />
        <span class="text-sm text-gray-500 git-nums">{{ comments?.length || 0 }}</span>
    </div>
    <div v-else>
        <UDivider :label="!comments?.length ? `评论区空空如也，快来留下足迹！` : `已有 ${comments?.length || 0} 条评论，快来加入讨论！`"
            :ui="{ label: 'text-gray-500' }" type="dashed" class="py-1" />
    </div>
</template>

<script setup lang="ts">
const { $directus, $readItems } = useNuxtApp();

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
});

// 获取评论数据
const { data: comments, error } = await useAsyncData(`comments-${props.post_id}`, () => {
    return $directus.request(
        $readItems('comments', {
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
    console.error('获取评论失败:', error.value);
}
</script>