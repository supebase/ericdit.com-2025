import { createDirectusClient } from "~/utils/directusClient";

export const useDirectus = () => {
  const {
    public: { directusApiUrl },
  } = useRuntimeConfig();

  if (!directusApiUrl) {
    throw new Error("Directus API URL is not configured properly.");
  }

  const { baseClient, authClient, realtimeClient } =
    createDirectusClient(directusApiUrl);

  return {
    directus: baseClient, // 基础客户端
    authClient, // 带认证的客户端
    realtimeClient, // 带 WebSocket 的客户端
  };
};
