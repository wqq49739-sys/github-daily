# GitHub 每日早报 ☕

每天自动抓取 GitHub 上「最近 7 天涨粉最快的新项目」，生成一个小白也能看懂的网页。

- 🌐 **在线网址**：https://wqq49739-sys.github.io/github-daily/
- 🔄 **自动更新**：每天北京时间早上 8:00 由 GitHub Actions 在云端自动刷新（无需开电脑）
- ⭐ **收藏功能**：点卡片右上角星星，收藏存在你自己的浏览器里

## 文件说明

| 文件 | 作用 |
|---|---|
| `generate.mjs` | 抓取数据并生成 `index.html` 的脚本 |
| `index.html` | 自动生成的网页（不用手改） |
| `.github/workflows/daily.yml` | 云端定时器：每天自动跑 + 发布网站 |

由 Craft Agent 搭建。
