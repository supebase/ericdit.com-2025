<template>
  <UModal v-model="isOpen" prevent-close :ui="{ width: 'w-full sm:max-w-sm' }">
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-200 dark:divide-gray-800' }">
      <template #header>
        <div class="flex items-center justify-between">
          <div to="/" class="eric-font text-2xl font-medium text-gray-900 dark:text-orange-200 h-3" tabindex="-1">
            Eric.
          </div>
          <UButton color="gray" variant="ghost" icon="ri:close-line" class="-my-1" tabindex="-1"
            @click="isOpen = false" />
        </div>
      </template>

      <div class="flex flex-col items-center space-y-4">
        <!-- 根据 authStore 的 isUserLoaded 判断是否显示加载效果 -->
        <div v-if="authStore.loading" class="flex justify-center items-center h-[200px]">
          <UIcon name="hugeicons:loading-02" class="w-8 h-8 animate-spin" />
        </div>
        <template v-else>
          <div class="py-4">
            <UserAvatar ref="avatarRef" />
          </div>

          <div class="flex flex-col items-center space-y-2">
            <div class="text-xl font-semibold">{{ user?.first_name }}</div>
            <div class="text-sm text-gray-500">{{ user?.location }}</div>
            <div class="text-sm text-gray-500">{{ user?.email }}</div>
          </div>
          <div class="py-2">
            <UButton type="button" size="md" color="black" class="font-semibold" @click="handleLogout"
              :loading="loading" :disabled="loading">{{ $t('auth_logout') }}</UButton>
          </div>
        </template>
      </div>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
const { $authClient } = useNuxtApp();
const authStore = useAuthStore();
const { t } = useI18n();

const isOpen = ref(false); // 控制模态框的显示
const loading = ref(false);
const user = computed(() => authStore.user); // 获取用户信息

const { showNotification } = useNotification()

// 打开模态框
const avatarRef = ref<{ fetchCurrentAvatar: () => void } | null>(null);

const openModal = async () => {
  isOpen.value = true;
  await nextTick(); // 确保组件渲染完成
  avatarRef.value?.fetchCurrentAvatar(); // 手动触发头像更新
};

// 登出功能
const handleLogout = async () => {
  loading.value = true;
  try {
    await $authClient.logout();
    authStore.clearUser(); // 清除全局状态

    showNotification('logout', 'warning', t('auth_logout_warning_msg'));
  } catch (error: any) {
    showNotification('logout-error', 'error', error.errors?.[0]?.message || t('auth_logout_error_msg'));
  } finally {
    loading.value = false;
    isOpen.value = false; // 关闭模态框
  }
};

// 暴露 openModal 方法，供父组件调用
defineExpose({ openModal });
</script>