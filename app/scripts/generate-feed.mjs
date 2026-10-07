/**
 * 生成 RSS 2.0 订阅源 → public/feed.xml
 *
 * 页脚的「订阅 RSS」入口指向这个文件，prebuild 自动执行。
 * 数据源是 content/posts/*.md 编译出的 articles 数据，与页面渲染同源。
 */
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const POSTS_DIR = path.resolve('content/posts')
const OUT_FILE = path.resolve('public/feed.xml')
const SITE_URL = 'https://xiaoyu-blog.cn'
const AUTHOR = 'XIAOYU'

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

// Markdown → 极简 HTML：够 RSS 阅读器显示正文，不追求完整渲染
function mdToHtml(md) {
  return md
    .split(/\n{2,}/)
    .map((block) => {
      const t = block.trim()
      if (!t) return ''
      const heading = t.match(/^(#{1,6})\s/)
      if (heading) {
        const level = Math.min(heading[1].length, 6)
        return `<h${level}>${inline(t.replace(/^#+\s*/, ''))}</h${level}>`
      }
      if (/^>\s?/.test(t)) {
        return `<blockquote>${inline(t.replace(/^>\s?/gm, ''))}</blockquote>`
      }
      if (/^[-*]\s/m.test(t)) {
        const items = t
          .split(/\n/)
          .filter((l) => /^[-*]\s/.test(l))
          .map((l) => `<li>${inline(l.replace(/^[-*]\s*/, ''))}</li>`)
          .join('')
        return `<ul>${items}</ul>`
      }
      if (/^---+$/.test(t)) return '<hr />'
      return `<p>${inline(t)}</p>`
    })
    .join('\n')
    .trim()
}

// 行内标记：**粗** *斜* `代码` [文字](链接)
function inline(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
}

const files = fs
  .readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith('.md'))
  .sort()

const posts = files
  .map((file) => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8')
    const { data, content } = matter(raw)
    return {
      id: data.id,
      title: data.title,
      excerpt: data.excerpt,
      date: String(data.date),
      tags: Array.isArray(data.tags) ? data.tags : [],
      body: content.trim(),
    }
  })
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

if (posts.length === 0) {
  console.error('没有找到任何文章，跳过 feed 生成')
  process.exit(1)
}

const rfc822 = (iso) => new Date(iso).toUTCString()

const items = posts
  .map(
    (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE_URL}/article/${encodeURIComponent(p.id)}</link>
      <guid isPermaLink="true">${SITE_URL}/article/${encodeURIComponent(p.id)}</guid>
      <pubDate>${rfc822(p.date)}</pubDate>
      <author>${esc(AUTHOR)}</author>
      <description>${esc(p.excerpt)}</description>
      <content:encoded><![CDATA[${mdToHtml(p.body)}]]></content:encoded>
${p.tags.map((t) => `      <category>${esc(t)}</category>`).join('\n')}
    </item>`,
  )
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${esc(AUTHOR)}的随笔</title>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>一间生活，旅拍摄影。${esc(AUTHOR)}的随笔记录发生过的事、遇见过的人、去过的地方。</description>
    <language>zh-cn</language>
    <lastBuildDate>${rfc822(posts[0].date)}</lastBuildDate>
    <generator>落笔阁 build</generator>
${items}
  </channel>
</rss>
`

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })
fs.writeFileSync(OUT_FILE, xml, 'utf-8')
console.log(`已生成 public/feed.xml（${posts.length} 篇文章）`)

// 同时产出 sitemap.xml 与 robots.txt（此前两者都缺失，搜索引擎只能爬链接猜结构）
const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/archives', priority: '0.9', changefreq: 'weekly' },
  { path: '/about', priority: '0.6', changefreq: 'monthly' },
  { path: '/life', priority: '0.8', changefreq: 'weekly' },
  { path: '/brand-ai', priority: '0.8', changefreq: 'weekly' },
  { path: '/pragmatism-connectivism', priority: '0.7', changefreq: 'monthly' },
  { path: '/friends', priority: '0.5', changefreq: 'monthly' },
]

const lastmod = posts[0].date.slice(0, 10)
const urlEntries = [
  ...STATIC_ROUTES.map(
    (r) => `  <url>
    <loc>${SITE_URL}${r.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
  ),
  ...posts.map(
    (p) => `  <url>
    <loc>${SITE_URL}/article/${encodeURIComponent(p.id)}</loc>
    <lastmod>${String(p.date).slice(0, 10)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`,
  ),
].join('\n')

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`
fs.writeFileSync(path.resolve('public/sitemap.xml'), sitemap, 'utf-8')

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`
fs.writeFileSync(path.resolve('public/robots.txt'), robots, 'utf-8')

console.log(
  `已生成 public/sitemap.xml（${STATIC_ROUTES.length + posts.length} 条 URL）与 public/robots.txt`,
)
