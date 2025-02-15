<template>
    <div v-if="!isLoaded" class="min-h-[140px] max-w-[300px] flex items-center justify-center mx-auto">
        <UProgress size="sm" animation="carousel" />
    </div>
    <div v-else-if="error">
        <p>Error: {{ error }}</p>
    </div>
    <div v-else-if="projectInfo">
        <div class="flex flex-col bg-gray-900 relative w-full justify-center rounded-lg overflow-hidden">
            <div class="p-6 flex flex-col justify-between h-full relative">
                <div class="flex justify-between items-center gap-6 h-full mb-2">
                    <div class="flex flex-col gap-2">
                        <a :href="`https://github.com/${projectInfo.owner}/${projectInfo.repo}`"
                            rel="noopener noreferrer" target="_blank" class="flex gap-1 text-xl flex-wrap leading-none"
                            tabindex="-1">
                            <span class="text-gray-300">{{ projectInfo.owner }}</span>
                            <span class="text-gray-500">/</span>
                            <span class="text-orange-200 font-bold">{{ projectInfo.repo }}</span>
                        </a>
                        <div class="text-sm text-gray-500">
                            <span v-if="projectInfo.prNumber > 0" class="me-2">PR #{{ projectInfo.prNumber }}</span>
                            <span class="leading-tight">{{ projectInfo.title }}</span>
                        </div>
                    </div>
                </div>
                <div class="flex justify-between mt-3 flex-col sm:flex-row space-y-2 sm:space-y-0">
                    <div class="flex gap-2.5 items-center">
                        <img :src="projectInfo.projectAvatarUrl" @load="onImageLoad(projectInfo.projectAvatarUrl)"
                            class="hidden" />
                        <UAvatar size="xs" :src="loadedImages[projectInfo.projectAvatarUrl] || placeholder"
                            :alt="projectInfo.projectAuthor" class="ring-2 ring-gray-800" />
                        <div class="text-sm text-gray-500">@{{ projectInfo.projectAuthor }}</div>
                    </div>
                    <div class="flex gap-3.5 text-sm text-gray-500 items-center ml-[34px] sm:ml-0">
                        <div class="flex items-center space-x-1">
                            <UIcon name="hugeicons:git-fork" class="w-[19px] h-[19px]" />
                            <div class="git-nums">{{ projectInfo.forksCount }}</div>
                        </div>
                        <div class="flex items-center space-x-1">
                            <UIcon name="hugeicons:star" class="w-4 h-4" />
                            <div class="git-nums">{{ projectInfo.stargazersCount }}</div>
                        </div>
                        <div class="flex items-center space-x-1">
                            <UIcon name="hugeicons:view" class="w-[19px] h-[19px]" />
                            <div class="git-nums">{{ projectInfo.watchersCount }}</div>
                        </div>
                    </div>
                </div>

                <UIcon name="hugeicons:github-01" class="text-[14em] text-gray-600/10 absolute -top-16 -right-16" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    githubUrl: string;
}>();

const { isLoaded, projectInfo, error, fetchProjectInfo } = useGitHubCard(props.githubUrl);

onMounted(() => {
    fetchProjectInfo();
});

const loadedImages = ref<Record<string, string>>({})
const placeholder = ''

const onImageLoad = (image: string) => {
    const imageUrl = image;
    loadedImages.value[image] = imageUrl;
}
</script>