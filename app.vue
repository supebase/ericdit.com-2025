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

const { $realtimeClient } = useNuxtApp()
const authStore = useAuthStore();

const { emit: post } = useEventBus<string>('updated')

onMounted(async () => {
  authStore.checkLoginStatus();

  const { subscription } = await $realtimeClient.subscribe('posts', {
    query: { fields: ['*.*'] },
  });

  for await (const item of subscription) {
    if (item.event !== 'init') post('isUpdated')
  }

  $realtimeClient.connect()
  onBeforeUnmount(subscription)
})

useHead({
  titleTemplate: '%s - Eric',
})
</script>