import express from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import matter from 'gray-matter'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const POSTS_DIR = path.join(ROOT, 'content', 'posts')
const IMAGES_DIR = path.join(ROOT, 'public', 'images')
const GIT_DIR = path.resolve(ROOT, '..')

const app = express()
app.use(express.json({ limit: '10mb' }))

// ── Shared: read frontmatter + body from .md using gray-matter ──
function readArticleFile(id) {
  const fp = path.join(POSTS_DIR, `${id}.md`)
  if (!fs.existsSync(fp)) return null
  const { data, content } = matter.read(fp)
  return {
    id: data.id || id,
    title: data.title || '',
    date: data.date || '',
    category: data.category || '',
    excerpt: data.excerpt || '',
    content: content.trim(),
    image: data.image || '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    readTime: data.readTime || '',
  }
}

// ── Shared: list all articles ──
function listArticles() {
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'))
  return files
    .map(f => readArticleFile(f.replace('.md', '')))
    .filter(Boolean)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// ── Shared: collect all unique tags ──
function collectTags() {
  const tags = new Set()
  listArticles().forEach(a => a.tags?.forEach(t => tags.add(t)))
  return [...tags].sort()
}

// ── Shared: rebuild articles.ts ──
function regenerateArticles() {
  try {
    execSync('npx tsx scripts/generate-articles.ts', { cwd: ROOT, stdio: 'pipe', timeout: 15000 })
  } catch (e) {
    console.error('generate-articles failed:', e.message)
  }
}

// ── API: list articles + tags ──
app.get('/api/articles', (_req, res) => {
  res.json(listArticles())
})

app.get('/api/tags', (_req, res) => {
  res.json(collectTags())
})

// ── API: single article ──
app.get('/api/articles/:id', (req, res) => {
  const a = readArticleFile(req.params.id)
  if (!a) return res.status(404).json({ error: 'Not found' })
  res.json(a)
})

// ── API: save article ──
app.put('/api/articles/:id', (req, res) => {
  const { id: newId, title, date, category, excerpt, content, image, tags, readTime } = req.body
  const saveId = newId || req.params.id
  const oldFp = path.join(POSTS_DIR, `${req.params.id}.md`)
  const newFp = path.join(POSTS_DIR, `${saveId}.md`)

  const fm = matter.stringify(content || '', {
    id: saveId,
    title: title || '',
    date: date || '',
    tags: tags || [],
    readTime: readTime || '',
    image: image || '',
    category: category || '',
    excerpt: excerpt || '',
  })

  fs.writeFileSync(newFp, fm, 'utf-8')
  if (saveId !== req.params.id && fs.existsSync(oldFp)) fs.unlinkSync(oldFp)

  regenerateArticles()
  res.json({ ok: true, id: saveId })
})

// ── API: delete article ──
app.delete('/api/articles/:id', (req, res) => {
  const fp = path.join(POSTS_DIR, `${req.params.id}.md`)
  if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' })
  fs.unlinkSync(fp)
  regenerateArticles()
  res.json({ ok: true })
})

// ── API: upload image ──
const upload = multer({ dest: IMAGES_DIR })
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' })
  const ext = path.extname(req.file.originalname) || '.jpg'
  const base = path.basename(req.file.originalname, ext) || `upload_${Date.now()}`
  let filename = base + ext
  let counter = 1
  while (fs.existsSync(path.join(IMAGES_DIR, filename))) {
    filename = `${base}_${counter}${ext}`
    counter++
  }
  fs.renameSync(req.file.path, path.join(IMAGES_DIR, filename))
  res.json({ url: `/images/${filename}`, filename })
})

// ── API: list images ──
app.get('/api/images', (_req, res) => {
  const files = fs.readdirSync(IMAGES_DIR).filter(f => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f))
  res.json(files.map(f => ({ filename: f, url: `/images/${f}` })))
})

// ── API: delete image ──
app.delete('/api/images/:filename', (req, res) => {
  const fp = path.join(IMAGES_DIR, req.params.filename)
  if (fs.existsSync(fp)) { fs.unlinkSync(fp); return res.json({ ok: true }) }
  res.status(404).json({ error: 'Not found' })
})

// ── API: git sync (build + deploy) ──
app.post('/api/sync', async (req, res) => {
  try {
    const git = (cmd) => execSync(cmd, { cwd: GIT_DIR, encoding: 'utf-8', timeout: 30000 }).trim()

    const status = git('git status --porcelain')
    if (!status) return res.json({ ok: true, message: '没有变更' })

    git('git add -A')
    git('git commit -m "文章管理更新"')
    git('git push origin main --quiet')

    // Build + deploy in background, respond immediately
    res.json({ ok: true, message: `已提交 ${status.split('\n').length} 个文件，编译部署中...` })

    try {
      execSync('npm run build', { cwd: ROOT, stdio: 'pipe', timeout: 120000 })
      execSync('python deploy2.py', { cwd: GIT_DIR, stdio: 'pipe', timeout: 60000 })
      console.log('Deploy done')
    } catch (e) {
      console.error('Deploy error:', e.message)
    }
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── Static files in dev ──
app.use(express.static(path.join(ROOT, 'public')))

const PORT = 4001
app.listen(PORT, () => console.log(`Admin server: http://localhost:${PORT}`))
