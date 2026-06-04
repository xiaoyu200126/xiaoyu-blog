# 博客后台管理工具 v1.0

> XIAOYU 博客 (xiaoyu-blog.cn) 可视化管理后台
> 本地运行，数据同步至 GitHub，自动部署到 GitHub Pages

---

## 启动

```bash
cd app
npm run admin
```

打开 **http://localhost:3001**

---

## 功能清单

| 模块 | 功能 |
|------|------|
| 📋 文章管理 | 增删改查、栏目筛选、标签筛选、搜索 |
| ✏️ 编辑器 | Markdown 编辑 + 工具栏（H1-H3/粗体/斜体/链接/图片/引用/列表/代码块） |
| 📥 MD上传 | 上传 `.md` 文件自动识别 frontmatter 填入表单 |
| 👁 预览 | 实时预览，样式完全对齐 xiaoyu-blog.cn 文章页 |
| ⭐ 精选文章 | 设为精选 → Archives 页顶部优先展示 |
| 🎠 轮播推荐 | 推荐上轮播 → 首页 Hero 轮播（最多3篇） |
| 🏠 首页管理 | 查看轮播/精选/最新文章状态 |
| 🖼 图片管理 | 上传/复制路径/删除 |
| 🤝 友链管理 | 增删改好友信息（名称/头衔/描述/链接） |
| ✒️ 关于页面 | Markdown 编辑关于页内容 |
| 🚀 同步部署 | 一键 push → build → deploy gh-pages |

---

## 栏目逻辑

| 栏目名 | 分类值 | 博客页面 |
|--------|--------|---------|
| 生活碎碎念 | `生活碎碎念` | `/life` |
| 实用主义&关联主义 | `实用主义研究` 或 `关联主义学习` | `/pragmatism-connectivism` |
| BRAND & AI | `BRAND ALL IN AI` | `/brand-ai` |

---

## 字段说明

| 字段 | 说明 |
|------|------|
| ID | 文章文件名（不含.md），决定URL: `/article/{id}` |
| 标题 | 文章标题 |
| 日期 | 发布日期 |
| 阅读时长 | 自动计算（中文~400字/分钟），可手动修改 |
| 栏目 | 决定文章出现在哪个分类页 |
| 封面图 | `/images/xxx.jpg`，上传后在图片管理中复制路径 |
| 标签 | 文章标签，可自定义 |
| 摘要 | 首页卡片展示的文字 |
| ★ 精选 | 在 Archives 精选页顶部优先展示 |
| 🎠 轮播 | 推荐上首页轮播（最多3篇同时生效） |

---

## 技术架构

```
app/
├── admin-server/
│   ├── index.cjs          # Express 后端 (API + Sync)
│   ├── admin.html         # 管理后台 UI (单文件)
│   └── admin-backup.html  # UI 备份 (v1.0 定稿)
├── content/
│   ├── posts/             # 文章 Markdown (frontmatter)
│   ├── friends.json       # 友链数据
│   ├── about.md           # 关于页内容
│   └── custom-tags.json   # 自定义标签
├── public/images/         # 图片资源
└── src/                   # 博客前端 (React + Vite)
```

---

## 同步流程

```
点击"同步到仓库"
  → ① git push main (文章/友链/关于数据)
  → ② npm run build (编译博客)
  → ③ git push gh-pages (部署到 xiaoyu-blog.cn)
  → ✅ 1-2分钟后网站更新
```

---

## 注意事项

- 管理后台代码 (`admin-server/`) 不推送 GitHub，仅本地运行
- 同步走本地代理 `127.0.0.1:7890`
- `Ctrl+S` 快速保存
- 离开编辑页前会提示未保存
