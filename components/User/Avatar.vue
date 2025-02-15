<template>
    <div class="relative">
        <!-- 显示当前头像 -->
        <div class="relative w-20 h-20 rounded-full cursor-pointer" @click="openFileInput">
            <UAvatar size="3xl"
                :src="`${currentAvatarUrl || ''}?fit=outside&quality=80&withoutEnlargement&width=90&height=90`"
                :alt="authStore.user?.first_name" class="ring-2 ring-gray-800" />
            <!-- 删除图标 -->
            <div v-if="currentAvatarId" class="absolute bottom-0 -right-2 cursor-pointer" @click.stop="deleteAvatar">
                <div class="ring-2 ring-zinc-900 bg-zinc-900 rounded-full w-6 h-6">
                    <UIcon name="hugeicons:cancel-circle-half-dot" class="w-6 h-6 text-red-500" />
                </div>
            </div>
        </div>

        <!-- 隐藏的文件输入 -->
        <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/jpeg, image/png, image/gif"
            class="hidden" />

        <!-- 加载动画 -->
        <div v-if="isLoading"
            class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
            <UIcon name="hugeicons:loading-02" class="w-8 h-8 animate-spin text-white" />
        </div>
    </div>
</template>

<script setup lang="ts">
const { $authClient, $user, $file } = useNuxtApp();
const authStore = useAuthStore();
const { t } = useI18n();

const { showNotification } = useNotification()

const fileInput = ref<HTMLInputElement | null>(null); // 文件输入引用

const file = ref<File | null>(null); // 用户选择的文件
const currentAvatarId = ref<string | null>(null); // 当前头像的文件 ID
const currentAvatarUrl = ref<string | null>(null); // 当前头像的 URL

interface User {
    id: string;
    email: string;
    first_name: string;
    avatar: string;
    token: string;
    location: string;
}

// 打开文件选择对话框
const openFileInput = () => {
    fileInput.value?.click();
};

// 处理文件选择
const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
        const uploadedFile = target.files[0];
        // 检查文件格式和大小
        if (['image/jpeg', 'image/png', 'image/gif'].includes(uploadedFile.type) && uploadedFile.size <= 2 * 1024 * 1024) {
            file.value = uploadedFile;
            uploadAvatar();
        } else {
            showNotification('avatar-error', 'error', t('avatar_error_limit_msg'));
        }
    }
};

const isLoading = ref(false); // 加载状态

// 上传头像
const uploadAvatar = async () => {
    if (!file.value) return;

    isLoading.value = true; // 开始加载

    const formData = new FormData();
    formData.append('file', file.value);

    try {
        // 如果用户已经有头像，先删除旧头像
        if (currentAvatarId.value) {
            await $authClient.request($file.deleteFile(currentAvatarId.value));
        }

        // 上传新头像
        const uploadResponse = await $authClient.request($file.uploadFiles(formData));

        // 确保 uploadResponse 是一个对象，并且包含文件信息
        if (uploadResponse && uploadResponse.id) {
            const fileId = uploadResponse.id; // 获取上传文件的 ID

            // 更新用户记录中的头像字段
            await $authClient.request(
                $user.updateUser(authStore.user?.id || '', { avatar: fileId }) // 假设 currentUserId 是当前用户的 ID
            );

            const updatedUser = await $authClient.request($user.readMe({ fields: ['id', 'email', 'first_name', 'avatar', 'token', 'location'] })) as User;
            authStore.setUser(updatedUser);

            // 更新当前头像信息
            currentAvatarId.value = fileId;
            currentAvatarUrl.value = useAssets(fileId) || null; // 构建文件 URL

            // 清空文件输入
            file.value = null;
        } else {
            showNotification('avatar-error-upload', 'error', t('avatar_error_info_msg'));
            //console.error(uploadResponse);
        }
    } catch (error) {
        showNotification('avatar-error-upload-retry', 'error', t('avatar_error_retry_msg'));
        //console.error(error);
    } finally {
        isLoading.value = false; // 结束加载
    }
};

// 删除头像
const deleteAvatar = async () => {
    if (!currentAvatarId.value) return;

    isLoading.value = true; // 开始加载

    try {
        // 删除 Directus 中的文件记录
        await $authClient.request($file.deleteFile(currentAvatarId.value));

        // 清空当前头像信息
        currentAvatarId.value = null;
        currentAvatarUrl.value = null;

        // 更新用户记录中的头像字段
        await $authClient.request(
            $user.updateUser(authStore.user?.id || '', { avatar: null })
        );

        const updatedUser = await $authClient.request($user.readMe({ fields: ['id', 'email', 'first_name', 'avatar'] })) as User;
        authStore.setUser(updatedUser);
    } catch (error) {
        showNotification('avatar-error-delete', 'error', t('avatar_error_delete_msg'));
        //console.error(error);
    } finally {
        isLoading.value = false; // 结束加载
    }
};

// 初始化时读取当前用户头像
const fetchCurrentAvatar = async () => {
    try {
        const avatarId = authStore.user?.avatar;
        if (avatarId) {
            isLoading.value = true;
            const avatarResponse = await $authClient.request($file.readFile(avatarId, { fields: ['*'] }));

            // 更新当前头像信息
            currentAvatarId.value = avatarResponse.id;
            currentAvatarUrl.value = useAssets(avatarResponse.id) || null;

            isLoading.value = false;
        }
    } catch (error) {
        showNotification('avatar-error-read', 'error', t('avatar_error_read_msg'));
        //console.error(error);
    }
};

// 使用 watch 监听用户头像变化
watch(
    () => authStore.user?.avatar,
    (newAvatarId) => {
        if (newAvatarId && newAvatarId !== currentAvatarId.value) {
            fetchCurrentAvatar();
        }
    },
    { immediate: true } // 初始化时立即执行一次
);

// 暴露 fetchCurrentAvatar 方法，供父组件调用
defineExpose({ fetchCurrentAvatar });
</script>