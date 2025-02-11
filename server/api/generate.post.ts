import { defineEventHandler } from "h3";

export default defineEventHandler(async (event) => {
  const { keywords } = await readBody(event);
  const config = useRuntimeConfig();

  try {
    const response: { choices: { message: { content: string } }[] } =
      await $fetch(`${config.deepseekApiUrl}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.deepseekApiKey}`,
          "Content-Type": "application/json",
          appid: "",
        },
        body: JSON.stringify({
          model: "deepseek-v3",
          messages: [
            {
              role: "user",
              content: `请帮我按照关键字（逗号分隔）：${keywords} 生成一篇准确、有价值的文章。文章具体要求: title简短并明确主题, summary字符范围在90到150个字之间。content字数不限，越详细越专业越好。content使用Markdown语法，不要使用一级、二级标题，使用三级和四级标题。如有参考的链接请自动添加相关链接。最后, 请返回包含title、summary和content的JSON格式`,
            },
          ],
          disable_search: false,
          enable_citation: false,
        }),
      });

    // 提取生成的文本并验证格式
    const generatedText = response.choices[0].message.content;
    const jsonStart = generatedText.indexOf("{");
    const jsonEnd = generatedText.lastIndexOf("}") + 1;
    const jsonContent = generatedText.slice(jsonStart, jsonEnd);

    return JSON.parse(jsonContent);
  } catch (error: any) {
    throw createError({
      message: error.message,
    });
  }
});
