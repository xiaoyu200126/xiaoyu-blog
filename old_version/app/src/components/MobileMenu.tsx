import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

const menuLinks = [
  { label: '首页', path: '/' },
  { label: '文章卷宗', path: '/archives' },
  { label: '著者名录', path: '/about' },
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
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out' },
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
        backgroundColor: 'var(--color-dark)',
        zIndex: 200,
        opacity: 0,
        visibility: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '40px',
      }}
    >
      <button
        onClick={onClose}
        className="cursor-hover"
        aria-label="关闭菜单"
        style={{
          position: 'absolute',
          top: '24px',
          right: '40px',
          background: 'none',
          border: 'none',
          color: 'var(--color-paper-white)',
          fontSize: '1.5rem',
          fontFamily: 'var(--font-inter)',
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
          className="cursor-hover font-serif"
          style={{
            color: 'var(--color-paper-white)',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 400,
            letterSpacing: '0.1em',
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
