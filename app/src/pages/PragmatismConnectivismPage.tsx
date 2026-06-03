import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Link, useSearchParams } from 'react-router-dom'
import { getArticlesByCategory } from '../data/articles'

const allPosts = [
  ...getArticlesByCategory('实用主义研究'),
  ...getArticlesByCategory('关联主义学习'),
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

export default function PragmatismConnectivismPage() {
  const contentRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<HTMLDivElement[]>([])
  const [searchParams] = useSearchParams()
  const tagFilter = searchParams.get('tag')
  const posts = tagFilter ? allPosts.filter(p => p.tags.includes(tagFilter)) : allPosts

  useEffect(() => {
    const content = contentRef.current
    if (!content) return
    gsap.fromTo(content, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2 })
    const items = itemRefs.current.filter(Boolean)
    if (items.length > 0) {
      gsap.fromTo(items, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.5 })
    }
  }, [])

  return (
    <div style={{ minHeight: '100vh', paddingTop: '140px', paddingBottom: '80px', backgroundColor: 'var(--color-bg)' }}>
      <div ref={contentRef} style={{ maxWidth: '800px', margin: '0 auto', padding: '0 40px' }}>
        <span className="badge-month" style={{ display: 'block', marginBottom: '24px' }}>
          Pragmatism &amp; Connectivism
        </span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 300, lineHeight: 1.3, marginBottom: tagFilter ? '16px' : '60px', color: 'var(--color-text)', letterSpacing: '0.04em' }}>
          实用主义&关联主义
        </h1>
        {tagFilter && (
          <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>筛选：{tagFilter}</span>
            <Link to="/pragmatism-connectivism" style={{ fontSize: '12px', color: 'var(--color-accent)', textDecoration: 'underline' }}>清除</Link>
          </div>
        )}
        <div>
          {posts.length === 0 && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '60px 0' }}>
              暂无文章，敬请期待...
            </p>
          )}
          {posts.map((post, i) => (
            <div key={post.id} ref={(el) => { if (el) itemRefs.current[i] = el }} style={{ borderBottom: '1px solid var(--color-border)', padding: '32px 0' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 400, color: 'var(--color-text-muted)', letterSpacing: '0.1em', display: 'block', marginBottom: '12px' }}>
                {post.date} · {post.category}
              </span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 2vw, 24px)', fontWeight: 400, lineHeight: 1.4, marginBottom: '12px', color: 'var(--color-text)', transition: 'color 0.3s ease' }}>
                <Link to={`/article/${post.id}`} style={{ color: 'inherit', textDecoration: 'none' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent)' }} onMouseLeave={(e) => { e.currentTarget.style.color = 'inherit' }}>
                  {post.title}
                </Link>
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 400, lineHeight: 1.8, color: 'var(--color-text-secondary)' }}>
                {post.excerpt}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
