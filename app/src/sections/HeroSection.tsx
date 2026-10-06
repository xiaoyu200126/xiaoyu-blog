import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Flickity from 'flickity'
import { getArticles } from '../data/articles'
import type { Article } from '../data/articles'
import { useIsMobile, useIsNarrow, useIsTablet } from '../hooks/use-mobile'
import 'flickity/css/flickity.css'

export default function HeroSection() {
  const isMobile = useIsMobile()
  const isNarrow = useIsNarrow()
  const isTablet = useIsTablet()
  const flktyRef = useRef<Flickity | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const touchRef = useRef({ startX: 0, startY: 0, dragging: false })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // 字体异步加载完成后需要让 Flickity 重新布局，这里存 resize 监听的清理函数
  const fontsReadyCleanup = useRef<(() => void) | null>(null)

  const featuredArticles = getArticles()
    .sort((a: Article, b: Article) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)

  const totalSlides = featuredArticles.length

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index)
  }, [])

  const nextSlide = useCallback(() => {
    if (totalSlides <= 1) return
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }, [totalSlides])

  const prevSlide = useCallback(() => {
    if (totalSlides <= 1) return
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }, [totalSlides])

  // ---- Desktop: Flickity ----
  useEffect(() => {
    if (isMobile) return
    if (!carouselRef.current || featuredArticles.length === 0) return

    const timer = setTimeout(() => {
      if (!carouselRef.current) return

      flktyRef.current = new Flickity(carouselRef.current, {
        cellAlign: 'left',
        contain: true,
        prevNextButtons: false,
        pageDots: false,
        autoPlay: 6000,
        pauseAutoPlayOnHover: true,
        wrapAround: featuredArticles.length > 1,
        adaptiveHeight: false,
        setGallerySize: true,
      })

      flktyRef.current.on('change', (index: number) => {
        setCurrentSlide(index)
      })

      setIsReady(true)

      // 字体是异步加载的（见 index.html 的 media="print" 方案）。
      // Flickity 在上面初始化时量的是回退字体的尺寸，字体换上后文字重排、
      // cell 变宽，若不通知它重新布局，被选中的 cell 会停在 translateX(100%)
      // —— 整个 Hero 滑出屏幕，页面上看起来就是一片空白。
      const relayout = () => flktyRef.current?.resize()
      document.fonts?.ready.then(relayout).catch(() => {})
      window.addEventListener('resize', relayout)
      fontsReadyCleanup.current = () => window.removeEventListener('resize', relayout)
    }, 100)

    return () => {
      clearTimeout(timer)
      fontsReadyCleanup.current?.()
      fontsReadyCleanup.current = null
      if (flktyRef.current) {
        flktyRef.current.destroy()
        flktyRef.current = null
      }
    }
  }, [featuredArticles.length, isMobile])

  // ---- Mobile: auto-advance + touch swipe ----
  useEffect(() => {
    if (!isMobile || totalSlides <= 1) return

    // 每 3s 自动切一张。
    // 触摸滑动结束时会重置这个计时器（见下方 touch handler），
    // 所以手动滑一下不会马上被自动播放切走。
    intervalRef.current = setInterval(() => {
      nextSlide()
    }, 3000)
    setIsReady(true)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isMobile, totalSlides, nextSlide])

  // Mobile touch handlers — use native addEventListener with { passive: false }
  const touchTrackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isMobile || !touchTrackRef.current) return
    const el = touchTrackRef.current

    const handleStart = (e: TouchEvent) => {
      touchRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, dragging: true }
    }
    const handleMove = (e: TouchEvent) => {
      if (!touchRef.current.dragging) return
      const dx = Math.abs(e.touches[0].clientX - touchRef.current.startX)
      const dy = Math.abs(e.touches[0].clientY - touchRef.current.startY)
      if (dx > dy && dx > 10) {
        e.preventDefault()
      }
    }
    const handleEnd = (e: TouchEvent) => {
      if (!touchRef.current.dragging) return
      touchRef.current.dragging = false
      const diff = e.changedTouches[0].clientX - touchRef.current.startX
      if (Math.abs(diff) < 40) return
      if (diff > 0) {
        prevSlide()
      } else {
        nextSlide()
      }
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = setInterval(() => nextSlide(), 3000)
    }

    el.addEventListener('touchstart', handleStart, { passive: true })
    el.addEventListener('touchmove', handleMove, { passive: false })
    el.addEventListener('touchend', handleEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', handleStart)
      el.removeEventListener('touchmove', handleMove)
      el.removeEventListener('touchend', handleEnd)
    }
  }, [isMobile, prevSlide, nextSlide])

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

  /* ---- MOBILE LAYOUT: card carousel with touch swipe ---- */
  if (isMobile) {
    return (
      <section
        className="hero-section"
        style={{ backgroundColor: 'var(--color-bg)', padding: '80px 0 0' }}
      >
        {/* 极淡的纵向渐层。整片纯色平铺会显得"贴"在屏幕上，
            从略暖到略浅的一点点过渡就能把内容带进纸的调子里。
            幅度刻意压得很低（bg-warm → bg），只求融入，不抢视觉。 */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, var(--color-bg-warm) 0%, var(--color-bg) 42%, var(--color-bg) 100%)',
            pointerEvents: 'none',
          }}
        />
        {/* 与桌面分支同一个视觉隐藏 h1，保证两种布局下标题层级一致 */}
        <h1
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          XIAOYU的随笔 —— 首页
        </h1>

        {/* 顶部渐隐：从 Header 下沿淡出，导航区与首屏之间有个柔和的过渡，
            不会出现一条生硬的横向分界 */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0, right: 0, top: 0,
            height: '96px',
            background:
              'linear-gradient(to bottom, var(--color-bg) 0%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
        <div
          ref={touchTrackRef}
          style={{ width: '100%', overflow: 'hidden', position: 'relative' }}
        >
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
                <div
                  style={{
                    // 原来这里有 backgroundColor(--color-bg-secondary)，
                    // 手机端凭空多出一层卡片底色，收尾时形成一条硬边，
                    // 和下方的 Loop 区看起来像被切成两段。
                    // 桌面本来就是「图 + 文」直接落在页面底色上，没有卡片底，
                    // 这里去掉后手机与桌面才是同一套构图语言。
                    overflow: 'hidden',
                    // 手机端去掉左右留白，图片直接顶到屏幕两边
                    margin: isNarrow ? '0' : '0 20px',
                  }}
                >
                  {/* Image —— 由 16:9 加高到 4:3。
                      图片是这一屏的主角，16:9 在手机上太扁，撑不起分量；
                      加高之后与下方文字块的比例也更协调。 */}
                  <div style={{
                    width: '100%',
                    paddingBottom: '75%',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    <img
                      src={article.image}
                      alt={article.title}
                      // 首屏大图是 LCP 元素：优先取、不要 lazy。
                      // 浏览器若先下载 JS 再发现图在哪，会白白推迟最大内容绘制。
                      fetchPriority="high"
                      decoding="async"
                      style={{
                        position: 'absolute', top: 0, left: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover',
                        // 与桌面一致：轻微降饱和，去掉数码味
                        filter: 'saturate(0.9)',
                      }}
                    />
                  </div>
                  {/* Text */}
                  <div style={{
                    // 顶部的 32px 把文字块整体下移，与加高后的图片拉开呼吸；
                    // 横向 20px 与图片的满出血形成错位是刻意的 —— 但底部收口
                    // 保持一致，避免上下两段的左右边界看着不对称。
                    padding: isNarrow ? '32px 20px 24px' : '18px 20px 22px',
                    // 原来固定 minHeight:210px。内容比它矮时，多余空间会全堆在
                    // 标签下面，分页圆点和 Scroll 就被顶得很远，看着像空了一截。
                    // 手机端交给内容自然撑开即可。
                    minHeight: isNarrow ? '0' : '210px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                    <span className="hero-label">
                      {/*
                        徽标原本是「四边描边的方块 + 横向内边距」，
                        框内文字必然比下方的日期、标题、摘要右移约 10-15px，
                        无论怎么调内边距都对不齐 —— 带边框 + 横向内边距这个
                        组合本身就不可能让文字和外面齐平。
                        改用「左侧竖线 + 无横向内边距」，文字与全卡左缘严丝合缝，
                        记号也还在；同时与文章正文 blockquote 的样式是同一套语言。
                      */}
                      XIAOYU THOUGHT &amp; NOTES
                    </span>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      // 同上：原 3.2vw 在 375px 下只有 12px
                      fontSize: 'clamp(15px, 3.2vw, 24px)',
                      fontStyle: 'italic', color: 'var(--color-accent)',
                      marginBottom: 'clamp(10px, 2.2vw, 20px)',
                      flexShrink: 0,
                    }}>
                      {formatDate(article.date)}
                    </div>
                    <h2 style={{
                      // 中英混排标题：整行交给 Noto Serif SC，避免 Playfair 发丝细
                      // 与宋体偏粗在同一行里出现重量接缝。Playfair 仍用于
                      // XIAOYU 标识与纯拉丁元素。
                      fontFamily: 'var(--font-display-mixed)',
                      fontSize: 'clamp(26px, 4.8vw, 40px)',
                      fontWeight: 600, lineHeight: 1.3,
                      color: 'var(--color-text)',
                      margin: '0 0 clamp(12px, 2.2vw, 20px)',
                      letterSpacing: '0.02em',
                      textWrap: 'balance',
                      flexShrink: 0,
                    }}>
                      <Link to={`/article/${article.id}`}
                        style={{ color: 'inherit', textDecoration: 'none' }}>
                        {article.title}
                      </Link>
                    </h2>
                    <p style={{
                      fontFamily: "'Crimson Pro', 'Noto Serif SC', serif",
                      // 原 3.6vw → 375px 下 13.5px，正文级文字必须给下限
                      fontSize: 'clamp(14px, 3.6vw, 18px)',
                      lineHeight: 1.7,
                      color: 'var(--color-text-secondary)',
                      margin: '0 0 clamp(16px, 3vw, 28px)',
                      fontWeight: 400,
                      display: '-webkit-box', WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      flexShrink: 0,
                    }}>
                      {article.excerpt}
                    </p>
                    <div className="hero-tags">
                      {article.tags.map((tag: string) => (
                        <Link key={tag} to={`/archives?tag=${encodeURIComponent(tag)}`} style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: 'clamp(12px, 2.6vw, 14px)',
                          letterSpacing: '0.1em', textTransform: 'uppercase',
                          color: 'var(--color-text-muted)',
                          // 触控目标不小于 44px 高
                          padding: '12px 14px',
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

        {/* Dots below carousel — 触控目标补到 44px 高 */}
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          gap: '4px',
          // 上下留白收到最小，44px 的触控高度已由每个圆点的 padding 提供
          padding: '0 0 4px',
        }}>
          {featuredArticles.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              aria-label={`第 ${i + 1} 张`}
              aria-current={i === currentSlide}
              style={{
                width: i === currentSlide ? '24px' : '8px',
                // 外层 padding 撑出 44px 的可点区域，视觉仍是细圆点
                padding: '19px 0',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{
                display: 'block',
                width: i === currentSlide ? '24px' : '8px',
                height: '6px',
                borderRadius: '3px',
                background: i === currentSlide ? 'var(--color-accent)' : 'var(--color-border)',
                transition: 'all 0.3s ease',
              }} />
            </button>
          ))}
        </div>

        {/* Scroll-down indicator —— 与桌面同一套 keyframes。
            之前只有桌面分支有（position:absolute 浮在轮播之上），
            手机分支整块是文档流布局，浮层会盖住分页圆点，所以放在圆点下方。

            图标由桌面那套「鼠标轮廓 + 内点」换成一支细的向下箭头：
            触屏上根本没有鼠标，鼠标轮廓反而在传递错误暗示。
            颜色压到 text-muted 的一半透明，整体更轻，不与内容抢视线。 */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '20px' }}>
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
              gap: '10px',
              fontFamily: 'var(--font-display)',
              fontSize: '10px',
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              opacity: 0.55,
              transition: 'opacity 0.3s ease, color 0.3s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.55' }}
          >
            <span>Scroll</span>
            <svg
              width="16"
              height="10"
              viewBox="0 0 16 10"
              fill="none"
              style={{ animation: 'hero-scroll-bounce 2.2s ease-in-out infinite' }}
            >
              <path
                d="M1 1.5 L8 8.5 L15 1.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </section>
    )
  }

  /* ---- DESKTOP LAYOUT: Flickity 1fr 1fr grid ---- */
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
      {/* 整页唯一的 h1。轮播里的文章标题已降级为 h2 ——
          之前一张轮播图一个 h1，首页会同时存在 3 个 h1，对屏幕阅读器和 SEO 都不对。
          这里用视觉隐藏，屏幕阅读器能读到，视觉不占位。 */}
      <h1
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        XIAOYU的随笔 —— 首页
      </h1>
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
              // 平板保留双栏杂志感，但文图比例从 1:1 放宽到 1.15:1，
              // 让标题那栏有更充裕的行宽，不必挤成三四行。
              gridTemplateColumns: isTablet ? '1.15fr 1fr' : '1fr 1fr',
              width: '100%',
              height: '100vh',
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
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '12px',
                  fontStyle: 'italic',
                  color: 'var(--color-accent)',
                  marginBottom: '14px',
                }}>
                  {formatDate(article.date)}
                </div>
                <h2 style={{
                  // 与上方轮播标题同款处理：文章标题中英混排，整行用 Noto Serif SC
                  fontFamily: 'var(--font-display-mixed)',
                  fontSize: 'clamp(28px, 4vw, 48px)',
                  fontWeight: 600,
                  lineHeight: 1.3,
                  color: 'var(--color-text)',
                  margin: '0 0 20px',
                  letterSpacing: '0.02em',
                  textWrap: 'balance',
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
                </h2>
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
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {article.tags.map((tag: string) => (
                    <Link
                      key={tag}
                      to={`/archives?tag=${encodeURIComponent(tag)}`}
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
              height: '100vh',
              padding: '0 clamp(32px, 6vw, 96px) 0 0',
            }}>
              <img
                src={article.image}
                alt={article.title}
                // 同上：这是整站的 LCP 元素
                fetchPriority="high"
                decoding="async"
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
          <button
            key={i}
            onClick={() => {
              goToSlide(i)
              if (flktyRef.current) flktyRef.current.select(i)
            }}
            style={{
              width: i === currentSlide ? '24px' : '6px',
              height: '6px',
              borderRadius: '3px',
              background: i === currentSlide ? 'var(--color-accent)' : 'var(--color-border)',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
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
        /* hero-scroll-bounce / hero-scroll-dot 的 keyframes 已移入 index.css，
           这里桌面与手机两套布局共用同一份定义。 */
        .main-carousel .flickity-viewport {
          height: 100vh !important;
        }
      `}</style>
    </section>
  )
}
