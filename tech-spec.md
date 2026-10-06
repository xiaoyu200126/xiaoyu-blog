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

| 产物 | 体积 | 说明 |
|------|------|------|
| `index-*.js` | 455 kB | 应用代码与页面 |
| `vendor-motion-*.js` | 126 kB | gsap + flickity + aos |
| `vendor-react-*.js` | 47 kB | react + react-dom + react-router |
| `index-*.css` | 37 kB | 由实际用到的类名生成 |

`vendor-*` 通过 `build.rollupOptions.output.manualChunks` 拆出，作用是
**缓存稳定性**：只改文章内容时这三个分块的哈希不变，用户不会重新下载。

### 依赖清理的收益

删掉 53 个死文件后，CSS 从 108 kB 降到 37 kB（**-66%**）。原因是 Tailwind
只按源码里真实出现过的类名生成 CSS，那 53 个组件文件里写的大量类名
（以及 shadcn 主题里的 sidebar 变量）随之消失。

JS 体积基本没变 —— 那些组件本来就被 tree-shaking 排除在产物之外，
它们影响的是 `npm install` 耗时（本次共移除 184 个包），不是线上流量。

---

## 已知技术债

### 1. 路由代码分割曾尝试并回退（重要）

用 `React.lazy` + `Suspense` 对 8 个非首页页面做代码分割，产物正确
（首屏 gzip 212 kB → 148 kB，各页面独立分块），**但运行时所有非首页路由
永久停在 Suspense 骨架屏**，页面组件从不挂载。

已排除的因素（每一项都做过对照实验）：

- chunk 文件存在、HTTP 200、MIME 正确，构建产物 8 个 `import()` 目标全部匹配
- 直接 `import('./pages/ArchivesPage')` 能 resolve，且带 `default` 导出
- `React.lazy` + `Suspense` 本身可用（用一个最简懒加载组件验证通过）
- 懒加载组件内引入 `gsap` 正常（v3.15.0）
- 懒加载组件内使用 `useSearchParams` / `Link` 正常
- 与 `StrictMode`、`RouteErrorBoundary`、`Suspense` 嵌套位置无关
- 换成 `manualChunks` 拆分 vendor 后仍复现
- 清空 `dist` 与 `node_modules/.vite` 后全新构建、全新端口、全新标签页仍复现
- 同步导入同一组件时渲染完全正常

特征始终是：**console 零报错、ErrorBoundary 不触发（说明 promise 是 pending
而非 reject）、DOM 里只有 fallback 标记**。

因 `/archives` 与 `/article/:id` 是最常被分享和被收录的地址，让它们随时可能
打不开的风险远高于首屏少几十 KB，故保持同步导入。
若日后要重试，请先在真实浏览器（非内置预览面板）里验证深链接再上线。

### 2. 三套动画引擎未收敛

GSAP / Flickity / AOS 各自管理生命周期，无统一清理。路由来回切换会累积
动画实例。这是后续可考虑收敛成单一 GSAP 的主要动机。

### 3. `启动管理后台.bat` 对新克隆者不可用

`app/admin-server/` 已 gitignore，仓库里没有该目录，脚本会给出明确提示。

### 4. 三个依赖无法验证

`express` / `multer` / `concurrently` 只被本地管理后台（已 gitignore）使用，
仓库内无法验证是否还需要，暂予保留。

### 5. `app/src/data/articles.ts` 仍在版本控制中

它是生成物，理论上可以加进 `.gitignore`；但保留它能让不装 Node 的人
直接看到文章数据，故暂时保留。

