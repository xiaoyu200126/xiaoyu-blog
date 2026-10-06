/**
 * Generate src/data/articles.ts from content/posts/*.md
 * Run before `vite build` via `prebuild` npm script.
 *
 * Usage: npx tsx scripts/generate-articles.ts
 */
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const POSTS_DIR = path.resolve('content/posts')
const OUTPUT_FILE = path.resolve('src/data/articles.ts')

interface ArticleMeta {
  id: string
  title: string
  excerpt: string
  date: string
  author?: string
  tags: string[]
  readTime: string
  image: string
  category: string
  featured?: boolean
}

// Read all .md files
const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md')).sort()

if (files.length === 0) {
  console.error('No .md files found in content/posts/')
  process.exit(1)
}

const entries: { meta: ArticleMeta; body: string }[] = []

for (const file of files) {
  const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8')
  const { data, content } = matter(raw)

  const required = ['id', 'title', 'date', 'tags', 'image', 'category', 'excerpt', 'readTime']
  for (const field of required) {
    if (!(field in data)) {
      console.error(`Missing field "${field}" in ${file}`)
      process.exit(1)
    }
  }

  entries.push({
    meta: {
      id: data.id,
      title: data.title,
      excerpt: data.excerpt,
      date: data.date,
      author: data.author || 'XIAOYU',
      tags: data.tags,
      readTime: data.readTime,
      image: data.image,
      category: data.category,
      featured: !!data.featured,
    },
    body: content.trim(),
  })
}

console.log(`Found ${entries.length} articles in content/posts/`)

// Build articles array as JSON-like strings, then write entire file
// 注意：这里刻意不写生成时间戳。带上时间戳会让每次 build 都改动这个文件，
// 导致工作区被弄脏、git diff 里全是无意义噪音，也掩盖真正需要提交的变更。
let out = `// AUTO-GENERATED from content/posts/*.md — DO NOT EDIT MANUALLY
// 内容确定性生成：同样的 content/posts/*.md 必然产出完全相同的本文件

export interface Article {
  id: string
  title: string
  excerpt: string
  content: string
  date: string
  author: string
  tags: string[]
  readTime: string
  image: string
  category: string
  featured: boolean
}

export const articles: Article[] = [
`

for (let i = 0; i < entries.length; i++) {
  const a = entries[i]
  const comma = i < entries.length - 1 ? ',' : ''
  const tagsStr = JSON.stringify(a.meta.tags)

  // Use JSON.stringify for all string fields to safely handle quotes/backticks/backslashes
  out += `  {
    id: ${JSON.stringify(a.meta.id)},
    title: ${JSON.stringify(a.meta.title)},
    excerpt: ${JSON.stringify(a.meta.excerpt)},
    content: ${JSON.stringify(a.body)},
    date: ${JSON.stringify(a.meta.date)},
    author: ${JSON.stringify(a.meta.author)},
    tags: ${tagsStr},
    readTime: ${JSON.stringify(a.meta.readTime)},
    image: ${JSON.stringify(a.meta.image)},
    category: ${JSON.stringify(a.meta.category)},
    featured: ${!!a.meta.featured},
  }${comma}
`
}

out += `]

export function getArticleById(id: string): Article | undefined {
  return articles.find((a) => a.id === id)
}

export function getArticlesByCategory(category: string): Article[] {
  return articles.filter((a) => a.category === category)
}

export function getArticlesByTag(tag: string): Article[] {
  return articles.filter((a) => a.tags.includes(tag))
}

export function getArticles(): Article[] {
  return articles
}
`

fs.writeFileSync(OUTPUT_FILE, out, 'utf-8')
console.log(`Generated ${OUTPUT_FILE} (${entries.length} articles)`)
