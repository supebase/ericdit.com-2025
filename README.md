# Nuxt 3，Directus Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

// 每次运行都会自动升级 patch 版本 (0.7.2 → 0.7.3 → 0.7.4)
// npm run build

// 升级 minor 版本 (0.7.2 → 0.8.0)
// VERSION_BUMP_TYPE=minor npm run build

// 升级 major 版本 (0.7.2 → 1.0.0)
// VERSION_BUMP_TYPE=major npm run build
```

推荐使用 Build 命令生成项目，服务器安装 sudo npm install pm2@latest -g，执行 PM2 start ecosystem.config.js 运行项目。

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
# ericdit.com
