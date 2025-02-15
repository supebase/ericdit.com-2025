import { createDirectus, rest, authentication, realtime } from "@directus/sdk";

// 创建和配置 Directus 客户端
export const createDirectusClient = (apiUrl: string) => {
  const baseClient = createDirectus(apiUrl).with(
    rest({ credentials: "include" })
  );

  // 带认证的客户端（用于登录、注册等需要身份验证的请求）
  const authClient = baseClient.with(
    authentication("session", { credentials: "include", autoRefresh: true })
  );

  // 带 WebSocket 的客户端（用于实时订阅）
  const realtimeClient = baseClient.with(realtime());

  return { baseClient, authClient, realtimeClient };
};