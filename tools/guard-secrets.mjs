#!/usr/bin/env node
/**
 * 仓库密钥/隐私守卫 —— 提交前的强制闸门
 *
 * 三道检查，任何一道不过就中止提交：
 *   1. 路径黑名单  .env / 私钥 / 凭据 / 证书 等绝不该进版本库的文件
 *   2. 内容特征    已暂存内容里的密钥格式（API key / token / 私钥 / 密码）
 *   3. 体积闸门    超大文件（防止又塞进一张 6MB+ 的死图）
 *
 * 用法：
 *   node tools/guard-secrets.mjs              检查已暂存内容（pre-commit 用）
 *   node tools/guard-secrets.mjs --staged     同上，显式写法
 *   node tools/guard-secrets.mjs --history    扫描全部历史提交（CI 用）
 *   node tools/guard-secrets.mjs --all        扫描工作区全部受版本控制的文件
 *   node tools/guard-secrets.mjs --self-test  跑注入反例自测
 *
 * 退出码：0 = 通过；1 = 拦截；2 = 脚本自身出错。
 */

import { execFileSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import { join, basename } from 'node:path'

const MAX_FILE_MB = 5

// ── 本文件自身与白名单不参与内容扫描 ───────────────────────────────
// 原因：本文件里以字符串形式存放着全部密钥正则，若扫描自己必然自命中。
// （这正是「检查器匹配到自己写的注释/常量」那类假绿。）
const SELF = [
  'tools/guard-secrets.mjs',
  'tools/secret-allowlist.txt',
  '.githooks/pre-commit',
]

// ── 1. 路径黑名单 ─────────────────────────────────────────────────
const DENY_PATHS = [
  // 环境变量
  /(^|\/)\.env(\.[^/]*)?$/i,
  /(^|\/)\.envrc$/i,
  /(^|\/)[^/]*\.env$/i,
  /(^|\/)env\.(js|ts|json)$/i,
  // 私钥与证书
  /(^|\/)id_(rsa|dsa|ecdsa|ed25519)(\.pub)?$/i,
  /\.(pem|key|p12|pfx|jks|keystore|asc|gpg)$/i,
  /(^|\/)\.ssh\//i,
  /(^|\/)\.gnupg\//i,
  // 凭据文件
  /(^|\/)credentials(\.[^/]*)?\.json$/i,
  /(^|\/)\.netrc$/i,
  /(^|\/)auth\.json$/i,
  /(^|\/)service[-_]?account[^/]*\.json$/i,
  /(^|\/)\.npmrc$/i,
  /(^|\/)secrets?(\/|$)/i,
  /(^|\/)\.htpasswd$/i,
  // 本地配置与数据库
  /(^|\/)config\.local\./i,
  /(^|\/)settings\.local\./i,
  /\.(sqlite|sqlite3|db)$/i,
]

// ── 2. 内容特征 ───────────────────────────────────────────────────
// 每条：{ name, re, 必填的上下文窗口 } —— 用 lookbehind 式的伴随词缩小误报面。
const SECRET_CONTENT = [
  { name: '私钥块', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: 'OpenAI key', re: /\bsk-[A-Za-z0-9]{24,}/ },
  { name: 'Anthropic key', re: /\bsk-ant-[A-Za-z0-9\-_]{20,}/ },
  { name: 'GitHub token', re: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}/ },
  { name: 'GitHub fine-grained PAT', re: /\bgithub_pat_[A-Za-z0-9_]{20,}/ },
  { name: 'AWS access key id', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'Google API key', re: /\bAIza[0-9A-Za-z\-_]{35}/ },
  { name: 'Slack token', re: /\bxox[baprs]-[A-Za-z0-9-]{10,}/ },
  { name: 'Coze / 通用 pat', re: /\bpat_[A-Za-z0-9]{20,}/ },
  { name: 'npm token', re: /_authToken\s*=\s*[A-Za-z0-9+/=]{20,}/ },
  { name: 'JWT', re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
  {
    name: '硬编码密码',
    re: /\b(?:password|passwd|pwd|secret|api[_-]?key|apikey|access[_-]?token|auth[_-]?token)\b\s*[:=]\s*["'][^"'\s${}<>]{6,}["']/i,
  },
]

// ── 隐私：可选，按需维护 ───────────────────────────────────────────
// 默认关闭；把 .personal-deny.txt 放上真实标识（手机号/身份证/住址等）即自动生效。
const PERSONAL_FILE = '.personal-deny.txt'

// ── 工具函数 ───────────────────────────────────────────────────────
const git = (args, { allowFail = false } = {}) => {
  try {
    return execFileSync('git', args, {
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
    })
  } catch (e) {
    if (allowFail) return ''
    throw new Error(`git ${args.join(' ')} 执行失败: ${e.message}`)
  }
}

const inRepo = (p) => p.replace(/\\/g, '/').replace(/^\.\//, '')

const loadPersonalPatterns = () => {
  if (!existsSync(PERSONAL_FILE)) return []
  return readFileSync(PERSONAL_FILE, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => ({ name: `隐私标识(${l.slice(0, 12)})`, re: new RegExp(escapeRe(l), 'g') }))
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const loadAllowlist = () => {
  const f = 'tools/secret-allowlist.txt'
  if (!existsSync(f)) return new Set()
  return new Set(
    readFileSync(f, 'utf8')
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#')),
  )
}

const violations = []
const report = (kind, file, line, detail) =>
  violations.push({ kind, file, line: line ?? null, detail })

// ── 检查 1 + 3：路径与体积 ─────────────────────────────────────────
function checkPaths(files) {
  const allow = loadAllowlist()
  for (const f of files) {
    const p = inRepo(f)
    if (allow.has(p)) continue
    if (DENY_PATHS.some((re) => re.test(p))) {
      report('路径黑名单', p, null, '这类文件绝不应进入版本库')
    }
  }
}

// ── 检查 2：内容特征 ───────────────────────────────────────────────
function checkContent(files) {
  const allow = loadAllowlist()
  const personal = loadPersonalPatterns()
  const rules = [...SECRET_CONTENT, ...personal]

  for (const f of files) {
    const p = inRepo(f)
    if (allow.has(p) || SELF.some((s) => p === s || p.endsWith('/' + s))) continue
    // 锁文件必然含大量 hash，容易误报且无泄露风险
    if (/(package-lock\.json|pnpm-lock\.yaml|yarn\.lock)$/.test(p)) continue

    let buf
    try {
      buf = execFileSync('git', ['cat-file', 'blob', `:${p}`], {
        maxBuffer: 32 * 1024 * 1024,
      })
    } catch {
      continue
    }
    if (buf.length === 0) continue

    if (buf.length > MAX_FILE_MB * 1024 * 1024) {
      report('超大文件', p, null, `${(buf.length / 1024 / 1024).toFixed(1)} MB 超过 ${MAX_FILE_MB} MB 上限`)
      continue
    }
    // 二进制跳过
    if (buf.includes(0)) continue

    const text = buf.toString('utf8')
    const lines = text.split(/\r?\n/)
    for (const { name, re } of rules) {
      const rx = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')
      let m
      let hits = 0
      while ((m = rx.exec(text)) !== null && hits < 3) {
        const lineNo = text.slice(0, m.index).split(/\r?\n/).length
        const shown = (lines[lineNo - 1] || '').trim().slice(0, 100)
        report('内容特征', p, lineNo, `${name} → ${shown}`)
        hits++
        if (m.index === rx.lastIndex) rx.lastIndex++
      }
      if (hits >= 3) report('内容特征', p, null, `${name} 命中过多，已折叠`)
    }
  }
}

function reportAndExit(code) {
  if (violations.length === 0) {
    console.log('✅ 守卫通过：未发现密钥、凭据或超大文件。')
    process.exit(0)
  }
  console.error('\n🚫 提交被守卫拦截\n')
  for (const v of violations) {
    const loc = v.line ? `:${v.line}` : ''
    console.error(`  [${v.kind}] ${v.file}${loc}`)
    console.error(`      ${v.detail}`)
  }
  console.error('\n处理方式：')
  console.error('  · 确认是误报 → 在 tools/secret-allowlist.txt 写上该文件完整路径（每行一个）')
  console.error('  · 确认是真密钥 → 改用环境变量，并轮换该密钥')
  console.error('  · 误加的文件 → git rm --cached <路径> 并确认已被 .gitignore 覆盖')
  process.exit(code)
}

// ── 模式：已暂存内容 ───────────────────────────────────────────────
function modeStaged() {
  const files = git(['diff', '--cached', '--name-only', '--diff-filter=ACMR'], { allowFail: true })
    .split(/\r?\n/)
    .filter(Boolean)
  if (files.length === 0) {
    console.log('✅ 守卫通过：本次提交无新增/修改文件。')
    process.exit(0)
  }
  checkPaths(files)
  checkContent(files)
  reportAndExit(1)
}

// ── 模式：全部历史 ─────────────────────────────────────────────────
function modeHistory() {
  const revs = git(['rev-list', '--all'], { allowFail: true })
    .split(/\r?\n/)
    .filter(Boolean)
  if (revs.length === 0) {
    console.log('✅ 守卫通过：仓库暂无提交。')
    process.exit(0)
  }
  console.log(`扫描 ${revs.length} 个提交的完整历史…`)

  const seen = new Set()
  for (const rev of revs) {
    const files = git(['ls-tree', '-r', '--name-only', rev], { allowFail: true })
      .split(/\r?\n/)
      .filter(Boolean)
    const badPaths = files.filter((f) => DENY_PATHS.some((re) => re.test(f)))
    for (const f of badPaths) {
      const key = f
      if (seen.has(key)) continue
      seen.add(key)
      report('历史-路径黑名单', f, null, `出现在提交 ${rev.slice(0, 7)}`)
    }
  }
  if (violations.length > 0) {
    reportAndExit(1)
  }
  console.log('✅ 守卫通过：历史中未发现敏感路径。')
  process.exit(0)
}

// ── 模式：工作区全部受控文件 ───────────────────────────────────────
function modeAll() {
  const files = git(['ls-files'], { allowFail: true })
    .split(/\r?\n/)
    .filter(Boolean)
  checkPaths(files)
  // 逐个从工作区读（此处不在 index 里）
  const savedCat = checkContent
  const origExec = execFileSync
  void savedCat
  void origExec
  for (const f of files) {
    const p = inRepo(f)
    if (loadAllowlist().has(p) || SELF.some((s) => p === s)) continue
    const abs = join(process.cwd(), p)
    if (!existsSync(abs)) continue
    const buf = readFileSync(abs)
    if (buf.length > MAX_FILE_MB * 1024 * 1024) {
      report('超大文件', p, null, `${(buf.length / 1024 / 1024).toFixed(1)} MB 超过 ${MAX_FILE_MB} MB 上限`)
      continue
    }
    if (buf.includes(0)) continue
    const text = buf.toString('utf8')
    const rules = [...SECRET_CONTENT, ...loadPersonalPatterns()]
    for (const { name, re } of rules) {
      const rx = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')
      const m = rx.exec(text)
      if (m) {
        const lineNo = text.slice(0, m.index).split(/\r?\n/).length
        report('内容特征', p, lineNo, name)
      }
    }
  }
  reportAndExit(1)
}

// ── 模式：注入反例自测 ─────────────────────────────────────────────
// 只验证「检查器真的能抓到」，而不是跑一遍全绿就宣布安全。
function modeSelfTest() {
  const cases = [
    { name: '路径：根 .env', file: '.env', kind: '路径黑名单' },
    { name: '路径：app/.env.production', file: 'app/.env.production', kind: '路径黑名单' },
    { name: '路径：app/.npmrc', file: 'app/.npmrc', kind: '路径黑名单' },
    { name: '路径：id_rsa', file: 'deploy/id_rsa', kind: '路径黑名单' },
    { name: '路径：证书 keystore.jks', file: 'app/keystore.jks', kind: '路径黑名单' },
    { name: '路径：app/secrets/ 目录内', file: 'app/secrets/db.json', kind: '路径黑名单' },
    { name: '路径：credentials.json', file: 'app/credentials.json', kind: '路径黑名单' },
    {
      name: '内容：OpenAI key',
      file: 'app/src/config.ts',
      body: 'export const key = "sk-abcdefghijklmnopqrstuvwxyz012345"\n',
      kind: '内容特征',
    },
    {
      name: '内容：GitHub token',
      file: 'app/src/api.ts',
      body: 'const t = "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"\n',
      kind: '内容特征',
    },
    {
      name: '内容：AWS key',
      file: 'app/deploy.ts',
      body: 'const id = "AKIAIOSFODNN7EXAMPLE"\n',
      kind: '内容特征',
    },
    {
      name: '内容：私钥块',
      file: 'app/notes.md',
      body: '-----BEGIN RSA PRIVATE KEY-----\nMIIEow...\n-----END RSA PRIVATE KEY-----\n',
      kind: '内容特征',
    },
    {
      name: '内容：硬编码密码',
      file: 'app/src/db.ts',
      body: 'const password = "hunter2000"\n',
      kind: '内容特征',
    },
    {
      name: '内容：Coze pat',
      file: 'app/src/agent.ts',
      body: 'const token = "pat_AbCdEfGhIjKlMnOpQrStUvWx"\n',
      kind: '内容特征',
    },
  ]

  // 与 checkContent 共用同一份规则集，避免「自测走另一条代码路径」导致假绿。
  const rules = () => [...SECRET_CONTENT, ...loadPersonalPatterns()]

  let pass = 0
  const fail = []
  for (const c of cases) {
    violations.length = 0
    checkPaths([c.file])
    if (c.body) {
      for (const { name, re } of rules()) {
        const m = new RegExp(re.source, re.flags.replace('g', '')).exec(c.body)
        if (m) report('内容特征', c.file, 1, name)
      }
    }
    const caught = violations.some((v) => v.kind === c.kind)
    if (caught) {
      pass++
      console.log(`  ✅ 抓到：${c.name}`)
    } else {
      fail.push(c.name)
      console.log(`  ❌ 漏网：${c.name}`)
    }
  }

  // 反向断言：正常文件不得误报。
  // 必须走 checkContent 的真实排除逻辑（SELF 列表），否则本文件内以字符串形式
  // 存放的正则会自命中——那正是「检查器匹配到自己」那类假绿。
  violations.length = 0
  const selfSrc = readFileSync(new URL(import.meta.url), 'utf8')
  const clean = [
    { file: 'app/src/App.tsx', body: 'export default function App() { return <div className="p-4" /> }\n' },
    { file: 'app/src/config.ts', body: 'export const API_BASE = "https://example.com/api"\n' },
    { file: 'app/src/sections/Footer.tsx', body: 'placeholder="your@email.com"\n' },
    { file: 'tools/guard-secrets.mjs', body: selfSrc },
  ]
  for (const c of clean) {
    if (SELF.some((s) => c.file === s || c.file.endsWith('/' + s))) {
      console.log(`  ⏭  内容扫描豁免（生产路径同样排除）：${c.file}`)
      continue
    }
    for (const { name, re } of rules()) {
      const m = new RegExp(re.source, re.flags.replace('g', '')).exec(c.body)
      if (m) report('内容特征', c.file, 1, name)
    }
  }
  if (violations.length === 0) {
    pass++
    console.log('  ✅ 无误报：正常源码与占位符文案均未触发')
  } else {
    fail.push('反向断言：存在误报')
    console.log(`  ❌ 误报：${violations.map((v) => v.detail).join(', ')}`)
  }

  console.log(`\n自测结果：${pass}/${cases.length + 1} 通过`)
  if (fail.length > 0) {
    console.error(`失败项：\n  - ${fail.join('\n  - ')}`)
    process.exit(1)
  }
  console.log('✅ 守卫自测全部通过，检查器确认有效。')
  process.exit(0)
}

const mode = process.argv[2]
try {
  if (mode === '--self-test') modeSelfTest()
  else if (mode === '--history') modeHistory()
  else if (mode === '--all') modeAll()
  else modeStaged()
} catch (e) {
  console.error('❌ 守卫脚本自身出错：', e.message)
  process.exit(2)
}
