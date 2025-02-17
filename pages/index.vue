<template>
  <div class="my-8">
    <main class="content space-y-2 relative" id="content">
      <section class="section container section-posts section-featured space-y-5 sm:space-y-10"
        v-for="(group, index) in sortedGroupedPosts" :key="group.year">
        <div class="relative h-20 pointer-events-none select-none">
          <div
            class="absolute -top-16 -left-9 text-[6.5rem] sm:text-[8rem] font-bold text-transparent year-stroke -z-10">
            {{ group.year }}
          </div>
          <div class="swiper-nav absolute hidden sm:flex sm:top-2 sm:left-80 gap-2 z-10">
            <UIcon name="hugeicons:arrow-left-01"
              :class="`swiper-button-prev-${group.year} cursor-pointer opacity-50 hover:opacity-100 transition-opacity`" />
            <UIcon name="hugeicons:arrow-right-01"
              :class="`swiper-button-next-${group.year} cursor-pointer opacity-50 hover:opacity-100 transition-opacity`" />
          </div>
        </div>
        <div :class="`swiper featured-slider featured-slider-${group.year}`">
          <div class="swiper-wrapper">
            <div class="swiper-slide" v-for="post in group.posts" :key="post.id">
              <article class="card card-post">
                <div class="card-header">
                  <NuxtLink :href="post.id" class="card-title truncate text-gray-900 dark:text-gray-100" tabindex="-1">{{ post.title }}
                  </NuxtLink>
                  <div class="card-meta mt-2.5 flex items-center">
                    <time class="card-date">
                      <div class="text-gray-500 text-[13px] select-none">
                        {{ useFormatDate(post.date_created) }}
                      </div>
                    </time>
                    <UIcon name="ri:arrow-drop-right-line" class="w-5 h-5 text-gray-600" />
                    <div class="text-gray-500 text-[13px] select-none">
                      {{ $t('common_readingtime') }} {{ useReadingTime(post.content) }}
                    </div>
                  </div>
                </div>
                <div class="card-content line-clamp-4 text-gray-700/90 dark:text-gray-300/90">
                  {{ post.summary }}
                </div>
                <div class="card-footer flex items-center justify-between">
                  <UBadge variant="solid" size="sm" color="white" class="select-none opacity-70">{{
                    post.tag ? post.tag.name : $t('post_tag_ai') }}</UBadge>
                  <CommentCounter :post_id="post.id" :isHome="true" :allowComment="post.allowComment" />
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script lang="ts" setup>
import Swiper from 'swiper';
import { EffectCards, Navigation } from 'swiper/modules';
import 'swiper/css/bundle';

const { $directus, $content } = useNuxtApp();
const { t } = useI18n();
const { showNotification } = useNotification();

const { on: postUpdated } = useEventBus<string>('updated')

const { data: posts, error, refresh } = await useAsyncData('posts', async () => {
  return await $directus.request(
    $content.readItems('posts', {
      fields: ['*.*'],
      sort: ['-date_created'],
      filter: { status: 'published' },
    })
  )
})

postUpdated((msg) => {
  if (msg === 'isUpdated') {
    refresh();
    
    setTimeout(() => {
      showNotification('post-change', 'warning', t('post_success_changed_msg'));
    }, 500)
  }
});

// 按年份分组并降序排列
const sortedGroupedPosts = computed(() => {
  if (error.value || !posts.value || !Array.isArray(posts.value)) return [];

  const grouped = posts.value.reduce((acc, post) => {
    const year = new Date(post.date_created).getFullYear().toString();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(post);
    return acc;
  }, {} as Record<string, typeof posts.value>);

  return Object.keys(grouped)
    .sort((a, b) => Number(b) - Number(a))
    .map(year => ({
      year,
      posts: grouped[year]
    }));
});

// 添加 Swiper 实例存储
const swiperInstances = ref<Swiper[]>([]);

// 添加 Swiper 销毁方法
const destroySwipers = () => {
  swiperInstances.value.forEach(swiper => swiper.destroy());
  swiperInstances.value = [];
};

// 动态更新导航按钮状态
const updateNavButtons = (swiper: any) => {
  const prevEl = swiper.navigation.prevEl;
  const nextEl = swiper.navigation.nextEl;
  prevEl.classList.toggle('swiper-button-disabled', swiper.isBeginning);
  nextEl.classList.toggle('swiper-button-disabled', swiper.isEnd);
};

// 修改初始化方法
const initSwiper = (year: string) => {
  const swiper = new Swiper(`.featured-slider-${year}`, {
    modules: [EffectCards, Navigation],
    effect: 'cards',
    cardsEffect: {
      slideShadows: false,
      perSlideRotate: 3,
      perSlideOffset: 8,
    },
    navigation: {
      nextEl: `.swiper-button-next-${year}`,
      prevEl: `.swiper-button-prev-${year}`,
    },
    grabCursor: true,
    touchRatio: 0.4,
    on: {
      init: updateNavButtons,
      slideChange: updateNavButtons,
    },
  });
  swiperInstances.value.push(swiper);
};

onMounted(() => {
  sortedGroupedPosts.value.forEach((group) => {
    initSwiper(group.year);
  });
});

const isClient = typeof window != 'undefined';

// 添加监听和初始化逻辑
watch(sortedGroupedPosts, async (newGroups) => {
  if (isClient) {
    await nextTick();
    destroySwipers();
    newGroups.forEach(group => initSwiper(group.year));
  }
}, { immediate: true });

// 组件卸载时清理
onBeforeUnmount(() => {
  destroySwipers();
});

useSeoMeta({
  title: t('common_home'),
});
</script>