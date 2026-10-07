import { useEffect, useRef } from 'react'
import { gsap } from '../lib/motion'
import { Link, useSearchParams } from 'react-router-dom'
import { getArticlesByCategory } from '../data/articles'
import PostList from '../components/PostList'

const brandPosts = getArticlesByCategory('BRAND ALL IN AI')

export default function BrandAIPage() {
  const contentRef = useRef<HTMLDivElement>(null)
  const [searchParams] = useSearchParams()
  const tagFilter = searchParams.get('tag')
  const posts = tagFilter ? brandPosts.filter(p => p.tags.includes(tagFilter)) : brandPosts

  useEffect(() => {
    const content = contentRef.current
    if (!content) return
    gsap.fromTo(content, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2 })
  }, [])

  return (
    <div style={{ minHeight: '100vh', paddingTop: '140px', paddingBottom: '80px', backgroundColor: 'var(--color-bg)' }}>
      <div ref={contentRef} style={{ maxWidth: '800px', margin: '0 auto', padding: '0 40px' }}>
        <span className="badge-month" style={{ display: 'block', marginBottom: '24px' }}>
          BRAND & ALL IN AI
        </span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 300, lineHeight: 1.3, marginBottom: tagFilter ? '16px' : '60px', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
          品牌与 AI 实践
        </h1>
        {tagFilter && (
          <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>筛选：{tagFilter}</span>
            <Link to="/brand-ai" style={{ fontSize: '12px', color: 'var(--color-accent)', textDecoration: 'underline' }}>清除</Link>
          </div>
        )}
        <PostList posts={posts} />
      </div>
    </div>
  )
}
