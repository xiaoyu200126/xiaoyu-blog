/**
 * 模块图可达性校验（不依赖浏览器）
 *
 * 递归跟随产物里的 import，从 index.html 出发，检查每个被引用的文件
 * 是否真的能取到。用于判断「页面卡在骨架屏」是产物/服务问题还是浏览器问题。
 *
 * 用法：node scripts/verify-module-graph.mjs <baseUrl> [入口路径]
 */
const base = process.argv[2] || 'http://localhost:4197'
const entry = process.argv[3] || '/index.html'

const seen = new Set()
const problems = []

async function walk(url, chain) {
  if (seen.has(url)) return
  seen.add(url)

  let res
  try {
    res = await fetch(url)
  } catch (e) {
    problems.push(`✗ 不可达 ${url}  ← ${chain.at(-1) ?? '入口'}\n    ${e.message}`)
    return
  }
  if (!res.ok) {
    problems.push(`✗ HTTP ${res.status} ${url}  ← ${chain.at(-1) ?? '入口'}`)
    return
  }

  const ct = res.headers.get('content-type') || ''
  const isJs = /\.m?js($|\?)/.test(url) || ct.includes('javascript')
  const isHtml = ct.includes('html') || /\.html($|\?)/.test(url)

  // 非 JS/HTML 也要把 body 读掉，否则 socket 不会被释放，
  // 进程退出时 Node 在 Windows 上会触发 libuv 断言崩溃。
  if (!isJs && !isHtml) {
    await res.arrayBuffer()
    return
  }

  const text = await res.text()

  if (isHtml) {
    // HTML 里的入口引用
    for (const m of text.matchAll(/<(?:script|link)[^>]*\s(?:src|href)=["']([^"']+\.(?:m?js|css))["']/g)) {
      await walk(new URL(m[1], url).href, [...chain, url])
    }
    return
  }

  // 静态 import 与动态 import
  const specs = new Set()
  for (const m of text.matchAll(/(?:^|[;\n])import\s*(?:[^'"]*?from\s*)?["']([^"']+)["']/g)) specs.add(m[1])
  for (const m of text.matchAll(/import\(\s*["']([^"']+)["']\s*\)/g)) specs.add(m[1])

  for (const spec of specs) {
    if (!spec.startsWith('.') && !spec.startsWith('/')) continue
    const abs = new URL(spec, url).href
    await walk(abs, [...chain, url])
  }
}

await walk(new URL(entry, base).href, [])

console.log(`从 ${entry} 出发，共校验 ${seen.size} 个文件`)
if (problems.length === 0) {
  console.log('✅ 模块图完整：所有被 import 的文件均可加载')
  // 显式退出：Windows 上 Node 在有未关闭 handle 时会在 teardown 阶段崩溃，
  // 那会让 exit code 变成 -1073740791，掩盖真实的校验结论。
  process.exit(0)
}
console.log(`\n❌ 发现 ${problems.length} 个问题：`)
for (const p of problems.slice(0, 20)) console.log('  ' + p)
process.exit(1)
