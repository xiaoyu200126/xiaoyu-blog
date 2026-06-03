import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Flickity from 'flickity'
import { getArticles } from '../data/articles'
import type { Article } from '../data/articles'
import { useIsMobile } from '../hooks/use-mobile'
import 'flickity/css/flickity.css'

export default function HeroSection() {
  const isMobile = useIsMobile()
  const flktyRef = useRef<Flickity | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isReady, setIsReady] = useState(false)

  const featuredArticles = getArticles()
    .sort((a: Article, b: Article) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)

  useEffect(() => {
    if (!carouselRef.current || featuredArticles.length === 0 || isMobile) return

    const timer = setTimeout(() => {
      if (!carouselRef.current) return

      flktyRef.current = new Flickity(carouselRef.current, {
        cellAlign: 'left',
        contain: true,
        prevNextButtons: false,
        pageDots: false,
        autoPlay: isMobile ? 3000 : 6000,
        pauseAutoPlayOnHover: true,
        wrapAround: featuredArticles.length > 1,
        adaptiveHeight: false,
        setGallerySize: true,
      })

      flktyRef.current.on('change', (index: number) => {
        setCurrentSlide(index)
      })

      setIsReady(true)
    }, 100)

    return () => {
      clearTimeout(timer)
      if (flktyRef.current) {
        flktyRef.current.destroy()
        flktyRef.current = null
      }
    }
  }, [featuredArticles.length, isMobile])

  // Mobile-only: auto-advance via setInterval (no Flickity needed)
  useEffect(() => {
    if (!isMobile || featuredArticles.length <= 1) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredArticles.length)
    }, 3000)
    setIsReady(true)
    return () => clearInterval(interval)
  }, [isMobile, featuredArticles.length])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December']
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const handleScrollDown = () => {
    const nextSection = document.querySelector('.loop-section')
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Intercept wheel scroll on hero → smooth scroll to LoopSection (desktop only)
  useEffect(() => {
    if (isMobile) return
    const hero = document.querySelector<HTMLElement>('.hero-section')
    if (!hero) return
    let ticking = false
    const handler = (e: Event) => {
      const we = e as WheelEvent
      if (we.deltaY <= 0) return
      if (ticking) { e.preventDefault(); return }
      ticking = true
      e.preventDefault()
      const nextSection = document.querySelector<HTMLElement>('.loop-section')
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' })
      }
      setTimeout(() => { ticking = false }, 1200)
    }
    hero.addEventListener('wheel', handler, { passive: false })
    return () => hero.removeEventListener('wheel', handler)
  }, [isMobile])

  if (featuredArticles.length === 0) {
    return (
      <section style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'var(--color-bg)',
      }}>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)', fontSize: 'clamp(24px, 5vw, 48px)' }}>
          XIAOYU的随笔
        </h1>
      </section>
    )
  }

  /* ---- MOBILE LAYOUT: custom card carousel ---- */
  if (isMobile) {
    return (
      <section
        className="hero-section"
        style={{ backgroundColor: 'var(--color-bg)', padding: '90px 0 0' }}
      >
        {/* Carousel wrapper with overflow hidden + scroll snap */}
        <div style={{ width: '100%', overflow: 'hidden', position: 'relative' }}>
          <div
            ref={carouselRef}
            className="hero-mobile-track"
            style={{
              display: 'flex',
              transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              transform: `translateX(-${currentSlide * 100}%)`,
              opacity: isReady ? 1 : 0,
            }}
          >
            {featuredArticles.map((article: Article) => (
              <div key={article.id} style={{ width: '100%', flexShrink: 0 }}>
                {/* Card — consistent layout */}
                <div style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  overflow: 'hidden',
                  margin: '0 20px',
                }}>
                  {/* Image 16:9 — fix height */}
                  <div style={{
                    width: '100%',
                    paddingBottom: '56.25%',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    <img
                      src={article.image}
                      alt={article.title}
                      style={{
                        position: 'absolute', top: 0, left: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>

                  {/* Text — fixed min-height for consistency */}
                  <div style={{ padding: '22px 20px 30px', minHeight: '220px' }}>
                    <span style={{
                      display: 'inline-block',
                      fontFamily: 'var(--font-sans)', fontSize: '10px',
                      letterSpacing: '0.22em', textTransform: 'uppercase',
                      color: 'var(--color-text-muted)',
                      border: '1px solid var(--color-border)',
                      padding: '4px 10px', marginBottom: '12px',
                    }}>
                      XIAOYU THOUGHT &amp; NOTES
                    </span>
                    <div style={{
                      fontFamily: 'var(--font-display)', fontSize: '12px',
                      fontStyle: 'italic', color: 'var(--color-accent)',
                      marginBottom: '10px',
                    }}>
                      {formatDate(article.date)}
                    </div>
                    <h1 style={{
                      fontFamily: 'var(--font-display)', fontSize: '19px',
                      fontWeight: 700, lineHeight: 1.35,
                      color: 'var(--color-text)',
                      margin: '0 0 10px', letterSpacing: '0.04em',
                    }}>
                      <Link to={`/article/${article.id}`}
                        style={{ color: 'inherit', textDecoration: 'none' }}>
                        {article.title}
                      </Link>
                    </h1>
                    <p style={{
                      fontFamily: "'Crimson Pro', 'Noto Serif SC', serif",
                      fontSize: '13px', lineHeight: 1.65,
                      color: 'var(--color-text-secondary)',
                      margin: '0 0 14px', fontWeight: 300,
                      display: '-webkit-box', WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {article.excerpt}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {article.tags.map((tag: string) => (
                        <Link key={tag} to="/archives" style={{
                          fontFamily: 'var(--font-sans)', fontSize: '10px',
                          letterSpacing: '0.14em', textTransform: 'uppercase',
                          color: 'var(--color-text-muted)',
                          padding: '4px 10px',
                          border: '1px solid var(--color-border)',
                          textDecoration: 'none',
                        }}>
                          {tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots below carousel */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '8px',
          padding: '18px 0 20px',
        }}>
          {featuredArticles.map((_, i) => (
            <span key={i} style={{
              width: i === currentSlide ? '20px' : '6px', height: '6px',
              borderRadius: '3px',
              background: i === currentSlide ? 'var(--color-accent)' : 'var(--color-border)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>
      </section>
    )
  }

  /* ---- DESKTOP LAYOUT: 1fr 1fr grid ---- */
  return (
    <section
      className="hero-section"
      style={{
        height: '100vh',
        backgroundColor: 'var(--color-bg)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Carousel */}
      <div
        ref={carouselRef}
        className="main-carousel"
        style={{
          width: '100%',
          height: '100%',
          opacity: isReady ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}
      >
        {featuredArticles.map((article: Article) => (
          <div
            key={article.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              width: '100%',
              height: '100%',
            }}
          >
            {/* Left: Text */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '0 clamp(12px, 2vw, 32px) 0 clamp(24px, 4vw, 64px)',
            }}>
              <div style={{ maxWidth: 'clamp(320px, 42vw, 580px)' }}>
                {/* Badge */}
                <span style={{
                  display: 'inline-block',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '10px',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                  border: '1px solid var(--color-border)',
                  padding: '4px 10px',
                  marginBottom: '14px',
                }}>
                  XIAOYU THOUGHT &amp; NOTES
                </span>

                {/* Date */}
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '12px',
                  fontStyle: 'italic',
                  color: 'var(--color-accent)',
                  marginBottom: '14px',
                }}>
                  {formatDate(article.date)}
                </div>

                {/* Title */}
                <h1 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(28px, 4vw, 48px)',
                  fontWeight: 700,
                  lineHeight: 1.2,
                  color: 'var(--color-text)',
                  margin: '0 0 20px',
                  letterSpacing: '0.04em',
                }}>
                  <Link
                    to={`/article/${article.id}`}
                    style={{
                      color: 'inherit',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'inherit' }}
                  >
                    {article.title}
                  </Link>
                </h1>

                {/* Excerpt */}
                <p style={{
                  fontFamily: "'Crimson Pro', 'Noto Serif SC', serif",
                  fontSize: 'clamp(14px, 1.4vw, 16px)',
                  lineHeight: 1.8,
                  color: 'var(--color-text-secondary)',
                  margin: '0 0 32px',
                  fontWeight: 300,
                }}>
                  {article.excerpt}
                </p>

                {/* Tags */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {article.tags.map((tag: string) => (
                    <Link
                      key={tag}
                      to={`/archives`}
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '10px',
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: 'var(--color-text-muted)',
                        padding: '4px 10px',
                        border: '1px solid var(--color-border)',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
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
            </div>

            {/* Right: Image */}
            <div style={{
              position: 'relative',
              overflow: 'hidden',
              height: '100%',
              padding: '0 clamp(32px, 6vw, 96px) 24px 0',
            }}>
              <img
                src={article.image}
                alt={article.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'saturate(0.9)',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom gradient fade */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '140px',
        background: 'linear-gradient(to bottom, transparent 0%, var(--color-bg) 100%)',
        zIndex: 5,
        pointerEvents: 'none',
      }} />

      {/* Slide indicators */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        left: '0',
        right: '0',
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        zIndex: 20,
      }}>
        {featuredArticles.map((_, i) => (
          <span
            key={i}
            style={{
              width: i === currentSlide ? '24px' : '6px',
              height: '6px',
              borderRadius: '3px',
              background: i === currentSlide ? 'var(--color-accent)' : 'var(--color-border)',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* Scroll-down indicator */}
      <div style={{
        position: 'absolute',
        bottom: '32px',
        left: '0',
        right: '0',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 20,
      }}>
        <button
          onClick={handleScrollDown}
          aria-label="向下滚动"
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-sans)',
            fontSize: '10px',
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            transition: 'color 0.3s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)' }}
        >
          <span>Scroll</span>
          <svg
            width="14"
            height="20"
            viewBox="0 0 14 20"
            fill="none"
            style={{ animation: 'hero-scroll-bounce 2s ease-in-out infinite' }}
          >
            <rect x="1" y="1" width="12" height="18" rx="6" stroke="currentColor" strokeWidth="1.5" />
            <rect x="6" y="5" width="2" height="4" rx="1" fill="currentColor"
              style={{ animation: 'hero-scroll-dot 2s ease-in-out infinite' }} />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes hero-scroll-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }
        @keyframes hero-scroll-dot {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(3px); }
        }
        .main-carousel .flickity-viewport {
          height: 100% !important;
        }
      `}</style>
    </section>
  )
}
