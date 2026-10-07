/**
 * SPA 深链接回退：把 dist/index.html 复制成 dist/404.html。
 *
 * GitHub Pages 只按真实文件路径查找，客户端路由在服务器上不存在对应文件。
 * 唯一钩子是 404.html —— 未命中的路径会返回它，浏览器拿到 SPA 骨架后
 * 由 React Router 根据 location 渲染。
 *
 * 必须构建后复制：产物文件名带哈希，静态手写无从预知。
 *
 * 注意：404 响应带 404 状态码，浏览器能渲染但 SEO 不认。
 * 需要 200 状态的栏目/文章页由 prerender-og.ts 预生成为真实目录。
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
