# 落笔阁 — Technical Specification

> 本文件描述的是**当前仓库的真实状态**。若你发现某处与代码不符，以代码为准并顺手修正本文件。

## 技术栈

| 领域 | 选型 | 版本 | 说明 |
|------|------|------|------|
| 框架 | React | 19.2 | 根渲染，启用 StrictMode |
| 路由 | react-router-dom | 7.14 | BrowserRouter，9 条路由 |
| 构建 | Vite | 7.2 | `@` 别名指向 `app/src` |
| 语言 | TypeScript | 5.9 | `strict` + `noUnusedLocals` |
| 样式 | Tailwind CSS | **3.4** | 注意是 v3，走 `tailwind.config.js` + PostCSS |
| 组件 | shadcn 风格 + Radix | — | 53 个 `components/ui/` 文件，**实际只用到 10 个** |
| 包管理 | npm | 11 | 只提交 `package-lock.json` |

### 依赖取舍记录

- **`tailwindcss-animate`（v3 插件）是必需的。** `dialog` / `sheet` / `tooltip` 三个
  在用的组件依赖它提供的 `animate-in`、`fade-in-0`、`zoom-in-95`、`slide-in-from-*`。
  历史上该包被从 `package.json` 删掉却没删配置引用，导致全新克隆无法构建。
- **`tw-animate-css` 目前未被使用。** 它是 Tailwind v4 的替代方案，v3 配置下用不上，
  属于预留。若将来迁到 v4，应连同 `tailwind.config.js`、`postcss.config.js` 一起重构。
- **recharts / cmdk / vaul / sonner / embla / react-day-picker 不进包体。** 它们只被
  `components/ui/` 里那 43 个未引用的组件 import，已被 tree-shaking 完全排除
  （产物中 0 命中）。它们只影响 `npm install` 耗时，不影响线上流量。

## 动画

三套引擎并存，各自负责不同场景：

| 引擎 | 使用位置 | 用途 |
|------|----------|------|
| GSAP | MobileMenu、About/Archives/Article/BrandAI/Friends/Life/Pragmatism 页 | 滚动入场、时间轴 |
| Flickity | HeroSection | 首页满屏轮播 |
| AOS | HomePage | LoopSection 的滚动显现 |

**维护提示**：三套引擎的生命周期各自独立（无统一清理），新增页面时注意在
`useEffect` 的清理函数里 `kill()`，否则路由来回切换会累积动画实例。
这是后续可考虑收敛成单一 GSAP 的主要动机。

## 构建产物

代码分割后（首页同步、其余 8 页懒加载）：

| 产物 | 体积 | gzip | 加载时机 |
|------|------|------|----------|
| `index-*.js`（入口） | 431 kB | 148 kB | 首屏 |
| `ArticlePage-*.js` | 207 kB | 69 kB | 仅 `/article/:id` |
| 其余 7 个页面 chunk | 1.4–3.6 kB | <2 kB | 按需 |
| `index-*.css` | 108 kB | 17 kB | 首屏 |

分割前入口为单块 654 kB（gzip 212 kB），分割后首屏 gzip 降至 148 kB（**-30%**），
并消除了 Vite 的 500 kB 超限告警。

`ArticlePage` 体积占比高是因为它独占 `react-markdown` + `remark-gfm`，
这也是它最值得单独切分的原因。

## 内容管线

```
content/posts/*.md
      │  scripts/generate-articles.ts（prebuild 自动触发）
      ▼
src/data/articles.ts
      │  静态 import
      ▼
src/data/articles.ts → 页面
```

生成过程是**确定性**的：不写入时间戳，同样的文章源产出逐字节一致的文件。
这是刻意的设计 —— 否则每次 `npm run build` 都会弄脏工作区，让真实的代码变更
淹没在无意义的时间戳 diff 里。

必填 frontmatter 字段：`id` / `title` / `date` / `tags` / `image` / `category` /
`excerpt` / `readTime`，缺任一项构建即失败并指明是哪个文件。

## 已知技术债

1. **`components/ui/` 有 43 个死组件。** 只用到 button、dialog、input、label、
   separator、sheet、skeleton、textarea、toggle、tooltip 十个。删掉可让
   `npm install` 明显变快，但不改变包体（已被 tree-shaking 排除）。
2. **三套动画引擎未收敛**（见上）。
3. **`启动管理后台.bat` 对新克隆者不可用**，因为 `app/admin-server/` 已 gitignore。
4. **`app/src/data/articles.ts` 仍在版本控制中。** 它是生成物，理论上可以加进
   `.gitignore`；但保留它能让不装 Node 的人直接看到文章数据，故暂时保留。
