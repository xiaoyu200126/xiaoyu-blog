const express = require('express')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const matter = require('gray-matter')

const ROOT = path.resolve(__dirname, '..')
const POSTS_DIR = path.join(ROOT, 'content', 'posts')
const IMAGES_DIR = path.join(ROOT, 'public', 'images')
const GIT_DIR = path.resolve(ROOT, '..')

const app = express()
app.use(express.json({ limit: '10mb' }))
app.use(express.static(path.join(ROOT, 'public')))

function rd(id) {
  const fp = path.join(POSTS_DIR, `${id}.md`)
  if (!fs.existsSync(fp)) return null
  const { data, content } = matter.read(fp)
  return { id: data.id || id, title: data.title || '', date: data.date || '', category: data.category || '', excerpt: data.excerpt || '', content: content.trim(), image: data.image || '', tags: Array.isArray(data.tags) ? data.tags : [], readTime: data.readTime || '' }
}
function ls() { return fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md')).map(f => rd(f.replace('.md', ''))).filter(Boolean).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) }
function tgs() { return [...new Set(ls().flatMap(a => a.tags || []))].sort() }
function gen() { try { execSync('npx tsx scripts/generate-articles.ts', { cwd: ROOT, stdio: 'pipe', timeout: 15000 }) } catch {} }

app.get('/api/status', (_, res) => res.json({ ok: true, articles: ls().length }))
app.get('/api/articles', (_, res) => res.json(ls()))
app.get('/api/tags', (_, res) => res.json(tgs()))
app.get('/api/articles/:id', (req, res) => { const a = rd(req.params.id); a ? res.json(a) : res.status(404).json({ error: 'Not found' }) })

app.put('/api/articles/:id', (req, res) => {
  const { id: nid, title, date, category, excerpt, content, image, tags: t, readTime } = req.body || {}
  const sid = nid || req.params.id
  const fm = matter.stringify(content || '', { id: sid, title: title || '', date: date || '', tags: t || [], readTime: readTime || '', image: image || '', category: category || '', excerpt: excerpt || '' })
  fs.writeFileSync(path.join(POSTS_DIR, `${sid}.md`), fm, 'utf-8')
  if (sid !== req.params.id) { const old = path.join(POSTS_DIR, `${req.params.id}.md`); if (fs.existsSync(old)) fs.unlinkSync(old) }
  gen(); res.json({ ok: true, id: sid })
})

app.delete('/api/articles/:id', (req, res) => {
  const fp = path.join(POSTS_DIR, `${req.params.id}.md`)
  if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' })
  fs.unlinkSync(fp); gen(); res.json({ ok: true })
})

const upload = multer({ dest: IMAGES_DIR })
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' })
  const ext = path.extname(req.file.originalname) || '.jpg'
  const base = path.basename(req.file.originalname, ext) || `upload_${Date.now()}`
  let fn = base + ext, c = 1
  while (fs.existsSync(path.join(IMAGES_DIR, fn))) fn = `${base}_${++c}${ext}`
  fs.renameSync(req.file.path, path.join(IMAGES_DIR, fn))
  res.json({ url: `/images/${fn}`, filename: fn })
})

app.get('/api/images', (_, res) => {
  const files = fs.readdirSync(IMAGES_DIR).filter(f => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f))
  res.json(files.map(f => ({ filename: f, url: `/images/${f}` })))
})

app.delete('/api/images/:filename', (req, res) => {
  const fp = path.join(IMAGES_DIR, req.params.filename)
  if (fs.existsSync(fp)) { fs.unlinkSync(fp); return res.json({ ok: true }) }
  res.status(404).json({ error: 'Not found' })
})

app.post('/api/sync', (req, res) => {
  const git = (cmd) => execSync(cmd, { cwd: GIT_DIR, encoding: 'utf-8', timeout: 30000 }).trim()
  const st = git('git status --porcelain')
  if (!st) return res.json({ ok: true, message: '没有变更' })
  git('git add -A'); git('git commit -m "文章管理更新"'); git('git push origin main --quiet')
  res.json({ ok: true, message: `已提交 ${st.split('\n').length} 个文件，后台编译部署中...` })
  try { execSync('npm run build', { cwd: ROOT, stdio: 'pipe', timeout: 120000 }); execSync('python deploy2.py', { cwd: GIT_DIR, stdio: 'pipe', timeout: 60000 }) } catch {}
})

app.get('/', (_, res) => res.sendFile(path.join(__dirname, 'admin.html')))
app.get('/admin', (_, res) => res.sendFile(path.join(__dirname, 'admin.html')))

const PORT = 4001
app.listen(PORT, () => console.log(`落笔阁管理后台: http://localhost:${PORT}`))
