<template>
    <div class="space-y-3 select-none"
        :class="{ 'cursor-pointer': canLike && !loading, 'opacity-50': !canLike || loading, 'flex items-center !space-y-0': target_type === 'comment' }"
        @click="handleClickLike" ref="buttonRef">
        <div class="git-nums text-center transition-all duration-300 overflow-hidden"
            :class="{ 'text-gray-600 dark:text-gray-400': hasLiked, 'text-gray-800 dark:text-gray-200': !hasLiked, 'order-2 !text-sm': target_type === 'comment' }">
            <div class="number-roll" :style="{ transform: `translateY(${translateY}%)` }">
                <div v-for="num in numbers" :key="num">{{ num }}</div>
            </div>
        </div>
        <div class="relative w-8 h-8" :class="{ 'animate-like': isAnimating, 'order-1': target_type === 'comment' }"
            @animationend="isAnimating = false">
            <UIcon :name="target_type === 'post'
                ? (hasLiked ? 'hugeicons:clapping-02' : 'hugeicons:clapping-02')
                : (hasLiked ? 'hugeicons:heart-check' : 'hugeicons:favourite')
                " class="w-8 h-8 transition-all duration-300 "
                :class="{ 'text-gray-600 dark:text-gray-400': hasLiked, 'text-gray-800 dark:text-gray-200': !hasLiked, '!w-5 !h-5 mt-[5px]': target_type === 'comment' }" />
        </div>
    </div>
</template>

<script setup lang="ts">
const { $directus, $content } = useNuxtApp();
const { t } = useI18n();
const { showNotification } = useNotification();

const props = defineProps({
    target_id: { type: String, required: true },
    user_id: { type: String, default: null },
    target_type: { type: String, required: true },
})

// 状态管理
const loading = ref(true)
const likes = ref<Array<any>>([])
const hasLiked = ref(false)
const canLike = computed(() => !hasLiked.value && !!props.user_id)
const likesCount = computed(() => likes.value?.length || 0)
const isAnimating = ref(false)
const translateY = ref(0)
const numbers = ref<number[]>([0])

// 获取点赞数据
const fetchLikes = async () => {
    try {
        loading.value = true
        const response = await $directus.request(
            $content.readItems('likes', {
                fields: ['user_created'],
                filter: { target_id: { _eq: props.target_id } }
            })
        )
        likes.value = response
        hasLiked.value = props.user_id
            ? response.some((like: any) => like.user_created === props.user_id)
            : false
        updateNumbers()
    } catch (error) {
        //console.error('获取点赞数据失败:', error)
    } finally {
        loading.value = false
    }
}

// 更新数字列表
const updateNumbers = () => {
    const currentCount = likesCount.value
    const newNumbers = Array.from({ length: 10 }, (_, i) => (currentCount + i) % 10)
    numbers.value = newNumbers
}

// 点赞处理（增加防抖）
let lastClickTime = 0
const handleClickLike = async () => {
    // 防止重复点击
    if (Date.now() - lastClickTime < 1000) return
    lastClickTime = Date.now()

    if (!props.user_id) {
        showNotification('like-login', 'error', t('like_error_login_msg'))
        return
    }

    if (hasLiked.value) {
        showNotification('liked-error', 'error', t('like_error_repeat_msg'))
        return
    }

    try {
        loading.value = true
        isAnimating.value = true;
        fireLocalConfetti();

        // 提交点赞
        await $directus.request(
            $content.createItem('likes', {
                user_created: props.user_id,
                target_id: props.target_id,
                target_type: props.target_type,
            })
        )

        // 更新本地状态
        likes.value = [...likes.value, { user_created: props.user_id }]
        hasLiked.value = true
        showNotification('like-success', 'success', t('like_success_msg'))

        // 触发数字滚动动画
        translateY.value = -100
        setTimeout(() => {
            translateY.value = 0
            updateNumbers()
        }, 300)
    } catch (error) {
        showNotification('like-err', 'error', t('like_error_msg'))
    } finally {
        loading.value = false
    }
}

const buttonRef = ref(null);

const fireLocalConfetti = async () => {
    if (process.client) { // 确保仅在客户端运行
        const confetti = await import('canvas-confetti');
        const confettiFn = confetti.default;

        // 获取按钮的中心点坐标
        const buttonRect = buttonRef.value ? (buttonRef.value as HTMLElement).getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 };
        const origin = {
            x: (buttonRect.left + buttonRect.width / 2) / window.innerWidth,
            y: (buttonRect.top + buttonRect.height / 2) / window.innerHeight
        };

        // 局部核心效果
        confettiFn({
            particleCount: 40,      // 纸屑数量（减少总量）
            spread: 50,             // 扩散角度（更小的范围）
            startVelocity: 15,      // 初始速度（更柔和）
            origin: origin,         // 从按钮中心爆发
            gravity: 1,           // 重力加强（纸屑更快下落）
            ticks: 90,              // 动画持续时间
            colors: ['#FF69B4', '#00FFFF', '#FFD700'], // 自定义颜色
            zIndex: 0               // 确保在按钮下方
        });
    }
};

// 初始化和监听
onMounted(fetchLikes)
onActivated(fetchLikes)
watch(() => props.user_id, fetchLikes)
</script>

<style scoped>
@keyframes like {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.4);
    }

    100% {
        transform: scale(1);
    }
}

.animate-like {
    animation: like 0.3s ease-in-out;
}

.git-nums {
    font-variant-numeric: tabular-nums;
    height: 1.4em;
    font-size: 1.2em;
    overflow: hidden;
}

.number-roll {
    transition: transform 0.3s ease-in-out;
}

.number-roll div {
    line-height: 1.4em;
    height: 1.4em;
}
</style>