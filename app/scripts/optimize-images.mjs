/**
 * 图片压缩：public/images 下的位图统一重编码。
 *
 * 为什么需要：仓库里 6 张图原本合计 692 KB，其中 polaroid-1/2 各 184/187 KB，
 * 而它们在页面上只是小尺寸展示。JPEG 重新编码到 q78 + mozjpeg + progressive，
 * 肉眼几乎无差别，体积能降一半以上。
 *
 * 用法：npm run images
 * 注意：脚本会原地覆盖 public/images 下的文件。
 *
 * ⚠️ 不要用系统自带的 `convert` —— Windows 的 C:\Windows\System32\convert.exe
 * 是 FAT→NTFS 文件系统转换器，不是 ImageMagick，用它处理图片后果严重。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const sharp = require('sharp')

const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/images')
const QUALITY = 78
const MIN_BYTES = 4 * 1024 // 小于 4KB 的不再折腾

const files = fs.readdirSync(DIR).filter((f) => /\.(jpe?g|png)$/i.test(f))
if (files.length === 0) {
  console.log('没有找到图片')
  process.exit(0)
}

let before = 0
let after = 0
const rows = []

for (const f of files) {
  const p = path.join(DIR, f)
  const orig = fs.statSync(p).size
  const meta = await sharp(p).metadata()
  const buf = await sharp(p)
    .rotate() // 依据 EXIF 摆正
    .jpeg({ quality: QUALITY, mozjpeg: true, progressive: true })
    .toBuffer()

  const saved = orig - buf.length
  before += orig
  after += buf.length
  rows.push({
    f,
    dim: `${meta.width}×${meta.height}`,
    orig,
    next: buf.length,
    pct: orig > 0 ? ((saved / orig) * 100).toFixed(0) : '0',
  })

  // 写入走「临时文件 + 原子替换」，不要直接原地覆盖：
  // 直接 writeFileSync 会在写失败时把原图截断，且无法回退。
  if (buf.length < orig) {
    const tmp = p + '.tmp'
    fs.writeFileSync(tmp, buf)
    fs.renameSync(tmp, p)
  } else {
    rows.at(-1).next = orig
  }
}

const pad = (s, n) => String(s).padStart(n)
console.log('文件'.padEnd(34) + pad('原', 8) + pad('尺寸', 12) + pad('现', 8) + pad('节省', 7))
console.log('-'.repeat(70))
for (const r of rows) {
  console.log(
    r.f.padEnd(34) +
      pad(`${Math.round(r.orig / 1024)}KB`, 8) +
      pad(r.dim, 12) +
      pad(`${Math.round(r.next / 1024)}KB`, 8) +
      pad(`${r.pct}%`, 7),
  )
}
console.log('-'.repeat(70))
console.log(
  '合计'.padEnd(34) +
    pad(`${Math.round(before / 1024)}KB`, 8) +
    ' '.repeat(12) +
    pad(`${Math.round(after / 1024)}KB`, 8) +
    pad(`${(((before - after) / before) * 100).toFixed(0)}%`, 7),
)
process.exit(0)
