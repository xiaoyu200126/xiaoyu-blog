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

- **`tailwindcss-animate` 已移除。** 它是 Tailwind v3 插件，为 dialog / sheet /
  tooltip 提供 `animate-in` / `fade-in-0` / `zoom-in-95` 等类。历史上该包曾从
  package.json 被删掉却留下配置引用，导致全新克隆无法构建（`[vite:css] Cannot
  find module`）；补回后这三个组件又在死代码清理中被删除，于是插件连同
  `tailwind.config.js` 里的 `plugins` 一起移除。**最终解法是删除，而非加依赖。**
- **`tw-animate-css` 已移除。** 它是 Tailwind v4 的替代方案，v3 配置下用不上。
- **recharts / cmdk / vaul / sonner / embla / react-day-picker 等已移除。**
  它们只被那批死组件 import，连同对应文件一起清掉了。
- **`clsx` / `tailwind-merge` 已移除。** 唯一的消费者是 `lib/utils.ts`，
  而 `utils.ts` 随 `ui/` 目录一起成为死代码。
- **`tailwindcss` 仍是 v3（3.4）**，走 `tailwind.config.js` + PostCSS。

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

| 产物 | 体积 | 加载时机 |
|------|------|----------|
| `index-*.js`（入口） | 231 kB | 首屏 |
| `vendor-react-*.js` | 47 kB | 首屏 |
| `vendor-motion-*.js` | 126 kB | 首屏（gsap/flickity/aos） |
| `ArticlePage-*.js` | 207 kB | 仅 `/article/:id` |
| 其余 6 个页面 chunk | 1.4–3.6 kB | 按需 |
| `index-*.css` | 37 kB | 首屏 |

首页同步导入，其余 8 个页面走 `React.lazy`。首屏 JS 从 455 kB 降到 231 kB。
`ArticlePage` 单独成块是因为它独占 `react-markdown` + `remark-gfm`。

`vendor-*` 通过 `build.rollupOptions.output.manualChunks` 拆出，作用是
**缓存稳定性**：只改文章内容时这三个分块的哈希不变，用户不会重新下载。

### ⚠️ `build.modulePreload: false` 是必需项，别删

Vite 默认会在真正 `import()` 之前先插入 `<link rel="modulepreload">`，并在入口
注入一段 `relList.supports("modulepreload")` 的 polyfill（产物里叫 `__vitePreload`）。
**在本项目里这条路径会让懒加载的 promise 永远不 settle**：

- chunk 已请求成功（HTTP 200），组件却始终不挂载
- 不产生任何 rejection，所以 ErrorBoundary 也不触发
- 页面永久停在 Suspense 骨架屏，console 零报错
- 与页面复杂度无关：连 0.22 kB 的最简懒加载组件也一样复现

最初误判为「`React.lazy` 机制不可用」而回退成同步导入。真正的判据是
**网络面板里那条 200 的 chunk 请求** —— 它证明请求已成功，问题在 resolve 之后的
链路；顺着产物里 `ie.lazy(()=>vb(()=>import(...)))` 读下去才定位到预加载包装器。
关掉它后裸 `import()` 立即正常工作。

若未来升级 Vite，务必重新验证这一项：先建一个最简懒加载路由，在**生产构建**下
确认它能渲染，再看其余路由。


### 依赖清理的收益

删掉 53 个死文件后，CSS 从 108 kB 降到 37 kB（**-66%**）。原因是 Tailwind
只按源码里真实出现过的类名生成 CSS，那 53 个组件文件里写的大量类名
（以及 shadcn 主题里的 sidebar 变量）随之消失。

JS 体积基本没变 —— 那些组件本来就被 tree-shaking 排除在产物之外，
它们影响的是 `npm install` 耗时（本次共移除 184 个包），不是线上流量。

---

## 已知技术债

### 1. 三套动画引擎未收敛

GSAP / Flickity / AOS 各自管理生命周期，无统一清理。路由来回切换会累积
动画实例。这是后续可考虑收敛成单一 GSAP 的主要动机。

### 2. `启动管理后台.bat` 对新克隆者不可用

`app/admin-server/` 已 gitignore，仓库里没有该目录，脚本会给出明确提示。

### 3. 三个依赖无法验证

`express` / `multer` / `concurrently` 只被本地管理后台（已 gitignore）使用，
仓库内无法验证是否还需要，暂予保留。

### 4. `app/src/data/articles.ts` 仍在版本控制中

它是生成物，理论上可以加进 `.gitignore`；但保留它能让不装 Node 的人
直接看到文章数据，故暂时保留。


