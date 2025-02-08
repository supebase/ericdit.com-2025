import {
  createDirectus,
  rest,
  realtime,
  authentication,
  registerUser,
  readMe,
  readItem,
  readItems,
  createItem,
  deleteItem,
  readFile,
  uploadFiles,
  deleteFile,
  updateUser,
} from "@directus/sdk";

export default defineNuxtPlugin(() => {
  const { public: { directusApiUrl } } = useRuntimeConfig();

  // 基础客户端（用于普通请求）
  const baseClient = createDirectus(directusApiUrl).with(
    rest({ credentials: "include" })
  );

  // 带认证的客户端（用于登录、注册等需要身份验证的请求）
  const authClient = baseClient.with(
    authentication("session", { credentials: "include", autoRefresh: true })
  );

  // 带 WebSocket 的客户端（用于实时订阅）
  const realtimeClient = baseClient.with(realtime());

  return {
    provide: {
      directus: baseClient, // 基础客户端
      authClient, // 带认证的客户端
      realtimeClient, // 带 WebSocket 的客户端

      registerUser,
      readMe,
      readItem,
      readItems,
      createItem,
      deleteItem,
      readFile,
      uploadFiles,
      deleteFile,
      updateUser,
    },
  };
});
