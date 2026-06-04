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
const FRIENDS_FILE = path.join(ROOT, 'content', 'friends.json')
const ABOUT_FILE = path.join(ROOT, 'content', 'about.md')
const DEPLOY_SCRIPT = path.join(GIT_DIR, 'deploy2.py')

const app = express()
app.use(express.json({ limit: '10mb' }))

// ── utils ──
function fmtDate(d) {
  if (!d) return ''
  try { const dt = new Date(d); if (!isNaN(dt.getTime())) return dt.toISOString().slice(0, 10) } catch {}
  return String(d).slice(0, 10)
}
function rd(id) {
  const fp = path.join(POSTS_DIR, `${id}.md`)
  if (!fs.existsSync(fp)) return null
  const { data, content } = matter.read(fp)
  return { id: data.id || id, title: data.title || '', date: fmtDate(data.date), category: data.category || '', excerpt: data.excerpt || '', content: content.trim(), image: data.image || '', tags: Array.isArray(data.tags) ? data.tags : [], readTime: data.readTime || '', featured: !!data.featured, carousel: !!data.carousel }
}
function rtime(c) { return Math.max(1, Math.ceil((c||'').length / 400)) + ' min read' }
function ls() { return fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md')).map(f => rd(f.replace('.md', ''))).filter(Boolean).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) }
function cats() { return [...new Set(ls().map(a => a.category).filter(Boolean))].sort() }
function loadCustomTags() { try { return JSON.parse(fs.readFileSync(CUSTOM_TAGS_FILE, 'utf-8')) } catch { return [] } }
function saveCustomTags(t) { fs.writeFileSync(CUSTOM_TAGS_FILE, JSON.stringify(t, null, 2), 'utf-8') }
function tgs() { const a = new Set(ls().flatMap(x => x.tags || [])); loadCustomTags().forEach(x => a.add(x)); return [...a].sort() }
function gen() { try { execSync('npx tsx scripts/generate-articles.ts', { cwd: ROOT, stdio: 'pipe', timeout: 15000 }) } catch {} }

// ── Friends persistence ──
function loadFriends() {
  try { return JSON.parse(fs.readFileSync(FRIENDS_FILE, 'utf-8')) }
  catch {
    const def = [
      { id: 1, name: '陈默', title: '独立摄影师', description: '用镜头记录城市边缘的诗意，擅长黑白胶片摄影。', url: '', avatar: '' },
      { id: 2, name: '林小雨', title: '文字工作者 / 译者', description: '翻译过多本日文小说，正在写自己的第一本散文集。', url: '', avatar: '' },
      { id: 3, name: '阿北', title: '全栈开发者', description: '开源社区活跃贡献者，相信技术应该服务于人文。', url: '', avatar: '' },
      { id: 4, name: '苏苏', title: '插画师', description: '用水彩和数字画笔描绘梦境与现实交织的世界。', url: '', avatar: '' },
      { id: 5, name: '老周', title: '咖啡馆主理人', description: '经营一家开了八年的独立咖啡馆，也是地下乐队的鼓手。', url: '', avatar: '' },
      { id: 6, name: '阿雅', title: '旅行博主', description: '走过四十个国家，用文字和影像记录路上的故事。', url: '', avatar: '' },
    ]
    fs.writeFileSync(FRIENDS_FILE, JSON.stringify(def, null, 2), 'utf-8')
    return def
  }
}
function saveFriends(f) { fs.writeFileSync(FRIENDS_FILE, JSON.stringify(f, null, 2), 'utf-8') }

// ── About persistence ──
function loadAbout() {
  try { return fs.readFileSync(ABOUT_FILE, 'utf-8').trim() }
  catch {
    const def = `## 缘起

"摩西在诗篇90篇里面说：我们经过的日子都在你的震怒之下，我们渡尽的年岁好像是一生叹息。"

## 生活是一场湮灭的花火

生活本身或许也没有啥子意义，不信你看：爱情会远去，身体会衰老，激情会消失。

## 绽放的我们于是有了意义

所以生命本身没有意义，有意义的是活着的我们，我们的喜怒哀乐，我们对生活的感知才有意义。

## 尾

"XIAOYU的随笔"记录着发生过的事、遇见过的人、去过的地方。`
    fs.writeFileSync(ABOUT_FILE, def, 'utf-8')
    return def
  }
}

// ── Nav ──
const ARTICLE_NAV = [
  { label: '全部文章', filter: '', icon: '📋' },
  { label: '⭐ 精选', filter: '__featured__', icon: '⭐' },
  { label: '生活碎碎念', filter: '生活碎碎念', icon: '🌿', path: '/life' },
  { label: '实用主义&关联主义', filter: '__merged__', icon: '🔗', path: '/pragmatism-connectivism', merge: ['实用主义研究','关联主义学习'] },
  { label: 'BRAND & AI', filter: 'BRAND ALL IN AI', icon: '🚀', path: '/brand-ai' },
]
const NAV = [
  ...ARTICLE_NAV,
  { label: '精选文章', filter: '', icon: '📚', path: '/archives', type: 'page' },
  { label: '晓宇友人账', filter: '', icon: '🤝', path: '/friends', type: 'friends' },
  { label: '关于XIAOYU', filter: '', icon: '✒️', path: '/about', type: 'about' },
]
function countNav(n) {
  if (n.type === 'friends') return loadFriends().length
  if (n.type === 'about') return 1
  const all = ls()
  if (n.filter === '__featured__') return all.filter(a => a.featured).length
  if (!n.filter) return all.length
  if (n.merge) return all.filter(a => n.merge.includes(a.category)).length
  return all.filter(a => a.category === n.filter).length
}

// ── Article APIs ──
app.get('/api/status', (_, r) => r.json({ ok: true, articles: ls().length }))
app.get('/api/articles', (_, r) => r.json(ls()))
app.get('/api/categories', (_, r) => r.json(cats()))
app.get('/api/tags', (_, r) => r.json(tgs()))
app.get('/api/nav', (_, r) => r.json(NAV.map(n => ({ ...n, count: countNav(n) }))))
app.get('/api/reading-time', (req, r) => r.json({ readTime: rtime(req.query.content || '') }))
app.get('/api/articles/:id', (req, r) => { const a = rd(req.params.id); a ? r.json(a) : r.status(404).json({ error: 'Not found' }) })

app.put('/api/articles/:id', (req, r) => {
  const { id: nid, title, date, category, excerpt, content, image, tags: t, readTime: rt, featured, carousel } = req.body || {}
  const sid = nid || req.params.id
  const autoRt = rt || rtime(content)
  const fm = matter.stringify(content || '', Object.assign(
    { id: sid, title: title || '', date: date || '', tags: t || [], readTime: autoRt, image: image || '', category: category || '', excerpt: excerpt || '' },
    featured ? { featured: true } : {},
    carousel ? { carousel: true } : {}
  ))
  fs.writeFileSync(path.join(POSTS_DIR, `${sid}.md`), fm, 'utf-8')
  if (sid !== req.params.id) { const o = path.join(POSTS_DIR, `${req.params.id}.md`); if (fs.existsSync(o)) fs.unlinkSync(o) }
  gen(); r.json({ ok: true, id: sid, readTime: autoRt })
})

app.delete('/api/articles/:id', (req, r) => {
  const fp = path.join(POSTS_DIR, `${req.params.id}.md`)
  if (!fs.existsSync(fp)) return r.status(404).json({ error: 'Not found' })
  fs.unlinkSync(fp); gen(); r.json({ ok: true })
})

// Custom Tags
app.post('/api/tags', (req, r) => {
  const { name } = req.body || {}
  if (!name || !name.trim()) return r.status(400).json({ error: 'Tag name required' })
  const c = loadCustomTags()
  if (!c.includes(name.trim())) { c.push(name.trim()); saveCustomTags(c) }
  r.json({ ok: true, tags: tgs() })
})
app.delete('/api/tags/:name', (req, r) => {
  if (ls().some(a => (a.tags || []).includes(req.params.name))) return r.status(400).json({ error: '该标签仍被文章使用，无法删除' })
  saveCustomTags(loadCustomTags().filter(t => t !== req.params.name))
  r.json({ ok: true, tags: tgs() })
})

// ── Friends API ──
app.get('/api/friends', (_, r) => r.json(loadFriends()))
app.put('/api/friends', (req, r) => {
  const data = req.body || []
  saveFriends(data)
  r.json({ ok: true, friends: data })
})
app.put('/api/friends/:id', (req, r) => {
  const f = loadFriends(); const idx = f.findIndex(x => x.id === parseInt(req.params.id))
  if (idx === -1) return r.status(404).json({ error: 'Not found' })
  f[idx] = { ...f[idx], ...req.body, id: f[idx].id }
  saveFriends(f); r.json({ ok: true, friend: f[idx] })
})
app.post('/api/friends', (req, r) => {
  const f = loadFriends()
  const nu = { id: Math.max(0, ...f.map(x => x.id)) + 1, name: '', title: '', description: '', url: '', avatar: '', ...req.body }
  f.push(nu); saveFriends(f)
  r.json({ ok: true, friend: nu, friends: f })
})
app.delete('/api/friends/:id', (req, r) => {
  const f = loadFriends().filter(x => x.id !== parseInt(req.params.id))
  saveFriends(f); r.json({ ok: true, friends: f })
})

// ── About API ──
app.get('/api/about', (_, r) => r.json({ content: loadAbout() }))
app.put('/api/about', (req, r) => {
  const { content } = req.body || {}
  if (content === undefined) return r.status(400).json({ error: 'content required' })
  fs.writeFileSync(ABOUT_FILE, content, 'utf-8')
  r.json({ ok: true })
})

// Images
const upload = multer({ dest: IMAGES_DIR })
const mdUpload = multer({ storage: multer.memoryStorage() })

// MD file upload → auto-parse frontmatter
app.post('/api/upload-md', mdUpload.single('md'), (req, r) => {
  if (!req.file) return r.status(400).json({ error: 'No file' })
  try {
    const { data, content } = matter(req.file.buffer.toString('utf-8'))
    const cats = [...new Set(ls().map(a => a.category).filter(Boolean))]
    r.json({
      title: data.title || '',
      date: data.date ? fmtDate(data.date) : new Date().toISOString().slice(0, 10),
      category: data.category && cats.includes(data.category) ? data.category : (cats[0] || '生活碎碎念'),
      tags: Array.isArray(data.tags) ? data.tags : [],
      image: data.image || '',
      excerpt: data.excerpt || '',
      content: content.trim(),
      readTime: data.readTime || rtime(content),
    })
  } catch (e) {
    // If not frontmatter format, treat whole file as content
    r.json({ content: req.file.buffer.toString('utf-8').trim() })
  }
})
app.post('/api/upload', upload.single('image'), (req, r) => {
  if (!req.file) return r.status(400).json({ error: 'No file' })
  const ext = path.extname(req.file.originalname) || '.jpg'
  const base = path.basename(req.file.originalname, ext) || `upload_${Date.now()}`
  let fn = base + ext, c = 1
  while (fs.existsSync(path.join(IMAGES_DIR, fn))) fn = `${base}_${++c}${ext}`
  fs.renameSync(req.file.path, path.join(IMAGES_DIR, fn))
  r.json({ url: `/images/${fn}`, filename: fn })
})
app.get('/api/images', (_, r) => {
  const files = fs.readdirSync(IMAGES_DIR).filter(f => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f))
  r.json(files.map(f => ({ filename: f, url: `/images/${f}` })))
})
app.delete('/api/images/:filename', (req, r) => {
  const fp = path.join(IMAGES_DIR, req.params.filename)
  if (fs.existsSync(fp)) { fs.unlinkSync(fp); return r.json({ ok: true }) }
  r.status(404).json({ error: 'Not found' })
})

// Sync — with proxy, builds + pushes main + deploys gh-pages
const PROXY_ENV = { ...process.env, http_proxy: 'http://127.0.0.1:7890', https_proxy: 'http://127.0.0.1:7890', HTTP_PROXY: 'http://127.0.0.1:7890', HTTPS_PROXY: 'http://127.0.0.1:7890' }
const gitRun = (cmd, opts) => { try { return execSync(cmd, { cwd: GIT_DIR, encoding: 'utf-8', timeout: 60000, env: PROXY_ENV, ...opts }).trim() } catch (e) { throw new Error(e.stderr || e.message) } }

app.post('/api/sync', async (req, r) => {
  const results = []
  try {
    // Step 1: push main
    const st = gitRun('git status --porcelain')
    if (st) {
      gitRun('git add -A')
      gitRun('git commit -m "文章管理更新"')
      gitRun('git push origin main')
      results.push('主线已推送(' + st.split('\n').length + '文件)')
    } else { results.push('无变更') }

    // Step 2: build blog
    try { execSync('npm run build', { cwd: ROOT, stdio: 'pipe', timeout: 120000 }); results.push('编译成功') }
    catch (e) { results.push('编译失败: ' + (e.stderr || e.message).slice(0, 80)); return r.json({ ok: true, message: results.join(' | ') }) }

    // Step 3: deploy gh-pages directly via git (reliable)
    try {
      const distDir = path.join(ROOT, 'dist')
      const tmpD = path.join(GIT_DIR, '.deploy-tmp')
      if (fs.existsSync(tmpD)) fs.rmSync(tmpD, { recursive: true, force: true })
      fs.mkdirSync(tmpD, { recursive: true })

      // Copy dist files
      for (const f of fs.readdirSync(distDir)) {
        const src = path.join(distDir, f), dst = path.join(tmpD, f)
        if (fs.statSync(src).isDirectory()) fs.cpSync(src, dst, { recursive: true })
        else fs.copyFileSync(src, dst)
      }
      // Copy CNAME
      const cnameSrc = path.join(GIT_DIR, 'CNAME')
      if (fs.existsSync(cnameSrc)) fs.copyFileSync(cnameSrc, path.join(tmpD, 'CNAME'))

      execSync('git init && git checkout -b gh-pages && git add -A && git commit -m "deploy"', { cwd: tmpD, timeout: 15000, env: PROXY_ENV })
      execSync('git push https://github.com/xiaoyu200126/xiaoyu-blog.git gh-pages --force', { cwd: tmpD, timeout: 30000, env: PROXY_ENV })
      fs.rmSync(tmpD, { recursive: true, force: true })
      results.push('Pages部署成功 ✅')
    } catch (e) {
      results.push('Pages部署失败: ' + (e.stderr || e.message).slice(0, 100))
    }
    r.json({ ok: true, message: results.join(' | '), pages: results.join(' | ') })
  } catch (e) { r.status(500).json({ error: '同步失败: ' + (e.stderr || e.message || e).toString().slice(0, 200) }) }
})

// Admin UI
const ADMIN_HTML = path.join(__dirname, 'admin.html')
app.get('/', (_, r) => r.type('html').send(fs.readFileSync(ADMIN_HTML, 'utf-8')))
app.get('/admin', (_, r) => r.type('html').send(fs.readFileSync(ADMIN_HTML, 'utf-8')))
app.use('/images', express.static(path.join(ROOT, 'public', 'images')))

const PORT = 3001
const srv = app.listen(PORT, '127.0.0.1', () => console.log(`落笔阁管理后台: http://localhost:${PORT}`))
srv.on('error', (e) => { console.error('启动失败:', e.message); process.exit(1) })
