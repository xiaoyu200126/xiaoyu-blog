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
  }
})
