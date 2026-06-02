import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

const menuLinks = [
  { label: '首页', path: '/' },
  { label: '生活碎碎念', path: '/life' },
  { label: '实用主义 & 关联主义', path: '/pragmatism' },
  { label: 'BRAND & ALL IN AI', path: '/brand-ai' },
  { label: '关于晓宇', path: '/about' },
  { label: '晓宇的朋友们', path: '/friends' },
]

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const linksRef = useRef<HTMLAnchorElement[]>([])
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    if (!overlayRef.current || !panelRef.current) return

    const tl = gsap.timeline({ paused: true })

    tl.to(overlayRef.current, {
      opacity: 1,
      visibility: 'visible',
      duration: 0.3,
      ease: 'power2.out',
    }, 0)

    tl.fromTo(
      panelRef.current,
      { x: '100%' },
      { x: '0%', duration: 0.4, ease: 'power3.out' },
      0
    )

    tl.fromTo(
      linksRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power3.out' },
      0.2
    )

    tlRef.current = tl

    return () => { tl.kill() }
  }, [])

  useEffect(() => {
    if (isOpen) {
      tlRef.current?.play()
      document.body.style.overflow = 'hidden'
    } else {
      tlRef.current?.reverse()
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 200,
        opacity: 0,
        visibility: 'hidden',
      }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        ref={panelRef}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 'min(420px, 90vw)',
          height: '100vh',
          backgroundColor: '#fff',
          padding: '100px 48px 48px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
          transform: 'translateX(100%)',
        }}
      >
        <nav style={{ display: 'flex', flexDirection: 'column' }}>
          {menuLinks.map((link, i) => (
            <Link
              key={link.path}
              to={link.path}
              ref={(el) => { if (el) linksRef.current[i] = el }}
              onClick={onClose}
              className="cursor-hover"
              style={{
                fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif",
                color: 'var(--color-ink)',
                fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
                fontWeight: 500,
                letterSpacing: '0.02em',
                textDecoration: 'none',
                opacity: 0,
                padding: '20px 0',
                borderBottom: '1px solid var(--color-border)',
                transition: 'color 0.2s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-cmyk-red)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-ink)' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
