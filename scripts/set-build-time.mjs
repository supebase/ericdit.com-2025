import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// 获取当前时间
const buildTime = new Date().toISOString();

// 将时间写入一个配置文件
const config = {
  buildTime,
};

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 写入文件
fs.writeFileSync(
  path.resolve(__dirname, "../build-time.json"),
  JSON.stringify(config, null, 2)
);

console.log(`构建时间已设置为：${buildTime}`);
