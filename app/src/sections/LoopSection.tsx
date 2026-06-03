import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getArticles } from '../data/articles'
import type { Article } from '../data/articles'
import { useIsMobile } from '../hooks/use-mobile'

export default function LoopSection() {
  const isMobile = useIsMobile()
  const cardsRef = useRef<(HTMLElement | null)[]>([])
  const articles = getArticles()
    .sort((a: Article, b: Article) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return '今天'
    if (diffDays === 1) return '昨天'
    if (diffDays < 7) return `${diffDays} 天前`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} 周前`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} 个月前`
    return `${Math.floor(diffDays / 365)} 年前`
  }

  useEffect(() => {
    const refs = cardsRef.current.filter(Boolean) as HTMLElement[]
    if (refs.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('loop-card-visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    refs.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section className="loop-section" style={{
      backgroundColor: 'var(--color-bg)',
      padding: isMobile ? '0 0 60px' : '20px 0 100px',
    }}>
      {/* Section Header */}
      <div style={{
        maxWidth: '1400px', margin: '0 auto',
        padding: isMobile ? '0 20px' : '0 32px',
        marginBottom: isMobile ? '28px' : '60px',
      }}>
        <span className="badge-month" style={{ display: 'inline-block', marginBottom: '16px' }}>
          Loop
        </span>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: isMobile ? 'clamp(22px, 5vw, 28px)' : 'clamp(26px, 3.5vw, 38px)',
          fontWeight: 700, color: 'var(--color-text)', margin: 0,
          letterSpacing: '0.04em', lineHeight: 1.4,
        }}>
          最新文章
        </h2>
      </div>

      {/* Loop Cards Grid */}
      <div style={{
        maxWidth: '1400px', margin: '0 auto',
        padding: isMobile ? '0 20px' : '0 24px',
      }}>
        {articles.map((article: Article, index: number) => (
          <article
            key={article.id}
            ref={(el) => { cardsRef.current[index] = el }}
            className="loop-card"
            style={{
              opacity: 0,
              transform: 'translateY(60px)',
              transition: 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '0px',
              marginBottom: isMobile ? '40px' : '0px',
              alignItems: 'center',
            }}
          >
            {/* Image — on mobile always on top */}
            <div style={{
              order: isMobile ? -1 : (index % 2 === 0 ? 1 : 2),
              position: 'relative',
              overflow: 'hidden',
              aspectRatio: isMobile ? '16/9' : '4/3',
            }}>
              <Link to={`/article/${article.id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
                <img
                  src={article.image}
                  alt={article.title}
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    transition: 'transform 0.7s ease',
                    filter: 'saturate(0.9)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                />
              </Link>
            </div>

            {/* Content — on mobile below image */}
            <div style={{
              order: isMobile ? 0 : (index % 2 === 0 ? 2 : 1),
              padding: isMobile ? '20px 20px' : 'clamp(40px, 6vw, 64px) clamp(32px, 5vw, 56px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              backgroundColor: 'var(--color-bg)',
            }}>
              {/* Meta line */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                marginBottom: isMobile ? '16px' : '24px',
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: '11px',
                  letterSpacing: '0.22em', textTransform: 'uppercase',
                  color: 'var(--color-accent)', fontStyle: 'italic',
                }}>
                  by XIAOYU
                </span>
                <span style={{
                  width: '24px', height: '1px',
                  background: 'var(--color-border)',
                }} />
                <span style={{
                  fontFamily: 'var(--font-body)', fontSize: '12px',
                  color: 'var(--color-text-muted)',
                }}>
                  {formatRelativeTime(article.date)}
                </span>
              </div>

              {/* Title */}
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: isMobile ? 'clamp(18px, 4.5vw, 24px)' : 'clamp(22px, 3vw, 32px)',
                fontWeight: 700, lineHeight: 1.3,
                margin: '0 0 20px', letterSpacing: '0.05em',
              }}>
                <Link
                  to={`/article/${article.id}`}
                  style={{
                    color: 'var(--color-text)', textDecoration: 'none',
                    transition: 'color 0.3s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text)' }}
                >
                  {article.title}
                </Link>
              </h3>

              {/* Excerpt */}
              <p style={{
                fontFamily: "'Crimson Pro', 'Noto Serif SC', serif",
                fontSize: isMobile ? '14px' : '16px',
                lineHeight: isMobile ? 1.7 : 1.85,
                color: 'var(--color-text-secondary)',
                margin: '0 0 28px', fontWeight: 300,
              }}>
                {article.excerpt}
              </p>

              {/* Tags */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {article.tags.slice(0, 2).map((tag: string) => (
                  <Link
                    key={tag}
                    to={`/archives?tag=${encodeURIComponent(tag)}`}
                    style={{
                      fontFamily: 'var(--font-sans)', fontSize: '11px',
                      letterSpacing: '0.14em', textTransform: 'uppercase',
                      color: 'var(--color-text-muted)',
                      padding: '5px 12px',
                      border: '1px solid var(--color-border)',
                      transition: 'all 0.3s ease',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-accent)'
                      e.currentTarget.style.color = 'var(--color-accent)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border)'
                      e.currentTarget.style.color = 'var(--color-text-muted)'
                    }}
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      <style>{`
        .loop-card-visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </section>
  )
}
