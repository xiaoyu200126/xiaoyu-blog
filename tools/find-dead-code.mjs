#!/usr/bin/env node
/**
 * 死代码分析器：从 app/src/main.tsx 沿 import 做可达性分析，
 * 列出走不到的文件，并核对 package.json 里没被 import 过的依赖。
 *
 * 用 TypeScript 编译器 API 而非正则：正则会把注释掉的代码、字符串里的路径
 * 一并算进去，结论不可复现。
 *
 * 用法：node tools/find-dead-code.mjs [--check]（--check 有死代码则 exit 1）
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, resolve, dirname, relative, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '..')
const appDir = join(repoRoot, 'app')
const srcDir = join(appDir, 'src')
const ENTRY = join(srcDir, 'main.tsx')

// 用项目自带的 typescript 解析，保证拿到的是真语法树
const require_ = createRequire(join(appDir, 'package.json'))
const ts = require_('typescript')

const EXTS = ['.ts', '.tsx', '.js', '.jsx']

// ── 收集 src/ 下所有源文件 ──────────────────────────────────────────
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (EXTS.includes(extname(name))) out.push(p)
  }
  return out
}

const allFiles = walk(srcDir)
const rel = (p) => relative(repoRoot, p).replace(/\\/g, '/')

// ── 解析一个文件里所有的 import specifier ───────────────────────────
function importsOf(file) {
  const src = readFileSync(file, 'utf8')
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const specs = []
  const add = (node) => {
    const s = node.text
    if (s) specs.push(s)
  }
  for (const st of sf.statements) {
    // import x from 'y' / import 'y'
    if (ts.isImportDeclaration(st)) add(st.moduleSpecifier)
    // export * from 'y' / export { a } from 'y'
    else if (ts.isExportDeclaration(st) && st.moduleSpecifier) add(st.moduleSpecifier)
  }
  // 动态 import('y')
  const visit = (node) => {
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      specs.push(node.arguments[0].text)
    }
    ts.forEachChild(node, visit)
  }
  ts.forEachChild(sf, visit)
  return specs
}

// ── 解析路径 ───────────────────────────────────────────────────────
function resolveLocal(spec, fromFile) {
  // Vite 的 ?raw / ?url 等查询后缀要剥掉，否则 content/about.md?raw 解析不到
  const clean = spec.replace(/\?.*$/, '')
  let base
  if (clean.startsWith('@/')) base = join(srcDir, clean.slice(2))
  else if (clean.startsWith('.')) base = resolve(dirname(fromFile), clean)
  else return null // 裸包名

  const candidates = [
    base,
    ...EXTS.map((e) => base + e),
    ...EXTS.map((e) => join(base, 'index' + e)),
  ]
  for (const c of candidates) {
    if (existsSync(c) && statSync(c).isFile()) return c
  }
  return null
}

// ── 可达性遍历 ─────────────────────────────────────────────────────
const reachable = new Set()
const externals = new Set()
const unresolved = []

const stack = [ENTRY]
while (stack.length) {
  const file = stack.pop()
  if (reachable.has(file)) continue
  reachable.add(file)

  for (const spec of importsOf(file)) {
    const local = resolveLocal(spec, file)
    if (local) {
      if (!reachable.has(local)) stack.push(local)
    } else if (spec.startsWith('.') || spec.startsWith('@/')) {
      unresolved.push(`${rel(file)} → ${spec}`)
    } else {
      // 裸包名：取第一段（含 @scope/ 的取两段）
      const m = spec.match(/^(@[^/]+\/[^/]+|[^/]+)/)
      if (m) externals.add(m[1])
    }
  }
}

// ── 报告 ───────────────────────────────────────────────────────────
const dead = allFiles.filter((f) => !reachable.has(f)).sort()

console.log('='.repeat(64))
console.log('死代码分析')
console.log('='.repeat(64))
console.log(`入口      : ${rel(ENTRY)}`)
console.log(`源文件总数: ${allFiles.length}`)
console.log(`可达文件  : ${reachable.size}`)
console.log(`死代码    : ${dead.length}`)
console.log('')

if (dead.length) {
  console.log('【从入口不可达的文件】')
  const groups = new Map()
  for (const f of dead) {
    const dir = dirname(rel(f))
    if (!groups.has(dir)) groups.set(dir, [])
    groups.get(dir).push(basename_(f))
  }
  for (const [dir, files] of [...groups.entries()].sort()) {
    console.log(`  ${dir}/  (${files.length})`)
    console.log(`    ${files.join(', ')}`)
  }
  console.log('')
}

// ── 依赖核对 ───────────────────────────────────────────────────────
// 关键：依赖不只被 src/ 引用。vite / typescript / tailwindcss 在配置里，
// gray-matter 在 scripts/ 里，eslint 插件在 eslint.config.js 里。
// 只扫 src/ 会把这些统统误报成「无引用」，照着删项目直接崩。
const CONTEXT_GLOBS = [
  'vite.config.ts',
  'postcss.config.js',
  'tailwind.config.js',
  'eslint.config.js',
  'components.json',
]

const contextFiles = []
for (const relPath of CONTEXT_GLOBS) {
  const p = join(appDir, relPath)
  if (existsSync(p)) contextFiles.push(p)
}
contextFiles.push(...walk(join(appDir, 'scripts')))

for (const f of contextFiles) {
  for (const spec of importsOf(f)) {
    const m = spec.match(/^(@[^/]+\/[^/]+|[^/]+)/)
    if (m) externals.add(m[1])
  }
}

// @types/* 是类型声明包，本来就不会被 import，按前缀归类而不是当死依赖
const isTypes = (d) => d.startsWith('@types/')

// 本地 admin-server（已 gitignore）用到的依赖，无法从仓库内验证
const ADMIN_ONLY = new Set(['express', 'multer', 'concurrently'])

// import 分析天然看不见的三类引用，必须人工确认后登记在此：
//   1. 对象字面量里的插件名   postcss.config.js → plugins: { tailwindcss: {}, autoprefixer: {} }
//   2. CommonJS require()     tailwind.config.js → require('tailwindcss-animate')
//   3. npm script 里的可执行文件 package.json   → "tsc -b"、"npx tsx"
// 新增这类依赖时，把它加进来，否则本工具会误报。
const NON_IMPORT_REFS = new Set([
  'tailwindcss',
  'autoprefixer',
  'postcss',
  'tailwindcss-animate',
  'typescript',
  'tsx',
  // scripts/optimize-images.mjs 用的是 createRequire(...)(...) 拿 sharp，
  // 不是静态 import，本工具的 import 分析看不到它。
  'sharp',
])

const pkg = JSON.parse(readFileSync(join(appDir, 'package.json'), 'utf8'))
const declared = {
  ...(pkg.dependencies || {}),
  ...(pkg.devDependencies || {}),
}
const unusedDeps = Object.keys(declared)
  .filter((d) => !externals.has(d) && !isTypes(d) && !NON_IMPORT_REFS.has(d))
  .sort()
const adminOnly = unusedDeps.filter((d) => ADMIN_ONLY.has(d))
const reallyUnused = unusedDeps.filter((d) => !ADMIN_ONLY.has(d))

console.log('【无引用的依赖】')
console.log('  （已排除 @types/* 与配置文件/脚本中引用的包）')
if (reallyUnused.length === 0) {
  console.log('  （无）')
} else {
  for (const d of reallyUnused) {
    const kind = pkg.dependencies?.[d] ? 'dep ' : 'dev '
    console.log(`  ${kind} ${d}@${declared[d]}`)
  }
}
if (adminOnly.length) {
  console.log('')
  console.log('【仅本地 admin-server 可能使用（该目录已 gitignore，删前请确认）】')
  for (const d of adminOnly) console.log(`  dep  ${d}@${declared[d]}`)
}
console.log('')

if (unresolved.length) {
  console.log('【⚠️ 解析失败的 import（请人工确认）】')
  for (const u of [...new Set(unresolved)]) console.log(`  ${u}`)
  console.log('')
}

function basename_(p) {
  return p.replace(/\\/g, '/').split('/').pop()
}

const fail = process.argv.includes('--check') && (dead.length > 0 || reallyUnused.length > 0)
if (fail) {
  console.error('❌ 存在死代码或无引用依赖（--check 模式）')
  process.exit(1)
}
console.log('ℹ️  以上为报告，未改动任何文件。加 --check 可让 CI 对此失败。')
