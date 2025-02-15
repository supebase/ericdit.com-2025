import { useDirectus } from "~/composables/useDirectus";
import {
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
  const { directus, authClient, realtimeClient } = useDirectus();

  return {
    provide: {
      directus, // 基础客户端
      authClient, // 带认证的客户端
      realtimeClient, // 带 WebSocket 的客户端

      // 用户相关 API
      user: {
        registerUser,
        updateUser,
        readMe,
      },

      // 内容管理 API
      content: {
        readItem,
        readItems,
        createItem,
        deleteItem,
      },

      // 文件管理 API
      file: {
        readFile,
        uploadFiles,
        deleteFile,
      },
    },
  };
});
