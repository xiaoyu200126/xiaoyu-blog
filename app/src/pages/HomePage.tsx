import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Link } from 'react-router-dom'

gsap.registerPlugin(ScrollTrigger)

/* ===== UTIL: Get current month in English ===== */
function getCurrentMonthYear(): { month: string; year: string } {
  const now = new Date()
  const months = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
  ]
  return {
    month: months[now.getMonth()],
    year: String(now.getFullYear()),
  }
}

/* ===== HERO SLIDES ===== */
const heroSlides = [
  {
    id: 1,
    author: 'XIAOYU',
    title: '实用主义者的效率工具清单',
    subtitle: '作为一名实用主义者，我一直在寻找能够真正提升效率的工具。这是一份经过长期使用筛选后的工具清单，每一款都是精挑细选。',
    tags: ['效率', '工具'],
    image: '/images/hero-tools.jpg',
  },
  {
    id: 2,
    author: 'XIAOYU',
    title: 'All IN AI \u2014 我的AI学习之路',
    subtitle: '从大语言模型到 AI Agent，从理论到落地。这条路走得不快，但每一步都留下了脚印。',
    tags: ['AI', '学习'],
    image: '/images/featured-1.jpg',
  },
  {
    id: 3,
    author: 'XIAOYU',
    title: '你好，世界',
    subtitle: '每一个博客的第一篇文章，都是一次郑重的自我介绍。这里会记录技术、工具，以及一些无关紧要的思考。',
    tags: ['随笔', '开篇'],
    image: '/images/featured-2.jpg',
  },
]

/* ===== ARTICLE CARDS (initial visible) ===== */
const initialArticles = [
  {
    id: 1,
    image: '/images/featured-1.jpg',
    date: '3 hours ago',
    author: 'XIAOYU',
    title: '车里那袋样品放了小半年，装的不是打样，是一段\u201c没来往了\u201d的关系',
    excerpt: '\u2014\u2014从\u201c我为人人，人人为我\u201d搬到了我的小王国。人不是慢慢看清一个人的，是在某一天，突然发现自己早就知道了答案。',
    tags: ['文章'],
    readTime: '12 min read',
  },
  {
    id: 2,
    image: '/images/polaroid-1.jpg',
    date: '1 day ago',
    author: 'XIAOYU',
    title: '凌晨和AI聊了一夜，聊的不是代码，是心安',
    excerpt: '缘起。人不是慢慢看清一件事的，是在某一个瞬间，突然发现自己早就知道答案了。',
    tags: ['随笔'],
    readTime: '14 min read',
  },
]

/* ===== MORE ARTICLES (hidden behind LOAD MORE) ===== */
const moreArticles = [
  {
    id: 3,
    image: '/images/polaroid-2.jpg',
    date: '3 days ago',
    author: 'XIAOYU',
    title: '雨后的城市倒影，像一场没做完的梦',
    excerpt: '霓虹灯在水面上碎成一片片色彩，人站在桥上发呆。城市的夜晚总是这样，让人想留下又急着离开。',
    tags: ['摄影', '城市'],
    readTime: '8 min read',
  },
  {
    id: 4,
    image: '/images/featured-2.jpg',
    date: '1 week ago',
    author: 'XIAOYU',
    title: '从 Notion 到 Obsidian，我的知识管理五年',
    excerpt: '五年间换了六款笔记工具，最终发现工具不重要，重要的是持续记录的习惯。',
    tags: ['效率', '工具'],
    readTime: '15 min read',
  },
]

/* ===== TAG SYSTEM ===== */
const allTags = ['效率', '工具', 'AI', '学习', '随笔', '摄影', '城市', '关联主义', 'BRAND']

/* ===== SIDE NAV ===== */
const sideNavItems = [
  { label: '生活碎碎念', path: '/life' },
  { label: '实用主义研究', path: '/pragmatism' },
  { label: 'BRAND ALL IN AI', path: '/brand-ai' },
  { label: '关联主义学习', path: '/archives' },
]

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showMore, setShowMore] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<HTMLDivElement[]>([])
  const moreCardRefs = useRef<HTMLDivElement[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const tagLineRef = useRef<HTMLDivElement>(null)

  const monthYear = getCurrentMonthYear()

  /* Auto-play carousel: 3s per slide */
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 3000)
  }, [])

  useEffect(() => {
    startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [startTimer])

  /* Slide content animation */
  useEffect(() => {
    if (!heroRef.current) return
    const els = heroRef.current.querySelectorAll('.slide-anim')
    gsap.fromTo(els,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out' }
    )
  }, [currentSlide])

  /* Entrance animation */
  useEffect(() => {
    if (!heroRef.current) return
    gsap.fromTo(
      heroRef.current.querySelectorAll('.hero-fixed'),
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.1 }
    )
    const firstEls = heroRef.current.querySelectorAll('.slide-anim')
    gsap.fromTo(firstEls,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.3 }
    )
  }, [])

  /* Card scroll animations */
  useEffect(() => {
    const cards = cardRefs.current.filter(Boolean)
    cards.forEach((card) => {
      gsap.fromTo(card,
        { y: 80, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 88%' },
        }
      )
    })
    return () => { ScrollTrigger.getAll().forEach((st) => st.kill()) }
  }, [])

  /* More cards animation when revealed */
  useEffect(() => {
    if (!showMore) return
    const cards = moreCardRefs.current.filter(Boolean)
    gsap.fromTo(cards,
      { y: 80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.1 }
    )
  }, [showMore])

  const slide = heroSlides[currentSlide]

  return (
    <div style={{ backgroundColor: '#fff' }}>
      {/* ============================================================ */}
      {/* HERO SECTION — 50/50 split                                */}
      {/* ============================================================ */}
      <section
        ref={heroRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          overflow: 'hidden',
          backgroundColor: '#fff',
        }}
      >
        {/* ===== LEFT PANEL ===== */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
          {/* Fixed Logo — XIAOYU + THOUGHT & NOTES */}
          <div
            className="hero-fixed"
            style={{
              position: 'absolute',
              top: '36px',
              left: '60px',
              zIndex: 10,
            }}
          >
            <div
              style={{
                fontFamily: "'Inter', -apple-system, 'PingFang SC', sans-serif",
                fontSize: 'clamp(1.3rem, 1.8vw, 1.6rem)',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#1a1a1a',
                lineHeight: 1,
              }}
            >
              XIAOYU
            </div>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 'clamp(0.6rem, 0.85vw, 0.72rem)',
                fontWeight: 400,
                letterSpacing: '0.2em',
                color: 'var(--color-muted)',
                marginTop: '6px',
                textTransform: 'uppercase',
              }}
            >
              THOUGHT &amp; NOTES
            </div>
          </div>

          {/* Vertical side nav — far left */}
          <div
            className="hero-fixed"
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%) rotate(180deg)',
              writingMode: 'vertical-rl',
              display: 'flex',
              alignItems: 'center',
              gap: '0',
              zIndex: 10,
            }}
          >
            {sideNavItems.map((item, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <Link
                  to={item.path}
                  className="cursor-hover"
                  style={{
                    fontFamily: "'Noto Sans SC', sans-serif",
                    fontSize: '0.7rem',
                    fontWeight: 400,
                    color: 'var(--color-muted)',
                    letterSpacing: '0.1em',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease',
                    padding: '6px 0',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#1a1a1a' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-muted)' }}
                >
                  {item.label}
                </Link>
                {i < sideNavItems.length - 1 && (
                  <span style={{ color: '#ddd', padding: '10px 0', fontSize: '0.6rem', display: 'inline-block' }}>|</span>
                )}
              </span>
            ))}
          </div>

          {/* Main content area */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              paddingLeft: 'clamp(80px, 10vw, 150px)',
              paddingRight: '60px',
              paddingTop: '100px',
            }}
          >
            {/* THE STORY tag with system time */}
            <div className="slide-anim" style={{ marginBottom: '28px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: '1px solid #c8c8c8',
                  padding: '10px 18px',
                  gap: '14px',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#a08060',
                  }}
                >
                  THE STORY OF THE MONTH
                </span>
                <span style={{ width: '1px', height: '20px', backgroundColor: '#c8c8c8' }} />
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.6rem',
                    fontWeight: 500,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: '#a08060',
                  }}
                >
                  {monthYear.month} {monthYear.year}
                </span>
              </div>
            </div>

            {/* by Author */}
            <div
              className="slide-anim"
              style={{
                fontFamily: "'Noto Sans SC', sans-serif",
                fontSize: '0.85rem',
                fontWeight: 400,
                color: 'var(--color-ink)',
                marginBottom: '20px',
              }}
            >
              by <span style={{ fontWeight: 600 }}>{slide.author}</span>
            </div>

            {/* Title */}
            <h1
              className="slide-anim font-serif"
              style={{
                fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)',
                fontWeight: 700,
                lineHeight: 1.2,
                color: 'var(--color-ink)',
                marginBottom: '24px',
                maxWidth: '480px',
              }}
            >
              {slide.title}
            </h1>

            {/* Subtitle */}
            <p
              className="slide-anim"
              style={{
                fontFamily: "'Noto Sans SC', sans-serif",
                fontSize: 'clamp(0.9rem, 1.2vw, 1.05rem)',
                fontWeight: 400,
                lineHeight: 1.8,
                color: 'var(--color-ink-light)',
                maxWidth: '400px',
                marginBottom: '32px',
              }}
            >
              {slide.subtitle}
            </p>

            {/* Tags */}
            <div
              ref={tagLineRef}
              className="slide-anim"
              style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'nowrap' }}
            >
              {slide.tags.map((tag, i) => (
                <Link
                  key={i}
                  to="#"
                  className="cursor-hover"
                  style={{
                    fontFamily: "'Noto Sans SC', sans-serif",
                    fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)',
                    fontWeight: 400,
                    color: 'var(--color-ink)',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-cmyk-red)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-ink)' }}
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ===== RIGHT PANEL — IMAGE ===== */}
        <div style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#f0f0f0' }}>
          <img
            src={slide.image}
            alt={slide.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {/* Horizontal dot indicator + counter */}
          <div
            className="hero-fixed"
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              zIndex: 10,
            }}
          >
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.85rem',
                fontWeight: 500,
                color: 'var(--color-ink)',
                letterSpacing: '0.1em',
              }}
            >
              {currentSlide + 1}&nbsp;&mdash;&nbsp;{heroSlides.length}
            </span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentSlide(i)
                    startTimer()
                  }}
                  className="cursor-hover"
                  style={{
                    width: i === currentSlide ? '8px' : '6px',
                    height: i === currentSlide ? '8px' : '6px',
                    borderRadius: '50%',
                    backgroundColor: i === currentSlide ? 'var(--color-ink)' : 'rgba(0,0,0,0.25)',
                    border: 'none',
                    padding: 0,
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* ARTICLE CARDS — staggered with smooth scroll animation      */}
      {/* ============================================================ */}
      <section style={{ backgroundColor: '#fff', padding: '100px 0 60px' }}>
        {[...initialArticles, ...(showMore ? moreArticles : [])].map((card, index) => (
          <div
            key={card.id}
            ref={(el) => {
              if (el) {
                if (index < initialArticles.length) {
                  cardRefs.current[index] = el
                } else {
                  moreCardRefs.current[index - initialArticles.length] = el
                }
              }
            }}
            style={{
              display: 'grid',
              gridTemplateColumns: index % 2 === 0 ? '1.2fr 1fr' : '1fr 1.2fr',
              maxWidth: '1200px',
              margin: '0 auto',
              marginBottom: '0',
              alignItems: 'stretch',
            }}
          >
            {/* Image */}
            <div
              style={{
                order: index % 2 === 0 ? 1 : 2,
                overflow: 'hidden',
              }}
            >
              <img
                src={card.image}
                alt={card.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: '400px' }}
              />
            </div>

            {/* Text */}
            <div
              style={{
                order: index % 2 === 0 ? 2 : 1,
                padding: 'clamp(40px, 5vw, 80px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              {/* Date & Author */}
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.8rem',
                  fontWeight: 400,
                  color: 'var(--color-muted)',
                  marginBottom: '16px',
                }}
              >
                {card.date} by <span style={{ fontWeight: 600 }}>{card.author}</span>
              </div>

              {/* Title */}
              <h2
                className="font-serif cursor-hover"
                style={{
                  fontSize: 'clamp(1.6rem, 2.8vw, 2.4rem)',
                  fontWeight: 700,
                  lineHeight: 1.3,
                  color: 'var(--color-ink)',
                  marginBottom: '16px',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-cmyk-red)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-ink)' }}
              >
                {card.title}
              </h2>

              {/* Excerpt */}
              <p
                style={{
                  fontFamily: "'Noto Sans SC', sans-serif",
                  fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)',
                  fontWeight: 400,
                  lineHeight: 1.8,
                  color: 'var(--color-ink-light)',
                  marginBottom: '28px',
                }}
              >
                {card.excerpt}
              </p>

              {/* Tags & read time */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                {card.tags.map((tag, i) => (
                  <span key={i}>
                    <Link
                      to="#"
                      className="cursor-hover"
                      style={{
                        fontFamily: "'Noto Sans SC', sans-serif",
                        fontSize: '0.8rem',
                        fontWeight: 400,
                        color: 'var(--color-ink)',
                        textDecoration: 'none',
                        transition: 'color 0.2s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-cmyk-red)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-ink)' }}
                    >
                      {tag}
                    </Link>
                    {i < card.tags.length - 1 && (
                      <span style={{ color: '#ddd', marginLeft: '10px' }}>·</span>
                    )}
                  </span>
                ))}
                <span style={{ color: '#ddd' }}>·</span>
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    letterSpacing: '0.05em',
                    color: 'var(--color-muted)',
                  }}
                >
                  {card.readTime}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* ===== LOAD MORE BUTTON ===== */}
        {!showMore && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '60px 0',
            }}
          >
            <button
              onClick={() => setShowMore(true)}
              className="cursor-hover"
              style={{
                border: '2px solid var(--color-ink)',
                backgroundColor: '#fff',
                padding: '20px 48px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                transition: 'background-color 0.3s ease, color 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-ink)'
                const spans = e.currentTarget.querySelectorAll('span')
                spans.forEach((s) => (s.style.color = '#fff'))
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fff'
                const spans = e.currentTarget.querySelectorAll('span')
                spans.forEach((s) => (s.style.color = 'var(--color-ink)'))
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  letterSpacing: '0.25em',
                  color: 'var(--color-ink)',
                  transition: 'color 0.3s ease',
                }}
              >
                LOAD
              </span>
              <span
                style={{
                  fontFamily: "'Noto Sans SC', sans-serif",
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  letterSpacing: '0.15em',
                  color: 'var(--color-ink)',
                  transition: 'color 0.3s ease',
                }}
              >
                查看更多
              </span>
            </button>
          </div>
        )}
      </section>

      {/* ===== TAG CLOUD SECTION ===== */}
      <section
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '40px 40px 60px',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          {allTags.map((tag, i) => (
            <span key={i}>
              <Link
                to="#"
                className="cursor-hover"
                style={{
                  fontFamily: "'Noto Sans SC', sans-serif",
                  fontSize: '0.8rem',
                  fontWeight: 400,
                  color: 'var(--color-muted)',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-ink)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-muted)' }}
              >
                {tag}
              </Link>
              {i < allTags.length - 1 && (
                <span style={{ color: '#ddd', marginLeft: '16px' }}>|</span>
              )}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}
