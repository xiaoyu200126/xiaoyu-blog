/**
 * SPA 深链接回退
 *
 * GitHub Pages 是纯静态托管：它只按真实文件路径查找，客户端路由
 * （/archives、/article/xxx、/videos…）在服务器上并不存在对应文件，
 * 于是直接返回 GitHub 自己的 404 页面 —— 站内跳转正常，外部点进来全断。
 *
 * 平台提供的唯一钩子是 404.html：任何未命中的路径都会返回它。
 * 所以在构建产物里，把 index.html 复制一份成 404.html，
 * 让浏览器拿到 SPA 骨架后由 React Router 根据 location 渲染对应页面。
 *
 * 注意：不能手写一份静态的 public/404.html，因为构建后的资源文件名带
 * 哈希（如 /assets/index-XXXX.js），静态文件无从预知。必须在构建后复制。
 */
import { copyFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

const dist = resolve(process.cwd(), 'dist')
const src = join(dist, 'index.html')
const dst = join(dist, '404.html')

if (!existsSync(src)) {
  console.error('❌ 未找到 dist/index.html，构建是否成功？')
  process.exit(1)
}

copyFileSync(src, dst)
console.log('✅ 已生成 dist/404.html（SPA 深链接回退已启用）')
