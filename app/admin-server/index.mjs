import express from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const POSTS_DIR = path.join(ROOT, 'content', 'posts')
const IMAGES_DIR = path.join(ROOT, 'public', 'images')
const GIT_DIR = path.resolve(ROOT, '..')

const app = express()
app.use(express.json({ limit: '10mb' }))

// --- IMAGE UPLOAD ---
const upload = multer({ dest: IMAGES_DIR })
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' })
  const ext = path.extname(req.file.originalname) || '.jpg'
  const filename = req.file.originalname || `upload_${Date.now()}${ext}`
  const target = path.join(IMAGES_DIR, filename)
  fs.renameSync(req.file.path, target)
  res.json({ url: `/images/${filename}`, filename })
})

// --- LIST IMAGES ---
app.get('/api/images', (_req, res) => {
  const files = fs.readdirSync(IMAGES_DIR).filter(f => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f))
  res.json(files.map(f => ({ filename: f, url: `/images/${f}` })))
})

// --- DELETE IMAGE ---
app.delete('/api/images/:filename', (req, res) => {
  const fp = path.join(IMAGES_DIR, req.params.filename)
  if (fs.existsSync(fp)) {
    fs.unlinkSync(fp)
    res.json({ ok: true })
  } else {
    res.status(404).json({ error: 'Not found' })
  }
})

// --- LIST ARTICLES ---
app.get('/api/articles', (_req, res) => {
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'))
  const articles = files.map(f => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, f), 'utf-8')
    const fmEnd = raw.indexOf('---', 4)
    if (fmEnd === -1) return null
    const frontmatter = raw.slice(4, fmEnd).trim()
    const body = raw.slice(fmEnd + 3).trim()
    const meta = {}
    frontmatter.split('\n').forEach(line => {
      const m = line.match(/^(\w+):\s*(.*)/)
      if (m) meta[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
    })
    return {
      id: meta.id || f.replace('.md', ''),
      title: meta.title || '',
      date: meta.date || '',
      category: meta.category || '',
      excerpt: meta.excerpt || '',
      content: body,
      image: meta.image || '',
      tags: meta.tags ? meta.tags.replace(/^\[|\]$/g, '').split(',').map(t => t.trim().replace(/^["']|["']$/g, '')) : [],
      readTime: meta.readTime || '',
    }
  }).filter(Boolean)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  res.json(articles)
})

// --- GET SINGLE ARTICLE ---
app.get('/api/articles/:id', (req, res) => {
  const fp = path.join(POSTS_DIR, `${req.params.id}.md`)
  if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' })
  const raw = fs.readFileSync(fp, 'utf-8')
  const fmEnd = raw.indexOf('---', 4)
  const frontmatter = raw.slice(4, fmEnd).trim()
  const body = raw.slice(fmEnd + 3).trim()
  const meta = {}
  frontmatter.split('\n').forEach(line => {
    const m = line.match(/^(\w+):\s*(.*)/)
    if (m) meta[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
  })
  res.json({
    id: meta.id || req.params.id,
    title: meta.title || '',
    date: meta.date || '',
    category: meta.category || '',
    excerpt: meta.excerpt || '',
    content: body,
    image: meta.image || '',
    tags: meta.tags ? meta.tags.replace(/^\[|\]$/g, '').split(',').map(t => t.trim().replace(/^["']|["']$/g, '')) : [],
    readTime: meta.readTime || '',
  })
})

// --- SAVE ARTICLE ---
app.put('/api/articles/:id', (req, res) => {
  const { title, date, category, excerpt, content, image, tags, readTime } = req.body
  const tagsStr = tags?.length ? `\n  - ${tags.join('\n  - ')}` : ''
  const fm = [
    '---',
    `id: ${req.params.id}`,
    `title: "${(title || '').replace(/"/g, '\\"')}"`,
    `date: ${date || ''}`,
    `tags:${tagsStr}`,
    `readTime: ${readTime || ''}`,
    `image: ${image || ''}`,
    `category: ${category || ''}`,
    `excerpt: "${(excerpt || '').replace(/"/g, '\\"')}"`,
    '---',
  ].join('\n')
  
  const fp = path.join(POSTS_DIR, `${req.params.id}.md`)
  fs.writeFileSync(fp, fm + '\n\n' + (content || ''), 'utf-8')
  
  // Auto-generate articles.ts
  try {
    execSync('npx tsx scripts/generate-articles.ts', { cwd: ROOT, stdio: 'pipe', timeout: 15000 })
    console.log('articles.ts regenerated')
  } catch (e) {
    console.error('Failed to regenerate articles.ts:', e.message)
  }
  
  res.json({ ok: true })
})

// --- DELETE ARTICLE ---
app.delete('/api/articles/:id', (req, res) => {
  const fp = path.join(POSTS_DIR, `${req.params.id}.md`)
  if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' })
  fs.unlinkSync(fp)
  
  try {
    execSync('npx tsx scripts/generate-articles.ts', { cwd: ROOT, stdio: 'pipe', timeout: 15000 })
  } catch (e) {}
  
  res.json({ ok: true })
})

// --- GIT SYNC ---
app.post('/api/sync', (req, res) => {
  try {
    const git = (cmd) => execSync(cmd, { cwd: GIT_DIR, encoding: 'utf-8', timeout: 20000 }).trim()
    
    const status = git('git status --porcelain')
    if (!status) return res.json({ ok: true, message: '没有变更' })
    
    git('git add -A')
    git(`git commit -m "admin: 文章管理更新"`)
    git('git push origin main --quiet')
    
    // Build & deploy gh-pages
    try {
      execSync('npm run build', { cwd: ROOT, stdio: 'pipe', timeout: 120000 })
      execSync('python deploy2.py', { cwd: GIT_DIR, stdio: 'pipe', timeout: 60000 })
    } catch (e) {
      console.error('Deploy failed:', e.message)
    }
    
    res.json({ ok: true, message: `同步完成：${status.split('\n').length} 个文件变更` })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Static files in dev
app.use(express.static(path.join(ROOT, 'public')))

const PORT = 4001
app.listen(PORT, () => {
  console.log(`Admin server: http://localhost:${PORT}`)
})
