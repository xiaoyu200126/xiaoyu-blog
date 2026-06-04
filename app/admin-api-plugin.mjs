// Vite ESM plugin: admin API embedded in Vite dev server
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import matter from 'gray-matter'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '.')
const POSTS_DIR = path.join(ROOT, 'content', 'posts')
const IMAGES_DIR = path.join(ROOT, 'public', 'images')
const GIT_DIR = path.resolve(ROOT, '..')

const r = (a) => readArticleFile(a)
const s = JSON.stringify

function readArticleFile(id) {
  const fp = path.join(POSTS_DIR, `${id}.md`)
  if (!fs.existsSync(fp)) return null
  const { data, content } = matter.read(fp)
  return {
    id: data.id || id, title: data.title || '', date: data.date || '',
    category: data.category || '', excerpt: data.excerpt || '', content: content.trim(),
    image: data.image || '', tags: Array.isArray(data.tags) ? data.tags : [], readTime: data.readTime || '',
  }
}
function list() {
  return fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'))
    .map(f => r(f.replace('.md', ''))).filter(Boolean)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
function tags() { return [...new Set(list().flatMap(a => a.tags || []))].sort() }
function gen() { try { execSync('npx tsx scripts/generate-articles.ts', { cwd: ROOT, stdio: 'pipe', timeout: 15000 }) } catch {} }

// Simple multipart file parser (no multer dependency needed)
function parseMultipart(req, cb) {
  const chunks = []
  req.on('data', c => chunks.push(c))
  req.on('end', () => {
    const buf = Buffer.concat(chunks)
    const ct = req.headers['content-type'] || ''
    const bm = ct.match(/boundary=(.+)/)
    if (!bm) return cb(new Error('No boundary'))
    const boundary = '--' + bm[1]
    const parts = buf.toString().split(boundary).slice(1, -1)
    for (const part of parts) {
      const headerEnd = part.indexOf('\r\n\r\n')
      if (headerEnd === -1) continue
      const headers = part.slice(0, headerEnd).toString()
      const body = part.slice(headerEnd + 4, part.length - 2)
      const fnMatch = headers.match(/filename="(.+?)"/)
      if (fnMatch) {
        const filename = fnMatch[1]
        const ext = path.extname(filename) || '.jpg'
        const base = path.basename(filename, ext) || `upload_${Date.now()}`
        let fn = base + ext, c = 1
        while (fs.existsSync(path.join(IMAGES_DIR, fn))) fn = `${base}_${++c}${ext}`
        const dest = path.join(IMAGES_DIR, fn)
        fs.writeFileSync(dest, body)
        return cb(null, { url: `/images/${fn}`, filename: fn })
      }
    }
    cb(new Error('No file found'))
  })
}

export default function adminPlugin() {
  return {
    name: 'vite-admin-api',
    configureServer(server) {
      // JSON body parser + router (connect strips '/api' prefix from req.url)
      server.middlewares.use('/api', (req, res, next) => {
        const u = req.url.split('?')[0]  // after prefix strip: '/articles', '/ping', '/upload', etc.
        const m = req.method
        let jsonBody = null
        const getBody = (cb) => {
          if (jsonBody !== null) return cb(jsonBody)
          if (!['POST', 'PUT'].includes(m)) return cb({})
          let body = ''
          req.on('data', c => body += c)
          req.on('end', () => { try { jsonBody = JSON.parse(body) } catch { jsonBody = {} }; cb(jsonBody) })
        }

        try {
          if (m === 'GET' && u === '/ping') { res.setHeader('Content-Type', 'application/json'); return res.end(s({ ok: true })) }
          if (m === 'GET' && u === '/articles') { res.setHeader('Content-Type', 'application/json'); return res.end(s(list())) }
          if (m === 'GET' && u === '/tags') { res.setHeader('Content-Type', 'application/json'); return res.end(s(tags())) }

          const single = u.match(/^\/articles\/([^/]+)$/)
          if (m === 'GET' && single) {
            const a = r(single[1])
            if (!a) { res.statusCode = 404; return res.end('{"error":"Not found"}') }
            res.setHeader('Content-Type', 'application/json')
            return res.end(s(a))
          }
          if (m === 'PUT' && single) {
            return getBody(b => {
              const id = single[1]
              const { id: newId, title, date, category, excerpt, content, image, tags: tgs, readTime } = b || {}
              const saveId = newId || id
              const fm = matter.stringify(content || '', {
                id: saveId, title: title || '', date: date || '', tags: tgs || [],
                readTime: readTime || '', image: image || '', category: category || '', excerpt: excerpt || '',
              })
              fs.writeFileSync(path.join(POSTS_DIR, `${saveId}.md`), fm, 'utf-8')
              if (saveId !== id) { const old = path.join(POSTS_DIR, `${id}.md`); if (fs.existsSync(old)) fs.unlinkSync(old) }
              gen()
              res.setHeader('Content-Type', 'application/json')
              res.end(s({ ok: true, id: saveId }))
            })
          }
          if (m === 'DELETE' && single) {
            const fp = path.join(POSTS_DIR, `${single[1]}.md`)
            if (!fs.existsSync(fp)) { res.statusCode = 404; return res.end('{"error":"Not found"}') }
            fs.unlinkSync(fp); gen()
            res.setHeader('Content-Type', 'application/json')
            return res.end(s({ ok: true }))
          }

          // POST /upload
          if (m === 'POST' && u === '/upload') {
            return parseMultipart(req, (err, result) => {
              if (err) { res.statusCode = 400; return res.end(s({ error: err.message })) }
              res.setHeader('Content-Type', 'application/json')
              res.end(s(result))
            })
          }

          // GET /images
          if (m === 'GET' && u === '/images') {
            const files = fs.readdirSync(IMAGES_DIR).filter(f => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f))
            res.setHeader('Content-Type', 'application/json')
            return res.end(s(files.map(f => ({ filename: f, url: `/images/${f}` }))))
          }

          // DELETE /images/:filename
          const imgMatch = u.match(/^\/images\/(.+)$/)
          if (m === 'DELETE' && imgMatch) {
            const fp = path.join(IMAGES_DIR, imgMatch[1])
            if (fs.existsSync(fp)) { fs.unlinkSync(fp); return res.end(s({ ok: true })) }
            res.statusCode = 404; return res.end('{"error":"Not found"}')
          }

          // POST /sync
          if (m === 'POST' && u === '/sync') {
            const git = (cmd) => execSync(cmd, { cwd: GIT_DIR, encoding: 'utf-8', timeout: 30000 }).trim()
            const status = git('git status --porcelain')
            if (!status) return res.end(s({ ok: true, message: '没有变更' }))
            git('git add -A'); git('git commit -m "文章管理更新"'); git('git push origin main --quiet')
            res.setHeader('Content-Type', 'application/json')
            res.end(s({ ok: true, message: `已提交 ${status.split('\n').length} 个文件` }))
            try { execSync('npm run build', { cwd: ROOT, stdio: 'pipe', timeout: 120000 }); execSync('python deploy2.py', { cwd: GIT_DIR, stdio: 'pipe', timeout: 60000 }) }
            catch { }
            return
          }

        } catch (e) {
          console.error('API error:', e)
          res.statusCode = 500; res.setHeader('Content-Type', 'application/json')
          return res.end(s({ error: e.message }))
        }

        next()
      })
    }
  }
}
