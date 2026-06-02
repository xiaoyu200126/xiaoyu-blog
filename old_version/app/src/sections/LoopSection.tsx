import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Flickity from 'flickity'
import { getArticles } from '../data/articles'
import type { Article } from '../data/articles'
import { useIsMobile } from '../hooks/use-mobile'
import 'flickity/css/flickity.css'

export default function LoopSection() {
  const isMobile = useIsMobile()
  const cardsRef = useRef<(HTMLElement | null)[]>([])
  const flktyRef = useRef<Flickity | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
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

  // Mobile carousel: init Flickity
  useEffect(() => {
    if (!isMobile || !carouselRef.current || articles.length === 0) return

    const timer = setTimeout(() => {
      if (!carouselRef.current) return
      flktyRef.current = new Flickity(carouselRef.current, {
        cellAlign: 'center',
        contain: true,
        prevNextButtons: false,
        pageDots: true,
        autoPlay: 5000,
        pauseAutoPlayOnHover: false,
        wrapAround: articles.length > 1,
        adaptiveHeight: false,
        setGallerySize: true,
      })
    }, 100)

    return () => {
      clearTimeout(timer)
      if (flktyRef.current) {
        flktyRef.current.destroy()
        flktyRef.current = null
      }
    }
  }, [isMobile, articles.length])

  // Responsive values
  const sectionPad = isMobile ? '0 0 60px' : '20px 0 100px'
  const headerPad = isMobile ? '0 24px' : '0 32px'
  const headerMb = isMobile ? '28px' : '60px'
  const titleFs = isMobile ? 'clamp(22px, 5vw, 28px)' : 'clamp(26px, 3.5vw, 38px)'
  const gridPad = isMobile ? '0 16px' : '0 24px'
  const cardGrid = isMobile ? '1fr' : '1fr 1fr'
  const cardMb = isMobile ? '40px' : '0px'
  const articleFs = isMobile ? 'clamp(22px, 5vw, 26px)' : 'clamp(22px, 3vw, 32px)'
  const contentPad = isMobile ? '24px' : 'clamp(40px, 6vw, 64px) clamp(32px, 5vw, 56px)'

  const carouselArticles = articles.slice(0, 3)

  return (
    <section className="loop-section" style={{
      backgroundColor: 'var(--color-bg)',
      padding: sectionPad,
    }}>
      {/* ===== MOBILE CAROUSEL — aligned with header bottom, same width as article cards ===== */}
      {isMobile && carouselArticles.length > 0 && (
        <div style={{ maxWidth: '1400px', margin: '0 auto', paddingTop: '90px' }}>
          <div
            ref={carouselRef}
            className="loop-carousel"
            style={{ padding: '0 16px', marginBottom: '0' }}
          >
            {carouselArticles.map((article: Article) => (
              <div key={article.id} style={{ width: '100%', marginRight: '12px', boxSizing: 'border-box', height: '100%' }}>
                <div style={{ backgroundColor: 'var(--color-bg-secondary)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ width: '100%', paddingBottom: '56.25%', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={article.image} alt={article.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.9)' }} />
                  </div>
                  <div style={{ padding: '20px 20px 36px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                    <span style={{ display: 'inline-block', fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', padding: '4px 10px', marginBottom: '14px' }}>
                      XIAOYU THOUGHT &amp; NOTES
                    </span>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontStyle: 'italic', color: 'var(--color-accent)', marginBottom: '14px' }}>
                      {formatRelativeTime(article.date)}
                    </div>
                    <Link to={`/article/${article.id}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, lineHeight: 1.35, color: 'var(--color-text)', margin: '0 0 12px', letterSpacing: '0.04em' }}>
                        {article.title}
                      </h3>
                    </Link>
                    <p style={{ fontFamily: "'Crimson Pro', 'Noto Serif SC', serif", fontSize: '13px', lineHeight: 1.7, color: 'var(--color-text-secondary)', margin: '0 0 16px', fontWeight: 300, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {article.excerpt}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {article.tags.slice(0, 2).map((tag: string) => (
                        <span key={tag} style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-text-muted)', padding: '4px 10px', border: '1px solid var(--color-border)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section Header */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: headerPad, marginBottom: headerMb }}>
        <span className="badge-month" style={{ display: 'inline-block', marginBottom: '16px' }}>
          Loop
        </span>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: titleFs,
          fontWeight: 700, color: 'var(--color-text)', margin: 0,
          letterSpacing: '0.04em', lineHeight: 1.4,
        }}>
          最新文章
        </h2>
      </div>

      {/* Loop Cards Grid */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: gridPad }}>
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
              gridTemplateColumns: cardGrid,
              gap: '0px', marginBottom: cardMb, alignItems: 'center',
            }}
          >
            {/* Image */}
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

            {/* Content */}
            <div style={{
              order: isMobile ? 0 : (index % 2 === 0 ? 2 : 1),
              padding: contentPad,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              backgroundColor: 'var(--color-bg)',
            }}>
              {/* Meta line */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                marginBottom: '24px',
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
                fontSize: articleFs,
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
                fontSize: '16px', lineHeight: 1.85,
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
                    to={`/archives`}
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
        .loop-carousel .flickity-viewport {
          padding-bottom: 0 !important;
          min-height: 520px;
        }
        .loop-carousel .flickity-cell {
          height: 100%;
        }
        .loop-carousel .flickity-slider {
          height: 100%;
        }
        .loop-carousel .flickity-page-dots {
          bottom: 6px;
          left: 0;
          right: 0;
        }
        .loop-carousel .flickity-page-dots .dot {
          width: 6px;
          height: 6px;
          margin: 0 4px;
          background: var(--color-border);
          opacity: 1;
        }
        .loop-carousel .flickity-page-dots .dot.is-selected {
          background: var(--color-accent);
          opacity: 1;
        }
      `}</style>
    </section>
  )
}
