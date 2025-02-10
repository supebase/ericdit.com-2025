import buildTime from "./build-time.json"; // 导入构建时间
import { VersionManager } from "./scripts/versionManager"; // 导入版本管理器

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: false },
  ssr: false,
  modules: ["@vueuse/nuxt", "@nuxt/ui", "@pinia/nuxt", "nuxt-emoji-picker"],

  experimental: {
    appManifest: false,
    payloadExtraction: true,
  },

  vite: {
    build: {
      minify: "terser",
    },
  },

  nitro: {
    compressPublicAssets: true,
  },

  runtimeConfig: {
    public: {
      directusApiUrl: process.env.DIRECTUS_API_URL,
      buildTime: buildTime.buildTime, // 注入构建时间
    },
    githubToken: process.env.GITHUB_TOKEN,
    deepseekApiKey: process.env.DEEPSEEK_API_KEY,
    deepseekApiUrl: process.env.DEEPSEEK_API_URL,
  },

  app: {
    keepalive: true,
    head: {
      viewport:
        "width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no,viewport-fit=cover",
      bodyAttrs: {
        class: "overflow-x-hidden",
      },
      link: [
        {
          rel: "preload",
          href: "/fonts/Janelotus.woff",
          as: "font",
          type: "font/woff",
          crossorigin: "anonymous",
        },
      ],
    },
    buildAssetsDir: "static",
  },

  hooks: {
    "build:before": () => {
      const isProduction = process.env.NODE_ENV === "production";
      const vm = new VersionManager(isProduction);

      // 生产环境处理版本升级
      if (isProduction) {
        const bumpType = process.env.VERSION_BUMP_TYPE as
          | "major"
          | "minor"
          | "patch"
          | undefined;

        vm.bumpVersion(bumpType || "patch");
      }

      vm.generateVersionFile();
    },
  },

  routeRules: {
    "/": { prerender: true },
  },

  router: {
    options: {
      scrollBehaviorType: "smooth",
    },
  },

  icon: {
    serverBundle: {
      collections: ["hugeicons", "streamline"],
    },
  },

  css: ["~/assets/css/app.css", "~/assets/css/main.css"],

  colorMode: {
    preference: "dark",
    classSuffix: "",
  },
});
