import { useEffect, useRef, useMemo } from 'react'
import { gsap } from 'gsap'
import { Link, useSearchParams } from 'react-router-dom'
import { articles, getArticlesByTag, type Article } from '../data/articles'

export default function ArchivesPage() {
  const contentRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<HTMLDivElement[]>([])
  const [searchParams] = useSearchParams()
  const activeTag = searchParams.get('tag')

  const { featured, regular } = useMemo(() => {
    let filtered: Article[]
    if (activeTag) {
      filtered = getArticlesByTag(activeTag)
    } else {
      filtered = [...articles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }
    const featured = filtered.filter(a => a.featured)
    const regular = filtered.filter(a => !a.featured)
    return { featured, regular }
  }, [activeTag])

  useEffect(() => {
    const content = contentRef.current
    if (!content) return
    gsap.fromTo(content, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2 })
    const items = itemRefs.current.filter(Boolean)
    if (items.length > 0) {
      gsap.fromTo(items, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out', delay: 0.4 })
    }
  }, [featured, regular])

  const renderItem = (article: Article, i: number, isFeatured: boolean) => (
    <div
      key={article.id}
      ref={(el) => { if (el) itemRefs.current[i] = el }}
      style={{
        borderBottom: '1px solid var(--color-border)',
        padding: '28px 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '20px',
        ...(isFeatured ? { background: 'rgba(233,69,96,0.03)', margin: '0 -20px', padding: '28px 20px' } : {}),
      }}
    >
      <div style={{ flex: 1 }}>
        <Link
          to={`/article/${article.id}`}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(18px, 2vw, 24px)',
            fontWeight: 400,
            lineHeight: 1.5,
            color: 'var(--color-text)',
            textDecoration: 'none',
            display: 'block',
            marginBottom: '8px',
            transition: 'color 0.3s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text)' }}
        >
          {isFeatured && <span style={{ color: '#f0c040', marginRight: '6px' }}>★ </span>}
          {article.title}
        </Link>
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          fontWeight: 400,
          color: 'var(--color-text-muted)',
          letterSpacing: '0.04em',
        }}>
          {article.category}
        </span>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '12px',
          fontWeight: 400,
          color: 'var(--color-text-muted)',
          display: 'block',
          marginBottom: '4px',
        }}>
          {article.date}
        </span>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '11px',
          fontWeight: 400,
          color: 'var(--color-text-muted)',
        }}>
          {article.readTime}
        </span>
      </div>
    </div>
  )

  const totalItems = featured.length + regular.length

  return (
    <div style={{ minHeight: '100vh', paddingTop: '140px', paddingBottom: '80px', backgroundColor: 'var(--color-bg)' }}>
      <div ref={contentRef} style={{ maxWidth: '800px', margin: '0 auto', padding: '0 40px' }}>
        <span className="badge-month" style={{ display: 'block', marginBottom: '24px' }}>Archives</span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 300, lineHeight: 1.3, marginBottom: activeTag ? '12px' : '60px', color: 'var(--color-text)', letterSpacing: '0.04em' }}>
          {activeTag ? `标签：${activeTag}` : '精选文章'}
        </h1>
        {activeTag && (
          <div style={{ marginBottom: '48px' }}>
            <Link to="/archives" style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent)', textDecoration: 'none', transition: 'color 0.3s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-accent)' }}
            >← 查看全部文章</Link>
          </div>
        )}
        <div>
          {totalItems === 0 && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '60px 0' }}>暂无相关文章</p>
          )}
          {featured.map((a, i) => renderItem(a, i, true))}
          {featured.length > 0 && regular.length > 0 && (
            <div style={{ padding: '16px 0', textAlign: 'center' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '11px', color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>全部文章</span>
            </div>
          )}
          {regular.map((a, i) => renderItem(a, featured.length + i, false))}
        </div>
      </div>
    </div>
  )
}
