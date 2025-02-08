interface GitHubProjectInfo {
  owner: string;
  repo: string;
  title: string;
  prNumber: number;
  stage: string;
  description: string;
  prAuthor: string; // PR 的作者
  avatarUrl: string; // PR 作者的头像
  projectAuthor: string; // 仓库的作者
  projectAvatarUrl: string; // 仓库作者的头像
  forksCount: number; // 新增：fork 数量
  stargazersCount: number; // 新增：star 数量
  watchersCount: number; // 新增：watcher 数量
}

const projectCache = new Map<string, GitHubProjectInfo>();

export function useGitHubCard(githubUrl: string) {
  const isLoaded = ref(false);
  const projectInfo = ref<GitHubProjectInfo | null>(null);
  const error = ref<string | null>(null);

  const fetchProjectInfo = async () => {
    if (projectCache.has(githubUrl)) {
      projectInfo.value = projectCache.get(githubUrl) || null;
      isLoaded.value = true;
      return;
    }

    try {
      isLoaded.value = false;

      const data = await $fetch("/api/github", {
        method: "POST",
        body: { githubUrl },
      });

      projectInfo.value = data as GitHubProjectInfo;
      projectCache.set(githubUrl, data as GitHubProjectInfo);
      isLoaded.value = true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "An error occurred";
    }
  };

  return {
    isLoaded,
    projectInfo,
    error,
    fetchProjectInfo,
  };
}
