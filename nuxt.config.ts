import { createResolver } from "@nuxt/kit";
import buildTime from "./build-time.json"; // 导入构建时间
import { VersionManager } from "./scripts/versionManager"; // 导入版本管理器

const { resolve } = createResolver(import.meta.url);

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  ssr: false,
  modules: [
    "@vueuse/nuxt",
    "@nuxt/ui",
    "@pinia/nuxt",
    "nuxt-emoji-picker",
    "@nuxtjs/i18n",
  ],

  experimental: {
    appManifest: false,
    payloadExtraction: true,
  },

  vue: {
    propsDestructure: true,
  },

  vite: {
    build: {
      minify: "terser",
      target: "esnext",
      cssCodeSplit: true, // 按页面分割 CSS
      sourcemap: process.env.NODE_ENV === "development", // 仅开发模式启用 source maps
    },
  },

  nitro: {
    compressPublicAssets: true,
    esbuild: {
      options: {
        target: "esnext",
      },
    },
    prerender: {
      crawlLinks: true,
    },
    publicAssets: [
      {
        dir: resolve("./public/fonts"),
        maxAge: 24 * 60 * 60 * 365, // 1 year (versioned)
        baseURL: "/fonts",
      },
    ],
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
    provider: "server",
    serverBundle: {
      collections: ["ri", "hugeicons", "streamline"],
    },
  },

  css: ["~/assets/css/app.css", "~/assets/css/main.css"],

  colorMode: {
    preference: "dark",
    classSuffix: "",
  },

  i18n: {
    vueI18n: "./i18n.config.ts",
    locales: ["cn", "en"],
    defaultLocale: "cn",

    customRoutes: "config",
    pages: {
      index: false,
      id: false,
    },

    lazy: true,
  },
});
