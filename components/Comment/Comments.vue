<template>
    <div>
        <div v-if="!comments || comments?.length === 0">
            <div class="flex flex-col justify-center items-center mt-8 pb-6 space-y-4">
                <UIcon name="hugeicons:comment-01" class="w-12 h-12 text-gray-800" />
                <!-- <div class="text-sm">{{ $t('comment_welcome') }}</div> -->
            </div>
        </div>
        <div v-else-if="status === 'pending'">
            <div class="flex flex-col justify-center items-center m-4 pb-6 space-y-2.5">
                <UIcon name="hugeicons:loading-02" class="w-8 h-8 animate-spin" />
                <div class="text-sm">{{ $t('comment_loading') }}</div>
            </div>
        </div>
        <div class="space-y-5 pb-10" v-else>
            <!-- 显示未超过半年的评论 -->
            <div v-for="(comment, index) in recentComments" :key="comment.id" class="relative my-6 space-y-1">
                <!-- 评论内容 -->
                <div class="flex flex-row justify-between items-center">
                    <div class="group flex items-center">
                        <UChip inset :show="comment.user_created.token ? true : false">
                            <UAvatar size="md"
                                :src="`${useAssets(comment.user_created.avatar)}?fit=outside&quality=40&withoutEnlargement&width=100&height=100`"
                                :alt="comment.user_created.first_name" class="ring-2 ring-gray-200 dark:ring-gray-800" />
                        </UChip>
                        <div class="ml-4">
                            <div class="flex items-center text-base font-medium text-gray-800 dark:text-gray-200 space-x-3">
                                <div>{{ comment.user_created.first_name }}</div>
                            </div>
                            <div class="text-[0.8rem] text-gray-600 space-x-1 flex items-center">
                                <span>{{ useFormatDate(comment.date_created) }}</span>
                                <UIcon name="ri:arrow-drop-right-line" class="w-5 h-5 text-gray-600" />
                                <span>{{ comment.user_created.location }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="text-gray-600 flex items-center space-x-5">
                        <CommonLike :target_id="comment.id" :user_id="authStore.user?.id" :target_type="`comment`" />
                        <UBadge v-if="authStore.user && authStore.user.id !== comment.user_created.id"
                            :ui="{ rounded: 'rounded-lg' }" :label="$t('comment_reply_button')" size="sm" variant="soft"
                            color="gray" class="cursor-pointer" @click="handleReply(comment)" />
                        <UBadge v-if="authStore.user && authStore.user.id === comment.user_created.id"
                            :ui="{ rounded: 'rounded-lg' }" :label="$t('comment_delete_button')" size="sm"
                            variant="soft" color="gray" class="cursor-pointer"
                            @click="openDeleteModal(comment, 'comment')" />
                    </div>
                </div>
                <div class="ml-14">
                    <CommonMarkdownRenderer :markdown="comment.comment" :enableHtml="false" :enableLink="false"
                        class="text-gray-700 dark:text-gray-300" />
                </div>

                <!-- 回复部分 -->
                <div v-if="comment.replies && comment.replies.length > 0" class="ml-12 mt-7 space-y-8">
                    <div class="absolute left-5 top-14 bottom-2 border-l border-dashed border-gray-800"></div>
                    <div v-for="(reply, replyIndex) in comment.replies.slice(0, isExpanded[comment.id] ? comment.replies.length : 2)"
                        :key="reply.id" class="space-y-1">
                        <div class="flex flex-row justify-between items-center" :ref="setReplyRef(reply.id)">
                            <div class="group flex items-center">
                                <UChip inset :show="reply.user_created.token ? true : false">
                                    <UAvatar size="md"
                                        :src="`${useAssets(reply.user_created.avatar)}?fit=outside&quality=40&withoutEnlargement&width=100&height=100`"
                                        :alt="reply.user_created.first_name" class="ring-2 ring-gray-200 dark:ring-gray-800" />
                                </UChip>
                                <div class="ml-4">
                                    <div class="flex items-center text-base font-medium text-gray-800 dark:text-gray-200 space-x-3">
                                        <div>{{ reply.user_created.first_name }}</div>
                                    </div>
                                    <div class="text-[0.8rem] text-gray-600 space-x-1 flex items-center">
                                        <span>{{ useFormatDate(reply.date_created) }}</span>
                                        <UIcon name="ri:arrow-drop-right-line" class="w-5 h-5 text-gray-600" />
                                        <span>{{ reply.user_created.location }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="text-gray-600 flex items-center space-x-5">
                                <CommonLike :target_id="reply.id" :user_id="authStore.user?.id"
                                    :target_type="`comment`" />
                                <UBadge v-if="authStore.user && authStore.user.id === reply.user_created.id"
                                    :ui="{ rounded: 'rounded-lg' }" :label="$t('comment_delete_button')" size="sm"
                                    variant="soft" color="gray" class="cursor-pointer"
                                    @click="openDeleteModal(reply, 'reply')" />
                            </div>
                        </div>
                        <div class="ml-14">
                            <CommonMarkdownRenderer :markdown="reply.comment" :enableHtml="false" :enableLink="false"
                                class="text-gray-700 dark:text-gray-300" />
                        </div>
                    </div>

                    <!-- 展开/折叠按钮 -->
                    <div v-if="comment.replies.length > 2" class="ml-14 mt-4">
                        <button type="button" @click="toggleExpand(comment.id)"
                            class="text-sm text-gray-500 hover:text-gray-300">
                            <span v-if="isExpanded[comment.id]" class="flex items-center">
                                {{ $t('comment_collapse') }}
                                <UIcon name="hugeicons:arrow-up-01" class="w-5 h-5 ml-1" />
                            </span>
                            <span v-else class="flex items-center">
                                {{ $t('comment_expand', { replies: comment.replies.length - 2 }) }}
                                <UIcon name="hugeicons:arrow-down-01" class="w-5 h-5 ml-1" />
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- 显示超过半年的评论 -->
            <div v-if="showOldCommentsButton && oldComments.length > 0" class="flex justify-center pt-8">
                <UBadge :ui="{ rounded: 'rounded-lg' }" :label="$t('comment_expand_more')" size="md" variant="solid"
                    color="black" class="cursor-pointer" @click="showOldComments"></UBadge>
            </div>

            <div v-if="showOldCommentsSection">
                <div v-for="(comment, index) in oldComments" :key="comment.id" class="relative my-6 space-y-1">
                    <!-- 评论内容 -->
                    <div class="flex flex-row justify-between items-center">
                        <div class="group flex items-center">
                            <UChip inset :show="comment.user_created.token ? true : false">
                                <UAvatar size="md"
                                    :src="`${useAssets(comment.user_created.avatar)}?fit=outside&quality=40&withoutEnlargement&width=100&height=100`"
                                    :alt="comment.user_created.first_name" class="ring-2 ring-gray-200 dark:ring-gray-800" />
                            </UChip>
                            <div class="ml-4">
                                <div class="flex items-center text-base font-medium text-gray-800 dark:text-gray-200 space-x-3">
                                    <div>{{ comment.user_created.first_name }}</div>
                                </div>
                                <div class="text-[0.8rem] text-gray-600 space-x-1 flex items-center">
                                    <span>{{ useFormatDate(comment.date_created) }}</span>
                                    <UIcon name="ri:arrow-drop-right-line" class="w-5 h-5 text-gray-600" />
                                    <span>{{ comment.user_created.location }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="text-gray-600 flex items-center space-x-5">
                            <CommonLike :target_id="comment.id" :user_id="authStore.user?.id"
                                :target_type="`comment`" />
                            <UBadge v-if="authStore.user && authStore.user.id !== comment.user_created.id"
                                :ui="{ rounded: 'rounded-lg' }" :label="$t('comment_reply_button')" size="sm"
                                variant="soft" color="gray" class="cursor-pointer" @click="handleReply(comment)" />
                            <UBadge v-if="authStore.user && authStore.user.id === comment.user_created.id"
                                :ui="{ rounded: 'rounded-lg' }" :label="$t('comment_delete_button')" size="sm"
                                variant="soft" color="gray" class="cursor-pointer"
                                @click="openDeleteModal(comment, 'comment')" />
                        </div>
                    </div>
                    <div class="ml-14">
                        <CommonMarkdownRenderer :markdown="comment.comment" :enableHtml="false" :enableLink="false"
                            class="text-gray-700 dark:text-gray-300" />
                    </div>

                    <!-- 回复部分 -->
                    <div v-if="comment.replies && comment.replies.length > 0" class="ml-12 mt-7 space-y-8">
                        <div class="absolute left-5 top-14 bottom-2 border-l border-dashed border-gray-800"></div>
                        <div v-for="(reply, replyIndex) in comment.replies.slice(0, isExpanded[comment.id] ? comment.replies.length : 2)"
                            :key="reply.id" class="space-y-1">
                            <div class="flex flex-row justify-between items-center" :ref="setReplyRef(reply.id)">
                                <div class="group flex items-center">
                                    <UChip inset :show="reply.user_created.token ? true : false">
                                        <UAvatar size="md"
                                            :src="`${useAssets(reply.user_created.avatar)}?fit=outside&quality=40&withoutEnlargement&width=100&height=100`"
                                            :alt="reply.user_created.first_name" class="ring-2 ring-gray-200 dark:ring-gray-800" />
                                    </UChip>
                                    <div class="ml-4">
                                        <div class="flex items-center text-base font-medium text-gray-800 dark:text-gray-200 space-x-3">
                                            <div>{{ reply.user_created.first_name }}</div>
                                        </div>
                                        <div class="text-[0.8rem] text-gray-600 space-x-1 flex items-center">
                                            <span>{{ useFormatDate(reply.date_created) }}</span>
                                            <UIcon name="ri:arrow-drop-right-line" class="w-5 h-5 text-gray-600" />
                                            <span>{{ reply.user_created.location }}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="text-gray-600 flex items-center space-x-5">
                                    <CommonLike :target_id="reply.id" :user_id="authStore.user?.id"
                                        :target_type="`comment`" />
                                    <UBadge v-if="authStore.user && authStore.user.id === reply.user_created.id"
                                        :ui="{ rounded: 'rounded-lg' }" :label="$t('comment_delete_button')" size="sm"
                                        variant="soft" color="gray" class="cursor-pointer"
                                        @click="openDeleteModal(reply, 'reply')" />
                                </div>
                            </div>
                            <div class="ml-14">
                                <CommonMarkdownRenderer :markdown="reply.comment" :enableHtml="false"
                                    :enableLink="false" class="text-gray-700 dark:text-gray-300" />
                            </div>
                        </div>

                        <!-- 展开/折叠按钮 -->
                        <div v-if="comment.replies.length > 2" class="ml-14 mt-4">
                            <button type="button" @click="toggleExpand(comment.id)"
                                class="text-sm text-gray-500 hover:text-gray-300">
                                <span v-if="isExpanded[comment.id]" class="flex items-center">
                                    {{ $t('comment_collapse') }}
                                    <UIcon name="hugeicons:arrow-up-01" class="w-5 h-5 ml-1" />
                                </span>
                                <span v-else class="flex items-center">
                                    {{ $t('comment_expand', { replies: comment.replies.length - 2 }) }}
                                    <UIcon name="hugeicons:arrow-down-01" class="w-5 h-5 ml-1" />
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 删除确认弹窗 -->
        <UModal v-model="isDeleteModalOpen" prevent-close :transition="false">
            <div class="p-6">
                <div class="text-lg font-medium mb-4">{{ $t('modal_title') }}</div>
                <div class="text-sm text-gray-500 mb-6" v-html="$t('modal_messages')"></div>
                <div class="flex justify-end space-x-3">
                    <UButton :label="$t('modal_cancel')" size="md" color="gray" @click="isDeleteModalOpen = false" />
                    <UButton :label="$t('modal_confirm')" size="md" color="red" :loading="isDeleting"
                        :disabled="isDeleting" @click="confirmDelete" />
                </div>
            </div>
        </UModal>
    </div>
</template>

<script setup lang="ts">
const { $directus, $content } = useNuxtApp();
const authStore = useAuthStore();

const { on: postComment } = useEventBus<string>('comment-posted')

// 定义 props
const props = defineProps({
    post_id: {
        type: String,
        required: true,
    },
});

const { data: rawComments, status, error, refresh } = await useAsyncData(`comments-${props.post_id}`, () => {
    return $directus.request(
        $content.readItems('comments', {
            fields: ['*', { user_created: ['*'] }],
            filter: {
                post_id: {
                    _eq: props.post_id, // 过滤当前文章的评论
                },
            },
            sort: '-date_created',
        })
    );
});

// 对评论和回复进行分组
const comments = ref<any[]>([]);

// 监听 rawComments 的变化
watch(rawComments, (newVal) => {
    if (newVal) {
        const commentMap = new Map();

        // 首先将所有评论放入 Map
        newVal.forEach(comment => {
            if (!comment.reply_to) {
                // 顶层评论
                comment.replies = []; // 初始化 replies 数组
                commentMap.set(comment.id, comment);
            }
        });

        // 然后将回复嵌套到对应的评论中
        newVal.forEach(comment => {
            if (comment.reply_to) {
                // 回复
                const parentComment = commentMap.get(comment.reply_to);
                if (parentComment) {
                    parentComment.replies.push(comment);
                }
            }
        });

        // 将 Map 转换为数组
        comments.value = Array.from(commentMap.values());
    }
}, { immediate: true });

const refs = ref<Record<string, HTMLElement>>({});
const targetRef = ref<string>('');

const setReplyRef = (id: string) => (ref: Element | ComponentPublicInstance | null) => {
    if (ref && ref instanceof HTMLElement) {
        refs.value[`reply-${id}`] = ref;
    }
};

const { on: onScrollToReply } = useEventBus<string>('scroll-to-reply');

onScrollToReply((ref) => {
    targetRef.value = ref; // 存储目标 ref
    setTimeout(() => {
        const targetElement = refs.value[ref];
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            //console.error(`目标元素未找到: ${ref}`);
        }
    }, 1500); // 延迟 1500ms，确保 DOM 渲染完成
});

// 处理错误
if (error.value) {
    console.error(error.value);
}

postComment((msg) => {
    if (msg === 'isCommentUpdated') refresh()
})

const handleReply = (comment: any) => {
    if (comment && typeof comment === 'object' && 'id' in comment) {
        const { emit: reply } = useEventBus<{ comment: any; user: any }>('reply-to-comment');
        reply({ comment, user: comment.user_created });
    } else {
        console.error('Invalid comment object:', comment);
    }
};

// 添加展开/折叠状态管理
const isExpanded = ref<Record<string, boolean>>({});

const toggleExpand = (commentId: string) => {
    isExpanded.value[commentId] = !isExpanded.value[commentId];
};

// 计算超过半年的评论
const oldComments = computed(() => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return comments.value.filter(comment => new Date(comment.date_created) < sixMonthsAgo);
});

// 计算未超过半年的评论
const recentComments = computed(() => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return comments.value.filter(comment => new Date(comment.date_created) >= sixMonthsAgo);
});

// 控制是否显示超过半年的评论
const showOldCommentsSection = ref(false);
const showOldCommentsButton = computed(() => !showOldCommentsSection.value && oldComments.value.length > 0);

const showOldComments = () => {
    showOldCommentsSection.value = true;
};

// 删除确认弹窗逻辑
const isDeleteModalOpen = ref(false);
const itemToDelete = ref<any>(null);
const deleteType = ref<'comment' | 'reply'>('comment');
const isDeleting = ref(false);

const openDeleteModal = (item: any, type: 'comment' | 'reply') => {
    itemToDelete.value = item;
    deleteType.value = type;
    isDeleteModalOpen.value = true;
};

const confirmDelete = async () => {
    if (!itemToDelete.value || isDeleting.value) return;

    isDeleting.value = true; // 开始删除，禁用按钮并显示加载状态

    try {
        if (deleteType.value === 'comment') {
            // 先删除该评论下的所有回复
            const replies = comments.value
                .find(comment => comment.id === itemToDelete.value.id)
                ?.replies || [];

            for (const reply of replies) {
                await $directus.request($content.deleteItem('comments', reply.id));
            }

            // 再删除评论本身
            await $directus.request($content.deleteItem('comments', itemToDelete.value.id));
        } else if (deleteType.value === 'reply') {
            // 删除回复
            await $directus.request($content.deleteItem('comments', itemToDelete.value.id));
        }

        // 关闭弹窗并刷新评论列表
        isDeleteModalOpen.value = false;
        refresh();
    } catch (error) {
        console.error(error);
    } finally {
        isDeleting.value = false; // 结束删除，恢复按钮状态
    }
};

onActivated(() => {
    refresh();
})
</script>