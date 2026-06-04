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
const CUSTOM_TAGS_FILE = path.join(ROOT, 'content', 'custom-tags.json')

const app = express()
app.use(express.json({ limit: '10mb' }))

function rd(id) {
  const fp = path.join(POSTS_DIR, `${id}.md`)
  if (!fs.existsSync(fp)) return null
  const { data, content } = matter.read(fp)
  return { id: data.id || id, title: data.title || '', date: data.date || '', category: data.category || '', excerpt: data.excerpt || '', content: content.trim(), image: data.image || '', tags: Array.isArray(data.tags) ? data.tags : [], readTime: data.readTime || '' }
}
function ls() { return fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md')).map(f => rd(f.replace('.md', ''))).filter(Boolean).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) }
function cats() { return [...new Set(ls().map(a => a.category).filter(Boolean))].sort() }

// Custom tags persistence
function loadCustomTags() { try { return JSON.parse(fs.readFileSync(CUSTOM_TAGS_FILE, 'utf-8')) } catch { return [] } }
function saveCustomTags(tags) { fs.writeFileSync(CUSTOM_TAGS_FILE, JSON.stringify(tags, null, 2), 'utf-8') }

function tgs() {
  const articleTags = new Set(ls().flatMap(a => a.tags || []))
  const custom = loadCustomTags()
  custom.forEach(t => articleTags.add(t))
  return [...articleTags].sort()
}

function gen() { try { execSync('npx tsx scripts/generate-articles.ts', { cwd: ROOT, stdio: 'pipe', timeout: 15000 }) } catch {} }

// ── Article APIs ──
app.get('/api/status', (_, res) => res.json({ ok: true, articles: ls().length }))
app.get('/api/articles', (_, res) => res.json(ls()))
app.get('/api/categories', (_, res) => res.json(cats()))
app.get('/api/tags', (_, res) => res.json(tgs()))

// Blog nav config (synced with actual blog routes)
app.get('/api/nav', (_, res) => res.json([
  { label: '首页', path: '/', category: null },
  { label: '生活碎碎念', path: '/life', category: '生活碎碎念' },
  { label: '实用主义&关联主义', path: '/pragmatism-connectivism', category: '实用主义研究' },
  { label: 'BRAND & AI', path: '/brand-ai', category: 'BRAND ALL IN AI' },
  { label: '精选文章', path: '/archives', category: null },
  { label: '晓宇友人账', path: '/friends', category: null },
  { label: '关于XIAOYU', path: '/about', category: null },
]))

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

// ── Custom Tags APIs ──
app.post('/api/tags', (req, res) => {
  const { name } = req.body || {}
  if (!name || !name.trim()) return res.status(400).json({ error: 'Tag name required' })
  const custom = loadCustomTags()
  if (custom.includes(name.trim())) return res.json({ ok: true, tags: tgs() })
  custom.push(name.trim())
  saveCustomTags(custom)
  res.json({ ok: true, tags: tgs() })
})

app.delete('/api/tags/:name', (req, res) => {
  const custom = loadCustomTags().filter(t => t !== req.params.name)
  // Check if tag is still used in articles
  const used = ls().some(a => (a.tags || []).includes(req.params.name))
  if (used) return res.status(400).json({ error: '该标签仍被文章使用，无法删除' })
  saveCustomTags(custom)
  res.json({ ok: true, tags: tgs() })
})

// ── Image APIs ──
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

// ── Sync ──
app.post('/api/sync', (req, res) => {
  const git = (cmd) => execSync(cmd, { cwd: GIT_DIR, encoding: 'utf-8', timeout: 30000 }).trim()
  const st = git('git status --porcelain')
  if (!st) return res.json({ ok: true, message: '没有变更' })
  git('git add -A'); git('git commit -m "文章管理更新"'); git('git push origin main --quiet')
  res.json({ ok: true, message: `已提交 ${st.split('\n').length} 个文件，后台编译部署中...` })
  try { execSync('npm run build', { cwd: ROOT, stdio: 'pipe', timeout: 120000 }); execSync('python deploy2.py', { cwd: GIT_DIR, stdio: 'pipe', timeout: 60000 }) } catch {}
})

// ── Admin UI ──
const ADMIN_HTML = path.join(__dirname, 'admin.html')
app.get('/', (_, res) => res.type('html').send(fs.readFileSync(ADMIN_HTML, 'utf-8')))
app.get('/admin', (_, res) => res.type('html').send(fs.readFileSync(ADMIN_HTML, 'utf-8')))
app.use('/images', express.static(path.join(ROOT, 'public', 'images')))

const PORT = 3001
const server = app.listen(PORT, '127.0.0.1', () => console.log(`落笔阁管理后台: http://localhost:${PORT}`))
server.on('error', (e) => { console.error('启动失败:', e.message); process.exit(1) })
