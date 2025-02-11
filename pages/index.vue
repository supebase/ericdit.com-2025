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
            <div class="swiper-slide" v-for="post in group.posts" :key="post.id"
              :class="{ 'cube rounded-lg': !post.tag }">
              <article class="card card-post">
                <div class="card-header">
                  <NuxtLink :href="post.id" class="card-title truncate text-gray-100" tabindex="-1">{{ post.title }}
                  </NuxtLink>
                  <div class="card-meta mt-2.5 flex items-center">
                    <time class="card-date">
                      <UTooltip v-if="post.date_updated"
                        :popper="{ arrow: true, placement: 'left', offsetDistance: 12 }">
                        <div class="text-gray-500 text-[13px] select-none cursor-help">
                          {{ useFormatDate(post.date_created) }}
                        </div>
                        <template #text>
                          <span>{{ useFormatDate(post.date_updated) }}{{ $t('post_updated') }}</span>
                        </template>
                      </UTooltip>
                      <div v-else class="text-gray-500 text-[13px] select-none">
                        {{ useFormatDate(post.date_created) }}
                      </div>
                    </time>
                    <UIcon name="ri:arrow-drop-right-line" class="w-5 h-5 text-gray-600" />
                    <div class="text-gray-500 text-[13px] select-none">
                      {{ $t('common_readingtime') }} {{ useReadingTime(post.content) }}
                    </div>
                  </div>
                </div>
                <div class="card-content line-clamp-4 text-gray-300/90">
                  {{ post.summary }}
                </div>
                <div class="card-footer flex items-center justify-between">
                  <UBadge variant="solid" color="white" class="select-none opacity-70">{{
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

const { $directus, $readItems } = useNuxtApp();
const { t } = useI18n();
const { showNotification } = useNotification();

const { on: postUpdated } = useEventBus<string>('updated')

const { data: posts, error, refresh } = await useAsyncData('posts', async () => {
  return await $directus.request(
    $readItems('posts', {
      fields: ['*.*'],
      sort: ['-date_created'],
      filter: { status: 'published' },
    })
  )
})

postUpdated((msg) => {
  if (msg === 'isUpdated') {
    setTimeout(() => {
      showNotification('post-change', 'success', t('post_success_changed_msg'));
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

// 动态更新导航按钮状态
const updateNavButtons = (swiper: any) => {
  const prevEl = swiper.navigation.prevEl;
  const nextEl = swiper.navigation.nextEl;
  prevEl.classList.toggle('swiper-button-disabled', swiper.isBeginning);
  nextEl.classList.toggle('swiper-button-disabled', swiper.isEnd);
};

// 初始化 Swiper
const initSwiper = (year: string) => {
  new Swiper(`.featured-slider-${year}`, {
    modules: [EffectCards, Navigation],
    effect: 'cards',
    cardsEffect: {
      slideShadows: true,
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
      init: function (swiper) {
        updateNavButtons(swiper);
      },
      slideChange: function (swiper) {
        updateNavButtons(swiper);
      },
    },
  });
};

onMounted(() => {
  sortedGroupedPosts.value.forEach((group) => {
    initSwiper(group.year);
  });
});

useSeoMeta({
  title: t('common_home'),
});
</script>