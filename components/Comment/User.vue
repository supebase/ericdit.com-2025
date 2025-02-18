<template>
    <div class="group flex items-center">
        <UChip inset :show="user.token ? true : false">
            <UAvatar size="md"
                :src="`${useAssets(user.avatar)}?fit=outside&quality=40&withoutEnlargement&width=100&height=100`"
                :alt="user.first_name" class="ring-2 ring-gray-200 dark:ring-gray-800" />
        </UChip>
        <div class="ml-4">
            <div class="flex items-center text-base font-medium text-gray-800 dark:text-gray-200 space-x-3">
                <div>{{ user.first_name }}</div>
            </div>
            <div class="text-[0.8rem] text-gray-600 space-x-1 flex items-center">
                <span>{{ useFormatDate(date) }}</span>
                <UIcon name="ri:arrow-drop-right-line" class="w-5 h-5 text-gray-600" />
                <span>{{ user.location }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    user: {
        type: Object,
        required: true
    },
    date: {
        type: String,
        required: true
    }
})
</script>