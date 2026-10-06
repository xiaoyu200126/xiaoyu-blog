# 落笔阁（XIAOYU 的随笔）

个人博客站点。Vite + React 19 + TypeScript + Tailwind CSS v3，纯静态部署到 GitHub Pages / 自定义域名。

线上地址：<https://xiaoyu-blog.cn>

---

## 快速开始

```bash
cd app
npm install
npm run dev        # 开发服务器 http://localhost:3000
```

> 本仓库统一使用 **npm**（提交的是 `package-lock.json`，CI 也用 `npm`）。
> 不要再引入 pnpm 锁文件，历史上两者混用过会导致安装结果不一致。

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发服务器，端口 3000 |
| `npm run build` | 生成文章数据 → `tsc -b` 类型检查 → 打包到 `dist/` |
| `npm run preview` | 本地预览 `dist/` 产物 |
| `npm run generate` | 只跑一遍文章数据生成 |
| `npm run lint` | ESLint |

---

## 目录结构

```
app/
├─ content/
│  ├─ posts/*.md        文章源文件（frontmatter + 正文）
│  ├─ about.md          关于页文案
│  └─ friends.json      友链数据
├─ public/              静态资源（图片、404 页、CNAME）
├─ scripts/
│  └─ generate-articles.ts   把 content/posts/*.md 编译成 src/data/articles.ts
├─ src/
│  ├─ pages/            9 个路由页面
│  ├─ sections/         首页区块（HeroSection / LoopSection / Footer）
│  ├─ components/       Header / MobileMenu / MagneticCursor / RouteErrorBoundary
│  │  └─ ui/            shadcn 风格基础组件
│  ├─ data/articles.ts  ⚠️ 自动生成，禁止手改
│  └─ App.tsx           路由表
└─ dist/                构建产物（不入库）
```

---

## 写文章

在 `app/content/posts/` 新建 `.md`，frontmatter 必填字段：

```yaml
---
id: my-post-slug          # 路由用：/article/my-post-slug
title: 文章标题
date: 2026-01-01
tags: [标签一, 标签二]
category: 栏目名
excerpt: 列表页显示的摘要
readTime: 8 min read
image: /images/cover.jpg  # 封面图，放 public/images/ 下
featured: true            # 可选，是否进精选
---
```

保存后 `npm run build` 会自动重新生成 `src/data/articles.ts`。
该文件**故意不写生成时间戳** —— 同样的文章源必然产出完全一致的结果，构建不会弄脏工作区。

---

## 路由

| 路径 | 页面 | 加载方式 |
|------|------|----------|
| `/` | 首页 | 同步（首屏不等网络往返） |
| `/about` | 关于 | 懒加载 |
| `/archives` | 精选文章 | 懒加载 |
| `/article/:id` | 文章详情 | 懒加载（单独打包 ~207 kB） |
| `/life` | 生活碎碎念 | 懒加载 |
| `/pragmatism-connectivism` | 实用主义&关联主义 | 懒加载 |
| `/brand-ai` | BRAND & AI | 懒加载 |
| `/friends` | 晓宇友人帐 | 懒加载 |
| `*` | 404 | 懒加载 |

除首页外全部走 `React.lazy`，由 `RouteErrorBoundary` 兜底 —— 重新部署后旧
chunk 变成 404 时，页面会给出「重新加载」按钮而不是永久卡在骨架屏。

---

## 部署

`main` 分支的 `.github/workflows/deploy.yml` **手动触发**（`workflow_dispatch`）。
自动部署已关闭，实际发布由本地脚本 + Netlify 负责。

部署时会把 `app/dist` 发布到 GitHub Pages，CNAME 固定为 `xiaoyu-blog.cn`。

---

## 本地管理后台（不入库）

`app/admin-server/` 是仅在本机运行的文章管理服务，**已被 `.gitignore` 排除**，
所以新克隆的仓库里没有它。根目录的 `启动管理后台.bat` 是本地快捷方式，
在没有该目录时双击会报错，属预期行为。

---

## 密钥与隐私保护

仓库配置了三层防线，详见根目录 [SECURITY.md](../SECURITY.md)。

```bash
node tools/guard-secrets.mjs --self-test   # 验证检查器本身有效
node tools/guard-secrets.mjs --history     # 扫描全部历史提交
node tools/guard-secrets.mjs --all         # 扫描工作区全部受控文件
```

首次克隆后需激活 pre-commit 钩子：

```bash
git config core.hooksPath .githooks
```

---

## 技术说明

依赖清单、动画方案与取舍记录见根目录 [tech-spec.md](../tech-spec.md)。
