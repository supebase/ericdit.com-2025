<template>
    <div>
        <form @submit.prevent="handlePostComment">
            <div class="ring-2 ring-gray-800 bg-gray-950 rounded-lg p-3"
                :class="{ 'ring-red-500': isCommentExceedLimit, '!ring-gray-700 !bg-gray-900': isReplying }">
                <UTextarea ref="commentInput" color="white" variant="none" :placeholder="randomPlaceholder" autoresize
                    :rows="2" :padded="false" v-model="comment" class="text-gray-300"
                    :class="{ 'ring-red-500': isCommentExceedLimit }" @input="handleInput" :maxlength="300" required />
                <div class="flex justify-between items-center pt-1">
                    <div class="flex items-center space-x-4">
                        <Emoji @emoji="handleEmojiInsert" />
                        <div class="text-sm text-gray-700 flex items-center space-x-1.5">
                            <UIcon name="streamline:markdown-circle-programming" class="w-[18px] h-[18px]" />
                            <div>Markdown 语法</div>
                        </div>
                    </div>

                    <div class="space-x-5 flex items-center">
                        <!-- 动态绑定字数统计的颜色 -->
                        <span class="text-sm"
                            :class="{ 'text-gray-600': !isCommentExceedLimit, 'text-red-500': isCommentExceedLimit }">
                            {{ comment.length }} / 300
                        </span>
                        <UButton v-if="isReplying" type="button" color="red" size="lg" variant="ghost" :padded="false"
                            icon="hugeicons:comment-remove-02" class="hover:!bg-transparent" @click="cancelReply" />
                        <UButton type="submit" color="gray" size="lg" variant="ghost" :padded="false"
                            class="hover:!bg-transparent" icon="hugeicons:comment-add-02" :loading="loading"
                            :disabled="isCommentEmpty || isCommentExceedLimit || loading" />
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
const { $directus, $createItem } = useNuxtApp()
const { showNotification } = useNotification()

// 定义 props
const props = defineProps({
    post_id: {
        type: String,
        required: true,
    },
    user_id: {
        type: String,
        required: true,
    },
});

const comment = ref("")
const loading = ref(false)
const isReplying = ref(false)
const replyingToUser = ref("")
const replyingToCommentId = ref("")

// 定义提示语数组
const placeholders = [
    "说点什么吧 ...",
    "有什么想法？欢迎留言~",
    "灵感来袭？快写下您的独特见解！",
    "分享您的故事或经验，让大家听听吧！",
    "喜欢或不喜欢？说说原因吧！",
    "欢迎加入讨论，畅所欲言~",
];

const randomPlaceholder = ref("");

// 随机生成 placeholder 的逻辑
const generateRandomPlaceholder = () => {
    randomPlaceholder.value = placeholders[Math.floor(Math.random() * placeholders.length)];
};

// 组件挂载时生成随机 placeholder
onMounted(() => {
    generateRandomPlaceholder();
});

// 组件被激活时（keep-alive 缓存下）重新生成随机 placeholder
onActivated(() => {
    generateRandomPlaceholder();
});

// 用于控制 toast 提示的频率
const toastActive = ref(false);

// 监听输入事件
const handleInput = (event: Event) => {
    const target = event.target as HTMLTextAreaElement;
    const value = target.value;

    // 如果内容超过300字，截取前300字
    if (value.length > 300) {
        comment.value = value.slice(0, 300); // 更新 v-model 绑定的值
        target.value = comment.value; // 直接更新输入框的值
        if (!toastActive.value) { // 避免频繁 toast 提示
            showNotification('comment-error', 'error', '评论字数不能超过 300 字');
            toastActive.value = true;
            setTimeout(() => {
                toastActive.value = false;
            }, 3000); // 3秒后重置 toast 状态
        }
    }
};

// 判断评论内容是否为空（只有空格或回车）
const isCommentEmpty = computed(() => {
    return !comment.value.trim();
});

// 判断评论内容是否超过300字
const isCommentExceedLimit = computed(() => {
    return comment.value.length >= 300; // 当达到 300 字时触发
});

const handlePostComment = async () => {
    if (isCommentEmpty.value) {
        showNotification('comment-warning', 'warning', '评论内容不能为空');
        return;
    }

    if (isCommentExceedLimit.value) {
        showNotification('comment-error', 'error', '评论字数不能超过 300 字');
        return;
    }

    try {
        loading.value = true;
        const response = await $directus.request(
            $createItem('comments', {
                comment: comment.value,
                post_id: props.post_id,
                user_created: props.user_id,
                reply_to: isReplying.value ? replyingToCommentId.value : null,
            })
        );
        comment.value = ""; // 清空评论框
        loading.value = false;

        showNotification('comment-success', 'success', isReplying.value ? '回复提交成功' : '评论提交成功');

        const { emit: comments } = useEventBus<string>('comment-posted')
        comments('isCommentUpdated')

        // 如果是回复，传递回复的 id
        if (isReplying.value && response?.id) {
            const replyId = response.id; // 根据 response 结构提取 id
            if (replyId) {
                const { emit: scrollToReply } = useEventBus<string>('scroll-to-reply');
                scrollToReply(`reply-${replyId}`);
            } else {
                console.error('回复提交成功，但未返回有效的 id');
            }
        }

        isReplying.value = false;
    } catch (error) {
        showNotification('comment-err', 'error', isReplying.value ? '回复提交失败' : '评论提交失败');
    }
}

const commentInput = ref<any>(null); // 使用 any 类型，因为 UTextarea 的类型可能不是 HTMLTextAreaElement

// 表情插入逻辑
const handleEmojiInsert = (emoji: string) => {
    if (commentInput.value) {
        // 获取光标位置
        const textarea = commentInput.value.$el.querySelector('textarea');
        if (textarea) {
            const cursorPosition = textarea.selectionStart || 0;
            const textBeforeCursor = comment.value.slice(0, cursorPosition);
            const textAfterCursor = comment.value.slice(cursorPosition);

            // 更新评论内容
            comment.value = textBeforeCursor + emoji + textAfterCursor;

            // 移动光标到插入表情后的位置
            setTimeout(() => {
                if (textarea) {
                    const newCursorPosition = cursorPosition + emoji.length;
                    textarea.setSelectionRange(newCursorPosition, newCursorPosition);
                    textarea.focus();
                }
            }, 0);
        }
    }
};

// 监听回复事件
const { on: onReply } = useEventBus<{ comment: any, user: any }>('reply-to-comment');

onReply(({ comment, user }) => {
    isReplying.value = true;
    replyingToUser.value = user.first_name;
    replyingToCommentId.value = comment.id;
    randomPlaceholder.value = `回复：${replyingToUser.value}`;
    commentInput.value.$el.querySelector('textarea').focus();
});

// 取消回复
const cancelReply = () => {
    isReplying.value = false;
    replyingToUser.value = "";
    replyingToCommentId.value = "";
    randomPlaceholder.value = placeholders[Math.floor(Math.random() * placeholders.length)]; // 恢复原始 placeholder
};

onDeactivated(() => {
    comment.value = "";
})
</script>
