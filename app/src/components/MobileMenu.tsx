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
  { label: '实用主义&关联主义', path: '/pragmatism-connectivism' },
  { label: 'BRAND & AI', path: '/brand-ai' },
  { label: '精选文章', path: '/archives' },
  { label: '晓宇友人账', path: '/friends' },
  { label: '关于XIAOYU', path: '/about' },
]

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const linksRef = useRef<HTMLAnchorElement[]>([])
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    if (!overlayRef.current) return

    const tl = gsap.timeline({ paused: true })
    tl.to(overlayRef.current, {
      opacity: 1,
      visibility: 'visible',
      duration: 0.4,
      ease: 'power2.inOut',
    })
    tl.fromTo(
      linksRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out' },
      '-=0.2'
    )
    tlRef.current = tl

    return () => {
      tl.kill()
    }
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

  const handleLinkClick = () => {
    onClose()
  }

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'var(--color-text)',
        zIndex: 200,
        opacity: 0,
        visibility: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '32px',
      }}
    >
      <button
        onClick={onClose}
        aria-label="关闭菜单"
        style={{
          position: 'absolute',
          top: '28px',
          right: '20px',
          background: 'none',
          border: 'none',
          color: 'var(--color-bg)',
          fontSize: '14px',
          fontFamily: 'var(--font-sans)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          padding: '8px 12px',
        }}
      >
        Close
      </button>

      {menuLinks.map((link, i) => (
        <Link
          key={link.path}
          to={link.path}
          ref={(el) => {
            if (el) linksRef.current[i] = el
          }}
          onClick={handleLinkClick}
          style={{
            color: 'var(--color-bg)',
            fontSize: 'clamp(1.5rem, 4vw, 2.8rem)',
            fontWeight: 300,
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.08em',
            textDecoration: 'none',
            opacity: 0,
          }}
        >
          {link.label}
        </Link>
      ))}
    </div>
  )
}
