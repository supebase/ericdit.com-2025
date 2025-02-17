<template>
    <UPopover :popper="{ arrow: true }">
        <div class="mt-1.5">
            <UIcon name="streamline:mail-smiley-happy-face-chat-message-smiley-smile-emoji-face-satisfied"
                @click="togglePicker" class="w-[18px] h-[18px] text-gray-600 dark:text-gray-400 cursor-pointer" />
        </div>

        <template #panel>
            <div class="p-2">
                <NuxtEmojiPicker v-if="isPickerVisible" native hide-search hide-group-icons hide-group-names
                    disable-sticky-group-names disable-skin-tones :theme="isDark" @select="handleEmojiSelect"
                    :disabled-groups="disabledGroups" />
            </div>
        </template>
    </UPopover>
</template>

<script setup lang="ts">
const colorMode = useColorMode();
const isDark = computed(() => (colorMode.value === 'dark' ? 'dark' : 'light') as 'dark' | 'light')

const isPickerVisible = ref(false);

const togglePicker = () => {
    isPickerVisible.value = !isPickerVisible.value;
};

const disabledGroups = ref([
    "animals_nature",
    "food_drink",
    "activities",
    "travel_places",
    "objects",
    "symbols",
    "flags"
]);

const emit = defineEmits(['emoji']);

const handleEmojiSelect = (emoji: { i: string }) => {
    if (typeof emoji.i === 'string') {
        emit('emoji', emoji.i);
        isPickerVisible.value = false;
    } else {
        console.error('Invalid emoji:', emoji);
    }
};
</script>