import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css"; // 选择你喜欢的代码高亮样式

// 初始化 Markdown 解析器
const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  typographer: true,
  highlight: (str: string, lang: string) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }
    return ""; // 使用默认的高亮处理
  },
});

// 添加 target="_blank" 到链接
md.renderer.rules.link_open = (
  tokens: any,
  idx: any,
  options: any,
  env: any,
  self: any
) => {
  const token = tokens[idx];
  const hrefIndex = token.attrIndex("href");
  if (hrefIndex >= 0) {
    token.attrPush(["target", "_blank"]); // 添加 target="_blank"
    token.attrPush(["rel", "noopener noreferrer"]); // 安全措施
  }
  return self.renderToken(tokens, idx, options);
};

md.renderer.rules.fence = (tokens: any, idx: any) => {
  const token = tokens[idx];
  const code = token.content;
  const lang = token.info.trim();

  let highlightedCode = code;
  if (lang && hljs.getLanguage(lang)) {
    try {
      highlightedCode = hljs.highlight(code, { language: lang }).value;
    } catch (__) {}
  }

  // 将代码按行分割
  //const lines = highlightedCode.split('\n');

  // 生成带行号的代码块
  // const numberedCode = lines
  //   .map((line: any, index: number) => {
  //     if (line.trim() === '') {
  //       return `<div class="code-line"><span class="line-number"></span><span class="line-content">${line}</span></div>`;
  //     }
  //     return `<div class="code-line"><span class="line-number">${index + 1}</span><span class="line-content">${line}</span></div>`;
  //   })
  //   .join('');

  return (
    '<div class="code-block relative"><pre class="py-6 hljs ' +
    lang +
    ' !bg-gray-900 !rounded-lg"><span class="absolute right-3 top-2 uppercase text-gray-600 select-none pointer-events-none text-[10px]">' +
    lang +
    "</span><code>" +
    highlightedCode +
    "</code></pre></div>"
  );
};

md.renderer.rules.image = (
  tokens: any,
  idx: any,
  options: any,
  env: any,
  self: any
) => {
  const token = tokens[idx];
  const srcIndex = token.attrIndex("src");
  const src = token.attrs[srcIndex][1];
  const alt = token.content;

  const placeholder = `<div class="relative ring-2 ring-gray-900 rounded-lg"><svg class="animate-spin h-5 w-5 text-white z-10 absolute right-1/2 top-[45%]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg><img src="${src}?fit=outside&quality=10&withoutEnlargement" class="blur-md" /></div>`;

  const img = `<img src="${src}" alt="${alt}" style="display: none;" onload="this.style.display='block'; this.previousElementSibling.style.display='none';" />`;

  return `${placeholder}${img}`;
};

// 导出一个 composable 函数
export const useMarkdownParser = () => {
  const parseMarkdown = (
    markdown: string,
    enableHtml: boolean = true,
    enableLink: boolean = true
  ): string => {
    if (typeof markdown !== "string") {
      return "";
    }

    const localMd = new MarkdownIt({
      html: enableHtml, // 根据参数控制是否启用 HTML 解析
      breaks: true,
      linkify: enableLink, // 根据参数控制是否启用 LINK 解析
      typographer: true,
      highlight: (str: string, lang: string) => {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(str, { language: lang }).value;
          } catch (__) {}
        }
        return ""; // 使用默认的高亮处理
      },
    });

    // 复制原有的渲染规则
    localMd.renderer.rules.link_open = md.renderer.rules.link_open;
    localMd.renderer.rules.fence = md.renderer.rules.fence;
    localMd.renderer.rules.image = md.renderer.rules.image;

    return localMd.render(markdown);
  };

  return {
    parseMarkdown,
  };
};
