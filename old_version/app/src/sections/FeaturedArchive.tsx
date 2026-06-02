import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Link } from 'react-router-dom'
import { articles } from '../data/articles'

gsap.registerPlugin(ScrollTrigger)

// Take top 3 articles sorted by date descending
const featuredArticles = [...articles]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 3)
  .map((a, i) => ({
    id: a.id,
    number: String(i + 1).padStart(2, '0'),
    title: a.title,
    excerpt: a.excerpt,
    image: a.image,
    date: a.date,
    category: a.category,
  }))

export default function FeaturedArchive() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const triggers: ScrollTrigger[] = []

    itemRefs.current.forEach((item) => {
      if (!item) return

      const textCol = item.querySelector('.text-col')
      const imgCol = item.querySelector('.img-col')

      if (textCol) {
        const st = gsap.fromTo(
          textCol,
          { y: 80 },
          {
            y: -30,
            ease: 'none',
            scrollTrigger: {
              trigger: item,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          }
        )
        if (st.scrollTrigger) triggers.push(st.scrollTrigger)
      }

      if (imgCol) {
        const st = gsap.fromTo(
          imgCol,
          { y: -40 },
          {
            y: 30,
            ease: 'none',
            scrollTrigger: {
              trigger: item,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          }
        )
        if (st.scrollTrigger) triggers.push(st.scrollTrigger)
      }
    })

    return () => {
      triggers.forEach((st) => st.kill())
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        padding: 'clamp(80px, 12vw, 160px) 0',
        backgroundColor: 'var(--color-base)',
      }}
    >
      {/* Section label */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 40px',
          marginBottom: 'clamp(60px, 8vw, 100px)',
        }}
      >
        <span
          className="font-inter"
          style={{
            fontSize: '0.7rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--color-ink-light)',
          }}
        >
          Featured Archive
        </span>
        <h2
          className="font-serif"
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            fontWeight: 400,
            marginTop: '16px',
            letterSpacing: '0.05em',
            color: 'var(--color-ink)',
          }}
        >
          纵览：墨香长廊
        </h2>
      </div>

      {/* Articles */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
        {featuredArticles.map((article, index) => (
          <div
            key={article.id}
            ref={(el) => {
              if (el) itemRefs.current[index] = el
            }}
            style={{
              display: 'grid',
              gridTemplateColumns: index % 2 === 0 ? '1fr 1.2fr' : '1.2fr 1fr',
              gap: 'clamp(40px, 6vw, 80px)',
              alignItems: 'center',
              marginBottom: index < featuredArticles.length - 1 ? 'clamp(80px, 12vw, 140px)' : 0,
            }}
          >
            {/* Text column */}
            <div
              className="text-col"
              style={{
                order: index % 2 === 0 ? 1 : 2,
              }}
            >
              <span
                className="font-display"
                style={{
                  fontSize: 'clamp(4rem, 8vw, 7rem)',
                  fontWeight: 400,
                  lineHeight: 1,
                  color: 'var(--color-ink-light)',
                  opacity: 0.25,
                  display: 'block',
                  marginBottom: '20px',
                }}
              >
                {article.number}
              </span>
              <span
                className="font-inter"
                style={{
                  fontSize: '0.65rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--color-ink-light)',
                  display: 'block',
                  marginBottom: '12px',
                }}
              >
                {article.date} · {article.category}
              </span>
              <h3
                className="font-serif"
                style={{
                  fontSize: 'clamp(1.4rem, 2.5vw, 2rem)',
                  fontWeight: 700,
                  lineHeight: 1.4,
                  marginBottom: '20px',
                  color: 'var(--color-ink)',
                }}
              >
                {article.title}
              </h3>
              <p
                className="font-sans"
                style={{
                  fontSize: '0.9rem',
                  lineHeight: 1.8,
                  color: 'var(--color-ink-light)',
                  maxWidth: '420px',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  marginBottom: '28px',
                }}
              >
                {article.excerpt}
              </p>
              <Link
                to={`/article/${article.id}`}
                className="cursor-hover font-inter"
                style={{
                  fontSize: '0.75rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--color-ink)',
                  textDecoration: 'none',
                  borderBottom: '1px solid var(--color-ink)',
                  paddingBottom: '4px',
                  transition: 'color 0.3s ease, border-color 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-cmyk-red)'
                  e.currentTarget.style.borderColor = 'var(--color-cmyk-red)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-ink)'
                  e.currentTarget.style.borderColor = 'var(--color-ink)'
                }}
              >
                阅读全文
              </Link>
            </div>

            {/* Image column */}
            <div
              className="img-col"
              style={{
                order: index % 2 === 0 ? 2 : 1,
                overflow: 'hidden',
              }}
            >
              <Link to={`/article/${article.id}`}>
                <div
                  style={{
                    width: '100%',
                    paddingBottom: '65%',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={article.image}
                    alt={article.title}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: 'saturate(0.85)',
                    }}
                  />
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
