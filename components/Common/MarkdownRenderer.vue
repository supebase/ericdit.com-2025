<template>
  <div v-html="parsedMarkdown" class="prose dark:prose-invert prose-zinc prose-a:decoration-orange-200 post"></div>
</template>

<script lang="ts">
export default defineComponent({
  props: {
    markdown: {
      type: String,
      required: true,
    },
    enableHtml: {
      type: Boolean,
      default: true, // 默认启用 HTML 解析
    },
    enableLink: {
      type: Boolean,
      default: true, // 默认启用 LINK 解析
    },
  },
  setup(props) {
    const { parseMarkdown } = useMarkdownParser();
    const parsedMarkdown = ref<string>('');

    // 使用 watch 监听 markdown 变化，确保每次变化时重新解析
    watch(() => props.markdown, (newMarkdown) => {
      if (typeof newMarkdown === 'string') {
        parsedMarkdown.value = parseMarkdown(newMarkdown, props.enableHtml, props.enableLink);
      } else {
        parsedMarkdown.value = '';
      }
    });

    // 初次渲染时解析 Markdown
    parsedMarkdown.value = parseMarkdown(props.markdown, props.enableHtml, props.enableLink);

    return {
      parsedMarkdown,
    };
  },
});
</script>