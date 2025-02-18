<template>
    <div>
        <div v-if="status === 'error'">
            <div class="flex justify-center items-center h-96">
                <UAlert icon="hugeicons:alert-02" color="red" variant="soft" :title="$t('alert_error_title')"
                    :description="$t('alert_error_description')" />
            </div>
        </div>
        <div v-else>
            <div class="-mt-5 sm:mt-8">
                <div class="text-[1.35rem] sm:text-2xl font-bold mb-3">{{ post?.title }}</div>

                <div class="flex justify-between items-center text-gray-600 text-[0.9rem]">
                    <div class="flex items-center space-x-0 sm:space-x-4">
                        <UBadge variant="solid" color="white"
                            class="select-none pointer-events-none opacity-70 hidden sm:block">{{
                                post?.tag && post?.tag.name ? post?.tag.name : $t('post_tag_ai') }}</UBadge>

                        <div class="items-center flex">
                            {{ useFormatDate(post?.date_created) }}{{ $t('post_published') }}
                            <UIcon name="ri:arrow-drop-right-line" class="w-5 h-5 text-gray-600 mx-1" />
                            {{ $t('common_readingtime') }} {{ useReadingTime(post?.content) }}
                        </div>
                    </div>
                    <div v-if="post?.date_updated">{{ useFormatDate(post?.date_updated) }}{{ $t('post_updated') }}</div>
                </div>

                <div class="flex flex-row justify-between items-center space-x-10" v-if="post?.authors?.length">
                    <div class="group flex items-center mt-6" v-for="author in post?.authors">
                        <UAvatar size="md"
                            :src="`${useAssets(author.authors_id.avatar.filename_disk)}?fit=outside&quality=40&withoutEnlargement&width=100&height=100`"
                            :alt="author.authors_id.name" class="ring-2 ring-gray-200 dark:ring-gray-800" />
                        <div class="ml-4">
                            <p class="text-base font-medium text-gray-800 dark:text-gray-200">
                                {{ author.authors_id.name }}
                            </p>
                            <p class="text-[0.8rem] text-gray-600">
                                {{ author.authors_id.title }}
                            </p>
                        </div>
                    </div>

                    <UIcon name="hugeicons:share-05"
                        class="w-5 h-5 text-gray-700 dark:text-gray-300 mt-6 cursor-pointer"
                        @click="shareButton(post?.title, post?.summary)" />
                </div>

                <UAlert icon="hugeicons:alert-02" color="primary" variant="soft" class="mt-6"
                    :title="$t('alert_error_ai_title')" :description="$t('alert_error_ai_description')"
                    v-if="!post?.tag" />

                <div class="space-y-6 mt-6">
                    <div v-if="post?.github_link" class="my-6">
                        <GitHubCard :githubUrl="post?.github_link" />
                    </div>

                    <div v-if="!post?.tag" class="post space-y-6">
                        <div class="prose dark:prose-invert prose-zinc prose-a:decoration-orange-200 post">
                            {{ post?.summary }}
                        </div>

                        <hr />
                    </div>

                    <CommonMarkdownRenderer :markdown="post?.content" />

                    <div class="flex justify-center pt-4">
                        <CommonLike :target_id="post?.id" :user_id="authStore.user?.id" :target_type="`post`" />
                    </div>
                </div>
            </div>

            <div class="my-8 text-base text-gray-600 space-y-8">

                <div v-if="post?.allowComment">
                    <div class="py-4">
                        <CommentForm :post_id="post?.id" :user_id="authStore.user?.id || ''" />
                    </div>

                    <CommentCounter :post_id="post?.id" />
                    <CommentComments :post_id="post?.id" />
                </div>

                <div v-else>
                    <UDivider :label="$t('comment_is_closed')" :ui="{ label: 'text-gray-500' }" type="dashed"
                        class="py-1" />
                    <div class="flex justify-center items-center mt-8 pb-6 space-y-4">
                        <UIcon name="hugeicons:comment-block-02" class="w-12 h-12 text-gray-300 dark:text-gray-800" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { isClient } from '@vueuse/shared';

const { $directus, $content } = useNuxtApp();
const route = useRoute();
const authStore = useAuthStore();
const { t } = useI18n();
const { showNotification } = useNotification();

// 监听 updated 事件
const { on: onUpdated } = useEventBus<string>('updated');

const { data: post, status, refresh } = await useAsyncData(`post-${route.params.id}`, async () => {
    const postId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
    return await $directus.request(
        $content.readItem('posts', postId, {
            fields: ['*.*', { '*.*': ['*.*'] }]
        })
    )
})

const { show } = useWebNotification({
    title: t('post_success_changed_msg'),
    dir: 'auto',
    renotify: true,
    tag: 'post'
});

onUpdated((msg) => {
    if (msg === 'isUpdated') {
        setTimeout(() => {
            refresh(); // 刷新数据
            show();
        }, 500)
    }
});

const { share, isSupported } = useShare();

const shareButton = (title: string, text: string) => {
    if (isSupported) {
        return share(
            {
                title: title,
                text: text,
                url: isClient ? location.href : ''
            }
        ).catch(err => err)
    } else {
        showNotification('post-share', 'warning', t('post_share_msg'));
    }
}

useSeoMeta({
    title: computed(() => post.value?.title || t('common_home')),
})
</script>
