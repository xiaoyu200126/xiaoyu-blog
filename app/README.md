# XIAOYU的随笔

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
├─ public/              静态资源（图片、CNAME）
├─ scripts/
│  ├─ generate-articles.ts   把 content/posts/*.md 编译成 src/data/articles.ts
│  └─ spa-fallback.mjs       构建后把 index.html 复制成 404.html
├─ src/
│  ├─ pages/            9 个路由页面
│  ├─ sections/         首页区块（HeroSection / LoopSection / Footer）
│  ├─ components/       Header / MobileMenu / MagneticCursor / RouteErrorBoundary
│  └─ data/articles.ts  ⚠️ 自动生成，禁止手改
└─ dist/                构建产物（不入库）
```

> `src/components/ui/` 与 `src/lib/utils.ts` 已在死代码清理中整目录删除。
> 当前没有引入 shadcn 组件，Tailwind 直接写在页面里。需要新组件时，
> 确认真的会被用到再加进来 —— CI 会用 `tools/find-dead-code.mjs --check` 拦截。

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
| `/article/:id` | 文章详情 | 懒加载（独立 207 kB 块） |
| `/life` | 生活碎碎念 | 懒加载 |
| `/pragmatism-connectivism` | 实用主义&关联主义 | 懒加载 |
| `/brand-ai` | BRAND & AI | 懒加载 |
| `/friends` | 晓宇友人帐 | 懒加载 |
| `*` | 404 | 懒加载 |

**深链接必须能直接打开。** GitHub Pages 是纯静态托管，只按真实文件路径查找，
所以所有客户端路由都依赖 `dist/404.html` 作为回退。构建后的 `postbuild`
会自动把 `index.html` 复制成 `404.html`；CI 也会校验该文件存在。

> ⚠️ `vite.config.ts` 里的 `build.modulePreload: false` **不能删**。
> 开启 Vite 的 modulepreload 预加载包装，会让懒加载的 promise 永不 settle：
> 所有非首页路由卡死在骨架屏，chunk 请求却是 200，且不产生任何报错。
> 完整根因与排查过程见 [tech-spec.md](../tech-spec.md) 的构建产物章节。

---

## 部署

`main` 分支的 `.github/workflows/deploy.yml`：**push 到 main 即自动部署**，
同时保留 `workflow_dispatch` 以便手动重跑。

部署时会把 `app/dist` 发布到 GitHub Pages，CNAME 固定为 `xiaoyu-blog.cn`。

> 注：线上实际由 GitHub Pages 承载（响应头 `Server: GitHub.com`）。
> 本仓库不含 Netlify 配置，线上也没有 Netlify 在服务。

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
node tools/find-dead-code.mjs --check      # 死代码 / 无引用依赖（有则 exit 1）
```

首次克隆后需激活 pre-commit 钩子：

```bash
git config core.hooksPath .githooks
```

`tools/find-dead-code.mjs` 从 `src/main.tsx` 出发做 import 可达性分析，
用 TypeScript 编译器 API 解析语法树（不是正则，避免把注释和字符串里的路径算进去）。
**新增文件或依赖后请跑一次**，避免无用代码悄悄堆积。

---

## 技术说明

依赖清单、动画方案与取舍记录见根目录 [tech-spec.md](../tech-spec.md)。
