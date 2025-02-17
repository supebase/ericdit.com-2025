<template>
  <div>
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <Toaster richColors theme="dark" :expand="true" position="top-center" />
  </div>
</template>

<script setup lang="ts">
import { Toaster } from 'vue-sonner'

const { $realtimeClient } = useNuxtApp();
const authStore = useAuthStore();

const { emit: post } = useEventBus<string>('updated')

// 检查登录状态并订阅实时数据
onMounted(async () => {
  // 检查用户登录状态
  await authStore.checkLoginStatus();

  // 订阅实时数据
  const { subscription } = await $realtimeClient.subscribe('posts', {
    query: { fields: ['*.*'] },
  });

  // 监听实时更新
  for await (const item of subscription) {
    // 仅处理非初始化事件且包含数据的事件
    if (item.event !== 'init') {
      post('isUpdated')
    }
  }

  // 建立连接
  $realtimeClient.connect();
  console.log("Websocket connection established");
})

// 组件卸载时取消订阅
onBeforeUnmount(() => {
  $realtimeClient.disconnect();
  console.log("Websocket disconnected");
})

// 设置页面标题
useHead({
  titleTemplate: '%s - Eric',
})
</script>