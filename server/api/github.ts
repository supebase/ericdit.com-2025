import { defineEventHandler } from "h3";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { githubUrl } = await readBody(event);

  const urlParts = githubUrl.replace("https://github.com/", "").split("/");
  if (urlParts.length < 2) {
    throw new Error("Invalid GitHub URL");
  }

  const [owner, repo] = urlParts;

  const headers = {
    Authorization: `token ${config.githubToken}`,
  };

  try {
    // 获取 Pull Request 数据
    const pullResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      { headers }
    );
    if (pullResponse.status === 403) {
      const retryAfter = pullResponse.headers.get("Retry-After");
      if (retryAfter) {
        console.warn(`Rate limit exceeded. Retry after ${retryAfter} seconds.`);
        // 你可以在这里实现重试逻辑
        return;
      }
    }
    const pullData: any[] = await pullResponse.json();

    // 获取仓库信息
    const repoResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    );
    const repoData = (await repoResponse.json()) as {
      owner: { login: string; avatar_url: string };
      forks_count: number;
      stargazers_count: number;
      watchers_count: number;
    };

    if (pullData.length > 0) {
      const pullRequest = pullData[0]; // 最新的 PR 数据
      return {
        owner,
        repo,
        title: pullRequest.title,
        prNumber: pullRequest.number,
        stage:
          pullRequest.labels.find((label: any) => label.name.includes("RFC"))
            ?.name || "N/A",
        description: pullRequest.body,
        prAuthor: pullRequest.user.login,
        avatarUrl: pullRequest.user.avatar_url,
        projectAuthor: repoData.owner.login,
        projectAvatarUrl: repoData.owner.avatar_url,
        forksCount: repoData.forks_count, // 新增：fork 数量
        stargazersCount: repoData.stargazers_count, // 新增：star 数量
        watchersCount: repoData.watchers_count, // 新增：watcher 数量
      };
    } else {
      // 如果没有 PR 信息，只显示仓库信息
      return {
        owner,
        repo,
        title: "No PRs available",
        prNumber: 0,
        stage: "N/A",
        description: "No pull requests found for this repository.",
        prAuthor: "",
        avatarUrl: "",
        projectAuthor: repoData.owner.login,
        projectAvatarUrl: repoData.owner.avatar_url,
        forksCount: repoData.forks_count, // 新增：fork 数量
        stargazersCount: repoData.stargazers_count, // 新增：star 数量
        watchersCount: repoData.watchers_count, // 新增：watcher 数量
      };
    }
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "An error occurred");
  }
});