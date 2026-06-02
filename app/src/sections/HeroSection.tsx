import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const WORDS = ['ink', 'scroll', 'page', 'verse', 'prose', 'line', 'draft', 'text', 'write', 'read', 'calm', 'deep']

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<HTMLDivElement[]>([])
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    const container = containerRef.current
    const title = titleRef.current
    const grid = gridRef.current
    if (!container || !title || !grid) return

    // Insert word spans into grid items
    itemsRef.current.forEach((el, i) => {
      if (!el) return
      gsap.set(el, { opacity: 0 })
      const word = WORDS[i % WORDS.length]
      el.innerHTML = `<span data-text="${word}">${word}</span>`
    })

    // Build animation timeline
    const tl = gsap.timeline()

    // 1. Title clip-path reveal
    tl.fromTo(
      title,
      { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', duration: 1.5, ease: 'power3.inOut' }
    )

    // 2. Grid background fade in + add animate class
    tl.to(
      grid,
      {
        duration: 1,
        opacity: 1,
        onStart: () => grid.classList.add('animate'),
      },
      0.5
    )

    // 3. Grid items stagger in
    tl.to(
      itemsRef.current,
      {
        opacity: 1,
        duration: 0.05,
        stagger: { each: 0.04, from: 'random' },
        ease: 'none',
      },
      0.5
    )

    tlRef.current = tl

    // Mouse tracking for light source
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const px = ((e.clientX - rect.left) / rect.width) * 100
      const py = ((e.clientY - rect.top) / rect.height) * 100

      title.style.setProperty('--px', `${px}%`)
      title.style.setProperty('--py', `${py}%`)
      grid.style.setProperty('--px', `${px}%`)
      grid.style.setProperty('--py', `${py}%`)
    }

    container.addEventListener('mousemove', handleMouseMove)

    return () => {
      tl.kill()
      container.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <section
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: 'var(--color-base)',
      }}
    >
      {/* Background word grid */}
      <div
        ref={gridRef}
        className="grid--bg"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(10, 1fr)',
          gridTemplateRows: 'repeat(12, 1fr)',
          pointerEvents: 'none',
          opacity: 0,
        }}
      >
        {Array.from({ length: 120 }).map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) itemsRef.current[i] = el
            }}
            className="grid__item"
            style={{
              position: 'relative',
              fontFamily: 'var(--font-inter)',
              fontSize: '0.85rem',
              fontWeight: 400,
              textTransform: 'uppercase',
              color: 'transparent',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              letterSpacing: '0.05em',
            }}
          />
        ))}
      </div>

      {/* Main title */}
      <div style={{ position: 'relative', zIndex: 20, textAlign: 'center' }}>
        <h1
          ref={titleRef}
          className="title"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(4rem, 15vw, 15vw)',
            fontWeight: 400,
            lineHeight: 0.9,
            textTransform: 'uppercase',
            color: 'transparent',
            backgroundImage: 'radial-gradient(circle at var(--px, 50%) var(--py, 50%), #fff 0%, rgba(0,0,0,0.85) 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            position: 'relative',
            margin: 0,
            letterSpacing: '0.05em',
          }}
        >
          XIAOYU的随笔
        </h1>
        <p
          className="font-display"
          style={{
            fontSize: 'clamp(0.8rem, 1.5vw, 1.2rem)',
            fontWeight: 400,
            fontStyle: 'italic',
            letterSpacing: '0.3em',
            color: 'var(--color-ink-light)',
            marginTop: '1.5rem',
            opacity: 0.7,
          }}
        >
          LUOBI PRESS
        </p>
      </div>

      {/* Bottom nav */}
      <nav
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '40px',
          zIndex: 20,
          mixBlendMode: 'difference',
        }}
      >
        {['文章卷宗', '灵感拾遗', '著者名录'].map((item) => (
          <a
            key={item}
            href="#"
            className="cursor-hover font-sans"
            style={{
              color: 'var(--color-paper-white)',
              fontSize: '0.75rem',
              letterSpacing: '0.2em',
              textDecoration: 'none',
              transition: 'letter-spacing 0.3s ease, color 0.3s ease',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget
              el.style.letterSpacing = '0.35em'
              el.style.color = 'var(--color-cmyk-red)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget
              el.style.letterSpacing = '0.2em'
              el.style.color = 'var(--color-paper-white)'
            }}
          >
            {item}
          </a>
        ))}
      </nav>
    </section>
  )
}
