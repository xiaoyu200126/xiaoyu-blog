import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

export default defineConfig(({ command }) => {
  // inspectAttr 是开发期元素检查工具，会往 DOM 上挂 code-path 调试属性，
  // 它不该出现在生产构建里，所以只在 serve(dev) 时启用。
  //
  // 类型桥接说明：kimi-plugin-inspect-react 自带一份嵌套的 vite 类型声明，
  // 其 Plugin 与本项目 vite 的 Plugin 结构上不兼容（两处 vite 版本不同），
  // 直接放进 plugins 数组会报 TS2345。此处只做结构等价的前提下的显式收敛。
  const devOnly: Plugin[] =
    command === 'serve' ? [inspectAttr() as unknown as Plugin] : []

  return {
    base: '/',
    plugins: [...devOnly, react()],
    server: {
      port: 3000,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          // 页面被拆成懒加载块后，各页面块要 import 入口块里的 react / gsap
          // 等共享绑定，形成「入口 ⇄ 页面块」的循环分块引用。这种结构下，
          // 懒加载的 promise 可能永不 settle —— 页面永久停在 Suspense 骨架屏，
          // 且 console 没有任何报错，chunk 文件也全部 200。
          // 把共享依赖显式拆成独立分块，让入口与页面都单向依赖 vendor，
          // 从结构上消除这个环。
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-motion': ['gsap', 'flickity', 'aos'],
          },
        },
      },
    },
  }
})
