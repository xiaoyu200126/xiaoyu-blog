import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Link } from 'react-router-dom'
import { getArticlesByCategory } from '../data/articles'

const lifePosts = getArticlesByCategory('生活碎碎念')

export default function LifePage() {
  const contentRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<HTMLDivElement[]>([])

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
    <div style={{ minHeight: '100vh', paddingTop: '140px', paddingBottom: '80px', backgroundColor: '#fff' }}>
      <div ref={contentRef} style={{ maxWidth: '800px', margin: '0 auto', padding: '0 40px' }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-muted)', display: 'block', marginBottom: '24px' }}>
          Life Musings
        </span>

        <h1 className="font-serif" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 700, lineHeight: 1.3, marginBottom: '60px', color: 'var(--color-ink)', letterSpacing: '0.02em' }}>
          生活碎碎念
        </h1>

        <div>
          {lifePosts.length === 0 && (
            <p style={{ fontFamily: "'Noto Sans SC', sans-serif", fontSize: '0.95rem', color: 'var(--color-muted)', textAlign: 'center', padding: '60px 0' }}>
              暂无文章，敬请期待...
            </p>
          )}
          {lifePosts.map((post, i) => (
            <div key={post.id} ref={(el) => { if (el) itemRefs.current[i] = el }} style={{ borderBottom: '1px solid var(--color-border)', padding: '32px 0' }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-muted)', letterSpacing: '0.1em', display: 'block', marginBottom: '12px' }}>
                {post.date}
              </span>
              <h2 className="font-serif cursor-hover" style={{ fontSize: 'clamp(1.15rem, 2vw, 1.4rem)', fontWeight: 700, lineHeight: 1.4, marginBottom: '12px', color: 'var(--color-ink)', transition: 'color 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-cmyk-red)' }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-ink)' }}>
                <Link to={`/article/${post.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {post.title}
                </Link>
              </h2>
              <p style={{ fontFamily: "'Noto Sans SC', sans-serif", fontSize: '0.9rem', fontWeight: 400, lineHeight: 1.8, color: 'var(--color-ink-light)' }}>
                {post.excerpt}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
