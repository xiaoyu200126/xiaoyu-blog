import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Link } from 'react-router-dom'
import { articles } from '../data/articles'

export default function ArchivesPage() {
  const contentRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const content = contentRef.current
    if (!content) return

    gsap.fromTo(
      content,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2 }
    )

    const items = itemRefs.current.filter(Boolean)
    if (items.length > 0) {
      gsap.fromTo(
        items,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out', delay: 0.4 }
      )
    }
  }, [])

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingTop: '140px',
        paddingBottom: '80px',
        backgroundColor: '#fff',
      }}
    >
      <div
        ref={contentRef}
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 40px',
        }}
      >
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.7rem',
            fontWeight: 500,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--color-muted)',
            display: 'block',
            marginBottom: '24px',
          }}
        >
          Archives
        </span>

        <h1
          className="font-serif"
          style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
            fontWeight: 700,
            lineHeight: 1.3,
            marginBottom: '60px',
            color: 'var(--color-ink)',
            letterSpacing: '0.02em',
          }}
        >
          文章卷宗
        </h1>

        <div>
          {articles.map((article, i) => (
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
              }}
            >
              <div style={{ flex: 1 }}>
                <Link
                  to={`/article/${article.id}`}
                  className="cursor-hover font-serif"
                  style={{
                    fontSize: 'clamp(1.1rem, 1.8vw, 1.35rem)',
                    fontWeight: 700,
                    lineHeight: 1.5,
                    color: 'var(--color-ink)',
                    textDecoration: 'none',
                    display: 'block',
                    marginBottom: '8px',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-cmyk-red)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-ink)' }}
                >
                  {article.title}
                </Link>
                <span
                  style={{
                    fontFamily: "'Noto Sans SC', sans-serif",
                    fontSize: '0.75rem',
                    fontWeight: 400,
                    color: 'var(--color-muted)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {article.category}
                </span>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.75rem',
                    fontWeight: 400,
                    color: 'var(--color-muted)',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  {article.date}
                </span>
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.7rem',
                    fontWeight: 400,
                    color: 'var(--color-muted)',
                  }}
                >
                  {article.readTime}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
