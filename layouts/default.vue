<template>
  <div class="flex items-center">
    <div class="p-6 w-full fixed top-0 z-50 header">
      <CommonHeader />
    </div>
  </div>
  <div class="mx-auto px-6 mt-[7.5rem]" :class="containerClass">
    <slot />
  </div>

  <CommonFooter />
</template>

<script lang="ts" setup>
const route = useRoute();

const containerClass = computed(() => {
  return route.path === '/' ? 'max-w-md' : 'max-w-md sm:max-w-xl';
});
</script>
